import { cn } from '@/lib/utils';
import { CircleCheckBig, Loader2 } from 'lucide-react';

export default function QuotePaymentStatus({
    paymentStatus,
}: {
    paymentStatus: string;
}) {
    return (
        <div
            className={cn(
                'capitalize flex items-center gap-2 justify-center',
                paymentStatus === 'paid' && 'text-orange-500 border-orange-500',
                paymentStatus === 'refunded' && 'text-blue-500 border-blue-500',
                paymentStatus === 'pending' &&
                    'text-orange-500 border-orange-500',
                paymentStatus === 'pay-later' &&
                    'text-yellow-500 border-yellow-500'
            )}
        >
            {paymentStatus === 'paid' ? (
                <CircleCheckBig size={16} />
            ) : (
                <Loader2 size={16} />
            )}
            {paymentStatus}
        </div>
    );
}
