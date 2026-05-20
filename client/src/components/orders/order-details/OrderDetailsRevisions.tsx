'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { IRevision, IRevisionMessage } from '@/types/revision.interface';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Loader2,
    Send,
    MessageSquare,
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

type Props = {
    revision: IRevision | null | undefined;
    className?: string;
};

const timeAgo = (d?: Date | string) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    return formatDistanceToNow(date, { addSuffix: true });
};

const StatusBadge = ({ status }: { status: IRevision['status'] }) => {
    const statusConfig = {
        open: {
            icon: AlertCircle,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
            text: 'Open',
        },
        'in-review': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
            text: 'In Review',
        },
        closed: {
            icon: CheckCircle2,
            className: 'bg-muted text-muted-foreground border-border',
            text: 'Closed',
        },
    };

    const config = statusConfig[status] || statusConfig.open;
    const IconComponent = config.icon;

    return (
        <Badge variant="outline" className={cn('gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
            <IconComponent className="w-3.5 h-3.5" />
            <span>{config.text}</span>
        </Badge>
    );
};

const RevisionMessageItem = ({
    message,
    isOwnMessage,
}: {
    message: IRevisionMessage;
    isOwnMessage: boolean;
}) => {
    const isAdmin = message.senderRole === 'admin';

    return (
        <div className={cn('flex gap-3 text-sm w-full', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <Avatar className="h-8 w-8 border border-border mt-1">
                <AvatarImage src={message.senderProfileImage} alt={message.senderName} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                    {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </AvatarFallback>
            </Avatar>

            {/* Bubble Container */}
            <div className={cn('flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]', isOwnMessage ? 'items-end' : 'items-start')}>
                {/* Header info */}
                <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', isOwnMessage && 'flex-row-reverse')}>
                    <span className="font-semibold text-foreground">{message.senderName}</span>
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-bold tracking-wider">
                        {message.senderRole}
                    </Badge>
                    <span>•</span>
                    <span>{timeAgo(message.createdAt)}</span>
                </div>

                {/* Message Bubble */}
                <div
                    className={cn(
                        'rounded-lg px-4 py-3 border text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm',
                        isOwnMessage
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : isAdmin
                            ? 'bg-primary/5 text-foreground border-primary/20 border-l-4 border-l-primary'
                            : 'bg-card text-foreground border-border'
                    )}
                >
                    {message.message}
                </div>
            </div>
        </div>
    );
};

export default function OrderDetailsRevisions({ revision, className }: Props) {
    const { user } = useLoggedInUser();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sendRevisionMessage, { isLoading }] =
        useSendRevisionMessageMutation();

    const scrollRef = useRef<HTMLDivElement | null>(null);
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
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
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

    // If revision doesn't exist or no messages are present
    if (!revision || messages.length === 0) {
        return (
            <Card className={cn('border border-border shadow-sm bg-card', className)}>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 font-semibold">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Revisions
                    </CardTitle>
                    <CardDescription>
                        Revision dialogue and updates for deliverables
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">No revisions requested yet</p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                            If you require updates or modifications to your delivered files, you can initiate a revision request here.
                        </p>
                    </div>
                </CardContent>

                {/* Reply Composer if revision is open */}
                {revision && revision.status !== 'closed' && (
                    <CardFooter className="border-t border-border/50 pt-4 flex flex-col gap-3">
                        <div className="relative w-full">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Type a message… (Ctrl/⌘ + Enter to send)"
                                value={input}
                                autoFocus
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="min-h-[80px] resize-none pr-10 focus-visible:ring-1"
                                disabled={!orderID || isLoading}
                            />
                            {isTyping && input && (
                                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end w-full">
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || !orderID}
                                className="px-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Start Revision Request
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        );
    }

    return (
        <Card className={cn('border border-border shadow-sm bg-card overflow-hidden flex flex-col', className)}>
            {/* Header */}
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-semibold">Revisions</CardTitle>
                        <CardDescription className="text-xs">
                            {messages.length} messages in this thread
                        </CardDescription>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge status={revision.status} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        Updated {timeAgo(revision.lastMessageAt || revision.updatedAt || revision.createdAt)}
                    </span>
                </div>
            </CardHeader>

            {/* Messages body */}
            <div
                ref={scrollRef}
                className="max-h-[400px] overflow-y-auto p-6 bg-muted/5 divide-y-0"
            >
                <div className="flex flex-col gap-6 w-full">
                    {messages.map((m, i) => (
                        <RevisionMessageItem
                            key={`${revision.orderID}-${i}-${m.createdAt}`}
                            message={m}
                            isOwnMessage={m.senderID === sender.senderID}
                        />
                    ))}
                </div>
            </div>

            {/* Composer Footer */}
            {revision.status !== 'closed' && (
                <CardFooter className="border-t border-border/50 p-6 flex flex-col gap-4">
                    <div className="relative w-full">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Type your message… (Ctrl/⌘ + Enter to send)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            className="min-h-[100px] resize-none pr-10 focus-visible:ring-1"
                            disabled={!orderID || isLoading}
                        />
                        {isTyping && input && (
                            <div className="absolute bottom-3 right-3 flex items-center gap-1">
                                <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between w-full flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Sending as</span>
                            <span className="font-semibold text-foreground">{sender.senderName}</span>
                            <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0 font-bold">
                                {sender.senderRole}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setInput('')}
                                disabled={isLoading || !input.trim()}
                                size="sm"
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || !orderID}
                                size="sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Send Message
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
