"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  systemTheme: ResolvedTheme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function withoutTransitions(callback: () => void) {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none!important;animation:none!important}",
    ),
  );
  document.head.appendChild(style);
  callback();
  window.getComputedStyle(document.body);
  window.setTimeout(() => {
    document.head.removeChild(style);
  }, 1);
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>("light");

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncSystemTheme();
    mediaQuery.addEventListener("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, []);

  React.useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      if (
        storedTheme === "light" ||
        storedTheme === "dark" ||
        storedTheme === "system"
      ) {
        setThemeState(storedTheme);
      }
    } catch {
      setThemeState(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  const resolvedTheme = theme === "system" && enableSystem
    ? systemTheme
    : theme === "system"
      ? "light"
      : theme;

  React.useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      if (attribute === "class") {
        root.classList.toggle("dark", resolvedTheme === "dark");
      }
      root.style.colorScheme = resolvedTheme;
    };

    if (disableTransitionOnChange) {
      withoutTransitions(apply);
      return;
    }

    apply();
  }, [attribute, disableTransitionOnChange, resolvedTheme]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {}
  }, [storageKey]);

  const value = React.useMemo<ThemeContextValue>(() => ({
    theme,
    systemTheme,
    resolvedTheme,
    setTheme,
  }), [resolvedTheme, setTheme, systemTheme, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
