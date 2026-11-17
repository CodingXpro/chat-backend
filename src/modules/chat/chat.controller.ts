import type { Request, Response } from "express";
import { z } from "zod";
import { ChatService } from "./chat.service.js";
import { uuid } from "./chat.validation.js";
const service = new ChatService();
const param = (value: unknown) => uuid.parse(value);
const messageIdParam = (value: unknown) => z.string().min(1).parse(value);

export const chatController = {
  create: async (req: Request, res: Response) => {
    const { userAId, userBId } = req.body as {
      userAId: string;
      userBId: string;
    };
    res.status(200).json(await service.create(userAId, userBId));
  },
  send: async (req: Request, res: Response) => {
    const { senderId, text } = req.body as { senderId: string; text: string };
    res
      .status(201)
      .json(await service.send(param(req.params.chatId), senderId, text));
  },
  messages: async (req: Request, res: Response) => {
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(50)
      .parse(req.query.limit);
    res.json({
      messages: await service.listMessages(param(req.params.chatId), limit),
    });
  },
  read: async (req: Request, res: Response) => {
    const { userId } = req.body as { userId: string };
    res.json(
      await service.read(
        param(req.params.chatId),
        messageIdParam(req.params.messageId),
        userId,
      ),
    );
  },
  lastSeen: async (req: Request, res: Response) => {
    const { userId, messageId } = req.body as {
      userId: string;
      messageId: string;
    };
    res.json(
      await service.lastSeen(param(req.params.chatId), userId, messageId),
    );
  },
  listChats: async (req: Request, res: Response) => {
    res.json({ chats: await service.listChats(param(req.params.userId)) });
  },
};
