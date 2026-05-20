'use client';

import ApiError from '@/components/shared/ApiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    useCompleteOrderMutation,
    useReviewOrderMutation,
} from '@/redux/features/orders/ordersApi';
import { useNewOrderCheckoutMutation } from '@/redux/features/stripe/stripeApi';
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { IconPackage } from '@tabler/icons-react';
import { CheckCircle, CreditCard, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DeliveryLinkUploader from './DeliveryLinkUploader';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { IOrderUser } from '@/types/order.interface';

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

interface OrderDetailsPaymentAndDetailsProps {
    orderUser: IOrderUser;
    isTeamMember?: boolean;
    status: string;
    total?: number | string;
    paymentId?: string;
    paymentStatus?: string;
    role: string;
    orderID: string;
    userID: string;
    deliveryLink?: string;
    isRevision?: boolean;
}

export default function OrderDetailsPaymentAndDetails({
    orderUser,
    isTeamMember,
    status,
    orderID,
    total,
    paymentId,
    paymentStatus,
    role,
    isRevision = false,
    deliveryLink,
    userID,
}: OrderDetailsPaymentAndDetailsProps) {
    const { user } = useLoggedInUser();

    const [instruction, setInstruction] = useState<string>('');
    const [showPaymentReminder, setShowPaymentReminder] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

    const [reviewOrder, { isLoading: isReviewing }] = useReviewOrderMutation();
    const [completeOrder, { isLoading: isCompleting }] =
        useCompleteOrderMutation();
    const [newOrderCheckout] = useNewOrderCheckoutMutation();

    const canDeliver =
        role !== 'user' &&
        (status === 'in-progress' || status === 'in-revision');

    const needsPayLaterCheckout =
        orderUser.userID === user?.userID &&
        status === 'completed' &&
        (paymentStatus === 'pay-later' || paymentStatus === 'pending');

    async function handleReviewOrder() {
        try {
            if (!instruction.trim()) {
                toast.error('Please write your revision instructions.');
                return;
            }
            const res = await reviewOrder({
                orderID,
                instructions: instruction,
            }).unwrap();
            if (res.success) {
                setInstruction('');
                setReviewDialogOpen(false);
                toast.success(res.message);
            }
        } catch (error) {
            ApiError(error);
        }
    }

    async function handleCompleteOrder() {
        try {
            const res = await completeOrder({ orderID, deliveryLink }).unwrap();
            if (res.success) {
                setCompleteDialogOpen(false);
                toast.success(res.message);
                window.location.reload();

                if (paymentStatus === 'pay-later') {
                    setShowPaymentReminder(true);
                }
            }
        } catch (error) {
            ApiError(error);
        }
    }

    useEffect(() => {
        if (!needsPayLaterCheckout) return;
        if (!stripePromise) {
            console.warn('Stripe publishable key is missing.');
            return;
        }
        if (clientSecret) return;

        (async () => {
            try {
                const res = await newOrderCheckout({
                    orderID,
                    paymentOption: 'pay-now',
                    paymentMethod: 'card-payment',
                }).unwrap();

                if (res?.success && typeof res.data === 'string') {
                    setClientSecret(res.data);
                } else {
                    toast.error('Could not prepare payment session.');
                }
            } catch (err) {
                console.log(err);
                ApiError(err);
            }
        })();
    }, [
        newOrderCheckout,
        paymentStatus,
        orderID,
        clientSecret,
        needsPayLaterCheckout,
    ]);

    return (
        <Card className="max-h-[80vh] ">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconPackage size={24} />
                    <span className="text-2xl">Order Overview</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
                <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 capitalize"
                >
                    {status}
                </Badge>

                <p>
                    <strong>Total Price:</strong> {total}
                </p>
                <p>
                    <strong>Payment ID:</strong> {paymentId ?? 'N/A'}
                </p>
            </CardContent>

            {canDeliver && (
                <DeliveryLinkUploader orderID={orderID} userID={userID} />
            )}

            {role === 'user' && status === 'delivered' && (
                <CardFooter className="border-t flex flex-col gap-3">
                    {!isRevision && (
                        <Dialog
                            open={reviewDialogOpen}
                            onOpenChange={setReviewDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                    onClick={() => setReviewDialogOpen(true)}
                                >
                                    <span className="flex items-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Request Revision
                                    </span>
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Request a Revision
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tell us what needs to be changed.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-2 py-2">
                                    <Label htmlFor="instruction">
                                        Revision Instructions
                                    </Label>
                                    <Textarea
                                        id="instruction"
                                        placeholder="What needs to be changed?"
                                        value={instruction}
                                        onChange={(e) =>
                                            setInstruction(e.target.value)
                                        }
                                        className="min-h-[140px]"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        className="bg-yellow-500 hover:bg-yellow-600"
                                        disabled={
                                            isReviewing || !instruction.trim()
                                        }
                                        onClick={handleReviewOrder}
                                    >
                                        {isReviewing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        <span className="ml-2">
                                            Submit Revision
                                        </span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setReviewDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Dialog
                        open={completeDialogOpen}
                        onOpenChange={setCompleteDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setCompleteDialogOpen(true)}
                            >
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Confirm Order Completion
                                </span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[440px]">
                            <DialogHeader>
                                <DialogTitle>Confirm Completion</DialogTitle>
                                <DialogDescription>
                                    You’re about to mark this order as{' '}
                                    <b>completed</b>. This will close the
                                    revision thread.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isCompleting}
                                    onClick={handleCompleteOrder}
                                >
                                    {isCompleting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <CheckCircle />
                                    )}
                                    {isCompleting
                                        ? 'Processing...'
                                        : 'Yes, Complete It'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setCompleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}

            {!isTeamMember && needsPayLaterCheckout && (
                <CardFooter className="border-t">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Proceed to Payment
                                </span>
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl p-0">
                            <ScrollArea className="h-[75vh]">
                                <div className="p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">
                                            Complete Payment
                                        </DialogTitle>
                                        <DialogDescription>
                                            Your order is complete but pending
                                            payment. Please proceed with the
                                            payment.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>

                                {clientSecret && stripePromise ? (
                                    <EmbeddedCheckoutProvider
                                        stripe={stripePromise}
                                        options={{ clientSecret }}
                                    >
                                        <div className="px-6 pb-6">
                                            <EmbeddedCheckout />
                                        </div>
                                    </EmbeddedCheckoutProvider>
                                ) : (
                                    <div className="flex h-64 items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                    </div>
                                )}
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}

            <Dialog
                open={showPaymentReminder}
                onOpenChange={setShowPaymentReminder}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Reminder</DialogTitle>
                        <DialogDescription>
                            You&apos;ve marked the order as complete, but it
                            seems the payment hasn&apos;t been made yet.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setShowPaymentReminder(false)}
                        >
                            Okay, Got It
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
