'use client';

import QuoteDetailsCard from './QuoteDetailsCard';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useGetQuoteByIDQuery } from '@/redux/features/quotes/quoteApi';

export default function RootQuoteDetails({ quoteID }: { quoteID: string }) {
    const { user } = useLoggedInUser();

    const { data, isLoading, isError, refetch } = useGetQuoteByIDQuery(
        quoteID,
        {
            skip: !quoteID,
        }
    );

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
                <p className="text-destructive">Quote not found.</p>
            </div>
        );
    }

    if (data) {
        return <QuoteDetailsCard quote={data.data} />;
    }

    return null;
}
