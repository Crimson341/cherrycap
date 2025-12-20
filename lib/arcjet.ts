import arcjet, { shield, detectBot, tokenBucket, validateEmail } from "@arcjet/next";

// Create a single Arcjet instance for the entire app
// See: https://docs.arcjet.com/reference/nextjs#single-instance
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // Track by IP address
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
    // Rate limiting using token bucket algorithm
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
    // Bot detection - allow legitimate bots, block the rest
    // Using allow list means all other bots are blocked by default
    detectBot({
      mode: "LIVE",
      allow: [
        // Search engines - important for SEO
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, DuckDuckGo, Yahoo, etc.
        
        // Social media preview crawlers - for link sharing
        "CATEGORY:PREVIEW", // Slack, Discord, Twitter, Facebook link previews
        "CATEGORY:SOCIAL", // Social media crawlers
        
        // Monitoring & uptime services
        "CATEGORY:MONITOR", // Uptime monitoring services
        
        // Feed readers
        "CATEGORY:FEEDFETCHER", // RSS readers
        
        // Vercel (for deployments and edge functions)
        "CATEGORY:VERCEL",
        
        // Specific useful tools
        "CURL", // curl for API testing
        "POSTMAN", // Postman for API testing
      ],
      // Note: When using allow list, all bots NOT in the list are blocked
      // This includes AI scrapers (CATEGORY:AI) by default
    }),
  ],
});

export default aj;

// Export a stricter config for sensitive routes (forms, chat, etc.)
export const ajStrict = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
    // Stricter rate limiting for forms
    tokenBucket({
      mode: "LIVE",
      refillRate: 2, // slower refill
      interval: 10,
      capacity: 5, // smaller capacity
    }),
    // Stricter bot detection - only allow search engines
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
  ],
});

// Export config with email validation for contact forms
export const ajEmailForm = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
    // Strict rate limiting for email forms (prevent spam)
    tokenBucket({
      mode: "LIVE",
      refillRate: 1, // very slow refill - 1 per interval
      interval: 60, // 1 minute
      capacity: 3, // max 3 emails per minute
    }),
    // Block all bots on email forms
    detectBot({
      mode: "LIVE",
      allow: [], // Block ALL bots on contact forms
    }),
    // Email validation - block disposable/invalid emails
    validateEmail({
      mode: "LIVE",
      block: [
        "DISPOSABLE", // Block disposable email addresses (temp-mail, etc.)
        "INVALID", // Block invalid email formats
        "NO_MX_RECORDS", // Block emails with no MX records (can't receive mail)
      ],
    }),
  ],
});

// Export config for AI chat routes (generous but protective)
// AI chats are expensive, so we rate limit to prevent abuse
export const ajAIChat = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
    // Rate limiting for AI chat - allow bursts but limit sustained usage
    // Uses token bucket for smooth rate limiting
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // refill 10 tokens per interval
      interval: 60, // every 60 seconds
      capacity: 20, // max burst of 20 requests
    }),
    // Block automated/bot access to AI chat
    detectBot({
      mode: "LIVE",
      allow: [], // Block ALL bots on AI chat endpoints
    }),
  ],
});
