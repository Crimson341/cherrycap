import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SITE = "cherrycap" as const;
const CACHE_MS = 6 * 60 * 60 * 1000;

const auditSummaryValidator = v.object({
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
});

const rateLimits = {
  session: { limit: 5, windowMs: 60 * 60 * 1000 },
  ip: { limit: 20, windowMs: 24 * 60 * 60 * 1000 },
  domain: { limit: 3, windowMs: 60 * 60 * 1000 },
} as const;

async function consumeRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
) {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const existing = await ctx.db
    .query("seoAuditRateLimits")
    .withIndex("by_site_key_window", (q) =>
      q.eq("site", SITE).eq("key", key).eq("windowStart", windowStart),
    )
    .unique();

  if (existing && existing.count >= limit) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)),
    };
  }

  if (existing) {
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      expiresAt: windowStart + windowMs,
    });
  } else {
    await ctx.db.insert("seoAuditRateLimits", {
      site: SITE,
      key,
      windowStart,
      count: 1,
      expiresAt: windowStart + windowMs,
    });
  }

  return { limited: false, retryAfterSeconds: 0 };
}

async function latestCachedJob(
  ctx: MutationCtx,
  normalizedUrl: string,
  now: number,
) {
  const [job] = await ctx.db
    .query("seoAuditJobs")
    .withIndex("by_site_normalized_status_createdAt", (q) =>
      q.eq("site", SITE).eq("normalizedUrl", normalizedUrl).eq("status", "complete"),
    )
    .order("desc")
    .take(1);

  if (!job?.resultId || !job.summary || !job.completedAt) return null;
  if (job.completedAt < now - CACHE_MS) return null;
  return job;
}

export const createJob = mutation({
  args: {
    requestedUrl: v.string(),
    normalizedUrl: v.string(),
    domain: v.string(),
    sessionHash: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrerPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const checks = [
      args.sessionHash
        ? {
            key: `session:${args.sessionHash}`,
            ...rateLimits.session,
          }
        : null,
      args.ipHash
        ? {
            key: `ip:${args.ipHash}`,
            ...rateLimits.ip,
          }
        : null,
      {
        key: `domain:${args.domain}`,
        ...rateLimits.domain,
      },
    ].filter(Boolean) as { key: string; limit: number; windowMs: number }[];

    for (const check of checks) {
      const rate = await consumeRateLimit(
        ctx,
        check.key,
        check.limit,
        check.windowMs,
        now,
      );
      if (rate.limited) {
        const jobId = await ctx.db.insert("seoAuditJobs", {
          site: SITE,
          createdAt: now,
          updatedAt: now,
          requestedUrl: args.requestedUrl,
          normalizedUrl: args.normalizedUrl,
          domain: args.domain,
          status: "rate_limited",
          stage: "failed",
          errorMessage: "Rate limit reached. Try again later.",
          sessionHash: args.sessionHash,
          ipHash: args.ipHash,
          country: args.country,
          city: args.city,
          userAgent: args.userAgent,
          referrerPath: args.referrerPath,
        });
        return {
          jobId,
          status: "rate_limited" as const,
          stage: "failed" as const,
          retryAfterSeconds: rate.retryAfterSeconds,
        };
      }
    }

    const cached = await latestCachedJob(ctx, args.normalizedUrl, now);
    if (cached) {
      const jobId = await ctx.db.insert("seoAuditJobs", {
        site: SITE,
        createdAt: now,
        updatedAt: now,
        requestedUrl: args.requestedUrl,
        normalizedUrl: args.normalizedUrl,
        domain: args.domain,
        status: "complete",
        stage: "complete",
        resultId: cached.resultId,
        cachedFromJobId: cached._id,
        summary: cached.summary,
        completedAt: now,
        durationMs: 0,
        sessionHash: args.sessionHash,
        ipHash: args.ipHash,
        country: args.country,
        city: args.city,
        userAgent: args.userAgent,
        referrerPath: args.referrerPath,
      });
      return {
        jobId,
        status: "complete" as const,
        stage: "complete" as const,
        cached: true,
      };
    }

    const jobId = await ctx.db.insert("seoAuditJobs", {
      site: SITE,
      createdAt: now,
      updatedAt: now,
      requestedUrl: args.requestedUrl,
      normalizedUrl: args.normalizedUrl,
      domain: args.domain,
      status: "queued",
      stage: "queued",
      sessionHash: args.sessionHash,
      ipHash: args.ipHash,
      country: args.country,
      city: args.city,
      userAgent: args.userAgent,
      referrerPath: args.referrerPath,
    });

    await ctx.scheduler.runAfter(0, internal.seoAuditWorker.runAudit, { jobId });
    return { jobId, status: "queued" as const, stage: "queued" as const };
  },
});

