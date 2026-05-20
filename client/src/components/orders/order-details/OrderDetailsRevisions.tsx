'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { IRevision, IRevisionMessage } from '@/types/revision.interface';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2,
    Send,
    MessageCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Shield,
} from 'lucide-react';
import { useSendRevisionMessageMutation } from '@/redux/features/orders/ordersApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

type Props = {
    revision: IRevision | null | undefined;
    className?: string;
};

const timeAgo = (d?: Date | string) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    return formatDistanceToNow(date, { addSuffix: true });
};

const StatusPill = ({ s }: { s: IRevision['status'] }) => {
    const statusConfig = {
        open: {
            icon: AlertCircle,
            bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            dot: 'bg-emerald-500',
        },
        'in-review': {
            icon: Clock,
            bg: 'bg-gradient-to-r from-amber-50 to-orange-100',
            text: 'text-amber-700',
            border: 'border-amber-200',
            dot: 'bg-amber-500',
        },
        closed: {
            icon: CheckCircle2,
            bg: 'bg-gradient-to-r from-gray-50 to-slate-100',
            text: 'text-gray-600',
            border: 'border-gray-200',
            dot: 'bg-gray-500',
        },
    };

    const config = statusConfig[s];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border backdrop-blur-sm',
                config.bg,
                config.text,
                config.border
            )}
        >
            <div
                className={cn(
                    'w-1.5 h-1.5 rounded-full animate-pulse',
                    config.dot
                )}
            />
            <IconComponent className="w-3 h-3" />
            <span className="capitalize">{s.replace('-', ' ')}</span>
        </motion.div>
    );
};

const Avatar = ({
    role,
    name,
    image,
}: {
    role: string;
    name: string;
    image?: string;
}) => {
    const isAdmin = role === 'admin';

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
        >
            {image ? (
                <Image
                    width={32}
                    height={32}
                    src={image}
                    alt={name}
                    className="rounded-full object-cover border-2 border-white"
                />
            ) : (
                <div
                    className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white',
                        isAdmin
                            ? 'bg-primary text-white'
                            : 'bg-teal-600 text-white'
                    )}
                >
                    {isAdmin ? (
                        <Shield className="w-4 h-4" />
                    ) : (
                        <User className="w-4 h-4" />
                    )}
                </div>
            )}

            {/* Status indicator */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                    isAdmin
                        ? 'bg-primary text-primary'
                        : 'bg-teal-600 text-primary'
                )}
            />
        </motion.div>
    );
};

const Message = ({
    m,
    isOwnMessage,
}: {
    m: IRevisionMessage;
    isOwnMessage: boolean;
}) => {
    const isAdmin = m.senderRole === 'admin';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className={`flex items-start gap-3 ${
                isOwnMessage ? 'justify-end' : ''
            }`}
            role="listitem"
        >
            {!isOwnMessage && (
                <Avatar
                    role={m.senderRole}
                    name={m.senderName}
                    image={m.senderProfileImage}
                />
            )}

            <div
                className={`flex flex-col gap-1 ${
                    isOwnMessage ? 'items-end' : 'items-start'
                }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center gap-2 text-xs ${
                        isOwnMessage && 'flex-row-reverse'
                    }`}
                >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                        {m.senderName}
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isAdmin
                                ? 'bg-orange-500 text-white'
                                : 'bg-teal-500 text-white'
                        }`}
                    >
                        {m.senderRole}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                        {timeAgo(m.createdAt)}
                    </span>
                </div>

                {/* Bubble */}
                <div
                    className={`relative max-w-[75%] rounded-2xl px-4 py-3 border ${
                        isOwnMessage
                            ? 'bg-orange-500 text-white border-transparent shadow-sm'
                            : 'bg-white text-slate-900 border-slate-200 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                    }`}
                >
                    <div
                        className={`absolute top-3 w-2 h-2 rotate-45 ${
                            isOwnMessage
                                ? 'right-[-4px] bg-orange-500'
                                : 'left-[-4px] bg-white border-l border-t border-slate-200 dark:bg-slate-900'
                        }`}
                    />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.message}
                    </p>
                </div>
            </div>

            {isOwnMessage && (
                <Avatar
                    role={m.senderRole}
                    name={m.senderName}
                    image={m.senderProfileImage}
                />
            )}
        </motion.div>
    );
};

