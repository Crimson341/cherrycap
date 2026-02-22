import { v } from "convex/values";
import { query } from "./_generated/server";

// Get overview stats for a site
export const getOverviewStats = query({
  args: { 
    siteId: v.string(),
    days: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Verify site ownership
    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return null;
    }

    const days = args.days || 7;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get sessions in time range
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_siteId_startTime", (q) => 
        q.eq("siteId", args.siteId).gte("startTime", startTime)
      )
      .collect();

    // Get page views in time range
    const pageViews = await ctx.db
      .query("pageViews")
      .withIndex("by_siteId_timestamp", (q) =>
        q.eq("siteId", args.siteId).gte("timestamp", startTime)
      )
      .collect();

    // Get unique visitors
    const uniqueVisitors = new Set(sessions.map(s => s.visitorId)).size;

    // Calculate bounce rate
    const bounceSessions = sessions.filter(s => s.isBounce).length;
    const bounceRate = sessions.length > 0 
      ? Math.round((bounceSessions / sessions.length) * 100 * 10) / 10 
      : 0;

    // Calculate average session duration
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const avgDuration = sessions.length > 0 
      ? Math.round(totalDuration / sessions.length) 
      : 0;

    // Calculate pages per session
    const pagesPerSession = sessions.length > 0 
      ? Math.round((pageViews.length / sessions.length) * 10) / 10 
      : 0;

    return {
      visitors: uniqueVisitors,
      sessions: sessions.length,
      pageViews: pageViews.length,
      bounceRate,
      avgDuration,
      pagesPerSession,
    };
  },
});

// Get traffic over time
export const getTrafficOverTime = query({
  args: {
    siteId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return [];
    }

    const days = args.days || 7;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_siteId_startTime", (q) =>
        q.eq("siteId", args.siteId).gte("startTime", startTime)
      )
      .collect();

    const pageViews = await ctx.db
      .query("pageViews")
      .withIndex("by_siteId_timestamp", (q) =>
        q.eq("siteId", args.siteId).gte("timestamp", startTime)
      )
      .collect();

    // Group by day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: Record<string, { visitors: Set<string>; pageViews: number }> = {};

    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      data[key] = { visitors: new Set(), pageViews: 0 };
    }

    // Count sessions (visitors)
    for (const session of sessions) {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      if (data[date]) {
        if (session.visitorId) data[date].visitors.add(session.visitorId);
      }
    }

    // Count page views
    for (const pv of pageViews) {
      const date = new Date(pv.timestamp).toISOString().split('T')[0];
      if (data[date]) {
        data[date].pageViews++;
      }
    }

    return Object.entries(data).map(([date, stats]) => ({
      name: dayNames[new Date(date).getDay()],
      date,
      visitors: stats.visitors.size,
      pageViews: stats.pageViews,
    }));
  },
});

// Get traffic sources
export const getTrafficSources = query({
  args: {
    siteId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return [];
    }

    const days = args.days || 7;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_siteId_startTime", (q) =>
        q.eq("siteId", args.siteId).gte("startTime", startTime)
      )
      .collect();

    // Group by referrer type
    const sources: Record<string, number> = {
      'Direct': 0,
      'Organic Search': 0,
      'Social Media': 0,
      'Referral': 0,
      'Email': 0,
    };

    for (const session of sessions) {
      switch (session.referrerType) {
        case 'direct':
          sources['Direct']++;
          break;
        case 'organic':
          sources['Organic Search']++;
          break;
        case 'social':
          sources['Social Media']++;
          break;
        case 'referral':
          sources['Referral']++;
          break;
        case 'email':
          sources['Email']++;
          break;
        default:
          sources['Direct']++;
      }
    }

    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .filter(s => s.value > 0)
      .sort((a, b) => b.value - a.value);
  },
});

// Get device breakdown
export const getDeviceBreakdown = query({
  args: {
    siteId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return [];
    }

    const days = args.days || 7;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_siteId_startTime", (q) =>
        q.eq("siteId", args.siteId).gte("startTime", startTime)
      )
      .collect();

    const devices: Record<string, number> = {
      'Desktop': 0,
      'Mobile': 0,
      'Tablet': 0,
    };

    for (const session of sessions) {
      const device = session.device ? session.device.charAt(0).toUpperCase() + session.device.slice(1) : "Unknown";
      if (devices[device] !== undefined) {
        devices[device]++;
      }
    }

    return Object.entries(devices)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  },
});

