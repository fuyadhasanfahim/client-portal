import { Schema, model, Document } from "mongoose";
import { IOrderUser, IOrderDetails } from "../types/order.interface.js";

// We re-use the exact schemas from order.model for consistency
const PendingOrderUserSchema = new Schema<IOrderUser>(
    {
        userID: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        image: String,
        company: String,
        address: String,
    },
    { _id: false }
);

const PendingOrderDetailsSchema = new Schema<IOrderDetails>(
    {
        deliveryDate: { type: Date },
        downloadLink: { type: String },
        deliveryLink: { type: String, required: false },
        images: { type: Number },
        returnFileFormat: [{ type: String }],
        backgroundOption: [{ type: String }],
        backgroundColor: [{ type: String }],
        imageResizing: { type: Boolean },
        width: { type: Number },
        height: { type: Number },
        instructions: { type: String },
    },
    { _id: false }
);

export interface IPendingOrder extends Document {
    pendingOrderID: string;
    user: IOrderUser;
    title: string;
    pricingType: "per-image" | "total";
    price: number;
    imagesCount: number;
    details?: IOrderDetails;
    total: number;
    createdAt: Date;
    expiresAt: Date;
}

export const PendingOrderSchema = new Schema<IPendingOrder>(
    {
        pendingOrderID: { type: String, required: true, unique: true },
        user: { type: PendingOrderUserSchema, required: true },
        title: { type: String, required: true },
        pricingType: { type: String, enum: ["per-image", "total"], required: true },
        price: { type: Number, required: true },
        imagesCount: { type: Number, required: true },
        details: { type: PendingOrderDetailsSchema },
        total: { type: Number, required: true },
        expiresAt: { type: Date, expires: 0, default: () => Date.now() + 24 * 60 * 60 * 1000 }, // Expire after 24 hours
    },
    {
        timestamps: true,
    }
);

export const PendingOrderModel = model<IPendingOrder>("PendingOrder", PendingOrderSchema);
