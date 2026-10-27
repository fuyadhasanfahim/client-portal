'use client';

import QuoteDetailsStatus from './QuoteDetailsStatus';
import QuoteDetailsSummary from './QuoteDetailsSummary';
import QuoteDetailsServiceList from './QuoteDetailsServiceList';
import QuoteDetailsPaymentAndDetails from './QuoteDetailsPaymentAndDetails';
import QuoteDetailsInvoice from './QuoteDetailsInvoice';
import getLoggedInUser from '@/utils/getLoggedInUser';
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IQuote } from '@/types/quote.interface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function QuoteDetailsCard({ quote }: { quote: IQuote }) {
    const { user } = getLoggedInUser();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
            <div className="col-span-2 space-y-6">
                <QuoteDetailsStatus status={quote.status} role={user.role} />
                <QuoteDetailsSummary quote={quote} />
                <QuoteDetailsServiceList
                    title={quote.title}
                    images={quote.details?.images}
                    instructions={quote.details?.instructions}
                    downloadLink={quote.details?.downloadLink}
                />
            </div>

            <div className="space-y-6">
                {quote.details?.deliveryLink && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Delivery Link
                            </CardTitle>
                            <CardDescription>
                                You can now download the images from the link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={quote.details?.deliveryLink}>
                                <Button className="w-full">
                                    <Download />
                                    Download Now
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {((user.role === 'user' && quote.status === 'delivered') ||
                    (user.role === 'admin' &&
                        quote.status !== 'delivered')) && (
                    <QuoteDetailsPaymentAndDetails
                        role={user.role}
                        quoteID={quote.quoteID}
                        status={quote.status}
                    />
                )}

                <QuoteDetailsInvoice quote={quote} user={user} />
            </div>
        </div>
    );
}
