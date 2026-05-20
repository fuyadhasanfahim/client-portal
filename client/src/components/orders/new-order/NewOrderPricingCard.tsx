'use client';

import ApiError from '@/components/shared/ApiError';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useNewOrderMutation } from '@/redux/features/orders/ordersApi';
import { IOrder } from '@/types/order.interface';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FileText, ImageIcon, DollarSign, Calendar, HelpCircle } from 'lucide-react';

function formatCurrency(value: number) {
    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function NewOrderPricingCard({ order }: { order: IOrder }) {
    const { user } = useLoggedInUser();
    const [newOrder, { isLoading }] = useNewOrderMutation();
    const { details, title, pricingType, price, imagesCount, total, orderID } = order;
    const router = useRouter();

    const handleTotal = async () => {
        try {
            const response = await newOrder({
                userID: user.userID,
                orderStage: 'details-provided',
                orderID,
                total,
            }).unwrap();

            if (response?.success) {
                toast.success('Details saved. Redirecting to checkout...');
                router.push(`/orders/new-order/payment/${orderID}`);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card className="border border-muted-foreground/10 bg-card/70 backdrop-blur-xl shadow-xl rounded-xl relative overflow-hidden">
            {/* Soft ambient background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />

            <CardHeader className="space-y-1.5 border-b border-muted-foreground/5 pb-4">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Pricing Summary
                </CardTitle>
                <CardDescription className="text-muted-foreground/90">
                    Review your order breakdown and rate model details.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-5">
                {/* Order Item Card */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground/75">
                            Order Item
                        </span>
                        <span className="text-base font-semibold text-foreground">
                            {title}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-muted-foreground/5 pt-3">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Images Count
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {imagesCount} photo{imagesCount !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5" />
                                Rate Model
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {pricingType === 'per-image' 
                                    ? `${formatCurrency(price)} / image` 
                                    : 'Flat Rate'}
                            </span>
                        </div>
                    </div>

                    {/* Formula breakdown box */}
                    <div className="p-4 rounded-lg bg-muted/30 border border-muted-foreground/5 space-y-2.5">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Base Rate:</span>
                            <span className="font-semibold text-foreground">
                                {pricingType === 'per-image' 
                                    ? `${formatCurrency(price)} × ${imagesCount} images`
                                    : formatCurrency(price)}
                            </span>
                        </div>

                        <div className="border-t border-muted-foreground/5 pt-2 flex justify-between items-center text-base font-bold text-foreground">
                            <span>Total Price:</span>
                            <span className="text-xl font-black text-primary">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Instructions or download details */}
                {details?.downloadLink && (
                    <div className="text-xs text-muted-foreground flex items-start gap-1.5 p-3 rounded-md bg-primary/5 border border-primary/10">
                        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-semibold text-primary">Assets Source Link Verified</p>
                            <p className="truncate text-muted-foreground/85">
                                {details.downloadLink}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t border-muted-foreground/5 pt-4 pb-6">
                <Button
                    className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-primary-foreground font-semibold h-11 shadow-md transition-all active:scale-[0.98]"
                    disabled={isLoading}
                    onClick={handleTotal}
                >
                    Proceed to Payment
                </Button>
            </CardFooter>
        </Card>
    );
}
