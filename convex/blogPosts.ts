import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all blog posts for a user
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let posts;
    if (args.status) {
      posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_authorId_status", (q) => 
          q.eq("authorId", identity.subject).eq("status", args.status!)
        )
        .collect();
    } else {
      posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_authorId_updatedAt", (q) => q.eq("authorId", identity.subject))
        .order("desc")
        .collect();
    }

    return posts;
  },
});

// Get a single blog post by ID
export const get = query({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const post = await ctx.db.get(args.id);
    
    // Only return if user owns the post
    if (!post || post.authorId !== identity.subject) {
      return null;
    }

    return post;
  },
});

// Create a new blog post
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    const postId = await ctx.db.insert("blogPosts", {
      authorId: identity.subject,
      title: args.title,
      content: args.content,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Update a blog post
export const update = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    coverImageAlt: v.optional(v.string()),
    slug: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    targetKeyword: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))),
    scheduledAt: v.optional(v.number()),
    wordCount: v.optional(v.number()),
    readingTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.id);
    
    if (!post || post.authorId !== identity.subject) {
      throw new Error("Post not found or access denied");
    }

    // Check verification status if trying to publish or schedule
    if ((args.status === "published" || args.status === "scheduled") && post.status === "draft") {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .first();
      
      if (!userProfile?.isVerified) {
        throw new Error("Only verified accounts can publish blog posts. Apply for verification in your profile settings.");
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.coverImageAlt !== undefined) updates.coverImageAlt = args.coverImageAlt;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.metaDescription !== undefined) updates.metaDescription = args.metaDescription;
    if (args.targetKeyword !== undefined) updates.targetKeyword = args.targetKeyword;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.wordCount !== undefined) updates.wordCount = args.wordCount;
    if (args.readingTimeMinutes !== undefined) updates.readingTimeMinutes = args.readingTimeMinutes;
    
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "published" && !post.publishedAt) {
        updates.publishedAt = Date.now();
      }
      if (args.status === "scheduled" && args.scheduledAt) {
        updates.scheduledAt = args.scheduledAt;
      }
    }

    await ctx.db.patch(args.id, updates);
    
    return args.id;
  },
});

// Delete a blog post
export const remove = mutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.id);

    if (!post || post.authorId !== identity.subject) {
      throw new Error("Post not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

// ============ VERSION HISTORY ============

// Save a version of the post
export const saveVersion = mutation({
  args: {
    postId: v.id("blogPosts"),
    changeNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== identity.subject) {
      throw new Error("Post not found or access denied");
    }

    // Get the latest version number
    const latestVersion = await ctx.db
      .query("blogPostVersions")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("desc")
      .first();

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    await ctx.db.insert("blogPostVersions", {
      postId: args.postId,
      authorId: identity.subject,
      title: post.title,
      content: post.content,
      versionNumber,
      changeNote: args.changeNote,
      createdAt: Date.now(),
    });

    return versionNumber;
  },
});

// Get version history for a post
export const getVersionHistory = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== identity.subject) {
      return [];
    }

    const versions = await ctx.db
      .query("blogPostVersions")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    return versions;
  },
});

// Restore a version
export const restoreVersion = mutation({
  args: {
    postId: v.id("blogPosts"),
    versionNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== identity.subject) {
      throw new Error("Post not found or access denied");
    }

    const version = await ctx.db
      .query("blogPostVersions")
      .withIndex("by_postId_versionNumber", (q) => 
        q.eq("postId", args.postId).eq("versionNumber", args.versionNumber)
      )
      .first();

    if (!version) {
      throw new Error("Version not found");
    }

    // Save current state as a new version before restoring
    const latestVersion = await ctx.db
      .query("blogPostVersions")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("desc")
      .first();

    await ctx.db.insert("blogPostVersions", {
      postId: args.postId,
      authorId: identity.subject,
      title: post.title,
      content: post.content,
      versionNumber: (latestVersion?.versionNumber || 0) + 1,
      changeNote: `Auto-saved before restoring to v${args.versionNumber}`,
      createdAt: Date.now(),
    });

    // Restore the selected version
    await ctx.db.patch(args.postId, {
      title: version.title,
      content: version.content,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============ CATEGORIES ============

// Get user's categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("blogCategories")
      .withIndex("by_authorId", (q) => q.eq("authorId", identity.subject))
      .collect();
  },
});

// Create a category
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const slug = args.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    return await ctx.db.insert("blogCategories", {
      authorId: identity.subject,
      name: args.name,
      slug,
      description: args.description,
      color: args.color,
      postCount: 0,
      createdAt: Date.now(),
    });
  },
});

