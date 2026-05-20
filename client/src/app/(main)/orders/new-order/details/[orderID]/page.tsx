import RootNewOrderDetails from '@/components/orders/new-order/RootNewOrderDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Details | Client Portal',
};

export default async function NewOrderDetailsPage({
    params,
}: {
    params: Promise<{ orderID: string }>;
}) {
    const { orderID } = await params;
    return <RootNewOrderDetails orderID={orderID} />;
}