// Get top pages
export const getTopPages = query({
  args: {
    siteId: v.string(),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return [];
    }

    const days = args.days || 7;
    const limit = args.limit || 10;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const pageViews = await ctx.db
      .query("pageViews")
      .withIndex("by_siteId_timestamp", (q) =>
        q.eq("siteId", args.siteId).gte("timestamp", startTime)
      )
      .collect();

    // Group by path
    const pages: Record<string, { views: number; sessions: Set<string> }> = {};

    for (const pv of pageViews) {
      if (!pages[pv.path]) {
        pages[pv.path] = { views: 0, sessions: new Set() };
      }
      pages[pv.path].views++;
      pages[pv.path].sessions.add(pv.sessionId);
    }

    return Object.entries(pages)
      .map(([page, stats]) => ({
        page,
        views: stats.views,
        uniqueVisitors: stats.sessions.size,
        avgTime: 0, // Would need more tracking to calculate this
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },
});

// Get performance metrics
export const getPerformanceMetrics = query({
  args: {
    siteId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return [];
    }

    const days = args.days || 7;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const metrics = await ctx.db
      .query("performance")
      .withIndex("by_siteId_timestamp", (q) =>
        q.eq("siteId", args.siteId).gte("timestamp", startTime)
      )
      .collect();

    // Group by day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: Record<string, { loadTime: number[]; ttfb: number[]; fcp: number[] }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      data[key] = { loadTime: [], ttfb: [], fcp: [] };
    }

    for (const m of metrics) {
      const date = new Date(m.timestamp).toISOString().split('T')[0];
      if (data[date]) {
        if (m.loadTime) data[date].loadTime.push(m.loadTime);
        if (m.ttfb) data[date].ttfb.push(m.ttfb);
        if (m.fcp) data[date].fcp.push(m.fcp);
      }
    }

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return Object.entries(data).map(([date, stats]) => ({
      name: dayNames[new Date(date).getDay()],
      date,
      loadTime: avg(stats.loadTime),
      ttfb: avg(stats.ttfb),
      fcp: avg(stats.fcp),
    }));
  },
});

// Get real-time active visitors (sessions active in last 5 minutes)
export const getActiveVisitors = query({
  args: { siteId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return 0;
    }

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const activeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .filter((q) => q.gte(q.field("lastActivity"), fiveMinutesAgo))
      .collect();

    return activeSessions.length;
  },
});

