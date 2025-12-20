"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClaudeChatInput, type ModelOption } from "@/components/ui/claude-style-ai-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Trash2,
  Settings,
  LogOut,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  Menu,
  X,
  ArrowRight,
  Globe,
  ExternalLink,
  Search,
  Copy,
  Check,
  RefreshCw,
  Pencil,
  Archive,
  Download,
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Pin,
  Share2,
  Square,
  Mic,
  MicOff,
  BarChart3,
  Zap,
  Filter,
  GitBranch,
  Star,
  Hash,
  Volume2,
  VolumeX,
  Keyboard,
  Link2,
  LayoutDashboard,
} from "lucide-react";
import { AIThinkingPlan } from "@/components/ui/ai-thinking-plan";
import { InvoiceBuilder } from "@/components/ui/invoice-builder";
import {
  InvoiceData,
  BuildStep,
  createEmptyInvoice,
  parseInvoiceFromAI,
  calculateInvoiceTotals,
  INVOICE_BUILDER_SYSTEM_PROMPT,
} from "@/lib/invoice-types";
import { Receipt } from "lucide-react";

// Simplified AI models - just the essentials
interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: "free" | "premium" | "thinking";
  supportsThinking?: boolean;
  supportsInvoiceBuilder?: boolean;
}

const AI_MODELS: AIModel[] = [
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2", description: "Free", icon: "free" },
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", description: "Fast & smart", icon: "premium", supportsThinking: true },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", description: "Most capable", icon: "premium", supportsThinking: true, supportsInvoiceBuilder: true },
  { id: "openai/gpt-4o", name: "GPT-4o", description: "OpenAI's best", icon: "premium" },
];

// Models that support the Invoice Builder tool
const INVOICE_BUILDER_MODELS = ["anthropic/claude-sonnet-4"];

// Check if a model supports invoice builder
const modelSupportsInvoiceBuilder = (modelId: string): boolean => {
  return INVOICE_BUILDER_MODELS.some(m => modelId.includes("anthropic/claude"));
};

// Models that support tool/function calling (for Kanban)
const TOOL_CAPABLE_MODELS = [
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "anthropic/claude-sonnet-4",
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
];

// Check if a model supports Kanban tools
const modelSupportsKanban = (modelId: string): boolean => {
  return TOOL_CAPABLE_MODELS.some(m => modelId.includes(m) || m.includes(modelId.split(':')[0]));
};

// Thinking-only models (shown when thinking is enabled)
const THINKING_MODELS: AIModel[] = [
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", description: "Fast reasoning", icon: "thinking", supportsThinking: true },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", description: "Extended thinking", icon: "thinking", supportsThinking: true },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", description: "Advanced reasoning", icon: "thinking", supportsThinking: true },
  { id: "openai/o3-mini", name: "OpenAI o3-mini", description: "Fast reasoning", icon: "thinking", supportsThinking: true },
];

// Models that support web search (via OpenRouter :online suffix)
const SEARCH_CAPABLE_MODELS: AIModel[] = [
  { id: "google/gemini-2.5-flash-preview:thinking", name: "Gemini 2.5 Flash", description: "Fast search", icon: "premium" },
  { id: "openai/gpt-4o", name: "GPT-4o", description: "OpenAI's best", icon: "premium" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & affordable", icon: "premium" },
];

type ModelId = string;

// Prompt Templates
interface PromptTemplate {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  category: "writing" | "business" | "creative" | "analysis";
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: "1", name: "Blog Post", icon: "FileText", prompt: "Write a blog post about ", category: "writing" },
  { id: "2", name: "Email Draft", icon: "Mail", prompt: "Draft a professional email about ", category: "business" },
  { id: "3", name: "Social Media", icon: "Share2", prompt: "Create engaging social media posts for ", category: "creative" },
  { id: "4", name: "Product Description", icon: "Package", prompt: "Write a compelling product description for ", category: "business" },
  { id: "5", name: "Meeting Summary", icon: "Users", prompt: "Summarize the key points from a meeting about ", category: "business" },
  { id: "6", name: "Code Review", icon: "Code", prompt: "Review this code and suggest improvements: ", category: "analysis" },
  { id: "7", name: "Brainstorm Ideas", icon: "Lightbulb", prompt: "Brainstorm 10 creative ideas for ", category: "creative" },
  { id: "8", name: "Explain Concept", icon: "BookOpen", prompt: "Explain this concept in simple terms: ", category: "analysis" },
  { id: "9", name: "Pros and Cons", icon: "Scale", prompt: "List the pros and cons of ", category: "analysis" },
  { id: "10", name: "Marketing Copy", icon: "Megaphone", prompt: "Write persuasive marketing copy for ", category: "business" },
];

// Keyboard shortcuts configuration
interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: "navigation" | "actions" | "chat";
}

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { keys: ["Ctrl/Cmd", "N"], description: "New chat", category: "navigation" },
  { keys: ["Ctrl/Cmd", "B"], description: "Toggle sidebar", category: "navigation" },
  { keys: ["Ctrl/Cmd", "F"], description: "Search messages", category: "chat" },
  { keys: ["Ctrl/Cmd", "Shift", "E"], description: "Export conversation", category: "actions" },
  { keys: ["Ctrl/Cmd", "/"], description: "Show keyboard shortcuts", category: "navigation" },
  { keys: ["Escape"], description: "Cancel/Close", category: "navigation" },
  { keys: ["Enter"], description: "Send message", category: "chat" },
  { keys: ["Shift", "Enter"], description: "New line in message", category: "chat" },
];

interface WebCitation {
  url: string;
  title: string;
  content?: string;
}

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  followUpQuestions?: string[];
  citations?: WebCitation[];
  isSearching?: boolean;
  timestamp: Date;
  reaction?: "up" | "down" | null;
  isBookmarked?: boolean;
}

