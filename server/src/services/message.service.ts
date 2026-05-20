/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import ConversationModel from "../models/conversation.model.js";

function ensureUnder50MB(size?: number) {
    if (typeof size === "number" && size > 50 * 1024 * 1024) {
        throw new Error("Attachment must be 50MB or less");
    }
}

async function getMessagesFromDB({
    userID,
    conversationID,
    rawLimit,
    cursor,
}: {
    userID: string;
    conversationID: string;
    rawLimit: number;
    cursor: string | null;
}) {
    const user = await UserModel.findOne({ userID }).lean();
    if (!user) throw new Error("No user found.");

    const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(Number(rawLimit), 1), 100)
        : 50;

    const conversation =
        await ConversationModel.findById(conversationID).lean();
    if (!conversation) throw new Error("No conversation found.");

    const participant = conversation.participants.some(
        (p) => p.userID === userID
    );
    if (user.role !== "admin" && !participant)
        throw new Error("Access forbidden.");

    const find: any = { conversationID: String(conversationID) };

    if (cursor) {
        if (!Types.ObjectId.isValid(cursor)) throw new Error("Invalid cursor.");
        find._id = { $lt: new Types.ObjectId(cursor) };
    }

    const docs = await MessageModel.find(find)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = docs.length > limit;
    const messages = hasMore ? docs.slice(0, -1) : docs;

    messages.reverse();

    const nextCursor = hasMore ? String(messages[0]._id) : null;

    return {
        messages,
        nextCursor,
    };
}

async function newMessageInDB({
    conversationID,
    text,
    senderID,
    attachment,
}: {
    conversationID: string;
    text?: string;
    senderID: string;
    attachment?: {
        url: string;
        name: string;
        size: number;
        contentType?: string;
    } | null;
}) {
    const sender = await UserModel.findOne({ userID: senderID }).lean();
    if (!sender) throw new Error("No sender found!");

    const conversation = await ConversationModel.findById(conversationID);
    if (!conversation) throw new Error("No conversations found!");

    const isParticipant = conversation.participants.some(
        (p) => p.userID === senderID
    );
    if (sender.role !== "admin" && !isParticipant) {
        throw new Error("Access forbidden.");
    }

    // Check if user is online in this conversation
    // const participant = conversation.participants.find(
    //     (p) => p.userID === senderID
    // );

    // if (!participant?.isOnline) {
    //     throw new Error(
    //         "You must join the conversation before sending messages."
    //     );
    // }

    if (!attachment && !text?.trim()) {
        throw new Error("Message text or attachment required");
    }

    if (attachment) ensureUnder50MB(attachment.size);

    const now = new Date();

    const message = await MessageModel.create({
        conversationID: String(conversationID),
        authorID: senderID,
        authorRole: sender.role,
        text: text?.trim() || undefined,
        kind: "user",
        sentAt: now,
        attachment: attachment ?? null,
    });

    // update conversation meta
    conversation.lastMessageAt = now;
    conversation.lastMessageText =
        message.text ?? (attachment ? attachment.name : "Attachment");
    conversation.lastMessageAuthorID = senderID;
    await conversation.save();

    // update sender user meta
    await UserModel.updateOne(
        { userID: senderID },
        { $set: { lastSeenAt: now, isOnline: true } }
    );

    // reset unread for sender, increment for everyone else
    await ConversationModel.updateOne(
        { _id: conversationID },
        {
            $set: {
                "participants.$[sender].unreadCount": 0,
                "participants.$[sender].lastReadMessageID": message._id,
            },
            $inc: {
                "participants.$[others].unreadCount": 1,
            },
        },
        {
            arrayFilters: [
                { "sender.userID": senderID },
                { "others.userID": { $ne: senderID } },
            ],
        }
    );

    return message;
}

const MessageServices = { getMessagesFromDB, newMessageInDB };
export default MessageServices;
