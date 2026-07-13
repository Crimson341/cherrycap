import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { DashboardPayload, DashboardRange } from "@/lib/dashboard/types";
import { fetchQuery } from "convex/nextjs";
import { getLeadDashboardData } from "@/lib/leads/db";

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
      note: "Cloudflare D1 is not connected in this environment.",
      lastCapturedAt: null,
      byStatus: {},
    },
    leads: [],
    uptimeSummary: {
      isLive: false,
      status: "pending",
      note: "Placeholder until uptime checks are wired into a monitor.",
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
        "Leads remain placeholder until contact submissions are persisted.",
        "Uptime remains placeholder until a monitor is connected.",
      ],
    },
  };
}

async function attachD1Leads(payload: DashboardPayload): Promise<DashboardPayload> {
  const leadData = await getLeadDashboardData();
  const liveLeadNote = leadData.total === 0
    ? "D1 is live and ready for the first website inquiry."
    : `${leadData.total} lead${leadData.total === 1 ? "" : "s"} stored in Cloudflare D1.`;

  return {
    ...payload,
    leadSummary: {
      isLive: leadData.isLive,
      total: leadData.total,
      note: leadData.isLive
        ? liveLeadNote
        : "Cloudflare D1 is not connected in this environment.",
      lastCapturedAt: leadData.lastCapturedAt,
      byStatus: leadData.byStatus,
    },
    leads: leadData.leads,
    dataFreshness: {
      ...payload.dataFreshness,
      leadCapturedAt: leadData.lastCapturedAt,
      notes: payload.dataFreshness.notes.map((note) =>
        note.startsWith("Leads ")
          ? leadData.isLive
            ? "Lead submissions are stored in Cloudflare D1 and available in the pipeline below."
            : "Lead storage is waiting for the Cloudflare D1 binding."
          : note,
      ),
    },
  };
}

export async function getDashboardPayload(range: DashboardRange) {
  if (!convexUrl) {
    return await attachD1Leads(createFallbackDashboard(range));
  }

  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return await attachD1Leads(createFallbackDashboard(range));
    }

    const payload = await fetchQuery(
      api.dashboard.getDashboard,
      { range },
      { token, url: convexUrl },
    );
    return await attachD1Leads(payload);
  } catch {
    return await attachD1Leads(createFallbackDashboard(range));
  }
}
