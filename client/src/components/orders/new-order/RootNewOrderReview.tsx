'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import { AlertTriangle, InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NewOrderPricingCard from './NewOrderPricingCard';

export default function RootNewOrderReview({
    orderID,
}: {
    orderID: string;
}) {
    const { data, isLoading, isError } = useGetOrderByIDQuery(orderID, {
        skip: !orderID,
    });
    const router = useRouter();

    let content;

    if (isLoading) {
        content = (
            <Card className="animate-pulse">
                <CardHeader className="space-y-2">
                    <CardTitle>
                        <Skeleton className="h-6 w-1/3 rounded-md" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-2/3 rounded" />
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-1/4 rounded" />
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    } else if (!isLoading && isError) {
        content = (
            <Card className="border-red-300 bg-red-50 text-destructive">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <p className="text-center text-base font-medium">
                        Error fetching draft order.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/orders/new-order')}
                        className="border-destructive text-destructive hover:bg-red-100"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!isLoading && !isError && !data) {
        content = (
            <Card>
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">No draft order found.</p>
                </CardContent>
            </Card>
        );
    }

    if (!isLoading && !isError && data.data) {
        content = <NewOrderPricingCard order={data.data} />;
    }

    return (
        <div className="grid grid-cols-3 items-start gap-10">
            <div className="col-span-2">{content}</div>
            <Card className="text-destructive col-span-1">
                <CardHeader className="flex items-center gap-2">
                    <InfoIcon size={24} />
                    <CardTitle className="text-2xl">Important Notice</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        <span className="font-semibold">Note:</span> The final
                        price may be adjusted after our team reviews your images
                        for complexity. We’ll notify you before any changes are
                        made.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
