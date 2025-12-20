"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Bot, MessageSquare, Sparkles, Zap, CheckCircle } from "lucide-react";

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

/**
 * @name Shine Border
 * @description It is an animated background border effect component with easy to use and configurable props.
 */
function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "relative grid h-full w-full place-items-center rounded-3xl bg-gray-900 p-3 text-white",
        className,
      )}
    >
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--border-radius": `${borderRadius}px`,
            "--shine-pulse-duration": `${duration}s`,
            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            "--background-radial-gradient": `radial-gradient(transparent,transparent, ${color instanceof Array ? color.join(",") : color},transparent,transparent)`,
          } as React.CSSProperties
        }
        className={`before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-3xl before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:![mask-composite:exclude] before:[mask:--mask-linear-gradient] motion-safe:before:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]`}
      ></div>
      {children}
    </div>
  );
}

export function TimelineContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center gap-3">
      {children}
    </div>
  );
}

interface TimelineEventProps {
  label: string;
  message: string;
  icon: React.ReactNode;
  iconBorderColor: string;
  isLast?: boolean;
}

export function TimelineEvent({
  label,
  message,
  icon,
  iconBorderColor,
  isLast = false,
}: TimelineEventProps) {
  return (
    <div className="group relative -m-2 flex gap-4 border border-transparent p-2">
      <div className="relative">
        <div
          className={cn(
            "rounded-full border bg-gray-900 p-2",
            iconBorderColor
          )}
        >
          {icon}
        </div>
        {!isLast ? (
          <div className="absolute inset-x-0 mx-auto h-full w-[2px] bg-gray-700" />
        ) : null}
      </div>
      <div className="mt-1 flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-white">{label}</p>
        </div>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}

const aiTimeline = [
  {
    label: "Customer Asks a Question",
    message: "A visitor lands on your site and asks about your hours, services, or pricing.",
    icon: <MessageSquare className="h-4 w-4 text-cyan-400" />,
    iconBorderColor: "border-cyan-500/40",
  },
  {
    label: "AI Understands Intent",
    message: "Your trained AI instantly recognizes what they need and pulls the right answer.",
    icon: <Bot className="h-4 w-4 text-blue-400" />,
    iconBorderColor: "border-blue-500/40",
  },
  {
    label: "Personalized Response",
    message: "The AI responds in your brand voice with accurate, helpful information.",
    icon: <Sparkles className="h-4 w-4 text-purple-400" />,
    iconBorderColor: "border-purple-500/40",
  },
  {
    label: "Action Taken",
    message: "Book an appointment, capture a lead, or answer the question—automatically.",
    icon: <Zap className="h-4 w-4 text-amber-400" />,
    iconBorderColor: "border-amber-500/40",
  },
  {
    label: "Customer Converted",
    message: "Another happy customer, even at 2am. You review the conversation later.",
    icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    iconBorderColor: "border-emerald-500/40",
  },
];

export function AITimeline() {
  return (
    <div className="w-full">
      <TimelineContainer>
        {aiTimeline.map((event, i) => (
          <TimelineEvent
            key={event.label}
            isLast={i === aiTimeline.length - 1}
            label={event.label}
            message={event.message}
            icon={event.icon}
            iconBorderColor={event.iconBorderColor}
          />
        ))}
      </TimelineContainer>
    </div>
  );
}

export { ShineBorder };
