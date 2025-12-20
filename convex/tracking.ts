import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Track a page view
export const trackPageView = mutation({
  args: {
    siteId: v.string(),
    sessionId: v.string(),
    path: v.string(),
    referrer: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate site exists and is active
    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || !site.isActive) {
      return { success: false, error: "Invalid or inactive site" };
    }

    await ctx.db.insert("pageViews", {
      siteId: args.siteId,
      sessionId: args.sessionId,
      path: args.path,
      referrer: args.referrer,
      timestamp: Date.now(),
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
    });

    // Update session's last activity and page count
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActivity: Date.now(),
        pageCount: session.pageCount + 1,
        isBounce: false, // No longer a bounce if they view another page
      });
    }

    return { success: true };
  },
});

// Create or update a session
export const trackSession = mutation({
  args: {
    siteId: v.string(),
    sessionId: v.string(),
    visitorId: v.string(),
    device: v.string(),
    browser: v.string(),
    os: v.string(),
    country: v.optional(v.string()),
    referrer: v.optional(v.string()),
    referrerType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate site exists and is active
    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || !site.isActive) {
      return { success: false, error: "Invalid or inactive site" };
    }

    // Check if session already exists
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        lastActivity: Date.now(),
        duration: Math.floor((Date.now() - existingSession.startTime) / 1000),
      });
      return { success: true, isNew: false };
    }

    // Create new session
    await ctx.db.insert("sessions", {
      siteId: args.siteId,
      sessionId: args.sessionId,
      visitorId: args.visitorId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      device: args.device,
      browser: args.browser,
      os: args.os,
      country: args.country,
      referrer: args.referrer,
      referrerType: args.referrerType || "direct",
      pageCount: 1,
      duration: 0,
      isBounce: true, // Starts as bounce until they view another page
    });

    return { success: true, isNew: true };
  },
});

// Track performance metrics
export const trackPerformance = mutation({
  args: {
    siteId: v.string(),
    sessionId: v.string(),
    path: v.string(),
    lcp: v.optional(v.number()),
    fid: v.optional(v.number()),
    cls: v.optional(v.number()),
    fcp: v.optional(v.number()),
    ttfb: v.optional(v.number()),
    loadTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate site exists
    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || !site.isActive) {
      return { success: false, error: "Invalid or inactive site" };
    }

    await ctx.db.insert("performance", {
      siteId: args.siteId,
      sessionId: args.sessionId,
      path: args.path,
      timestamp: Date.now(),
      lcp: args.lcp,
      fid: args.fid,
      cls: args.cls,
      fcp: args.fcp,
      ttfb: args.ttfb,
      loadTime: args.loadTime,
    });

    return { success: true };
  },
});

// Track custom events
export const trackEvent = mutation({
  args: {
    siteId: v.string(),
    sessionId: v.string(),
    name: v.string(),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Validate site exists
    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || !site.isActive) {
      return { success: false, error: "Invalid or inactive site" };
    }

    await ctx.db.insert("events", {
      siteId: args.siteId,
      sessionId: args.sessionId,
      name: args.name,
      properties: args.properties,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// End a session (called when user leaves)
export const endSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActivity: Date.now(),
        duration: Math.floor((Date.now() - session.startTime) / 1000),
      });
    }

    return { success: true };
  },
});
