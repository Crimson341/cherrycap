import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

const SITE = "cherrycap" as const;

export const getJobForWorker = internalQuery({
  args: { jobId: v.id("seoAuditJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.site !== SITE) return null;
    return {
      normalizedUrl: job.normalizedUrl,
    };
  },
});
