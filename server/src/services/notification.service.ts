import NotificationModel from "../models/notification.model.js";
import UserModel from "../models/user.model.js";

async function getNotificationsFromDB({
    userID,
    page,
    limit,
}: {
    userID: string;
    page: number;
    limit: number;
}) {
    const user = await UserModel.findOne({ userID });

    if (!user) {
        throw new Error("User not found");
    }

    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await NotificationModel.countDocuments({ userID });

    // Base query
    const query = { userID };

    let notifications;

    if (user.role === "admin") {
        notifications = await NotificationModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    } else {
        notifications = await NotificationModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    return {
        notifications,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasMore,
            hasPrevious,
        },
        hasMore,
        total: totalCount,
    };
}

async function updateNotificationInDB(notificationID: string) {
    const notification = await NotificationModel.findById(notificationID);

    if (!notification) {
        throw new Error("No notification found to update.");
    }

    notification.read = true;
    notification.save();

    return notification;
}

async function markAllNotificationsAsReadInDB(userID: string) {
    await NotificationModel.updateMany({ userID, read: false }, { read: true });
}

const NotificationServices = {
    getNotificationsFromDB,
    updateNotificationInDB,
    markAllNotificationsAsReadInDB,
};
export default NotificationServices;
