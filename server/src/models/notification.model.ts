import { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
    {
        userID: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, required: true },
        link: String,
    },
    {
        timestamps: true,
    }
);

const NotificationModel = model("Notification", NotificationSchema);
export default NotificationModel;
