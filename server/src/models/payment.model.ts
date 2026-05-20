import { model, Schema } from "mongoose";
import { IPayment } from "../types/payment.interface.js";

const paymentSchema = new Schema<IPayment>(
    {
        paymentID: { type: String, required: true, unique: true, index: true },
        checkoutSessionID: { type: String, index: true },
        userID: { type: String, required: true },
        orderID: { type: String, required: true, index: true },
        paymentOption: { type: String, required: true },
        paymentMethod: { type: String },
        paymentIntentID: { type: String },
        paymentMethodID: { type: String },
        customerID: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String },
        tax: { type: Number },
        totalAmount: { type: Number },
        status: {
            type: String,
            enum: ["pending", "succeeded", "paid", "failed", "refunded"],
            default: "pending",
        },
    },
    { timestamps: true }
);

paymentSchema.index(
    { orderID: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);

export const PaymentModel = model<IPayment>("Payment", paymentSchema);
