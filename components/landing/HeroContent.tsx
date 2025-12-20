"use client";

import { Button, Chip } from "@heroui/react";
import { motion, MotionValue } from "motion/react";
import { HERO_STATS } from "@/utils/constants";

interface HeroContentProps {
  y: MotionValue<string>;
  opacity: MotionValue<number>;
}

export function HeroContent({ y, opacity }: HeroContentProps) {
  return (
    <motion.main
      className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-100px)] px-6"
      style={{ y, opacity }}
    >
      {/* Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Chip
          variant="soft"
          className="bg-white/5 border border-white/10 backdrop-blur-sm mb-8 pl-1 pr-4 py-6 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-zinc-300">Now in Public Beta</span>
            <svg
              className="w-4 h-4 text-zinc-500 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Chip>
      </motion.div>

      {/* Headline */}
      <div className="overflow-hidden">
        <motion.h1
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-center leading-[1.05] tracking-tight max-w-5xl"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        >
          The platform for{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              modern developers
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            />
          </span>
        </motion.h1>
      </div>

      {/* Subheadline */}
      <motion.p
        className="mt-8 text-lg md:text-xl text-zinc-400 text-center max-w-2xl leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        Build, deploy, and scale your applications with unprecedented speed.
        From startup to enterprise, we power the world&apos;s best teams.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-zinc-100 font-semibold px-8 h-14 text-base"
            variant="primary"
          >
            Start Building
            <motion.svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            variant="secondary"
            className="text-white font-semibold px-8 h-14 text-base border-white/20 hover:bg-white/10"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </Button>
        </motion.div>
      </motion.div>

      {/* Animated stats */}
      <motion.div
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        {HERO_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className="text-3xl md:text-4xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
            >
              {stat.value}
            </motion.div>
            <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-white/50 rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
