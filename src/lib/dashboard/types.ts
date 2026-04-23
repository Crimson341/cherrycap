export const dashboardRanges = ["24h", "7d", "30d"] as const;

export type DashboardRange = (typeof dashboardRanges)[number];

type DashboardBreakdownItem = {
  label: string;
  visitors: number;
  percentage: number;
};

type DashboardClickItem = {
  label: string;
  target: string;
  clicks: number;
  percentage: number;
};

export type DashboardPayload = {
  siteName: string;
  siteSlug: string;
  range: DashboardRange;
  traffic: {
    isLive: boolean;
    visitors: number;
    pageviews: number;
    clicks: number;
    pageviewDelta: number | null;
    clickDelta: number | null;
    capturedAt: number | null;
    sourceLabel: string;
    topRegion: string | null;
    trafficSeries: Array<{
      bucketStart: number;
      pageviews: number;
    }>;
    topRegions: DashboardBreakdownItem[];
    topReferrers: DashboardBreakdownItem[];
    topDevices: DashboardBreakdownItem[];
    topBrowsers: DashboardBreakdownItem[];
    topClicks: DashboardClickItem[];
  };
  topPages: Array<{
    path: string;
    pageviews: number;
    percentage: number;
  }>;
  leadSummary: {
    isLive: boolean;
    total: number;
    note: string;
    lastCapturedAt: number | null;
  };
  emails: {
    isLive: boolean;
    total: number;
    lastCapturedAt: number | null;
    items: Array<{
      id: string;
      createdAt: number;
      name: string;
      email: string;
      subject: string;
      message: string;
      destination: string;
      provider: string;
      deliveryStatus: string;
    }>;
  };
  uptimeSummary: {
    isLive: boolean;
    status: string;
    note: string;
    uptimePercentage: number | null;
    responseTimeMs: number | null;
    lastCheckedAt: number | null;
  };
  seoAudits: {
    isLive: boolean;
    total: number;
    uniqueSessions: number;
    errorCount: number;
    averagePercentage: number | null;
    lastAuditAt: number | null;
    gradeCounts: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
    items: Array<{
      id: string;
      createdAt: number;
      status: "success" | "error";
      requestedUrl: string;
      finalUrl: string | null;
      grade: "A" | "B" | "C" | "D" | "F" | null;
      overallScore: number | null;
      maxScore: number | null;
      percentage: number | null;
      durationMs: number | null;
      errorMessage: string | null;
      sessionId: string | null;
      country: string | null;
      city: string | null;
      userAgent: string | null;
      referrerPath: string | null;
    }>;
  };
  dataFreshness: {
    trafficCapturedAt: number | null;
    clickCapturedAt: number | null;
    leadCapturedAt: number | null;
    emailCapturedAt: number | null;
    uptimeCapturedAt: number | null;
    seoAuditCapturedAt: number | null;
    notes: string[];
  };
};
