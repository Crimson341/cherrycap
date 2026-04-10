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
  dataFreshness: {
    trafficCapturedAt: number | null;
    clickCapturedAt: number | null;
    leadCapturedAt: number | null;
    emailCapturedAt: number | null;
    uptimeCapturedAt: number | null;
    notes: string[];
  };
};
