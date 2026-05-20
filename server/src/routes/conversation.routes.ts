import { Router } from "express";
import ConversationControllers from "../controllers/conversation.controller.js";

const router = Router();

router.get("/get-conversations", ConversationControllers.getConversations);
router.get(
    "/get-conversation/:conversationID",
    ConversationControllers.getConversation
);

router.post("/join", ConversationControllers.join);
router.post("/leave", ConversationControllers.leave);
router.post("/mark-as-read", ConversationControllers.markAsRead);

export const ConversationRoutes = router;
