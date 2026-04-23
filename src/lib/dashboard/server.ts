import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { DashboardPayload, DashboardRange } from "@/lib/dashboard/types";
import { fetchQuery } from "convex/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function createFallbackDashboard(range: DashboardRange): DashboardPayload {
  return {
    siteName: "Cherry Capital",
    siteSlug: "cherrycap",
    range,
    traffic: {
      isLive: false,
      visitors: 0,
      pageviews: 0,
      clicks: 0,
      pageviewDelta: null,
      clickDelta: null,
      capturedAt: null,
      sourceLabel: "Awaiting live traffic feed",
      topRegion: null,
      trafficSeries: [],
      topRegions: [],
      topReferrers: [],
      topDevices: [],
      topBrowsers: [],
      topClicks: [],
    },
    topPages: [],
    leadSummary: {
      isLive: false,
      total: 0,
      note: "Placeholder until lead events are persisted.",
      lastCapturedAt: null,
    },
    emails: {
      isLive: false,
      total: 0,
      lastCapturedAt: null,
      items: [],
    },
    uptimeSummary: {
      isLive: false,
      status: "pending",
      note: "Placeholder until uptime checks are wired into a monitor.",
      uptimePercentage: null,
      responseTimeMs: null,
      lastCheckedAt: null,
    },
    seoAudits: {
      isLive: false,
      total: 0,
      uniqueSessions: 0,
      errorCount: 0,
      averagePercentage: null,
      lastAuditAt: null,
      gradeCounts: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      items: [],
    },
    dataFreshness: {
      trafficCapturedAt: null,
      clickCapturedAt: null,
      leadCapturedAt: null,
      emailCapturedAt: null,
      uptimeCapturedAt: null,
      seoAuditCapturedAt: null,
      notes: [
        "Traffic, clicks, regions, and source breakdowns will appear once live analytics events arrive.",
        "Captured contact emails will appear once submissions are relayed through the app.",
        "Free SEO audit usage will appear once the first audit is run.",
        "Uptime remains placeholder until a monitor is connected.",
      ],
    },
  };
}

export async function getDashboardPayload(range: DashboardRange) {
  if (!convexUrl) {
    return createFallbackDashboard(range);
  }

  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return createFallbackDashboard(range);
    }

    const response = await fetchQuery(
      api.dashboard.getDashboard,
      { range },
      { token, url: convexUrl },
    );

    const fallback = createFallbackDashboard(range);
    return { ...fallback, ...response } as DashboardPayload;
  } catch {
    return createFallbackDashboard(range);
  }
}
