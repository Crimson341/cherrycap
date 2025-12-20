"use client";

import { useState } from "react";
import { ArrowRight, Menu, X, Cherry } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedGradientBackground from "./animated-gradient-background";
import { TextGenerateEffect } from "./text-generate-effect";
import Link from "next/link";

const Hero2 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Gradient Background */}
      <AnimatedGradientBackground
        Breathing={true}
        startingGap={150}
        breathingRange={10}
        animationSpeed={0.03}
        topOffset={-30}
        gradientColors={[
          "#0A0A0A",
          "#7C3AED",
          "#EC4899", 
          "#F59E0B",
          "#06B6D4",
          "#10B981",
          "#6366F1"
        ]}
        gradientStops={[30, 45, 55, 65, 75, 85, 100]}
      />
      


      {/* Content container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between px-4 py-4 mt-6">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white">
              <Cherry className="h-4 w-4" />
            </div>
            <span className="ml-2 text-xl font-bold text-white">CherryCap</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <NavItem label="Work" />
              <NavItem label="Services" />
              <NavItem label="Process" />
              <NavItem label="Contact" />
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-colors">
                  Start a Project
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 md:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white">
                    <Cherry className="h-4 w-4" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">
                    CherryCap
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-8 flex flex-col space-y-6">
                <MobileNavItem label="Work" />
                <MobileNavItem label="Services" />
                <MobileNavItem label="Process" />
                <MobileNavItem label="Contact" />
                <Link href="/login">
                  <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-colors w-full">
                    Start a Project
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <motion.div 
          className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </span>
          <span className="text-sm font-medium text-white">
            Available for Q1 2025 projects
          </span>
          <ArrowRight className="h-4 w-4 text-white" />
        </motion.div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <TextGenerateEffect 
              words="We Build Websites That Make Money"
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              duration={0.4}
            />
          </div>
          <div className="mx-auto mt-6 max-w-2xl">
            <TextGenerateEffect 
              words="Premium web design & development for brands that want to stand out. We turn your vision into high-converting digital experiences."
              className="text-lg text-gray-300"
              duration={0.3}
            />
          </div>
          <motion.div 
            className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-colors">
              Start a Project
            </button>
            <button className="h-12 rounded-full border border-gray-600 px-8 text-base font-medium text-white hover:bg-white/10 transition-colors">
              See Our Work
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function NavItem({
  label,
  hasDropdown,
}: {
  label: string;
  hasDropdown?: boolean;
}) {
  return (
    <a href={`#${label.toLowerCase()}`} className="flex items-center text-sm text-gray-300 hover:text-white cursor-pointer transition-colors">
      <span>{label}</span>
      {hasDropdown && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </a>
  );
}

function MobileNavItem({ label }: { label: string }) {
  return (
    <a href={`#${label.toLowerCase()}`} className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white">
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </a>
  );
}

export { Hero2 };
