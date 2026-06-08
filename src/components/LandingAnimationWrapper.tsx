"use client";

import React from "react";
import { Header } from "./sections/Header";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
const CONTENT_VARIANTS = {
  hidden: {
    y: 2000,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 30 },
  },
} as const;
function LandingAnimationWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldReduceMotion = useReducedMotion();
  const [transitionState, setTransition] = useState(false);
  const [isLoadedState, setIsLoaded] = useState(false);
  const transition = shouldReduceMotion || transitionState;
  const isLoaded = shouldReduceMotion || isLoadedState;

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setTimeout(() => setTransition(true), 2000);
    const timer2 = setTimeout(() => setIsLoaded(true), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [shouldReduceMotion]);

  const contentVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
      }
    : CONTENT_VARIANTS;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Skip to content
      </a>
      <Header transition={transition} />
      <main
        id="main"
        className={cn(
          isLoaded
            ? "h-dvh max-w-full overflow-x-hidden sm:overflow-x-visible relative w-full mx-auto md:max-w-3xl pt-12 px-2 md:px-0"
            : "h-dvh relative overflow-hidden md:max-w-3xl w-full max-w-full mx-auto pt-12 "
        )}
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate={transition ? "visible" : "hidden"}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </>
  );
}

export default LandingAnimationWrapper;
