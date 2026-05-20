/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
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
import { Loader2, Truck, Link as LinkIcon } from 'lucide-react';
import ApiError from '@/components/shared/ApiError';
import { useDeliverOrderMutation } from '@/redux/features/orders/ordersApi';

export default function DeliveryLinkUploader({
    orderID,
}: {
    orderID: string;
    userID: string;
}) {
    const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
    const [deliveryLink, setDeliveryLink] = useState('');

    const [deliverOrder, { isLoading }] = useDeliverOrderMutation();

    async function handleDeliver() {
        try {
            const link = deliveryLink.trim();
            if (!link) {
                toast.error('Please paste a delivery link.');
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
                setDeliveryLink('');
                setDeliverDialogOpen(false);
            }
        } catch (err) {
            ApiError(err);
        }
    }

    return (
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

            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        Add Delivery Link
                    </DialogTitle>
                    <DialogDescription>
                        Paste an external link (Google Drive, Dropbox, etc.)
                        where the client can download the delivered files.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label
                            htmlFor="deliveryLink"
                            className="text-sm font-medium"
                        >
                            Delivery Link <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="deliveryLink"
                                placeholder="https://drive.google.com/..."
                                value={deliveryLink}
                                onChange={(e) =>
                                    setDeliveryLink(e.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Paste a Google Drive, Dropbox, or any external download link.
                        </p>
                    </div>
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
                        type="button"
                        onClick={handleDeliver}
                        disabled={isLoading || !deliveryLink.trim()}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Truck className="mr-2 h-4 w-4" />
                        )}
                        Confirm Delivery
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
