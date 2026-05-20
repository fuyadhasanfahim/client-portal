'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    ArrowUp,
    Loader2,
    LogOutIcon,
    Paperclip,
    Check,
    CheckCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { IMessage } from '@/types/message.interface';
import ApiError from '../shared/ApiError';
import {
    useGetMessagesQuery,
    useNewMessageMutation,
} from '@/redux/features/message/messageApi';
import { socket } from '@/lib/socket';
import {
    useGetConversationQuery,
    useJoinConversationMutation,
    useLeaveConversationMutation,
} from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import {
    useLazyDownloadFileQuery,
    usePresignUploadMutation,
} from '@/redux/features/upload/uploadApi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [scrollMode, setScrollMode] = useState<'append' | 'prepend' | null>(
        null
    );
    const [initialLoad, setInitialLoad] = useState(true);
    const [joined, setJoined] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const inputFocusSpring = useSpring(0);

    const { data: messagesData, isLoading: isMessagesLoading } =
        useGetMessagesQuery(
            {
                userID: user?.userID,
                conversationID,
                rawLimit: 25,
                cursor: cursor ?? '',
            },
            { skip: !user?.userID }
        );

    const [newMessage, { isLoading: isNewMessageSending }] =
        useNewMessageMutation();

    const { data: conversationData, isLoading: isConversationLoading } =
        useGetConversationQuery(conversationID, { skip: !conversationID });

    const [joinConversation] = useJoinConversationMutation();
    const [leaveConversation] = useLeaveConversationMutation();
    const [presignUpload] = usePresignUploadMutation();
    const [downloadFile] = useLazyDownloadFileQuery();

    const conversation: IConversation = React.useMemo(
        () => conversationData?.conversation ?? ({} as IConversation),
        [conversationData?.conversation]
    );

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'user'
    );

    // Animation variants
    const messageVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
            filter: 'blur(4px)',
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
                mass: 0.8,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.2 },
        },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 150,
                damping: 25,
            },
        },
    };

    const footerVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 150,
                damping: 18,
                delay: 0.3,
            },
        },
    };

    useEffect(() => {
        if (!conversation || !user?.userID) return;
        const me = conversation.participants?.find(
            (p) => p.userID === user.userID
        );
        const online = !!me?.isOnline;

        if (online) {
            setJoined(true);
        } else {
            setJoined(false);
        }
    }, [conversation, user?.userID]);

    useEffect(() => {
        if (scrollMode === 'append') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (scrollMode === 'prepend' && scrollRef.current) {
            const el = scrollRef.current;
            const prevHeight = el.scrollHeight;
            requestAnimationFrame(() => {
                const newHeight = el.scrollHeight;
                el.scrollTop = newHeight - prevHeight;
            });
        }
        setScrollMode(null);
    }, [messages, scrollMode, joined]);

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

    // ✅ Messages from API
    useEffect(() => {
        if (messagesData?.data?.messages) {
            setMessages((prev) => {
                const combined = cursor
                    ? [...messagesData.data.messages, ...prev]
                    : messagesData.data.messages;

                const unique = new Map(
                    combined.map((m: IMessage) => [m._id, m])
                );
                return Array.from(unique.values()) as IMessage[];
            });

            if (!cursor && initialLoad) {
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
                });
                setInitialLoad(false);
            }
        }
    }, [messagesData, cursor, initialLoad]);

    // ✅ Socket
    useEffect(() => {
        if (!conversation._id || !user?.userID) return;
        if (!socket.connected) socket.connect();

        const handleNewMessage = (data: {
            message: IMessage;
            userID: string;
        }) => {
            if (data.message?.conversationID === conversation._id) {
                setMessages((prev) => [...prev, data.message]);
                setScrollMode('append');
            }
        };

        // Only join socket room if user has joined the conversation
        if (joined) {
            socket.emit('join-conversation', {
                conversationID: conversation._id,
                userID: user.userID,
            });
        }

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [conversation._id, user?.userID, joined]);

    // ✅ Join / Leave handlers
    const handleJoin = async () => {
        try {
            const res = await joinConversation({
                conversationID,
                userID: user.userID,
            }).unwrap();

            if (res.success) {
                setJoined(true);
                setShowJoinDialog(false);

                socket.emit('join-conversation', {
                    conversationID,
                    userID: user.userID,
                });

                if (res.systemMessage) {
                    setMessages((prev) => [...prev, res.systemMessage]);
                    setScrollMode('append');
                }
            }
        } catch (err) {
            ApiError(err);
        }
    };

    const handleLeave = async () => {
        try {
            socket.emit('leave-conversation', {
                conversationID,
                userID: user.userID,
            });

            const res = await leaveConversation({
                conversationID,
                userID: user.userID,
            }).unwrap();

            console.log(res);

            if (res.success) {
                setJoined(false);
                setShowJoinDialog(true);

                if (res.systemMessage) {
                    setMessages((prev) => [...prev, res.systemMessage]);
                    setScrollMode('append');
                }
            }
        } catch (error) {
            ApiError(error);
        }
    };

    // ✅ Send message with enhanced animation
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        const messageText = text;
        setText(''); // Clear immediately for better UX

        try {
            const res = await joinConversation({
                conversationID,
                userID: user.userID,
            }).unwrap();

            if (res.success) {
                try {
                    const res = await newMessage({
                        conversationID,
                        text: messageText,
                        senderID: user?.userID,
                    }).unwrap();

                    if (res?.success) {
                        setScrollMode('append');
                        requestAnimationFrame(() => inputRef.current?.focus());
                    }
                } catch (error) {
                    setText(messageText); // Restore text on error
                    ApiError(error);
                }
            }
        } catch (error) {
            setText(messageText); // Restore text on error
            ApiError(error);
        }
    };

    // ✅ Load older messages
    const handleLoadMore = () => {
        if (messages.length > 0) {
            setCursor(messages[0]._id);
            setScrollMode('prepend');
        }
    };

    // ✅ Enhanced file upload with progress
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            alert('Max file size is 50MB');
            return;
        }

        // Check if user has joined
        if (!joined) {
            setShowJoinDialog(true);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const res = await presignUpload({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                conversationID,
                senderID: user.userID,
            }).unwrap();

            const { url, publicUrl, key } = res.upload;

            // Simulate upload progress
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
                conversationID,
                senderID: user.userID,
                attachment: {
                    url: publicUrl,
                    key,
                    name: file.name,
                    size: file.size,
                    contentType: file.type,
                },
            }).unwrap();
        } catch (err) {
            ApiError(err);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (key: string, fileName: string) => {
        try {
            const res = await downloadFile(key).unwrap();
            if (res.success && res.url) {
                // Force browser to download
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

    const handleInputFocus = () => {
        inputFocusSpring.set(1);
    };

    const handleInputBlur = () => {
        inputFocusSpring.set(0);
    };

    return (
        <>
            {/* ✅ Enhanced Join confirmation dialog */}
            <AnimatePresence>
                {!isConversationLoading && showJoinDialog && !joined && (
                    <Dialog
                        open={showJoinDialog}
                        onOpenChange={(value) => setShowJoinDialog(value)}
                    >
                        <DialogContent>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 25,
                                }}
                                className="space-y-6"
                            >
                                <DialogHeader>
                                    <DialogTitle>
                                        Join this conversation?
                                    </DialogTitle>
                                    <DialogDescription>
                                        Once you join, you&apos;ll appear in
                                        this chat and the client will be
                                        notified.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex justify-end gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowJoinDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button onClick={handleJoin}>
                                            Join
                                        </Button>
                                    </motion.div>
                                </DialogFooter>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex h-full min-h-0 flex-col bg-gradient-to-b from-white to-gray-50/30"
            >
                {/* Enhanced Header */}
                <motion.div
                    variants={headerVariants}
                    className="shrink-0 border-b bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm"
                >
                    {isConversationLoading ? (
                        <div className="flex items-center gap-3 min-w-0">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="space-y-2 min-w-0">
                                <Skeleton className="h-4 w-[200px] rounded-full" />
                                <Skeleton className="h-3 w-[150px] rounded-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 min-w-0">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 17,
                                }}
                            >
                                <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-orange-200 transition-all duration-300">
                                    <AvatarImage
                                        src={conversationUser?.image}
                                        alt={conversationUser?.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
                                        {conversationUser?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                                        conversationUser?.isOnline
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-400'
                                    }`}
                                />
                            </motion.div>
                            <div className="min-w-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-semibold text-sm truncate text-gray-900"
                                >
                                    {conversationUser?.name}
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-xs text-gray-500 truncate"
                                >
                                    {conversationUser?.isOnline
                                        ? 'Online'
                                        : conversationUser?.email}
                                </motion.p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Enhanced Messages Container */}
                <div
                    ref={scrollRef}
                    className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollTop === 0 && !isMessagesLoading) {
                            handleLoadMore();
                        }
                    }}
                >
                    <AnimatePresence initial={false} mode="popLayout">
                        {messages?.filter(Boolean).map((m, i) => {
                            if (!m) return null;

                            if (m?.kind === 'system') {
                                return (
                                    <motion.div
                                        key={m._id || i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="text-center text-xs text-gray-500 my-4 px-3 py-2 bg-gray-100/50 rounded-full mx-auto w-fit backdrop-blur-sm"
                                    >
                                        {m.text}
                                    </motion.div>
                                );
                            }

                            const mine = m?.authorID === user.userID;
                            const author = mine
                                ? 'You'
                                : conversationUser?.name;
                            const isLastMessage = i === messages.length - 1;

                            return (
                                <motion.div
                                    key={m._id || i}
                                    layout
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={`flex ${
                                        mine ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <motion.div
                                        whileHover={{
                                            scale: 1.02,
                                            y: -2,
                                            boxShadow: mine
                                                ? '0 8px 25px rgba(251, 146, 60, 0.25)'
                                                : '0 8px 25px rgba(0, 0, 0, 0.1)',
                                        }}
                                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm backdrop-blur-sm relative ${
                                            mine
                                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md shadow-orange-200'
                                                : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                                        }`}
                                    >
                                        {m?.text && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="whitespace-pre-wrap leading-relaxed"
                                            >
                                                {m?.text}
                                            </motion.p>
                                        )}
                                        {m?.attachment && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
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
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className={`flex items-center justify-between mt-2 text-[10px] ${
                                                mine
                                                    ? 'text-white/70'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            <span>
                                                {author} •{' '}
                                                {m?.sentAt &&
                                                    format(
                                                        new Date(m?.sentAt),
                                                        'p'
                                                    )}
                                            </span>
                                            {mine && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay: 0.5,
                                                        type: 'spring',
                                                        stiffness: 500,
                                                    }}
                                                >
                                                    {isLastMessage ? (
                                                        <CheckCheck className="w-3 h-3" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    )}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    <AnimatePresence>
                        {isTyping && (
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

                    {isMessagesLoading && !messages.length && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            >
                                <Loader2 className="w-6 h-6 text-orange-500" />
                            </motion.div>
                        </motion.div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Enhanced Footer */}
                {joined ? (
                    <motion.div
                        variants={footerVariants}
                        className="shrink-0 border-t bg-white/80 backdrop-blur-sm px-4 py-4 shadow-lg"
                    >
                        {/* Upload Progress */}
                        <AnimatePresence>
                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                    <div className="flex items-center justify-between text-sm text-blue-700 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-1.5">
                                        <motion.div
                                            className="bg-blue-600 h-1.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${uploadProgress}%`,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-3"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={handleLeave}
                                    className="shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <LogOutIcon className="w-4 h-4" />
                                </Button>
                            </motion.div>

                            <input
                                type="file"
                                hidden
                                id="file-input"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="file-input">
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
                            </label>

                            <motion.div
                                className="flex-1 relative"
                                animate={{
                                    scale:
                                        inputFocusSpring.get() === 1 ? 1.02 : 1,
                                }}
                            >
                                <Input
                                    ref={inputRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    className="resize-none shadow-md focus:shadow-lg transition-all duration-300 pr-12 bg-gray-50/50 border-gray-200 focus:bg-white rounded-full py-3"
                                    placeholder="Write a message…"
                                    disabled={isNewMessageSending}
                                />
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Button
                                    size="icon"
                                    type="submit"
                                    disabled={
                                        isNewMessageSending || !text.trim()
                                    }
                                    className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full"
                                >
                                    {isNewMessageSending ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        >
                                            <Loader2 className="w-4 h-4" />
                                        </motion.div>
                                    ) : (
                                        <ArrowUp className="w-4 h-4" />
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="shrink-0 border-t bg-gray-50/80 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <p className="text-sm text-gray-500 text-center py-4">
                                You have left this chat.
                            </p>
                            <Button onClick={() => setShowJoinDialog(true)}>
                                Join the chat
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </>
    );
}
