import { Router } from "express";
import axios from "axios";
import { nanoid } from "nanoid";
import envConfig from "../config/env.config.js";
import { OrderModel } from "../models/order.model.js";
import { PaymentModel } from "../models/payment.model.js";
import { PendingOrderModel } from "../models/pendingOrder.model.js";
import UserModel from "../models/user.model.js";
import { sendEmail } from "../lib/nodemailer.js";
import { PaymentLedgerModel } from "../models/paymentLedger.model.js";

const router = Router();

const { paypal_client_id, paypal_client_secret, paypal_api_base_url } =
    envConfig;

/**
 * Calculate PayPal line items + total
 */
function calculateOrderTotal(order: any): {
    items: any[];
    total: number;
} {
    const total = order.total || 0;
    const items = [
        {
            name: order.title || `Order #${order.pendingOrderID || order.orderID}`,
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
        const { pendingOrderID } = req.body;
        if (!pendingOrderID) {
            res.status(400).json({ error: "Pending Order ID is required" });
            return;
        }

        const isPending = pendingOrderID.startsWith("PO");
        const pendingOrder = isPending
            ? await PendingOrderModel.findOne({ pendingOrderID })
            : await OrderModel.findOne({ orderID: pendingOrderID });

        if (!pendingOrder) {
            res.status(404).json({ error: isPending ? "Pending Order not found" : "Order not found" });
            return;
        }

        // --- MATH PRICE/COUNT GUARD CHECK ---
        const pricingType = pendingOrder.pricingType || "";
        const price = pendingOrder.price || 0;
        const imagesCount = pendingOrder.imagesCount || 0;
        const totalAmount = pendingOrder.total || 0;

        let calculatedTotal = 0;
        if (pricingType === "per-image") {
            calculatedTotal = price * imagesCount;
        } else {
            // flat-rate pricing
            calculatedTotal = price;
        }

        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            res.status(400).json({
                error: `Billing Guard Violation: Math mismatch. Expected total of ${calculatedTotal} (${pricingType} pricing with unit price ${price} and count ${imagesCount}) but database record shows ${totalAmount}.`
            });
            return;
        }

        const accessToken = await getAccessToken();
        const pendingOrderAny = pendingOrder as any;
        const { items, total } = calculateOrderTotal(pendingOrderAny);

        const orderRefID = (pendingOrderAny.pendingOrderID || pendingOrderAny.orderID || pendingOrderID).toString();

        const response = await axios.post(
            `${paypal_api_base_url}/v2/checkout/orders`,
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: orderRefID,
                        description: `Order ${orderRefID} payment`,
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

        // ✅ Record pending payment in PaymentModel using pendingOrderID
        await PaymentModel.create({
            paymentID: response.data.id,
            checkoutSessionID: response.data.id,
            userID: pendingOrder.user.userID,
            orderID: pendingOrderID,
            paymentOption: "paypal",
            paymentMethod: "paypal",
            status: "pending",
            amount: total,
            currency: "USD",
        });

        // Record Initialized state in Audit Ledger
        const ledgerID = `LGR-${nanoid(10).toUpperCase()}`;
        await PaymentLedgerModel.create({
            ledgerID,
            userID: pendingOrder.user.userID,
            orderID: pendingOrderID,
            paymentID: response.data.id,
            action: "INITIALIZED",
            amount: total,
            currency: "USD",
            metadata: {
                paypalOrderID: response.data.id,
                paymentOption: "paypal",
                paymentMethod: "paypal",
            },
        });

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
router.post("/:paymentID/capture", async (req, res) => {
    try {
        const { paymentID } = req.params;
        const accessToken = await getAccessToken();

        const response = await axios.post(
            `${paypal_api_base_url}/v2/checkout/orders/${paymentID}/capture`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const payment = await PaymentModel.findOne({ paymentID });
        if (!payment) {
            res.status(404).json({ error: "Payment record not found" });
            return;
        }

        const pendingOrderID = payment.orderID; // stored pendingOrderID in orderID field
        const isPending = pendingOrderID.startsWith("PO");
        const pendingOrder = isPending
            ? await PendingOrderModel.findOne({ pendingOrderID })
            : await OrderModel.findOne({ orderID: pendingOrderID });

        if (!pendingOrder) {
            res.status(404).json({ error: isPending ? "Pending order not found or already completed." : "Order not found." });
            return;
        }

        let newOrderID = pendingOrderID;
        let paymentStatus = "pending";
        let orderStage = "payment-completed";

        if (response.data.status === "COMPLETED") {
            paymentStatus = "paid";

            if (isPending) {
                newOrderID = `WBO${nanoid(10).toUpperCase()}`;
                // 1. Create the actual Order
                await OrderModel.create({
                    orderID: newOrderID,
                    user: pendingOrder.user,
                    title: pendingOrder.title,
                    pricingType: pendingOrder.pricingType,
                    price: pendingOrder.price,
                    imagesCount: pendingOrder.imagesCount,
                    details: pendingOrder.details,
                    total: pendingOrder.total,
                    orderStage: "payment-completed",
                    status: "in_progress",
                    paymentStatus: "paid",
                    paymentID: paymentID,
                });
                
                // 2. Remove pending order after successful creation
                await PendingOrderModel.deleteOne({ pendingOrderID });
            } else {
                // It is already a real Order, so just update it
                await OrderModel.updateOne(
                    { orderID: pendingOrderID },
                    {
                        paymentStatus: "paid",
                        orderStage: "payment-completed",
                        paymentID: paymentID,
                    }
                );
            }

            // 3. Update PaymentModel record to reference the actual orderID and mark paid
            await PaymentModel.updateOne(
                { _id: payment._id },
                {
                    status: "paid",
                    orderID: newOrderID,
                    totalAmount: payment.amount,
                }
            );

            // Record Completed state in Audit Ledger
            const ledgerID = `LGR-${nanoid(10).toUpperCase()}`;
            await PaymentLedgerModel.create({
                ledgerID,
                userID: pendingOrder.user.userID,
                orderID: newOrderID,
                paymentID: paymentID,
                action: "COMPLETED",
                amount: payment.amount,
                currency: "USD",
                metadata: {
                    paypalOrderID: paymentID,
                    paymentOption: "paypal",
                    paymentMethod: "paypal",
                },
            });

            // 4. Send Confirmation Email
            const user = await UserModel.findOne({ userID: pendingOrder.user.userID });
            if (user?.email) {
                await sendEmail({
                    from: process.env.EMAIL_USER!,
                    to: user.email,
                    subject: `✅ Payment Completed - Order #${newOrderID}`,
                    html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                    <h2 style="color: #0f9d58; margin-bottom: 12px;">🎉 Payment Confirmed!</h2>
                    <p>Hi ${user.name || "there"},</p>
                    <p>Thank you for your payment! We're excited to let you know that your order has been successfully marked as <strong style="color: #0f9d58;">Paid</strong> and is now being processed via <strong>PayPal</strong>.</p>
                    <div style="margin: 20px 0; padding: 16px; background-color: #f9f9f9; border-left: 4px solid #0f9d58;">
                        <p><strong>User ID:</strong> ${pendingOrder.user.userID}</p>
                        <p><strong>Order ID:</strong> ${newOrderID}</p>
                        <p><strong>Amount Paid:</strong> ${payment.amount} USD</p>
                    </div>
                    <p>You can expect an update once your order is completed and ready for delivery.</p>
                    <p>If you have any questions, feel free to reach out to us anytime.</p>
                    <p style="margin-top: 30px;">Best regards,<br /><strong>The Project Pixel Forge Team</strong></p>
                </div>
            </div>`,
                });
            }
        } else {
            // Record Failed state in Audit Ledger
            const ledgerID = `LGR-${nanoid(10).toUpperCase()}`;
            await PaymentLedgerModel.create({
                ledgerID,
                userID: pendingOrder.user.userID,
                orderID: pendingOrderID,
                paymentID: paymentID,
                action: "FAILED",
                amount: payment.amount,
                currency: "USD",
                metadata: {
                    paypalOrderID: paymentID,
                    paypalResponseStatus: response.data.status,
                    paymentOption: "paypal",
                    paymentMethod: "paypal",
                },
            });
        }

        res.json({
            status: response.data.status,
            orderStage,
            paymentStatus,
            orderID: newOrderID,
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
