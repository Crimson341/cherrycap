import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SITE = "cherrycap" as const;
const RANGES = ["24h", "7d", "30d"] as const;

const RANGE_CONFIG = {
  "24h": {
    durationMs: 24 * 60 * 60 * 1000,
    bucketMs: 60 * 60 * 1000,
  },
  "7d": {
    durationMs: 7 * 24 * 60 * 60 * 1000,
    bucketMs: 24 * 60 * 60 * 1000,
  },
  "30d": {
    durationMs: 30 * 24 * 60 * 60 * 1000,
    bucketMs: 24 * 60 * 60 * 1000,
  },
} as const;

type DashboardRange = (typeof RANGES)[number];

type TrafficEvent = {
  path: string;
  sessionId: string;
  timestamp: number;
  origin?: string;
  country?: string;
  region?: string;
  city?: string;
  referrer?: string;
  device?: string;
  browser?: string;
};

type ClickEvent = {
  path: string;
  sessionId: string;
  timestamp: number;
  label: string;
  target: string;
  href?: string;
  category?: string;
};

function floorToBucket(timestamp: number, bucketMs: number) {
  return Math.floor(timestamp / bucketMs) * bucketMs;
}

function normalizeLabel(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function normalizeReferrer(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "Direct";
  }

  try {
    const url = new URL(trimmed);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed;
  }
}

function buildBreakdownFromSessions(
  groups: Map<string, Set<string>>,
  totalVisitors: number,
) {
  return [...groups.entries()]
    .map(([label, sessions]) => ({
      label,
      visitors: sessions.size,
      percentage: totalVisitors > 0
        ? Math.round((sessions.size / totalVisitors) * 100)
        : 0,
    }))
    .sort((left, right) => right.visitors - left.visitors)
    .slice(0, 5);
}

function aggregateTraffic(
  events: TrafficEvent[],
  previousEvents: TrafficEvent[],
  clickEvents: ClickEvent[],
  previousClickEvents: ClickEvent[],
  range: DashboardRange,
  now: number,
) {
  const config = RANGE_CONFIG[range];
  const periodStart = now - config.durationMs;
  const alignedStart = floorToBucket(periodStart, config.bucketMs);

  const buckets = new Map<number, number>();
  for (let bucketStart = alignedStart; bucketStart < now; bucketStart += config.bucketMs) {
    buckets.set(bucketStart, 0);
  }

  const pageCounts = new Map<string, number>();
  const visitorIds = new Set<string>();
  const regionSessions = new Map<string, Set<string>>();
  const referrerSessions = new Map<string, Set<string>>();
  const deviceSessions = new Map<string, Set<string>>();
  const browserSessions = new Map<string, Set<string>>();

  for (const event of events) {
    visitorIds.add(event.sessionId);
    pageCounts.set(event.path, (pageCounts.get(event.path) ?? 0) + 1);

    const region = normalizeLabel(event.region ?? event.country, "Unknown");
    const referrer = normalizeReferrer(event.referrer);
    const device = normalizeLabel(event.device, "Unknown");
    const browser = normalizeLabel(event.browser, "Unknown");

    for (const [group, label] of [
      [regionSessions, region],
      [referrerSessions, referrer],
      [deviceSessions, device],
      [browserSessions, browser],
    ] as const) {
      const sessions = group.get(label) ?? new Set<string>();
      sessions.add(event.sessionId);
      group.set(label, sessions);
    }

    const bucketStart = floorToBucket(event.timestamp, config.bucketMs);
    if (buckets.has(bucketStart)) {
      buckets.set(bucketStart, (buckets.get(bucketStart) ?? 0) + 1);
    }
  }

  const pageviews = events.length;
  const previousPageviews = previousEvents.length;
  const clicks = clickEvents.length;
  const previousClicks = previousClickEvents.length;
  const pageviewDelta = previousPageviews > 0
    ? Math.round(((pageviews - previousPageviews) / previousPageviews) * 100)
    : undefined;
  const clickDelta = previousClicks > 0
    ? Math.round(((clicks - previousClicks) / previousClicks) * 100)
    : undefined;

  const topPages = [...pageCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([path, count]) => ({
      path,
      pageviews: count,
      percentage: pageviews > 0 ? Math.round((count / pageviews) * 100) : 0,
    }));

  const trafficSeries = [...buckets.entries()].map(([bucketStart, count]) => ({
    bucketStart,
    pageviews: count,
  }));

  const clickCounts = new Map<string, { label: string; target: string; clicks: number }>();
  for (const event of clickEvents) {
    const key = `${event.label}\u0000${event.target}`;
    const current = clickCounts.get(key) ?? {
      label: event.label,
      target: event.target,
      clicks: 0,
    };
    current.clicks += 1;
    clickCounts.set(key, current);
  }

  const topClicks = [...clickCounts.values()]
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 5)
    .map((entry) => ({
      ...entry,
      percentage: clicks > 0 ? Math.round((entry.clicks / clicks) * 100) : 0,
    }));

  return {
    periodStart,
    periodEnd: now,
    capturedAt: now,
    visitors: visitorIds.size,
    pageviews,
    clicks,
    pageviewDelta,
    clickDelta,
    topPages,
    trafficSeries,
    topRegions: buildBreakdownFromSessions(regionSessions, visitorIds.size),
    topReferrers: buildBreakdownFromSessions(referrerSessions, visitorIds.size),
    topDevices: buildBreakdownFromSessions(deviceSessions, visitorIds.size),
    topBrowsers: buildBreakdownFromSessions(browserSessions, visitorIds.size),
    topClicks,
  };
}

