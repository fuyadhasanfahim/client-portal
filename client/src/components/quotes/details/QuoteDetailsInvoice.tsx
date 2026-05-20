import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IQuote } from '@/types/quote.interface';
import { IconInvoice } from '@tabler/icons-react';
import Link from 'next/link';

export default function QuoteDetailsInvoice({
    quote,
    user,
}: {
    quote: IQuote;
    user: {
        userID: string;
        name: string;
        email: string;
        role: string;
        image: string;
    };
}) {
    const isUser = user.role === 'User';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Invoice</CardTitle>
                <CardDescription>
                    Generate and view the invoice for this quote
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href={`/quotes/invoice/${quote.quoteID}`}>
                    <Button className="w-full">
                        <IconInvoice />
                        {isUser ? 'Generate My Invoice' : 'Generate Invoice'}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
