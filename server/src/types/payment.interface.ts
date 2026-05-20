import { Document } from "mongoose";

export interface IPayment extends Document {
    paymentID: string;
    checkoutSessionID: string;
    userID: string;
    orderID: string;
    paymentOption: string;
    paymentMethod?: string;
    paymentIntentID?: string;
    paymentMethodID?: string;
    customerID?: string;
    amount: number;
    currency?: string;
    tax?: number;
    totalAmount?: number;
    status: "pending" | "succeeded" | "paid" | "failed" | "refunded";
    createdAt: Date;
    updatedAt: Date;
}
