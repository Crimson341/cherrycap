"use client";

import { motion } from "motion/react";

export function HeroSection() {
  return (
    <div className="min-h-screen text-foreground overflow-hidden relative w-full">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(163, 163, 163, 0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(163, 163, 163, 0.1)" strokeWidth="0.5" />
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(163, 163, 163, 0.1)" strokeWidth="0.5" />
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="rgba(163, 163, 163, 0.1)" strokeWidth="0.5" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="rgba(163, 163, 163, 0.1)" strokeWidth="0.5" />
        <circle cx="20%" cy="20%" r="2" fill="rgba(163, 163, 163, 0.3)" />
        <circle cx="80%" cy="20%" r="2" fill="rgba(163, 163, 163, 0.3)" />
        <circle cx="20%" cy="80%" r="2" fill="rgba(163, 163, 163, 0.3)" />
        <circle cx="80%" cy="80%" r="2" fill="rgba(163, 163, 163, 0.3)" />
        <circle cx="50%" cy="50%" r="1.5" fill="rgba(163, 163, 163, 0.2)" />
      </svg>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-2 h-2 bg-neutral-500/30" />
      <div className="absolute top-8 right-8 w-2 h-2 bg-neutral-500/30" />
      <div className="absolute bottom-8 left-8 w-2 h-2 bg-neutral-500/30" />
      <div className="absolute bottom-8 right-8 w-2 h-2 bg-neutral-500/30" />

      {/* Floating elements */}
      <div className="absolute top-1/4 left-[15%] w-1 h-1 bg-neutral-400/40 rounded-full animate-pulse" />
      <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-slate-400/40 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-[40%] left-[10%] w-1 h-1 bg-zinc-400/40 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[75%] left-[90%] w-1 h-1 bg-neutral-400/40 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 min-h-screen flex flex-col justify-between items-center px-8 py-12 md:px-16 md:py-20">
        {/* Top tagline */}
        <div className="text-center">
          <h2 className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {["You", "run", "your", "business."].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {word}{" "}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-neutral-200 font-bold"
            >
              We bring them in.{" "}
            </motion.span>
          </h2>
          <motion.div
            className="mt-4 w-16 h-px mx-auto bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />
        </div>

        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extralight leading-tight tracking-tight text-foreground">
            <div className="mb-4 md:mb-6">
              {["Tired", "of", "a", "website", "that", "just", "sits", "there?"].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                >
                  {word}{" "}
                </motion.span>
              ))}
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-thin leading-relaxed text-muted-foreground">
              {[
                { text: "We", color: "" },
                { text: "build", color: "" },
                { text: "sites", color: "" },
                { text: "that", color: "" },
                { text: "make", color: "" },
                { text: "your", color: "" },
                { text: "phone", color: "text-neutral-200" },
                { text: "ring", color: "text-neutral-200" },
                { text: "and", color: "" },
                { text: "your", color: "" },
                { text: "calendar", color: "text-neutral-300" },
                { text: "fill", color: "text-neutral-300" },
                { text: "up.", color: "text-neutral-300" },
              ].map((item, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.7 + i * 0.1 }}
                  className={item.color}
                >
                  {item.text}{" "}
                </motion.span>
              ))}
            </div>
          </h1>
        </div>

        {/* Bottom tagline */}
        <div className="text-center">
          <motion.div
            className="mb-4 w-16 h-px mx-auto bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 3, duration: 0.6 }}
          />
          <h2 className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {["No", "BS.", "No", "jargon.", "Just", "results."].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 3.1 + i * 0.1 }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </h2>
          <motion.div
            className="mt-6 flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 3.7 }}
          >
            <div className="w-1 h-1 rounded-full bg-neutral-500/40" />
            <div className="w-1 h-1 rounded-full bg-neutral-500/60" />
            <div className="w-1 h-1 rounded-full bg-neutral-500/40" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
