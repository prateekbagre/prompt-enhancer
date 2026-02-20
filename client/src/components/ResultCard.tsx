import { Copy, Save, Sparkles, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ResultCardProps {
  title: string;
  content: string;
  type: "original" | "enhanced";
  onSave?: () => void;
  isSaving?: boolean;
}

export function ResultCard({ title, content, type, onSave, isSaving }: ResultCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-6 border relative overflow-hidden h-full flex flex-col",
        type === "enhanced"
          ? "bg-gradient-to-br from-primary/10 to-purple-900/10 border-primary/20 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
          : "bg-secondary/30 border-white/5"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {type === "enhanced" ? (
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-white/10 text-white/70">
              <Mic className="w-5 h-5" />
            </div>
          )}
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Copy text"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 rounded-xl bg-black/20 border border-black/10 text-white/90 leading-relaxed overflow-y-auto max-h-[400px]">
        {content}
      </div>

      {type === "enhanced" && onSave && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all",
              isSaving
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-primary/25"
            )}
          >
            {isSaving ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save to History</span>
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
