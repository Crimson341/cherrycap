import { MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";

const RATE_LIMITS = {
  message: { requests: 10, windowMs: 60000 },       // 10 per minute
  blog_post: { requests: 15, windowMs: 3600000 },     // 15 per hour
  api_call: { requests: 200, windowMs: 60000 },       // 200 per minute
  verification: { requests: 5, windowMs: 86400000 },  // 5 per day
  default: { requests: 60, windowMs: 60000 },         // 60 per minute
};

export type RateLimitAction = keyof typeof RATE_LIMITS | string;

export async function requireRateLimit(
  ctx: MutationCtx,
  userId: string,
  action: RateLimitAction
) {
  const actionKey = (action in RATE_LIMITS) ? (action as keyof typeof RATE_LIMITS) : "default";
  const limit = RATE_LIMITS[actionKey];
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  const requests = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_and_action_timestamp", (q) => 
      q.eq("userId", userId)
       .eq("action", action)
       .gt("timestamp", windowStart)
    )
    .collect();
    
  if (requests.length >= limit.requests) {
    const oldestRequest = requests.reduce((min, p) => p.timestamp < min.timestamp ? p : min, requests[0]);
    const retryAfter = oldestRequest.timestamp + limit.windowMs - now;
    
    throw new ConvexError({
      code: "RATE_LIMITED",
      message: `Too many requests for ${action}. Try again in ${Math.ceil(retryAfter / 1000)} seconds`,
    });
  }
  
  await ctx.db.insert("rateLimits", {
    userId,
    action,
    timestamp: now,
  });
}
