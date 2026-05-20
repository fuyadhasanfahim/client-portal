import UserModel from "../models/user.model.js";
import { IConversation } from "../types/conversation.interface.js";
import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";

type JoinRole = "admin" | "user";

async function getConversationsFromDB({
    userID,
    search,
}: {
    userID: string;
    search?: string;
}) {
    const user = await UserModel.findOne({ userID });
    if (!user) throw new Error("User not found with this user id.");
    if (user.role !== "admin") throw new Error("Access forbidden.");

    const query: any = {};

    if (search) {
        query.$or = [
            { "participants.name": { $regex: search, $options: "i" } },
            { "participants.email": { $regex: search, $options: "i" } },
            { lastMessageText: { $regex: search, $options: "i" } },
        ];
    }

    return ConversationModel.find(query).sort({ lastMessageAt: -1 }).lean();
}

async function getConversationFromDB(conversationID: string) {
    const conversation = await ConversationModel.findById(conversationID);
    if (!conversation) throw new Error("No conversation found with this id.");
    return conversation;
}

async function joinConversation({
    conversationID,
    userID,
}: {
    conversationID: string;
    userID: string;
}) {
    const user = await UserModel.findOne({ userID }).lean();
    if (!user) throw new Error("User not found");
    if (!["admin", "user"].includes(user.role)) throw new Error("Invalid role");

    const conv = await ConversationModel.findById(conversationID);
    if (!conv) throw new Error("Conversation not found");

    // already participant?
    let participant = conv.participants.find((p) => p.userID === userID);

    // ❌ disallow unknown clients
    if (user.role === "user" && !participant) {
        throw new Error("Access forbidden");
    }

    // ✅ add admin if missing
    if (user.role === "admin" && !participant) {
        participant = {
            userID,
            name: user.name ?? user.username ?? "Admin",
            email: user.email,
            image: user.image,
            role: "admin",
            isOnline: true,
            lastSeenAt: new Date(),
            unreadCount: 0,
            lastReadMessageID: undefined,
        };
        conv.participants.push(participant);
    }

    // if already online → skip
    if (participant?.isOnline) {
        return {
            conversation: conv,
            systemMessage: null,
            userRole: user.role as JoinRole,
        };
    }

    // mark online
    participant!.isOnline = true;
    participant!.lastSeenAt = new Date();
    conv.lastMessageAt = new Date();
    await conv.save();

    // create join message
    const text =
        user.role === "admin"
            ? `${user.name ?? "An admin"} joined the chat.`
            : `${user.name ?? "The client"} joined the chat.`;

    const sysMsg = await MessageModel.create({
        conversationID: String(conversationID),
        kind: "system",
        systemType: "join",
        text,
        sentAt: new Date(),
    });

    return {
        conversation: conv,
        systemMessage: sysMsg,
        userRole: user.role as JoinRole,
    };
}

async function leaveConversation({
    conversationID,
    userID,
}: {
    conversationID: string;
    userID: string;
}) {
    const user = await UserModel.findOne({ userID }).lean();
    if (!user) throw new Error("User not found");

    const conv = await ConversationModel.findById(conversationID);
    if (!conv) throw new Error("Conversation not found");

    const participant = conv.participants.find((p) => p.userID === userID);

    if (participant) {
        participant.isOnline = false;
        participant.lastSeenAt = new Date();
        await conv.save();
    }

    const text =
        user.role === "admin"
            ? `${user.name ?? "An admin"} left the chat.`
            : `${user.name ?? "The client"} left the chat.`;

    const sysMsg = await MessageModel.create({
        conversationID,
        kind: "system",
        systemType: "leave",
        text,
        sentAt: new Date(),
    });

    return { conversation: conv, systemMessage: sysMsg };
}

async function markAsRead({
    conversationID,
    userID,
    lastMessageID,
}: {
    conversationID: string;
    userID: string;
    lastMessageID: string;
}) {
    const conv = await ConversationModel.findById(conversationID);
    if (!conv) throw new Error("Conversation not found");

    const participant = conv.participants.find((p) => p.userID === userID);
    if (!participant) throw new Error("Not a participant");

    participant.unreadCount = 0;
    participant.lastReadMessageID = lastMessageID;

    await conv.save();
    return conv;
}

const ConversationServices = {
    getConversationsFromDB,
    getConversationFromDB,
    joinConversation,
    leaveConversation,
    markAsRead,
};
export default ConversationServices;
