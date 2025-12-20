"use client";

import { useState, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Analytics context type (should match the API route type)
export interface AnalyticsContext {
  hasSites: boolean;
  message?: string;
  generatedAt?: string;
  sites?: Array<{
    site: { name: string; domain: string; siteId: string };
    activeNow: number;
    last7Days: {
      visitors: number;
      sessions: number;
      pageViews: number;
      bounceRate: number;
      avgSessionDuration: number;
      pagesPerSession: number;
    };
    last30Days: {
      visitors: number;
      sessions: number;
      pageViews: number;
    };
    trafficSources: Record<string, number>;
    devices: Record<string, number>;
    topPages: Array<{ path: string; views: number }>;
    performance: { avgLoadTime: number; avgTTFB: number; avgFCP: number };
    topEvents: Array<{ name: string; count: number }>;
    trafficByDay: Array<{ date: string; visitors: number; pageViews: number }>;
  }>;
}

export interface UseChatOptions {
  model?: string;
  analyticsContext?: AnalyticsContext | null;
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  sendMessageStreaming: (content: string) => Promise<void>;
  clearMessages: () => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { model, analyticsContext, onError, onFinish } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Non-streaming message send
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Convert messages to API format
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          stream: false,
          analyticsContext: analyticsContext || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onFinish?.(assistantMessage);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, model, analyticsContext, onError, onFinish]);

  // Streaming message send
  const sendMessageStreaming = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create placeholder for assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Convert messages to API format (exclude the empty assistant message)
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          stream: true,
          analyticsContext: analyticsContext || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (!reader) {
        throw new Error("No response body");
      }

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
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Call onFinish with the final message
      const finalMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: accumulatedContent,
        timestamp: new Date(),
      };
      onFinish?.(finalMessage);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
      
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, model, analyticsContext, onError, onFinish]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendMessageStreaming,
    clearMessages,
    setMessages,
  };
}
