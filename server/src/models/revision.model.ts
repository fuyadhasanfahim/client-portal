import { Schema, model } from "mongoose";
import { IRevision, IRevisionMessage } from "../types/revision.interface.js";

const RevisionMessageSchema = new Schema<IRevisionMessage>(
    {
        senderID: { type: String, required: true },
        senderRole: { type: String, required: true },
        senderName: { type: String, required: true },
        senderProfileImage: { type: String, default: "" },
        message: { type: String, required: true },
    },
    { timestamps: true }
);

const RevisionSchema = new Schema(
    {
        orderID: { type: String, unique: true },
        quoteID: { type: String, unique: true },
        messages: { type: [RevisionMessageSchema], default: [] },
        status: {
            type: String,
            enum: ["open", "in-review", "closed"],
            default: "open",
        },
        isSeenByAdmin: { type: Boolean, default: false },
        isSeenByUser: { type: Boolean, default: true },
        lastSeenAtAdmin: { type: Date, default: null },
        lastSeenAtUser: { type: Date, default: null },
        lastMessageAt: { type: Date, default: () => new Date() },
    },
    { timestamps: true }
);

const RevisionModel = model<IRevision>("Revision", RevisionSchema);
export default RevisionModel;
