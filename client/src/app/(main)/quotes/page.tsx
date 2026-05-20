import RootQuotes from '@/components/quotes/RootQuotes';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quotes | Client Portal',
    description: 'Create a new order',
};

export default function QuotesPage() {
    return <RootQuotes />;
}
