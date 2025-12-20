"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import DottedMap from "dotted-map"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { MessageCircle, Send, Sparkles, Globe, Zap, Shield } from "lucide-react"

// Activity chart data
const activityData = [
  { month: "Jan", activity: 186 },
  { month: "Feb", activity: 305 },
  { month: "Mar", activity: 237 },
  { month: "Apr", activity: 203 },
  { month: "May", activity: 309 },
  { month: "Jun", activity: 214 },
  { month: "Jul", activity: 280 },
  { month: "Aug", activity: 350 },
  { month: "Sep", activity: 298 },
  { month: "Oct", activity: 420 },
  { month: "Nov", activity: 380 },
  { month: "Dec", activity: 450 },
]

// Dotted World Map Component
function WorldMap() {
  const [svgMap, setSvgMap] = useState<string>("")

  useEffect(() => {
    const map = new DottedMap({ height: 60, grid: "diagonal" })

    // Add some highlighted points for global presence
    const points = [
      { lat: 40.7128, lng: -74.006 },   // New York
      { lat: 51.5074, lng: -0.1278 },   // London
      { lat: 35.6762, lng: 139.6503 },  // Tokyo
      { lat: -33.8688, lng: 151.2093 }, // Sydney
      { lat: 52.52, lng: 13.405 },      // Berlin
      { lat: 37.7749, lng: -122.4194 }, // San Francisco
    ]

    points.forEach(point => {
      map.addPin({
        lat: point.lat,
        lng: point.lng,
        svgOptions: { color: "#a3a3a3", radius: 0.8 }
      })
    })

    const svg = map.getSVG({
      radius: 0.22,
      color: "#404040",
      shape: "circle",
      backgroundColor: "transparent",
    })

    setSvgMap(svg)
  }, [])

  return (
    <div
      className="w-full h-full opacity-60"
      dangerouslySetInnerHTML={{ __html: svgMap }}
    />
  )
}

// Chat Support Mockup Component
function ChatMockup() {
  const messages = [
    { role: "user", text: "How quickly can you get my new site up?" },
    { role: "agent", text: "Most sites launch in 2-4 weeks. We'll keep you updated every step of the way." },
    { role: "user", text: "What if I need changes later?" },
    { role: "agent", text: "Just call or text us. We handle updates quickly—usually same day." },
  ]

  return (
    <div className="h-full flex flex-col bg-neutral-900/50 rounded-2xl border border-neutral-800 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-neutral-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">CherryCap Support</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Online now
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-neutral-100 text-neutral-900 rounded-br-md"
                  : "bg-neutral-800/50 text-foreground rounded-bl-md border border-neutral-700/50"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-800/50 border border-neutral-700">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
            disabled
          />
          <button className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-white transition-colors">
            <Send className="w-4 h-4 text-neutral-900" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Activity Chart Component
function ActivityChart() {
  return (
    <div className="h-full flex flex-col bg-neutral-900/50 rounded-2xl border border-neutral-800 overflow-hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-foreground">Your Website Traffic</h4>
          <p className="text-xs text-muted-foreground">Watch your visitors grow</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500 dark:text-emerald-400">Live</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3a3a3" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a3a3a3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              width={30}
            />
            <Area
              type="monotone"
              dataKey="activity"
              stroke="#a3a3a3"
              strokeWidth={2}
              fill="url(#activityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Uptime Banner Component
function UptimeBanner() {
  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 dark:from-emerald-600/20 dark:to-emerald-900/20 rounded-2xl border border-emerald-500/30 p-6"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
      >
        <Shield className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
      </motion.div>
      <div className="text-5xl font-bold text-foreground mb-2">99.99%</div>
      <p className="text-emerald-600 dark:text-emerald-400 font-medium">Always Online</p>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Your site works when you're sleeping, on vacation, or just living your life
      </p>
    </motion.div>
  )
}

export function Features9() {
  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      {/* Background effects - slate/silver tones */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neutral-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-slate-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6"
          >
            <Shield className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-300 font-medium">We've Got Your Back</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Sleep easy.{" "}
            <span className="bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              We handle it.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Your site stays fast, stays online, and stays secure. If something breaks at 2am, we fix it—not you.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* World Map - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 h-[300px] md:h-[350px] bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 relative overflow-hidden"
          >
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-lg font-semibold text-foreground mb-1">Serving Northern Michigan</h3>
              <p className="text-sm text-muted-foreground">Local support, modern results</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <WorldMap />
            </div>
            {/* Animated connection lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-[1px] bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent"
                  style={{
                    top: `${30 + i * 20}%`,
                    left: `${20 + i * 15}%`,
                    transform: `rotate(${-15 + i * 10}deg)`,
                  }}
                  animate={{ opacity: [0, 1, 0], x: [0, 100, 200] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>

          {/* Uptime Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="h-[300px] md:h-[350px]"
          >
            <UptimeBanner />
          </motion.div>

          {/* Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="h-[350px] md:h-[400px]"
          >
            <ChatMockup />
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 h-[350px] md:h-[400px]"
          >
            <ActivityChart />
          </motion.div>
        </div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          {[
            { icon: Zap, text: "Lightning Fast" },
            { icon: Globe, text: "Found on Google" },
            { icon: Shield, text: "Secure & Protected" },
            { icon: Sparkles, text: "Easy to Update" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700"
            >
              <item.icon className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
