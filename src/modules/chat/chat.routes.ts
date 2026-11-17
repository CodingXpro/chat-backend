import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createChatSchema,
  sendMessageSchema,
  readMessageSchema,
  lastSeenSchema,
} from "./chat.validation.js";
export const router = Router();
router.post(
  "/chat/create",
  validateBody(createChatSchema),
  asyncHandler(chatController.create),
);
router.post(
  "/chat/:chatId/message/send",
  validateBody(sendMessageSchema),
  asyncHandler(chatController.send),
);
router.get("/chat/:chatId/messages", asyncHandler(chatController.messages));
router.post(
  "/chat/:chatId/message/:messageId/read",
  validateBody(readMessageSchema),
  asyncHandler(chatController.read),
);
router.post(
  "/chat/:chatId/lastseen",
  validateBody(lastSeenSchema),
  asyncHandler(chatController.lastSeen),
);
router.get("/user/:userId/chats", asyncHandler(chatController.listChats));
