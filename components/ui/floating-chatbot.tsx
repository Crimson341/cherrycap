"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import { X, Loader2, Calendar, Clock, User, Mail, Phone, Send } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CHATBOT_CONFIG } from "@/lib/chatbot-config"

// UI Component types
interface AvailableDay {
  date: string
  display: string
  dayName: string
}

interface AvailableDaysComponent {
  type: "available_days"
  days: AvailableDay[]
}

interface TimeSlot {
  time: string
  display: string
}

interface TimeSlotComponent {
  type: "time_slots"
  date: string
  slots: TimeSlot[]
}

interface BookingFormComponent {
  type: "booking_form"
  date: string
  time: string
  timeDisplay: string
}

type UIComponent = AvailableDaysComponent | TimeSlotComponent | BookingFormComponent

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  uiComponent?: UIComponent
}

// Color Orb from ai-input.tsx
interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }

  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--contrast": adjustedContrast,
        "--dot": `${pixelDot}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      } as React.CSSProperties}
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

const SPEED_FACTOR = 1
const PANEL_WIDTH = 380
const PANEL_HEIGHT = 500
const COLLAPSED_HEIGHT = 44
const COLLAPSED_WIDTH = 120

function KeyHint({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cx(
        "text-foreground flex h-6 w-fit items-center justify-center rounded-sm border px-[6px] font-sans text-xs",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export function FloatingChatbot() {
  const pathname = usePathname()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; display: string } | null>(null)
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Check if we should hide on dashboard/chat pages
  const shouldHide = pathname?.startsWith("/dashboard") || pathname?.startsWith("/chat")

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Add greeting when first opened
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: CHATBOT_CONFIG.personality.greeting,
        },
      ])
      setHasGreeted(true)
    }
  }, [isOpen, hasGreeted, messages.length])

  // Click outside to close
  useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const messageHistory = messages
        .filter((m) => m.id !== "greeting")
        .map((m) => ({ role: m.role, content: m.content }))

      messageHistory.push({ role: "user", content: userMessage.content })

      const response = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Chat API error:", response.status, errorData)
        throw new Error(errorData.error || "Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      let pendingUiComponent: UIComponent | undefined

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)

                // Capture UI component if present
                if (parsed.uiComponent) {
                  pendingUiComponent = parsed.uiComponent as UIComponent
                }

                if (parsed.content) {
                  assistantMessage.content += parsed.content
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content, uiComponent: pendingUiComponent }
                        : m
                    )
                  )
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // Ensure UI component is attached to final message
        if (pendingUiComponent) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, uiComponent: pendingUiComponent }
                : m
            )
          )
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  // Handle day selection - calls get_available_slots for that date
  const handleDaySelect = async (date: string, display: string) => {
    // Add a message showing the selection
    const selectionMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Show me times for ${display}`,
    }
    setMessages((prev) => [...prev, selectionMessage])
    setIsLoading(true)

    try {
      const messageHistory = messages
        .filter((m) => m.id !== "greeting")
        .map((m) => ({ role: m.role, content: m.content }))

      messageHistory.push({ role: "user", content: `Show me available times for ${date}` })

      const response = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          stream: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to get times")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      let pendingUiComponent: UIComponent | undefined

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)

                if (parsed.uiComponent) {
                  pendingUiComponent = parsed.uiComponent as UIComponent
                }

                if (parsed.content) {
                  assistantMessage.content += parsed.content
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content, uiComponent: pendingUiComponent }
                        : m
                    )
                  )
                }
              } catch {
                // Skip
              }
            }
          }
        }

        if (pendingUiComponent) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, uiComponent: pendingUiComponent }
                : m
            )
          )
        }
      }
    } catch (error) {
      console.error("Error getting times:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't get the available times. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle time slot selection
  const handleSlotSelect = (date: string, time: string, display: string) => {
    setSelectedSlot({ date, time, display })
    setShowBookingForm(true)

    // Add a message showing the selection
    const selectionMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I'd like to book ${display} on ${new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
    }
    setMessages((prev) => [...prev, selectionMessage])
  }

  // Submit booking form
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !bookingForm.name || !bookingForm.email) return

    setShowBookingForm(false)
    setIsLoading(true)

    // Create message with booking details
    const bookingMessage = `Please book an appointment for ${bookingForm.name} (${bookingForm.email}${bookingForm.phone ? `, ${bookingForm.phone}` : ""}) on ${selectedSlot.date} at ${selectedSlot.time}.`

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `My name is ${bookingForm.name}, email is ${bookingForm.email}${bookingForm.phone ? `, phone: ${bookingForm.phone}` : ""}. Please confirm my booking.`,
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const messageHistory = messages
        .filter((m) => m.id !== "greeting")
        .map((m) => ({ role: m.role, content: m.content }))

      messageHistory.push({ role: "user", content: bookingMessage })

      const response = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          stream: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to book")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantMessage.content += parsed.content
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content }
                        : m
                    )
                  )
                }
              } catch {
                // Skip
              }
            }
          }
        }
      }

      // Reset form
      setBookingForm({ name: "", email: "", phone: "" })
      setSelectedSlot(null)
    } catch (error) {
      console.error("Booking error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, there was an error booking your appointment. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Don't render on dashboard or chat pages
  if (shouldHide) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx(
          "bg-background relative flex flex-col overflow-hidden border shadow-2xl"
        )}
        initial={false}
        animate={{
          width: isOpen ? PANEL_WIDTH : COLLAPSED_WIDTH,
          height: isOpen ? PANEL_HEIGHT : COLLAPSED_HEIGHT,
          borderRadius: isOpen ? 16 : 22,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED_FACTOR,
          damping: 45,
          mass: 0.7,
          delay: isOpen ? 0 : 0.08,
        }}
      >
        {/* Collapsed State - Dock Bar */}
        <AnimatePresence>
          {!isOpen && (
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-[44px] items-center justify-center whitespace-nowrap select-none"
            >
              <div className="flex items-center justify-center gap-2 px-3">
                <div className="flex w-fit items-center gap-2">
                  <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
                </div>
                <Button
                  type="button"
                  className="flex h-fit flex-1 justify-end rounded-full px-2 !py-0.5"
                  variant="ghost"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="truncate">Ask AI</span>
                </Button>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>

        {/* Expanded State - Chat Interface */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
              className="flex h-full flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <ColorOrb dimension="28px" tones={{ base: "oklch(22.64% 0 0)" }} />
                  <div>
                    <p className="text-foreground font-medium text-sm select-none">
                      {CHATBOT_CONFIG.personality.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {CHATBOT_CONFIG.companyName} Assistant
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col gap-2",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                        message.role === "user"
                          ? "bg-foreground text-background rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Available Days Pills */}
                    {message.uiComponent?.type === "available_days" && (() => {
                      const comp = message.uiComponent as AvailableDaysComponent
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full"
                        >
                          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Select a day</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {comp.days.map((day) => (
                              <button
                                key={day.date}
                                onClick={() => handleDaySelect(day.date, day.display)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-foreground/20 bg-background hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Calendar className="w-3 h-3" />
                                {day.display}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })()}

                    {/* Time Slot Pills */}
                    {message.uiComponent?.type === "time_slots" && (() => {
                      const comp = message.uiComponent as TimeSlotComponent
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full"
                        >
                          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(comp.date)}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {comp.slots.map((slot) => (
                              <button
                                key={slot.time}
                                onClick={() => handleSlotSelect(comp.date, slot.time, slot.display)}
                                disabled={showBookingForm || isLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-foreground/20 bg-background hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Clock className="w-3 h-3" />
                                {slot.display}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })()}
                  </motion.div>
                ))}

                {/* Inline Booking Form */}
                {showBookingForm && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/50 border rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-foreground" />
                      <span>Book for {selectedSlot.display} on {formatDate(selectedSlot.date)}</span>
                    </div>
                    <form onSubmit={handleBookingSubmit} className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Your name *"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm((f) => ({ ...f, name: e.target.value }))}
                          required
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="Your email *"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm((f) => ({ ...f, email: e.target.value }))}
                          required
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="tel"
                          placeholder="Phone (optional)"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowBookingForm(false)
                            setSelectedSlot(null)
                          }}
                          className="flex-1 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!bookingForm.name || !bookingForm.email}
                          className="flex-1 py-2 text-sm rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Send className="w-3 h-3" />
                          Book Now
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex flex-col gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    className="w-full resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[80px]"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-muted-foreground">
                      Shift+Enter for new line
                    </p>
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="flex cursor-pointer items-center justify-center gap-1 text-foreground select-none disabled:opacity-50"
                    >
                      <KeyHint className="w-fit">Enter</KeyHint>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default FloatingChatbot
