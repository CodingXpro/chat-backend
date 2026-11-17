import { prisma } from "../../config/database.js";

export class ChatRepository {
  async findUsers(ids: string[]) {
    return prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
  }
  async createOrGetDirectChat(userAId: string, userBId: string) {
    const pairKey = [userAId, userBId].sort().join(":");
    return prisma.chat.upsert({
      where: { pairKey },
      update: {},
      create: {
        pairKey,
        type: "DIRECT",
        members: { create: [{ userId: userAId }, { userId: userBId }] },
      },
      select: { id: true },
    });
  }
  async findChat(chatId: string) {
    return prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true },
    });
  }
  async isMember(chatId: string, userId: string) {
    return (await prisma.chatMember.count({ where: { chatId, userId } })) > 0;
  }
  async listUserChats(userId: string) {
    return prisma.chat.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        createdAt: true,
        members: { select: { userId: true } },
      },
    });
  }
  async userExists(userId: string) {
    return (await prisma.user.count({ where: { id: userId } })) > 0;
  }
}
