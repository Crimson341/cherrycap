"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";

const textVariants: Variants = {
  hidden: {
    opacity: 0,
    letterSpacing: "-0.5em",
  },
  visible: {
    opacity: 1,
    letterSpacing: "normal",
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

const sizes = {
  sm: "text-xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

export const Logo = ({
  draw = false,
  size = "sm",
  className,
  containerClassName,

}: {
  containerClassName?: string;
  draw?: boolean;
  size?: keyof typeof sizes;
  className?: string;
}) => {
  return (
    <div className={cn("relative font-bold", containerClassName)}>
      <motion.h1
        initial={draw ? "hidden" : undefined}
        animate={draw ? "visible" : undefined}
        variants={draw ? textVariants : undefined}
        className={cn(" font-mono text-muted-foreground font-medium", sizes[size], className)}
      >
        Welcome!
      </motion.h1>
    </div>
  );
};
