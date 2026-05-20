'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderPaymentCompletePage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            setIsValid(true);
        }
        setLoading(false);
    }, [sessionId]);

    return (
        <div className="flex flex-col justify-center items-center bg-white px-6 py-8 md:py-16 lg:py-28 text-center">
            {loading ? (
                <div className="text-gray-500 text-lg">
                    Processing your order...
                </div>
            ) : isValid ? (
                <>
                    <h1 className="text-3xl font-bold text-orange-600 mb-4">
                        ✅ Order Placed Successfully!
                    </h1>
                    <p className="text-lg text-gray-700 max-w-xl">
                        Thank you! Your order has been received. We will review
                        it and send you updates by email as your order is
                        confirmed and processed.
                    </p>
                    <Link href="/orders" className="mt-6">
                        <Button>Go to Orders</Button>
                    </Link>
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-semibold text-red-600 mb-4">
                        ⚠ Invalid or missing session ID
                    </h1>
                    <p className="text-gray-600">
                        Please try again or contact support if you believe this
                        is a mistake.
                    </p>
                </>
            )}
        </div>
    );
}
