// services/payment.service.ts
import {
    endOfMonth,
    startOfMonth,
    parse,
    subMonths,
    startOfYear,
    endOfYear,
    subYears,
} from "date-fns";
import { PaymentModel } from "../models/payment.model.js";
import { IPayment } from "../types/payment.interface.js";
import { OrderModel } from "../models/order.model.js";
import { IOrder } from "../types/order.interface.js";
import { PendingOrderModel } from "../models/pendingOrder.model.js";
import { nanoid } from "nanoid";

import { PaymentLedgerModel } from "../models/paymentLedger.model.js";

async function newPaymentInDB({
    userID,
    orderID, // could be orderID or pendingOrderID
    paymentOption,
    paymentMethodID,
    paymentIntentID,
    customerID,
    status,
    amount: rawAmount, // Ignored to prevent tampering
    currency,
}: Partial<IPayment>) {
    if (!orderID) throw new Error("Order ID or Pending Order ID is required.");

    let targetOrderID = orderID;
    let finalAmount = 0;
    let finalCurrency = currency || "USD";

    let pendingOrderRecord = null;
    let orderRecord = null;

    let pricingType = "";
    let price = 0;
    let imagesCount = 0;

    // Check if it's a pending order ID (starts with "PO")
    if (orderID.startsWith("PO")) {
        pendingOrderRecord = await PendingOrderModel.findOne({ pendingOrderID: orderID });
        if (!pendingOrderRecord) {
            throw new Error("Pending Order not found with this id.");
        }
        finalAmount = pendingOrderRecord.total || 0;
        pricingType = pendingOrderRecord.pricingType || "";
        price = pendingOrderRecord.price || 0;
        imagesCount = pendingOrderRecord.imagesCount || 0;
    } else {
        orderRecord = await OrderModel.findOne({ orderID });
        if (!orderRecord) {
            throw new Error("Order not found with this id.");
        }
        finalAmount = orderRecord.total || 0;
        pricingType = orderRecord.pricingType || "";
        price = orderRecord.price || 0;
        imagesCount = orderRecord.imagesCount || 0;
    }

    // --- MATH PRICE/COUNT GUARD CHECK ---
    let calculatedTotal = 0;
    if (pricingType === "per-image") {
        calculatedTotal = price * imagesCount;
    } else {
        // flat-rate pricing
        calculatedTotal = price;
    }

    if (Math.abs(calculatedTotal - finalAmount) > 0.01) {
        throw new Error(
            `Billing Guard Violation: Math mismatch. Expected total of ${calculatedTotal} (${pricingType} pricing with unit price ${price} and count ${imagesCount}) but database record shows ${finalAmount}.`
        );
    }

    // Process order transition
    if (orderID.startsWith("PO") && pendingOrderRecord) {
        // Convert PendingOrder to real Order
        targetOrderID = `WBO${nanoid(10).toUpperCase()}`;
        orderRecord = await OrderModel.create({
            orderID: targetOrderID,
            user: pendingOrderRecord.user,
            title: pendingOrderRecord.title,
            pricingType: pendingOrderRecord.pricingType,
            price: pendingOrderRecord.price,
            imagesCount: pendingOrderRecord.imagesCount,
            details: pendingOrderRecord.details,
            total: pendingOrderRecord.total,
            orderStage: "payment-completed",
            status: "pending",
            paymentStatus: "pay-later",
        });

        // Delete PendingOrder
        await PendingOrderModel.deleteOne({ pendingOrderID: orderID });
    } else {
        if (!orderRecord) {
            orderRecord = await OrderModel.findOne({ orderID: targetOrderID });
        }
    }

    if (!orderRecord) throw new Error("Order not found.");

    // generate paymentID if not passed or if it's generic "pending"
    const paymentID = (paymentMethodID && paymentMethodID !== "pending") ? paymentMethodID : `WBP${nanoid(10).toUpperCase()}`;

    // ✅ check if payment already exists for (orderID + status)
    let payment = await PaymentModel.findOne({ orderID: targetOrderID, status });

    if (payment) {
        // update existing payment
        await PaymentModel.updateOne(
            { _id: payment._id },
            {
                $set: {
                    userID,
                    paymentOption,
                    paymentMethodID,
                    paymentIntentID,
                    customerID,
                    status,
                    amount: finalAmount, // Overridden securely
                    currency: finalCurrency,
                },
            }
        );
    } else {
        // create new payment
        payment = await PaymentModel.create({
            paymentID,
            userID,
            orderID: targetOrderID,
            paymentOption,
            paymentMethodID,
            paymentIntentID,
            customerID,
            status,
            amount: finalAmount, // Overridden securely
            currency: finalCurrency,
        });
    }

    // update order
    orderRecord.paymentID = payment.paymentID;
    orderRecord.paymentStatus = (paymentOption === "pay-later" ? "pay-later" : (status || "pending")) as IOrder["paymentStatus"];
    orderRecord.orderStage = "payment-completed"; // ✅ always allow count
    await orderRecord.save();

    // Record Action in Audit Ledger
    const ledgerID = `LGR-${nanoid(10).toUpperCase()}`;
    const ledgerAction = paymentOption === "pay-later" ? "PAY_LATER_CREATED" : "COMPLETED";
    await PaymentLedgerModel.create({
        ledgerID,
        userID: userID || orderRecord.user?.userID || "UNKNOWN",
        orderID: targetOrderID,
        paymentID,
        action: ledgerAction,
        amount: finalAmount,
        currency: finalCurrency.toUpperCase(),
        metadata: {
            paymentOption,
            paymentMethodID,
            status,
            rawAmountFromClient: rawAmount, // For audit trail
        },
    });

    return { order: orderRecord, payment };
}

export async function getPaymentsByStatusFromDB({
    status,
    paymentOption,
    month,
    userID,
    role,
}: {
    status?: string;
    paymentOption: string;
    month?: string;
    userID?: string;
    role?: string;
}): Promise<{
    current: IPayment[];
    previous: IPayment[];
    payments: IPayment[];
}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: Record<string, any> = { paymentOption };

    if (status) baseQuery.status = status;
    if (role === "user" && userID) baseQuery.userID = userID;

    let currentStart: Date, currentEnd: Date;
    let previousStart: Date, previousEnd: Date;

    if (month) {
        const parsed = parse(month, "MMMM", new Date());
        currentStart = startOfMonth(parsed);
        currentEnd = endOfMonth(parsed);

        const prevDate = subMonths(parsed, 1);
        previousStart = startOfMonth(prevDate);
        previousEnd = endOfMonth(prevDate);
    } else {
        const now = new Date();
        currentStart = startOfYear(now);
        currentEnd = endOfYear(now);

        const prevDate = subYears(now, 1);
        previousStart = startOfYear(prevDate);
        previousEnd = endOfYear(prevDate);
    }

    const current = await PaymentModel.find({
        ...baseQuery,
        createdAt: { $gte: currentStart, $lte: currentEnd },
    });

    const previous = await PaymentModel.find({
        ...baseQuery,
        createdAt: { $gte: previousStart, $lte: previousEnd },
    });

    const payments = await PaymentModel.find(baseQuery);

    return { current, previous, payments };
}

async function getPaymentByOrderIDFromDB(orderID: string) {
    return await PaymentModel.findOne({ orderID });
}

async function getPaymentsByUserIDFromDB(userID: string) {
    return await PaymentModel.find({ userID });
}

const PaymentServices = {
    newPaymentInDB,
    getPaymentsByStatusFromDB,
    getPaymentByOrderIDFromDB,
    getPaymentsByUserIDFromDB,
};

export default PaymentServices;
