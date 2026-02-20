import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranscriptions } from "@/hooks/use-transcriptions";
import { Bot, Copy, History, Loader2, Sparkles, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { data: transcriptions, isLoading } = useTranscriptions();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Enhanced text copied to clipboard.",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold font-display">History</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScrollArea className="flex-1 p-6">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !transcriptions?.length ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No history found.</p>
                  <p className="text-sm mt-2">Process audio to see it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transcriptions.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-secondary/30 rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/20">
                            {item.persona}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-100 border border-blue-500/20">
                            {item.agent}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.createdAt && format(new Date(item.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      
                      <div className="mb-3 space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Original</p>
                        <p className="text-sm text-white/70 line-clamp-2">{item.originalText}</p>
                      </div>
                      
                      <div className="mb-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                           <Sparkles className="w-3 h-3 text-primary" />
                           <p className="text-xs text-primary font-semibold uppercase tracking-wider">Enhanced</p>
                        </div>
                        <p className="text-sm text-white line-clamp-3">{item.enhancedText}</p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(item.enhancedText)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Enhanced Text
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
