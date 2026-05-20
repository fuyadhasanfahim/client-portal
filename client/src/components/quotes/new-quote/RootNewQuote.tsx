'use client';

import React, { useState } from 'react';
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
    Loader2,
    Link2,
    ClipboardList,
    FileText,
    Image as ImageIcon,
    ChevronRight,
    Sparkles,
    HelpCircle,
    CheckCircle,
} from 'lucide-react';
import { useNewQuoteMutation } from '@/redux/features/quotes/quoteApi';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { ISanitizedUser } from '@/types/user.interface';

export default function RootNewQuote() {
    const { user } = useLoggedInUser();
    const router = useRouter();
    const [newQuote, { isLoading }] = useNewQuoteMutation();

    const {
        userID,
        isTeamMember,
        ownerUserID,
    } = (user || {}) as ISanitizedUser;

    // Form states
    const [title, setTitle] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [imagesCount, setImagesCount] = useState<number>(0);
    const [instructions, setInstructions] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = 'Quote title is required';
        if (!downloadLink.trim()) {
            newErrors.downloadLink = 'External assets link is required';
        } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(downloadLink)) {
            newErrors.downloadLink = 'Please enter a valid URL (e.g. https://drive.google.com/...)';
        }
        if (imagesCount <= 0) {
            newErrors.imagesCount = 'Images count must be greater than 0';
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
                userID: finalUserId!,
                quoteStage: 'details-provided',
                title,
                details: {
                    downloadLink,
                    images: imagesCount,
                    instructions,
                },
            };

            const response = await newQuote(payload).unwrap();

            if (response?.success) {
                toast.success('Quote request submitted successfully!');
                router.push('/quotes');
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
                        Trial & Custom Estimate Portal
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-emerald-500 bg-clip-text text-transparent">
                        Request a Quote / Trial
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground/80">
                        Provide your instructions and raw assets. Our professional design team will evaluate your request and generate a custom estimate.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CardContent className="space-y-8 pt-8">
                        {/* Section 1: Quote Identity */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground/90 border-l-2 border-primary pl-2">
                                <ClipboardList className="w-4 h-4 text-primary" />
                                Basic Information
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">
                                        Quote Request Title <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="title"
                                            placeholder="e.g. Wedding Photo Trial - 5 Retouches"
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
                                        Provide a link where we can download your trial or quote assets. No direct file upload needed.
                                    </span>
                                    {errors.downloadLink && (
                                        <p className="text-xs text-destructive font-medium pl-1">{errors.downloadLink}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Details & Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-base font-semibold text-foreground/90 border-l-2 border-primary pl-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                Requirements
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 space-y-2">
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

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="instructions" className="text-sm font-medium">
                                        Guidelines & Request Notes
                                    </Label>
                                    <Textarea
                                        id="instructions"
                                        placeholder="Provide details about retouching style, lighting preferences, color adjustments, dimensions, or target file formats..."
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        className="min-h-[110px] border-muted-foreground/20 focus:border-primary focus:ring-primary focus:ring-1 resize-y"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Process Information panel */}
                        <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5 space-y-3 shadow-inner">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4 text-primary" />
                                How the Quote Workflow Works
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground/90 pt-1">
                                <div className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground mb-0.5">1. Submit Details</p>
                                        <p>You send your files download link and editing instructions.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground mb-0.5">2. Manual Review</p>
                                        <p>Our specialists review the files and set a custom, optimized price.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground mb-0.5">3. Approval & Delivery</p>
                                        <p>You approve the custom pricing to start development and final delivery.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="border-t border-muted-foreground/10 pt-6 pb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push('/quotes')}
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
                                    Submitting Request...
                                </>
                            ) : (
                                <>
                                    Submit Quote Request
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
