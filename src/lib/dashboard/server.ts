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
      note: "Lead event persistence is not connected.",
      lastCapturedAt: null,
    },
    uptimeSummary: {
      isLive: false,
      status: "pending",
      note: "No uptime monitor is connected.",
      uptimePercentage: null,
      responseTimeMs: null,
      lastCheckedAt: null,
    },
    dataFreshness: {
      trafficCapturedAt: null,
      clickCapturedAt: null,
      leadCapturedAt: null,
      uptimeCapturedAt: null,
      notes: [
        "Traffic, clicks, regions, and source breakdowns will appear once live analytics events arrive.",
        "Lead event persistence is not connected.",
        "Uptime monitoring is not connected.",
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

    return await fetchQuery(
      api.dashboard.getDashboard,
      { range },
      { token, url: convexUrl },
    );
  } catch {
    return createFallbackDashboard(range);
  }
}
