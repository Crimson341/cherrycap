"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FloatingChatbot = dynamic(
  () =>
    import("@/components/ui/floating-chatbot").then((m) => m.FloatingChatbot),
  { ssr: false },
);

// Clerk appearance for dark mode
const darkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#e11d48",
    colorBackground: "#0a0a0a",
    colorInput: "#1f1f1f",
    colorInputForeground: "#ffffff",
    colorForeground: "#ffffff",
    colorNeutral: "#737373",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    borderRadius: "0.75rem" as const,
  },
  elements: {
    card: "bg-[#0f0f0f] border border-[#1f1f1f] shadow-2xl backdrop-blur-xl",
    headerTitle: "text-white font-semibold",
    headerSubtitle: "text-neutral-400",
    socialButtonsBlockButton:
      "bg-[#1f1f1f] border-[#333] text-white hover:bg-[#2a2a2a] transition-colors",
    socialButtonsBlockButtonText: "text-white font-medium",
    dividerLine: "bg-[#333]",
    dividerText: "text-neutral-500",
    formFieldLabel: "text-neutral-300",
    formFieldInput:
      "bg-[#1f1f1f] border-[#333] text-white placeholder-neutral-500 focus:border-rose-500 focus:ring-rose-500/20",
    formButtonPrimary:
      "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-500/20",
    footerActionLink: "text-rose-400 hover:text-rose-300 transition-colors",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-rose-400 hover:text-rose-300",
    formFieldInputShowPasswordButton: "text-neutral-400 hover:text-white",
    otpCodeFieldInput: "bg-[#1f1f1f] border-[#333] text-white",
    formResendCodeLink: "text-rose-400 hover:text-rose-300",
    alert: "bg-[#1f1f1f] border-[#333]",
    alertText: "text-neutral-300",
    userButtonPopoverCard: "bg-[#0f0f0f] border border-[#1f1f1f]",
    userButtonPopoverActionButton: "hover:bg-[#1f1f1f]",
    userButtonPopoverActionButtonText: "text-white",
    userButtonPopoverFooter: "border-t border-[#1f1f1f]",
    modalBackdrop: "bg-black/80 backdrop-blur-sm",
  },
};

// Clerk appearance for light mode
const lightAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#e11d48",
    colorBackground: "#ffffff",
    colorInput: "#f5f5f5",
    colorInputForeground: "#171717",
    colorForeground: "#171717",
    colorNeutral: "#737373",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    borderRadius: "0.75rem" as const,
  },
  elements: {
    card: "bg-white border border-neutral-200 shadow-2xl backdrop-blur-xl",
    headerTitle: "text-neutral-900 font-semibold",
    headerSubtitle: "text-neutral-500",
    socialButtonsBlockButton:
      "bg-neutral-100 border-neutral-200 text-neutral-900 hover:bg-neutral-200 transition-colors",
    socialButtonsBlockButtonText: "text-neutral-900 font-medium",
    dividerLine: "bg-neutral-200",
    dividerText: "text-neutral-400",
    formFieldLabel: "text-neutral-700",
    formFieldInput:
      "bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-rose-500 focus:ring-rose-500/20",
    formButtonPrimary:
      "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-500/20",
    footerActionLink: "text-rose-500 hover:text-rose-600 transition-colors",
    identityPreviewText: "text-neutral-900",
    identityPreviewEditButton: "text-rose-500 hover:text-rose-600",
    formFieldInputShowPasswordButton: "text-neutral-500 hover:text-neutral-900",
    otpCodeFieldInput: "bg-neutral-100 border-neutral-200 text-neutral-900",
    formResendCodeLink: "text-rose-500 hover:text-rose-600",
    alert: "bg-neutral-100 border-neutral-200",
    alertText: "text-neutral-700",
    userButtonPopoverCard: "bg-white border border-neutral-200",
    userButtonPopoverActionButton: "hover:bg-neutral-100",
    userButtonPopoverActionButtonText: "text-neutral-900",
    userButtonPopoverFooter: "border-t border-neutral-200",
    modalBackdrop: "bg-black/50 backdrop-blur-sm",
  },
};

function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark appearance during SSR to avoid flash
  const appearance =
    mounted && resolvedTheme === "light" ? lightAppearance : darkAppearance;

  return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkThemeProvider>
        {children}
        <FloatingChatbot />
      </ClerkThemeProvider>
    </ThemeProvider>
  );
}
