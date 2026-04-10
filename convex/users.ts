import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const createOwner = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      email: args.email,
    });
  },
});
