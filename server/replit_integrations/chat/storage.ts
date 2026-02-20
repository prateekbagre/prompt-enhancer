import { db } from "../../db";
import { conversations, messages } from "@shared/models/chat";
import { eq, desc } from "drizzle-orm";
import localStorage from "../../localStorage";

export interface IChatStorage {
  getConversation(id: number): Promise<any | undefined>;
  getAllConversations(): Promise<any[]>;
  createConversation(title: string): Promise<any>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<any[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<any>;
}

const DatabaseChatStorage = {
  async getConversation(id: number) {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  },

  async getAllConversations() {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  },

  async createConversation(title: string) {
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  },

  async deleteConversation(id: number) {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  },

  async getMessagesByConversation(conversationId: number) {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const [message] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return message;
  },
};

// In-memory fallback for local dev when DATABASE isn't available.
function createFileChatStorage(): IChatStorage {
  const convKey = "conversations";
  const msgKey = "messages";

  // ensure keys exist
  const _ = localStorage.getObject(convKey, [] as any[]);
  localStorage.setObject(convKey, _);
  const __ = localStorage.getObject(msgKey, [] as any[]);
  localStorage.setObject(msgKey, __);

  return {
    async getConversation(id: number) {
      const convs = localStorage.getObject<any[]>(convKey, []);
      return convs.find((c) => c.id === id);
    },
    async getAllConversations() {
      const convs = localStorage.getObject<any[]>(convKey, []);
      return convs.slice().sort((a, b) => b.createdAt - a.createdAt);
    },
    async createConversation(title: string) {
      const convs = localStorage.getObject<any[]>(convKey, []);
      const id = convs.length ? Math.max(...convs.map((c) => c.id || 0)) + 1 : 1;
      const c = { id, title, createdAt: Date.now() };
      convs.push(c);
      localStorage.setObject(convKey, convs);
      return c;
    },
    async deleteConversation(id: number) {
      let msgs = localStorage.getObject<any[]>(msgKey, []);
      msgs = msgs.filter((m) => m.conversationId !== id);
      localStorage.setObject(msgKey, msgs);
      let convs = localStorage.getObject<any[]>(convKey, []);
      convs = convs.filter((c) => c.id !== id);
      localStorage.setObject(convKey, convs);
    },
    async getMessagesByConversation(conversationId: number) {
      const msgs = localStorage.getObject<any[]>(msgKey, []);
      return msgs.filter((m) => m.conversationId === conversationId).sort((a, b) => a.createdAt - b.createdAt);
    },
    async createMessage(conversationId: number, role: string, content: string) {
      const msgs = localStorage.getObject<any[]>(msgKey, []);
      const id = msgs.length ? Math.max(...msgs.map((m) => m.id || 0)) + 1 : 1;
      const m = { id, conversationId, role, content, createdAt: Date.now() };
      msgs.push(m);
      localStorage.setObject(msgKey, msgs);
      return m;
    },
  };
}

export const chatStorage: IChatStorage = process.env.DEV_NO_DB === "1" ? createFileChatStorage() : DatabaseChatStorage;

