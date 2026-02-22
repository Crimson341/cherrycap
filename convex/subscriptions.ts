import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all subscriptions for a user
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get active subscription for a user
export const getActiveByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Find the first active subscription
    return subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "on_trial"
    );
  },
});

// Get subscription by Lemon Squeezy subscription ID
export const getByLemonSqueezyId = query({
  args: { lemonSqueezySubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();
  },
});

// Get subscriptions for an organization
export const getByOrganizationId = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});

// Check if user has an active AI subscription
export const hasActiveAISubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Check if any subscription is active and is an AI product
    return subscriptions.some(
      (sub) =>
        (sub.status === "active" || sub.status === "on_trial") &&
        sub.productName.toLowerCase().includes("ai")
    );
  },
});

// Create a new subscription (called by webhook)
export const create = mutation({
  args: {
    userId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    lemonSqueezySubscriptionId: v.string(),
    lemonSqueezyCustomerId: v.string(),
    lemonSqueezyOrderId: v.optional(v.string()),
    lemonSqueezyProductId: v.string(),
    lemonSqueezyVariantId: v.string(),
    productName: v.string(),
    variantName: v.string(),
    status: v.string(),
    billingAnchor: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    renewsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    cardBrand: v.optional(v.string()),
    cardLastFour: v.optional(v.string()),
    updatePaymentMethodUrl: v.optional(v.string()),
    customerPortalUrl: v.optional(v.string()),
    isPaused: v.boolean(),
    isUsageBased: v.optional(v.boolean()),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");
    const now = Date.now();

    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    // If linked to an organization, update the org's billing info
    if (args.organizationId) {
      await ctx.db.patch(args.organizationId, {
        lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
        lemonSqueezySubscriptionId: args.lemonSqueezySubscriptionId,
        lemonSqueezySubscriptionStatus: args.status,
        updatedAt: now,
      });
    }

    return subscriptionId;
  },
});

// Update subscription (called by webhook)
export const update = mutation({
  args: {
    lemonSqueezySubscriptionId: v.string(),
    status: v.optional(v.string()),
    renewsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cardBrand: v.optional(v.string()),
    cardLastFour: v.optional(v.string()),
    updatePaymentMethodUrl: v.optional(v.string()),
    customerPortalUrl: v.optional(v.string()),
    isPaused: v.optional(v.boolean()),
    productName: v.optional(v.string()),
    variantName: v.optional(v.string()),
    lemonSqueezyVariantId: v.optional(v.string()),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${args.lemonSqueezySubscriptionId}`
      );
    }

    const { lemonSqueezySubscriptionId, ...updateData } = args;
    const filteredUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(subscription._id, {
      ...filteredUpdate,
      updatedAt: Date.now(),
    });

    // Update organization if linked
    if (subscription.organizationId && args.status) {
      await ctx.db.patch(subscription.organizationId, {
        lemonSqueezySubscriptionStatus: args.status,
        updatedAt: Date.now(),
      });
    }

    return subscription._id;
  },
});

// Cancel subscription (mark as cancelled)
export const cancel = mutation({
  args: {
    lemonSqueezySubscriptionId: v.string(),
    endsAt: v.optional(v.number()),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${args.lemonSqueezySubscriptionId}`
      );
    }

    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      endsAt: args.endsAt,
      updatedAt: Date.now(),
    });

    // Update organization if linked
    if (subscription.organizationId) {
      await ctx.db.patch(subscription.organizationId, {
        lemonSqueezySubscriptionStatus: "cancelled",
        updatedAt: Date.now(),
      });
    }

    return subscription._id;
  },
});

// Expire subscription
export const expire = mutation({
  args: {
    lemonSqueezySubscriptionId: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${args.lemonSqueezySubscriptionId}`
      );
    }

    await ctx.db.patch(subscription._id, {
      status: "expired",
      updatedAt: Date.now(),
    });

    // Update organization if linked - downgrade to free plan
    if (subscription.organizationId) {
      const org = await ctx.db.get(subscription.organizationId);
      if (org) {
        await ctx.db.patch(subscription.organizationId, {
          plan: "free",
          lemonSqueezySubscriptionStatus: "expired",
          updatedAt: Date.now(),
        });
      }
    }

    return subscription._id;
  },
});

// Pause subscription
export const pause = mutation({
  args: {
    lemonSqueezySubscriptionId: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${args.lemonSqueezySubscriptionId}`
      );
    }

    await ctx.db.patch(subscription._id, {
      status: "paused",
      isPaused: true,
      updatedAt: Date.now(),
    });

    // Update organization if linked
    if (subscription.organizationId) {
      await ctx.db.patch(subscription.organizationId, {
        lemonSqueezySubscriptionStatus: "paused",
        updatedAt: Date.now(),
      });
    }

    return subscription._id;
  },
});

// Resume subscription
export const resume = mutation({
  args: {
    lemonSqueezySubscriptionId: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${args.lemonSqueezySubscriptionId}`
      );
    }

    await ctx.db.patch(subscription._id, {
      status: "active",
      isPaused: false,
      updatedAt: Date.now(),
    });

    // Update organization if linked
    if (subscription.organizationId) {
      await ctx.db.patch(subscription.organizationId, {
        lemonSqueezySubscriptionStatus: "active",
        updatedAt: Date.now(),
      });
    }

    return subscription._id;
  },
});

// Update payment status (for failed payments)
export const updatePaymentStatus = mutation({
  args: {
    lemonSqueezySubscriptionId: v.string(),
    status: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) throw new Error("Missing CONVEX_SERVER_SECRET");
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemonSqueezySubscriptionId", (q) =>
        q.eq("lemonSqueezySubscriptionId", args.lemonSqueezySubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${args.lemonSqueezySubscriptionId}`
      );
    }

    await ctx.db.patch(subscription._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Update organization if linked
    if (subscription.organizationId) {
      await ctx.db.patch(subscription.organizationId, {
        lemonSqueezySubscriptionStatus: args.status,
        updatedAt: Date.now(),
      });
    }

    return subscription._id;
  },
});
