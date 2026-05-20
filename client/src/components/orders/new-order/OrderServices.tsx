'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DollarSign,
    Loader2,
    Link2,
    ClipboardList,
    FileText,
    Image as ImageIcon,
    ChevronRight,
    Tags,
    Sparkles,
} from 'lucide-react';
import { useNewOrderMutation } from '@/redux/features/orders/ordersApi';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { ISanitizedUser } from '@/types/user.interface';

export default function OrderServices() {
    const { user } = useLoggedInUser();
    const router = useRouter();
    const [newOrder, { isLoading }] = useNewOrderMutation();

    const {
        userID,
        isTeamMember,
        ownerUserID,
        teamPermissions,
    } = (user || {}) as ISanitizedUser;

    // Permissions check
    const isPayLater = isTeamMember === true && teamPermissions?.viewPrices === false;

    // Form states
    const [title, setTitle] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [pricingType, setPricingType] = useState<'per-image' | 'total'>('per-image');
    const [price, setPrice] = useState<number>(0);
    const [imagesCount, setImagesCount] = useState<number>(0);
    const [instructions, setInstructions] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculate total price dynamically
    const computedTotal = pricingType === 'per-image' ? price * imagesCount : price;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = 'Order title is required';
        if (!downloadLink.trim()) {
            newErrors.downloadLink = 'External assets link is required';
        } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(downloadLink)) {
            newErrors.downloadLink = 'Please enter a valid URL (e.g. https://drive.google.com/...)';
        }
        if (imagesCount <= 0) {
            newErrors.imagesCount = 'Images count must be greater than 0';
        }
        if (!isPayLater) {
            if (price <= 0) {
                newErrors.price = 'Price must be greater than 0';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        try {
            const finalUserId = isTeamMember ? ownerUserID : userID;
            const payload = {
                userID: finalUserId,
                title,
                pricingType,
                price: isPayLater ? 0 : price,
                imagesCount,
                total: isPayLater ? 0 : computedTotal,
                details: {
                    downloadLink,
                    images: imagesCount,
                    instructions,
                    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24h from now
                },
                orderStage: isPayLater ? 'payment-completed' : 'details-provided',
                ...(isPayLater ? { paymentStatus: 'pay-later' } : {}),
            };

            const response = await newOrder(payload).unwrap();

            if (response?.success && response.orderID) {
                toast.success('Order created successfully!');
                if (isPayLater) {
                    router.push('/orders');
                } else {
                    router.push(`/orders/new-order/payment/${response.orderID}`);
                }
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
            <Card className="w-full max-w-3xl border border-muted-foreground/10 shadow-2xl relative overflow-hidden bg-card/80 backdrop-blur-xl">
                {/* Decorative gradients */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

                <CardHeader className="space-y-2 border-b border-muted-foreground/10 pb-6">
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold tracking-wider uppercase">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        Professional Editing Portal
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-emerald-500 bg-clip-text text-transparent">
                        Create a New Order
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground/80">
                        Simplify your workflow. Provide the asset links and dynamic pricing for instant checkout.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CardContent className="space-y-8 pt-8">
                        {/* Section 1: Order Identity */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground/90 border-l-2 border-primary pl-2">
                                <ClipboardList className="w-4 h-4 text-primary" />
                                Order Details
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">
                                        Item Title <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="title"
                                            placeholder="e.g. Real Estate Retouching - 25 Photos"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className={`pl-10 h-11 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary ${
                                                errors.title ? 'border-destructive focus:ring-destructive' : ''
                                            }`}
                                        />
                                    </div>
                                    {errors.title && (
                                        <p className="text-xs text-destructive font-medium pl-1">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="downloadLink" className="text-sm font-medium">
                                        External Assets Link <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="downloadLink"
                                            placeholder="Google Drive, Dropbox, or OneDrive shareable link"
                                            value={downloadLink}
                                            onChange={(e) => setDownloadLink(e.target.value)}
                                            className={`pl-10 h-11 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary ${
                                                errors.downloadLink ? 'border-destructive focus:ring-destructive' : ''
                                            }`}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground/75 pl-1 block">
                                        Provide a link where we can download your raw assets/images. No direct file upload needed.
                                    </span>
                                    {errors.downloadLink && (
                                        <p className="text-xs text-destructive font-medium pl-1">{errors.downloadLink}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Asset Metrics & Dynamic Price */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground/90 border-l-2 border-primary pl-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                Image & Pricing Config
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="imagesCount" className="text-sm font-medium">
                                        Images Count <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="imagesCount"
                                            type="number"
                                            min="1"
                                            placeholder="0"
                                            value={imagesCount || ''}
                                            onChange={(e) => setImagesCount(Math.max(0, parseInt(e.target.value) || 0))}
                                            className={`pl-10 h-11 border-muted-foreground/20 focus:border-primary ${
                                                errors.imagesCount ? 'border-destructive focus:ring-destructive' : ''
                                            }`}
                                        />
                                    </div>
                                    {errors.imagesCount && (
                                        <p className="text-xs text-destructive font-medium pl-1">{errors.imagesCount}</p>
                                    )}
                                </div>

                                {!isPayLater && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="pricingType" className="text-sm font-medium">
                                                Pricing Type <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Tags className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                <select
                                                    id="pricingType"
                                                    value={pricingType}
                                                    onChange={(e) => setPricingType(e.target.value as 'per-image' | 'total')}
                                                    className="w-full pl-10 pr-4 h-11 border border-muted-foreground/20 rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                                >
                                                    <option value="per-image">Per Image ($)</option>
                                                    <option value="total">Flat Total ($)</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-sm font-medium">
                                                {pricingType === 'per-image' ? 'Price per Image ($)' : 'Total Order Price ($)'}{' '}
                                                <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="0.00"
                                                    value={price || ''}
                                                    onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                                    className={`pl-10 h-11 border-muted-foreground/20 focus:border-primary ${
                                                        errors.price ? 'border-destructive focus:ring-destructive' : ''
                                                    }`}
                                                />
                                            </div>
                                            {errors.price && (
                                                <p className="text-xs text-destructive font-medium pl-1">{errors.price}</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Extra Guidelines */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground/90 border-l-2 border-primary pl-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Special Instructions
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instructions" className="text-sm font-medium">
                                    Guidelines & Request Notes
                                </Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="Provide detailed instructions regarding alignment, color matching, shadows, file structure, or formats..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="min-h-[120px] border-muted-foreground/20 focus:border-primary focus:ring-primary focus:ring-1 resize-y"
                                />
                            </div>
                        </div>

                        {/* Section 4: Live Invoice Preview (Hidden if Pay-Later) */}
                        {!isPayLater && (price > 0 || imagesCount > 0) && (
                            <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5 space-y-3 shadow-inner">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">
                                    Pricing Preview
                                </h4>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between items-center">
                                        <span>Images Count:</span>
                                        <span className="font-semibold text-foreground">{imagesCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Rate Model:</span>
                                        <span className="font-semibold text-foreground capitalize">
                                            {pricingType === 'per-image'
                                                ? `$${price.toFixed(2)} per image`
                                                : `Flat fee`}
                                        </span>
                                    </div>
                                    <div className="border-t border-muted-foreground/10 my-2 pt-2 flex justify-between items-end">
                                        <span className="font-bold text-foreground">Estimated Total:</span>
                                        <span className="text-2xl font-black text-primary">
                                            ${computedTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isPayLater && (
                            <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2 shadow-inner text-sm">
                                <h4 className="font-bold text-amber-600 dark:text-amber-400">
                                    Review & Post Flow
                                </h4>
                                <p className="text-muted-foreground">
                                    As a member of a delegated team with price-hiding active, your order will be submitted immediately as a <strong>Pay-Later Draft</strong>. Admins will review, confirm pricing, and invoice.
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="border-t border-muted-foreground/10 pt-6 pb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push('/orders')}
                            className="w-full sm:w-auto text-muted-foreground hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-primary-foreground font-semibold px-8 h-11 shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Order...
                                </>
                            ) : (
                                <>
                                    {isPayLater ? 'Submit Order' : 'Proceed to Checkout'}
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
