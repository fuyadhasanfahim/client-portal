'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ApiError from '@/components/shared/ApiError';
import { useNewOrderCheckoutMutation } from '@/redux/features/stripe/stripeApi';
import { Loader2, CreditCard, Clock } from 'lucide-react';
import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PayPalCheckoutButton from './PayPalCheckoutButton';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { useNewPaymentMutation } from '@/redux/features/payments/paymentApi';
import useLoggedInUser from '@/utils/getLoggedInUser';

const PAYMENT_OPTIONS = [
    {
        value: 'stripe',
        title: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, etc.',
        icon: <CreditCard className="w-5 h-5" />,
    },
    {
        value: 'paypal',
        title: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: <CreditCard className="w-5 h-5" />,
    },
    {
        value: 'pay-later',
        title: 'Pay Later',
        description: 'Complete payment at a later time',
        icon: <Clock className="w-5 h-5" />,
    },
] as const;

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type PaymentOption = (typeof PAYMENT_OPTIONS)[number]['value'];

export default function RootNewOrderPayment({ orderID }: { orderID: string }) {
    const { user } = useLoggedInUser();
    const { userID } = user;
    const router = useRouter();

    const { data: orderData, isLoading: isOrderLoading } =
        useGetOrderByIDQuery(orderID);
    const [newOrderCheckout] = useNewOrderCheckoutMutation();
    const [newPayment] = useNewPaymentMutation();

    const [paymentOption, setPaymentOption] = useState<PaymentOption | ''>('');
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingPayLater, setIsProcessingPayLater] = useState(false);

    useEffect(() => {
        if (!isOrderLoading && orderData?.data.paymentStatus === 'paid') {
            toast.error('This order has already been paid. Redirecting...');
            const timer = setTimeout(() => router.push('/orders'), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOrderLoading, orderData?.data.paymentStatus, router]);

    useEffect(() => {
        const fetchStripeClientSecret = async () => {
            if (paymentOption !== 'stripe') return;

            setIsLoading(true);
            try {
                const res = await newOrderCheckout({
                    userID,
                    orderID,
                    paymentOption: 'pay-now',
                    paymentMethod: 'card-payment',
                }).unwrap();

                if (res?.success) {
                    setClientSecret(res.data);
                }
            } catch (err) {
                console.log(err);
                ApiError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStripeClientSecret();
    }, [paymentOption, newOrderCheckout, orderID, userID]);

    const handlePayLater = async () => {
        setIsProcessingPayLater(true);
        try {
            const res = await newPayment({
                userID,
                orderID,
                paymentOption: 'pay-later',
                paymentMethod: 'pending',
                status: 'pending',
                amount: !isOrderLoading && orderData?.data.total,
            }).unwrap();

            if (res?.success) {
                toast.success('Order created successfully! You can pay later.');
                router.push('/orders');
            }
        } catch (err) {
            console.log(err);
            ApiError(err);
        } finally {
            setIsProcessingPayLater(false);
        }
    };

    const renderPaymentContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Preparing payment form...</p>
                </div>
            );
        }

        if (paymentOption === 'stripe' && clientSecret) {
            return (
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                >
                    <EmbeddedCheckout className="w-full" />
                </EmbeddedCheckoutProvider>
            );
        }

        if (paymentOption === 'paypal' && orderData?.data) {
            return (
                <PayPalScriptProvider
                    options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                        currency: user?.currency ?? 'USD',
                        intent: 'capture',
                        components: 'buttons',
                    }}
                >
                    <PayPalCheckoutButton order={orderData.data} />
                </PayPalScriptProvider>
            );
        }

        if (paymentOption === 'pay-later') {
            return (
                <div className="text-center p-6 space-y-6">
                    <div className="space-y-2">
                        <Clock className="w-10 h-10 mx-auto text-primary" />
                        <p className="text-lg font-semibold">
                            Pay Later Option
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You can complete payment at a later time. Your order
                            will be created as pending.
                        </p>
                    </div>
                    <Button
                        onClick={handlePayLater}
                        disabled={isProcessingPayLater}
                        className="w-full"
                    >
                        {isProcessingPayLater ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Finish Order Creation'
                        )}
                    </Button>
                </div>
            );
        }

        return (
            <div className="text-center p-6 text-muted-foreground space-y-2">
                <CreditCard className="w-10 h-10 mx-auto" />
                <p className="text-lg font-semibold">
                    Select a payment method to begin
                </p>
                <p className="text-sm">
                    You&apos;ll be guided through a secure process
                </p>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-2xl">Payment Method</CardTitle>
                    <CardDescription>
                        Choose how you want to pay for your order
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={paymentOption}
                        onValueChange={(val) =>
                            setPaymentOption(val as PaymentOption)
                        }
                        className="grid gap-4 sm:grid-cols-2"
                    >
                        {PAYMENT_OPTIONS.map(
                            ({ value, title, description, icon }) => (
                                <Card
                                    key={value}
                                    className={cn(
                                        'border-2 transition-all rounded-xl p-4 cursor-pointer',
                                        paymentOption === value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                    )}
                                    onClick={() => setPaymentOption(value)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-md">
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-base">
                                                {title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        )}
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {!paymentOption
                            ? 'Payment Details'
                            : paymentOption === 'stripe'
                            ? 'Card Payment'
                            : paymentOption === 'paypal'
                            ? 'PayPal Payment'
                            : 'Pay Later'}
                    </CardTitle>
                    <CardDescription>
                        {paymentOption
                            ? paymentOption === 'pay-later'
                                ? 'Complete your order without immediate payment'
                                : 'Complete your payment securely'
                            : 'Select a payment method to continue'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center min-h-[300px]">
                    {renderPaymentContent()}
                </CardContent>
            </Card>
        </div>
    );
}
