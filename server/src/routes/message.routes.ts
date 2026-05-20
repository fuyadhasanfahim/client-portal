import { Router } from "express";
import MessageControllers from "../controllers/message.controller.js";
const router = Router();

router.get("/get-messages", MessageControllers.getMessages);

router.post("/new-message", MessageControllers.newMessage);

export const MessageRoute = router;
