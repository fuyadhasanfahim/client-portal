/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import { OrderModel } from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import {
    IOrder,
    IOrderDetails,
} from "../types/order.interface.js";
import { IPayment } from "../types/payment.interface.js";
import RevisionModel from "../models/revision.model.js";
import { PendingOrderModel } from "../models/pendingOrder.model.js";

async function newOrderInDB({
    orderStage,
    userID,
    title,
    pricingType,
    price,
    imagesCount,
    orderID,
    details,
    total,
    payment,
    paymentStatus,
}: {
    orderStage: any;
    userID?: string;
    title?: string;
    pricingType?: "per-image" | "total";
    price?: number;
    imagesCount?: number;
    orderID?: string;
    details?: IOrderDetails;
    total?: number;
    payment?: IPayment;
    paymentStatus?: string;
}) {
    try {
        const user = await UserModel.findOne({ userID });

        if (!user) throw new Error("User not found!");

        let order;

        if (!orderID) {
            // Create a brand new order in one step
            order = await OrderModel.create({
                orderID: `WBO${nanoid(10).toUpperCase()}`,
                user: {
                    userID,
                    name: user.name,
                    email: user.email,
                    image: user.image ?? "",
                    company: user.company,
                    address: user.address,
                },
                title: title || "New Order",
                pricingType: pricingType || "per-image",
                price: price || 0,
                imagesCount: imagesCount || 0,
                details: details || {},
                total: total || 0,
                orderStage: orderStage || "details-provided",
                paymentStatus: "pending",
                status: "pending",
            });
        } else {
            // Handle updating existing draft/order stage
            if (orderStage === "payment-completed") {
                if (payment) {
                    order = await OrderModel.findOneAndUpdate(
                        { orderID },
                        {
                            paymentID: payment.paymentID,
                            paymentStatus:
                                payment.status === "succeeded"
                                    ? "paid"
                                    : payment.status,
                            status:
                                payment.status === "succeeded"
                                    ? "in_progress"
                                    : "pending",
                            orderStage,
                        },
                        { new: true }
                    );
                } else if (paymentStatus === "pay-later") {
                    order = await OrderModel.findOneAndUpdate(
                        { orderID },
                        {
                            details,
                            total,
                            paymentStatus,
                            status: "pending",
                            orderStage,
                        },
                        { new: true }
                    );
                }
            } else {
                // General update
                order = await OrderModel.findOneAndUpdate(
                    { orderID },
                    {
                        title,
                        pricingType,
                        price,
                        imagesCount,
                        details,
                        total,
                        orderStage,
                    },
                    { new: true }
                );
            }
        }

        return order;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong while processing the order."
        );
    }
}

