'use client';

import { IOrder } from '@/types/order.interface';
import OrderDetailsStatus from './OrderDetailsStatus';
import OrderDetailsSummary from './OrderDetailsSummary';
import OrderDetailsServiceList from './OrderDetailsServiceList';
import OrderDetailsPaymentAndDetails from './OrderDetailsPaymentAndDetails';
import OrderDetailsInvoice from './OrderDetailsInvoice';
import getLoggedInUser from '@/utils/getLoggedInUser';
import React from 'react';
import OrderDetailsRevisions from './OrderDetailsRevisions';
import { IRevision } from '@/types/revision.interface';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getEffectivePermissions } from '@/utils/getPermissions';
import { getSafeUrl } from '@/utils/getSafeUrl';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailsCard({
    order,
    revision,
}: {
    order: IOrder;
    revision: IRevision;
}) {
    const { user, isLoading } = getLoggedInUser();
    const userData = !isLoading && user;
    const perms = getEffectivePermissions(userData);

    const canViewPrices = perms?.viewPrices;
    const canExportInvoices = perms?.exportInvoices;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Page Header / Breadcrumb */}
            <div className="space-y-2">
                <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Link
                        href="/orders"
                        className="hover:text-foreground transition-colors"
                    >
                        Orders
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                        {order.title || `Order #${order.orderID}`}
                    </span>
                </nav>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
                        {order.title}
                    </h1>
                    <Badge variant="outline" className="text-xs font-mono w-fit px-2 py-0.5 text-muted-foreground">
                        #{order.orderID}
                    </Badge>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6 min-w-0">
                    <OrderDetailsStatus status={order.status} role={user.role} />
                    <OrderDetailsSummary order={order} />
                    <OrderDetailsServiceList order={order} />
                    <OrderDetailsRevisions orderID={order.orderID} revision={revision} />
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6 min-w-0">
                    {order.details?.deliveryLink && (
                        <Card className="border border-border shadow-sm bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Delivery Link
                                </CardTitle>
                                <CardDescription>
                                    You can now download the images from the link.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <a
                                        href={getSafeUrl(order.details.deliveryLink)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Now
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    <OrderDetailsPaymentAndDetails
                        orderUser={order.user}
                        isTeamMember={userData?.isTeamMember}
                        paymentId={order.paymentID}
                        status={order.status}
                        total={
                            canViewPrices
                                ? order.total?.toFixed(2)
                                : 'No Permission'
                        }
                        role={user.role}
                        userID={user.userID}
                        paymentStatus={order.paymentStatus}
                        orderID={order.orderID}
                        isRevision={order.isRevision}
                        deliveryLink={order.details?.deliveryLink}
                    />

                    {canExportInvoices && (
                        <OrderDetailsInvoice order={order} user={user} />
                    )}
                </div>
            </div>
        </div>
    );
}
