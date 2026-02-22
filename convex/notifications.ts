import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get notifications for the current user
export const list = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let query = ctx.db
      .query("notifications")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", identity.subject))
      .order("desc");

    const notifications = await query.take(args.limit ?? 50);

    if (args.unreadOnly) {
      return notifications.filter((n) => !n.isRead);
    }

    return notifications;
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) => 
        q.eq("userId", identity.subject).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) => 
        q.eq("userId", identity.subject).eq("isRead", false)
      )
      .collect();

    const now = Date.now();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt: now,
      });
    }

    return { success: true, count: unread.length };
  },
});

// Create a notification (internal use)
export const create = internalMutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("mention"),
      v.literal("comment"),
      v.literal("like"),
      v.literal("follow"),
      v.literal("marketing"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    href: v.optional(v.string()),
    fromUserId: v.optional(v.string()),
    fromUserName: v.optional(v.string()),
    fromUserImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user wants this type of notification
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    // Respect notification preferences
    if (profile) {
      if (args.type === "mention" && !profile.mentionNotifications) return null;
      if (args.type === "marketing" && !profile.marketingNotifications) return null;
    }

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      href: args.href,
      fromUserId: args.fromUserId,
      fromUserName: args.fromUserName,
      fromUserImage: args.fromUserImage,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Send marketing notification to all users who opted in
export const sendMarketingNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    href: v.optional(v.string()),
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
      throw new Error("Unauthorized: Only verified staff members can send marketing notifications");
    }

    // Get all users who have marketing notifications enabled
    const profiles = await ctx.db
      .query("userProfiles")
      .collect();

    const eligibleUsers = profiles.filter((p) => p.marketingNotifications);

    const now = Date.now();
    let count = 0;

    for (const profile of eligibleUsers) {
      await ctx.db.insert("notifications", {
        userId: profile.userId,
        type: "marketing",
        title: args.title,
        message: args.message,
        href: args.href,
        isRead: false,
        createdAt: now,
      });
      count++;
    }

    return { success: true, sentCount: count };
  },
});

// Delete a notification
export const remove = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// Clear all notifications
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, count: notifications.length };
  },
});
