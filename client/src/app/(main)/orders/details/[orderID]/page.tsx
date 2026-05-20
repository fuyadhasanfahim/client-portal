import { Metadata } from 'next';
import RootOrderDetails from '@/components/orders/order-details/RootOrderDetails';

type OrderDetailsPageProps = {
    params: Promise<{ orderID: string }>;
};

export const metadata: Metadata = {
    title: 'Order Details | Client Portal',
};

export default async function OrderDetailsPage({
    params,
}: OrderDetailsPageProps) {
    const { orderID } = await params;

    return <RootOrderDetails orderID={orderID} />;
}
