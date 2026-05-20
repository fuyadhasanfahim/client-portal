'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { NewOrderDetailsSchema } from '@/validations/order-details.schema';
import {
    useGetOrderByIDQuery,
    useNewOrderMutation,
} from '@/redux/features/orders/ordersApi';
import toast from 'react-hot-toast';
import ApiError from '@/components/shared/ApiError';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/shared/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { IOrderDetails } from '@/types/order.interface';
import { DateAndTimePicker } from '@/components/shared/DateAndTimePicker';
import useLoggedInUser from '@/utils/getLoggedInUser';
import FileUploadField from '@/components/shared/FileUploadField';

export default function OrderDetails({ orderID }: { orderID: string }) {
    const { user } = useLoggedInUser();
    const router = useRouter();

    const { data, isLoading: isOrderLoading } = useGetOrderByIDQuery(orderID, {
        skip: !orderID,
    });

    const order = !isOrderLoading && data ? data.data : null;
    const price = order?.price ?? 0;
    const pricingType = order?.pricingType ?? 'per-image';

    const calculateTotal = (imagesCount: number) => {
        if (pricingType === 'per-image') {
            return price * imagesCount;
        }
        return price;
    };

    const form = useForm<z.infer<typeof NewOrderDetailsSchema>>({
        resolver: zodResolver(NewOrderDetailsSchema) as any,
        defaultValues: {
            downloadLink: '',
            images: 0,
            returnFileFormat: [],
            backgroundOption: [],
            backgroundColor: [],
            imageResizing: false,
            width: 0,
            height: 0,
            instructions: '',
            deliveryDate: new Date(),
        },
    });

    const { control, handleSubmit, watch } = form;

    const [newOrder, { isLoading }] = useNewOrderMutation();

    const onSubmit = async (data: Partial<IOrderDetails>) => {
        try {
            if (
                user?.isTeamMember === true &&
                user?.teamPermissions?.createOrders === true &&
                user?.teamPermissions?.viewPrices === false
            ) {
                const response = await newOrder({
                    userID: user?.userID,
                    orderStage: 'payment-completed',
                    orderID,
                    details: data as IOrderDetails,
                    total: calculateTotal(Number(data.images)),
                    paymentStatus: 'pay-later',
                }).unwrap();

                if (response.success) {
                    toast.success('Details saved. Redirecting...');
                    router.push(`/orders`);
                }
            } else {
                const response = await newOrder({
                    userID: user?.userID,
                    orderStage: 'details-provided',
                    orderID,
                    details: data as IOrderDetails,
                }).unwrap();

                if (response.success) {
                    toast.success('Details saved. Redirecting...');
                    router.push(`/orders/new-order/review/${orderID}`);
                }
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const resizingEnabled = watch('imageResizing');
    const backgroundOption = watch('backgroundOption');

    return (
        <Card>
            <Form {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit, (errors) => {
                        console.log('Validation errors:', errors);
                    })}
                    className="space-y-6"
                >
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Order Details
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Please fill in all{' '}
                            <span className="text-destructive">*</span> required
                            fields to help us deliver your edits exactly as you
                            envision.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="rounded-md border p-3">
                            <FileUploadField
                                label="Assets"
                                description="Upload files or paste a download link"
                                refType="order"
                                refId={orderID}
                                userID={user?.userID}
                                as="user"
                                multiple
                                maxFileSizeMB={51200}
                                required
                                defaultLink={form.watch('downloadLink')}
                                onCompleted={(url: string) => {
                                    form.setValue(
                                        'downloadLink',
                                        `${process.env.NEXT_PUBLIC_BASE_URL}/${url}`,
                                        {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        }
                                    );
                                    toast.success('Assets link saved.');
                                }}
                            />
                        </div>

                        <FormField
                            control={control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Images{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter Image count"
                                            type="number"
                                            value={field.value || ''}
                                            step="1"
                                            min="0"
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DateAndTimePicker
                            control={control}
                            name="deliveryDate"
                            label="Delivery date and time"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                            <FormField
                                control={control}
                                name="returnFileFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Return File Format{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                selected={field.value}
                                                options={[
                                                    'JPEG',
                                                    'PNG',
                                                    'PSD',
                                                    'EPS',
                                                    'AI',
                                                    'GIF',
                                                    'PDF',
                                                    'TIFF',
                                                    'SVG',
                                                    'WEBP',
                                                    'Source File With TIFF',
                                                    'Source File With PSD',
                                                ].map((format) => ({
                                                    label: format,
                                                    value: format,
                                                }))}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="backgroundOption"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Background Option{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                selected={field.value}
                                                options={[
                                                    'Transparent',
                                                    'White',
                                                    'Original Background',
                                                    'Colored',
                                                ].map((option) => ({
                                                    label: option,
                                                    value: option,
                                                }))}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {backgroundOption?.includes('Colored') && (
                            <FormField
                                control={control}
                                name="backgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Background Colors (Hex codes){' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                {(field.value ?? []).map(
                                                    (
                                                        color: string,
                                                        index: number
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <input
                                                                type="color"
                                                                value={color}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...(field.value ??
                                                                                []),
                                                                        ];
                                                                    next[
                                                                        index
                                                                    ] =
                                                                        e.target.value;
                                                                    field.onChange(
                                                                        next
                                                                    );
                                                                }}
                                                                className="h-10 w-10 !rounded-full p-0 border-none"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={color}
                                                                placeholder="#FFFFFF"
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...(field.value ??
                                                                                []),
                                                                        ];
                                                                    next[
                                                                        index
                                                                    ] =
                                                                        e.target.value;
                                                                    field.onChange(
                                                                        next
                                                                    );
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="bg-red-50 text-destructive border-destructive"
                                                                onClick={() => {
                                                                    const next =
                                                                        [
                                                                            ...(field.value ??
                                                                                []),
                                                                        ];
                                                                    next.splice(
                                                                        index,
                                                                        1
                                                                    );
                                                                    field.onChange(
                                                                        next
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        field.onChange([
                                                            ...(field.value ??
                                                                []),
                                                            '#FFFFFF',
                                                        ])
                                                    }
                                                >
                                                    Add Color
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={control}
                            name="imageResizing"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image Resizing</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="resizing-yes"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label htmlFor="resizing-yes">
                                                Yes
                                            </Label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {resizingEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
                                <FormField
                                    control={control}
                                    name="width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Width{' '}
                                                <span className="text-xs text-destructive">
                                                    (px)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter Width"
                                                    type="number"
                                                    value={field.value || ''}
                                                    step="1"
                                                    min="0"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Height{' '}
                                                <span className="text-xs text-destructive">
                                                    (px)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter Height"
                                                    type="number"
                                                    value={field.value || ''}
                                                    step="1"
                                                    min="0"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={control}
                            name="instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Instructions{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any specific edit instructions"
                                            className="min-h-24"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'View Prices'}
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <ArrowRight />
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
