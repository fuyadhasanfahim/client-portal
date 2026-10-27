'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import OrderDetails from '@/components/orders/new-order/OrderDetails';
import SelectedServiceLoadingCard from './SelectedServiceLoadingCard';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RootNewOrderDetails({ orderID }: { orderID: string }) {
    const { data, isLoading, isError } = useGetOrderByIDQuery(orderID, {
        skip: !orderID,
    });
    const route = useRouter();

    let content;

    if (isLoading) {
        content = <SelectedServiceLoadingCard />;
    } else if (!isLoading && isError) {
        content = (
            <Card className="max-w-2xl border border-red-300 bg-red-50 text-destructive rounded-xl shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <p className="text-center text-base font-medium">
                        Error fetching draft order.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => route.push('/orders/new-order')}
                        className="border-destructive text-destructive hover:bg-red-100"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    } else if (!isLoading && !isError && data?.data.length === 0) {
        content = (
            <Card className="max-w-2xl">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">No order found.</p>
                </CardContent>
            </Card>
        );
    } else {
        const order = data.data;
        content = (
            <Card className="max-w-2xl border border-muted-foreground/10 bg-card/70 backdrop-blur-xl shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Order Specifications
                    </CardTitle>
                    <CardDescription className="text-muted-foreground/90">
                        Summary of the pricing model and item details for this order.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground/75">
                                Order Item
                            </span>
                            <span className="text-base font-semibold text-foreground">
                                {order.title}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-muted-foreground/5 pt-3">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-muted-foreground/80">
                                    Images Count
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    {order.imagesCount}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-muted-foreground/80">
                                    Rate Model
                                </span>
                                <span className="text-sm font-bold text-foreground capitalize">
                                    {order.pricingType === 'per-image'
                                        ? `$${order.price.toFixed(2)} / image`
                                        : 'Flat Rate'}
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-muted-foreground/5 pt-3 flex justify-between items-center text-lg font-semibold text-foreground">
                            <span>Estimated Total:</span>
                            <span className="text-2xl font-black text-primary">
                                ${order.total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <section className="grid grid-cols-2 gap-6 items-start">
            <OrderDetails orderID={orderID} />
            {content}
        </section>
    );
}