async function getOrdersFromDB({
    userID,
    role,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filter,
}: {
    userID: string;
    role: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    filter?: string;
    sortOrder?: "asc" | "desc";
}) {
    const query: any = {
        orderStage: "payment-completed",
    };

    if (role === "user") {
        query["user.userID"] = userID;
    }

    if (search) {
        query.$or = [
            { orderID: { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
        ];
    }

    if (filter && filter !== "all") {
        query.status = filter;
    }

    const sort: any = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        OrderModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
        OrderModel.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function getDraftOrdersFromDB({
    userID,
    role,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filter,
}: {
    userID: string;
    role: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    filter?: string;
    sortOrder?: "asc" | "desc";
}) {
    const query: any = {
        orderStage: { $ne: "payment-completed" },
    };

    if (role === "user") {
        query["user.userID"] = userID;
    }

    if (search) {
        query.$or = [
            { orderID: { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
        ];
    }

    if (filter && filter !== "all") {
        query.status = filter;
    }

    const sort: any = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        OrderModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
        OrderModel.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function getOrderByIDFromDB(orderID: string) {
    try {
        const orders = await OrderModel.findOne({
            orderID,
        });

        return orders;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

async function updateOrderInDB({
    orderID,
    data,
}: {
    orderID: string;
    data: Partial<IOrder>;
}) {
    const updatedOrder = await OrderModel.findOneAndUpdate({ orderID }, data, {
        new: true,
    });

    if (!updatedOrder) throw new Error("Order not found");

    return updatedOrder;
}

async function deliverOrderToClient({
    orderID,
    deliveryLink,
}: {
    orderID: string;
    deliveryLink: string;
}) {
    const order = await OrderModel.findOneAndUpdate(
        { orderID },
        { status: "delivered", "details.deliveryLink": deliveryLink },
        { new: true }
    );

    return order;
}

async function reviewOrderToAdmin({
    orderID,
    instructions,
}: {
    orderID: string;
    instructions: string;
}) {
    const order = await OrderModel.findOneAndUpdate(
        { orderID },
        { status: "in_review", isRevision: true },
        { new: true }
    );
    if (!order) throw new Error("Order not found");

    const user = await UserModel.findOne({ userID: order.user.userID });
    if (!user) throw new Error("User not found");

    const now = new Date();
    const message = {
        senderID: user.userID,
        senderName: user.name,
        senderProfileImage: user.image ?? "",
        senderRole: "user" as const,
        message: instructions,
        createdAt: now,
    };

    const revision = await RevisionModel.findOneAndUpdate(
        { orderID },
        {
            $setOnInsert: {
                orderID,
                lastSeenAtAdmin: null,
            },
            $set: {
                status: "open",
                isSeenByAdmin: false,
                isSeenByUser: true,
                lastSeenAtUser: now,
                lastMessageAt: now,
            },
            $push: {
                messages: { $each: [message], $slice: -1000 },
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { order, revision };
}

async function getRevisionByOrderID(orderID: string) {
    return RevisionModel.findOne({ orderID }).lean();
}

async function completeOrderInDB({
    orderID,
    deliveryLink,
}: {
    orderID: string;
    deliveryLink: string;
}) {
    const order = await OrderModel.findOneAndUpdate(
        { orderID },
        { status: "completed", deliveryLink },
        { new: true }
    );

    if (order) {
        const now = new Date();
        await RevisionModel.updateOne(
            { orderID },
            {
                $set: {
                    status: "closed",
                    isSeenByAdmin: true,
                    isSeenByUser: true,
                    updatedAt: now,
                    lastMessageAt: now,
                },
                $push: {
                    messages: {
                        senderID: "system",
                        senderRole: "system",
                        senderName: "System",
                        senderProfileImage: "",
                        message: "Order marked as completed. Revision closed.",
                        createdAt: now,
                    },
                },
            }
        );
    }

    return order;
}

async function getOrdersByStatusFromDB({
    userID,
    role,
    status,
}: {
    userID: string;
    role: string;
    status: string;
}) {
    let orders;

    if (role === "user") {
        orders = await OrderModel.find({
            "user.userID": userID,
            status,
        } as any);
    } else {
        orders = await OrderModel.find({
            status,
        } as any);
    }

    return orders;
}

async function getOrdersByUserIDFromDB({
    userID,
    search,
    page = 1,
    limit = 10,
    filter,
    sort,
}: {
    userID: string;
    search?: string;
    page?: number;
    limit?: number;
    filter?: string;
    sort?: string;
}) {
    const user = await UserModel.findOne({ userID });

    if (!user) throw new Error("User not found");

    const query: any = {
        "user.userID": userID,
        orderStage: "payment-completed",
    };

    if (search) {
        query.$or = [
            { orderID: { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
        ];
    }

    if (filter && filter !== "all") {
        query.status = filter;
    }

    const sortOptions: any = {
        createdAt: -1,
    };

    if (sort) {
        const [field, order] = sort.split(":");
        sortOptions[field] = order === "asc" ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        OrderModel.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
        OrderModel.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

async function newPendingOrderInDB(data: any) {
    try {
        const user = await UserModel.findOne({ userID: data.userID });
        if (!user) throw new Error("User not found!");

        const pendingOrder = await PendingOrderModel.create({
            pendingOrderID: `PO${nanoid(10).toUpperCase()}`,
            user: {
                userID: data.userID,
                name: user.name,
                email: user.email,
                image: user.image ?? "",
                company: user.company,
                address: user.address,
            },
            title: data.title || "New Order",
            pricingType: data.pricingType || "per-image",
            price: data.price || 0,
            imagesCount: data.imagesCount || 0,
            details: data.details || {},
            total: data.total || 0,
        });

        return pendingOrder;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to create pending order."
        );
    }
}

async function getPendingOrderFromDB(pendingOrderID: string) {
    try {
        const pendingOrder = await PendingOrderModel.findOne({ pendingOrderID });
        return pendingOrder;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Failed to fetch pending order."
        );
    }
}

const OrderServices = {
    newOrderInDB,
    getOrdersFromDB,
    getDraftOrdersFromDB,
    getOrderByIDFromDB,
    updateOrderInDB,
    deliverOrderToClient,
    reviewOrderToAdmin,
    getRevisionByOrderID,
    completeOrderInDB,
    getOrdersByStatusFromDB,
    getOrdersByUserIDFromDB,
    newPendingOrderInDB,
    getPendingOrderFromDB,
};

export default OrderServices;
