import { model, Schema } from "mongoose";
import { IRefund } from "../types/refund.interface.js";

const refundSchema = new Schema<IRefund>(
    {
        paymentID: { type: String, required: true },
        orderID: { type: String, required: true },
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["processing", "completed", "failed"],
            default: "processing",
        },
    },
    { timestamps: true }
);

export const RefundModel = model<IRefund>("Refund", refundSchema);
