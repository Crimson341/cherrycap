"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { runSeoAudit } from "../src/lib/seoAudit";
import {
  sanitizeAuditResult,
  summarizeAuditResult,
} from "../src/lib/seoAuditSecurity";

export const runAudit = internalAction({
  args: {
    jobId: v.id("seoAuditJobs"),
  },
  handler: async (ctx, args) => {
    const startedAt = Date.now();
    await ctx.runMutation(internal.seoAuditJobs.markJobRunning, {
      jobId: args.jobId,
    });

    try {
      const job = await ctx.runQuery(internal.seoAuditWorkerState.getJobForWorker, {
        jobId: args.jobId,
      });
      if (!job) {
        throw new Error("Audit job not found.");
      }

      await ctx.runMutation(internal.seoAuditJobs.setJobStage, {
        jobId: args.jobId,
        stage: "fetching",
      });
      await ctx.runMutation(internal.seoAuditJobs.setJobStage, {
        jobId: args.jobId,
        stage: "crawling",
      });
      const result = await runSeoAudit(job.normalizedUrl);

      await ctx.runMutation(internal.seoAuditJobs.setJobStage, {
        jobId: args.jobId,
        stage: "scoring",
      });
      const durationMs = Date.now() - startedAt;
      const sanitized = sanitizeAuditResult(result);
      const summary = summarizeAuditResult(sanitized, durationMs);

      await ctx.runMutation(internal.seoAuditJobs.finishJob, {
        jobId: args.jobId,
        result: sanitized,
        summary,
      });
    } catch (error) {
      await ctx.runMutation(internal.seoAuditJobs.failJob, {
        jobId: args.jobId,
        errorMessage: error instanceof Error ? error.message : "Audit failed.",
      });
    }
  },
});
