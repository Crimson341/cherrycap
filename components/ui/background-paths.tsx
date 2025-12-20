"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cherry } from "lucide-react";
import Link from "next/link";

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
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                <defs>
                    {/* Silver to Black gradient */}
                    <linearGradient id="silverBlackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E5E5E5" />
                        <stop offset="25%" stopColor="#C0C0C0" />
                        <stop offset="50%" stopColor="#71717A" />
                        <stop offset="75%" stopColor="#3F3F46" />
                        <stop offset="100%" stopColor="#18181B" />
                    </linearGradient>
                    <linearGradient id="blackSilverGradient" x1="100%" y1="0%" x2="0%" y2="100%">
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
                        stroke={path.id % 3 === 0 ? "url(#silverBlackGradient)" : path.id % 3 === 1 ? "url(#blackSilverGradient)" : path.id % 2 === 0 ? "rgba(161,161,170,0.3)" : "rgba(82,82,91,0.3)"}
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

export function BackgroundPaths({
    title = "CherryCap",
    subtitle = "Premium web design & development for brands that want to stand out and scale faster.",
    showButton = true,
    buttonText = "Start a Project",
}: {
    title?: string;
    subtitle?: string;
    showButton?: boolean;
    buttonText?: string;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            {/* Animated silver/black glow orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
                style={{ background: "radial-gradient(circle, rgba(161,161,170,0.15) 0%, transparent 70%)" }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
                style={{ background: "radial-gradient(circle, rgba(63,63,70,0.15) 0%, transparent 70%)" }}
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

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
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 blur-xl opacity-50"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 p-[2px]">
                                <div className="w-full h-full rounded-[14px] bg-[#030303] flex items-center justify-center">
                                    <Cherry className="w-10 h-10 text-zinc-300" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03 + 0.5,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-white via-zinc-300 to-zinc-500"
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
                        {subtitle}
                    </motion.p>

                    {showButton && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                        >
                            <Link href="/login">
                                <div
                                    className="inline-block group relative bg-gradient-to-b from-zinc-400/20 to-zinc-700/10 
                                    p-px rounded-2xl backdrop-blur-lg 
                                    overflow-hidden shadow-lg hover:shadow-xl hover:shadow-zinc-500/10 transition-all duration-300"
                                >
                                    <Button
                                        variant="ghost"
                                        className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                                        bg-[#0a0a0a]/95 hover:bg-[#0a0a0a]/100
                                        text-white transition-all duration-300 
                                        group-hover:-translate-y-0.5 border border-zinc-500/20 hover:border-zinc-500/40
                                        hover:shadow-md"
                                    >
                                        <span className="opacity-90 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                            {buttonText}
                                        </span>
                                        <motion.span
                                            className="ml-3 opacity-70 group-hover:opacity-100 transition-all duration-300 text-zinc-400"
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            →
                                        </motion.span>
                                    </Button>
                                </div>
                            </Link>
                        </motion.div>
                    )}

                    {/* Scroll indicator */}
                    <motion.div
                        className="mt-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                    >
                        <motion.div
                            className="w-6 h-10 rounded-full border-2 border-zinc-500/30 mx-auto flex justify-center pt-2"
                            animate={{ borderColor: ["rgba(161,161,170,0.3)", "rgba(63,63,70,0.3)", "rgba(161,161,170,0.3)"] }}
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
        </div>
    );
}
