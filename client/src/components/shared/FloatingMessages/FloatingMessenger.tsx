'use client';

import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, Paperclip, ArrowUp, Check, CheckCheck } from 'lucide-react';
import {
    useGetMessagesQuery,
    useNewMessageMutation,
} from '@/redux/features/message/messageApi';
import ApiError from '../ApiError';
import { formatDistanceToNow } from 'date-fns';
import { IMessage } from '@/types/message.interface';
import { Input } from '@/components/ui/input';
import { ISanitizedUser } from '@/types/user.interface';
import {
    useGetConversationQuery,
    useMarkAsReadMutation,
} from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { socket } from '@/lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useLazyDownloadFileQuery,
    usePresignUploadMutation,
} from '@/redux/features/upload/uploadApi';
import { Label } from '@/components/ui/label';

type FloatingMessengerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: ISanitizedUser;
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
};

export default function FloatingMessenger({
    open,
    onOpenChange,
    user,
    setUnreadCount,
}: FloatingMessengerProps) {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [scrollMode, setScrollMode] = useState<'append' | 'prepend' | null>(
        null
    );
    const [initialLoad, setInitialLoad] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // --- NEW: scroll bookkeeping refs
    const wasAtBottomRef = useRef<boolean>(true);
    const prevScrollHeightRef = useRef<number>(0);
    const prevScrollTopRef = useRef<number>(0);

    // const inputFocusSpring = useSpring(0);

    const [newMessage, { isLoading: isNewMessageSending }] =
        useNewMessageMutation();
    const [markAsRead] = useMarkAsReadMutation();
    const [presignUpload] = usePresignUploadMutation();

    const { data: messagesData, isLoading: isMessagesLoading } =
        useGetMessagesQuery(
            {
                userID: user?.userID,
                conversationID: user?.conversationID,
                rawLimit: 25,
                cursor: cursor ?? '',
            },
            { skip: !user?.userID }
        );

    const { data: conversationData } = useGetConversationQuery(
        user?.conversationID,
        { skip: !user?.conversationID }
    );

    const conversation: IConversation = useMemo(
        () => conversationData?.conversation ?? ({} as IConversation),
        [conversationData]
    );

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'admin'
    );

    // Helpers
    const isNearBottom = (el: HTMLDivElement, threshold = 80) =>
        el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

    const scrollToBottom = (smooth = false) => {
        const el = scrollViewportRef.current;
        if (!el) return;
        el.scrollTo({
            top: el.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto',
        });
    };

    // ✅ Messages from API (dedupe)
    useEffect(() => {
        if (messagesData?.data?.messages) {
            setMessages((prev) => {
                const combined = cursor
                    ? [...messagesData.data.messages, ...prev]
                    : messagesData.data.messages;
                const map = new Map<string, IMessage>();
                combined.forEach((m: IMessage) => {
                    if (m?._id) map.set(m._id, m);
                });
                return Array.from(map.values());
            });
        }
    }, [messagesData, cursor]);

    // ✅ Initial scroll when first batch arrives OR when sheet opens
    useLayoutEffect(() => {
        if (!initialLoad || !messages.length) return;
        scrollToBottom(false);
        wasAtBottomRef.current = true;
        setInitialLoad(false);
    }, [initialLoad, messages.length]);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
                scrollToBottom(false);
                wasAtBottomRef.current = true;
            });
        }
    }, [open]);

    // ✅ Track near-bottom on every user scroll
    const handleViewportScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        wasAtBottomRef.current = isNearBottom(el);
        if (el.scrollTop === 0 && !isMessagesLoading) {
            handleLoadMore(); // will record heights inside
        }
    };

    useEffect(() => {
        let typingTimeout: NodeJS.Timeout | undefined = undefined;

        if (text.length > 0) {
            setIsTyping(true);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => setIsTyping(false), 1000);
        } else {
            setIsTyping(false);
        }

        return () => {
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [text]);

    // ✅ Smooth/precise scroll adjustments AFTER messages change
    useLayoutEffect(() => {
        const el = scrollViewportRef.current;
        if (!el || !messages.length) return;

        if (scrollMode === 'prepend') {
            // Keep the viewport anchored around the same visible message
            const prevHeight = prevScrollHeightRef.current || 0;
            const prevTop = prevScrollTopRef.current || 0;
            const delta = el.scrollHeight - prevHeight;
            el.scrollTop = prevTop + delta;
            setScrollMode(null);
            return;
        }

        // Append case (new messages at bottom)
        if (scrollMode === 'append') {
            if (wasAtBottomRef.current) {
                scrollToBottom(true);
            }
            setScrollMode(null);
            return;
        }

        // Non-explicit mode: if we just added messages and the user was at bottom, stick to bottom
        if (wasAtBottomRef.current) {
            scrollToBottom(false);
        }
    }, [messages, scrollMode]);

    // ✅ Unread from server snapshot whenever conversation changes
    useEffect(() => {
        if (!conversation) return;
        const mine = conversation.participants?.find(
            (p) => p.userID === user?.userID
        );
        setUnreadCount(mine?.unreadCount ?? 0);
    }, [conversation, user, setUnreadCount]);

    // ✅ Mark all as read when opening or when new message arrives while open
    const markCurrentAsRead = async (lastMessageID?: string) => {
        if (!conversation?._id || !user?.userID) return;
        try {
            await markAsRead({
                conversationID: conversation._id,
                userID: user.userID,
                lastMessageID,
            }).unwrap();
            setUnreadCount(0);
        } catch (e) {
            ApiError(e);
        }
    };

    useEffect(() => {
        if (open && messages.length > 0) {
            markCurrentAsRead(messages[messages.length - 1]?._id);
        }
    }, [open, messages]);

    // ✅ Socket handling
    useEffect(() => {
        if (!conversation._id || !user?.userID) return;
        if (!socket.connected) socket.connect();

        const handleNewMessage = (data: {
            message: IMessage;
            userID: string;
        }) => {
            const msg = data.message;
            if (!msg || msg.conversationID !== conversation._id) return;

            // if the user is near bottom before appending, remember it
            const el = scrollViewportRef.current;
            if (el) wasAtBottomRef.current = isNearBottom(el);

            setMessages((prev) => {
                const map = new Map(prev.map((m) => [m._id, m]));
                map.set(msg._id, msg);
                return Array.from(map.values());
            });
            setScrollMode('append');

            const isMine = msg.authorID === user.userID;
            if (isMine) {
                setShowTypingIndicator(true);
                setTimeout(() => setShowTypingIndicator(false), 400);
            }

            if (!isMine) {
                if (open) {
                    markCurrentAsRead(msg._id);
                } else {
                    setUnreadCount((prev) => prev + 1);
                }
            }
        };

        socket.emit('join-conversation', {
            conversationID: conversation._id,
            userID: user.userID,
        });

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('leave-conversation', {
                conversationID: conversation._id,
                userID: user.userID,
            });
        };
    }, [conversation._id, user?.userID, open, setUnreadCount]);

    // ✅ Send message
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        const messageText = text;
        setText('');

        try {
            const res = await newMessage({
                conversationID: conversation._id,
                text: messageText,
                senderID: user?.userID,
            }).unwrap();

            if (res?.success) {
                // Ensure we stick to bottom after our own send
                wasAtBottomRef.current = true;
                requestAnimationFrame(() => inputRef.current?.focus());
            }
        } catch (error) {
            setText(messageText);
            ApiError(error);
        }
    };

    // ✅ File upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            alert('Max file size is 50MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const res = await presignUpload({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                conversationID: conversation._id,
                senderID: user.userID,
            }).unwrap();

            const { url, publicUrl, key } = res.upload;

            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            await newMessage({
                conversationID: conversation._id,
                senderID: user.userID,
                attachment: {
                    url: publicUrl,
                    key,
                    name: file.name,
                    size: file.size,
                    contentType: file.type,
                },
            }).unwrap();

            // After sending attachment, keep to bottom
            wasAtBottomRef.current = true;
        } catch (err) {
            ApiError(err);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const [downloadFile] = useLazyDownloadFileQuery();

    const handleDownload = async (key: string, fileName: string) => {
        try {
            const res = await downloadFile(key).unwrap();
            if (res.success && res.url) {
                const link = document.createElement('a');
                link.href = res.url;
                link.download = fileName;
                link.target = 'blank';
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (err) {
            ApiError(err);
        }
    };

    const handleLoadMore = () => {
        if (!messages.length) return;
        const el = scrollViewportRef.current;
        if (el) {
            // record current heights to restore position after prepend
            prevScrollHeightRef.current = el.scrollHeight;
            prevScrollTopRef.current = el.scrollTop;
        }
        setCursor(messages[0]._id);
        setScrollMode('prepend');
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden !gap-0 border-l-2 border-orange-100"
            >
                {/* Header */}
                <SheetHeader className="px-4 py-4 border-b bg-white/80 backdrop-blur-sm shadow-sm shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <p className="text-lg font-semibold">Support</p>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate text-gray-900">
                                {conversationUser?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {conversationUser?.isOnline ? (
                                    <span className="text-emerald-600 font-medium">
                                        Online
                                    </span>
                                ) : (
                                    conversationUser?.lastSeenAt &&
                                    formatDistanceToNow(
                                        new Date(conversationUser.lastSeenAt),
                                        {
                                            addSuffix: true,
                                        }
                                    )
                                )}
                            </p>
                        </div>
                    </div>
                    <SheetTitle className="sr-only" />
                    <SheetDescription className="sr-only" />
                </SheetHeader>

                {/* Messages */}
                <div
                    ref={scrollViewportRef}
                    onScroll={handleViewportScroll}
                    className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
                >
                    <div className="px-4 py-4 space-y-4">
                        {isMessagesLoading && !messages.length && (
                            <div className="w-full h-32 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                            </div>
                        )}

                        <AnimatePresence initial={false} mode="popLayout">
                            {messages.filter(Boolean).map((m: IMessage, i) => {
                                if (!m) return null;

                                if (m.kind === 'system') {
                                    return (
                                        <motion.div
                                            key={`sys-${m._id}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="text-center text-xs text-gray-500 my-4 px-3 py-2 bg-gray-100/50 rounded-full mx-auto w-fit backdrop-blur-sm"
                                        >
                                            {m.text}
                                        </motion.div>
                                    );
                                }

                                const mine = m.authorID === user?.userID;
                                const author = mine
                                    ? 'You'
                                    : conversationUser?.name;
                                const isLastMessage = i === messages.length - 1;

                                return (
                                    <motion.div
                                        key={m._id}
                                        className={`flex ${
                                            mine
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm backdrop-blur-sm relative ${
                                                mine
                                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                                                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                                            }`}
                                        >
                                            {m.text && (
                                                <p className="whitespace-pre-wrap leading-relaxed">
                                                    {m.text}
                                                </p>
                                            )}
                                            {m?.attachment && (
                                                <motion.button
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{ delay: 0.2 }}
                                                    onClick={() =>
                                                        handleDownload(
                                                            m.attachment
                                                                ?.key as string,
                                                            m.attachment
                                                                ?.name as string
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 mt-2 p-2 rounded-lg text-xs underline transition-colors ${
                                                        mine
                                                            ? 'bg-white/20 hover:bg-white/30'
                                                            : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <Paperclip className="w-3 h-3" />
                                                    {m?.attachment.name}
                                                </motion.button>
                                            )}
                                            <div
                                                className={`flex items-center justify-between mt-2 text-[10px] ${
                                                    mine
                                                        ? 'text-white/70'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                <span>
                                                    {author} •{' '}
                                                    {formatDistanceToNow(
                                                        new Date(m.sentAt),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </span>
                                                {mine &&
                                                    (isLastMessage ? (
                                                        <CheckCheck className="w-3 h-3" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </AnimatePresence>

                        {/* Typing indicator */}
                        <AnimatePresence>
                            {(showTypingIndicator || isTyping) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex justify-end"
                                >
                                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                        <div className="flex space-x-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        scale: [1, 1.5, 1],
                                                        opacity: [0.5, 1, 0.5],
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    }}
                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 shrink-0 bg-white/80 backdrop-blur-sm shadow-lg">
                    {isUploading && (
                        <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between text-sm text-blue-700 mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-1.5">
                                <motion.div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-3"
                    >
                        <Input
                            type="file"
                            hidden
                            id="file-input"
                            onChange={handleFileSelect}
                        />
                        <Label htmlFor="file-input">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    disabled={
                                        isNewMessageSending || isUploading
                                    }
                                    asChild
                                    className="shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div>
                                        {isUploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Paperclip className="w-4 h-4" />
                                        )}
                                    </div>
                                </Button>
                            </motion.div>
                        </Label>

                        <Input
                            ref={inputRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a message…"
                            disabled={isNewMessageSending}
                            className="resize-none shadow-md bg-gray-50/50 border-gray-200 focus:bg-white rounded-full py-3"
                        />

                        <Button
                            size="icon"
                            disabled={isNewMessageSending || !text.trim()}
                            className="shadow-md bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                        >
                            {isNewMessageSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowUp className="w-4 h-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
