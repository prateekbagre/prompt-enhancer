import { z } from 'zod';
import { insertTranscriptionSchema, transcriptions } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  internal: z.object({ message: z.string() })
};

export const api = {
  transcriptions: {
    create: {
      method: 'POST' as const,
      path: '/api/transcriptions' as const,
      input: insertTranscriptionSchema,
      responses: {
        201: z.custom<typeof transcriptions.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/transcriptions' as const,
      responses: {
        200: z.array(z.custom<typeof transcriptions.$inferSelect>())
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
