import RootNewQuoteDetails from '@/components/quotes/new-quote/details/RootQuoteDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quote Details | Client Portal',
};

export default async function NewQuoteDetails({
    params,
}: {
    params: Promise<{ quoteID: string }>;
}) {
    const { quoteID } = await params;
    return <RootNewQuoteDetails quoteID={quoteID} />;
}
