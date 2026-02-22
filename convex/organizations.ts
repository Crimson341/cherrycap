import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============ PLAN CONFIGURATIONS ============

export const PLAN_LIMITS = {
  free: {
    maxSeats: 1,
    monthlyPageviews: 5000,
    monthlyAiQueries: 10,
    sites: 1,
    pricePerSeat: 0,
  },
  growth: {
    maxSeats: 5,
    monthlyPageviews: 100000,
    monthlyAiQueries: 200,
    sites: 5,
    pricePerSeat: 15, // $15/seat/month for additional seats
  },
  pro: {
    maxSeats: 25,
    monthlyPageviews: 500000,
    monthlyAiQueries: 1000,
    sites: -1, // unlimited
    pricePerSeat: 12, // $12/seat/month (volume discount)
  },
  business: {
    maxSeats: 100,
    monthlyPageviews: 2000000,
    monthlyAiQueries: -1, // unlimited
    sites: -1,
    pricePerSeat: 10, // $10/seat/month (enterprise discount)
  },
  enterprise: {
    maxSeats: -1, // unlimited
    monthlyPageviews: -1,
    monthlyAiQueries: -1,
    sites: -1,
    pricePerSeat: 8, // Custom pricing, this is base
  },
} as const;

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
} as const;

// ============ QUERIES ============

// Get organization by ID
export const get = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get organization by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get all organizations for a user (as owner or member)
export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;

    // Get orgs where user is owner
    const ownedOrgs = await ctx.db
      .query("organizations")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .collect();

    // Get orgs where user is a member
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const memberOrgIds = memberships.map((m) => m.organizationId);
    const memberOrgs = await Promise.all(
      memberOrgIds.map((id) => ctx.db.get(id))
    );

    // Combine and deduplicate
    const allOrgs = [...ownedOrgs, ...memberOrgs.filter(Boolean)];
    const uniqueOrgs = Array.from(
      new Map(allOrgs.map((org) => [org!._id, org])).values()
    );

    return uniqueOrgs;
  },
});

// Get members of an organization
export const getMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});

// Get pending invites for an organization
export const getPendingInvites = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationInvites")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// Get user's membership in an organization
export const getMembership = query({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();
  },
});

// Get invite by code
export const getInviteByCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite) return null;

    // Get organization details
    const org = await ctx.db.get(invite.organizationId);

    return { invite, organization: org };
  },
});

// Check if user can perform action based on role
export const checkPermission = query({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
    requiredRole: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org) return { allowed: false, reason: "Organization not found" };

    // Owner always has permission
    if (org.ownerId === args.userId) {
      return { allowed: true, role: "owner" as const };
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (!membership || membership.status !== "active") {
      return { allowed: false, reason: "Not a member of this organization" };
    }

    const userRoleLevel = ROLE_HIERARCHY[membership.role];
    const requiredRoleLevel = ROLE_HIERARCHY[args.requiredRole];

    if (userRoleLevel >= requiredRoleLevel) {
      return { allowed: true, role: membership.role };
    }

    return { allowed: false, reason: "Insufficient permissions" };
  },
});

// ============ MUTATIONS ============

// Create a new organization
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    plan: v.optional(
      v.union(
        v.literal("free"),
        v.literal("growth"),
        v.literal("pro"),
        v.literal("business"),
        v.literal("enterprise")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const ownerId = identity.subject;
    const ownerEmail = identity.email;
    const ownerName = identity.name;

    const plan = args.plan || "free";
    const limits = PLAN_LIMITS[plan];
    const now = Date.now();

    // Check if slug is already taken
    const existingSlug = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (existingSlug) {
      throw new Error("Organization slug is already taken");
    }

    // Create the organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug.toLowerCase(),
      ownerId: ownerId,
      plan,
      maxSeats: limits.maxSeats,
      currentSeats: 1, // Owner counts as first seat
      monthlyPageviewLimit: limits.monthlyPageviews,
      monthlyAiQueryLimit: limits.monthlyAiQueries,
      currentMonthPageviews: 0,
      currentMonthAiQueries: 0,
      usageResetDate: now + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      settings: {
        allowMemberInvites: true,
        requireApproval: false,
        defaultMemberRole: "member",
      },
      createdAt: now,
      updatedAt: now,
    });

    // Add owner as first member
    await ctx.db.insert("organizationMembers", {
      organizationId: orgId,
      userId: ownerId,
      email: ownerEmail || "",
      name: ownerName,
      role: "owner",
      status: "active",
      joinedAt: now,
    });

    // Log the creation
    await ctx.db.insert("organizationAuditLog", {
      organizationId: orgId,
      userId: ownerId,
      action: "organization.created",
      details: { name: args.name, plan },
      timestamp: now,
    });

    return orgId;
  },
});

