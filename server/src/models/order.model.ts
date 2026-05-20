import { Schema, model } from "mongoose";
import {
    IOrderUser,
    IOrder,
    IOrderDetails,
} from "../types/order.interface.js";

const OrderUserSchema = new Schema<IOrderUser>(
    {
        userID: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        image: String,
        company: String,
        address: String,
    },
    { timestamps: true }
);

const OrderDetailsSchema = new Schema<IOrderDetails>(
    {
        deliveryDate: { type: Date },
        downloadLink: { type: String },
        deliveryLink: {
            type: String,
            required: false,
        },
        images: { type: Number },
        returnFileFormat: [{ type: String }],
        backgroundOption: [{ type: String }],
        backgroundColor: [{ type: String }],
        imageResizing: { type: Boolean },
        width: { type: Number },
        height: { type: Number },
        instructions: { type: String },
    },
    { timestamps: true }
);

export const OrderSchema = new Schema<IOrder>(
    {
        orderID: { type: String, required: true, unique: true },
        user: { type: OrderUserSchema, required: true },
        title: { type: String, required: true },
        pricingType: { type: String, enum: ["per-image", "total"], required: true },
        price: { type: Number, required: true },
        imagesCount: { type: Number, required: true },
        details: { type: OrderDetailsSchema },
        total: {
            type: Number,
            required: true,
        },
        isRevision: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "in_review",
                "completed",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        paymentID: { type: String },
        paymentStatus: {
            type: String,
            enum: ["pending", "succeeded", "paid", "failed", "refunded", "pay-later"],
            default: "pending",
        },
        refundID: {
            type: String,
        },
        orderStage: {
            type: String,
            enum: [
                "draft",
                "details-provided",
                "payment-completed",
            ],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

export const OrderModel = model<IOrder>("Order", OrderSchema);
