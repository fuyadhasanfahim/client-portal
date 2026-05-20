import InvoiceCard from '@/components/quotes/invoice/InvoiceCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quote Invoice | Client Portal',
    description: 'Create a new order',
};

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ quoteID: string }>;
}) {
    const { quoteID } = await params;
    return <InvoiceCard quoteID={quoteID} />;
}
