import { Request, Response, Router } from "express";
import ConversationModel from "../models/conversation.model.js";
import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";

const router = Router();

router.post("/start", async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { id: userID } = (req as any).user;

        if (!userID) {
            res.status(401).json({ message: "Unauthenticated" });
            return;
        }

        const user = await UserModel.findOne({ userID }).lean();
        const now = new Date();

        let convo: any = await ConversationModel.findOne({
            "participants.userID": userID,
            type: "support",
        } as any);

        if (!convo) {
            convo = await ConversationModel.create({
                participants: [
                    {
                        userID,
                        name: user?.name ?? "User",
                        email: user?.email ?? "",
                        image: user?.image,
                        role: "user",
                        isOnline: true,
                        lastSeenAt: now,
                    },
                ],
                type: "support",
                lastMessageAt: now,
                unread: 0,
            } as any);

            const io = req.app.get("io");
            io?.to("admin-room").emit("conversation:upsert", {
                _id: String(convo._id),
                userId: userID,
                userName: user?.name ?? "User",
                userEmail: user?.email ?? "",
                userImage: user?.image,
                lastMessageAt: convo.lastMessageAt,
                lastMessageText: convo.lastMessageText ?? "",
                lastMessageAuthorID: convo.lastMessageAuthorID ?? "",
                createdAt: convo.createdAt,
                updatedAt: convo.updatedAt,
            });
        }

        const limit = Math.min(Number(req.query.limit ?? 50), 100);

        const messages = await MessageModel.find({
            conversationID: String(convo._id),
        })
            .sort({ sentAt: 1, _id: 1 })
            .limit(limit)
            .lean();

        res.json({ conversation: convo, messages });
    } catch (e) {
        console.error("support/start error:", e);
        res.status(500).json({ message: "Failed to start support" });
    }
});

export const SupportRouter = router;
