import { Document } from "mongoose";

export interface IOrderUser {
    userID: string;
    name: string;
    email: string;
    image?: string;
    company?: string;
    address?: string;
}

export interface IOrderDetails {
    deliveryDate?: Date;
    downloadLink?: string;
    deliveryLink?: string;
    images?: number;
    returnFileFormat?: string[];
    backgroundOption?: string[];
    backgroundColor?: string[];
    imageResizing?: boolean;
    width?: number;
    height?: number;
    instructions?: string;
}

export interface IOrder extends Document {
    orderID: string;
    user: IOrderUser;
    title: string;
    pricingType: "per-image" | "total";
    price: number;
    imagesCount: number;
    details?: IOrderDetails;
    total: number;
    isRevision?: boolean;
    status:
        | "pending"
        | "in_progress"
        | "in_review"
        | "completed"
        | "delivered"
        | "cancelled";
    paymentID?: string;
    paymentStatus: "pending" | "succeeded" | "paid" | "failed" | "refunded" | "pay-later";
    refundID?: string;
    orderStage:
        | "draft"
        | "details-provided"
        | "payment-completed";
    createdAt: Date;
    updatedAt: Date;
}
