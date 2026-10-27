import { cn } from '@/lib/utils';
import { CircleCheckBig, Loader2, Clock, Ban } from 'lucide-react';

export default function OrderPaymentStatus({
    paymentStatus,
}: {
    paymentStatus: string;
}) {
    return (
        <div
            className={cn(
                'capitalize flex items-center gap-2 justify-center font-medium',
                paymentStatus === 'paid' && 'text-emerald-600',
                paymentStatus === 'refunded' && 'text-blue-600',
                paymentStatus === 'pending' && 'text-amber-500',
                paymentStatus === 'pay-later' && 'text-yellow-600',
                paymentStatus === 'failed' && 'text-rose-600',
                paymentStatus === 'payment-failed' && 'text-rose-600'
            )}
        >
            {paymentStatus === 'paid' && <CircleCheckBig size={16} className="text-emerald-500" />}
            {paymentStatus === 'pending' && <Loader2 size={16} className="animate-spin text-amber-500" />}
            {paymentStatus === 'pay-later' && <Clock size={16} className="text-yellow-500" />}
            {paymentStatus === 'refunded' && <Clock size={16} className="text-blue-500" />}
            {(paymentStatus === 'failed' || paymentStatus === 'payment-failed') && <Ban size={16} className="text-rose-500" />}
            {paymentStatus}
        </div>
    );
}
