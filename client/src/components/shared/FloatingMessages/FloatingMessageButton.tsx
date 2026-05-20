'use client';

import { useMemo } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type FloatingMessageButtonProps = {
    isOpen: boolean;
    onToggle: () => void;
    unreadCount?: number;
    disabled?: boolean;
    className?: string;
};

export default function FloatingMessageButton({
    isOpen,
    onToggle,
    unreadCount = 0,
    disabled,
    className,
}: FloatingMessageButtonProps) {
    const hasUnread = unreadCount > 0;

    const unreadLabel = useMemo(
        () => (unreadCount > 99 ? '99+' : String(unreadCount)),
        [unreadCount]
    );

    return (
        <motion.div
            className={clsx(
                'fixed bottom-6 right-6 z-50 select-none',
                className
            )}
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        >
            <div className="relative">
                <AnimatePresence>
                    {hasUnread && !isOpen && (
                        <motion.div
                            key="badge"
                            className="absolute -top-2 -right-2"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 18,
                            }}
                        >
                            <Badge
                                className="rounded-full"
                                variant={'destructive'}
                            >
                                {unreadLabel}
                            </Badge>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div>
                    <Button
                        aria-label={isOpen ? 'Close messages' : 'Open messages'}
                        size="icon"
                        disabled={disabled}
                        onClick={onToggle}
                        className={clsx(
                            'h-14 w-14 rounded-full shadow-lg',
                            'bg-primary text-primary-foreground'
                        )}
                    >
                        <motion.div
                            key={isOpen ? 'close' : 'msg'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 18,
                            }}
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <MessageCircle className="h-6 w-6" />
                            )}
                        </motion.div>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
