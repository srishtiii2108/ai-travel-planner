import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, Route, Home, LineChart, CheckCircle2 } from "lucide-react";

const AGENT_STEPS = [
  { text: "Coordinator Agent analyzing request...", icon: BrainCircuit },
  { text: "Planner Agent mapping destinations...", icon: Route },
  { text: "Accommodation Agent finding stays...", icon: Home },
  { text: "Transport Agent calculating routes...", icon: Route },
  { text: "Optimization Agent finalizing budget...", icon: LineChart },
  { text: "Preparing your perfect itinerary...", icon: Sparkles },
];

export function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, AGENT_STEPS.length - 1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = AGENT_STEPS[stepIndex].icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative w-full overflow-hidden py-20">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-xl mx-auto px-6 flex flex-col items-center">
        
        {/* Center Icon */}
        <motion.div 
          className="w-24 h-24 bg-card border-2 border-primary/30 rounded-3xl shadow-2xl shadow-primary/20 flex items-center justify-center mb-10"
          animate={{ 
            rotateY: [0, 180, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <CurrentIcon className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Dynamic Text */}
        <div className="h-16 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-2xl md:text-3xl font-display font-bold text-center text-foreground"
            >
              {AGENT_STEPS[stepIndex].text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress List */}
        <div className="w-full space-y-4 bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-border/50">
          {AGENT_STEPS.map((step, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            const isPending = idx > stepIndex;

            return (
              <div 
                key={idx} 
                className={`flex items-center gap-4 transition-all duration-500 ${isCurrent ? 'opacity-100 scale-105' : isPending ? 'opacity-30' : 'opacity-70'}`}
              >
                <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
