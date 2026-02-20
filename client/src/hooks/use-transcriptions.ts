import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export type ProcessAudioResponse = {
  originalText: string;
  enhancedText: string;
};

// Hook for fetching saved transcriptions
export function useTranscriptions() {
  return useQuery({
    queryKey: [api.transcriptions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transcriptions.list.path);
      if (!res.ok) throw new Error("Failed to fetch transcriptions");
      return api.transcriptions.list.responses[200].parse(await res.json());
    },
  });
}

// Hook for saving a transcription
export function useSaveTranscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      originalText: string;
      enhancedText: string;
      persona: string;
      agent: string;
    }) => {
      const res = await fetch(api.transcriptions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to save transcription");
      }
      
      return api.transcriptions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transcriptions.list.path] });
    },
  });
}

// Hook for processing audio (Special endpoint not in standard crud)
export function useProcessAudio() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to process audio");
      }
      
      return await res.json() as ProcessAudioResponse;
    },
  });
}
