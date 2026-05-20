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
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getEffectivePermissions } from '@/utils/getPermissions';

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
            <div className="col-span-2 space-y-6">
                <OrderDetailsStatus status={order.status} role={user.role} />
                <OrderDetailsSummary order={order} />
                <OrderDetailsServiceList
                    backgroundOption={order.details?.backgroundOption}
                    height={order.details?.height}
                    imageResizing={
                        order.details?.imageResizing === true ? 'yes' : 'no'
                    }
                    images={order.details?.images}
                    instructions={order.details?.instructions}
                    backgroundColor={order.details?.backgroundColor}
                    returnFileFormat={order.details?.returnFileFormat}
                    services={order.services}
                    width={order.details?.width}
                    downloadLink={order.details?.downloadLink}
                    deliveryLink={order.details?.deliveryLink}
                />
                <OrderDetailsRevisions revision={revision} />
            </div>

            <div className="space-y-6">
                {order.details?.deliveryLink && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Delivery Link
                            </CardTitle>
                            <CardDescription>
                                You can now download the images from the link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={order.details?.deliveryLink}>
                                <Button className="w-full">
                                    <Download />
                                    Download Now
                                </Button>
                            </Link>
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
    );
}
