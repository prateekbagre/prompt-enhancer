import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});
const upload = multer({ dest: "uploads/" });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }
      
      const { persona, agent } = req.body;
      if (!persona || !agent) {
        return res.status(400).json({ message: "Persona and agent are required" });
      }

      // 1. Transcribe Audio using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1",
      });
      
      const originalText = transcription.text;
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // 2. Enhance Text
      let prompt = `Enhance the following text to fit a ${persona} persona.`;
      
      if (agent.toLowerCase().includes('midjourney') || agent.toLowerCase().includes('dall-e')) {
         prompt = `Convert the following text into a highly detailed, descriptive image generation prompt suitable for ${agent} in a ${persona} style.`;
      } else {
         prompt = `Rewrite and enhance the following text in a ${persona} tone, optimized as a prompt or input for ${agent}.`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert prompt engineer and text enhancer." },
          { role: "user", content: `${prompt}\n\nOriginal Text: ${originalText}` }
        ]
      });

      const enhancedText = response.choices[0].message.content || "";

      res.json({ originalText, enhancedText });
    } catch (error: any) {
      console.error("Audio processing error:", error);
      res.status(500).json({ message: error.message || "Failed to process audio" });
    }
  });

  app.post(api.transcriptions.create.path, async (req, res) => {
    try {
      const input = api.transcriptions.create.input.parse(req.body);
      const transcription = await storage.createTranscription(input);
      res.status(201).json(transcription);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.transcriptions.list.path, async (req, res) => {
    const transcriptions = await storage.getTranscriptions();
    res.json(transcriptions);
  });

  return httpServer;
}