export default function ChatPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [selectedModel, setSelectedModel] = useState<ModelId>("meta-llama/llama-3.2-3b-instruct:free");
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Invoice Builder State
  const [builderMode, setBuilderMode] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  
  // New Feature States
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [renamingConversationId, setRenamingConversationId] = useState<Id<"conversations"> | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  
  // Additional Feature States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // New Feature States
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [kanbanEnabled, setKanbanEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check if on desktop - but close sidebar when builder is open
  useEffect(() => {
    const checkDesktop = () => {
      if (!builderOpen) {
        setSidebarOpen(window.innerWidth >= 768);
      }
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [builderOpen]);

  // Auto-close sidebar when builder opens
  useEffect(() => {
    if (builderOpen) {
      setSidebarOpen(false);
    }
  }, [builderOpen]);

  // Close builder if user switches to a non-Claude model
  useEffect(() => {
    if (builderOpen && !modelSupportsInvoiceBuilder(selectedModel)) {
      setBuilderOpen(false);
      setBuilderMode(false);
      setCurrentInvoice(null);
      setBuildSteps([]);
    }
  }, [selectedModel, builderOpen]);

  // Toggle builder mode
  const toggleBuilderMode = useCallback(() => {
    const newMode = !builderMode;
    setBuilderMode(newMode);
    if (newMode) {
      // Initialize empty invoice when entering builder mode
      setCurrentInvoice(createEmptyInvoice());
      setBuilderOpen(true);
      setBuildSteps([]);
    } else {
      setBuilderOpen(false);
      setCurrentInvoice(null);
      setBuildSteps([]);
    }
  }, [builderMode]);

  // Convex queries and mutations
  const conversations = useQuery(api.chat.getConversations, { limit: 50 });
  const activeConversation = useQuery(
    api.chat.getConversation,
    activeConversationId ? { conversationId: activeConversationId } : "skip"
  );
  const createConversation = useMutation(api.chat.createConversation);
  const addMessage = useMutation(api.chat.addMessage);
  const deleteConversation = useMutation(api.chat.deleteConversation);
  const updateConversationTitle = useMutation(api.chat.updateConversationTitle);
  const archiveConversation = useMutation(api.chat.archiveConversation);

  // Get current model info
  const allModels = [...AI_MODELS, ...THINKING_MODELS, ...SEARCH_CAPABLE_MODELS];
  const currentModel = allModels.find(m => m.id === selectedModel);
  const isFreeTier = currentModel?.icon === "free";
  const isThinkingModel = currentModel?.icon === "thinking";
  const modelSupportsThinking = currentModel?.supportsThinking || false;
  const modelSupportsSearch = SEARCH_CAPABLE_MODELS.some(m => m.id === selectedModel);

  // Handle thinking toggle - auto-select a thinking model if current doesn't support it
  const handleThinkingChange = useCallback((enabled: boolean) => {
    setThinkingEnabled(enabled);
    if (enabled && !modelSupportsThinking) {
      setSelectedModel(THINKING_MODELS[0].id);
    }
  }, [modelSupportsThinking]);

  // Handle web search toggle - auto-select a search-capable model if current doesn't support it
  const handleWebSearchChange = useCallback((enabled: boolean) => {
    setWebSearchEnabled(enabled);
    if (enabled && !modelSupportsSearch) {
      setSelectedModel(SEARCH_CAPABLE_MODELS[0].id);
    }
  }, [modelSupportsSearch]);

  // Toggle thinking expanded state
  const toggleThinkingExpand = useCallback((messageId: string) => {
    setExpandedThinking((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  // Toggle citations expanded state
  const toggleCitationsExpand = useCallback((messageId: string) => {
    setExpandedCitations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  // Sync messages from active conversation
  useEffect(() => {
    if (activeConversation?.messages) {
      setLocalMessages(
        activeConversation.messages.map((msg) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }))
      );
    }
  }, [activeConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Generate follow-up questions from AI response
  const generateFollowUpQuestions = useCallback(async (
    assistantContent: string,
    conversationContext: { role: string; content: string }[]
  ): Promise<string[]> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...conversationContext,
            { role: "assistant", content: assistantContent },
            {
              role: "user",
              content: "Based on the conversation above, suggest exactly 3 short follow-up questions the user might want to ask next. Return ONLY the questions, one per line, no numbering or bullet points. Keep each under 50 characters."
            }
          ],
          model: "meta-llama/llama-3.2-3b-instruct:free", // Use free model for suggestions
          stream: false,
        }),
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      const questions = data.message
        ?.split("\n")
        .map((q: string) => q.trim())
        .filter((q: string) => q.length > 0 && q.length < 60)
        .slice(0, 3) || [];
      
      return questions;
    } catch {
      return [];
    }
  }, []);

  const handleSend = useCallback(async (message: string, _files?: File[]) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      let conversationId = activeConversationId;

      // Create a new conversation if none is active
      if (!conversationId) {
        conversationId = await createConversation({
          model: selectedModel,
        });
        setActiveConversationId(conversationId);
      }

      // Add user message to local state immediately for responsiveness
      const userMessageId = `temp-user-${Date.now()}`;
      const userMessage: LocalMessage = {
        id: userMessageId,
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, userMessage]);

      // Save user message to Convex
      await addMessage({
        conversationId,
        role: "user",
        content: message,
      });

      // Create placeholder for assistant message
      const assistantMessageId = `temp-assistant-${Date.now()}`;
      setLocalMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          isSearching: webSearchEnabled,
          timestamp: new Date(),
        },
      ]);

      // Call OpenRouter API for streaming response
      const apiMessages = [...localMessages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Check if this is an invoice-related request (only for Claude models)
      const canUseInvoiceBuilder = modelSupportsInvoiceBuilder(selectedModel);
      const isInvoiceRequest = canUseInvoiceBuilder && (
        builderMode || 
        message.toLowerCase().includes("invoice") ||
        message.toLowerCase().includes("bill") ||
        message.toLowerCase().includes("receipt")
      );

      // If invoice request detected and using Claude, activate builder mode
      let useInvoiceMode = builderMode && canUseInvoiceBuilder;
      if (isInvoiceRequest && !builderOpen) {
        useInvoiceMode = true;
        setBuilderMode(true);
        setBuilderOpen(true);
        setCurrentInvoice(createEmptyInvoice());
        setIsBuilding(true);
        setBuildSteps([
          { id: "1", label: "Understanding your request", status: "active" },
          { id: "2", label: "Gathering business details", status: "pending" },
          { id: "3", label: "Adding line items", status: "pending" },
          { id: "4", label: "Calculating totals", status: "pending" },
          { id: "5", label: "Finalizing invoice", status: "pending" },
        ]);
      } else if (builderMode && builderOpen && canUseInvoiceBuilder) {
        // Already in builder mode, reset building state for new request
        setIsBuilding(true);
        setBuildSteps([
          { id: "1", label: "Understanding your request", status: "active" },
          { id: "2", label: "Gathering business details", status: "pending" },
          { id: "3", label: "Adding line items", status: "pending" },
          { id: "4", label: "Calculating totals", status: "pending" },
          { id: "5", label: "Finalizing invoice", status: "pending" },
        ]);
      }

      // Add invoice system prompt if in builder mode (use local variable since state update is async)
      const systemPrompt = useInvoiceMode ? INVOICE_BUILDER_SYSTEM_PROMPT : undefined;

      // Create abort controller for stop generation
      const controller = new AbortController();
      setAbortController(controller);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          stream: true,
          reasoning: thinkingEnabled && modelSupportsThinking ? { enabled: true, effort: "medium" } : undefined,
          webSearch: webSearchEnabled,
          systemPrompt: systemPrompt,
          enableKanban: kanbanEnabled,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let accumulatedReasoning = "";

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              // Handle reasoning tokens
              if (parsed.reasoning) {
                accumulatedReasoning += parsed.reasoning;
                setLocalMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, reasoning: accumulatedReasoning }
                      : msg
                  )
                );
              }

              // Handle web search citations
              if (parsed.citations) {
                setLocalMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, citations: parsed.citations, isSearching: false }
                      : msg
                  )
                );
              }

              // Handle regular content
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setLocalMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, isSearching: false }
                      : msg
                  )
                );

                // Try to parse invoice data in real-time during streaming
                if (useInvoiceMode) {
                  const invoiceData = parseInvoiceFromAI(accumulatedContent);
                  if (invoiceData) {
                    // Update build progress as we detect data
                    if (invoiceData.from?.name || invoiceData.to?.name) {
                      setBuildSteps(prev => prev.map((step, i) => ({
                        ...step,
                        status: i <= 1 ? "complete" as const : i === 2 ? "active" as const : step.status
                      })));
                    }
                    if (invoiceData.items && invoiceData.items.length > 0) {
                      setBuildSteps(prev => prev.map((step, i) => ({
                        ...step,
                        status: i <= 2 ? "complete" as const : i === 3 ? "active" as const : step.status
                      })));
                    }

                    // Update invoice preview in real-time
                    setCurrentInvoice(prev => {
                      if (!prev) return prev;
                      const merged = {
                        ...prev,
                        ...invoiceData,
                        // Deep merge nested objects
                        from: {
                          ...prev.from,
                          ...(invoiceData.from || {}),
                        },
                        to: {
                          ...prev.to,
                          ...(invoiceData.to || {}),
                        },
                        items: invoiceData.items?.map((item, idx) => ({
                          id: `item-${idx}-${Date.now()}`,
                          description: item.description || "",
                          quantity: item.quantity || 1,
                          unitPrice: item.unitPrice || 0,
                          total: (item.quantity || 1) * (item.unitPrice || 0),
                        })) || prev.items,
                      };
                      return calculateInvoiceTotals(merged);
                    });
                  }
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Save assistant message to Convex
      await addMessage({
        conversationId,
        role: "assistant",
        content: accumulatedContent,
        model: selectedModel,
      });

      // If in builder mode, finalize the invoice after streaming completes
      if (useInvoiceMode && accumulatedContent) {
        const invoiceData = parseInvoiceFromAI(accumulatedContent);
        if (invoiceData) {
          // Complete all build steps
          setBuildSteps(prev => prev.map(step => ({
            ...step,
            status: "complete" as const
          })));
          setIsBuilding(false);

          // Final update to invoice with complete data
          setCurrentInvoice(prev => {
            if (!prev) return prev;
            const merged = {
              ...prev,
              ...invoiceData,
              // Deep merge nested objects
              from: {
                ...prev.from,
                ...(invoiceData.from || {}),
              },
              to: {
                ...prev.to,
                ...(invoiceData.to || {}),
              },
              items: invoiceData.items?.map((item, i) => ({
                id: `item-${i}-${Date.now()}`,
                description: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                total: (item.quantity || 1) * (item.unitPrice || 0),
              })) || prev.items,
            };
            return calculateInvoiceTotals(merged);
          });
        } else {
          // No JSON found - keep building state and show message
          setIsBuilding(false);
          setBuildSteps(prev => prev.map((step, i) => ({
            ...step,
            status: i === 0 ? "complete" as const : "pending" as const
          })));
        }
      }

      // Generate follow-up questions in background
      generateFollowUpQuestions(accumulatedContent, apiMessages).then((questions) => {
        if (questions.length > 0) {
          setLocalMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, followUpQuestions: questions }
                : msg
            )
          );
        }
      });

    } catch (err) {
      // Don't show error if it was aborted by user
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [activeConversationId, createConversation, addMessage, localMessages, selectedModel, isLoading, thinkingEnabled, modelSupportsThinking, webSearchEnabled, generateFollowUpQuestions, builderMode, builderOpen, kanbanEnabled]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setLocalMessages([]);
    setError(null);
    // Close sidebar on mobile after action
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // Copy message to clipboard
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Edit user message
  const startEditMessage = useCallback((messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  }, []);

  const cancelEditMessage = useCallback(() => {
    setEditingMessageId(null);
    setEditingContent("");
  }, []);

  // Rename conversation
  const startRenameConversation = useCallback((id: Id<"conversations">, currentTitle: string) => {
    setRenamingConversationId(id);
    setRenameValue(currentTitle);
  }, []);

  const cancelRenameConversation = useCallback(() => {
    setRenamingConversationId(null);
    setRenameValue("");
  }, []);

  const submitRenameConversation = useCallback(async () => {
    if (!renamingConversationId || !renameValue.trim()) return;
    
    try {
      await updateConversationTitle({
        conversationId: renamingConversationId,
        title: renameValue.trim(),
      });
      setRenamingConversationId(null);
      setRenameValue("");
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  }, [renamingConversationId, renameValue, updateConversationTitle]);

  // Archive conversation
  const handleArchiveConversation = useCallback(async (id: Id<"conversations">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveConversation({ conversationId: id });
      if (activeConversationId === id) {
        startNewChat();
      }
    } catch (err) {
      console.error("Failed to archive conversation:", err);
    }
  }, [archiveConversation, activeConversationId, startNewChat]);

  // Export conversation to markdown
  const exportConversationMarkdown = useCallback(() => {
    if (!localMessages.length) return;
    
    const title = activeConversation?.title || "Conversation";
    const date = new Date().toLocaleDateString();
    
    let markdown = `# ${title}\n\nExported on ${date}\n\n---\n\n`;
    
    localMessages.forEach((msg) => {
      const role = msg.role === "user" ? "**You**" : "**Assistant**";
      const timestamp = msg.timestamp.toLocaleTimeString();
      markdown += `### ${role} (${timestamp})\n\n${msg.content}\n\n---\n\n`;
    });
    
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [localMessages, activeConversation]);

  // Format timestamp for display
  const formatMessageTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Message reaction handler
  const handleMessageReaction = useCallback((messageId: string, reaction: "up" | "down") => {
    setLocalMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
        : msg
    ));
  }, []);

  // Bookmark message handler
  const handleBookmarkMessage = useCallback((messageId: string) => {
    setLocalMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isBookmarked: !msg.isBookmarked }
        : msg
    ));
  }, []);

  // Pin conversation handler
  const handlePinConversation = useCallback((conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  }, []);

  // Share message as formatted text
  const handleShareMessage = useCallback(async (message: LocalMessage) => {
    const shareText = `${message.role === "user" ? "Q: " : "A: "}${message.content}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chat Message",
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(shareText);
        setCopiedMessageId(message.id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  }, []);

  // Stop generation
  const handleStopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  // Voice input handlers with Web Speech API
  const startVoiceRecording = useCallback(async () => {
    try {
      // Check for Web Speech API support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        // Fallback to MediaRecorder if Speech Recognition not available
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        return;
      }

      // Use Web Speech API for real-time transcription
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setVoiceTranscript("");
    } catch (err) {
      console.error("Failed to start voice recording:", err);
    }
  }, []);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // If we have a transcript, send it as a message
      if (voiceTranscript.trim()) {
        handleSend(voiceTranscript);
        setVoiceTranscript("");
      }
    } else if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, voiceTranscript, handleSend]);

  // Text-to-speech for AI responses
  const speakMessage = useCallback((messageId: string, content: string) => {
    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    if (isSpeaking && speakingMessageId === messageId) {
      // Toggle off if clicking same message
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to get a good voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google') || v.lang === 'en-US');
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    
    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setSpeakingMessageId(messageId);
  }, [isSpeaking, speakingMessageId]);

  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  // Filter messages by search query
  const filteredMessages = useCallback(() => {
    if (!messageSearchQuery.trim()) return localMessages;
    const query = messageSearchQuery.toLowerCase();
    return localMessages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
  }, [localMessages, messageSearchQuery]);

  // Get highlighted message indices for search
  const getHighlightedMessageIndices = useCallback(() => {
    if (!messageSearchQuery.trim()) return new Set<number>();
    const query = messageSearchQuery.toLowerCase();
    const indices = new Set<number>();
    localMessages.forEach((msg, idx) => {
      if (msg.content.toLowerCase().includes(query)) {
        indices.add(idx);
      }
    });
    return indices;
  }, [localMessages, messageSearchQuery]);

  // Conversation statistics
  const conversationStats = useCallback(() => {
    const totalMessages = localMessages.length;
    const userMessages = localMessages.filter(m => m.role === "user").length;
    const assistantMessages = localMessages.filter(m => m.role === "assistant").length;
    const totalWords = localMessages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);
    const avgResponseLength = assistantMessages > 0 
      ? Math.round(localMessages.filter(m => m.role === "assistant").reduce((acc, m) => acc + m.content.length, 0) / assistantMessages)
      : 0;
    const bookmarkedCount = localMessages.filter(m => m.isBookmarked).length;
    
    return {
      totalMessages,
      userMessages,
      assistantMessages,
      totalWords,
      avgResponseLength,
      bookmarkedCount,
    };
  }, [localMessages]);

  // Filter conversations by search
  const filteredConversations = useCallback(() => {
    if (!conversations || !searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query) ||
      conv.lastMessage?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Fork conversation from a specific message
  const handleForkConversation = useCallback(async (messageIndex: number) => {
    if (!activeConversationId) return;
    
    // Create a new conversation with messages up to this point
    const messagesToFork = localMessages.slice(0, messageIndex + 1);
    
    const newConversationId = await createConversation({
      title: `Fork: ${activeConversation?.title || "New Chat"}`,
      model: selectedModel,
    });
    
    // Add forked messages to the new conversation
    for (const msg of messagesToFork) {
      await addMessage({
        conversationId: newConversationId,
        role: msg.role,
        content: msg.content,
      });
    }
    
    // Switch to the new conversation
    setActiveConversationId(newConversationId);
  }, [activeConversationId, localMessages, createConversation, addMessage, selectedModel, activeConversation]);

  // Use prompt template
  const usePromptTemplate = useCallback((template: PromptTemplate) => {
    setShowPromptTemplates(false);
    // The input component would need to be updated to accept initial value
    // For now, we'll send the prompt directly
    handleSend(template.prompt);
  }, [handleSend]);

  const selectConversation = useCallback((id: Id<"conversations">) => {
    setActiveConversationId(id);
    setError(null);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback(async (id: Id<"conversations">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation({ conversationId: id });
      if (activeConversationId === id) {
        startNewChat();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  }, [deleteConversation, activeConversationId, startNewChat]);

  // Regenerate assistant response
  const handleRegenerateResponse = useCallback(async (messageIndex: number) => {
    if (isLoading || !activeConversationId) return;
    
    // Find the user message that triggered this response
    const userMessage = localMessages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;
    
    // Remove messages from this assistant message onwards
    setLocalMessages(prev => prev.slice(0, messageIndex));
    
    // Re-send the user message to get a new response
    await handleSend(userMessage.content);
  }, [isLoading, activeConversationId, localMessages, handleSend]);

  // Submit edited message
  const submitEditMessage = useCallback(async (messageIndex: number) => {
    if (!editingContent.trim() || isLoading) return;
    
    // Remove messages from this point onwards and re-send
    setLocalMessages(prev => prev.slice(0, messageIndex));
    setEditingMessageId(null);
    
    // Send the edited message
    await handleSend(editingContent);
    setEditingContent("");
  }, [editingContent, isLoading, handleSend]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel editing or close modals
      if (e.key === "Escape") {
        if (editingMessageId) {
          cancelEditMessage();
        }
        if (renamingConversationId) {
          cancelRenameConversation();
        }
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        }
        if (showMessageSearch) {
          setShowMessageSearch(false);
          setMessageSearchQuery("");
        }
        if (isSpeaking) {
          stopSpeaking();
        }
      }
      
      // Ctrl+N or Cmd+N for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        startNewChat();
      }
      
      // Ctrl+Shift+E or Cmd+Shift+E to export conversation
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault();
        exportConversationMarkdown();
      }
      
      // Ctrl+/ or Cmd+/ to show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      
      // Ctrl+F or Cmd+F to search messages (when not in input)
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && localMessages.length > 0) {
        const activeElement = document.activeElement;
        const isInInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";
        if (!isInInput) {
          e.preventDefault();
          setShowMessageSearch(prev => !prev);
        }
      }
      
      // Ctrl+B or Cmd+B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingMessageId, renamingConversationId, cancelEditMessage, cancelRenameConversation, startNewChat, exportConversationMarkdown, showKeyboardShortcuts, showMessageSearch, localMessages.length, isSpeaking, stopSpeaking]);

  // Determine which models to show based on enabled features
  const modelsToShow = webSearchEnabled 
    ? SEARCH_CAPABLE_MODELS 
    : thinkingEnabled 
      ? THINKING_MODELS 
      : AI_MODELS;

  return (
    <div className="flex h-[100dvh] bg-[#0a0a0a] text-white overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Always visible on desktop, slide-in on mobile */}
      <aside className="hidden md:flex w-[280px] flex-col border-r border-[#1f1f1f] bg-[#0f0f0f]">
        {/* Desktop Sidebar Header */}
        <div className="p-4 border-b border-[#1f1f1f]">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-red-600" />
            <span className="font-semibold text-lg">CherryCap</span>
          </Link>
          <Button
            onClick={startNewChat}
            className="w-full justify-start gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white border border-[#333]"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Desktop Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Search Bar */}
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1f1f1f] border border-[#333] rounded-lg focus:outline-none focus:border-rose-500 text-white placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-3 w-3 text-gray-500 hover:text-white" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2 py-2">
            <button
              onClick={() => setShowArchivedChats(!showArchivedChats)}
              className="text-xs text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
            >
              {showArchivedChats ? "Archived" : "History"}
            </button>
            {showArchivedChats && (
              <button
                onClick={() => setShowArchivedChats(false)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Back
              </button>
            )}
          </div>
          
          {/* Pinned Conversations */}
          {!showArchivedChats && pinnedConversations.size > 0 && filteredConversations()?.some(c => pinnedConversations.has(c._id)) && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 px-2 py-1 flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </div>
              <div className="space-y-1">
                {filteredConversations()
                  ?.filter((conv) => !conv.isArchived && pinnedConversations.has(conv._id))
                  .map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => !renamingConversationId && selectConversation(conv._id)}
                      onKeyDown={(e) => e.key === "Enter" && !renamingConversationId && selectConversation(conv._id)}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-colors hover:bg-[#1f1f1f] cursor-pointer group border-l-2 border-rose-500",
                        activeConversationId === conv._id && "bg-[#1f1f1f]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Pin className="h-3 w-3 text-rose-400 flex-shrink-0" />
                        <span className="text-sm truncate">{conv.title}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            {filteredConversations() === undefined ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            ) : filteredConversations()?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </div>
            ) : (
              filteredConversations()
                ?.filter((conv) => showArchivedChats ? conv.isArchived : (!conv.isArchived && !pinnedConversations.has(conv._id)))
                .map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => !renamingConversationId && selectConversation(conv._id)}
                    onKeyDown={(e) => e.key === "Enter" && !renamingConversationId && selectConversation(conv._id)}
                    role="button"
                    tabIndex={0}
                    className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-[#1f1f1f] cursor-pointer group ${
                      activeConversationId === conv._id ? "bg-[#1f1f1f]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {renamingConversationId === conv._id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") submitRenameConversation();
                                if (e.key === "Escape") cancelRenameConversation();
                              }}
                              className="flex-1 bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm focus:outline-none focus:border-rose-500"
                              autoFocus
                            />
                            <button
                              onClick={submitRenameConversation}
                              className="p-1 hover:bg-[#333] rounded"
                            >
                              <Check className="h-3 w-3 text-green-500" />
                            </button>
                            <button
                              onClick={cancelRenameConversation}
                              className="p-1 hover:bg-[#333] rounded"
                            >
                              <X className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium truncate">{conv.title}</div>
                            <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                            <div className="text-xs text-gray-600 mt-1">{formatDate(conv.updatedAt)}</div>
                          </>
                        )}
                      </div>
                      {!renamingConversationId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-opacity"
                            >
                              <ChevronDown className="h-3 w-3 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40 bg-[#1f1f1f] border-[#333]" align="end">
                            <DropdownMenuItem
                              className="text-white hover:bg-[#2a2a2a] cursor-pointer"
                              onClick={(e) => handlePinConversation(conv._id, e)}
                            >
                              <Pin className={cn("mr-2 h-3 w-3", pinnedConversations.has(conv._id) && "text-rose-400")} />
                              {pinnedConversations.has(conv._id) ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-white hover:bg-[#2a2a2a] cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                startRenameConversation(conv._id, conv.title);
                              }}
                            >
                              <Pencil className="mr-2 h-3 w-3" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-white hover:bg-[#2a2a2a] cursor-pointer"
                              onClick={(e) => handleArchiveConversation(conv._id, e)}
                            >
                              <Archive className="mr-2 h-3 w-3" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#333]" />
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-[#2a2a2a] cursor-pointer"
                              onClick={(e) => handleDeleteConversation(conv._id, e)}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Desktop User Section */}
        <div className="p-4 border-t border-[#1f1f1f]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors">
                <Avatar className="h-8 w-8 border border-[#333]">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-[#1f1f1f] text-white">
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{user?.fullName || "Guest User"}</div>
                  <div className="text-xs text-gray-500">Free Plan</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#1f1f1f] border-[#333]" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#333]" />
              <DropdownMenuItem
                className="text-white hover:bg-[#2a2a2a]"
                onClick={() => signOut({ redirectUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#333]" />
              <DropdownMenuItem className="p-0">
                <Button className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar - Animated slide-in */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed md:hidden z-30 h-full w-[280px] flex flex-col border-r border-[#1f1f1f] bg-[#0f0f0f]"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#1f1f1f]">
              <div className="flex items-center justify-between mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-red-600" />
                  <span className="font-semibold text-lg">CherryCap</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1.5 hover:bg-[#1f1f1f] rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Button
                onClick={startNewChat}
                className="w-full justify-start gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white border border-[#333]"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex items-center justify-between px-2 py-2">
                <button
                  onClick={() => setShowArchivedChats(!showArchivedChats)}
                  className="text-xs text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
                >
                  {showArchivedChats ? "Archived" : "History"}
                </button>
                {showArchivedChats && (
                  <button
                    onClick={() => setShowArchivedChats(false)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {conversations === undefined ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No conversations yet
                  </div>
                ) : (
                  conversations
                    .filter((conv) => showArchivedChats ? conv.isArchived : !conv.isArchived)
                    .map((conv) => (
                      <motion.div
                        key={conv._id}
                        onClick={() => !renamingConversationId && selectConversation(conv._id)}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        className={`w-full text-left p-3 rounded-lg group transition-colors cursor-pointer ${
                          activeConversationId === conv._id ? "bg-[#1f1f1f]" : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && !renamingConversationId && selectConversation(conv._id)}
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {renamingConversationId === conv._id ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") submitRenameConversation();
                                    if (e.key === "Escape") cancelRenameConversation();
                                  }}
                                  className="flex-1 bg-[#2a2a2a] border border-[#444] rounded px-2 py-1 text-sm focus:outline-none focus:border-rose-500"
                                  autoFocus
                                />
                                <button
                                  onClick={submitRenameConversation}
                                  className="p-1 hover:bg-[#333] rounded"
                                >
                                  <Check className="h-3 w-3 text-green-500" />
                                </button>
                                <button
                                  onClick={cancelRenameConversation}
                                  className="p-1 hover:bg-[#333] rounded"
                                >
                                  <X className="h-3 w-3 text-gray-500" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm font-medium truncate">{conv.title}</div>
                                <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                                <div className="text-xs text-gray-600 mt-1">{formatDate(conv.updatedAt)}</div>
                              </>
                            )}
                          </div>
                          {!renamingConversationId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-opacity"
                                >
                                  <ChevronDown className="h-3 w-3 text-gray-500" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-40 bg-[#1f1f1f] border-[#333]" align="end">
                                <DropdownMenuItem
                                  className="text-white hover:bg-[#2a2a2a] cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startRenameConversation(conv._id, conv.title);
                                  }}
                                >
                                  <Pencil className="mr-2 h-3 w-3" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-white hover:bg-[#2a2a2a] cursor-pointer"
                                  onClick={(e) => handleArchiveConversation(conv._id, e)}
                                >
                                  <Archive className="mr-2 h-3 w-3" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#333]" />
                                <DropdownMenuItem
                                  className="text-red-400 hover:bg-[#2a2a2a] cursor-pointer"
                                  onClick={(e) => handleDeleteConversation(conv._id, e)}
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </motion.div>
                    ))
                )}
              </div>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-[#1f1f1f]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors">
                    <Avatar className="h-8 w-8 border border-[#333]">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || "User"}
                      />
                      <AvatarFallback className="bg-[#1f1f1f] text-white">
                        {user?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">{user?.fullName || "Guest User"}</div>
                      <div className="text-xs text-gray-500">Free Plan</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1f1f1f] border-[#333]" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-[#333]" />
                  <DropdownMenuItem
                    className="text-white hover:bg-[#2a2a2a]"
                    onClick={() => signOut({ redirectUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#333]" />
                  <DropdownMenuItem className="p-0">
                    <Button className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 md:p-4 border-b border-[#1f1f1f]">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#1f1f1f] rounded-lg transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo - mobile only (desktop has it in sidebar) */}
          <div className="flex items-center gap-2 flex-1 min-w-0 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-rose-400 to-red-600" />
              <span className="font-medium text-sm">CherryCap AI</span>
            </Link>
          </div>
          
          {/* Spacer for desktop */}
          <div className="hidden md:flex flex-1 items-center">
            <span className="text-sm text-gray-500">
              {currentModel?.name || "Select a model"}
            </span>
          </div>

          {/* Invoice Builder Toggle - Only show for Claude models */}
          {modelSupportsInvoiceBuilder(selectedModel) && (
            <Button
              onClick={toggleBuilderMode}
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors",
                builderMode 
                  ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
              )}
            >
              <Receipt className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {builderMode ? "Exit Builder" : "Invoice"}
              </span>
            </Button>
          )}

          {/* Prompt Templates Button */}
          <Button
            onClick={() => setShowPromptTemplates(!showPromptTemplates)}
            variant="ghost"
            size="sm"
            className={cn(
              "transition-colors",
              showPromptTemplates 
                ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
            )}
            title="Prompt templates"
          >
            <Zap className="h-4 w-4" />
          </Button>

          {/* Stats Button - Only show when there are messages */}
          {localMessages.length > 0 && (
            <Button
              onClick={() => setShowStats(!showStats)}
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors",
                showStats 
                  ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
              )}
              title="Conversation statistics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          )}

          {/* Kanban Access Toggle */}
          <Button
            onClick={() => {
              const newEnabled = !kanbanEnabled;
              setKanbanEnabled(newEnabled);
              // Auto-switch to a compatible model if current doesn't support Kanban
              if (newEnabled && !modelSupportsKanban(selectedModel)) {
                setSelectedModel("openai/gpt-4o");
              }
            }}
            variant="ghost"
            size="sm"
            className={cn(
              "transition-colors",
              kanbanEnabled 
                ? "text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
            )}
            title={kanbanEnabled 
              ? "Kanban access enabled - AI can manage your tasks" 
              : "Enable Kanban access (requires GPT-4, Claude, or Gemini)"
            }
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>

          {/* Timestamp Toggle */}
          <Button
            onClick={() => setShowTimestamps(!showTimestamps)}
            variant="ghost"
            size="sm"
            className={cn(
              "transition-colors",
              showTimestamps 
                ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
            )}
            title={showTimestamps ? "Hide timestamps" : "Show timestamps"}
          >
            <Clock className="h-4 w-4" />
          </Button>

          {/* Export Button - Only show when there are messages */}
          {localMessages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                  title="Export conversation"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-[#1f1f1f] border-[#333]" align="end">
                <DropdownMenuItem
                  className="text-white hover:bg-[#2a2a2a] cursor-pointer"
                  onClick={exportConversationMarkdown}
                >
                  <FileText className="mr-2 h-3 w-3" />
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Message Search Button - Only show when there are messages */}
          {localMessages.length > 0 && (
            <Button
              onClick={() => setShowMessageSearch(!showMessageSearch)}
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors",
                showMessageSearch 
                  ? "text-green-400 bg-green-500/10 hover:bg-green-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
              )}
              title="Search messages (Ctrl+F)"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Keyboard Shortcuts Button */}
          <Button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            variant="ghost"
            size="sm"
            className={cn(
              "transition-colors hidden sm:flex",
              showKeyboardShortcuts 
                ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" 
                : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
            )}
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          {/* Voice Input Button */}
          <Button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            variant="ghost"
            size="sm"
            className={cn(
              "transition-colors",
              isRecording 
                ? "text-red-400 bg-red-500/10 hover:bg-red-500/20 animate-pulse" 
                : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
            )}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          {/* Stop Generation Button - Only show when loading */}
          {isLoading && (
            <Button
              onClick={handleStopGeneration}
              variant="ghost"
              size="sm"
              className="text-red-400 bg-red-500/10 hover:bg-red-500/20"
              title="Stop generation"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          )}

          {/* New Chat Button */}
          <Button
            onClick={startNewChat}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>

        {/* Prompt Templates Panel */}
        <AnimatePresence>
          {showPromptTemplates && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-[#1f1f1f] bg-[#0f0f0f] p-4"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Quick Prompts
                  </h3>
                  <button
                    onClick={() => setShowPromptTemplates(false)}
                    className="p-1 hover:bg-[#1f1f1f] rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {PROMPT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => usePromptTemplate(template)}
                      className="p-2 text-left rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#252525] hover:border-[#444] transition-colors group"
                    >
                      <div className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                        {template.name}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-0.5 capitalize">
                        {template.category}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Panel */}
        <AnimatePresence>
          {showStats && localMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-[#1f1f1f] bg-[#0f0f0f] p-4"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    Conversation Stats
                  </h3>
                  <button
                    onClick={() => setShowStats(false)}
                    className="p-1 hover:bg-[#1f1f1f] rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-white">{conversationStats().totalMessages}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Messages</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-cyan-400">{conversationStats().userMessages}</div>
                    <div className="text-[10px] text-gray-500 uppercase">You</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-rose-400">{conversationStats().assistantMessages}</div>
                    <div className="text-[10px] text-gray-500 uppercase">AI</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-amber-400">{conversationStats().totalWords.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Words</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-green-400">{conversationStats().avgResponseLength}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Avg Chars</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-purple-400">{conversationStats().bookmarkedCount}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Bookmarked</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Search Panel */}
        <AnimatePresence>
          {showMessageSearch && localMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-[#1f1f1f] bg-[#0f0f0f] p-4"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search in conversation..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-[#1f1f1f] border border-[#333] rounded-lg focus:outline-none focus:border-green-500 text-white placeholder:text-gray-500"
                      autoFocus
                    />
                    {messageSearchQuery && (
                      <button
                        onClick={() => setMessageSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-gray-500 hover:text-white" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {messageSearchQuery && `${getHighlightedMessageIndices().size} matches`}
                  </div>
                  <button
                    onClick={() => {
                      setShowMessageSearch(false);
                      setMessageSearchQuery("");
                    }}
                    className="p-2 hover:bg-[#1f1f1f] rounded-lg"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Status Banner */}
        <AnimatePresence>
          {kanbanEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
            >
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-indigo-300">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Kanban access enabled - I can view and manage your tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  {!modelSupportsKanban(selectedModel) && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Switch to GPT-4o or Claude for Kanban
                    </span>
                  )}
                  <button
                    onClick={() => setKanbanEnabled(false)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Panel */}
        <AnimatePresence>
          {showKeyboardShortcuts && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-[#1f1f1f] bg-[#0f0f0f] p-4"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-blue-400" />
                    Keyboard Shortcuts
                  </h3>
                  <button
                    onClick={() => setShowKeyboardShortcuts(false)}
                    className="p-1 hover:bg-[#1f1f1f] rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded-lg">
                      <span className="text-xs text-gray-400">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx}>
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#2a2a2a] border border-[#444] rounded text-gray-300">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && <span className="text-gray-600 mx-0.5">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Recording Transcript Panel */}
        <AnimatePresence>
          {isRecording && voiceTranscript && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-[#1f1f1f] bg-[#0f0f0f] p-4"
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <Mic className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-sm text-gray-300 italic">
                    {voiceTranscript || "Listening..."}
                  </div>
                  <Button
                    onClick={stopVoiceRecording}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {localMessages.length === 0 ? (
              // Empty State
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col items-center justify-center p-4 sm:p-8"
              >
                <div className="text-center max-w-md w-full">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/20 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-rose-400" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold mb-2">
                    {builderMode ? "Invoice Builder" : "How can I help?"}
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8">
                    {builderMode 
                      ? "Tell me about the invoice you want to create. I'll build it in real-time."
                      : modelSupportsInvoiceBuilder(selectedModel)
                        ? "Create social media posts, brainstorm marketing ideas, or build professional invoices."
                        : "Create social media posts, brainstorm marketing ideas, or plan your content."
                    }
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {(builderMode ? [
                      "Create an invoice for web design",
                      "Bill $500 for consulting services",
                      "Invoice for 10 hours at $75/hr",
                      "Create a receipt for photography",
                    ] : modelSupportsInvoiceBuilder(selectedModel) ? [
                      "Write an Instagram post",
                      "Create a content calendar",
                      "Create an invoice",
                      "Brainstorm business ideas",
                    ] : [
                      "Write an Instagram post",
                      "Create a content calendar",
                      "Write marketing copy",
                      "Brainstorm business ideas",
                    ]).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className={cn(
                          "p-3 text-sm text-left rounded-xl border transition-colors",
                          suggestion.toLowerCase().includes("invoice") && !builderMode && modelSupportsInvoiceBuilder(selectedModel)
                            ? "border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/50"
                            : "border-[#333] bg-[#1f1f1f] hover:bg-[#2a2a2a] hover:border-[#444]"
                        )}
                      >
                        {suggestion.toLowerCase().includes("invoice") && !builderMode && modelSupportsInvoiceBuilder(selectedModel) && (
                          <Receipt className="h-3 w-3 inline mr-1.5 text-rose-400" />
                        )}
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Messages
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4"
              >
                {localMessages.map((message, messageIndex) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 sm:gap-4 mb-4 sm:mb-6 group/message ${message.role === "user" ? "justify-end" : ""}`}
                  >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl ${
                      message.role === "user"
                        ? "p-3 sm:p-4 bg-[#1f1f1f] border border-[#333]"
                        : "bg-transparent"
                    }`}
                  >
                    {/* Reasoning/Thinking section - using AI Thinking Plan */}
                    {message.role === "assistant" && message.reasoning && (
                      <div className="mb-3">
                        <AIThinkingPlan 
                          reasoning={message.reasoning} 
                          isStreaming={false}
                        />
                      </div>
                    )}
                    
                    {/* Message timestamp */}
                    {showTimestamps && (
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="text-xs text-gray-600">{formatMessageTime(message.timestamp)}</span>
                      </div>
                    )}
                    
                    <div className={message.role === "assistant" ? "py-1" : ""}>
                      {/* User message with edit mode */}
                      {message.role === "user" && editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditMessage}
                              className="text-gray-400 hover:text-white text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => submitEditMessage(messageIndex)}
                              disabled={!editingContent.trim() || isLoading}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-xs"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      ) : message.role === "assistant" ? (
                        <div className={cn(
                          "text-sm leading-relaxed",
                          messageSearchQuery && message.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) && "bg-yellow-500/10 -mx-2 px-2 rounded-lg"
                        )}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-cyan-400 hover:underline"
                                >
                                  {children}
                                </a>
                              ),
                              p: ({ children }) => <p className="my-2">{children}</p>,
                              ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                              li: ({ children }) => <li className="my-0.5">{children}</li>,
                              h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-bold my-3">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
                              code: ({ className, children }) => {
                                const isInline = !className;
                                const language = className?.replace("language-", "") || "";
                                
                                if (isInline) {
                                  return (
                                    <code className="text-pink-400 bg-[#1f1f1f] px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                  );
                                }
                                
                                // Code block with copy button
                                const codeString = String(children).replace(/\n$/, "");
                                return (
                                  <div className="relative group/code">
                                    {language && (
                                      <div className="absolute top-2 left-3 text-[10px] text-gray-500 uppercase font-mono">
                                        {language}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(codeString);
                                      }}
                                      className="absolute top-2 right-2 p-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-md opacity-0 group-hover/code:opacity-100 transition-opacity"
                                      title="Copy code"
                                    >
                                      <Copy className="h-3 w-3 text-gray-400" />
                                    </button>
                                    <code className={cn(
                                      "block font-mono text-xs",
                                      language && "pt-6"
                                    )}>
                                      {children}
                                    </code>
                                  </div>
                                );
                              },
                              pre: ({ children }) => (
                                <pre className="bg-[#1a1a1a] border border-[#333] p-3 rounded-lg my-2 overflow-x-auto text-xs">{children}</pre>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-cyan-500 pl-3 my-2 text-gray-400 italic">{children}</blockquote>
                              ),
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-3">
                                  <table className="min-w-full border border-[#333] rounded-lg overflow-hidden">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-[#1f1f1f]">{children}</thead>
                              ),
                              th: ({ children }) => (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 border-b border-[#333]">{children}</th>
                              ),
                              td: ({ children }) => (
                                <td className="px-3 py-2 text-xs border-b border-[#333] text-gray-400">{children}</td>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    {!editingMessageId && message.content && (
                      <div className={cn(
                        "flex items-center gap-1 mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}>
                        {/* Copy button - for all messages */}
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                          title="Copy message"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </button>
                        
                        {/* Text-to-Speech button - for assistant messages */}
                        {message.role === "assistant" && (
                          <button
                            onClick={() => speakMessage(message.id, message.content)}
                            className={cn(
                              "p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors",
                              speakingMessageId === message.id && "bg-[#2a2a2a]"
                            )}
                            title={speakingMessageId === message.id ? "Stop speaking" : "Read aloud"}
                          >
                            {speakingMessageId === message.id ? (
                              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5 text-gray-500" />
                            )}
                          </button>
                        )}
                        
                        {/* Share button */}
                        <button
                          onClick={() => handleShareMessage(message)}
                          className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                          title="Share message"
                        >
                          <Share2 className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        
                        {/* Bookmark button */}
                        <button
                          onClick={() => handleBookmarkMessage(message.id)}
                          className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                          title={message.isBookmarked ? "Remove bookmark" : "Bookmark"}
                        >
                          <Bookmark className={cn(
                            "h-3.5 w-3.5",
                            message.isBookmarked ? "text-amber-400 fill-amber-400" : "text-gray-500"
                          )} />
                        </button>
                        
                        {/* Reaction buttons - for assistant messages */}
                        {message.role === "assistant" && (
                          <>
                            <button
                              onClick={() => handleMessageReaction(message.id, "up")}
                              className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className={cn(
                                "h-3.5 w-3.5",
                                message.reaction === "up" ? "text-green-400 fill-green-400" : "text-gray-500"
                              )} />
                            </button>
                            <button
                              onClick={() => handleMessageReaction(message.id, "down")}
                              className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                              title="Not helpful"
                            >
                              <ThumbsDown className={cn(
                                "h-3.5 w-3.5",
                                message.reaction === "down" ? "text-red-400 fill-red-400" : "text-gray-500"
                              )} />
                            </button>
                          </>
                        )}
                        
                        {/* Edit button - only for user messages */}
                        {message.role === "user" && (
                          <button
                            onClick={() => startEditMessage(message.id, message.content)}
                            className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                            title="Edit message"
                          >
                            <Pencil className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                        )}
                        
                        {/* Fork conversation button */}
                        <button
                          onClick={() => handleForkConversation(messageIndex)}
                          className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                          title="Fork conversation from here"
                        >
                          <GitBranch className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        
                        {/* Regenerate button - only for assistant messages */}
                        {message.role === "assistant" && !isLoading && (
                          <button
                            onClick={() => handleRegenerateResponse(messageIndex)}
                            className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors"
                            title="Regenerate response"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Web Search Citations */}
                    {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => toggleCitationsExpand(message.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15 transition-colors w-full"
                        >
                          <Globe className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs text-cyan-300 font-medium">
                            {message.citations.length} source{message.citations.length > 1 ? "s" : ""} found
                          </span>
                          <span className="text-xs text-cyan-400/60 ml-auto">
                            {expandedCitations.has(message.id) ? "Hide" : "Show"}
                          </span>
                          {expandedCitations.has(message.id) ? (
                            <ChevronUp className="h-3 w-3 text-cyan-400" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-cyan-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedCitations.has(message.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 space-y-2">
                                {message.citations.map((citation, idx) => (
                                  <a
                                    key={idx}
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 transition-colors group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                      <Globe className="h-4 w-4 text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-cyan-200 font-medium truncate">
                                          {citation.title}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                      </div>
                                      <span className="text-xs text-cyan-400/60 truncate block">
                                        {new URL(citation.url).hostname}
                                      </span>
                                      {citation.content && (
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                          {citation.content}
                                        </p>
                                      )}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    {/* Follow-up Questions */}
                    {message.role === "assistant" && message.followUpQuestions && message.followUpQuestions.length > 0 && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-4 border-t border-[#1f1f1f]"
                      >
                        <p className="text-xs text-gray-500 mb-2">Follow-up questions</p>
                        <div className="flex flex-col gap-2">
                          {message.followUpQuestions.map((question, qIndex) => (
                            <button
                              key={qIndex}
                              onClick={() => handleSend(question)}
                              className="group flex items-center gap-2 p-2.5 text-left text-sm rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#252525] hover:border-[#444] transition-colors"
                            >
                              <span className="flex-1 text-gray-300">{question}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-rose-400 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Loading state */}
              {isLoading && (() => {
                const lastMessage = localMessages[localMessages.length - 1];
                const isStreaming = lastMessage?.role === "assistant";
                const hasReasoning = isStreaming && lastMessage?.reasoning;
                const hasContent = isStreaming && lastMessage?.content;
                const isSearching = isStreaming && lastMessage?.isSearching;
                const isWaitingForResponse = lastMessage?.role === "user";

                if (hasContent) return null;

                // Show web search loading state
                if (isSearching && !hasReasoning && !hasContent) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 sm:gap-4 mb-4 sm:mb-6"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                          <Search className="h-4 w-4 text-cyan-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-cyan-300 font-medium">Searching the web</span>
                              <div className="flex items-center gap-1">
                                {[0, 0.2, 0.4].map((delay, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay }}
                                    className="w-1 h-1 rounded-full bg-cyan-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-cyan-400/60 mt-0.5">Finding relevant sources</p>
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Globe className="h-5 w-5 text-cyan-400/40" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                if (hasReasoning) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 sm:gap-4 mb-4 sm:mb-6"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <AIThinkingPlan 
                          reasoning={lastMessage.reasoning} 
                          isStreaming={true}
                        />
                      </div>
                    </motion.div>
                  );
                }

                if (isWaitingForResponse) {
                  // Show thinking plan UI when thinking mode is enabled
                  if (thinkingEnabled) {
                    return (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 sm:gap-4 mb-4 sm:mb-6"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <AIThinkingPlan 
                            reasoning="" 
                            isStreaming={true}
                          />
                        </div>
                      </motion.div>
                    );
                  }
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 sm:gap-4 mb-4 sm:mb-6"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2 py-2 sm:py-4">
                        {webSearchEnabled ? (
                          <>
                            <Search className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm text-cyan-300">Searching</span>
                            <div className="flex items-center gap-1">
                              {[0, 0.2, 0.4].map((delay, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay }}
                                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="h-4 w-4 text-rose-400" />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-rose-300 font-medium">Thinking</span>
                                <div className="flex items-center gap-1">
                                  {[0, 0.15, 0.3].map((delay, i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ 
                                        opacity: [0.4, 1, 0.4],
                                        y: [0, -3, 0]
                                      }}
                                      transition={{ duration: 1, repeat: Infinity, delay }}
                                      className="w-1.5 h-1.5 rounded-full bg-rose-400"
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-rose-400/60 mt-0.5">Processing your request</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                return null;
              })()}
              
                {error && (
                  <div className="text-center p-4 text-red-400 text-sm">
                    Error: {error.message}. Please try again.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-[#1f1f1f]">
          <div className="max-w-3xl mx-auto">
            <ClaudeChatInput
              onSendMessage={(message) => handleSend(message)}
              disabled={isLoading}
              placeholder={builderMode ? "Describe the invoice you want to create..." : "Ask anything..."}
              models={modelsToShow.map((m): ModelOption => ({
                id: m.id,
                name: m.name,
                description: m.description,
                badge: m.icon === "free" ? "Free" : m.icon === "thinking" ? "Thinking" : undefined,
              }))}
              defaultModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            <p className="text-xs text-center text-gray-600 mt-2 sm:mt-3">
              {builderMode 
                ? "Describe your invoice - I'll build it for you in real-time"
                : "AI can make mistakes. Verify important info."
              }
            </p>
          </div>
        </div>
      </main>

      {/* Invoice Builder Panel */}
      <InvoiceBuilder
        isOpen={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setBuilderMode(false);
        }}
        invoice={currentInvoice}
        isBuilding={isBuilding}
        buildSteps={buildSteps}
        onInvoiceUpdate={setCurrentInvoice}
      />
    </div>
  );
}
