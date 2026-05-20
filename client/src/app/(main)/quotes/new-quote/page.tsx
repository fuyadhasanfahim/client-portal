import RootNewQuote from '@/components/quotes/new-quote/RootNewQuote';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Quote | Client Portal',
    description: 'Create a new order',
};

export default function NewQuote() {
    return <RootNewQuote />;
}
