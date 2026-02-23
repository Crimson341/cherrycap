import { mutation } from "./_generated/server";

// Seed mock analytics data for testing AI chat
export const seedMockAnalytics = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.tokenIdentifier;
    const now = Date.now();

    // Check if user already has a site
    const existingSite = await ctx.db
      .query("sites")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    let siteId: string;
    
    if (existingSite) {
      siteId = existingSite.siteId;
      console.log("Using existing site:", siteId);
    } else {
      // Create a test site
      siteId = `cc_${Math.random().toString(36).substring(2, 10)}`;
      await ctx.db.insert("sites", {
        userId,
        name: "My Business Website",
        domain: "mybusiness.com",
        siteId,
        createdAt: now,
        isActive: true,
      });
      console.log("Created test site:", siteId);
    }

    // Generate visitor IDs
    const visitorIds = Array.from({ length: 50 }, (_, i) => `visitor_${i}`);
    
    // Seed sessions for the last 7 days
    const devices = ["desktop", "mobile", "tablet"];
    const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
    const oses = ["Windows", "macOS", "iOS", "Android"];
    const referrerTypes = ["direct", "organic", "social", "referral", "email"];
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayStart = now - (6 - dayOffset) * 24 * 60 * 60 * 1000;
      
      // Create 10-30 sessions per day
      const sessionsPerDay = 10 + Math.floor(Math.random() * 20);
      
      for (let s = 0; s < sessionsPerDay; s++) {
        const sessionId = `session_${dayOffset}_${s}_${Math.random().toString(36).substring(2, 8)}`;
        const visitorId = visitorIds[Math.floor(Math.random() * visitorIds.length)];
        const sessionStart = dayStart + Math.floor(Math.random() * 20 * 60 * 60 * 1000);
        const pageCount = 1 + Math.floor(Math.random() * 5);
        const duration = pageCount * (30 + Math.floor(Math.random() * 120)) * 1000;
        const isBounce = pageCount === 1 && Math.random() > 0.5;
        
        // Create session
        await ctx.db.insert("sessions", {
          siteId,
          sessionId,
          visitorId,
          startTime: sessionStart,
          lastActivity: sessionStart + duration,
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          os: oses[Math.floor(Math.random() * oses.length)],
          country: "US",
          referrerType: referrerTypes[Math.floor(Math.random() * referrerTypes.length)],
          pageCount,
          duration,
          isBounce,
        });
        
        // Create page views for this session
        const pages = ["/", "/about", "/services", "/contact", "/pricing", "/blog", "/gallery"];
        for (let p = 0; p < pageCount; p++) {
          await ctx.db.insert("pageViews", {
            siteId,
            sessionId,
            path: pages[Math.floor(Math.random() * pages.length)],
            timestamp: sessionStart + p * 30000,
          });
        }
        
        // Create performance metrics (50% chance)
        if (Math.random() > 0.5) {
          await ctx.db.insert("performance", {
            siteId,
            sessionId,
            path: "/",
            timestamp: sessionStart,
            loadTime: 800 + Math.floor(Math.random() * 1500),
            ttfb: 100 + Math.floor(Math.random() * 300),
            fcp: 200 + Math.floor(Math.random() * 500),
            lcp: 500 + Math.floor(Math.random() * 1000),
          });
        }
      }
    }
    
    // Add some custom events
    const eventNames = ["button_click", "form_submit", "gallery_view", "video_play", "download"];
    for (let i = 0; i < 50; i++) {
      await ctx.db.insert("events", {
        siteId,
        sessionId: `session_event_${i}`,
        name: eventNames[Math.floor(Math.random() * eventNames.length)],
        timestamp: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    return { success: true, siteId, message: "Mock analytics data seeded successfully!" };
  },
});

// Add current user as superadmin and auto-verify them
export const makeMeSuperadmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated or no email");
    }

    // Security: Only allow if adminAllowlist is empty (bootstrap) or caller is already admin
    const allAdmins = await ctx.db.query("adminAllowlist").collect();
    if (allAdmins.length > 0) {
      const callerEntry = allAdmins.find((a) => a.email === identity.email);
      if (!callerEntry || (callerEntry.role !== "superadmin" && callerEntry.role !== "admin")) {
        throw new Error("Not authorized. Admin bootstrap is only available when no admins exist.");
      }
    }

    const now = Date.now();

    // Check if already in allowlist
    const existing = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!existing) {
      // Add to allowlist as superadmin
      await ctx.db.insert("adminAllowlist", {
        email: identity.email,
        role: "superadmin",
        addedBy: identity.subject,
        createdAt: now,
      });
    } else if (existing.role !== "superadmin") {
      await ctx.db.patch(existing._id, { role: "superadmin" });
    }

    // Also verify the user's profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isVerified: true,
        verifiedAt: now,
        verifiedBy: "self",
        verificationType: "staff",
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: identity.subject,
        isVerified: true,
        verifiedAt: now,
        verifiedBy: "self",
        verificationType: "staff",
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        marketingNotifications: false,
        theme: "dark",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Initialize user stats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!stats) {
      await ctx.db.insert("userStats", {
        userId: identity.subject,
        postsCount: 0,
        draftsCount: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        teamMembersCount: 0,
        updatedAt: now,
      });
    }

    return { 
      success: true, 
      email: identity.email,
      message: `${identity.email} is now a superadmin with verified status!`
    };
  },
});

// Clear all mock data for the current user
export const clearMockAnalytics = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.tokenIdentifier;

    // Get user's sites
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const site of sites) {
      // Delete all related data
      const sessions = await ctx.db.query("sessions").withIndex("by_siteId", (q) => q.eq("siteId", site.siteId)).collect();
      for (const s of sessions) await ctx.db.delete(s._id);

      const pageViews = await ctx.db.query("pageViews").withIndex("by_siteId", (q) => q.eq("siteId", site.siteId)).collect();
      for (const p of pageViews) await ctx.db.delete(p._id);

      const performance = await ctx.db.query("performance").withIndex("by_siteId", (q) => q.eq("siteId", site.siteId)).collect();
      for (const p of performance) await ctx.db.delete(p._id);

      const events = await ctx.db.query("events").withIndex("by_siteId", (q) => q.eq("siteId", site.siteId)).collect();
      for (const e of events) await ctx.db.delete(e._id);

      // Delete the site
      await ctx.db.delete(site._id);
    }

    return { success: true, message: "All mock data cleared!" };
  },
});
