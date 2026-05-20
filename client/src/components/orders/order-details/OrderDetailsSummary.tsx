'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { FileText, Check, AlertCircle, Calendar, Hash, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { statusData } from '@/data/orders';
import { cn } from '@/lib/utils';
import { IOrder, IOrderUser } from '@/types/order.interface';

export default function OrderDetailsSummary({ order }: { order: IOrder }) {
    const user = order.user as IOrderUser;
    const item = statusData.find((item) => item.value === order.status);

    return (
        <Card className="border border-border shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2 font-semibold">
                            <FileText className="w-5 h-5 text-primary" />
                            Order Summary
                        </CardTitle>
                        <CardDescription>
                            Complete details and status information for this request
                        </CardDescription>
                    </div>
                    {item && (
                        <div
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all shadow-sm',
                                item.bg,
                                item.text,
                                item.border
                            )}
                        >
                            {item.icon && <item.icon size={13} />}
                            <span className="capitalize">{order.status.replace('_', ' ')}</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="py-6 space-y-6">
                {/* Client / Ordered by Box */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border/50">
                    <Avatar className="h-10 w-10 border border-border bg-background">
                        <AvatarImage
                            src={user?.image}
                            alt={`${user?.name}'s profile image`}
                        />
                        <AvatarFallback className="font-semibold text-xs text-muted-foreground bg-muted">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Ordered By
                        </span>
                        <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    {/* Order ID */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                            Order ID
                        </span>
                        <p className="font-medium text-foreground pl-5">#{order.orderID}</p>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                            Payment Status
                        </span>
                        <div className="pl-5">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'font-medium text-xs rounded-full gap-1 px-2.5 py-0.5',
                                    order.paymentStatus === 'paid'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
                                )}
                            >
                                {order.paymentStatus === 'paid' ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <AlertCircle className="w-3 h-3" />
                                )}
                                <span className="capitalize">{order.paymentStatus || 'Pending'}</span>
                            </Badge>
                        </div>
                    </div>

                    <Separator className="sm:col-span-2 bg-border/50" />

                    {/* Order Date */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            Order Date
                        </span>
                        <p className="font-medium text-foreground pl-5">
                            {order.createdAt
                                ? format(new Date(order.createdAt), 'PPPp')
                                : 'N/A'}
                        </p>
                    </div>

                    {/* Delivery Date */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            Delivery Date
                        </span>
                        <p className="font-medium text-foreground pl-5">
                            {order.details?.deliveryDate
                                ? format(new Date(order.details.deliveryDate), 'PPP')
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
