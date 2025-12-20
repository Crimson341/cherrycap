import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user stats
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return stats;
  },
});

// Get current user's stats
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return stats;
  },
});

// Calculate and update user stats (called when relevant actions happen)
export const refresh = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = args.userId || identity.subject;

    // Count kanban boards (projects)
    const boards = await ctx.db
      .query("kanbanBoards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const projectsCount = boards.filter((b) => !b.isArchived).length;

    // Count blog posts
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .collect();
    const postsCount = posts.filter((p) => p.status === "published").length;
    const draftsCount = posts.filter((p) => p.status === "draft").length;

    // Count team members across all boards
    let teamMembersCount = 0;
    for (const board of boards) {
      if (board.members) {
        teamMembersCount += board.members.length;
      }
    }

    // Get likes count for user's posts
    const postSlugs = posts.map((p) => p.slug).filter(Boolean);
    let totalLikes = 0;
    let totalComments = 0;

    for (const slug of postSlugs) {
      if (!slug) continue;

      const likes = await ctx.db
        .query("blogLikes")
        .withIndex("by_postSlug", (q) => q.eq("postSlug", slug))
        .collect();
      totalLikes += likes.length;

      const comments = await ctx.db
        .query("blogComments")
        .withIndex("by_postSlug", (q) => q.eq("postSlug", slug))
        .collect();
      totalComments += comments.filter((c) => !c.isDeleted).length;
    }

    // TODO: Add view tracking once we have that table
    const totalViews = 0;

    // Upsert stats
    const existing = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const statsData = {
      userId,
      projectsCount,
      postsCount,
      draftsCount,
      totalViews,
      totalLikes,
      totalComments,
      teamMembersCount,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, statsData);
      return existing._id;
    } else {
      return await ctx.db.insert("userStats", statsData);
    }
  },
});

// Initialize stats for a new user
export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("userStats", {
      userId: identity.subject,
      projectsCount: 0,
      postsCount: 0,
      draftsCount: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      teamMembersCount: 0,
      updatedAt: Date.now(),
    });
  },
});
