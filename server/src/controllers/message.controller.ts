import { Request, Response } from "express";
import MessageServices from "../services/message.service.js";
import { io } from "../server.js";

async function getMessages(req: Request, res: Response) {
    try {
        const { userID, conversationID, rawLimit, cursor } = req.query;

        if (!userID) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated! Access denied.",
            });
            return;
        }

        if (!conversationID) {
            res.status(400).json({
                success: false,
                message: "Conversation id not found.",
            });
            return;
        }

        const data = await MessageServices.getMessagesFromDB({
            userID: userID as string,
            conversationID: conversationID as string,
            rawLimit: Number(rawLimit),
            cursor: cursor as string,
        });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error && error.message,
        });
    }
}

async function newMessage(req: Request, res: Response) {
    try {
        const { conversationID, text, senderID, attachment } = req.body;

        if (!senderID || !conversationID) {
            res.status(400).json({
                success: false,
                message: "conversationID and senderID required",
            });
            return;
        }

        const message = await MessageServices.newMessageInDB({
            conversationID,
            text,
            senderID,
            attachment,
        });

        io.to(`conversation:${conversationID}`).emit("new-message", {
            message,
            userID: senderID,
        });

        res.status(201).json({ success: true, message });
    } catch (error) {
        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to send message",
        });
    }
}

const MessageControllers = { getMessages, newMessage };
export default MessageControllers;
