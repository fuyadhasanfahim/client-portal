import { nanoid } from "nanoid";
import stripe from "../lib/stripe.js";
import { OrderModel } from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import { PaymentModel } from "../models/payment.model.js";
import { PendingOrderModel } from "../models/pendingOrder.model.js";
import envConfig from "../config/env.config.js";
import Stripe from "stripe";
import { sendEmail } from "../lib/nodemailer.js";

async function newOrderCheckoutInDB(
    id: string,
    paymentOption: string,
    paymentMethod: string,
    type: "order" | "pending"
) {
    try {
        let total = 0;
        let title = "";
        let userID = "";
        let currency = "usd";

        if (type === "pending") {
            const pendingOrder = await PendingOrderModel.findOne({ pendingOrderID: id });
            if (!pendingOrder) {
                throw new Error("Pending Order not found with this id.");
            }
            total = pendingOrder.total || 0;
            title = pendingOrder.title || `Order ${id}`;
            userID = pendingOrder.user.userID;
        } else {
            const order = await OrderModel.findOne({ orderID: id });
            if (!order) {
                throw new Error("Order not found with this id.");
            }
            total = order.total || 0;
            title = order.title || `Order #${id}`;
            userID = order.user.userID;
        }

        const user = await UserModel.findOne({ userID });
        if (!user) {
            throw new Error("No user info found.");
        }
        currency = user.currency ?? "usd";

        const orderSessionId = `PAYMENT-${nanoid(10)}`;

        // 🔹 Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            ui_mode: "embedded" as any,
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: { name: title },
                        unit_amount: Math.round(total * 100),
                    },
                    quantity: 1,
                },
            ],
            return_url: `${envConfig.frontend_url}/orders/order-payment/complete?session_id={CHECKOUT_SESSION_ID}`,
            metadata: type === "pending" ? {
                pendingOrderID: id,
                userID,
                orderSessionId,
                paymentOption,
                paymentMethod,
            } : {
                orderID: id,
                userID,
                orderSessionId,
                paymentOption,
                paymentMethod,
            },
        });

        if (type === "order") {
            // For existing orders, we upsert payment record and update order status
            await PaymentModel.findOneAndUpdate(
                { orderID: id, status: "pending" },
                {
                    paymentID: orderSessionId,
                    checkoutSessionID: session.id,
                    userID,
                    orderID: id,
                    paymentOption,
                    paymentMethod,
                    status: "pending",
                    amount: total,
                    currency,
                },
                { upsert: true, new: true }
            );

            await OrderModel.findOneAndUpdate(
                { orderID: id },
                {
                    paymentID: orderSessionId,
                    paymentStatus: "pending",
                    orderStage: "payment-completed",
                }
            );
        }

        return session.client_secret;
    } catch (error) {
        console.error("❌ Error in newOrderCheckoutInDB:", error);
        throw error;
    }
}

async function constructStripeEvent(
    rawBody: Buffer,
    signature: string,
    secret: string
) {
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

async function paymentWebhookInDB(session: any) {
    try {
        const metadata = session.metadata;

        if (!metadata?.userID || (!metadata?.orderID && !metadata?.pendingOrderID)) {
            throw new Error("Missing metadata in session.");
        }

        const { orderID, pendingOrderID, userID, paymentOption, paymentMethod, orderSessionId } = metadata;

        let finalOrderID = "";

        if (pendingOrderID) {
            const pendingOrder = await PendingOrderModel.findOne({ pendingOrderID }).lean();
            if (!pendingOrder) {
                console.log(`PendingOrder ${pendingOrderID} not found, probably already handled.`);
                return;
            }

            finalOrderID = `WBO${nanoid(10).toUpperCase()}`;

            // Create the actual Order
            await OrderModel.create({
                orderID: finalOrderID,
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
                paymentID: session.payment_intent?.toString(),
            });

            // Create Payment record
            const paymentData = {
                paymentID: orderSessionId,
                checkoutSessionID: session.id,
                userID,
                orderID: finalOrderID,
                paymentOption,
                paymentMethod,
                customerID: session.customer?.toString(),
                amount: (session.amount_subtotal ?? 0) / 100,
                tax: (session.total_details?.amount_tax ?? 0) / 100,
                totalAmount: (session.amount_total ?? 0) / 100,
                currency: session.currency,
                status: session.payment_status as "pending" | "succeeded" | "failed" | "refunded",
                paymentIntentID: session.payment_intent?.toString(),
            };

            await PaymentModel.create(paymentData);

            // Remove pending order
            await PendingOrderModel.deleteOne({ pendingOrderID });
        } else {
            finalOrderID = orderID;

            const existingPayment = await PaymentModel.findOne({ orderID });
            const paymentData = {
                paymentID: orderSessionId,
                checkoutSessionID: session.id,
                userID,
                orderID,
                paymentOption,
                paymentMethod,
                customerID: session.customer?.toString(),
                amount: (session.amount_subtotal ?? 0) / 100,
                tax: (session.total_details?.amount_tax ?? 0) / 100,
                totalAmount: (session.amount_total ?? 0) / 100,
                currency: session.currency,
                status: session.payment_status as "pending" | "succeeded" | "failed" | "refunded",
                paymentIntentID: session.payment_intent?.toString(),
            };

            if (existingPayment) {
                await PaymentModel.updateOne({ _id: existingPayment._id }, paymentData);
            } else {
                await PaymentModel.create(paymentData);
            }

            await OrderModel.findOneAndUpdate(
                { orderID },
                {
                    paymentStatus: "paid",
                    orderStage: "payment-completed",
                    paymentID: session.payment_intent?.toString(),
                }
            );
        }

        const user = await UserModel.findOne({ userID });

        if (user?.email) {
            const paymentHtml = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                <h2 style="color: #0f9d58; margin-bottom: 12px;">🎉 Payment Confirmed!</h2>

                <p>Hi ${user.name || "there"},</p>

                <p>Thank you for your payment! We're excited to let you know that your order has been successfully marked as <strong style="color: #0f9d58;">Paid</strong> and is now being processed.</p>

                <div style="margin: 20px 0; padding: 16px; background-color: #f9f9f9; border-left: 4px solid #0f9d58;">
                    <p><strong>User ID:</strong> ${userID}</p>
                    <p><strong>Order ID:</strong> ${finalOrderID}</p>
                    <p><strong>Amount Paid:</strong> ${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase()}</p>
                </div>

                <p>You can expect an update once your order is completed and ready for delivery.</p>
                <p>If you have any questions, feel free to reach out to us anytime.</p>

                <p style="margin-top: 30px;">Best regards,<br /><strong>The Web Briks Team</strong></p>
            </div>
        </div>`;

            // Email to client
            await sendEmail({
                from: process.env.EMAIL_USER!,
                to: user.email,
                subject: `✅ Payment Completed - Order #${finalOrderID}`,
                html: paymentHtml,
            });

            // Email to admin
            await sendEmail({
                from: user.email,
                to: process.env.EMAIL_USER!,
                subject: `New Order Created (Paid) — #${finalOrderID}`,
                html: paymentHtml,
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const StripeServices = {
    newOrderCheckoutInDB,
    constructStripeEvent,
    paymentWebhookInDB,
};
export default StripeServices;
