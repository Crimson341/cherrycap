import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a unique site ID
function generateSiteId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "cc_";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new site for tracking
export const createSite = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const siteId = generateSiteId();

    const id = await ctx.db.insert("sites", {
      userId: identity.tokenIdentifier,
      name: args.name,
      domain: args.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      siteId,
      createdAt: Date.now(),
      isActive: true,
    });

    return { id, siteId };
  },
});

// Get all sites for the current user
export const getUserSites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("sites")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();
  },
});

// Get a single site by ID
export const getSite = query({
  args: { siteId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    if (!site || site.userId !== identity.tokenIdentifier) {
      return null;
    }

    return site;
  },
});

// Update site settings
export const updateSite = mutation({
  args: {
    id: v.id("sites"),
    name: v.optional(v.string()),
    domain: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const site = await ctx.db.get(args.id);
    if (!site || site.userId !== identity.tokenIdentifier) {
      throw new Error("Site not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.domain !== undefined) {
      updates.domain = args.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    }
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete a site
export const deleteSite = mutation({
  args: { id: v.id("sites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const site = await ctx.db.get(args.id);
    if (!site || site.userId !== identity.tokenIdentifier) {
      throw new Error("Site not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Validate a site ID exists (used by tracking endpoints)
export const validateSiteId = query({
  args: { siteId: v.string() },
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query("sites")
      .withIndex("by_siteId", (q) => q.eq("siteId", args.siteId))
      .first();

    return site ? { valid: true, domain: site.domain, isActive: site.isActive } : { valid: false };
  },
});
