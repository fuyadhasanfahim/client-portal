import InvoiceCard from '@/components/orders/invoice/InvoiceCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoice | Client Portal',
};

interface InvoicePageProps {
    orderID: string;
}

export default async function InvoicePage({
    params,
}: {
    params: Promise<InvoicePageProps>;
}) {
    const { orderID } = await params;
    return <InvoiceCard orderID={orderID} />;
}
