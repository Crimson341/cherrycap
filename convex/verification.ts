import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random approval token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Submit a verification request
export const submitRequest = mutation({
  args: {
    fullName: v.string(),
    phone: v.optional(v.string()),
    businessName: v.string(),
    businessType: v.union(
      v.literal("company"),
      v.literal("creator"),
      v.literal("agency"),
      v.literal("nonprofit"),
      v.literal("other")
    ),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    description: v.string(),
    socialLinks: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already has a pending request
    const existingRequest = await ctx.db
      .query("verificationRequests")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingRequest && existingRequest.status === "pending") {
      throw new Error("You already have a pending verification request");
    }

    // Check if already verified
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (profile?.isVerified) {
      throw new Error("Your account is already verified");
    }

    const now = Date.now();
    const approvalToken = generateToken();

    // Create the verification request
    const requestId = await ctx.db.insert("verificationRequests", {
      userId: identity.subject,
      email: identity.email || "",
      fullName: args.fullName,
      phone: args.phone,
      businessName: args.businessName,
      businessType: args.businessType,
      industry: args.industry,
      website: args.website,
      city: args.city,
      state: args.state,
      country: args.country,
      description: args.description,
      socialLinks: args.socialLinks,
      approvalToken,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Return the request ID and token for sending the email
    return { 
      success: true, 
      requestId,
      approvalToken,
      email: identity.email,
      fullName: args.fullName,
      businessName: args.businessName,
    };
  },
});

// Get current user's verification request
export const getMyRequest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("verificationRequests")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

// Get request by approval token (for API route)
export const getByToken = query({
  args: { token: v.string(), serverSecret: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET || args.serverSecret !== process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("verificationRequests")
      .withIndex("by_approvalToken", (q) => q.eq("approvalToken", args.token))
      .first();
  },
});

// Approve a request by token (called from API route)
export const approveByToken = mutation({
  args: { 
    token: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET || args.serverSecret !== process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db
      .query("verificationRequests")
      .withIndex("by_approvalToken", (q) => q.eq("approvalToken", args.token))
      .first();

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error(`Request already ${request.status}`);
    }

    const now = Date.now();

    // Update the request
    await ctx.db.patch(request._id, {
      status: "approved",
      reviewedBy: "email_link",
      reviewedAt: now,
      updatedAt: now,
    });

    // Determine verification type based on business type
    const verificationType = 
      request.businessType === "company" || request.businessType === "agency" 
        ? "company" as const
        : request.businessType === "creator" 
          ? "creator" as const
          : "partner" as const;

    // Update or create user profile with verification
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", request.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isVerified: true,
        verifiedAt: now,
        verifiedBy: "email_link",
        verificationType,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: request.userId,
        isVerified: true,
        verifiedAt: now,
        verifiedBy: "email_link",
        verificationType,
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        marketingNotifications: false,
        theme: "dark",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "system",
      title: "Verification Approved! 🍒",
      message: "Congratulations! Your account has been verified. You now have the cherry badge and can publish posts.",
      href: "/dashboard",
      isRead: false,
      createdAt: now,
    });

    return { 
      success: true, 
      businessName: request.businessName,
      email: request.email,
    };
  },
});

// Reject a request by token (called from API route)
export const rejectByToken = mutation({
  args: { 
    token: v.string(),
    reason: v.optional(v.string()),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET || args.serverSecret !== process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db
      .query("verificationRequests")
      .withIndex("by_approvalToken", (q) => q.eq("approvalToken", args.token))
      .first();

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error(`Request already ${request.status}`);
    }

    const now = Date.now();

    // Update the request
    await ctx.db.patch(request._id, {
      status: "rejected",
      reviewedBy: "email_link",
      reviewedAt: now,
      rejectionReason: args.reason || "Request not approved",
      updatedAt: now,
    });

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "system",
      title: "Verification Update",
      message: args.reason || "Your verification request was not approved at this time.",
      href: "/verify",
      isRead: false,
      createdAt: now,
    });

    return { 
      success: true, 
      businessName: request.businessName,
    };
  },
});

// Get all pending verification requests (admin only)
export const listPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    // Check if admin
    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return [];
    }

    return await ctx.db
      .query("verificationRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Get all verification requests (admin only)
export const listAllRequests = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return { requests: [], isAdmin: false };

    // Check if admin
    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      return { requests: [], isAdmin: false };
    }

    let requests;
    if (args.status) {
      requests = await ctx.db
        .query("verificationRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      requests = await ctx.db
        .query("verificationRequests")
        .collect();
    }

    // Sort by createdAt descending (newest first)
    requests.sort((a, b) => b.createdAt - a.createdAt);

    return { requests, isAdmin: true };
  },
});

// Check if current user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return false;

    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    return !!allowlistEntry && (allowlistEntry.role === "superadmin" || allowlistEntry.role === "admin");
  },
});

// Admin approve a request directly (without email token)
export const adminApprove = mutation({
  args: { 
    requestId: v.id("verificationRequests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    // Check if admin
    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error(`Request already ${request.status}`);
    }

    const now = Date.now();

    // Update the request
    await ctx.db.patch(request._id, {
      status: "approved",
      reviewedBy: identity.subject,
      reviewedAt: now,
      updatedAt: now,
    });

    // Determine verification type based on business type
    const verificationType = 
      request.businessType === "company" || request.businessType === "agency" 
        ? "company" as const
        : request.businessType === "creator" 
          ? "creator" as const
          : "partner" as const;

    // Update or create user profile with verification
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", request.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isVerified: true,
        verifiedAt: now,
        verifiedBy: identity.subject,
        verificationType,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: request.userId,
        isVerified: true,
        verifiedAt: now,
        verifiedBy: identity.subject,
        verificationType,
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        marketingNotifications: false,
        theme: "dark",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "system",
      title: "Verification Approved!",
      message: "Congratulations! Your account has been verified. You now have the cherry badge and can publish posts.",
      href: "/dashboard",
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

// Admin reject a request directly (without email token)
export const adminReject = mutation({
  args: { 
    requestId: v.id("verificationRequests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    // Check if admin
    const allowlistEntry = await ctx.db
      .query("adminAllowlist")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!allowlistEntry || (allowlistEntry.role !== "superadmin" && allowlistEntry.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error(`Request already ${request.status}`);
    }

    const now = Date.now();

    // Update the request
    await ctx.db.patch(request._id, {
      status: "rejected",
      reviewedBy: identity.subject,
      reviewedAt: now,
      rejectionReason: args.reason || "Request not approved",
      updatedAt: now,
    });

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: request.userId,
      type: "system",
      title: "Verification Update",
      message: args.reason || "Your verification request was not approved at this time.",
      href: "/verify",
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});