async function queryTrafficEvents(
  ctx: MutationCtx,
  start: number,
  end: number,
) {
  return await ctx.db
    .query("trafficEvents")
    .withIndex("by_site_timestamp", (q) =>
      q.eq("site", SITE).gte("timestamp", start).lt("timestamp", end),
    )
    .collect();
}

async function queryClickEvents(
  ctx: MutationCtx,
  start: number,
  end: number,
) {
  return await ctx.db
    .query("clickEvents")
    .withIndex("by_site_timestamp", (q) =>
      q.eq("site", SITE).gte("timestamp", start).lt("timestamp", end),
    )
    .collect();
}

async function upsertSnapshot(
  ctx: MutationCtx,
  range: DashboardRange,
  snapshot: ReturnType<typeof aggregateTraffic>,
) {
  const existing = await ctx.db
    .query("dashboardSnapshots")
    .withIndex("by_site_range", (q) =>
      q.eq("site", SITE).eq("range", range),
    )
    .unique();

  const value = {
    site: SITE,
    range,
    source: "vercel_analytics_drain" as const,
    isLive: true,
    ...snapshot,
  };

  if (existing) {
    await ctx.db.patch(existing._id, value);
    return existing._id;
  }

  return await ctx.db.insert("dashboardSnapshots", value);
}

async function recomputeSnapshots(
  ctx: MutationCtx,
  now: number,
) {
  for (const range of RANGES) {
    const config = RANGE_CONFIG[range];
    const currentStart = now - config.durationMs;
    const previousStart = currentStart - config.durationMs;

    const currentEvents = await queryTrafficEvents(ctx, currentStart, now);
    const previousEvents = await queryTrafficEvents(ctx, previousStart, currentStart);
    const currentClicks = await queryClickEvents(ctx, currentStart, now);
    const previousClicks = await queryClickEvents(ctx, previousStart, currentStart);
    const snapshot = aggregateTraffic(
      currentEvents,
      previousEvents,
      currentClicks,
      previousClicks,
      range,
      now,
    );

    await upsertSnapshot(ctx, range, snapshot);
  }
}

function assertIngestAuthorized(ingestSecret: string | undefined) {
  const expected = process.env.ANALYTICS_INGEST_SECRET;
  if (!expected || !ingestSecret || ingestSecret !== expected) {
    throw new Error("Unauthorized");
  }
}

