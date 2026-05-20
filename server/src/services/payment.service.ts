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
import { nanoid } from "nanoid";

async function newPaymentInDB({
    userID,
    orderID,
    paymentOption,
    paymentMethodID,
    paymentIntentID,
    customerID,
    status,
    amount,
    currency,
}: Partial<IPayment>) {
    const order = await OrderModel.findOne({ orderID });
    if (!order) throw new Error("Order not found with this order id.");

    // generate paymentID if not passed
    const paymentID = paymentMethodID || `WBP${nanoid(10)}`;

    // ✅ check if payment already exists for (orderID + status)
    let payment = await PaymentModel.findOne({ orderID, status });

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
                    amount,
                    currency,
                },
            }
        );
    } else {
        // create new payment
        payment = await PaymentModel.create({
            paymentID,
            userID,
            orderID,
            paymentOption,
            paymentMethodID,
            paymentIntentID,
            customerID,
            status,
            amount,
            currency,
        });
    }

    // update order
    order.paymentID = payment.paymentID;
    order.paymentStatus = status as IPayment["status"]; // pending | pay-later | paid
    order.orderStage = "payment-completed"; // ✅ always allow count
    await order.save();

    return { order, payment };
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
