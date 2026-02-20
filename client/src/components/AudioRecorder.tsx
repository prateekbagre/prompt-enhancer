import { useState, useRef, useEffect } from "react";
import { Mic, Square, Upload, FileAudio, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onAudioCaptured: (file: File | null) => void;
}

export function AudioRecorder({ onAudioCaptured }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setAudioFile(file);
        onAudioCaptured(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      onAudioCaptured(file);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    onAudioCaptured(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!audioFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 min-h-[200px]",
                isRecording
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5"
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-full mb-4 transition-all duration-300",
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white group-hover:bg-primary group-hover:text-white"
                )}
              >
                {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
              </div>
              <span className="text-lg font-medium text-white/90">
                {isRecording ? "Stop Recording" : "Click to Record"}
              </span>
              {isRecording && (
                <span className="mt-2 font-mono text-red-400 font-bold tracking-wider">
                  {formatTime(recordingTime)}
                </span>
              )}
            </button>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/5 transition-all duration-300 min-h-[200px] group"
            >
              <div className="p-4 rounded-full bg-white/10 text-white mb-4 group-hover:bg-blue-500 transition-colors">
                <Upload size={32} />
              </div>
              <span className="text-lg font-medium text-white/90">Upload Audio File</span>
              <span className="mt-2 text-sm text-white/50">MP3, WAV, M4A up to 25MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <FileAudio className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{audioFile.name}</h3>
                  <p className="text-sm text-white/50">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearAudio}
                className="p-3 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="mt-4">
               <audio controls src={URL.createObjectURL(audioFile)} className="w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
