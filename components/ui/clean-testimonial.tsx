"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"

const testimonials = [
  {
    quote: "CherryCap transformed our online presence completely. The ROI has been incredible.",
    author: "Sarah Chen",
    role: "CEO",
    company: "TechFlow",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote: "Finally, a team that understands that simplicity is the ultimate sophistication.",
    author: "Marcus Webb",
    role: "Creative Director",
    company: "Vercel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote: "This work redefined our entire approach to digital experiences. Highly recommended.",
    author: "Elena Frost",
    role: "Head of Product",
    company: "Stripe",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote: "The attention to detail is unmatched. Every interaction feels intentional and premium.",
    author: "James Rodriguez",
    role: "Founder",
    company: "Notion",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
]

function usePreloadImages(images: string[]) {
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [images])
}

function SplitText({ text }: { text: string }) {
  const words = text.split(" ")

  return (
    <span className="inline">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.4,
            delay: i * 0.03,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  usePreloadImages(testimonials.map((t) => t.avatar))

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY],
  )

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const currentTestimonial = testimonials[activeIndex]

  return (
    <section className="relative py-32 bg-[#030303] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-fuchsia-600/10 via-violet-600/5 to-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="text-sm text-fuchsia-400 font-medium">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            What our{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              clients say
            </span>
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div
          ref={containerRef}
          className="relative w-full max-w-3xl mx-auto py-16 px-8 md:px-12 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-sm"
          style={{ cursor: "none" }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleNext}
        >
          {/* Custom magnetic cursor */}
          <motion.div
            className="pointer-events-none absolute z-50 mix-blend-difference hidden md:block"
            style={{
              x: cursorX,
              y: cursorY,
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            <motion.div
              className="rounded-full bg-white flex items-center justify-center"
              animate={{
                width: isHovered ? 80 : 0,
                height: isHovered ? 80 : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
            >
              <motion.span
                className="text-black text-xs font-medium tracking-wider uppercase"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ delay: 0.1 }}
              >
                Next
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Floating index indicator */}
          <motion.div
            className="absolute top-6 right-8 flex items-baseline gap-1 font-mono text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              className="text-2xl font-light text-white"
              key={activeIndex}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-500">{String(testimonials.length).padStart(2, "0")}</span>
          </motion.div>

          {/* Stacked avatar previews for other testimonials */}
          <motion.div
            className="absolute top-6 left-8 flex -space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.6 }}
          >
            {testimonials.map((t, i) => (
              <motion.button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex(i)
                }}
                className={`w-8 h-8 rounded-full border-2 border-[#0a0a0a] overflow-hidden transition-all duration-300 ${
                  i === activeIndex ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0a0a0a] scale-110" : "grayscale opacity-50 hover:opacity-80"
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </motion.div>

          {/* Main content */}
          <div className="relative pt-12">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed tracking-tight text-white"
              >
                &ldquo;<SplitText text={currentTestimonial.quote} />&rdquo;
              </motion.blockquote>
            </AnimatePresence>

            {/* Author with reveal line */}
            <motion.div className="mt-12 relative" layout>
              <div className="flex items-center gap-4">
                {/* Avatar container with all images stacked */}
                <div className="relative w-14 h-14">
                  <motion.div
                    className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 0.5 }}
                  />
                  {testimonials.map((t, i) => (
                    <motion.img
                      key={t.avatar}
                      src={t.avatar}
                      alt={t.author}
                      className="absolute inset-0 w-14 h-14 rounded-full object-cover"
                      animate={{
                        opacity: i === activeIndex ? 1 : 0,
                        zIndex: i === activeIndex ? 1 : 0,
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  ))}
                </div>

                {/* Author info with accent line */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    className="relative pl-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500 to-fuchsia-500"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ originY: 0 }}
                    />
                    <span className="block text-lg font-medium text-white tracking-wide">
                      {currentTestimonial.author}
                    </span>
                    <span className="block text-sm text-zinc-400 mt-0.5 font-mono uppercase tracking-widest">
                      {currentTestimonial.role} — {currentTestimonial.company}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Progress bar */}
            <div className="mt-12 h-px bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((activeIndex + 1) / testimonials.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* Keyboard hint */}
          <motion.div
            className="absolute bottom-6 left-8 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.6 : 0.3 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Click anywhere to continue</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
