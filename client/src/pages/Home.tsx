import { useState } from "react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Sidebar } from "@/components/Sidebar";
import { Selector } from "@/components/Selector";
import { ResultCard } from "@/components/ResultCard";
import { useProcessAudio, useSaveTranscription } from "@/hooks/use-transcriptions";
import { Bot, History, Sparkles, User, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const PERSONAS = ["Creative", "Professional", "Technical", "Educational", "Conversational"];
const AGENTS = ["ChatGPT", "Claude", "Gemini", "Copilot", "Midjourney", "Dall-E"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [persona, setPersona] = useState(PERSONAS[1]); // Default Professional
  const [agent, setAgent] = useState(AGENTS[0]); // Default ChatGPT
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [result, setResult] = useState<{ originalText: string; enhancedText: string } | null>(null);

  const { toast } = useToast();
  const processAudio = useProcessAudio();
  const saveTranscription = useSaveTranscription();

  const handleProcess = async () => {
    if (!file) {
      toast({ title: "No audio file", description: "Please record or upload audio first.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("persona", persona);
    formData.append("agent", agent);

    try {
      const data = await processAudio.mutateAsync(formData);
      setResult(data);
      toast({ title: "Success!", description: "Audio processed successfully." });
    } catch (error) {
      toast({ 
        title: "Processing Failed", 
        description: error instanceof Error ? error.message : "Something went wrong", 
        variant: "destructive" 
      });
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await saveTranscription.mutateAsync({
        originalText: result.originalText,
        enhancedText: result.enhancedText,
        persona,
        agent,
      });
      toast({ title: "Saved!", description: "Transcription saved to history." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save transcription.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-primary to-purple-400 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight">VoiceAI<span className="text-primary">.pro</span></h1>
          </div>
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary hover:text-white transition-colors text-sm font-medium border border-white/5"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h2 className="text-3xl font-bold font-display mb-4">Input Audio</h2>
              <p className="text-muted-foreground mb-6">
                Record your voice or upload an audio file to get started. We'll transcribe and enhance it instantly.
              </p>
              <AudioRecorder onAudioCaptured={setFile} />
            </div>

            <div className="space-y-8 p-6 rounded-2xl bg-secondary/20 border border-white/5">
              <Selector 
                label="Select Persona" 
                options={PERSONAS} 
                value={persona} 
                onChange={setPersona}
                icon={<User className="w-5 h-5" />}
              />
              
              <div className="h-px bg-white/5" />

              <Selector 
                label="Select AI Agent" 
                options={AGENTS} 
                value={agent} 
                onChange={setAgent}
                icon={<Bot className="w-5 h-5" />}
              />
            </div>

            <button
              onClick={handleProcess}
              disabled={!file || processAudio.isPending}
              className={`
                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3
                transition-all duration-300 shadow-lg
                ${!file || processAudio.isPending 
                  ? "bg-secondary text-muted-foreground cursor-not-allowed" 
                  : "bg-gradient-to-r from-primary to-purple-600 text-white hover:scale-[1.02] hover:shadow-primary/25 shadow-primary/10"
                }
              `}
            >
              {processAudio.isPending ? (
                <>
                  <Wand2 className="w-6 h-6 animate-spin" />
                  Processing Audio...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Enhance Audio
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-bold font-display mb-4">Results</h2>
            {!result ? (
              <div className="h-[600px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-white/5">
                <div className="p-6 rounded-full bg-white/5 mb-4">
                  <Wand2 className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-lg">Ready to process your audio</p>
                <p className="text-sm opacity-60 mt-2">Results will appear here automatically</p>
              </div>
            ) : (
              <div className="grid gap-6 h-full">
                <ResultCard
                  title="Original Transcription"
                  content={result.originalText}
                  type="original"
                />
                
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur opacity-20" />
                  <ResultCard
                    title={`Enhanced by ${agent} (${persona})`}
                    content={result.enhancedText}
                    type="enhanced"
                    onSave={handleSave}
                    isSaving={saveTranscription.isPending}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}
