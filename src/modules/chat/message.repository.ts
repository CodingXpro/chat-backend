import { firestore } from "../../config/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../utils/AppError.js";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string | null;
}
export class MessageRepository {
  private messages(chatId: string) {
    return firestore.collection("chats").doc(chatId).collection("messages");
  }
  async send(chatId: string, senderId: string, text: string) {
    const ref = this.messages(chatId).doc();
    await ref.create({
      senderId,
      text,
      createdAt: FieldValue.serverTimestamp(),
    });
    const snapshot = await ref.get();
    return this.toMessage(snapshot);
  }
  private toMessage(snapshot: FirebaseFirestore.DocumentSnapshot): Message {
    const data = snapshot.data();
    if (!data) throw new AppError("Message not found", 404);
    const ts = data.createdAt as Timestamp | undefined;
    return {
      id: snapshot.id,
      senderId: String(data.senderId),
      text: String(data.text),
      createdAt: ts?.toDate().toISOString() ?? null,
    };
  }
  async getMessage(chatId: string, messageId: string) {
    const snapshot = await this.messages(chatId).doc(messageId).get();
    if (!snapshot.exists) throw new AppError("Message not found", 404);
    return this.toMessage(snapshot);
  }
  async list(chatId: string, limit: number) {
    const snapshot = await this.messages(chatId)
      .orderBy("createdAt", "desc")
      .orderBy("__name__", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => this.toMessage(doc)).reverse();
  }
  async markRead(chatId: string, messageId: string, userId: string) {
    const ref = firestore
      .collection("chats")
      .doc(chatId)
      .collection("readReceipts")
      .doc(`${messageId}_${userId}`);
    await firestore.runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      if (!existing.exists)
        tx.create(ref, {
          messageId,
          userId,
          readAt: FieldValue.serverTimestamp(),
        });
    });
    return { messageId, userId, read: true };
  }
  async updateLastSeen(chatId: string, userId: string, messageId: string) {
    const ref = firestore
      .collection("chats")
      .doc(chatId)
      .collection("lastSeen")
      .doc(userId);
    const messageRef = this.messages(chatId).doc(messageId);
    await firestore.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      const next = await tx.get(messageRef);
      if (!next.exists) throw new AppError("Message not found", 404);
      const nextTs = next.get("createdAt") as Timestamp | undefined;
      if (!nextTs) throw new AppError("Message timestamp unavailable", 409);
      const currentMessageId = current.get("messageId") as string | undefined;
      if (currentMessageId) {
        const previous = await tx.get(
          this.messages(chatId).doc(currentMessageId),
        );
        const previousTs = previous.get("createdAt") as Timestamp | undefined;
        if (
          previousTs &&
          (nextTs.toMillis() < previousTs.toMillis() ||
            (nextTs.toMillis() === previousTs.toMillis() &&
              messageId < currentMessageId))
        ) {
          throw new AppError("Last seen cannot move backwards", 409);
        }
      }
      tx.set(ref, { messageId, updatedAt: FieldValue.serverTimestamp() });
    });
    return { userId, messageId };
  }
}
