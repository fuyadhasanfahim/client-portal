import { Document } from "mongoose";

export interface IParticipant {
    userID: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
    lastSeenAt?: Date;
    role: "admin" | "user";
    unreadCount?: number;
    lastReadMessageID?: string;
}

export interface IConversation extends Document {
    participants: IParticipant[];
    lastMessageAt: Date;
    lastMessageText?: string;
    lastMessageAuthorID?: string;
    activeAdminID?: string | null;
    activeClientID?: string | null;
    lock?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
