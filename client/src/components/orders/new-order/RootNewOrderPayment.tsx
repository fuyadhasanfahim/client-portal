'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ApiError from '@/components/shared/ApiError';
import { useNewOrderCheckoutMutation } from '@/redux/features/stripe/stripeApi';
import { 
    Loader2, 
    CreditCard, 
    Clock, 
    Lock, 
    ShieldCheck, 
    Sparkles, 
    ImageIcon, 
    DollarSign, 
    Calendar,
    ArrowRight,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import { useGetPendingOrderByIDQuery, useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PayPalCheckoutButton from './PayPalCheckoutButton';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { useNewPaymentMutation } from '@/redux/features/payments/paymentApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import Link from 'next/link';

// Custom Dual-Tone PayPal SVG
const PayPalIcon = () => (
    <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M20.007 6.444c.032-.163.025-.325-.018-.466a.82.82 0 00-.289-.413 1.34 1.34 0 00-.518-.216c-.229-.044-.543-.066-.94-.066H9.728c-.461 0-.853.308-.956.758L6.03 18.006c-.053.232.125.443.362.443h3.585l.896-3.924a.972.972 0 01.954-.754h2.158c2.97 0 5.253-1.22 5.966-4.34.33-1.442.217-2.482-.362-3.123-.332-.367-.84-.664-1.503-.84l-.08-.024z"
            fill="#0284c7"
        />
        <path
            d="M17.472 9.428c.33-1.442.217-2.482-.362-3.123-.332-.367-.84-.664-1.503-.84-.287.97-.935 3.864-.99 4.108-.052.233-.26.39-.499.39H12.06l-.895 3.925c-.027.116.06.222.18.222h1.614c2.97 0 5.253-1.22 5.966-4.342c.162-.707.217-1.344.172-1.928l-.053.228-.01.042z"
            fill="#38bdf8"
        />
        <path
            d="M10.875 13.926l.895-3.925h-2.06l-.895 3.925c-.052.233.125.444.362.444h1.336c.238 0 .446-.157.499-.39-.02.09-.03.118-.037.146z"
            fill="#0369a1"
        />
    </svg>
);

const PAYMENT_OPTIONS = [
    {
        value: 'stripe',
        title: 'Credit/Debit Card',
        description: 'Pay securely with Visa, Mastercard, etc.',
        icon: <CreditCard className="w-5 h-5 text-primary" />,
        badge: 'Secure',
        iconBg: 'bg-primary/10 dark:bg-primary/20',
    },
    {
        value: 'paypal',
        title: 'PayPal',
        description: 'Pay instantly with your PayPal account',
        icon: <PayPalIcon />,
        badge: 'Instant',
        iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    },
    {
        value: 'pay-later',
        title: 'Pay Later',
        description: 'Complete order now, pay at a later time',
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        badge: 'Flexible',
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    },
] as const;

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type PaymentOption = (typeof PAYMENT_OPTIONS)[number]['value'];

function formatCurrency(value: number) {
    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(dateInput: any) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// --- HIGH FIDELITY SKELETON LOADERS ---
function CardFormSkeleton() {
    return (
        <div className="w-full max-w-md mx-auto py-6 space-y-6 animate-pulse">
            <div className="text-center space-y-2 pb-2">
                <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
                <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
            </div>
            
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-10 bg-muted rounded-xl w-full" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <div className="h-3 bg-muted rounded w-16" />
                        <div className="h-10 bg-muted rounded-xl w-full" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-3 bg-muted rounded w-12" />
                        <div className="h-10 bg-muted rounded-xl w-full" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="h-3 bg-muted rounded w-28" />
                    <div className="h-10 bg-muted rounded-xl w-full" />
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Price Guard Math Protections Active</span>
            </div>
        </div>
    );
}

function CheckoutSkeleton() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-muted-foreground/5">
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-8 bg-muted rounded w-48" />
                </div>
                <div className="h-6 bg-muted rounded w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-6">
                    <div className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl p-6 rounded-2xl space-y-4">
                        <div className="h-6 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="grid gap-4 sm:grid-cols-3 pt-2">
                            <div className="h-28 bg-muted rounded-2xl" />
                            <div className="h-28 bg-muted rounded-2xl" />
                            <div className="h-28 bg-muted rounded-2xl" />
                        </div>
                    </div>

                    <div className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl p-6 rounded-2xl h-[280px] flex items-center justify-center">
                        <div className="space-y-3 w-full max-w-sm">
                            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
                            <div className="h-10 bg-muted rounded-xl w-full" />
                            <div className="h-10 bg-muted rounded-xl w-5/6 mx-auto" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <div className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl p-6 rounded-2xl space-y-6">
                        <div className="h-6 bg-muted rounded w-1/2" />
                        <div className="space-y-3 pt-2">
                            <div className="h-4 bg-muted rounded w-2/3" />
                            <div className="h-4 bg-muted rounded w-5/6" />
                            <div className="h-20 bg-muted/40 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RootNewOrderPayment({ orderID }: { orderID: string }) {
    const { user } = useLoggedInUser();
    const { userID } = user;
    const router = useRouter();

    const isPending = orderID.startsWith('PO');
    const { data: pendingData, isLoading: isPendingLoading } =
        useGetPendingOrderByIDQuery(orderID, { skip: !isPending });
    const { data: realData, isLoading: isRealLoading } =
        useGetOrderByIDQuery(orderID, { skip: isPending });

    const orderData = isPending ? pendingData : realData;
    const isOrderLoading = isPending ? isPendingLoading : isRealLoading;

    const [newOrderCheckout] = useNewOrderCheckoutMutation();
    const [newPayment] = useNewPaymentMutation();

    const [paymentOption, setPaymentOption] = useState<PaymentOption | ''>('');
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingPayLater, setIsProcessingPayLater] = useState(false);

    // Pay Later Terms Checklist state
    const [checkedTerms, setCheckedTerms] = useState({
        understandReview: false,
        agreeSettle: false,
        confirmAssets: false
    });

    useEffect(() => {
        const fetchStripeClientSecret = async () => {
            if (paymentOption !== 'stripe') return;

            setIsLoading(true);
            try {
                const res = await newOrderCheckout({
                    userID,
                    pendingOrderID: isPending ? orderID : undefined,
                    orderID: !isPending ? orderID : undefined,
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
    }, [paymentOption, newOrderCheckout, orderID, userID, isPending]);

    const handlePayLater = async () => {
        setIsProcessingPayLater(true);
        try {
            const res = await newPayment({
                userID,
                orderID, // this is the pendingOrderID
                paymentOption: 'pay-later',
                paymentMethodID: 'pending',
                status: 'pending',
                amount: !isOrderLoading && orderData?.data?.total,
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
            return <CardFormSkeleton />;
        }

        if (paymentOption === 'stripe') {
            if (clientSecret) {
                return (
                    <div className="w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                        <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <EmbeddedCheckout className="w-full" />
                        </EmbeddedCheckoutProvider>
                    </div>
                );
            }
            return <CardFormSkeleton />;
        }

        if (paymentOption === 'paypal' && orderData?.data) {
            return (
                <div className="w-full max-w-md mx-auto py-6 space-y-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center space-y-1 pb-2">
                        <p className="text-sm font-semibold text-foreground">Pay with PayPal</p>
                        <p className="text-xs text-muted-foreground">Log in to your PayPal account to finalize payment</p>
                    </div>
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
                </div>
            );
        }

        if (paymentOption === 'pay-later') {
            const allChecked = checkedTerms.understandReview && checkedTerms.agreeSettle && checkedTerms.confirmAssets;

            return (
                <div className="w-full max-w-md mx-auto py-4 space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Clock className="w-6 h-6 animate-bounce" />
                    </div>
                    
                    <div className="text-center space-y-1">
                        <p className="text-lg font-bold text-foreground">Pay Later Commitment</p>
                        <p className="text-xs text-muted-foreground">
                            Please review and confirm each checklist item to unlock checkout creation.
                        </p>
                    </div>

                    {/* Interactive B2B Checklist */}
                    <div className="space-y-3 bg-muted/40 p-5 rounded-2xl border border-muted-foreground/10 text-left">
                        {/* Header with Confirm All */}
                        <div className="flex justify-between items-center pb-2 border-b border-muted-foreground/5 mb-3">
                            <span className="text-[10px] uppercase font-extrabold text-muted-foreground/80 tracking-wider">
                                Required Actions
                            </span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                type="button"
                                onClick={() => setCheckedTerms({
                                    understandReview: true,
                                    agreeSettle: true,
                                    confirmAssets: true
                                })}
                                className="text-xs h-7 px-2.5 font-bold text-primary hover:text-primary hover:bg-primary/5 flex items-center gap-1.5 rounded-lg transition-all"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Confirm All
                            </Button>
                        </div>

                        {/* Checklist Item 1 */}
                        <div 
                            onClick={() => setCheckedTerms(prev => ({ ...prev, understandReview: !prev.understandReview }))}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 select-none",
                                checkedTerms.understandReview 
                                    ? "bg-primary/5 border-primary/30 text-foreground" 
                                    : "bg-background/40 border-muted hover:border-primary/40"
                            )}
                        >
                            <Checkbox 
                                id="understandReview"
                                checked={checkedTerms.understandReview}
                                onCheckedChange={(checked) => setCheckedTerms(prev => ({ ...prev, understandReview: !!checked }))}
                                className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold leading-normal">Acknowledge Processing Flow</p>
                                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                                    I understand work starts once order details are verified.
                                </p>
                            </div>
                        </div>

                        {/* Checklist Item 2 */}
                        <div 
                            onClick={() => setCheckedTerms(prev => ({ ...prev, agreeSettle: !prev.agreeSettle }))}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 select-none",
                                checkedTerms.agreeSettle 
                                    ? "bg-primary/5 border-primary/30 text-foreground" 
                                    : "bg-background/40 border-muted hover:border-primary/40"
                            )}
                        >
                            <Checkbox 
                                id="agreeSettle"
                                checked={checkedTerms.agreeSettle}
                                onCheckedChange={(checked) => setCheckedTerms(prev => ({ ...prev, agreeSettle: !!checked }))}
                                className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold leading-normal">Commit to Pay Balance Later</p>
                                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                                    I agree to settle the total balance of <span className="font-bold text-primary">{orderData?.data ? formatCurrency(orderData.data.total) : ''}</span> later.
                                </p>
                            </div>
                        </div>

                        {/* Checklist Item 3 */}
                        <div 
                            onClick={() => setCheckedTerms(prev => ({ ...prev, confirmAssets: !prev.confirmAssets }))}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 select-none",
                                checkedTerms.confirmAssets 
                                    ? "bg-primary/5 border-primary/30 text-foreground" 
                                    : "bg-background/40 border-muted hover:border-primary/40"
                            )}
                        >
                            <Checkbox 
                                id="confirmAssets"
                                checked={checkedTerms.confirmAssets}
                                onCheckedChange={(checked) => setCheckedTerms(prev => ({ ...prev, confirmAssets: !!checked }))}
                                className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold leading-normal">Confirm Upload Accuracy</p>
                                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                                    I verify that all images and project instructions are correct.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handlePayLater}
                        disabled={isProcessingPayLater || !allChecked}
                        className={cn(
                            "w-full text-white font-bold h-11 shadow-md transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-2",
                            allChecked 
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                                : "bg-muted text-muted-foreground border border-muted-foreground/10 cursor-not-allowed"
                        )}
                    >
                        {isProcessingPayLater ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing Secure Transaction...
                            </>
                        ) : (
                            <>
                                Finish & Create Order
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            );
        }

        return (
            <div className="text-center py-16 px-6 text-muted-foreground/80 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/70">
                    <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                    <p className="text-base font-bold text-foreground">
                        Select a payment method above
                    </p>
                    <p className="text-xs text-muted-foreground leading-normal">
                        Select a billing option on the left. Your payment will be processed securely using bank-grade 256-bit encryption.
                    </p>
                </div>
            </div>
        );
    };

    const renderOrderSummary = () => {
        if (isOrderLoading) {
            return (
                <div className="space-y-4 animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3" />
                    <div className="h-10 bg-muted rounded w-full" />
                    <div className="space-y-2 pt-4">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                </div>
            );
        }

        if (!orderData?.data) {
            return (
                <div className="text-center py-6 text-destructive">
                    Could not load order details.
                </div>
            );
        }

        const order = orderData.data;

        return (
            <div className="space-y-6 pt-1">
                {/* Product/Service details */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                            Service / Order
                        </span>
                        <span className="text-base font-bold text-foreground flex items-center gap-1.5 leading-snug">
                            <Sparkles className="w-4 h-4 text-primary shrink-0" />
                            {order.title}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-muted-foreground/5 pt-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5 text-primary/70" />
                                Images
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {order.imagesCount} photo{order.imagesCount !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-primary/70" />
                                Rate Model
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {order.pricingType === 'per-image'
                                    ? `${formatCurrency(order.price)} / img`
                                    : 'Flat Rate'}
                            </span>
                        </div>
                    </div>

                    {order.details?.deliveryDate && (
                        <div className="flex flex-col gap-1 border-t border-muted-foreground/5 pt-4">
                            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                Target Delivery
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {formatDate(order.details.deliveryDate)}
                            </span>
                        </div>
                    )}

                    {/* Cost breakdown */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-muted-foreground/5 space-y-3">
                        <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                            <span>Base Rate Summary:</span>
                            <span className="font-semibold text-foreground">
                                {order.pricingType === 'per-image'
                                    ? `${formatCurrency(order.price)} × ${order.imagesCount}`
                                    : formatCurrency(order.price)}
                            </span>
                        </div>

                        <div className="border-t border-muted-foreground/5 pt-3 flex justify-between items-end">
                            <span className="text-sm font-bold text-foreground">Total Amount:</span>
                            <span className="text-2xl font-black text-primary leading-none">
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isOrderLoading) {
        return <CheckoutSkeleton />;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Elegant Header with Back Arrow and Stepper context */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-muted-foreground/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-semibold">
                        <span>New Order</span>
                        <span>/</span>
                        <span className="text-primary font-bold">Secure Payment</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Finalize Checkout
                    </h1>
                </div>
                <Link
                    href={`/orders/new-order/review/${orderID}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Review
                </Link>
            </div>

            {/* Premium Two Column Checkout Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                
                {/* Left Side: Methods and Secure checkout container */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Step 1: Payment Method Selection */}
                    <Card className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden relative">
                        {/* Ambient Glow background decor */}
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <CardHeader className="pb-5">
                            <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                                <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-primary/10 text-primary">
                                    1
                                </span>
                                Select Payment Method
                            </CardTitle>
                            <CardDescription>
                                Choose your preferred billing method to complete this order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={paymentOption}
                                onValueChange={(val) => {
                                    setPaymentOption(val as PaymentOption);
                                    if (val !== 'stripe') setClientSecret('');
                                }}
                                className="grid gap-4 sm:grid-cols-3"
                            >
                                {PAYMENT_OPTIONS.map(
                                    ({ value, title, description, icon, badge, iconBg }) => {
                                        const isSelected = paymentOption === value;
                                        return (
                                            <Card
                                                key={value}
                                                className={cn(
                                                    'border transition-all duration-300 rounded-2xl p-4 cursor-pointer relative overflow-hidden select-none',
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.01]'
                                                        : 'border-muted hover:border-primary/40 hover:bg-muted/40 hover:-translate-y-0.5'
                                                )}
                                                onClick={() => {
                                                    setPaymentOption(value);
                                                    if (value !== 'stripe') setClientSecret('');
                                                }}
                                            >
                                                {/* Mini badge */}
                                                <div className={cn(
                                                    'absolute top-3 right-3 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border',
                                                    isSelected
                                                        ? 'bg-primary/10 text-primary border-primary/20'
                                                        : 'bg-muted text-muted-foreground border-transparent'
                                                )}>
                                                    {badge}
                                                </div>

                                                <div className="flex flex-col gap-4 h-full pt-1.5">
                                                    <div className={cn(
                                                        'p-2.5 rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-300',
                                                        isSelected ? 'scale-110 shadow-inner' : '',
                                                        iconBg
                                                    )}>
                                                        {icon}
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-sm text-foreground">
                                                                {title}
                                                            </p>
                                                            {isSelected && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 animate-in zoom-in-50" />
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground leading-normal font-medium">
                                                            {description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    }
                                )}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Step 2: Payment Gateway Checkout Portal */}
                    <Card className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden relative min-h-[250px] flex flex-col justify-center">
                        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                        
                        {paymentOption && (
                            <CardHeader className="pb-3 border-b border-muted-foreground/5">
                                <CardTitle className="text-lg font-bold flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-primary/10 text-primary">
                                        2
                                    </span>
                                    {paymentOption === 'stripe'
                                        ? 'Enter Card Details'
                                        : paymentOption === 'paypal'
                                        ? 'Authorize via PayPal'
                                        : 'Pay Later Confirmation'}
                                </CardTitle>
                                <CardDescription>
                                    Fill in the parameters below to complete secure authentication
                                </CardDescription>
                            </CardHeader>
                        )}
                        
                        <CardContent className={cn("p-6", !paymentOption ? "flex justify-center items-center h-full min-h-[220px]" : "")}>
                            {renderPaymentContent()}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Side: Sticky Order Summary & Safety seals */}
                <div className="md:col-span-1 space-y-6 md:sticky md:top-6">
                    
                    {/* Elegant Summary Card */}
                    <Card className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <CardHeader className="border-b border-muted-foreground/5 pb-4">
                            <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-foreground">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Order Details
                            </CardTitle>
                            <CardDescription>
                                Standard breakdown summary
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5">
                            {renderOrderSummary()}
                        </CardContent>
                    </Card>

                    {/* Billing Guard Protection Seal */}
                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0 animate-pulse">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Price Guard Secured</p>
                                    <span className="text-[8px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black px-1 py-0.5 rounded uppercase tracking-wider">ACTIVE</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                                    Our server-side ledger verifies price and quantity math against DB master records. Manipulations are automatically blocked.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Trust/Confidence Assurance seals */}
                    <div className="p-5 rounded-2xl border border-muted-foreground/10 bg-muted/20 backdrop-blur-md space-y-4">
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-primary shrink-0" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-extrabold text-foreground">SSL Secure Checkout</p>
                                <p className="text-[10px] text-muted-foreground/90 font-medium leading-tight">Your credential details are never saved and are fully encrypted.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 border-t border-muted-foreground/5 pt-3">
                            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-extrabold text-foreground">Guarantee Verified</p>
                                <p className="text-[10px] text-muted-foreground/90 font-medium leading-tight">Payments are securely routed via authorized global gateways.</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
