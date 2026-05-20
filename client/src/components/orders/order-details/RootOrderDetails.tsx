'use client';

import {
    useGetOrderByIDQuery,
    useGetRevisionsQuery,
} from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function RootOrderDetails({ orderID }: { orderID: string }) {
    const { user } = useLoggedInUser();

    const { data, isLoading, isError, refetch } = useGetOrderByIDQuery(
        orderID,
        {
            skip: !orderID,
        }
    );

    const { data: revisionsData, refetch: refetchRevision } =
        useGetRevisionsQuery(orderID, { skip: !orderID });

    useEffect(() => {
        if (!orderID || !user?.userID) return;

        if (!socket.connected) socket.connect();

        socket.emit('join-user-room', user.userID);
        socket.emit('join-order-room', orderID);

        const handleNotification = () => refetch();
        const handleOrderUpdate = () => refetch();
        const handleRevisionUpdate = () => refetchRevision();

        socket.on('new-notification', handleNotification);
        socket.on('order-updated', handleOrderUpdate);
        socket.on('revision-updated', handleRevisionUpdate);

        return () => {
            socket.off('new-notification', handleNotification);
            socket.off('order-updated', handleOrderUpdate);
            socket.off('revision-updated', handleRevisionUpdate);
            socket.emit('leave-order-room', orderID);
        };
    }, [orderID, user?.userID, refetch, refetchRevision]);

    if (!data && !isError && isLoading) {
        return (
            <div className="min-h-[80vh] w-full flex items-center justify-center">
                <Loader2 className="size-5 animate-spin" />
            </div>
        );
    }

    if (!isLoading && !isError && !data) {
        return (
            <div className="min-h-[80vh] w-full flex items-center justify-center">
                <p className="text-destructive">Order not found.</p>
            </div>
        );
    }

    if (data) {
        return (
            <OrderDetailsCard
                order={data.data}
                revision={revisionsData?.revision}
            />
        );
    }

    return null;
}
