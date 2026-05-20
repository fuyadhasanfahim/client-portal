import {Router } from "express";
import NotificationControllers from "../controllers/notification.controller.js";

const router = Router();

router.get("/get-notifications", NotificationControllers.getNotifications);

router.put(
    "/update-notification/:notificationID",
    NotificationControllers.updateNotification
);
router.put(
    "/mark-all-as-read-notification",
    NotificationControllers.markAllNotificationsAsRead
);

export const notificationRoute = router;
