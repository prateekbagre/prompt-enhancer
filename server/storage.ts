import { db } from "./db";
import { transcriptions, type InsertTranscription, type Transcription } from "@shared/schema";
import { desc } from "drizzle-orm";

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

export const storage = new DatabaseStorage();
