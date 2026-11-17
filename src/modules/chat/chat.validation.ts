import { z } from "zod";
export const uuid = z.uuid();
export const createChatSchema = z
  .object({ userAId: uuid, userBId: uuid })
  .strict();
export const sendMessageSchema = z
  .object({ senderId: uuid, text: z.string().trim().min(1).max(5000) })
  .strict();
export const readMessageSchema = z.object({ userId: uuid }).strict();
export const lastSeenSchema = z
  .object({ userId: uuid, messageId: z.string().min(1) })
  .strict();