export const ingestTrafficEvents = mutation({
  args: {
    ingestSecret: v.string(),
    events: v.array(
      v.object({
        path: v.string(),
        timestamp: v.number(),
        sessionId: v.string(),
        origin: v.optional(v.string()),
        country: v.optional(v.string()),
        region: v.optional(v.string()),
        city: v.optional(v.string()),
        referrer: v.optional(v.string()),
        device: v.optional(v.string()),
        browser: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    assertIngestAuthorized(args.ingestSecret);

    if (args.events.length === 0) {
      return { inserted: 0, snapshotsUpdated: 0 };
    }

    for (const event of args.events) {
      await ctx.db.insert("trafficEvents", {
        site: SITE,
        path: event.path,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        origin: event.origin,
        country: event.country,
        region: event.region,
        city: event.city,
        referrer: event.referrer,
        device: event.device,
        browser: event.browser,
        source: "vercel_drain",
      });
    }

    await recomputeSnapshots(ctx, Date.now());

    return {
      inserted: args.events.length,
      snapshotsUpdated: RANGES.length,
    };
  },
});

export const ingestClickEvents = mutation({
  args: {
    ingestSecret: v.string(),
    events: v.array(
      v.object({
        path: v.string(),
        timestamp: v.number(),
        sessionId: v.string(),
        label: v.string(),
        target: v.string(),
        href: v.optional(v.string()),
        category: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    assertIngestAuthorized(args.ingestSecret);

    if (args.events.length === 0) {
      return { inserted: 0, snapshotsUpdated: 0 };
    }

    for (const event of args.events) {
      await ctx.db.insert("clickEvents", {
        site: SITE,
        path: event.path,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        label: event.label,
        target: event.target,
        href: event.href,
        category: event.category,
        source: "site_click",
      });
    }

    await recomputeSnapshots(ctx, Date.now());

    return {
      inserted: args.events.length,
      snapshotsUpdated: RANGES.length,
    };
  },
});

export const getDashboard = query({
  args: {
    range: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }

    const snapshot = await ctx.db
      .query("dashboardSnapshots")
      .withIndex("by_site_range", (q) =>
        q.eq("site", SITE).eq("range", args.range),
      )
      .unique();

    const recentLeads = await ctx.db
      .query("leadEvents")
      .withIndex("by_site_createdAt", (q) => q.eq("site", SITE))
      .order("desc")
      .take(10);

    const recentChecks = await ctx.db
      .query("uptimeChecks")
      .withIndex("by_site_checkedAt", (q) => q.eq("site", SITE))
      .order("desc")
      .take(20);

    const liveLeads = recentLeads.filter((lead) => lead.source === "web3forms");
    const monitoredChecks = recentChecks.filter((check) => check.source === "monitor");
    const latestCheck = monitoredChecks[0] ?? null;
    const successfulChecks = monitoredChecks.filter((check) => check.status === "up").length;
    const uptimePercentage = monitoredChecks.length > 0
      ? Math.round((successfulChecks / monitoredChecks.length) * 1000) / 10
      : null;

    return {
      siteName: "Cherry Capital",
      siteSlug: SITE,
      range: args.range,
      traffic: {
        isLive: Boolean(snapshot?.isLive),
        visitors: snapshot?.visitors ?? 0,
        pageviews: snapshot?.pageviews ?? 0,
        clicks: snapshot?.clicks ?? 0,
        pageviewDelta: snapshot?.pageviewDelta ?? null,
        clickDelta: snapshot?.clickDelta ?? null,
        capturedAt: snapshot?.capturedAt ?? null,
        sourceLabel: snapshot?.isLive
          ? "Live analytics feed"
          : "Awaiting live analytics feed",
        topRegion: snapshot?.topRegions?.[0]?.label ?? null,
        trafficSeries: snapshot?.trafficSeries ?? [],
        topRegions: snapshot?.topRegions ?? [],
        topReferrers: snapshot?.topReferrers ?? [],
        topDevices: snapshot?.topDevices ?? [],
        topBrowsers: snapshot?.topBrowsers ?? [],
        topClicks: snapshot?.topClicks ?? [],
      },
      topPages: snapshot?.topPages ?? [],
      leadSummary: {
        isLive: liveLeads.length > 0,
        total: liveLeads.length,
        note: liveLeads.length > 0
          ? "Recent Web3Forms lead events."
          : "Lead event persistence is not connected.",
        lastCapturedAt: liveLeads[0]?.createdAt ?? null,
      },
      uptimeSummary: {
        isLive: monitoredChecks.length > 0,
        status: latestCheck?.status ?? "pending",
        note: monitoredChecks.length > 0
          ? "Recent monitor checks."
          : "No uptime monitor is connected.",
        uptimePercentage,
        responseTimeMs: latestCheck?.responseTimeMs ?? null,
        lastCheckedAt: latestCheck?.checkedAt ?? null,
      },
      dataFreshness: {
        trafficCapturedAt: snapshot?.capturedAt ?? null,
        clickCapturedAt: snapshot?.capturedAt ?? null,
        leadCapturedAt: liveLeads[0]?.createdAt ?? null,
        uptimeCapturedAt: latestCheck?.checkedAt ?? null,
        notes: [
          snapshot?.isLive
            ? "Traffic, regions, referrers, devices, browsers, and click activity are updating from live events."
            : "No live analytics data has been received yet.",
          liveLeads.length > 0
            ? "Lead events are being stored from Web3Forms."
            : "Lead event persistence is not connected.",
          monitoredChecks.length > 0
            ? "Uptime checks are being recorded."
            : "Uptime monitoring is not connected.",
        ],
      },
    };
  },
});
