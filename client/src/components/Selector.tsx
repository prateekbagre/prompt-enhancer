import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SelectorProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

export function Selector({ label, options, value, onChange, icon }: SelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-primary">{icon}</div>}
        <h3 className="text-lg font-semibold text-white/90">{label}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <motion.button
              key={option}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(option)}
              className={cn(
                "relative p-4 rounded-xl text-left transition-all duration-200 border",
                isSelected
                  ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  : "bg-secondary/50 border-white/5 text-muted-foreground hover:bg-secondary hover:border-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{option}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-primary rounded-full p-0.5"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
