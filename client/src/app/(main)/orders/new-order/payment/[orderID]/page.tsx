import RootNewOrderPayment from '@/components/orders/new-order/RootNewOrderPayment';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review Order | Client Portal',
};

export default async function NewOrderPaymentPage({
    params,
}: {
    params: Promise<{ orderID: string }>;
}) {
    const { orderID } = await params;

    return <RootNewOrderPayment orderID={orderID} />;
}
