import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// ============ QUERIES ============

// Get user's credit balance
export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!credits) {
      return {
        balance: 0,
        totalPurchased: 0,
        totalUsed: 0,
      };
    }

    return {
      balance: credits.balance,
      totalPurchased: credits.totalPurchased,
      totalUsed: credits.totalUsed,
    };
  },
});

// Get user's transaction history
export const getTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const limit = args.limit || 50;

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Get available credit packages
export const getPackages = query({
  args: {},
  handler: async (ctx) => {
    const packages = await ctx.db
      .query("creditPackages")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return packages.sort((a, b) => a.order - b.order);
  },
});

// Check if user has enough credits
export const hasCredits = query({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const userId = identity.subject;
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!credits) return false;
    return credits.balance >= args.amount;
  },
});

// ============ MUTATIONS ============

// Initialize credits for a new user (called on first use)
export const initializeCredits = mutation({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    // Check if already initialized
    const existing = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    const bonusAmount = 100; // Hardcoded $1 bonus for new users, removing public override vulnerability

    // Create credit record
    const creditId = await ctx.db.insert("userCredits", {
      userId,
      balance: bonusAmount,
      totalPurchased: 0,
      totalUsed: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Record the bonus transaction
    if (bonusAmount > 0) {
      await ctx.db.insert("creditTransactions", {
        userId,
        type: "bonus",
        amount: bonusAmount,
        balanceAfter: bonusAmount,
        description: "Welcome bonus credits",
        createdAt: now,
      });
    }

    return creditId;
  },
});

// Deduct credits for usage (called from secure API routes)
export const deductCredits = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    feature: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    actualCostUSD: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Deduction amount must be positive");
    }

    const userId = args.userId;

    // Get current balance
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!credits) {
      throw new Error("No credits found. Please purchase credits first.");
    }

    if (credits.balance < args.amount) {
      throw new Error("Insufficient credits");
    }

    const now = Date.now();
    const newBalance = credits.balance - args.amount;

    // Update balance
    await ctx.db.patch(credits._id, {
      balance: newBalance,
      totalUsed: credits.totalUsed + args.amount,
      updatedAt: now,
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      type: "usage",
      amount: -args.amount,
      balanceAfter: newBalance,
      usageDetails: {
        feature: args.feature,
        model: args.model,
        promptTokens: args.promptTokens,
        completionTokens: args.completionTokens,
        actualCostUSD: args.actualCostUSD,
      },
      description: `${args.feature} - ${args.model}`,
      createdAt: now,
    });

    return { success: true, newBalance };
  },
});

// Add credits from purchase (called from webhook)
// Note: Brought back to internalMutation securely through the http proxy.
export const addCreditsFromPurchase = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    provider: v.string(),
    orderId: v.string(),
    productId: v.optional(v.string()),
    amountPaidUSD: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Purchase amount must be positive");
    }

    const now = Date.now();

    // Get or create credit record
    let credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!credits) {
      // Initialize credits for this user
      const creditId = await ctx.db.insert("userCredits", {
        userId: args.userId,
        balance: args.amount,
        totalPurchased: args.amount,
        totalUsed: 0,
        createdAt: now,
        updatedAt: now,
      });
      credits = await ctx.db.get(creditId);
    } else {
      // Update existing balance
      await ctx.db.patch(credits._id, {
        balance: credits.balance + args.amount,
        totalPurchased: credits.totalPurchased + args.amount,
        updatedAt: now,
      });
    }

    const newBalance = (credits?.balance || 0) + args.amount;

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: "purchase",
      amount: args.amount,
      balanceAfter: newBalance,
      purchaseDetails: {
        provider: args.provider,
        orderId: args.orderId,
        productId: args.productId,
        amountPaidUSD: args.amountPaidUSD,
      },
      description: args.description,
      createdAt: now,
    });

    return { success: true, newBalance };
  },
});

