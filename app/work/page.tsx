"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Building2,
  Store,
  Utensils,
  Grape,
  Tent,
  ArrowRight,
  Cherry,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Floating paths from background-paths component
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        <defs>
          <linearGradient
            id="silverBlackGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#E5E5E5" />
            <stop offset="25%" stopColor="#C0C0C0" />
            <stop offset="50%" stopColor="#71717A" />
            <stop offset="75%" stopColor="#3F3F46" />
            <stop offset="100%" stopColor="#18181B" />
          </linearGradient>
          <linearGradient
            id="blackSilverGradient"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#27272A" />
            <stop offset="30%" stopColor="#52525B" />
            <stop offset="60%" stopColor="#A1A1AA" />
            <stop offset="100%" stopColor="#E5E5E5" />
          </linearGradient>
        </defs>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={
              path.id % 3 === 0
                ? "url(#silverBlackGradient)"
                : path.id % 3 === 1
                  ? "url(#blackSilverGradient)"
                  : path.id % 2 === 0
                    ? "rgba(161,161,170,0.3)"
                    : "rgba(82,82,91,0.3)"
            }
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.025}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryIcon: typeof Building2;
  services: string[];
  results?: string;
  image?: string;
  animation: string;
}

const projects: Project[] = [
  {
    id: "1",
    name: "Traverse Bay Winery",
    description:
      "Complete digital transformation for a family-owned winery on Old Mission Peninsula. Built a modern e-commerce experience with wine club management, tasting reservations, and event booking.",
    category: "Winery",
    categoryIcon: Grape,
    services: ["Web Design", "E-commerce", "Booking System"],
    results: "3x online wine sales in 6 months",
    image: "/projects/winery.jpg",
    animation: "bento-float 6s ease-in-out infinite",
  },
  {
    id: "2",
    name: "Northern Grounds Cafe",
    description:
      "Modern website and online ordering system for a popular downtown Traverse City coffee shop.",
    category: "Restaurant",
    categoryIcon: Utensils,
    services: ["Web Design", "Online Ordering", "POS Integration"],
    results: "40% orders online",
    image: "/projects/cafe.jpg",
    animation: "bento-pulse 4s ease-in-out infinite",
  },
  {
    id: "3",
    name: "Leelanau Adventure Co.",
    description:
      "Adventure tourism company needed a booking platform that could handle kayak rentals, guided tours, and equipment reservations across multiple locations.",
    category: "Tourism",
    categoryIcon: Tent,
    services: ["Web Design", "Booking Platform", "Multi-location"],
    results: "70% less phone bookings",
    image: "/projects/adventure.jpg",
    animation: "bento-tilt 5.5s ease-in-out infinite",
  },
  {
    id: "4",
    name: "Cherry Capital Properties",
    description:
      "Real estate brokerage needed a modern property search experience with IDX integration.",
    category: "Real Estate",
    categoryIcon: Building2,
    services: ["Web Design", "IDX Integration", "SEO"],
    results: "2x website leads",
    image: "/projects/realestate.jpg",
    animation: "bento-drift 8s ease-in-out infinite",
  },
  {
    id: "5",
    name: "Suttons Bay General Store",
    description:
      "Historic general store wanted to expand online with local delivery and shipping for their curated selection of local goods.",
    category: "Retail",
    categoryIcon: Store,
    services: ["E-commerce", "Inventory Management", "Shipping"],
    image: "/projects/retail.jpg",
    animation: "bento-glow 7s ease-in-out infinite",
  },
];

const spans = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-3 md:row-span-1",
  "md:col-span-3 md:row-span-1",
];

