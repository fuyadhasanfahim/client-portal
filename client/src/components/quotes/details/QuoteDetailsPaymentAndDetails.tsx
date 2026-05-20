'use client';

import ApiError from '@/components/shared/ApiError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
    useCompleteQuoteMutation,
    useReviewQuoteMutation,
} from '@/redux/features/quotes/quoteApi';
import { IconPackage } from '@tabler/icons-react';
import { CheckCircle, Loader2, RefreshCw, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import DeliveryLinkUploader from './DeliveryLinkUploader';
import useLoggedInUser from '@/utils/getLoggedInUser';

interface QuoteDetailsPaymentAndDetailsProps {
    status: string;
    role: string;
    quoteID: string;
}

export default function OrderDetailsPaymentAndDetails({
    status,
    quoteID,
    role,
}: QuoteDetailsPaymentAndDetailsProps) {
    const { user } = useLoggedInUser();
    const { userID } = user;

    const [instruction, setInstruction] = useState<string>('');
    const [reviewOrComplete, setReviewOrComplete] = useState<string>('');

    const [completeOrder, { isLoading: isCompleted }] =
        useCompleteQuoteMutation();

    const [reviewQuote, { isLoading: isReviewDone }] = useReviewQuoteMutation();

    const handleReviewQuote = async () => {
        try {
            const response = await reviewQuote({
                quoteID,
                instructions: instruction,
            });

            if (response.data.success) {
                setInstruction('');
                toast.success(response.data.message);
            }
        } catch (error) {
            console.log(error);
            ApiError(error);
        }
    };

    const handleCompleteQuote = async () => {
        try {
            const response = await completeOrder({
                quoteID,
            });

            if (response.data.success) {
                setInstruction('');
                toast.success(response.data.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconPackage size={24} />
                    <span className="text-2xl">Quote Overview</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
                {/* ✅ ADMIN: Show "Deliver Now" button when status is in-progress or in-revision */}
                {role === 'admin' &&
                    (status === 'in-progress' || status === 'in-revision') && (
                        <DeliveryLinkUploader
                            quoteID={quoteID}
                            userID={userID}
                        />
                    )}

                {/* ✅ USER: Show feedback only after delivery */}
                {role === 'user' && status === 'delivered' && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isReviewDone || isCompleted}
                            >
                                {isReviewDone || isCompleted ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Complete/Request Revision
                                    </div>
                                )}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-lg">
                                    Quote Feedback
                                </DialogTitle>
                                <DialogDescription>
                                    {reviewOrComplete === 'in-revision'
                                        ? 'Provide details for revision'
                                        : 'Confirm Quote completion'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                <RadioGroup
                                    value={reviewOrComplete}
                                    onValueChange={setReviewOrComplete}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="in-revision"
                                            id="in-revision"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="in-revision"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500"
                                        >
                                            <RefreshCw className="mb-2 h-6 w-6 text-yellow-500" />
                                            Request Revision
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="complete"
                                            id="complete"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="complete"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500"
                                        >
                                            <CheckCircle className="mb-2 h-6 w-6 text-emerald-500" />
                                            Complete Quote
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {reviewOrComplete === 'in-revision' && (
                                    <div className="space-y-2">
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
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    {reviewOrComplete === 'in-revision' ? (
                                        <Button
                                            type="submit"
                                            className="bg-yellow-500 hover:bg-yellow-600"
                                            disabled={
                                                isReviewDone || !instruction
                                            }
                                            onClick={handleReviewQuote}
                                        >
                                            <Send className="h-4 w-4" />
                                            Submit Revision Request
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            disabled={
                                                reviewOrComplete !== 'complete'
                                            }
                                            onClick={handleCompleteQuote}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Confirm Completion
                                        </Button>
                                    )}
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
}
