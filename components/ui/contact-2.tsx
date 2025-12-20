"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mail, Globe, Loader2, Bot, User, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Contact2Props {
  title?: string;
  description?: string;
  email?: string;
  web?: { label: string; url: string };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const Contact2 = ({
  title = "Contact Us",
  description = "Chat with our AI assistant to get answers, schedule appointments, or learn more about our services.",
  email = "hello@cherrycap.com",
  web = { label: "cherrycap.com", url: "https://cherrycap.com" },
}: Contact2Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom within the container only (not the page)
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setHasStarted(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const messageHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      messageHistory.push({ role: "user", content: userMessage.content });

      const response = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
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
                  assistantMessage.content += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content }
                        : m
                    )
                  );
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again or email us directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestedQuestions = [
    "I want to book an appointment",
    "What services do you offer?",
    "Tell me about your pricing",
  ];

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-neutral-500/5 via-neutral-400/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-neutral-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-6 mx-auto">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-16 lg:flex-row lg:gap-20">
          {/* Left Side - Contact Info */}
          <motion.div
            className="mx-auto flex max-w-md flex-col justify-between gap-10 lg:mx-0"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center lg:text-left">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-neutral-300 font-medium">Get in Touch</span>
              </motion.div>

              <h2 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                {title.split(" ")[0]}{" "}
                <span className="bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent">
                  {title.split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
            </div>

            <div className="mx-auto w-full lg:mx-0">
              <h3 className="mb-6 text-center text-xl font-semibold text-foreground lg:text-left">
                Contact Details
              </h3>
              <div className="space-y-4">
                <motion.a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-foreground font-medium hover:text-neutral-300 transition-colors">{email}</p>
                  </div>
                </motion.a>

                <motion.a
                  href={web.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Website</p>
                    <p className="text-foreground font-medium hover:text-neutral-300 transition-colors">{web.label}</p>
                  </div>
                </motion.a>

                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">AI Assistant</p>
                    <p className="text-foreground font-medium">Available 24/7</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - AI Chat */}
          <motion.div
            className="mx-auto w-full max-w-lg"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-neutral-700/20 via-neutral-600/20 to-neutral-700/20 rounded-2xl blur-xl opacity-50" />

              <div className="relative flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl overflow-hidden h-[500px]">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-neutral-800 bg-neutral-900/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Ask anything or book an appointment</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {!hasStarted && (
                    <div className="space-y-4">
                      {/* Welcome message */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-neutral-300" />
                        </div>
                        <div className="bg-neutral-800/50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] border border-neutral-700/50">
                          <p className="text-sm text-foreground">
                            Hi there! I&apos;m the CherryCap AI assistant. I can help you book appointments, answer questions about our services, or connect you with our team. How can I help you today?
                          </p>
                        </div>
                      </div>

                      {/* Suggested questions */}
                      <div className="flex flex-wrap gap-2 pl-11">
                        {suggestedQuestions.map((question) => (
                          <button
                            key={question}
                            onClick={() => sendMessage(question)}
                            className="px-3 py-1.5 text-xs font-medium rounded-full border border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 hover:border-neutral-600 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          message.role === "user"
                            ? "bg-neutral-100"
                            : "bg-gradient-to-br from-neutral-700 to-neutral-800"
                        )}>
                          {message.role === "user" ? (
                            <User className="w-4 h-4 text-neutral-900" />
                          ) : (
                            <Bot className="w-4 h-4 text-neutral-300" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 max-w-[85%]",
                            message.role === "user"
                              ? "bg-neutral-100 text-neutral-900 rounded-tr-md"
                              : "bg-neutral-800/50 text-foreground rounded-tl-md border border-neutral-700/50"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-neutral-300" />
                      </div>
                      <div className="bg-neutral-800/50 rounded-2xl rounded-tl-md px-4 py-3 border border-neutral-700/50">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4 text-neutral-400" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800 bg-neutral-900/50">
                  <div className="relative flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Send a message..."
                      disabled={isLoading}
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent disabled:opacity-50 min-h-[44px] max-h-[120px]"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="h-11 w-11 rounded-xl bg-neutral-100 hover:bg-white text-neutral-900 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact2;
