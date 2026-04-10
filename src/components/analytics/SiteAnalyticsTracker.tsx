"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SESSION_KEY = "ccw.analytics.session";
const BLOCKED_PREFIXES = ["/dashboard", "/signin"];

function compactText(value: string | null | undefined, maxLength: number) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";
  return normalized.slice(0, maxLength);
}

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }

    const sessionId = window.crypto?.randomUUID?.()
      ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function resolveHref(element: HTMLElement) {
  if (element instanceof HTMLAnchorElement && element.href) {
    return element.href;
  }

  return element.getAttribute("href") ?? undefined;
}

function resolveLabel(element: HTMLElement) {
  return (
    compactText(element.getAttribute("data-analytics"), 96)
    || compactText(element.getAttribute("aria-label"), 96)
    || compactText(element.getAttribute("title"), 96)
    || compactText(element.textContent, 96)
    || "Interaction"
  );
}

function resolveTarget(element: HTMLElement, href: string | undefined) {
  const explicitTarget = compactText(element.getAttribute("data-analytics-target"), 160);
  if (explicitTarget) {
    return explicitTarget;
  }

  if (href) {
    try {
      const url = new URL(href, window.location.href);
      if (url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}` || "/";
      }

      return url.hostname;
    } catch {
      return href.slice(0, 160);
    }
  }

  if (element.id) {
    return `#${element.id}`;
  }

  return element.tagName.toLowerCase();
}

function resolveCategory(element: HTMLElement) {
  return (
    compactText(element.getAttribute("data-analytics-category"), 64)
    || element.tagName.toLowerCase()
  );
}

function sendEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/click", blob);
    return;
  }

  void fetch("/api/analytics/click", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {
    return undefined;
  });
}

export function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const element = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics], a[href], button")
        : null;

      if (!element || element.closest("[data-analytics-ignore='true']")) {
        return;
      }

      const href = resolveHref(element);
      sendEvent({
        path: pathname,
        timestamp: Date.now(),
        sessionId: getSessionId(),
        label: resolveLabel(element),
        target: resolveTarget(element, href),
        href,
        category: resolveCategory(element),
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  return null;
}
