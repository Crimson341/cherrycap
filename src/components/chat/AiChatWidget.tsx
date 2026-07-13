"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send, X } from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  gsap,
  prefersReducedMotion,
  registerGsap,
  useGSAP,
} from "@/lib/gsap-client";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What do websites usually cost?",
  "Can you redesign my current site?",
  "Email me studio info",
  "Any blog posts about AI for small business?",
] as const;

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`${part}-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline decoration-black/30 underline-offset-2 hover:decoration-black"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {linkify(text)}
    </p>
  );
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [hasUnread, setHasUnread] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
    onFinish: () => {
      if (!open) setHasUnread(true);
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useGSAP(
    () => {
      registerGsap();
      if (!fabRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        fabRef.current,
        { scale: 0.6, opacity: 0, y: 24 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "back.out(1.6)",
          delay: 0.8,
        },
      );
    },
    { scope: rootRef },
  );

  useEffect(() => {
    if (!panelRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(panelRef.current, {
        autoAlpha: open ? 1 : 0,
        y: 0,
        scale: 1,
        display: open ? "flex" : "none",
      });
      return;
    }

    if (open) {
      gsap.set(panelRef.current, { display: "flex" });
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 28, scale: 0.94 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          ease: "power3.out",
        },
      );
      window.setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      gsap.to(panelRef.current, {
        autoAlpha: 0,
        y: 16,
        scale: 0.96,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          if (panelRef.current) {
            gsap.set(panelRef.current, { display: "none" });
          }
        },
      });
    }
  }, [open]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, status, open]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      sendMessage({ text: trimmed });
      setInput("");
    },
    [busy, sendMessage],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-end p-4 sm:p-6"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Cherry Capital chat assistant"
          aria-hidden={!open}
          className="hidden h-[min(34rem,calc(100dvh-6.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden border border-black bg-white shadow-[6px_6px_0_0_#000]"
          style={{ transformOrigin: "bottom right" }}
        >
          <header className="flex items-start justify-between gap-3 border-b border-black/10 bg-black px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Cherry Capital
              </p>
              <p className="text-xs text-white/65">
                Ask about websites, pricing, or projects
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#fafafa] px-3 py-4"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="border border-black/10 bg-white px-3 py-3 text-sm leading-relaxed text-black/70">
                  Hi — I can help with Cherry Capital services, typical
                  pricing ranges, portfolio work, and blog links. Tell me about
                  your website if you want a sense of fit.
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => submit(label)}
                      className="border border-black/15 bg-white px-2.5 py-1.5 text-left text-xs font-medium text-black/75 transition-colors hover:border-black hover:bg-[#F5E642]/70"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] border px-3 py-2",
                      isUser
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black",
                    )}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text" && part.text) {
                        return (
                          <MessageText
                            key={`${message.id}-t-${i}`}
                            text={part.text}
                          />
                        );
                      }
                      if (part.type.startsWith("tool-")) {
                        const state =
                          "state" in part
                            ? String((part as { state?: string }).state)
                            : "";
                        if (state === "output-available" || state === "done") {
                          return null;
                        }
                        return (
                          <p
                            key={`${message.id}-tool-${i}`}
                            className="text-xs text-black/45"
                          >
                            Working on that…
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex justify-start">
                <div className="border border-black/10 bg-white px-3 py-2 text-xs text-black/45">
                  Typing…
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                Something went wrong. Try again, or email{" "}
                {portfolioConfig.email}.
              </div>
            )}
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-black/10 bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status === "error"}
                placeholder="Ask about your website…"
                className="min-h-10 flex-1 border border-black/15 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/35 focus:border-black"
                maxLength={2000}
                autoComplete="off"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="inline-flex h-10 items-center justify-center border border-black bg-white px-3 text-xs font-medium"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex size-10 items-center justify-center bg-black text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-2 text-[10px] leading-snug text-black/40">
              Business questions only. For a firm quote, share what your site
              needs — or email {portfolioConfig.email}.
            </p>
          </form>
        </div>

        <button
          ref={fabRef}
          type="button"
          onClick={() => {
            setOpen((v) => {
              const next = !v;
              if (next) setHasUnread(false);
              return next;
            });
          }}
          className={cn(
            "relative flex size-14 items-center justify-center border border-black bg-[#F5E642] text-black shadow-[4px_4px_0_0_#000] transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_0_#000]",
            open && "bg-black text-white",
          )}
          aria-expanded={open}
          aria-label={open ? "Close chat" : "Open chat assistant"}
        >
          {open ? (
            <X className="size-6" />
          ) : (
            <MessageCircle className="size-6" />
          )}
          {hasUnread && !open && (
            <span className="absolute -right-1 -top-1 size-3 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>
      </div>
    </div>
  );
}
