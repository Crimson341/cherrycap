import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

type IncomingClickEvent = {
  path?: string;
  timestamp?: number;
  sessionId?: string;
  label?: string;
  target?: string;
  href?: string;
  category?: string;
};

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const ingestSecret = process.env.ANALYTICS_INGEST_SECRET;
const MAX_BODY_BYTES = 16_384;
const MAX_EVENTS_PER_REQUEST = 25;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Prefer Origin; allow same-site no-cors/beacon without Origin only on same host
    const referer = request.headers.get("referer");
    if (!referer) return false;
    try {
      const refererUrl = new URL(referer);
      const requestUrl = new URL(request.url);
      return refererUrl.host === requestUrl.host && refererUrl.protocol === requestUrl.protocol;
    } catch {
      return false;
    }
  }

  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  return originUrl.host === requestUrl.host && originUrl.protocol === requestUrl.protocol;
}

function parsePayload(rawBody: string): IncomingClickEvent[] {
  if (!rawBody.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawBody);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function normalizePayload(events: IncomingClickEvent[]) {
  return events.flatMap((event) => {
    if (
      !event.path ||
      !event.timestamp ||
      !event.sessionId ||
      !event.label ||
      !event.target
    ) {
      return [];
    }

    return [{
      path: event.path,
      timestamp: event.timestamp,
      sessionId: event.sessionId,
      label: event.label.slice(0, 96),
      target: event.target.slice(0, 160),
      href: event.href?.slice(0, 240),
      category: event.category?.slice(0, 64),
    }];
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const normalizedEvents = normalizePayload(parsePayload(rawBody)).slice(
    0,
    MAX_EVENTS_PER_REQUEST,
  );

  if (!convexUrl || !ingestSecret || normalizedEvents.length === 0) {
    return Response.json({
      received: normalizedEvents.length,
      stored: 0,
      skipped: true,
    });
  }

  try {
    const client = new ConvexHttpClient(convexUrl, { logger: false });
    await client.mutation(api.dashboard.ingestClickEvents, {
      ingestSecret,
      events: normalizedEvents,
    });

    return Response.json({
      received: normalizedEvents.length,
      stored: normalizedEvents.length,
      skipped: false,
    });
  } catch {
    return Response.json(
      { error: "Failed to persist click analytics" },
      { status: 500 },
    );
  }
}