function BentoProjectCard({
  project,
  span,
  index,
  isVisible,
}: {
  project: Project;
  span: string;
  index: number;
  isVisible: boolean;
}) {
  const Icon = project.categoryIcon;
  const isLarge = span.includes("col-span-4") || span.includes("row-span-2");
  const animationDelay = `${Math.max(index * 0.12, 0)}s`;

  return (
    <article
      className={`group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-900/10 bg-white/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] motion-safe:opacity-0 ${
        isVisible ? "motion-safe:animate-[bento-card_0.8s_ease-out_forwards]" : ""
      } dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_28px_70px_rgba(0,0,0,0.55)] ${span}`}
      style={{ animationDelay }}
    >
      {/* Background Image */}
      {project.image && (
        <div className="absolute inset-0 -z-5">
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-white/85 transition-colors duration-500 dark:bg-white/[0.08]" />
        <div
          className="absolute inset-0 opacity-70 transition-opacity duration-500 dark:opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 12% 0%, rgba(59,130,246,0.24), transparent 72%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-900/15 bg-white transition-colors duration-500 dark:border-white/15 dark:bg-white/10">
          <Icon
            className="h-7 w-7 text-neutral-900 transition-colors duration-500 dark:text-white"
            strokeWidth={1.5}
            style={{ animation: project.animation }}
          />
        </div>
        <div className="flex-1">
          <header className="flex items-start gap-3">
            <h3 className="text-base font-semibold uppercase tracking-wide text-neutral-900 transition-colors duration-500 dark:text-white">
              {project.name}
            </h3>
            <span className="ml-auto rounded-full border border-neutral-900/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition-colors duration-500 dark:border-white/15 dark:text-white/60">
              {project.category}
            </span>
          </header>
          {isLarge && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 transition-colors duration-500 dark:text-white/60">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Services & Results */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Services Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.services.map((service) => (
            <span
              key={service}
              className="rounded-full border border-neutral-900/10 bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-600 transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Results */}
        {project.results && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-900/10 dark:border-white/10">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {project.results}
            </span>
          </div>
        )}
      </div>

      {/* External Link Icon */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-white/40" />
      </div>

      {/* Hover Glow Effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0 rounded-2xl border border-neutral-900/10 transition-colors duration-500 dark:border-white/10"
          style={{
            maskImage:
              "radial-gradient(220px_220px_at_var(--x,50%)_var(--y,50%), black, transparent)",
            WebkitMaskImage:
              "radial-gradient(220px_220px_at_var(--x,50%)_var(--y,50%), black, transparent)",
          }}
        />
      </div>
    </article>
  );
}

export default function WorkPage() {
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Inject animations
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "bento-work-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes bento-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6%); }
      }
      @keyframes bento-pulse {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes bento-tilt {
        0% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
        100% { transform: rotate(-2deg); }
      }
      @keyframes bento-drift {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(6%, -6%, 0); }
      }
      @keyframes bento-glow {
        0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 0 rgba(0,0,0,0.4)); }
        50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(0,0,0,0.2)); }
      }
      @keyframes bento-intro {
        0% { opacity: 0; transform: translate3d(0, 28px, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes bento-card {
        0% { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.96); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // Intersection observer for section visibility
  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") return;

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex w-full flex-col min-h-screen bg-[#030303]">
      {/* Header */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* Hero Section with BackgroundPaths */}
      <section className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden">
        {/* Animated glow orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(161,161,170,0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(63,63,70,0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating paths */}
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="max-w-4xl mx-auto"
          >
            {/* Logo */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 blur-xl opacity-50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 p-[2px]">
                  <div className="w-full h-full rounded-[14px] bg-[#030303] flex items-center justify-center">
                    <Cherry className="w-8 h-8 text-zinc-300" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
              {"Our Projects".split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.1 + letterIndex * 0.03 + 0.5,
                        type: "spring",
                        stiffness: 150,
                        damping: 25,
                      }}
                      className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Real work for real Northern Michigan businesses. From wineries to
              restaurants—we help local businesses compete in a digital world.
            </motion.p>

            {/* Scroll indicator */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="w-6 h-10 rounded-full border-2 border-zinc-500/30 mx-auto flex justify-center pt-2"
                animate={{
                  borderColor: [
                    "rgba(161,161,170,0.3)",
                    "rgba(63,63,70,0.3)",
                    "rgba(161,161,170,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                  animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="relative min-h-screen w-full bg-white text-neutral-900 transition-colors duration-500 dark:bg-black dark:text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-30 overflow-hidden">
          <div
            className="absolute inset-0 [--aurora-base:#ffffff] [--aurora-accent:rgba(148,163,184,0.15)] dark:[--aurora-base:#040404] dark:[--aurora-accent:rgba(59,130,246,0.15)]"
            style={{
              background:
                "radial-gradient(ellipse 55% 100% at 12% 0%, var(--aurora-accent), transparent 65%), radial-gradient(ellipse 40% 80% at 88% 0%, rgba(148,163,184,0.1), transparent 70%), var(--aurora-base)",
            }}
          />
          <div
            className="absolute inset-0 [--grid-color:rgba(17,17,17,0.08)] dark:[--grid-color:rgba(255,255,255,0.06)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 0",
              maskImage:
                "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
              WebkitMaskImage:
                "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
              maskComposite: "intersect",
              opacity: 0.9,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 [--edge-color:rgba(255,255,255,1)] dark:[--edge-color:rgba(0,0,0,1)]"
            style={{
              background:
                "radial-gradient(circle at center, rgba(0,0,0,0) 55%, var(--edge-color) 100%)",
              filter: "blur(40px)",
              opacity: 0.75,
            }}
          />
        </div>

        <div
          ref={sectionRef}
          className={`relative mx-auto max-w-6xl px-6 py-20 motion-safe:opacity-0 ${
            sectionVisible
              ? "motion-safe:animate-[bento-intro_0.9s_ease-out_forwards]"
              : ""
          }`}
        >
          {/* Section Header */}
          <header className="mb-10 flex flex-col gap-6 border-b border-neutral-900/10 pb-6 transition-colors duration-500 md:flex-row md:items-end md:justify-between dark:border-white/10">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.35em] text-neutral-500 transition-colors duration-500 dark:text-white/40">
                Portfolio
              </span>
              <h2 className="text-3xl font-black tracking-tight text-neutral-900 transition-colors duration-500 md:text-5xl dark:text-white">
                Featured Work
              </h2>
            </div>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <p className="max-w-sm text-sm text-neutral-600 transition-colors duration-500 md:text-base dark:text-white/60">
                Helping Northern Michigan businesses thrive with modern digital
                experiences.
              </p>
            </div>
          </header>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 gap-3 md:auto-rows-[minmax(180px,auto)] md:grid-cols-6">
            {projects.map((project, index) => (
              <BentoProjectCard
                key={project.id}
                project={project}
                span={spans[index]}
                index={index}
                isVisible={sectionVisible}
              />
            ))}
          </div>

          {/* Footer Text */}
          <footer className="mt-16 border-t border-neutral-900/10 pt-6 text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors duration-500 dark:border-white/10 dark:text-white/40">
            Crafted with care for local businesses.
          </footer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 md:px-6 bg-[#030303]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready to Join This List?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Let&apos;s talk about your project. Whether you need a new
              website, an online store, or a complete digital
              transformation—we&apos;re here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/development#contact">
                <div className="inline-block group relative bg-gradient-to-b from-zinc-400/20 to-zinc-700/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl hover:shadow-zinc-500/10 transition-all duration-300">
                  <Button
                    variant="ghost"
                    className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md bg-[#0a0a0a]/95 hover:bg-[#0a0a0a]/100 text-white transition-all duration-300 group-hover:-translate-y-0.5 border border-zinc-500/20 hover:border-zinc-500/40"
                  >
                    <span className="opacity-90 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      Start Your Project
                    </span>
                    <ArrowRight className="ml-3 w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
