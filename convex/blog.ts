import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ LIKES ============

export const toggleLike = mutation({
  args: {
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    // Check if already liked
    const existing = await ctx.db
      .query("blogLikes")
      .withIndex("by_userId_postSlug", (q) =>
        q.eq("userId", userId).eq("postSlug", args.postSlug)
      )
      .first();

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);
      await updateStats(ctx, args.postSlug, "likesCount", -1);
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("blogLikes", {
        userId,
        postSlug: args.postSlug,
        createdAt: Date.now(),
      });
      await updateStats(ctx, args.postSlug, "likesCount", 1);
      return { liked: true };
    }
  },
});

export const hasLiked = query({
  args: {
    userId: v.optional(v.string()),
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;

    const existing = await ctx.db
      .query("blogLikes")
      .withIndex("by_userId_postSlug", (q) =>
        q.eq("userId", args.userId!).eq("postSlug", args.postSlug)
      )
      .first();

    return !!existing;
  },
});

// ============ BOOKMARKS ============

export const toggleBookmark = mutation({
  args: {
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("blogBookmarks")
      .withIndex("by_userId_postSlug", (q) =>
        q.eq("userId", userId).eq("postSlug", args.postSlug)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      await updateStats(ctx, args.postSlug, "bookmarksCount", -1);
      return { bookmarked: false };
    } else {
      await ctx.db.insert("blogBookmarks", {
        userId,
        postSlug: args.postSlug,
        createdAt: Date.now(),
      });
      await updateStats(ctx, args.postSlug, "bookmarksCount", 1);
      return { bookmarked: true };
    }
  },
});

export const hasBookmarked = query({
  args: {
    userId: v.optional(v.string()),
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;

    const existing = await ctx.db
      .query("blogBookmarks")
      .withIndex("by_userId_postSlug", (q) =>
        q.eq("userId", args.userId!).eq("postSlug", args.postSlug)
      )
      .first();

    return !!existing;
  },
});

export const getUserBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const bookmarks = await ctx.db
      .query("blogBookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return bookmarks.map((b) => b.postSlug);
  },
});

// ============ COMMENTS ============

export const addComment = mutation({
  args: {
    userName: v.string(),
    userImage: v.optional(v.string()),
    postSlug: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("blogComments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const commentId = await ctx.db.insert("blogComments", {
      userId,
      userName: args.userName,
      userImage: args.userImage,
      postSlug: args.postSlug,
      content: args.content,
      parentId: args.parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEdited: false,
      isDeleted: false,
    });

    await updateStats(ctx, args.postSlug, "commentsCount", 1);

    return commentId;
  },
});

export const editComment = mutation({
  args: {
    commentId: v.id("blogComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new Error("Not authorized to edit this comment");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
      isEdited: true,
    });

    return { success: true };
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("blogComments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new Error("Not authorized to delete this comment");
    }

    // Soft delete to preserve thread structure
    await ctx.db.patch(args.commentId, {
      isDeleted: true,
      content: "[This comment has been deleted]",
      updatedAt: Date.now(),
    });

    await updateStats(ctx, comment.postSlug, "commentsCount", -1);

    return { success: true };
  },
});

export const getComments = query({
  args: {
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("blogComments")
      .withIndex("by_postSlug_createdAt", (q) => q.eq("postSlug", args.postSlug))
      .order("desc")
      .collect();

    // Organize into threads (top-level and replies)
    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    return topLevel.map((comment) => ({
      ...comment,
      replies: replies
        .filter((r) => r.parentId === comment._id)
        .sort((a, b) => a.createdAt - b.createdAt),
    }));
  },
});

// ============ SHARES ============

export const trackShare = mutation({
  args: {
    userId: v.optional(v.string()),
    postSlug: v.string(),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("blogShares", {
      userId: args.userId,
      postSlug: args.postSlug,
      platform: args.platform,
      createdAt: Date.now(),
    });

    await updateStats(ctx, args.postSlug, "sharesCount", 1);

    return { success: true };
  },
});

// ============ STATS ============

export const getPostStats = query({
  args: {
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("blogStats")
      .withIndex("by_postSlug", (q) => q.eq("postSlug", args.postSlug))
      .first();

    return (
      stats || {
        postSlug: args.postSlug,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
      }
    );
  },
});

export const getMultiplePostStats = query({
  args: {
    postSlugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const statsMap: Record<
      string,
      {
        likesCount: number;
        commentsCount: number;
        sharesCount: number;
        bookmarksCount: number;
      }
    > = {};

    for (const slug of args.postSlugs) {
      const stats = await ctx.db
        .query("blogStats")
        .withIndex("by_postSlug", (q) => q.eq("postSlug", slug))
        .first();

      statsMap[slug] = stats || {
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
      };
    }

    return statsMap;
  },
});

// ============ HELPER FUNCTIONS ============

async function updateStats(
  ctx: any,
  postSlug: string,
  field: "likesCount" | "commentsCount" | "sharesCount" | "bookmarksCount",
  delta: number
) {
  const existing = await ctx.db
    .query("blogStats")
    .withIndex("by_postSlug", (q: any) => q.eq("postSlug", postSlug))
    .first();

  if (existing) {
    const newValue = Math.max(0, (existing[field] || 0) + delta);
    await ctx.db.patch(existing._id, { [field]: newValue });
  } else {
    await ctx.db.insert("blogStats", {
      postSlug,
      likesCount: field === "likesCount" ? Math.max(0, delta) : 0,
      commentsCount: field === "commentsCount" ? Math.max(0, delta) : 0,
      sharesCount: field === "sharesCount" ? Math.max(0, delta) : 0,
      bookmarksCount: field === "bookmarksCount" ? Math.max(0, delta) : 0,
    });
  }
}
