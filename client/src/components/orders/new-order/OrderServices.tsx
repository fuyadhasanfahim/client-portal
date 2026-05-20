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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNewPendingOrderMutation } from '@/redux/features/orders/ordersApi';
import { useNewPaymentMutation } from '@/redux/features/payments/paymentApi';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { ISanitizedUser } from '@/types/user.interface';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const RETURN_FILE_FORMAT_OPTIONS = ['JPG', 'PNG', 'PSD', 'TIFF', 'WEBP', 'PDF'];
const DELIVERY_TIME_OPTIONS = [
    { label: '6 Hours Turnaround', value: '6 Hours' },
    { label: '12 Hours Turnaround', value: '12 Hours' },
    { label: '24 Hours (Standard)', value: '24 Hours' },
    { label: '48 Hours (Standard)', value: '48 Hours' },
    { label: '3 Days Turnaround', value: '3 Days' },
    { label: 'Custom Date', value: 'Custom' },
];
const BACKGROUND_OPTIONS = [
    { label: 'Transparent Background', value: 'Transparent' },
    { label: 'White Background', value: 'White Background' },
    { label: 'Original Background', value: 'Original Background' },
    { label: 'Custom Color (HEX)', value: 'Custom Background' },
];

export default function OrderServices() {
    const { user } = useLoggedInUser();
    const router = useRouter();
    
    const [newPendingOrder, { isLoading: isPendingOrderLoading }] = useNewPendingOrderMutation();
    const [newPayment, { isLoading: isPaymentLoading }] = useNewPaymentMutation();

    const {
        userID,
        isTeamMember,
        ownerUserID,
        teamPermissions,
    } = (user || {}) as ISanitizedUser;

    // Permissions check
    const isPayLater = isTeamMember === true && teamPermissions?.viewPrices === false;

    // Basic Info Form states
    const [title, setTitle] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [imagesCount, setImagesCount] = useState<number>(0);

    // Pricing States
    const [pricingType, setPricingType] = useState<'per-image' | 'total'>('per-image');
    const [price, setPrice] = useState<number>(0);

    // File & Delivery States
    const [returnFileFormat, setReturnFileFormat] = useState<string[]>(['JPG']);
    const [deliveryTime, setDeliveryTime] = useState<string>('24 Hours');
    const [customDeliveryDate, setCustomDeliveryDate] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Background States
    const [backgroundOption, setBackgroundOption] = useState<string>('Transparent');
    const [backgroundColor, setBackgroundColor] = useState<string>('');

    // Resize States
    const [imageResizing, setImageResizing] = useState<boolean>(false);
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');

    // Instruction States
    const [instructions, setInstructions] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculate total price dynamically
    const computedTotal = pricingType === 'per-image' ? price * imagesCount : price;

    const handleFormatChange = (format: string, checked: boolean) => {
        if (checked) {
            setReturnFileFormat((prev) => [...prev, format]);
        } else {
            setReturnFileFormat((prev) => prev.filter((item) => item !== format));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        // Basic info validation
        if (!title.trim()) newErrors.title = 'Order title is required';
        if (!downloadLink.trim()) {
            newErrors.downloadLink = 'External assets link is required';
        } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(downloadLink)) {
            newErrors.downloadLink = 'Please enter a valid URL (e.g. https://drive.google.com/...)';
        }
        if (imagesCount <= 0) {
            newErrors.imagesCount = 'Images count must be greater than 0';
        }
        
        // Price validation
        if (!isPayLater) {
            if (price <= 0) {
                newErrors.price = 'Price must be greater than 0';
            }
        }

        // Return Format validation
        if (returnFileFormat.length === 0) {
            newErrors.returnFileFormat = 'Please select at least one return file format';
        }

        // Custom Background Color validation
        if (backgroundOption === 'Custom Background') {
            if (!backgroundColor.trim()) {
                newErrors.backgroundColor = 'Hex color is required for custom background';
            } else if (!/^#[0-9A-F]{6}$/i.test(backgroundColor)) {
                newErrors.backgroundColor = 'Please enter a valid HEX code (e.g. #FFFFFF)';
            }
        }

        // Custom Resize validation
        if (imageResizing) {
            if (width === '' || Number(width) <= 0) {
                newErrors.width = 'Width must be a positive integer';
            }
            if (height === '' || Number(height) <= 0) {
                newErrors.height = 'Height must be a positive integer';
            }
        }

        // Custom Delivery Date validation
        if (deliveryTime === 'Custom') {
            if (!customDeliveryDate) {
                newErrors.customDeliveryDate = 'Please select a custom delivery date';
            } else if (customDeliveryDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
                newErrors.customDeliveryDate = 'Delivery date cannot be in the past';
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

            // Compute delivery date
            let calculatedDeliveryDate = new Date();
            if (deliveryTime === '6 Hours') {
                calculatedDeliveryDate = new Date(Date.now() + 6 * 60 * 60 * 1000);
            } else if (deliveryTime === '12 Hours') {
                calculatedDeliveryDate = new Date(Date.now() + 12 * 60 * 60 * 1000);
            } else if (deliveryTime === '24 Hours') {
                calculatedDeliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            } else if (deliveryTime === '48 Hours') {
                calculatedDeliveryDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
            } else if (deliveryTime === '3 Days') {
                calculatedDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            } else if (deliveryTime === 'Custom' && customDeliveryDate) {
                calculatedDeliveryDate = customDeliveryDate;
            }

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
                    deliveryDate: calculatedDeliveryDate,
                    returnFileFormat,
                    backgroundOption: [backgroundOption],
                    backgroundColor: backgroundColor ? [backgroundColor] : [],
                    imageResizing,
                    width: imageResizing && width ? Number(width) : undefined,
                    height: imageResizing && height ? Number(height) : undefined,
                },
            };

            const response = await newPendingOrder(payload).unwrap();

            if (response?.success && response.pendingOrderID) {
                const pendingOrderID = response.pendingOrderID;

                if (isPayLater) {
                    // Finalize order with pay-later status immediately
                    const payLaterRes = await newPayment({
                        userID: finalUserId,
                        orderID: pendingOrderID,
                        paymentOption: 'pay-later',
                        paymentMethodID: 'pending',
                        status: 'pending',
                        amount: 0,
                    }).unwrap();

                    if (payLaterRes?.success) {
                        toast.success('Order submitted successfully!');
                        router.push('/orders');
                    }
                } else {
                    toast.success('Order configured! Proceeding to checkout...');
                    router.push(`/orders/new-order/payment/${pendingOrderID}`);
                }
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const isSubmissionLoading = isPendingOrderLoading || isPaymentLoading;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create a New Order</h1>
                <p className="text-muted-foreground mt-1.5">
                    Configure your retouching specifications, file preferences, and pricing rates below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Form Inputs (Left side) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Section 1: Basic Information */}
                    <Card className="border border-muted shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                            <CardDescription>
                                Set the order title, raw file download link, and estimated total images count.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Item Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Real Estate Retouching - 25 Photos"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="downloadLink">External Assets Link *</Label>
                                <Input
                                    id="downloadLink"
                                    placeholder="Google Drive, Dropbox, or OneDrive shareable link"
                                    value={downloadLink}
                                    onChange={(e) => setDownloadLink(e.target.value)}
                                    className={errors.downloadLink ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Provide a shareable link where we can download your raw assets/images. Direct uploads are not required.
                                </p>
                                {errors.downloadLink && (
                                    <p className="text-sm text-destructive">{errors.downloadLink}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imagesCount">Images Count *</Label>
                                <Input
                                    id="imagesCount"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={imagesCount || ''}
                                    onChange={(e) => setImagesCount(Math.max(0, parseInt(e.target.value) || 0))}
                                    className={errors.imagesCount ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.imagesCount && (
                                    <p className="text-sm text-destructive">{errors.imagesCount}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Pricing Info */}
                    {!isPayLater && (
                        <Card className="border border-muted shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-lg">Pricing & Rates</CardTitle>
                                <CardDescription>
                                    Define whether prices are calculated per individual image or as a flat project fee.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="pricingType">Pricing Model *</Label>
                                    <Select
                                        value={pricingType}
                                        onValueChange={(val) => setPricingType(val as 'per-image' | 'total')}
                                    >
                                        <SelectTrigger id="pricingType" className="w-full">
                                            <SelectValue placeholder="Select pricing model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="per-image">Per Image rate ($)</SelectItem>
                                            <SelectItem value="total">Flat Total fee ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        {pricingType === 'per-image' ? 'Price per Image ($) *' : 'Total Order Price ($) *'}
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={price || ''}
                                        onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className={errors.price ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">{errors.price}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section 3: File & Delivery */}
                    <Card className="border border-muted shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-lg">File Format & Delivery Time</CardTitle>
                            <CardDescription>
                                Select return file format(s) and delivery deadlines.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Return File Formats * (Select multiple)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                                    {RETURN_FILE_FORMAT_OPTIONS.map((format) => (
                                        <div key={format} className="flex items-center space-x-2.5">
                                            <Checkbox
                                                id={`format-${format}`}
                                                checked={returnFileFormat.includes(format)}
                                                onCheckedChange={(checked) =>
                                                    handleFormatChange(format, checked === true)
                                                }
                                            />
                                            <Label
                                                htmlFor={`format-${format}`}
                                                className="text-sm font-normal cursor-pointer select-none"
                                            >
                                                {format}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.returnFileFormat && (
                                    <p className="text-sm text-destructive mt-1">{errors.returnFileFormat}</p>
                                )}
                            </div>

                            <Separator className="my-2" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryTime">Delivery Timeline *</Label>
                                    <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                                        <SelectTrigger id="deliveryTime" className="w-full">
                                            <SelectValue placeholder="Select turnaround time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DELIVERY_TIME_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {deliveryTime === 'Custom' && (
                                    <div className="space-y-2 flex flex-col">
                                        <Label htmlFor="customDeliveryDate">Custom Delivery Date *</Label>
                                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="customDeliveryDate"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-between text-left font-normal",
                                                        !customDeliveryDate && "text-muted-foreground",
                                                        errors.customDeliveryDate && "border-destructive focus-visible:ring-destructive"
                                                    )}
                                                >
                                                    {customDeliveryDate ? (
                                                        format(customDeliveryDate, 'PPP')
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={customDeliveryDate}
                                                    onSelect={(date) => {
                                                        setCustomDeliveryDate(date);
                                                        setCalendarOpen(false);
                                                    }}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.customDeliveryDate && (
                                            <p className="text-sm text-destructive">{errors.customDeliveryDate}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Background Options */}
                    <Card className="border border-muted shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-lg">Background Options</CardTitle>
                            <CardDescription>
                                Set the requested output background styling for retouched images.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="backgroundOption">Background Type *</Label>
                                    <Select value={backgroundOption} onValueChange={setBackgroundOption}>
                                        <SelectTrigger id="backgroundOption" className="w-full">
                                            <SelectValue placeholder="Select background type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BACKGROUND_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {backgroundOption === 'Custom Background' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="backgroundColor">Custom HEX Color *</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                id="backgroundColor"
                                                placeholder="e.g. #FFFFFF"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                className={errors.backgroundColor ? 'border-destructive focus-visible:ring-destructive' : ''}
                                            />
                                            {backgroundColor && /^#[0-9A-F]{6}$/i.test(backgroundColor) && (
                                                <div 
                                                    className="w-10 h-10 rounded border" 
                                                    style={{ backgroundColor: backgroundColor }}
                                                    title={`Preview of ${backgroundColor}`}
                                                />
                                            )}
                                        </div>
                                        {errors.backgroundColor && (
                                            <p className="text-sm text-destructive">{errors.backgroundColor}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5: Image Resizing */}
                    <Card className="border border-muted shadow-xs">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-lg">Image Resizing</CardTitle>
                                    <CardDescription>
                                        Specify target dimension bounds if output resizing is needed.
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={imageResizing}
                                    onCheckedChange={setImageResizing}
                                    aria-label="Toggle Image Resizing"
                                />
                            </div>
                        </CardHeader>
                        {imageResizing && (
                            <CardContent className="grid grid-cols-2 gap-6 pt-2 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="width">Target Width (px) *</Label>
                                    <Input
                                        id="width"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 1920"
                                        value={width || ''}
                                        onChange={(e) => setWidth(Math.max(0, parseInt(e.target.value) || 0))}
                                        className={errors.width ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    />
                                    {errors.width && (
                                        <p className="text-sm text-destructive">{errors.width}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="height">Target Height (px) *</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 1080"
                                        value={height || ''}
                                        onChange={(e) => setHeight(Math.max(0, parseInt(e.target.value) || 0))}
                                        className={errors.height ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    />
                                    {errors.height && (
                                        <p className="text-sm text-destructive">{errors.height}</p>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Section 6: Special Instructions */}
                    <Card className="border border-muted shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-lg">Special Instructions</CardTitle>
                            <CardDescription>
                                Provide detailed directions regarding shadows, styling, cropping, and folder hierarchies.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="instructions"
                                placeholder="State any custom instructions here. Formatting and line breaks are fully preserved."
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                className="min-h-[140px] text-sm whitespace-pre-wrap leading-relaxed"
                            />
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar (Right side) - Sticky Pricing & Summary Preview Card */}
                <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
                    <Card className="border-2 border-primary/20 shadow-sm bg-card">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-xl">Order Summary</CardTitle>
                            <CardDescription>Instant summary & price preview</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-5 space-y-4 text-sm">
                            
                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-muted-foreground">Title:</span>
                                <span className="font-semibold text-right max-w-[160px] truncate" title={title || 'Untitled Order'}>
                                    {title || 'Untitled Order'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-muted-foreground">Images Count:</span>
                                <span className="font-semibold">{imagesCount}</span>
                            </div>

                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-muted-foreground">Return Formats:</span>
                                <span className="font-semibold max-w-[160px] truncate" title={returnFileFormat.join(', ') || 'None'}>
                                    {returnFileFormat.join(', ') || 'None'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-muted-foreground">Delivery Deadlines:</span>
                                <span className="font-semibold capitalize">
                                    {deliveryTime === 'Custom' && customDeliveryDate
                                        ? format(customDeliveryDate, 'PPP')
                                        : deliveryTime}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-0.5">
                                <span className="text-muted-foreground">Background Style:</span>
                                <span className="font-semibold truncate max-w-[160px]" title={backgroundOption}>
                                    {backgroundOption === 'Custom Background' && backgroundColor ? `${backgroundColor}` : backgroundOption}
                                </span>
                            </div>

                            {imageResizing && (
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-muted-foreground">Resize Dimensions:</span>
                                    <span className="font-semibold">{width && height ? `${width} × ${height} px` : 'Pending'}</span>
                                </div>
                            )}

                            {!isPayLater && (price > 0 || imagesCount > 0) && (
                                <>
                                    <Separator className="my-3" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Pricing Rate Model:</span>
                                        <span className="font-semibold text-right">
                                            {pricingType === 'per-image'
                                                ? `$${price.toFixed(2)} per image`
                                                : `Flat fee`}
                                        </span>
                                    </div>

                                    <Separator className="my-3" />

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-base font-bold">Estimated Total:</span>
                                        <span className="text-2xl font-extrabold text-primary">
                                            ${computedTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            )}

                            {isPayLater && (
                                <>
                                    <Separator className="my-3" />
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                                        <h4 className="font-semibold text-primary text-xs">Review & Post Flow</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            As a member of a delegated team with price-hiding active, your order will be submitted immediately as a Pay-Later Draft. Admins will review, confirm pricing, and invoice.
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 pt-4 border-t bg-muted/30">
                            <Button
                                type="submit"
                                disabled={isSubmissionLoading}
                                className="w-full font-semibold text-base py-5 h-auto"
                            >
                                {isSubmissionLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        {isPayLater ? 'Submit Order' : 'Proceed to Checkout'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/orders')}
                                className="w-full py-2.5"
                                disabled={isSubmissionLoading}
                            >
                                Cancel
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </form>
        </div>
    );
}
