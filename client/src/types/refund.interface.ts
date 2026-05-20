import { Document } from 'mongoose';

export interface IRefund extends Document {
    refundID: string;
    paymentID: string;
    orderID: string;
    amount: number;
    reason: string;
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
