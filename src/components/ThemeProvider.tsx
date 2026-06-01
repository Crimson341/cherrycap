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

const THEME_CHANGE_EVENT = "themechange";

function subscribeSystemTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeStoredTheme(storageKey: string, callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}
  return fallback;
}

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
  const systemTheme = React.useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    () => "light" as const,
  );

  const theme = React.useSyncExternalStore(
    React.useCallback(
      (callback: () => void) => subscribeStoredTheme(storageKey, callback),
      [storageKey],
    ),
    React.useCallback(
      () => readStoredTheme(storageKey, defaultTheme),
      [storageKey, defaultTheme],
    ),
    React.useCallback(() => defaultTheme, [defaultTheme]),
  );

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
    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {}
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
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
