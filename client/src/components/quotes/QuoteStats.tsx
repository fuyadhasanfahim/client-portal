import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import {
    IconPackageOff,
    IconCheckbox,
    IconClock,
    IconPackage,
} from '@tabler/icons-react';
import { IQuote } from '@/types/quote.interface';

export default function QuoteStats({
    quotes,
    isLoading,
}: {
    quotes: IQuote[];
    isLoading: boolean;
}) {
    const stats = [
        {
            title: 'Active Quotes',
            value:
                !isLoading &&
                quotes.filter((quote) =>
                    ['in-progress', 'in-revision', 'delivered'].includes(
                        quote.status
                    )
                ).length,
            icon: IconPackage,
            color: 'from-sky-500 to-blue-600',
            change: '+12%',
        },
        {
            title: 'Completed Quotes',
            value:
                !isLoading &&
                quotes.filter((quote) => ['completed'].includes(quote.status))
                    .length,
            icon: IconClock,
            color: 'from-orange-500 to-teal-600',
            change: '+8%',
        },
        {
            title: 'Pending Quotes',
            value:
                !isLoading &&
                quotes.filter((quote) => ['pending'].includes(quote.status))
                    .length,
            icon: IconCheckbox,
            color: 'from-yellow-500 to-orange-500',
            change: '+15%',
        },
        {
            title: 'Canceled Quotes',
            value:
                !isLoading &&
                quotes.filter((quote) => ['canceled'].includes(quote.status))
                    .length,
            icon: IconPackageOff,
            color: 'from-orange-500 to-red-600',
            change: '+23%',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
                <Card key={i}>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {s.title}
                            </p>
                            {isLoading ? (
                                <Skeleton className="w-8 h-6" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">
                                    {s.value}
                                </p>
                            )}
                        </div>
                        <div
                            className={cn(
                                'p-3 rounded-xl shadow-inner bg-gradient-to-r text-white',
                                s.color
                            )}
                        >
                            <s.icon size={28} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
