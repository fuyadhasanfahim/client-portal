import FileUpload from '@/models/file-upload.model';
import OrderModel from '@/models/order.model';
import QuoteModel from '@/models/quote.model';
import { IFileItem } from '@/types/file-upload.interface';

export async function getNextRevision(
    refType: 'order' | 'quote',
    refId: string
) {
    const last = (await FileUpload.findOne({
        refType,
        refId,
        uploadedBy: 'admin',
    })
        .sort({ revision: -1 })
        .lean()) as { revision?: number } | null;
    return (last?.revision ?? 0) + 1;
}

export async function recordBatchAndUpdateLinks(params: {
    refType: 'order' | 'quote';
    refId: string;
    userID: string;
    uploadedBy: 'user' | 'admin';
    revision?: number;
    batchId: string;
    s3Prefix: string;
    files: IFileItem[];
}) {
    const {
        refType,
        refId,
        userID,
        uploadedBy,
        revision,
        batchId,
        s3Prefix,
        files,
    } = params;

    await FileUpload.create({
        refType,
        refId,
        userID,
        uploadedBy,
        revision,
        batchId,
        s3Prefix,
        files,
        deletable: uploadedBy === 'user',
    });

    if (refType === 'order') {
        const order = await OrderModel.findOne({ orderID: refId });
        if (!order) return;
        order.details ??= {};
        if (uploadedBy === 'user') {
            order.details.downloadLink = `/orders/${refId}/uploads/${batchId}`;
        } else {
            order.details.deliveryLink = `/orders/${refId}/deliveries/${revision}`;
        }
        await order.save();
    } else {
        const quote = await QuoteModel.findOne({ quoteID: refId });
        if (!quote) return;
        quote.details ??= {};
        if (uploadedBy === 'user') {
            quote.details.downloadLink = `/quotes/${refId}/uploads/${batchId}`;
        } else {
            quote.details.deliveryLink = `/quotes/${refId}/deliveries/${revision}`;
        }
        await quote.save();
    }
}
