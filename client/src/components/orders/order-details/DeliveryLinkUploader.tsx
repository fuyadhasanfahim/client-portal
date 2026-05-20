/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Truck } from 'lucide-react';
import ApiError from '@/components/shared/ApiError';
import { useDeliverOrderMutation } from '@/redux/features/orders/ordersApi';
import FileUploadField from '@/components/shared/FileUploadField';

type FormValues = {
    deliveryLink: string;
    images: number;
};

export default function DeliveryLinkUploader({
    orderID,
    userID,
}: {
    orderID: string;
    userID: string;
}) {
    const methods = useForm<FormValues>({
        defaultValues: { deliveryLink: '', images: 0 },
    });
    const { handleSubmit, watch, reset, setValue } = methods;

    const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
    const [deliveryTitle, setDeliveryTitle] = useState('');

    const [deliverOrder, { isLoading }] = useDeliverOrderMutation();
    const deliveryLink = watch('deliveryLink');

    async function deliverNow(link: string) {
        try {
            if (!link?.trim()) {
                toast.error('Please upload files or paste a link.');
                return;
            }

            const response = await deliverOrder({
                orderID,
                deliveryLink: link,
            }).unwrap();

            if ((response as any)?.success) {
                toast.success(
                    (response as any)?.message || 'Delivery submitted'
                );
                reset();
                setDeliveryTitle('');
                setDeliverDialogOpen(false);
            }
        } catch (err) {
            ApiError(err);
        }
    }

    function onSubmit(data: FormValues) {
        return deliverNow(data.deliveryLink);
    }

    return (
        <FormProvider {...methods}>
            <Dialog
                open={deliverDialogOpen}
                onOpenChange={setDeliverDialogOpen}
            >
                <DialogTrigger asChild>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white mx-6"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Deliver Now
                            </span>
                        )}
                    </Button>
                </DialogTrigger>

                {/* Taller dialog with scroll if content grows */}
                <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            Add Delivery Details
                        </DialogTitle>
                        <DialogDescription>
                            Upload your files (recommended) or paste an external
                            link. If you upload, we’ll create a delivery folder
                            and set the latest delivery link automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label
                                htmlFor="deliveryTitle"
                                className="text-sm font-medium"
                            >
                                Delivery Title (optional)
                            </Label>
                            <Input
                                id="deliveryTitle"
                                placeholder="e.g. first-revision, final-files"
                                value={deliveryTitle}
                                onChange={(e) =>
                                    setDeliveryTitle(e.target.value)
                                }
                            />
                        </div>

                        <div className="rounded-md border p-3">
                            <FileUploadField
                                label="Assets"
                                description="Upload files or paste a delivery link"
                                refType="order"
                                refId={orderID}
                                userID={userID ?? ''}
                                as="admin"
                                multiple
                                maxFileSizeMB={51200}
                                required
                                defaultLink={deliveryLink}
                                lockAfterSuccess
                                onCompleted={(url: string) => {
                                    setValue(
                                        'deliveryLink',
                                        `${process.env.NEXT_PUBLIC_BASE_URL}/${url}`,
                                        {
                                            shouldDirty: true,
                                        }
                                    );
                                    void deliverNow(url);
                                }}
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDeliverDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={isLoading || !deliveryLink}
                                title={
                                    !deliveryLink
                                        ? 'Add files or link first'
                                        : undefined
                                }
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                <span className="ml-2">Confirm Delivery</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </FormProvider>
    );
}