// Invite a member to the organization
export const inviteMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member"),
      v.literal("viewer")
    ),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const inviterId = identity.subject;

    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new Error("Organization not found");

    // Check if inviter has permission
    const isOwner = org.ownerId === inviterId;
    if (!isOwner) {
      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_userId", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", inviterId)
        )
        .first();

      if (!membership || !["admin", "manager"].includes(membership.role)) {
        throw new Error("You don't have permission to invite members");
      }

      // Managers can only invite members/viewers
      if (membership.role === "manager" && ["admin", "manager"].includes(args.role)) {
        throw new Error("Managers can only invite members or viewers");
      }
    }

    // Check seat limit
    const limits = PLAN_LIMITS[org.plan];
    if (limits.maxSeats !== -1 && org.currentSeats >= limits.maxSeats) {
      throw new Error(
        `Seat limit reached. Your ${org.plan} plan allows ${limits.maxSeats} seats. Upgrade to add more team members.`
      );
    }

    // Check if already a member
    const existingMember = await ctx.db
      .query("organizationMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .first();

    if (existingMember) {
      throw new Error("This email is already a member of the organization");
    }

    // Check for existing pending invite
    const existingInvite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvite) {
      throw new Error("An invite is already pending for this email");
    }

    const now = Date.now();
    const inviteCode = generateInviteCode();

    const inviteId = await ctx.db.insert("organizationInvites", {
      organizationId: args.organizationId,
      email: args.email.toLowerCase(),
      role: args.role,
      invitedBy: inviterId,
      inviteCode,
      message: args.message,
      status: "pending",
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log the invite
    await ctx.db.insert("organizationAuditLog", {
      organizationId: args.organizationId,
      userId: inviterId,
      action: "member.invited",
      targetType: "invite",
      targetId: inviteId,
      details: { email: args.email, role: args.role },
      timestamp: now,
    });

    return { inviteId, inviteCode };
  },
});

// Accept an invitation
export const acceptInvite = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const email = identity.email;
    if (!email) throw new Error("User has no associated email address");

    const invite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite) throw new Error("Invalid invite code");
    if (invite.status !== "pending") throw new Error("This invite is no longer valid");
    if (Date.now() > invite.expiresAt) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("This invite has expired");
    }

    // Verify email matches (case-insensitive)
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("This invite was sent to a different email address");
    }

    const org = await ctx.db.get(invite.organizationId);
    if (!org) throw new Error("Organization not found");

    // Check seat limit again
    const limits = PLAN_LIMITS[org.plan];
    if (limits.maxSeats !== -1 && org.currentSeats >= limits.maxSeats) {
      throw new Error("Organization has reached its seat limit");
    }

    const now = Date.now();

    // Create membership
    await ctx.db.insert("organizationMembers", {
      organizationId: invite.organizationId,
      userId: userId,
      email: email.toLowerCase(),
      name: identity.name,
      avatar: identity.pictureUrl,
      role: invite.role,
      status: "active",
      invitedBy: invite.invitedBy,
      joinedAt: now,
    });

    // Update invite status
    await ctx.db.patch(invite._id, {
      status: "accepted",
      respondedAt: now,
    });

    // Increment seat count
    await ctx.db.patch(org._id, {
      currentSeats: org.currentSeats + 1,
      updatedAt: now,
    });

    // Log the join
    await ctx.db.insert("organizationAuditLog", {
      organizationId: invite.organizationId,
      userId: userId,
      action: "member.joined",
      details: { email: email, role: invite.role },
      timestamp: now,
    });

    return { success: true, organizationId: invite.organizationId };
  },
});