// Comprehensive analytics summary for AI assistant
export const getAnalyticsForAI = query({
  args: {
    siteId: v.optional(v.string()), // If not provided, get all user's sites
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user's sites
    const userSites = await ctx.db
      .query("sites")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();

    if (userSites.length === 0) {
      return {
        hasSites: false,
        message: "No sites registered yet. Add a site in the Sites dashboard to start tracking analytics.",
      };
    }

    // Filter to specific site if provided
    const sites = args.siteId 
      ? userSites.filter(s => s.siteId === args.siteId)
      : userSites;

    if (sites.length === 0) {
      return {
        hasSites: false,
        message: "Site not found or you don't have access to it.",
      };
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const sitePromises = sites.map(async (site) => {
      // Execute all 7 queries for a site concurrently
      const [
        sessions7d,
        sessions30d,
        pageViews7d,
        pageViews30d,
        performance7d,
        events7d,
        activeSessions
      ] = await Promise.all([
        ctx.db
          .query("sessions")
          .withIndex("by_siteId_startTime", (q) =>
            q.eq("siteId", site.siteId).gte("startTime", sevenDaysAgo)
          )
          .collect(),
        ctx.db
          .query("sessions")
          .withIndex("by_siteId_startTime", (q) =>
            q.eq("siteId", site.siteId).gte("startTime", thirtyDaysAgo)
          )
          .collect(),
        ctx.db
          .query("pageViews")
          .withIndex("by_siteId_timestamp", (q) =>
            q.eq("siteId", site.siteId).gte("timestamp", sevenDaysAgo)
          )
          .collect(),
        ctx.db
          .query("pageViews")
          .withIndex("by_siteId_timestamp", (q) =>
            q.eq("siteId", site.siteId).gte("timestamp", thirtyDaysAgo)
          )
          .collect(),
        ctx.db
          .query("performance")
          .withIndex("by_siteId_timestamp", (q) =>
            q.eq("siteId", site.siteId).gte("timestamp", sevenDaysAgo)
          )
          .collect(),
        ctx.db
          .query("events")
          .withIndex("by_siteId_timestamp", (q) =>
            q.eq("siteId", site.siteId).gte("timestamp", sevenDaysAgo)
          )
          .collect(),
        ctx.db
          .query("sessions")
          .withIndex("by_siteId", (q) => q.eq("siteId", site.siteId))
          .filter((q) => q.gte(q.field("lastActivity"), fiveMinutesAgo))
          .collect()
      ]);

      // Calculate metrics
      const uniqueVisitors7d = new Set(sessions7d.map(s => s.visitorId)).size;
      const uniqueVisitors30d = new Set(sessions30d.map(s => s.visitorId)).size;

      const bounceSessions7d = sessions7d.filter(s => s.isBounce).length;
      const bounceRate7d = sessions7d.length > 0 
        ? Math.round((bounceSessions7d / sessions7d.length) * 100 * 10) / 10 
        : 0;

      const totalDuration7d = sessions7d.reduce((sum, s) => sum + (s.duration ?? 0), 0);
      const avgSessionDuration7d = sessions7d.length > 0 
        ? Math.round(totalDuration7d / sessions7d.length / 1000) // Convert to seconds
        : 0;

      const pagesPerSession7d = sessions7d.length > 0 
        ? Math.round((pageViews7d.length / sessions7d.length) * 10) / 10 
        : 0;

      // Traffic sources
      const trafficSources: Record<string, number> = {};
      for (const session of sessions7d) {
        const source = session.referrerType || 'direct';
        trafficSources[source] = (trafficSources[source] || 0) + 1;
      }

      // Device breakdown
      const devices: Record<string, number> = {};
      for (const session of sessions7d) {
        const device = session.device || 'unknown';
        devices[device] = (devices[device] || 0) + 1;
      }

      // Top pages
      const pageViewCounts: Record<string, number> = {};
      for (const pv of pageViews7d) {
        pageViewCounts[pv.path] = (pageViewCounts[pv.path] || 0) + 1;
      }
      const topPages = Object.entries(pageViewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));

      // Performance averages
      const avgLoadTime = performance7d.length > 0
        ? Math.round(performance7d.reduce((sum, p) => sum + (p.loadTime || 0), 0) / performance7d.length)
        : 0;
      const avgTTFB = performance7d.length > 0
        ? Math.round(performance7d.reduce((sum, p) => sum + (p.ttfb || 0), 0) / performance7d.length)
        : 0;
      const avgFCP = performance7d.length > 0
        ? Math.round(performance7d.reduce((sum, p) => sum + (p.fcp || 0), 0) / performance7d.length)
        : 0;

      // Event breakdown
      const eventCounts: Record<string, number> = {};
      for (const event of events7d) {
        eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
      }
      const topEvents = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // Daily traffic for last 7 days
      const dailyTraffic: Record<string, { visitors: Set<string>; pageViews: number }> = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        dailyTraffic[key] = { visitors: new Set(), pageViews: 0 };
      }
      for (const session of sessions7d) {
        const date = new Date(session.startTime).toISOString().split('T')[0];
        if (dailyTraffic[date]) {
          if (session.visitorId) dailyTraffic[date].visitors.add(session.visitorId);
        }
      }
      for (const pv of pageViews7d) {
        const date = new Date(pv.timestamp).toISOString().split('T')[0];
        if (dailyTraffic[date]) {
          dailyTraffic[date].pageViews++;
        }
      }
      const trafficByDay = Object.entries(dailyTraffic).map(([date, data]) => ({
        date,
        visitors: data.visitors.size,
        pageViews: data.pageViews,
      }));

      return {
        site: {
          name: site.name,
          domain: site.domain,
          siteId: site.siteId,
        },
        activeNow: activeSessions.length,
        last7Days: {
          visitors: uniqueVisitors7d,
          sessions: sessions7d.length,
          pageViews: pageViews7d.length,
          bounceRate: bounceRate7d,
          avgSessionDuration: avgSessionDuration7d,
          pagesPerSession: pagesPerSession7d,
        },
        last30Days: {
          visitors: uniqueVisitors30d,
          sessions: sessions30d.length,
          pageViews: pageViews30d.length,
        },
        trafficSources,
        devices,
        topPages,
        performance: {
          avgLoadTime,
          avgTTFB,
          avgFCP,
        },
        topEvents,
        trafficByDay,
      };
    });

    const analyticsData = await Promise.all(sitePromises);

    return {
      hasSites: true,
      generatedAt: new Date().toISOString(),
      sites: analyticsData,
    };
  },
});
