import { Schema, model } from "mongoose";
import { IAttachment, IMessage } from "../types/message.interface.js";

const AttachmentSchema = new Schema<IAttachment>({
    url: { type: String, required: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    size: { type: Number, required: true, max: 50 * 1024 * 1024 },
    contentType: String,
});

const MessageSchema = new Schema<IMessage>(
    {
        conversationID: { type: String, required: true, index: true },
        authorID: String,
        authorRole: { type: String, enum: ["user", "admin"] },
        text: String,
        kind: { type: String, enum: ["user", "system"], required: true },
        systemType: { type: String, enum: ["join", "leave", "info"] },
        sentAt: { type: Date, default: Date.now, index: true },
        attachment: { type: AttachmentSchema, default: null },
    },
    { timestamps: true }
);

MessageSchema.index({ conversationID: 1, _id: -1 });

const MessageModel = model<IMessage>("Message", MessageSchema);
export default MessageModel;