export const getJob = query({
  args: { jobId: v.id("seoAuditJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.site !== SITE) return null;

    const result = job.resultId ? await ctx.db.get(job.resultId) : null;
    return {
      jobId: job._id,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      requestedUrl: job.requestedUrl,
      normalizedUrl: job.normalizedUrl,
      status: job.status,
      stage: job.stage,
      summary: job.summary ?? null,
      errorMessage: job.errorMessage ?? null,
      retryable: job.status === "failed",
      cached: Boolean(job.cachedFromJobId),
      result: result?.result ?? null,
    };
  },
});

export const markJobRunning = internalMutation({
  args: { jobId: v.id("seoAuditJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "running",
      stage: "fetching",
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const setJobStage = internalMutation({
  args: {
    jobId: v.id("seoAuditJobs"),
    stage: v.union(v.literal("fetching"), v.literal("crawling"), v.literal("scoring")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      stage: args.stage,
      updatedAt: Date.now(),
    });
  },
});

export const finishJob = internalMutation({
  args: {
    jobId: v.id("seoAuditJobs"),
    result: v.any(),
    summary: auditSummaryValidator,
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.site !== SITE) return;
    const now = Date.now();
    const durationMs = job.startedAt ? now - job.startedAt : args.summary.durationMs;
    const resultId = await ctx.db.insert("seoAuditJobResults", {
      site: SITE,
      createdAt: now,
      jobId: args.jobId,
      normalizedUrl: job.normalizedUrl,
      result: args.result,
    });

    await ctx.db.patch(args.jobId, {
      status: "complete",
      stage: "complete",
      resultId,
      summary: { ...args.summary, durationMs },
      completedAt: now,
      durationMs,
      updatedAt: now,
    });

    await ctx.db.insert("seoAuditEvents", {
      site: SITE,
      createdAt: now,
      status: "success",
      requestedUrl: job.requestedUrl,
      finalUrl: args.summary.finalUrl,
      grade: args.summary.grade,
      overallScore: args.summary.overallScore,
      maxScore: args.summary.maxScore,
      percentage: args.summary.percentage,
      durationMs,
      sessionId: job.sessionHash,
      country: job.country,
      city: job.city,
      userAgent: job.userAgent,
      referrerPath: job.referrerPath,
    });
  },
});

export const failJob = internalMutation({
  args: {
    jobId: v.id("seoAuditJobs"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.site !== SITE) return;
    const now = Date.now();
    const durationMs = job.startedAt ? now - job.startedAt : undefined;

    await ctx.db.patch(args.jobId, {
      status: "failed",
      stage: "failed",
      errorMessage: args.errorMessage.slice(0, 500),
      completedAt: now,
      durationMs,
      updatedAt: now,
    });

    await ctx.db.insert("seoAuditEvents", {
      site: SITE,
      createdAt: now,
      status: "error",
      requestedUrl: job.requestedUrl,
      durationMs,
      errorMessage: args.errorMessage.slice(0, 500),
      sessionId: job.sessionHash,
      country: job.country,
      city: job.city,
      userAgent: job.userAgent,
      referrerPath: job.referrerPath,
    });
  },
});
