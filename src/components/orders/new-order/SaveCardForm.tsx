'use client';

import {
    useStripe,
    useElements,
    PaymentElement,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useNewPaymentMutation } from '@/redux/features/payments/paymentApi';
import { Loader, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SaveCardForm({
    userID,
    orderID,
    customerID,
}: {
    userID: string;
    orderID: string;
    customerID: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const [newPayment] = useNewPaymentMutation();

    const handleSaveCard = async () => {
        if (!stripe || !elements) {
            toast.error('Stripe not initialized');
            return;
        }

        setIsProcessing(true);

        try {
            // First validate the card details
            const { error: validationError } = await elements.submit();
            if (validationError) {
                throw validationError;
            }

            // Then confirm the SetupIntent
            const { error, setupIntent } = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/orders/order-payment/complete?order_id=${orderID}`,
                },
                redirect: 'if_required',
            });

            if (error) {
                throw error;
            }

            if (!setupIntent) {
                throw new Error('No setup intent returned from Stripe');
            }

            // Handle successful setup
            const res = await newPayment({
                userID,
                orderID,
                paymentOption: 'pay-later',
                paymentIntentID: setupIntent.id,
                customerID: customerID,
                status: setupIntent.status,
            });

            if ('error' in res) {
                throw res.error;
            }

            router.push('/orders');
        } catch (err) {
            toast.error(
                (err instanceof Error && err.message) || 'Payment failed'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <PaymentElement />
            <Button
                onClick={handleSaveCard}
                className="w-full"
                disabled={!stripe || isProcessing}
            >
                {isProcessing ? (
                    <Loader className="animate-spin mr-2" size={18} />
                ) : (
                    <Save className="mr-2" size={18} />
                )}
                {isProcessing ? 'Processing...' : 'Save Card & Continue'}
            </Button>
        </div>
    );
}
