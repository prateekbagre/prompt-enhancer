import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  enhancedText: text("enhanced_text").notNull(),
  persona: text("persona").notNull(),
  agent: text("agent").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).omit({ 
  id: true, 
  createdAt: true 
});

export type Transcription = typeof transcriptions.$inferSelect;
export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;

export type CreateTranscriptionRequest = InsertTranscription;
export type TranscriptionResponse = Transcription;
