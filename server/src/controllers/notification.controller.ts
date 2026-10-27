import { Request, Response } from "express";
import NotificationServices from "../services/notification.service.js";

async function getNotifications(req: Request, res: Response) {
    try {
        const { userID, page = "1", limit = "20" } = req.query;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid pagination parameters. Page must be >= 1, limit must be between 1-50",
            });
            return;
        }

        const result = await NotificationServices.getNotificationsFromDB({
            userID: userID as string,
            page: pageNum as number,
            limit: limitNum as number,
        });

        res.status(200).json({
            success: true,
            data: result,
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

async function updateNotification(req: Request, res: Response) {
    try {
        const { notificationID } = req.params as any;

        if (!notificationID) {
            res.status(400).json({
                success: false,
                message: "The notification id is required.",
            });
            return;
        }

        await NotificationServices.updateNotificationInDB(notificationID);

        res.status(200).json({
            success: true,
            message: "Notification updated successfully.",
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

async function markAllNotificationsAsRead(req: Request, res: Response) {
    try {
        const { userID } = req.body;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }

        await NotificationServices.markAllNotificationsAsReadInDB(userID);

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
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

const NotificationControllers = {
    getNotifications,
    updateNotification,
    markAllNotificationsAsRead,
};
export default NotificationControllers;
