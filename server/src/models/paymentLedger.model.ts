import { model, Schema } from "mongoose";
import { IPaymentLedger } from "../types/paymentLedger.interface.js";

const paymentLedgerSchema = new Schema<IPaymentLedger>(
    {
        ledgerID: { type: String, required: true, unique: true, index: true },
        userID: { type: String, required: true, index: true },
        orderID: { type: String, required: true, index: true },
        paymentID: { type: String, index: true },
        action: {
            type: String,
            enum: ["INITIALIZED", "WEBHOOK_RECEIVED", "CAPTURED", "PAY_LATER_CREATED", "COMPLETED", "FAILED"],
            required: true,
        },
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const PaymentLedgerModel = model<IPaymentLedger>("PaymentLedger", paymentLedgerSchema);
