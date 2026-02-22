import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user profile
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return profile;
  },
});

// Get current user's profile
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
    
    return profile;
  },
});

// Create or update user profile
export const upsert = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    mentionNotifications: v.optional(v.boolean()),
    marketingNotifications: v.optional(v.boolean()),
    theme: v.optional(v.union(v.literal("dark"), v.literal("light"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing profile
      const updates: Record<string, unknown> = { updatedAt: now };
      
      if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications;
      if (args.pushNotifications !== undefined) updates.pushNotifications = args.pushNotifications;
      if (args.mentionNotifications !== undefined) updates.mentionNotifications = args.mentionNotifications;
      if (args.marketingNotifications !== undefined) updates.marketingNotifications = args.marketingNotifications;
      if (args.theme !== undefined) updates.theme = args.theme;
      
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create new profile with defaults
      const profileId = await ctx.db.insert("userProfiles", {
        userId: identity.subject,
        isVerified: false,
        emailNotifications: args.emailNotifications ?? true,
        pushNotifications: args.pushNotifications ?? true,
        mentionNotifications: args.mentionNotifications ?? true,
        marketingNotifications: args.marketingNotifications ?? false,
        theme: args.theme ?? "dark",
        createdAt: now,
        updatedAt: now,
      });
      return profileId;
    }
  },
});

// Check if a user is verified (for displaying cherry badge)
export const isVerified = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return profile?.isVerified ?? false;
  },
});

// Admin: Verify a user (give them the cherry badge)
export const verifyUser = mutation({
  args: {
    userId: v.string(),
    verificationType: v.union(
      v.literal("company"),
      v.literal("creator"),
      v.literal("partner"),
      v.literal("staff")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Admin check: ensure the caller is verified staff
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile || !adminProfile.isVerified || adminProfile.verificationType !== "staff") {
      // Allow the VERY first verified staff member to be created locally without this check if the DB is empty (initial bootstrap fallback)
      const anyStaffProfile = await ctx.db
        .query("userProfiles")
        .filter(q => q.eq(q.field("verificationType"), "staff"))
        .first();
        
      if (anyStaffProfile) {
        throw new Error("Unauthorized: Only verified staff members can grant verifications");
      }
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isVerified: true,
        verifiedAt: now,
        verifiedBy: identity.subject,
        verificationType: args.verificationType,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        isVerified: true,
        verifiedAt: now,
        verifiedBy: identity.subject,
        verificationType: args.verificationType,
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        marketingNotifications: false,
        theme: "dark",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Get pinned sidebar items
export const getPinnedItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return profile?.pinnedItems ?? [];
  },
});

// Pin a sidebar item
export const pinItem = mutation({
  args: { href: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const now = Date.now();

    if (existing) {
      const currentPinned = existing.pinnedItems ?? [];
      // Don't add duplicates
      if (!currentPinned.includes(args.href)) {
        await ctx.db.patch(existing._id, {
          pinnedItems: [...currentPinned, args.href],
          updatedAt: now,
        });
      }
      return existing._id;
    } else {
      // Create profile with pinned item
      const profileId = await ctx.db.insert("userProfiles", {
        userId: identity.subject,
        isVerified: false,
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        marketingNotifications: false,
        theme: "dark",
        pinnedItems: [args.href],
        createdAt: now,
        updatedAt: now,
      });
      return profileId;
    }
  },
});

// Unpin a sidebar item
export const unpinItem = mutation({
  args: { href: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing && existing.pinnedItems) {
      const updatedPinned = existing.pinnedItems.filter((href) => href !== args.href);
      await ctx.db.patch(existing._id, {
        pinnedItems: updatedPinned,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Reorder pinned items
export const reorderPinnedItems = mutation({
  args: { pinnedItems: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        pinnedItems: args.pinnedItems,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
