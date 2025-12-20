"use client";

import { Button, Link } from "@heroui/react";
import { motion } from "motion/react";
import { BUSINESS_INFO, NAVIGATION_LINKS } from "@/utils/constants";

export function Navigation() {
  return (
    <motion.nav
      className="relative z-20 flex items-center justify-between px-8 py-6 md:px-16 border-b border-white/5 bg-black/50 backdrop-blur-md"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex items-center gap-3"
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative w-10 h-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[2px] bg-black rounded-[10px] flex items-center justify-center">
            <span className="text-xl font-black bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {BUSINESS_INFO.name.charAt(0)}
            </span>
          </div>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">{BUSINESS_INFO.name}</span>
      </motion.div>

      <div className="hidden md:flex items-center gap-8">
        {NAVIGATION_LINKS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
          >
            <Link
              href={item.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link 
          href="#" 
          className="text-zinc-400 hover:text-white text-sm hidden sm:block"
        >
          Sign in
        </Link>
        <Button 
          className="bg-white text-black hover:bg-zinc-200 font-semibold"
          variant="primary"
        >
          Get Started
        </Button>
      </motion.div>
    </motion.nav>
  );
}
