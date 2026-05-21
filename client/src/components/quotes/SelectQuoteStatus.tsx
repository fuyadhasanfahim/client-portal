/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import { OrderStatusData, statusData } from '@/data/orders';
import { Button } from '../ui/button';
import ApiError from '../shared/ApiError';
import toast from 'react-hot-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, Loader2, X } from 'lucide-react';
import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { IQuote } from '@/types/quote.interface';
import { useUpdateQuoteMutation } from '@/redux/features/quotes/quoteApi';

interface SelectQuoteStatusProps {
    quote: IQuote;
    role: string;
    quoteID: string;
    refetch?: any;
}

export default function SelectQuoteStatus({
    quote,
    role,
    quoteID,
    refetch,
}: SelectQuoteStatusProps) {
    const { user } = useLoggedInUser();

    const item = statusData.find((item) => item.value === quote.status);
    const [updateQuote, { isLoading }] = useUpdateQuoteMutation();

    const handleQuoteStatusChange = async ({
        quoteID,
        status,
    }: {
        quoteID: string;
        status: string;
    }) => {
        try {
            console.log(quoteID, status);
            const response = await updateQuote({
                quoteID,
                data: { status },
            }).unwrap();

            if (response.success)
                toast.success('Quote status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };

    useEffect(() => {
        if (!quoteID || !user?.userID) return;

        socket.connect();

        socket.emit('join-user-room', user.userID);
        socket.emit('join-quote-room', quoteID);

        const handleNotification = () => {
            refetch();
        };

        const handleOrderUpdate = () => {
            refetch();
        };

        socket.on('new-notification', handleNotification);
        socket.on('quote-updated', handleOrderUpdate);

        return () => {
            socket.off('new-notification', handleNotification);
            socket.off('quote-updated', handleOrderUpdate);
            socket.emit('leave-quote-room', quoteID);
        };
    }, [quoteID, user?.userID, refetch]);

    return (
        <div className="flex items-center justify-center">
            {role && role === 'user' ? (
                <span className="flex items-center justify-center gap-2 capitalize">
                    {quote.status === 'pending' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        (() => {
                            const item = OrderStatusData.find(
                                (item) => item.value === quote.status
                            );
                            return item ? (
                                <item.icon
                                    size={16}
                                    className={cn(item.text)}
                                />
                            ) : null;
                        })()
                    )}
                    {quote.status.replace(/_/g, ' ')}
                </span>
            ) : quote.status === 'pending' ? (
                <div className="flex items-center justify-center gap-2.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                                onClick={() =>
                                    handleQuoteStatusChange({
                                        quoteID,
                                        status: 'cancelled',
                                    })
                                }
                                className="h-8 w-8 rounded-full border border-rose-200/60 bg-rose-50/60 text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 active:scale-95 transition-all shadow-sm duration-200"
                            >
                                <X className="h-4 w-4 stroke-[2.5]" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Cancel the quote
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                                onClick={() =>
                                    handleQuoteStatusChange({
                                        quoteID,
                                        status: 'in_progress',
                                    })
                                }
                                className="h-8 w-8 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all shadow-sm duration-200"
                            >
                                <Check className="h-4 w-4 stroke-[2.5]" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Accept the quote
                        </TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <span
                    className={cn(
                        'flex items-center justify-center gap-1 capitalize',
                        item && item.text
                    )}
                >
                    {item ? (
                        <item.icon size={16} className={cn(item.text)} />
                    ) : null}
                    {quote.status.replace(/_/g, ' ')}
                </span>
            )}
        </div>
    );
}
