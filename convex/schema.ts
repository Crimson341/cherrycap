import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  trafficEvents: defineTable({
    site: v.literal("cherrycap"),
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
    source: v.literal("vercel_drain"),
  })
    .index("by_site_timestamp", ["site", "timestamp"])
    .index("by_site_path", ["site", "path"]),

  clickEvents: defineTable({
    site: v.literal("cherrycap"),
    path: v.string(),
    timestamp: v.number(),
    sessionId: v.string(),
    label: v.string(),
    target: v.string(),
    href: v.optional(v.string()),
    category: v.optional(v.string()),
    source: v.literal("site_click"),
  })
    .index("by_site_timestamp", ["site", "timestamp"])
    .index("by_site_label", ["site", "label"]),

  dashboardSnapshots: defineTable({
    site: v.literal("cherrycap"),
    range: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
    source: v.union(v.literal("vercel_analytics_drain"), v.literal("placeholder")),
    isLive: v.boolean(),
    capturedAt: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    visitors: v.number(),
    pageviews: v.number(),
    clicks: v.number(),
    pageviewDelta: v.optional(v.number()),
    clickDelta: v.optional(v.number()),
    topPages: v.array(
      v.object({
        path: v.string(),
        pageviews: v.number(),
        percentage: v.number(),
      }),
    ),
    trafficSeries: v.array(
      v.object({
        bucketStart: v.number(),
        pageviews: v.number(),
      }),
    ),
    topRegions: v.array(
      v.object({
        label: v.string(),
        visitors: v.number(),
        percentage: v.number(),
      }),
    ),
    topReferrers: v.array(
      v.object({
        label: v.string(),
        visitors: v.number(),
        percentage: v.number(),
      }),
    ),
    topDevices: v.array(
      v.object({
        label: v.string(),
        visitors: v.number(),
        percentage: v.number(),
      }),
    ),
    topBrowsers: v.array(
      v.object({
        label: v.string(),
        visitors: v.number(),
        percentage: v.number(),
      }),
    ),
    topClicks: v.array(
      v.object({
        label: v.string(),
        target: v.string(),
        clicks: v.number(),
        percentage: v.number(),
      }),
    ),
  }).index("by_site_range", ["site", "range"]),

  leadEvents: defineTable({
    site: v.literal("cherrycap"),
    createdAt: v.number(),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("closed"),
    ),
    source: v.union(v.literal("placeholder"), v.literal("web3forms")),
  }).index("by_site_createdAt", ["site", "createdAt"]),

  outgoingEmails: defineTable({
    site: v.literal("cherrycap"),
    createdAt: v.number(),
    provider: v.literal("web3forms"),
    subject: v.string(),
    name: v.string(),
    email: v.string(),
    message: v.string(),
    destination: v.string(),
    deliveryStatus: v.union(v.literal("sent"), v.literal("unknown")),
    providerMessageId: v.optional(v.string()),
  }).index("by_site_createdAt", ["site", "createdAt"]),

  uptimeChecks: defineTable({
    site: v.literal("cherrycap"),
    checkedAt: v.number(),
    status: v.union(
      v.literal("up"),
      v.literal("down"),
      v.literal("degraded"),
      v.literal("pending"),
    ),
    responseTimeMs: v.optional(v.number()),
    source: v.union(v.literal("placeholder"), v.literal("monitor")),
  }).index("by_site_checkedAt", ["site", "checkedAt"]),

  seoAuditEvents: defineTable({
    site: v.literal("cherrycap"),
    createdAt: v.number(),
    status: v.union(v.literal("success"), v.literal("error")),
    requestedUrl: v.string(),
    finalUrl: v.optional(v.string()),
    grade: v.optional(
      v.union(
        v.literal("A"),
        v.literal("B"),
        v.literal("C"),
        v.literal("D"),
        v.literal("F"),
      ),
    ),
    overallScore: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    percentage: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrerPath: v.optional(v.string()),
  }).index("by_site_createdAt", ["site", "createdAt"]),

  seoAuditJobs: defineTable({
    site: v.literal("cherrycap"),
    createdAt: v.number(),
    updatedAt: v.number(),
    requestedUrl: v.string(),
    normalizedUrl: v.string(),
    domain: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("rate_limited"),
    ),
    stage: v.union(
      v.literal("queued"),
      v.literal("fetching"),
      v.literal("crawling"),
      v.literal("scoring"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    resultId: v.optional(v.id("seoAuditJobResults")),
    cachedFromJobId: v.optional(v.id("seoAuditJobs")),
    summary: v.optional(
      v.object({
        finalUrl: v.optional(v.string()),
        grade: v.optional(
          v.union(
            v.literal("A"),
            v.literal("B"),
            v.literal("C"),
            v.literal("D"),
            v.literal("F"),
          ),
        ),
        overallScore: v.optional(v.number()),
        maxScore: v.optional(v.number()),
        percentage: v.optional(v.number()),
        durationMs: v.optional(v.number()),
        categoryCount: v.optional(v.number()),
        checkedPages: v.optional(v.number()),
        priorityFixes: v.array(v.string()),
      }),
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    sessionHash: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrerPath: v.optional(v.string()),
  })
    .index("by_site_createdAt", ["site", "createdAt"])
    .index("by_site_status_createdAt", ["site", "status", "createdAt"])
    .index("by_site_normalized_status_createdAt", [
      "site",
      "normalizedUrl",
      "status",
      "createdAt",
    ]),

  seoAuditJobResults: defineTable({
    site: v.literal("cherrycap"),
    createdAt: v.number(),
    jobId: v.id("seoAuditJobs"),
    normalizedUrl: v.string(),
    result: v.any(),
  })
    .index("by_site_createdAt", ["site", "createdAt"])
    .index("by_job", ["jobId"])
    .index("by_site_normalized_createdAt", ["site", "normalizedUrl", "createdAt"]),

  seoAuditRateLimits: defineTable({
    site: v.literal("cherrycap"),
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
    expiresAt: v.number(),
  }).index("by_site_key_window", ["site", "key", "windowStart"]),
});
