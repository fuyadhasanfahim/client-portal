import NotificationModel from "../models/notification.model.js";
import { io } from "../server.js";
import { getAdminIDs } from "./getAdminIDs.js";

interface SendNotificationParams {
    title: string;
    message: string;
    isAdmin?: boolean;
    userID?: string;
    link?: string;
}

export const sendNotification = async ({
    title,
    message,
    isAdmin = false,
    userID,
    link,
}: SendNotificationParams) => {
    try {
        if (isAdmin) {
            const adminIds = await getAdminIDs();

            const notifications = await Promise.all(
                adminIds.map(async (adminID) => {
                    const notification = await NotificationModel.create({
                        userID: adminID,
                        title,
                        message,
                        read: false,
                        ...(link && { link }),
                    });

                    io.to(adminID).emit("new-notification", {
                        _id: notification._id,
                        title: notification.title,
                        message: notification.message,
                        link: notification.link,
                        createdAt: notification.createdAt,
                    });

                    return notification;
                })
            );

            return notifications;
        } else if (userID) {
            const notification = await NotificationModel.create({
                userID,
                title,
                message,
                read: false,
            });

            io.to(userID).emit("new-notification", {
                _id: notification._id,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
            });

            return notification;
        } else {
            throw new Error("userID is required for non-admin notifications");
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