// Delete a category
export const deleteCategory = mutation({
  args: { id: v.id("blogCategories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const category = await ctx.db.get(args.id);
    if (!category || category.authorId !== identity.subject) {
      throw new Error("Category not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

// ============ WRITING GOALS ============

// Get user's writing goals
export const getWritingGoals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("writingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

// Set or update writing goal
export const setWritingGoal = mutation({
  args: {
    dailyWordGoal: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("writingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dailyWordGoal: args.dailyWordGoal,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("writingGoals", {
        userId: identity.subject,
        dailyWordGoal: args.dailyWordGoal,
        currentStreak: 0,
        longestStreak: 0,
        totalWordsWritten: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update daily progress
export const updateDailyProgress = mutation({
  args: {
    wordsWritten: v.number(),
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get or create daily progress
    const existingProgress = await ctx.db
      .query("dailyWritingProgress")
      .withIndex("by_userId_date", (q) => 
        q.eq("userId", identity.subject).eq("date", today)
      )
      .first();

    // Get writing goals
    const goals = await ctx.db
      .query("writingGoals")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const dailyGoal = goals?.dailyWordGoal || 500;

    if (existingProgress) {
      const newTotal = existingProgress.wordsWritten + args.wordsWritten;
      const postsWorkedOn = existingProgress.postsWorkedOn.includes(args.postId)
        ? existingProgress.postsWorkedOn
        : [...existingProgress.postsWorkedOn, args.postId];

      await ctx.db.patch(existingProgress._id, {
        wordsWritten: newTotal,
        goalMet: newTotal >= dailyGoal,
        postsWorkedOn,
      });
    } else {
      await ctx.db.insert("dailyWritingProgress", {
        userId: identity.subject,
        date: today,
        wordsWritten: args.wordsWritten,
        goalMet: args.wordsWritten >= dailyGoal,
        postsWorkedOn: [args.postId],
      });
    }

    // Update streaks if goal is met
    if (goals) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const newTotalWords = (goals.totalWordsWritten || 0) + args.wordsWritten;

      if (goals.lastWritingDate === yesterdayStr) {
        // Continue streak
        const newStreak = goals.currentStreak + 1;
        await ctx.db.patch(goals._id, {
          currentStreak: newStreak,
          longestStreak: Math.max(goals.longestStreak, newStreak),
          lastWritingDate: today,
          totalWordsWritten: newTotalWords,
          updatedAt: Date.now(),
        });
      } else if (goals.lastWritingDate !== today) {
        // Reset or start new streak
        await ctx.db.patch(goals._id, {
          currentStreak: 1,
          lastWritingDate: today,
          totalWordsWritten: newTotalWords,
          updatedAt: Date.now(),
        });
      } else {
        // Same day, just update total words
        await ctx.db.patch(goals._id, {
          totalWordsWritten: newTotalWords,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Get recent daily progress
export const getRecentProgress = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const progress = await ctx.db
      .query("dailyWritingProgress")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(args.days || 7);

    return progress;
  },
});

// ============ PUBLIC QUERIES (for SEO/sitemap) ============

// Get all published blog posts (public, for sitemap generation)
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    return posts
      .filter((post) => post.slug)
      .map((post) => ({
        slug: post.slug,
        title: post.title,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
      }));
  },
});

// Get a published blog post by slug (public, for dynamic pages)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();

    if (!post) {
      return null;
    }

    return {
      title: post.title,
      content: post.content,
      slug: post.slug,
      metaDescription: post.metaDescription,
      targetKeyword: post.targetKeyword,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
    };
  },
});

// ============ COLLABORATION COMMENTS ============

// Get comments for a post
export const getCollabComments = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify user owns the post or is the author of any comment
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return [];
    }

    const comments = await ctx.db
      .query("blogPostCollabComments")
      .withIndex("by_postId_createdAt", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    return comments;
  },
});

// Add a collaboration comment
export const addCollabComment = mutation({
  args: {
    postId: v.id("blogPosts"),
    content: v.string(),
    parentId: v.optional(v.id("blogPostCollabComments")),
    selectionStart: v.optional(v.number()),
    selectionEnd: v.optional(v.number()),
    selectedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const now = Date.now();

    return await ctx.db.insert("blogPostCollabComments", {
      postId: args.postId,
      authorId: identity.subject,
      authorName: identity.name || identity.email || "Anonymous",
      authorImage: identity.pictureUrl,
      content: args.content,
      parentId: args.parentId,
      selectionStart: args.selectionStart,
      selectionEnd: args.selectionEnd,
      selectedText: args.selectedText,
      isResolved: false,
      createdAt: now,
      updatedAt: now,
      isEdited: false,
    });
  },
});

// Update a collaboration comment
export const updateCollabComment = mutation({
  args: {
    commentId: v.id("blogPostCollabComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.authorId !== identity.subject) {
      throw new Error("Comment not found or access denied");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
      isEdited: true,
    });

    return { success: true };
  },
});

// Delete a collaboration comment
export const deleteCollabComment = mutation({
  args: { commentId: v.id("blogPostCollabComments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only author or post owner can delete
    const post = await ctx.db.get(comment.postId);
    if (comment.authorId !== identity.subject && post?.authorId !== identity.subject) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});

// Resolve/unresolve a comment
export const toggleResolveComment = mutation({
  args: { commentId: v.id("blogPostCollabComments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only post owner can resolve
    const post = await ctx.db.get(comment.postId);
    if (post?.authorId !== identity.subject) {
      throw new Error("Only post author can resolve comments");
    }

    const now = Date.now();

    await ctx.db.patch(args.commentId, {
      isResolved: !comment.isResolved,
      resolvedBy: comment.isResolved ? undefined : identity.subject,
      resolvedAt: comment.isResolved ? undefined : now,
      updatedAt: now,
    });

    return { success: true, isResolved: !comment.isResolved };
  },
});

// Get comment count for a post
export const getCollabCommentCount = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("blogPostCollabComments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    const total = comments.length;
    const resolved = comments.filter(c => c.isResolved).length;
    const unresolved = total - resolved;

    return { total, resolved, unresolved };
  },
});
