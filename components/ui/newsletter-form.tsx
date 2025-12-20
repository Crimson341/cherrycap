"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewsletterFormProps {
  source?: string;
  className?: string;
  variant?: "default" | "minimal" | "inline";
  showName?: boolean;
}

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm({
  source = "website",
  className = "",
  variant = "default",
  showName = false,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message || "Thanks for subscribing!");
      setEmail("");
      setFirstName("");

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );

      // Reset error after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  // Minimal variant - just email input inline
  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading" || status === "success"}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <Button
            type="submit"
            disabled={status === "loading" || status === "success"}
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-xs mt-2 ${
                status === "success" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    );
  }

  // Inline variant - horizontal layout
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`${className}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {showName && (
            <Input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={status === "loading" || status === "success"}
              className="sm:w-40"
            />
          )}
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading" || status === "success"}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Subscribed!
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </div>
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-sm mt-3 flex items-center gap-2 ${
                status === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {status === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    );
  }

  // Default variant - stacked layout
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {showName && (
        <Input
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />
      )}
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === "loading" || status === "success"}
      />
      <Button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="w-full"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subscribing...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Subscribed!
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Subscribe to Newsletter
          </>
        )}
      </Button>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              status === "success"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 border border-red-500/20"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default NewsletterForm;
