"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Header } from "@/components/ui/vercel-navbar";

export function Web3HeroAnimated() {
  // Symmetric pillar heights (percent). Tall at edges, low at center.
  const pillars = [92, 84, 78, 70, 62, 54, 46, 34, 18, 34, 46, 54, 62, 70, 78, 84, 92];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      {/* ================== BACKGROUND ================== */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30 dark:block hidden"
        style={{
          backgroundImage: [
            // Main central dome/band - slate/silver gradient
            "radial-gradient(80% 55% at 50% 52%, rgba(163,163,163,0.35) 0%, rgba(82,82,91,0.40) 27%, rgba(39,39,42,0.45) 47%, rgba(24,24,27,0.55) 60%, rgba(9,9,11,0.92) 78%, rgba(0,0,0,1) 88%)",
            // Silver sweep from top-left
            "radial-gradient(85% 60% at 14% 0%, rgba(212,212,216,0.45) 0%, rgba(113,113,122,0.35) 30%, rgba(24,24,27,0.0) 64%)",
            // Cool slate rim on top-right
            "radial-gradient(70% 50% at 86% 22%, rgba(100,116,139,0.35) 0%, rgba(15,23,42,0.0) 55%)",
            // Soft top vignette
            "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0) 40%)",
          ].join(","),
          backgroundColor: "#09090b",
        }}
      />
      {/* Light mode background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30 dark:hidden block"
        style={{
          backgroundImage: [
            "radial-gradient(80% 55% at 50% 52%, rgba(163,163,163,0.12) 0%, rgba(115,115,115,0.08) 27%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,1) 88%)",
            "radial-gradient(85% 60% at 14% 0%, rgba(228,228,231,0.7) 0%, rgba(212,212,216,0.4) 30%, transparent 64%)",
            "radial-gradient(70% 50% at 86% 22%, rgba(148,163,184,0.25) 0%, transparent 55%)",
          ].join(","),
          backgroundColor: "#fafafa",
        }}
      />

      {/* Vignette corners for extra contrast */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(140%_120%_at_50%_0%,transparent_60%,rgba(0,0,0,0.85))] dark:block hidden" />
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(140%_120%_at_50%_0%,transparent_60%,rgba(0,0,0,0.05))] dark:hidden block" />

      {/* Grid overlay - dark mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen opacity-30 dark:block hidden"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 96px)",
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 24px)",
            "repeating-radial-gradient(80% 55% at 50% 52%, rgba(255,255,255,0.08) 0 1px, transparent 1px 120px)"
          ].join(","),
          backgroundBlendMode: "screen",
        }}
      />
      {/* Grid overlay - light mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-20 dark:hidden block"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 96px)",
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 24px)",
          ].join(","),
        }}
      />

      {/* ================== NAV ================== */}
      <Header />

      {/* ================== HERO CONTENT ================== */}
      <div className="relative z-10 mx-auto grid w-full max-w-5xl place-items-center px-6 py-16 md:py-24 lg:py-28">
        <div className="mx-auto text-center">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-[11px] uppercase tracking-wider text-foreground/70 ring-1 ring-foreground/10 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Northern Michigan's Web Partner
          </motion.span>

          <motion.h1
            className="mt-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Stop losing customers to{" "}
            <motion.span
              className="bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              your competitors
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Right now, someone in Traverse City is Googling what you sell. Are they finding you or the other guy? Let's fix that.
          </motion.p>
          
          <motion.div 
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/login">
              <motion.button
                className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow transition"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                Get a Free Quote
                <motion.svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </motion.button>
            </Link>
            <motion.a 
              href="#work" 
              className="inline-flex items-center justify-center rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground/90 backdrop-blur hover:border-foreground/40 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              See Results
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* ================== PARTNERS/CLIENTS ================== */}
      <motion.div 
        className="relative z-10 mx-auto mt-10 w-full max-w-6xl px-6 pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <motion.p 
          className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          Trusted by Northern Michigan businesses
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70">
          {["Restaurants", "Wineries", "Resorts", "Retailers", "Services", "Healthcare", "Real Estate", "Nonprofits"].map((brand, i) => (
            <motion.div 
              key={brand} 
              className="text-xs uppercase tracking-wider text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.05 }}
              whileHover={{ scale: 1.1 }}
            >
              {brand}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ================== FOREGROUND ================== */}
      {/* Center-bottom glow */}
      <motion.div
        className="pointer-events-none absolute bottom-[128px] left-1/2 z-0 h-36 w-28 -translate-x-1/2 rounded-md bg-gradient-to-b from-foreground/75 via-neutral-300/50 to-transparent dark:from-white/75 dark:via-neutral-400/40"
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.03, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Stepped pillars silhouette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[54vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-px px-[2px]">
          {pillars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-background"
              initial={{ height: "0%" }}
              animate={{ height: isMounted ? `${h}%` : "0%" }}
              transition={{ 
                duration: 1,
                delay: Math.abs(i - Math.floor(pillars.length / 2)) * 0.06,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
