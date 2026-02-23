import { action } from "./_generated/server";
import { v } from "convex/values";
import { anyApi } from "convex/server";

// Secure proxy to run internal mutations from trusted external backends (like Next.js API routes)
export const runInternalMutation = action({
  args: {
    serverSecret: v.string(),
    path: v.string(), // Format: "moduleName:functionName"
    args: v.any(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Missing CONVEX_SERVER_SECRET environment variable");
    }
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Unauthorized: Invalid Server Secret");
    }

    const pathParts = args.path.split(":");
    if (pathParts.length !== 2) {
      throw new Error(`Invalid path format: ${args.path}. Expected "module:function"`);
    }

    const [module, functionName] = pathParts;
    const ref = (anyApi as any)[module]?.[functionName];

    if (!ref) {
      throw new Error(`Internal mutation not found: ${args.path}`);
    }

    return await ctx.runMutation(ref, args.args);
  },
});

// Secure proxy to run internal queries from trusted external backends
export const runInternalQuery = action({
  args: {
    serverSecret: v.string(),
    path: v.string(), // Format: "moduleName:functionName"
    args: v.any(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Missing CONVEX_SERVER_SECRET environment variable");
    }
    if (args.serverSecret !== process.env.CONVEX_SERVER_SECRET) {
      throw new Error("Unauthorized: Invalid Server Secret");
    }

    const pathParts = args.path.split(":");
    if (pathParts.length !== 2) {
      throw new Error(`Invalid path format: ${args.path}. Expected "module:function"`);
    }

    const [module, functionName] = pathParts;
    const ref = (anyApi as any)[module]?.[functionName];

    if (!ref) {
      throw new Error(`Internal query not found: ${args.path}`);
    }

    return await ctx.runQuery(ref, args.args);
  },
});
