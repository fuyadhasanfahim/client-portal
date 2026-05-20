import { Request, Response } from "express";
import PaymentServices from "../services/payment.service.js";
import { IPayment } from "../types/payment.interface.js";
import { sendNotification } from "../utils/sendNotification.js";
import envConfig from "../config/env.config.js";
import { io } from "../server.js";

async function newPayment(req: Request, res: Response) {
    try {
        const {
            userID,
            orderID,
            paymentOption,
            paymentMethodID,
            paymentIntentID,
            customerID,
            status,
            amount,
            currency,
        } = req.body;

        if (!userID || !orderID || !paymentOption || !status) {
            res.status(400).json({
                success: false,
                message: "Missing the required fields.",
            });
            return;
        }

        const data = await PaymentServices.newPaymentInDB({
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

        if (data.order.orderStage === "payment-completed") {
            await sendNotification({
                isAdmin: true,
                title: `📝 New Order #${data.order.orderID} Created`,
                message: `Your new order has been placed and is being processed.`,
                link: `${envConfig.frontend_url}/orders/details/${data.order.orderID}`,
            });

            io.to("admin-room").emit("new-order");
        }

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Internal Server Error",
        });
    }
}

async function getPaymentsByStatus(req: Request, res: Response) {
    try {
        const { status } = req.params as any;
        const { paymentOption, month, userID, role } = req.query;

        if (!paymentOption) {
            res.status(400).json({
                success: false,
                message: "Missing required query param: paymentOption",
            });
            return;
        }

        const { payments, current, previous } =
            await PaymentServices.getPaymentsByStatusFromDB({
                status,
                paymentOption: paymentOption as string,
                month: month as string,
                userID: userID as string,
                role: role as string,
            });

        const totalAmount = payments.reduce(
            (sum: number, payment: IPayment) => {
                if (status === "paid") {
                    return sum + (payment.totalAmount || 0);
                }

                return sum + (payment.amount || 0);
            },
            0
        );

        const sum = (payments: IPayment[]) =>
            payments.reduce(
                (acc, p) =>
                    acc +
                    (status === "paid" ? p.totalAmount || 0 : p.amount || 0),
                0
            );

        const currentTotal = sum(current);
        const previousTotal = sum(previous);

        const growthPercentage =
            previousTotal > 0
                ? ((currentTotal - previousTotal) / previousTotal) * 100
                : currentTotal > 0
                  ? 100
                  : 0;

        res.status(200).json({
            success: true,
            data: {
                amount: totalAmount,
                length: payments.length,
                currentAmount: currentTotal,
                previousAmount: previousTotal,
                growthPercentage: Number(growthPercentage.toFixed(2)),
                currentCount: current.length,
                previousCount: previous.length,
                period: month ? "monthly" : "yearly",
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Internal Server Error",
        });
    }
}

async function getPaymentByOrderID(req: Request, res: Response) {
    try {
        const { orderID } = req.params as any;

        if (!orderID) {
            res.status(400).json({
                success: false,
                message: "Order id is required",
            });
            return;
        }

        const payment =
            await PaymentServices.getPaymentByOrderIDFromDB(orderID);

        if (!payment) {
            res.status(404).json({
                success: false,
                message: "No payment found with this order id.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Internal Server Error",
        });
    }
}

async function getPaymentsByUserID(req: Request, res: Response) {
    try {
        const { userID } = req.params as any;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User id is required",
            });
            return;
        }

        const payments =
            await PaymentServices.getPaymentsByUserIDFromDB(userID);

        if (!payments || payments.length === 0) {
            res.status(404).json({
                success: false,
                message: "No payments found with this user id.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: payments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Internal Server Error",
        });
    }
}

const PaymentControllers = {
    newPayment,
    getPaymentsByStatus,
    getPaymentByOrderID,
    getPaymentsByUserID,
};

export default PaymentControllers;