// Add bonus credits (admin function)
export const addBonusCredits = mutation({
  args: {
    targetUserId: v.string(),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Admin check: ensure the caller is verified staff
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile || !adminProfile.isVerified || adminProfile.verificationType !== "staff") {
      throw new Error("Unauthorized: Only verified staff members can grant bonus credits");
    }

    if (args.amount <= 0) throw new Error("Bonus amount must be positive");

    const now = Date.now();

    let credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .first();

    let newBalance: number;

    if (!credits) {
      // Create new credit record with the bonus amount
      await ctx.db.insert("userCredits", {
        userId: args.targetUserId,
        balance: args.amount,
        totalPurchased: 0,
        totalUsed: 0,
        createdAt: now,
        updatedAt: now,
      });
      newBalance = args.amount;
    } else {
      // Update existing balance
      newBalance = credits.balance + args.amount;
      await ctx.db.patch(credits._id, {
        balance: newBalance,
        updatedAt: now,
      });
    }

    await ctx.db.insert("creditTransactions", {
      userId: args.targetUserId,
      type: "bonus",
      amount: args.amount,
      balanceAfter: newBalance,
      description: args.reason,
      createdAt: now,
    });

    return { success: true, newBalance };
  },
});

// ============ ADMIN: PACKAGE MANAGEMENT ============

// Create a credit package (admin)
export const createPackage = mutation({
  args: {
    name: v.string(),
    credits: v.number(),
    priceUSD: v.number(),
    bonusCredits: v.number(),
    description: v.string(),
    isPopular: v.boolean(),
    stripePriceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Admin check: ensure the caller is verified staff
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile || !adminProfile.isVerified || adminProfile.verificationType !== "staff") {
      throw new Error("Unauthorized: Only verified staff members can create credit packages");
    }

    // Get highest order
    const packages = await ctx.db.query("creditPackages").collect();
    const maxOrder = packages.reduce((max, p) => Math.max(max, p.order), 0);

    const now = Date.now();

    return await ctx.db.insert("creditPackages", {
      name: args.name,
      credits: args.credits,
      priceUSD: args.priceUSD,
      bonusCredits: args.bonusCredits,
      description: args.description,
      isPopular: args.isPopular,
      isActive: true,
      stripePriceId: args.stripePriceId,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Seed default packages
export const seedDefaultPackages = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Admin check: ensure the caller is verified staff
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile || !adminProfile.isVerified || adminProfile.verificationType !== "staff") {
      throw new Error("Unauthorized: Only verified staff members can seed packages");
    }

    // Check if packages already exist
    const existing = await ctx.db.query("creditPackages").first();
    if (existing) {
      return { message: "Packages already exist" };
    }

    const now = Date.now();

    const packages = [
      {
        name: "Starter Pack",
        credits: 500, // 500
        priceUSD: 1000, // $10.00
        bonusCredits: 0,
        description: "Perfect for trying out AI features",
        isPopular: false,
        stripePriceId: "price_1T3kQSGlD0hw5URUrzSsTem2",
        order: 1,
      },
      {
        name: "Pro Pack",
        credits: 1200, // 1200
        priceUSD: 3000, // $30.00
        bonusCredits: 200, // Show off bonus 
        description: "Best value for regular creators",
        isPopular: true,
        stripePriceId: "price_1T3kSCGlD0hw5URUt81VFiSj",
        order: 2,
      },
      {
        name: "Studio Pack",
        credits: 3000, // 3000
        priceUSD: 8000, // $80.00
        bonusCredits: 600, // Show off bonus
        description: "For power users and teams",
        isPopular: false,
        stripePriceId: "price_1T3kU8GlD0hw5URUaPaVm5SG",
        order: 3,
      },
    ];

    for (const pkg of packages) {
      await ctx.db.insert("creditPackages", {
        ...pkg,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { message: "Default packages created", count: packages.length };
  },
});
