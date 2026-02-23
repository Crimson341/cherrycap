import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { Doc } from "../_generated/dataModel";

export type AdminRole = "superadmin" | "admin" | "auto_verify";

const adminRoleHierarchy: Record<AdminRole, number> = {
  auto_verify: 0,
  admin: 1,
  superadmin: 2,
};

export async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  // Try to find full profile
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();

  return { identity, profile };
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getUser(ctx);
  if (!user || !user.identity) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Authentication required",
    });
  }
  return user;
}

export async function getAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) return null;
  
  return await ctx.db
    .query("adminAllowlist")
    .withIndex("by_email", (q) => q.eq("email", identity.email as string))
    .unique();
}

export async function requireAdminRole(
  ctx: QueryCtx | MutationCtx, 
  minRole: AdminRole = "admin"
) {
  const admin = await getAdmin(ctx);
  
  if (!admin) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Admin authentication required",
    });
  }
  
  const userRoleLevel = adminRoleHierarchy[admin.role as AdminRole] ?? 0;
  const requiredLevel = adminRoleHierarchy[minRole];
  
  if (userRoleLevel < requiredLevel) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `Role '${minRole}' or higher required`,
    });
  }
  
  const user = await getUser(ctx);
  
  return { admin, user };
}