// Remove a member from the organization
export const removeMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    targetUserId: v.string(), // Who is being removed
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const removerId = identity.subject;

    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new Error("Organization not found");

    // Can't remove the owner
    if (args.targetUserId === org.ownerId) {
      throw new Error("Cannot remove the organization owner");
    }

    // Check remover permission
    const isOwner = org.ownerId === removerId;
    if (!isOwner) {
      const removerMembership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_userId", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", removerId)
        )
        .first();

      if (!removerMembership || !["admin", "manager"].includes(removerMembership.role)) {
        throw new Error("You don't have permission to remove members");
      }

      // Check if remover has higher role than target
      const targetMembership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_userId", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", args.targetUserId)
        )
        .first();

      if (targetMembership) {
        const removerLevel = ROLE_HIERARCHY[removerMembership.role];
        const targetLevel = ROLE_HIERARCHY[targetMembership.role];
        if (targetLevel >= removerLevel) {
          throw new Error("You cannot remove a member with equal or higher role");
        }
      }
    }

    // Find and delete membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.targetUserId)
      )
      .first();

    if (!membership) throw new Error("Member not found");

    const now = Date.now();

    await ctx.db.delete(membership._id);

    // Decrement seat count
    await ctx.db.patch(org._id, {
      currentSeats: Math.max(1, org.currentSeats - 1),
      updatedAt: now,
    });

    // Log the removal
    await ctx.db.insert("organizationAuditLog", {
      organizationId: args.organizationId,
      userId: removerId,
      action: "member.removed",
      targetType: "member",
      targetId: args.targetUserId,
      details: { email: membership.email, role: membership.role },
      timestamp: now,
    });

    return { success: true };
  },
});

// Update member role
export const updateMemberRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    targetUserId: v.string(),
    newRole: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updaterId = identity.subject;

    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new Error("Organization not found");

    // Can't change owner's role
    if (args.targetUserId === org.ownerId) {
      throw new Error("Cannot change the owner's role");
    }

    // Check updater permission
    const isOwner = org.ownerId === updaterId;
    if (!isOwner) {
      const updaterMembership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_userId", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", updaterId)
        )
        .first();

      if (!updaterMembership || updaterMembership.role !== "admin") {
        throw new Error("Only owners and admins can change member roles");
      }
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.targetUserId)
      )
      .first();

    if (!membership) throw new Error("Member not found");

    const oldRole = membership.role;
    const now = Date.now();

    await ctx.db.patch(membership._id, { role: args.newRole });

    // Log the change
    await ctx.db.insert("organizationAuditLog", {
      organizationId: args.organizationId,
      userId: updaterId,
      action: "member.role_updated",
      targetType: "member",
      targetId: args.targetUserId,
      details: { oldRole, newRole: args.newRole },
      timestamp: now,
    });

    return { success: true };
  },
});

// Update organization settings
export const updateSettings = mutation({
  args: {
    organizationId: v.id("organizations"),
    updates: v.object({
      name: v.optional(v.string()),
      logo: v.optional(v.string()),
      brandColor: v.optional(v.string()),
      billingEmail: v.optional(v.string()),
      settings: v.optional(
        v.object({
          allowMemberInvites: v.optional(v.boolean()),
          requireApproval: v.optional(v.boolean()),
          defaultMemberRole: v.optional(v.union(v.literal("member"), v.literal("viewer"))),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new Error("Organization not found");

    // Check permission (owner or admin only)
    const isOwner = org.ownerId === userId;
    if (!isOwner) {
      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_userId", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", userId)
        )
        .first();

      if (!membership || membership.role !== "admin") {
        throw new Error("Only owners and admins can update settings");
      }
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (args.updates.name !== undefined) updateData.name = args.updates.name;
    if (args.updates.logo !== undefined) updateData.logo = args.updates.logo;
    if (args.updates.brandColor !== undefined) updateData.brandColor = args.updates.brandColor;
    if (args.updates.billingEmail !== undefined) updateData.billingEmail = args.updates.billingEmail;

    if (args.updates.settings) {
      updateData.settings = {
        ...org.settings,
        ...args.updates.settings,
      };
    }

    await ctx.db.patch(args.organizationId, updateData);

    // Log the update
    await ctx.db.insert("organizationAuditLog", {
      organizationId: args.organizationId,
      userId: userId,
      action: "settings.updated",
      details: args.updates,
      timestamp: now,
    });

    return { success: true };
  },
});

// Helper function to generate invite codes
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
