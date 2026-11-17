import { AppError } from "../../utils/AppError.js";
import { ChatRepository } from "./chat.repository.js";
import { MessageRepository } from "./message.repository.js";
const chats = new ChatRepository();
const messages = new MessageRepository();

export class ChatService {
  async create(userAId: string, userBId: string) {
    if (userAId === userBId)
      throw new AppError("Cannot create a chat with yourself");
    const users = await chats.findUsers([userAId, userBId]);
    if (users.length !== 2)
      throw new AppError("One or both users do not exist", 404);
    return chats.createOrGetDirectChat(userAId, userBId);
  }
  private async ensureChat(chatId: string) {
    if (!(await chats.findChat(chatId)))
      throw new AppError("Chat not found", 404);
  }
  private async ensureMember(chatId: string, userId: string) {
    await this.ensureChat(chatId);
    if (!(await chats.isMember(chatId, userId)))
      throw new AppError("User is not a member of this chat", 403);
  }
  async send(chatId: string, senderId: string, text: string) {
    await this.ensureMember(chatId, senderId);
    return messages.send(chatId, senderId, text);
  }
  async listMessages(chatId: string, limit: number) {
    await this.ensureChat(chatId);
    return messages.list(chatId, limit);
  }
  async read(chatId: string, messageId: string, userId: string) {
    await this.ensureMember(chatId, userId);
    const message = await messages.getMessage(chatId, messageId);
    if (message.senderId === userId)
      throw new AppError("Sender cannot mark their own message read");
    return messages.markRead(chatId, messageId, userId);
  }
  async lastSeen(chatId: string, userId: string, messageId: string) {
    await this.ensureMember(chatId, userId);
    return messages.updateLastSeen(chatId, userId, messageId);
  }
  async listChats(userId: string) {
    if (!(await chats.userExists(userId)))
      throw new AppError("User not found", 404);
    const result = await chats.listUserChats(userId);
    return result.map((chat) => ({
      chatId: chat.id,
      type: chat.type,
      createdAt: chat.createdAt,
      memberIds: chat.members.map((member) => member.userId),
    }));
  }
}
