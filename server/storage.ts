import { db } from "./db";
import { transcriptions, type InsertTranscription, type Transcription } from "@shared/schema";
import { desc } from "drizzle-orm";
import localStorage from "./localStorage";

export interface IStorage {
  createTranscription(data: InsertTranscription): Promise<Transcription>;
  getTranscriptions(): Promise<Transcription[]>;
}

export class DatabaseStorage implements IStorage {
  async createTranscription(data: InsertTranscription): Promise<Transcription> {
    const [transcription] = await db.insert(transcriptions).values(data).returning();
    return transcription;
  }

  async getTranscriptions(): Promise<Transcription[]> {
    return await db.select().from(transcriptions).orderBy(desc(transcriptions.createdAt));
  }
}

// In-memory fallback for local development when DATABASE isn't available.
export class FileBackedStorage implements IStorage {
  private key = "transcriptions";
  constructor() {
    // ensure key exists
    const v = localStorage.getObject(this.key, [] as Transcription[]);
    localStorage.setObject(this.key, v);
  }

  async createTranscription(data: InsertTranscription): Promise<Transcription> {
    const list = localStorage.getObject<Transcription[]>(this.key, []);
    const id = list.length ? Math.max(...list.map((t) => t.id || 0)) + 1 : 1;
    const item = {
      id,
      originalText: data.originalText,
      enhancedText: data.enhancedText,
      persona: data.persona,
      agent: data.agent,
      createdAt: new Date(),
    } as unknown as Transcription;
    list.push(item);
    localStorage.setObject(this.key, list);
    return item;
  }

  async getTranscriptions(): Promise<Transcription[]> {
    const list = localStorage.getObject<Transcription[]>(this.key, []);
    return list.slice().sort((a, b) => +new Date(b.createdAt as any) - +new Date(a.createdAt as any));
  }
}

export const storage: IStorage = process.env.DEV_NO_DB === "1" ? new FileBackedStorage() : new DatabaseStorage();
