'use client';

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ApiError from '@/components/shared/ApiError';
import { Loader2 } from 'lucide-react';
import { IOrder } from '@/types/order.interface';

export default function PayPalCheckoutButton({ order }: { order: IOrder }) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [{ isPending }] = usePayPalScriptReducer();

    const createPayPalOrder = async (): Promise<string> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/paypal/create-order`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderID: order.orderID,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to create PayPal order'
                );
            }

            const { paypalOrderID } = await response.json();
            if (!paypalOrderID) {
                throw new Error('No order ID returned from PayPal');
            }

            return paypalOrderID;
        } catch (err) {
            console.error('Failed to create PayPal order:', err);
            toast.error('Failed to create PayPal order. Please try again.');
            throw err;
        }
    };

    const onApprove = async (data: { orderID: string }): Promise<void> => {
        setIsProcessing(true);
        try {
            const captureResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/paypal/${data.orderID}/capture`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!captureResponse.ok) {
                const errorData = await captureResponse.json();
                throw new Error(errorData.error || 'Failed to capture payment');
            }

            const captureData = await captureResponse.json();

            if (captureData.status === 'COMPLETED') {
                toast.success('Payment completed successfully!');
                router.push('/orders');
            }
        } catch (err) {
            ApiError(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isPending || isProcessing) {
        return (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>
                    {isPending ? 'Loading PayPal...' : 'Processing payment...'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <PayPalButtons
                style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal',
                    height: 48,
                }}
                createOrder={createPayPalOrder}
                onApprove={onApprove}
                onError={(err) => {
                    console.error('PayPal Error:', err);
                    toast.error(`Payment failed: ${err.message}`);
                }}
                onCancel={() => {
                    toast('Payment canceled', { icon: 'ℹ️' });
                }}
            />
        </div>
    );
}