export default function OrderDetailsRevisions({ revision, className }: Props) {
    const { user } = useLoggedInUser();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sendRevisionMessage, { isLoading }] =
        useSendRevisionMessageMutation();

    const scrollRef = useRef<HTMLUListElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const orderID = revision?.orderID;

    const messages = revision?.messages ?? [];

    const sender = useMemo(
        () => ({
            senderID: user?.userID ?? '',
            senderName: user?.name ?? 'User',
            senderRole: (user?.role === 'admin' ? 'admin' : 'user') as
                | 'user'
                | 'admin',
            senderProfileImage: user?.image ?? '',
        }),
        [user]
    );

    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollToBottom = () => {
            if (!scrollRef.current) return;
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        };

        const timeoutId = setTimeout(scrollToBottom, 150);
        return () => clearTimeout(timeoutId);
    }, [messages.length]);

    useEffect(() => {
        const timeoutId = setTimeout(() => setIsTyping(false), 1000);
        return () => clearTimeout(timeoutId);
    }, [input]);

    const handleSend = async () => {
        const message = input.trim();
        if (!message) return;
        if (!orderID) {
            toast.error('Missing order ID');
            return;
        }
        if (!sender.senderID) {
            toast.error('Missing sender');
            return;
        }

        try {
            await sendRevisionMessage({
                orderID,
                message,
                senderID: sender.senderID,
                senderName: sender.senderName,
                senderRole: sender.senderRole,
                senderProfileImage: sender.senderProfileImage,
            }).unwrap();

            setInput('');
            textareaRef.current?.focus();
        } catch (err) {
            ApiError(err);
        }
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }

        if (!isTyping && input.length > 0) {
            setIsTyping(true);
        }
    };

    if (!revision || messages.length === 0) {
        return (
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
                className={cn(
                    'rounded-3xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-sm',
                    className
                )}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            <MessageCircle className="w-5 h-5 text-orange-500" />
                        </motion.div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Revisions
                        </h3>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-8"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-cyan-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-gray-500 mb-6">
                            No messages yet. Start the conversation!
                        </p>
                    </motion.div>

                    {/* Reply composer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="space-y-3"
                    >
                        <div className="relative">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Type a message… (Ctrl/⌘ + Enter to send)"
                                value={input}
                                autoFocus
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="min-h-[100px] resize-none rounded-2xl border-gray-200/60 bg-white/60 backdrop-blur-sm focus:bg-white transition-all duration-200 pr-12"
                                disabled={!orderID || isLoading}
                            />
                            {isTyping && input && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute bottom-3 right-3 flex items-center gap-1"
                                >
                                    <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
                                    <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                    <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                </motion.div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleSend}
                                    disabled={
                                        !input.trim() || isLoading || !orderID
                                    }
                                    className="rounded-2xl bg-gradient-to-r from-orange-500 to-cyan-600 hover:from-orange-600 hover:to-cyan-700 text-white transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Send Message
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
            className={cn(
                'rounded-3xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-sm overflow-hidden',
                className
            )}
        >
            {/* Header */}
            <motion.div
                layout
                className="flex items-center justify-between border-b border-gray-200/60 p-6 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Revisions
                        </h3>
                        <p className="text-sm text-gray-500">
                            {messages.length} messages
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <StatusPill s={revision.status} />
                    <span>•</span>
                    <span>
                        updated{' '}
                        {timeAgo(
                            revision.lastMessageAt ||
                                revision.updatedAt ||
                                revision.createdAt
                        )}
                    </span>
                </div>
            </motion.div>

            {/* Messages */}
            <ul
                ref={scrollRef}
                className="max-h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
                <AnimatePresence mode="popLayout">
                    {messages.map((m, i) => (
                        <motion.li
                            layout
                            key={`${revision.orderID}-${i}-${m.createdAt}`}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                                delay: i * 0.05,
                            }}
                        >
                            <Message
                                m={m}
                                isOwnMessage={m.senderID === sender.senderID}
                            />
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>

            {/* Reply composer */}
            {revision.status !== 'closed' && (
                <motion.div
                    layout
                    className="border-t border-gray-200/60 p-6 bg-gradient-to-r from-gray-50/30 to-white/30 backdrop-blur-sm space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Type your message… (Ctrl/⌘ + Enter to send)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            className="min-h-[100px] resize-none rounded-2xl border-gray-200/60 bg-white/60 backdrop-blur-sm focus:bg-white transition-all duration-200 pr-12"
                            disabled={!orderID || isLoading}
                        />
                        {isTyping && input && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute bottom-3 right-3 flex items-center gap-1"
                            >
                                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            </motion.div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <motion.div
                            layout
                            className="flex items-center gap-2 text-xs text-gray-500"
                        >
                            <Avatar
                                role={sender.senderRole}
                                name={sender.senderName}
                                image={sender.senderProfileImage}
                            />
                            <span>
                                Sending as{' '}
                                <span className="font-medium text-gray-700">
                                    {sender.senderName}
                                </span>
                            </span>
                        </motion.div>

                        <div className="flex items-center gap-2">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setInput('')}
                                    disabled={isLoading || !input.trim()}
                                    className="rounded-xl border-gray-200 hover:bg-gray-50"
                                >
                                    Clear
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleSend}
                                    disabled={
                                        !input.trim() || isLoading || !orderID
                                    }
                                    className="rounded-xl bg-gradient-to-r from-orange-500 to-cyan-600 hover:from-orange-600 hover:to-cyan-700 text-white transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Send
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.section>
    );
}
