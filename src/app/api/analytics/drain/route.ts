import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import crypto from "node:crypto";

type IncomingAnalyticsEvent = Record<string, unknown>;

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const drainSecret = process.env.VERCEL_ANALYTICS_DRAIN_SECRET;

function verifySignature(rawBody: string, signature: string | null) {
  if (!drainSecret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const digest = crypto
    .createHmac("sha1", drainSecret)
    .update(rawBody)
    .digest("hex");

  const normalizedHeader = signature.replace(/^sha1=/, "");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(normalizedHeader),
  );
}

function parsePayload(rawBody: string): IncomingAnalyticsEvent[] {
  const trimmed = rawBody.trim();
  if (trimmed.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (Array.isArray(parsed.events)) {
      return parsed.events;
    }

    return [parsed];
  } catch {
    return trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          const parsed = JSON.parse(line);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [];
        }
      });
  }
}

function getNestedValue(
  event: IncomingAnalyticsEvent,
  path: string[],
) {
  let current: unknown = event;

  for (const segment of path) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function pickString(
  event: IncomingAnalyticsEvent,
  paths: string[][],
) {
  for (const path of paths) {
    const value = getNestedValue(event, path);
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function pickTimestamp(event: IncomingAnalyticsEvent) {
  const value = getNestedValue(event, ["timestamp"])
    ?? getNestedValue(event, ["time"])
    ?? getNestedValue(event, ["createdAt"]);

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? undefined : timestamp;
  }

  return undefined;
}

function normalizeEvents(events: IncomingAnalyticsEvent[]) {
  return events.flatMap((event) => {
    const eventType = pickString(event, [
      ["eventType"],
      ["type"],
      ["event"],
      ["name"],
    ]);
    const path = pickString(event, [["path"], ["pathname"], ["route"]]);
    const sessionId = pickString(event, [
      ["sessionId"],
      ["session_id"],
      ["visitorId"],
      ["visitor_id"],
    ]);
    const timestamp = pickTimestamp(event);

    if (eventType !== "pageview" || !path || !sessionId || !timestamp) {
      return [];
    }

    return [{
      path,
      sessionId,
      timestamp,
      origin: pickString(event, [["origin"], ["url"], ["host"]]),
      country: pickString(event, [["country"], ["geo", "country"]]),
      region: pickString(event, [["region"], ["geo", "region"]]),
      city: pickString(event, [["city"], ["geo", "city"]]),
      referrer: pickString(event, [["referrer"], ["referer"], ["ref"]]),
      device: pickString(event, [["device"], ["deviceType"], ["client", "device"]]),
      browser: pickString(event, [["browser"], ["client", "browser"]]),
    }];
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");

  if (!verifySignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const normalizedEvents = normalizeEvents(parsePayload(rawBody));

  if (!convexUrl || normalizedEvents.length === 0) {
    return Response.json({
      received: normalizedEvents.length,
      stored: 0,
      skipped: true,
    });
  }

  try {
    const client = new ConvexHttpClient(convexUrl, { logger: false });
    await client.mutation(api.dashboard.ingestTrafficEvents, {
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
        error: "Failed to persist analytics events",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
