import RootNewOrderReview from '@/components/orders/new-order/RootNewOrderReview';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review Order | Client Portal',
};

export default async function NewOrderReviewPage({
    params,
}: {
    params: Promise<{ orderID: string }>;
}) {
    const { orderID } = await params;
    return <RootNewOrderReview orderID={orderID} />;
}
