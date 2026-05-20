import { Router } from "express";
import axios from "axios";
import envConfig from "../config/env.config.js";
import { OrderModel } from "../models/order.model.js";
import { PaymentModel } from "../models/payment.model.js";
import { IOrder } from "../types/order.interface.js";

const router = Router();

const { paypal_client_id, paypal_client_secret, paypal_api_base_url } =
    envConfig;

/**
 * Calculate PayPal line items + total
 */
function calculateOrderTotal(order: IOrder): {
    items: any[];
    total: number;
} {
    const total = order.total || 0;
    const items = [
        {
            name: order.title || `Order #${order.orderID}`,
            unit_amount: {
                currency_code: "USD",
                value: total.toFixed(2),
            },
            quantity: "1",
        },
    ];

    return { items, total };
}

/**
 * Get PayPal OAuth access token
 */
async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(
        `${paypal_client_id}:${paypal_client_secret}`
    ).toString("base64");

    try {
        const res = await axios.post(
            `${paypal_api_base_url}/v1/oauth2/token`,
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return res.data.access_token;
    } catch (error: any) {
        console.error(
            "PayPal token generation failed:",
            error.response?.data || error.message
        );
        throw new Error("Failed to generate PayPal access token");
    }
}

/**
 * Create PayPal Order
 */
router.post("/create-order", async (req, res) => {
    try {
        const { orderID } = req.body;
        if (!orderID) {
            res.status(400).json({ error: "Order ID is required" });
            return;
        }

        const order = await OrderModel.findOne({ orderID });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        if (order.paymentStatus === "paid") {
            res.status(400).json({ error: "Order already paid" });
            return;
        }

        const accessToken = await getAccessToken();
        const { items, total } = calculateOrderTotal(order);

        const response = await axios.post(
            `${paypal_api_base_url}/v2/checkout/orders`,
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: order.orderID.toString(),
                        description: `Order ${order.orderID} payment`,
                        amount: {
                            currency_code: "USD",
                            value: total.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: total.toFixed(2),
                                },
                            },
                        },
                        items,
                    },
                ],
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // ✅ Record pending payment
        await PaymentModel.create({
            paymentID: response.data.id,
            checkoutSessionID: response.data.id,
            userID: order.user.userID,
            orderID,
            paymentOption: "paypal",
            paymentMethod: "paypal",
            status: "pending",
            amount: total,
            currency: "USD",
        });

        order.paymentID = response.data.id;
        order.paymentStatus = "pending";
        order.orderStage = "payment-completed"; // ✅ force stage to count order
        await order.save();

        res.json({
            paypalOrderID: response.data.id,
            status: response.data.status,
            links: response.data.links,
        });
    } catch (error: any) {
        console.error(
            "PayPal Create Order Failed:",
            error.response?.data || error.message
        );
        res.status(500).json({
            error: "Failed to create PayPal order",
            details: error.response?.data || error.message,
        });
    }
});

/**
 * Capture PayPal Order
 */
router.post("/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${paypal_api_base_url}/v2/checkout/orders/${orderID}/capture`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const order = await OrderModel.findOne({ paymentID: orderID });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        const payment = await PaymentModel.findOne({ paymentID: orderID });
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            return;
        }

        if (response.data.status === "COMPLETED") {
            order.paymentStatus = "paid";
            await order.save();

            await PaymentModel.updateOne(
                { _id: payment._id },
                {
                    status: "paid",
                    totalAmount: payment.amount,
                    // you can also store payer details from response.data if needed
                }
            );
        }

        res.json({
            status: response.data.status,
            orderStage: order.orderStage,
            paymentStatus: order.paymentStatus,
        });
    } catch (error: any) {
        console.error(
            "PayPal Capture Failed:",
            error.response?.data || error.message
        );
        res.status(500).json({
            error: error.response?.data || "Failed to capture PayPal payment",
        });
    }
});

export const paypalRoute = router;
