import { Server } from "socket.io";
import UserModel from "./models/user.model.js";

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

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
        });
    });
}
