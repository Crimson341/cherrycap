import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Subscribe to newsletter
export const subscribe = mutation({
  args: {
    email: v.string(),
    userId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    source: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      // Reactivate if previously unsubscribed
      if (!existing.isActive) {
        await ctx.db.patch(existing._id, {
          isActive: true,
          subscribedAt: Date.now(),
          unsubscribedAt: undefined,
          source: args.source,
          tags: args.tags || existing.tags,
        });
        return { success: true, reactivated: true };
      }
      return { success: false, error: "Already subscribed" };
    }

    // Create new subscriber
    await ctx.db.insert("newsletterSubscribers", {
      email: args.email.toLowerCase(),
      userId: args.userId,
      firstName: args.firstName,
      subscribedAt: Date.now(),
      isActive: true,
      source: args.source,
      tags: args.tags,
    });

    return { success: true, reactivated: false };
  },
});

// Unsubscribe from newsletter
export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!subscriber) {
      return { success: false, error: "Email not found" };
    }

    await ctx.db.patch(subscriber._id, {
      isActive: false,
      unsubscribedAt: Date.now(),
    });

    return { success: true };
  },
});

// Check if email is subscribed
export const isSubscribed = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    return subscriber?.isActive ?? false;
  },
});

// Get subscriber count
export const getSubscriberCount = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return subscribers.length;
  },
});

// Get subscribers by tag
export const getSubscribersByTag = query({
  args: {
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return [];
    }

    const allSubscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return allSubscribers.filter(
      (sub) => sub.tags?.includes(args.tag)
    );
  },
});

// Update subscriber tags/preferences
export const updatePreferences = mutation({
  args: {
    email: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!subscriber) {
      return { success: false, error: "Subscriber not found" };
    }

    await ctx.db.patch(subscriber._id, {
      tags: args.tags,
    });

    return { success: true };
  },
});

// Get newsletter stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return null;

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return null;
    }

    const allSubscribers = await ctx.db
      .query("newsletterSubscribers")
      .collect();

    const activeSubscribers = allSubscribers.filter((s) => s.isActive);
    
    const bySource: Record<string, number> = {};
    activeSubscribers.forEach((s) => {
      bySource[s.source] = (bySource[s.source] || 0) + 1;
    });

    const byTag: Record<string, number> = {};
    activeSubscribers.forEach((s) => {
      s.tags?.forEach((tag) => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });
    });

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSubscribers = activeSubscribers.filter(
      (s) => s.subscribedAt > thirtyDaysAgo
    ).length;

    return {
      total: activeSubscribers.length,
      inactive: allSubscribers.length - activeSubscribers.length,
      recentSubscribers,
      bySource,
      byTag,
    };
  },
});
