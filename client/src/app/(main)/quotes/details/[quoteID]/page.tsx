import RootQuoteDetails from '@/components/quotes/details/RootQuoteDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quote Details | Client Portal',
    description: 'Create a new order',
};

export default async function QuotesPage({
    params,
}: {
    params: Promise<{ quoteID: string }>;
}) {
    const { quoteID } = await params;
    return <RootQuoteDetails quoteID={quoteID} />;
}
