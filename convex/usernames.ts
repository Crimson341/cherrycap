import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if a username is available
export const checkAvailability = query({
  args: {
    username: v.string(),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = args.username.toLowerCase().trim();
    
    // Basic validation
    if (normalized.length < 3) {
      return { available: false, reason: "Username must be at least 3 characters" };
    }
    if (normalized.length > 20) {
      return { available: false, reason: "Username must be 20 characters or less" };
    }
    if (!/^[a-z0-9_]+$/.test(normalized)) {
      return { available: false, reason: "Only letters, numbers, and underscores allowed" };
    }

    // Check if username exists
    const existing = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();

    if (existing) {
      // If it's the current user's username, it's "available" for them
      if (args.currentUserId && existing.userId === args.currentUserId) {
        return { available: true, reason: "This is your current username" };
      }
      return { available: false, reason: "Username is taken" };
    }

    return { available: true, reason: "Username is available" };
  },
});

// Generate username suggestions based on a base name
export const getSuggestions = query({
  args: {
    baseName: v.string(),
  },
  handler: async (ctx, args) => {
    const base = args.baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (base.length < 2) {
      return [];
    }

    const suggestions: string[] = [];
    const maxSuggestions = 5;

    // Generate potential usernames
    const potentialNames = [
      base,
      `${base}${Math.floor(Math.random() * 100)}`,
      `${base}${Math.floor(Math.random() * 1000)}`,
      `${base}_`,
      `_${base}`,
      `${base}${new Date().getFullYear() % 100}`,
      `the${base}`,
      `${base}x`,
      `${base}hq`,
      `real${base}`,
      `${base}official`,
      `hey${base}`,
      `${base}${Math.floor(Math.random() * 10000)}`,
    ];

    // Check each potential name for availability
    for (const name of potentialNames) {
      if (suggestions.length >= maxSuggestions) break;
      
      const normalized = name.slice(0, 20); // Ensure max length
      if (normalized.length < 3) continue;

      const existing = await ctx.db
        .query("usernames")
        .withIndex("by_username", (q) => q.eq("username", normalized))
        .first();

      if (!existing && !suggestions.includes(normalized)) {
        suggestions.push(normalized);
      }
    }

    return suggestions;
  },
});

// Get current user's username
export const getUsername = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const username = await ctx.db
      .query("usernames")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return username;
  },
});

// Set or update username
export const setUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const normalized = args.username.toLowerCase().trim();
    const displayName = args.username.trim();

    // Validation
    if (normalized.length < 3) {
      return { success: false, error: "Username must be at least 3 characters" };
    }
    if (normalized.length > 20) {
      return { success: false, error: "Username must be 20 characters or less" };
    }
    if (!/^[a-z0-9_]+$/.test(normalized)) {
      return { success: false, error: "Only letters, numbers, and underscores allowed" };
    }

    // Check if username is taken by someone else
    const existing = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();

    if (existing && existing.userId !== userId) {
      return { success: false, error: "Username is already taken" };
    }

    // Check if user already has a username
    const currentUsername = await ctx.db
      .query("usernames")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (currentUsername) {
      // Check if username is actually changing
      if (currentUsername.username !== normalized) {
        // Enforce once-per-week rate limit for username changes
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        const lastChange = currentUsername.lastUsernameChange;
        
        if (lastChange && Date.now() - lastChange < ONE_WEEK_MS) {
          const nextChangeDate = new Date(lastChange + ONE_WEEK_MS);
          return { 
            success: false, 
            error: `You can only change your username once per week. Try again after ${nextChangeDate.toLocaleDateString()}`
          };
        }
      }

      // Update existing
      await ctx.db.patch(currentUsername._id, {
        username: normalized,
        displayName,
        updatedAt: Date.now(),
        // Only update lastUsernameChange if the username actually changed
        ...(currentUsername.username !== normalized && { lastUsernameChange: Date.now() }),
      });
    } else {
      // Create new
      await ctx.db.insert("usernames", {
        userId: userId,
        username: normalized,
        displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true, username: normalized };
  },
});

// Get username by username string (for public profiles, etc.)
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.username.toLowerCase().trim();
    
    const user = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .first();

    return user;
  },
});
