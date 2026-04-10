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

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
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

  const rawBody = await request.text();
  const normalizedEvents = normalizePayload(parsePayload(rawBody));

  if (!convexUrl || normalizedEvents.length === 0) {
    return Response.json({
      received: normalizedEvents.length,
      stored: 0,
      skipped: true,
    });
  }

  try {
    const client = new ConvexHttpClient(convexUrl, { logger: false });
    await client.mutation(api.dashboard.ingestClickEvents, {
      events: normalizedEvents,
    });

    return Response.json({
      received: normalizedEvents.length,
      stored: normalizedEvents.length,
      skipped: false,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to persist click analytics",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
