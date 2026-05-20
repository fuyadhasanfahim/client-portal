'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IOrder } from '@/types/order.interface';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import Link from 'next/link';

interface OrderDetailsServiceListProps {
    order: IOrder;
}

export default function OrderDetailsServiceList({
    order,
}: OrderDetailsServiceListProps) {
    return (
        <Card className="border border-border/50 bg-background/50 backdrop-blur-sm shadow-md">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2 font-semibold">
                    <IconBriefcaseFilled
                        size={22}
                        className="text-primary"
                    />
                    Order Specifications
                </CardTitle>
                <CardDescription>Details of the request and pricing parameters</CardDescription>
            </CardHeader>

            <CardContent className="py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Title</span>
                        <p className="text-base font-medium">{order.title}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing Type</span>
                        <p className="text-base capitalize font-medium">{order.pricingType === 'per-image' ? 'Per Image' : 'Fixed Total'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</span>
                        <p className="text-base font-medium">${order.price?.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Images Count</span>
                        <p className="text-base font-medium">{order.imagesCount} images</p>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Assets / Source Files</span>
                    {order.details?.downloadLink ? (
                        <Link
                            href={order.details.downloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
                        >
                            View / Download Source Files
                        </Link>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No link provided</p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-4 bg-muted/20">
                <div className="w-full">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Instructions / Notes</span>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                        {order.details?.instructions || 'No special instructions provided.'}
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
}
