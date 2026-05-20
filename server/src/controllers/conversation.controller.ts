import { Request, Response } from "express";
import ConversationServices from "../services/conversation.service.js";
import { io } from "../server.js";

async function getConversations(req: Request, res: Response) {
    try {
        const { userID, search } = req.query;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User id is required for this request.",
            });
            return;
        }

        const conversations = await ConversationServices.getConversationsFromDB(
            { userID: userID as string, search: search as string }
        );

        res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again later.",
        });
    }
}

async function getConversation(req: Request, res: Response) {
    try {
        const { conversationID } = req.params as any;

        if (!conversationID) {
            res.status(400).json({
                success: false,
                message: "Conversation id is required for this request.",
            });
            return;
        }

        const conversation =
            await ConversationServices.getConversationFromDB(conversationID);

        res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again later.",
        });
    }
}

async function join(req: Request, res: Response) {
    try {
        const { conversationID, userID } = req.body;
        if (!conversationID || !userID) {
            res.status(400).json({
                success: false,
                message: "conversationID and userID required",
            });
            return;
        }

        const { conversation, systemMessage, userRole } =
            await ConversationServices.joinConversation({
                conversationID,
                userID,
            });

        io.to(`conversation:${conversationID}`).emit("new-message", {
            message: systemMessage,
            system: true,
        });

        res.status(200).json({
            success: true,
            conversation,
            systemMessage,
            userRole,
        });
    } catch (e) {
        res.status(409).json({
            success: false,
            message: e instanceof Error ? e.message : "Join failed",
        });
    }
}

async function leave(req: Request, res: Response) {
    try {
        const { conversationID, userID } = req.body;
        if (!conversationID || !userID) {
            res.status(400).json({
                success: false,
                message: "conversationID and userID required",
            });
            return;
        }

        const { conversation, systemMessage } =
            await ConversationServices.leaveConversation({
                conversationID,
                userID,
            });

        if (systemMessage) {
            io.to(`conversation:${conversationID}`).emit("new-message", {
                message: systemMessage,
                system: true,
            });
        }

        res.status(200).json({ success: true, conversation, systemMessage });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e instanceof Error ? e.message : "Leave failed",
        });
    }
}

async function markAsRead(req: Request, res: Response) {
    try {
        const { conversationID, userID, lastMessageID } = req.body;

        if (!conversationID || !userID || !lastMessageID) {
            res.status(400).json({
                success: false,
                message: "conversationID, userID, and lastMessageID required",
            });
            return;
        }

        const conversation = await ConversationServices.markAsRead({
            conversationID,
            userID,
            lastMessageID,
        });

        res.status(200).json({
            success: true,
            conversation,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e instanceof Error ? e.message : "Mark as read failed",
        });
    }
}

const ConversationControllers = {
    getConversations,
    getConversation,
    join,
    leave,
    markAsRead,
};
export default ConversationControllers;
