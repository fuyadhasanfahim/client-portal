import { Document } from "mongoose";

export interface IPaymentLedger extends Document {
    ledgerID: string;
    userID: string;
    orderID: string;
    paymentID?: string;
    action: "INITIALIZED" | "WEBHOOK_RECEIVED" | "CAPTURED" | "PAY_LATER_CREATED" | "COMPLETED" | "FAILED";
    amount: number;
    currency: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
