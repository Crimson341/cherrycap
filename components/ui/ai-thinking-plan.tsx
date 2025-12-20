"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDotDashed,
  ChevronDown,
  Brain,
  Lightbulb,
  Search,
  FileText,
  Sparkles,
  Zap,
  Target,
  PenTool,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  detail?: string;
  status: "pending" | "active" | "completed";
}

interface AIThinkingPlanProps {
  reasoning?: string;
  isStreaming?: boolean;
  className?: string;
}

// Dynamic steps that appear to show AI's thought process
const THINKING_PHASES = [
  { 
    icon: <Search className="h-4 w-4" />, 
    title: "Analyzing your request",
    duration: 800,
  },
  { 
    icon: <Lightbulb className="h-4 w-4" />, 
    title: "Identifying key concepts",
    duration: 1200,
  },
  { 
    icon: <Target className="h-4 w-4" />, 
    title: "Considering approach",
    duration: 1000,
  },
  { 
    icon: <FileText className="h-4 w-4" />, 
    title: "Gathering relevant context",
    duration: 1100,
  },
  { 
    icon: <PenTool className="h-4 w-4" />, 
    title: "Formulating response",
    duration: 900,
  },
];

export function AIThinkingPlan({ reasoning, isStreaming = false, className }: AIThinkingPlanProps) {
  const [, setCurrentPhase] = useState(0);
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasReasoning = reasoning && reasoning.trim().length > 0;

  // Animate through phases when streaming and no reasoning yet
  useEffect(() => {
    if (isStreaming && !hasReasoning) {
      // Initialize steps
      setSteps(THINKING_PHASES.map((phase, idx) => ({
        id: `step-${idx}`,
        icon: phase.icon,
        title: phase.title,
        status: idx === 0 ? "active" : "pending",
      })));
      setCurrentPhase(0);

      // Progress through phases
      let phase = 0;
      intervalRef.current = setInterval(() => {
        phase++;
        if (phase < THINKING_PHASES.length) {
          setCurrentPhase(phase);
          setSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx < phase ? "completed" : idx === phase ? "active" : "pending",
          })));
        } else {
          // Loop back or stay at last phase
          phase = THINKING_PHASES.length - 1;
        }
      }, THINKING_PHASES[phase]?.duration || 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isStreaming, hasReasoning]);

  // When reasoning arrives, update to show real reasoning
  useEffect(() => {
    if (hasReasoning) {
      // Mark all steps as completed
      setSteps(prev => prev.map(step => ({ ...step, status: "completed" as const })));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [hasReasoning]);

  // Parse reasoning into readable chunks
  const parseReasoning = (text: string): string[] => {
    if (!text) return [];
    
    // Split by sentences or line breaks
    const chunks = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 200);
    
    return chunks.slice(0, 6); // Max 6 reasoning points
  };

  const reasoningPoints = hasReasoning ? parseReasoning(reasoning) : [];

  return (
    <div className={`rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-purple-500/5 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-500/5 transition-colors"
      >
        <div className="relative">
          <motion.div
            animate={isStreaming && !hasReasoning ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-5 w-5 text-purple-400" />
          </motion.div>
          {isStreaming && !hasReasoning && (
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-purple-200">
              {hasReasoning ? "Thought Process" : "Thinking..."}
            </span>
            {isStreaming && !hasReasoning && (
              <div className="flex items-center gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay }}
                    className="w-1 h-1 rounded-full bg-purple-400"
                  />
                ))}
              </div>
            )}
          </div>
          {hasReasoning && (
            <span className="text-xs text-purple-400/60">{reasoningPoints.length} insights</span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-purple-400/60" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              {/* Animated Steps (when no reasoning yet) */}
              {!hasReasoning && (
                <ul className="space-y-2">
                  {steps.map((step, index) => (
                    <motion.li
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="relative flex-shrink-0">
                        {step.status === "completed" ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </motion.div>
                        ) : step.status === "active" ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="text-purple-400"
                          >
                            <CircleDotDashed className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          <Circle className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`text-sm transition-colors ${
                          step.status === "completed" 
                            ? "text-gray-400" 
                            : step.status === "active" 
                              ? "text-purple-200" 
                              : "text-gray-500"
                        }`}>
                          {step.title}
                        </span>
                        
                        {step.status === "active" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1"
                          >
                            {[0, 0.15, 0.3].map((delay, i) => (
                              <motion.div
                                key={i}
                                animate={{ 
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5] 
                                }}
                                transition={{ duration: 0.8, repeat: Infinity, delay }}
                                className="w-1 h-1 rounded-full bg-purple-400"
                              />
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* Actual Reasoning Content */}
              {hasReasoning && (
                <div className="space-y-3">
                  {/* Toggle between summary and full */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReasoning(false)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        !showReasoning 
                          ? "bg-purple-500/20 text-purple-200" 
                          : "text-purple-400/60 hover:text-purple-300"
                      }`}
                    >
                      Summary
                    </button>
                    <button
                      onClick={() => setShowReasoning(true)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        showReasoning 
                          ? "bg-purple-500/20 text-purple-200" 
                          : "text-purple-400/60 hover:text-purple-300"
                      }`}
                    >
                      Full Reasoning
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!showReasoning ? (
                      <motion.ul
                        key="summary"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2"
                      >
                        {reasoningPoints.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{point}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    ) : (
                      <motion.div
                        key="full"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto rounded-lg bg-black/20 p-3 border border-purple-500/10"
                      >
                        {reasoning}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Processing indicator */}
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-500/10"
                >
                  <Zap className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs text-purple-300/70">
                    {hasReasoning ? "Generating response..." : "Deep thinking in progress..."}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
