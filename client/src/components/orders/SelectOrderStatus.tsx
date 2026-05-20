/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import { OrderStatusData, statusData } from '@/data/orders';
import { IOrder } from '@/types/order.interface';
import { Button } from '../ui/button';
import { useUpdateOrderMutation } from '@/redux/features/orders/ordersApi';
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

interface SelectOrderStatusProps {
    order: IOrder;
    role: string;
    orderID: string;
    refetch?: any;
}

export default function SelectOrderStatus({
    order,
    role,
    orderID,
    refetch,
}: SelectOrderStatusProps) {
    const { user } = useLoggedInUser();

    const item = statusData.find((item) => item.value === order.status);
    const [updateOrder, { isLoading }] = useUpdateOrderMutation();

    const handleOrderStatusChange = async ({
        orderID,
        status,
    }: {
        orderID: string;
        status: string;
    }) => {
        try {
            const response = await updateOrder({
                orderID,
                data: { status },
            }).unwrap();

            if (response.success)
                toast.success('Order status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };

    useEffect(() => {
        if (!orderID || !user?.userID) return;

        socket.connect();

        socket.emit('join-user-room', user.userID);
        socket.emit('join-order-room', orderID);

        const handleNotification = () => {
            refetch();
        };

        const handleOrderUpdate = () => {
            refetch();
        };

        socket.on('new-notification', handleNotification);
        socket.on('order-updated', handleOrderUpdate);

        return () => {
            socket.off('new-notification', handleNotification);
            socket.off('order-updated', handleOrderUpdate);
            socket.emit('leave-order-room', orderID);
        };
    }, [orderID, user?.userID, refetch]);

    return (
        <div className="flex items-center justify-center">
            {role && role === 'user' ? (
                <span className="flex items-center justify-center gap-2">
                    {order.status === 'pending' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        (() => {
                            const item = OrderStatusData.find(
                                (item) => item.value === order.status
                            );
                            return item ? (
                                <item.icon
                                    size={16}
                                    className={cn(item.text)}
                                />
                            ) : null;
                        })()
                    )}
                    {order.status}
                </span>
            ) : order.status === 'pending' ? (
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isLoading}
                                onClick={() =>
                                    handleOrderStatusChange({
                                        orderID,
                                        status: 'canceled',
                                    })
                                }
                            >
                                <X className="text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel the order</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isLoading}
                                onClick={() =>
                                    handleOrderStatusChange({
                                        orderID,
                                        status: 'in-progress',
                                    })
                                }
                            >
                                <Check className="text-primary" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Accept the order</TooltipContent>
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
                    {order.status}
                </span>
            )}
        </div>
    );
}
