'use client';

import { IOrder } from '@/types/order.interface';
import OrderDetailsStatus from './OrderDetailsStatus';
import OrderDetailsSummary from './OrderDetailsSummary';
import OrderDetailsServiceList from './OrderDetailsServiceList';
import OrderDetailsPaymentAndDetails from './OrderDetailsPaymentAndDetails';

export default function OrderDetailsCard({
    order,
    role,
}: {
    order: IOrder;
    role: string;
}) {
    const {
        orderID,
        services,
        images,
        imageResizing,
        width,
        height,
        backgroundOption,
        returnFileFormat,
        instructions,
        status,
        createdAt,
        isPaid,
        paymentId,
        paymentMethod,
        paymentOption,
        supportingFileDownloadLink,
        total,
        deliveryDate,
        downloadLink,
        userID,
    } = order;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
            <div className="col-span-2 space-y-6">
                <OrderDetailsStatus status={status} role={role} />
                <OrderDetailsSummary
                    createdAt={createdAt}
                    deliveryDate={deliveryDate}
                    isPaid={isPaid}
                    orderID={orderID}
                    status={status}
                    userID={userID}
                />
                <OrderDetailsServiceList
                    backgroundOption={backgroundOption}
                    height={height}
                    imageResizing={imageResizing}
                    images={images}
                    instructions={instructions}
                    returnFileFormat={returnFileFormat}
                    services={services}
                    width={width}
                    supportingFileDownloadLink={supportingFileDownloadLink}
                    downloadLink={downloadLink}
                />
            </div>

            <div className="space-y-6">
                <OrderDetailsPaymentAndDetails
                    paymentId={paymentId}
                    paymentMethod={paymentMethod}
                    paymentOption={paymentOption}
                    status={status}
                    total={total}
                    role={role}
                    orderID={orderID}
                    userID={userID}
                />
            </div>
        </div>
    );
}
