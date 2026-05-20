import { Server } from "socket.io";
import UserModel from "./models/user.model.js";
import ConversationModel from "./models/conversation.model.js";

export default function registerSocketHandlers(io: Server) {
    io.on("connection", (socket) => {
        console.log("🟢 New socket connected:", socket.id);

        socket.on("join-user-room", (userID: string) => {
            socket.join(userID);
            console.log(`👤 Socket ${socket.id} joined user room: ${userID}`);
        });

        socket.on("join-admin-room", () => {
            socket.join("admin-room");
            console.log(`🛡️ Socket ${socket.id} joined admin room`);
        });

        socket.on("join-order-room", (orderID: string) => {
            socket.join(orderID);
            console.log(`📦 Socket ${socket.id} joined order room: ${orderID}`);
        });

        socket.on("leave-order-room", (orderID: string) => {
            socket.leave(orderID);
            console.log(`📦 Socket ${socket.id} left order room: ${orderID}`);
        });

        socket.on("join-quote-room", (quoteID: string) => {
            socket.join(quoteID);
            console.log(`📦 Socket ${socket.id} joined quote room: ${quoteID}`);
        });

        socket.on("leave-quote-room", (quoteID: string) => {
            socket.leave(quoteID);
            console.log(`📦 Socket ${socket.id} left quote room: ${quoteID}`);
        });

        socket.on("join-conversation", async ({ conversationID, userID }) => {
            socket.join(`conversation:${conversationID}`);

            await UserModel.findOneAndUpdate(
                { userID },
                { isOnline: true, lastSeenAt: new Date() }
            );

            await ConversationModel.updateOne(
                { _id: conversationID, "participants.userID": userID },
                {
                    $set: {
                        "participants.$.isOnline": true,
                        "participants.$.lastSeenAt": new Date(),
                        lastMessageAt: new Date(),
                    },
                }
            );

            // If no participant matched, add them
            const updated = await ConversationModel.findOne({
                _id: conversationID,
                "participants.userID": userID,
            });

            if (!updated) {
                await ConversationModel.updateOne(
                    { _id: conversationID },
                    {
                        $push: {
                            participants: {
                                userID,
                                role: "admin",
                                isOnline: true,
                                lastSeenAt: new Date(),
                                unreadCount: 0,
                            },
                        },
                        $set: { lastMessageAt: new Date() },
                    }
                );
            }
        });

        socket.on("leave-conversation", async ({ conversationID, userID }) => {
            socket.leave(`conversation:${conversationID}`);

            await UserModel.findOneAndUpdate(
                { userID },
                { isOnline: false, lastSeenAt: new Date() }
            );

            await ConversationModel.updateOne(
                { _id: conversationID, "participants.userID": userID },
                {
                    $set: {
                        "participants.$.isOnline": false,
                        "participants.$.lastSeenAt": new Date(),
                        lastMessageAt: new Date(),
                    },
                }
            );
        });

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
        });
    });
}
