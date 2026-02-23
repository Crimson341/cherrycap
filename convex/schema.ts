import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============ ORGANIZATIONS / TEAMS ============

  // Organizations (business accounts)
  organizations: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly unique identifier
    ownerId: v.string(), // Clerk user ID of the owner
    
    // Branding
    logo: v.optional(v.string()), // URL to logo image
    brandColor: v.optional(v.string()), // Hex color for white-labeling
    
    // Plan & Billing
    plan: v.union(
      v.literal("free"),
      v.literal("growth"),
      v.literal("pro"),
      v.literal("business"),
      v.literal("enterprise")
    ),
    billingEmail: v.optional(v.string()),
    // Lemon Squeezy billing
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezySubscriptionId: v.optional(v.string()),
    lemonSqueezySubscriptionStatus: v.optional(v.string()),
    
    // Seat management
    maxSeats: v.number(), // Maximum allowed team members based on plan
    currentSeats: v.number(), // Current number of team members
    
    // Usage limits (based on plan)
    monthlyPageviewLimit: v.number(),
    monthlyAiQueryLimit: v.number(),
    currentMonthPageviews: v.number(),
    currentMonthAiQueries: v.number(),
    usageResetDate: v.number(), // Timestamp when usage resets
    
    // Settings
    settings: v.optional(v.object({
      allowMemberInvites: v.boolean(), // Can admins invite members?
      requireApproval: v.boolean(), // Do invites need owner approval?
      defaultMemberRole: v.union(v.literal("member"), v.literal("viewer")),
      ssoEnabled: v.optional(v.boolean()),
      ssoProvider: v.optional(v.string()), // "google", "okta", "azure-ad"
    })),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    trialEndsAt: v.optional(v.number()), // For trial periods
  })
    .index("by_slug", ["slug"])
    .index("by_ownerId", ["ownerId"])
    .index("by_lemonSqueezyCustomerId", ["lemonSqueezyCustomerId"]),

  // Subscriptions (Lemon Squeezy)
  subscriptions: defineTable({
    // Links
    organizationId: v.optional(v.id("organizations")),
    userId: v.string(), // Clerk user ID

    // Lemon Squeezy IDs
    lemonSqueezySubscriptionId: v.string(),
    lemonSqueezyCustomerId: v.string(),
    lemonSqueezyOrderId: v.optional(v.string()),
    lemonSqueezyProductId: v.string(),
    lemonSqueezyVariantId: v.string(),

    // Product info
    productName: v.string(),
    variantName: v.string(),

    // Status
    status: v.string(), // on_trial, active, paused, past_due, unpaid, cancelled, expired

    // Billing
    billingAnchor: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    renewsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),

    // Payment info
    cardBrand: v.optional(v.string()),
    cardLastFour: v.optional(v.string()),

    // URLs
    updatePaymentMethodUrl: v.optional(v.string()),
    customerPortalUrl: v.optional(v.string()),

    // Flags
    isPaused: v.boolean(),
    isUsageBased: v.optional(v.boolean()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_lemonSqueezySubscriptionId", ["lemonSqueezySubscriptionId"])
    .index("by_lemonSqueezyCustomerId", ["lemonSqueezyCustomerId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_status", ["status"]),

  // Organization members (employees/team)
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(), // Clerk user ID
    email: v.string(), // For display and notifications
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    
    // Role hierarchy: owner > admin > manager > member > viewer
    role: v.union(
      v.literal("owner"), // Full control, billing, can delete org
      v.literal("admin"), // Manage members, all features
      v.literal("manager"), // Manage team members below them, most features
      v.literal("member"), // Standard access, can create/edit
      v.literal("viewer") // Read-only access
    ),
    
    // Department/team for larger orgs
    department: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("active"),
      v.literal("suspended"), // Temporarily disabled
      v.literal("pending") // Awaiting user to accept invite
    ),
    
    // Permissions override (for granular control)
    permissions: v.optional(v.object({
      canManageAnalytics: v.boolean(),
      canManageBlog: v.boolean(),
      canManageInbox: v.boolean(),
      canViewBilling: v.boolean(),
      canInviteMembers: v.boolean(),
      canAccessApi: v.boolean(),
    })),
    
    // Activity tracking
    lastActiveAt: v.optional(v.number()),
    invitedBy: v.optional(v.string()), // User ID who invited them
    joinedAt: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"])
    .index("by_organizationId_userId", ["organizationId", "userId"])
    .index("by_organizationId_role", ["organizationId", "role"])
    .index("by_email", ["email"]),

  // Organization invitations
  organizationInvites: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member"),
      v.literal("viewer")
    ),
    
    // Invite details
    invitedBy: v.string(), // User ID
    inviteCode: v.string(), // Unique code for the invite link
    message: v.optional(v.string()), // Personal message
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("revoked")
    ),
    
    // Timestamps
    createdAt: v.number(),
    expiresAt: v.number(), // Invites expire after 7 days by default
    respondedAt: v.optional(v.number()),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_inviteCode", ["inviteCode"])
    .index("by_status", ["status"]),

  // Audit log for organization actions
  organizationAuditLog: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(), // Who performed the action
    action: v.string(), // "member.invited", "member.removed", "settings.updated", etc.
    targetType: v.optional(v.string()), // "member", "settings", "billing"
    targetId: v.optional(v.string()), // ID of affected resource
    details: v.optional(v.any()), // Additional context
    ipAddress: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_timestamp", ["organizationId", "timestamp"])
    .index("by_userId", ["userId"]),

  // ============ USER PROFILES ============

  // User profiles (extended user data)
  userProfiles: defineTable({
    userId: v.string(), // Clerk user ID
    
    // Verification status (cherry badge)
    isVerified: v.boolean(), // Whether user has the cherry badge
    verifiedAt: v.optional(v.number()), // When they were verified
    verifiedBy: v.optional(v.string()), // Admin who verified them
    verificationType: v.optional(v.union(
      v.literal("company"), // Verified business/company
      v.literal("creator"), // Verified content creator
      v.literal("partner"), // Official partner
      v.literal("staff") // CherryCap staff
    )),
    
    // Notification preferences
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    mentionNotifications: v.boolean(),
    marketingNotifications: v.boolean(),
    
    // Appearance
    theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),

    // Sidebar preferences
    pinnedItems: v.optional(v.array(v.string())), // Array of nav item hrefs that are pinned

    // Account status
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isVerified", ["isVerified"]),

  // Business context (single source of truth for AI across all tools)
  businessContext: defineTable({
    userId: v.string(), // Clerk user ID (owner)
    organizationId: v.optional(v.id("organizations")), // Optional org link
    
    // === COMPANY BASICS ===
    companyName: v.string(),
    tagline: v.optional(v.string()), // Short slogan/tagline
    description: v.string(), // What the company does (2-3 sentences)
    foundedYear: v.optional(v.number()),
    website: v.optional(v.string()),
    
    // === INDUSTRY & NICHE ===
    industry: v.string(), // e.g., "Technology", "Food & Beverage", "Healthcare"
    niche: v.optional(v.string()), // More specific, e.g., "SaaS for restaurants"
    businessModel: v.optional(v.union(
      v.literal("b2b"),
      v.literal("b2c"),
      v.literal("b2b2c"),
      v.literal("d2c"),
      v.literal("marketplace"),
      v.literal("saas"),
      v.literal("agency"),
      v.literal("ecommerce"),
      v.literal("content"),
      v.literal("other")
    )),
    
    // === TARGET AUDIENCE ===
    targetAudience: v.string(), // Description of ideal customers
    audiencePainPoints: v.optional(v.array(v.string())), // Problems they solve
    audienceDemographics: v.optional(v.string()), // Age, location, job titles, etc.
    
    // === BRAND VOICE & TONE ===
    brandVoice: v.union(
      v.literal("professional"),
      v.literal("friendly"),
      v.literal("casual"),
      v.literal("authoritative"),
      v.literal("playful"),
      v.literal("inspirational"),
      v.literal("educational"),
      v.literal("bold")
    ),
    toneAttributes: v.optional(v.array(v.string())), // e.g., ["witty", "empathetic", "direct"]
    writingStyle: v.optional(v.string()), // Additional style notes
    
    // === PRODUCTS/SERVICES ===
    products: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      category: v.optional(v.string()),
      priceRange: v.optional(v.string()),
      isflagship: v.optional(v.boolean()),
    }))),
    
    // === KEY DIFFERENTIATORS ===
    uniqueValue: v.optional(v.string()), // What makes them unique
    competitiveAdvantages: v.optional(v.array(v.string())),
    competitors: v.optional(v.array(v.string())), // Main competitors
    
    // === CONTENT PREFERENCES ===
    contentTopics: v.optional(v.array(v.string())), // Topics they want to cover
    avoidTopics: v.optional(v.array(v.string())), // Topics to avoid
    keyMessages: v.optional(v.array(v.string())), // Messages to reinforce
    callToAction: v.optional(v.string()), // Default CTA
    
    // === SEO & KEYWORDS ===
    primaryKeywords: v.optional(v.array(v.string())),
    secondaryKeywords: v.optional(v.array(v.string())),
    brandTerms: v.optional(v.array(v.string())), // Branded terms to use
    
    // === SOCIAL & CONTACT ===
    socialLinks: v.optional(v.object({
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
    contactEmail: v.optional(v.string()),
    location: v.optional(v.string()), // City/Country
    
    // === ADDITIONAL CONTEXT ===
    additionalContext: v.optional(v.string()), // Free-form notes for AI
    
    // === METADATA ===
    isComplete: v.boolean(), // Has user completed setup?
    completionPercentage: v.number(), // 0-100
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"]),

  // User stats (aggregated statistics per user)
  userStats: defineTable({
    userId: v.string(), // Clerk user ID
    
    // Content stats
    postsCount: v.number(), // Number of blog posts (published)
    draftsCount: v.number(), // Number of draft posts
    
    // Engagement stats  
    totalViews: v.number(), // Total views across all posts
    totalLikes: v.number(), // Total likes received
    totalComments: v.number(), // Total comments received
    
    // Team stats
    teamMembersCount: v.number(), // Number of team members across orgs
    
    // Timestamps
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Verification requests (for users wanting to become verified)
  verificationRequests: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(), // User's email
    
    // Personal details
    fullName: v.string(),
    phone: v.optional(v.string()),
    
    // Business details
    businessName: v.string(),
    businessType: v.union(
      v.literal("company"),
      v.literal("creator"),
      v.literal("agency"),
      v.literal("nonprofit"),
      v.literal("other")
    ),
    industry: v.optional(v.string()), // e.g. "Technology", "Food & Beverage", "Marketing"
    website: v.optional(v.string()),
    
    // Location
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    
    // About
    description: v.string(), // What they do and why they want verification
    
    // Social proof
    socialLinks: v.optional(v.array(v.string())),
    
    // Approval token for email link
    approvalToken: v.string(), // Unique token for approve/reject links
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    
    // Admin response
    reviewedBy: v.optional(v.string()), // Admin user ID
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_approvalToken", ["approvalToken"]),

  // Admin allowlist (emails that can be auto-verified or have admin access)
  adminAllowlist: defineTable({
    email: v.string(),
    role: v.union(
      v.literal("superadmin"), // Full access, can verify anyone
      v.literal("admin"), // Can review verification requests
      v.literal("auto_verify") // Gets automatically verified on signup
    ),
    addedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // User notifications
  notifications: defineTable({
    userId: v.string(), // Recipient user ID
    
    // Notification type
    type: v.union(
      v.literal("mention"), // Someone mentioned you
      v.literal("comment"), // Someone commented on your post
      v.literal("like"), // Someone liked your post
      v.literal("follow"), // Someone followed you
      v.literal("marketing"), // Marketing/promotional notification
      v.literal("system") // System notification
    ),
    
    // Content
    title: v.string(),
    message: v.string(),
    
    // Links
    href: v.optional(v.string()), // Link to navigate to
    
    // Source (who triggered it)
    fromUserId: v.optional(v.string()),
    fromUserName: v.optional(v.string()),
    fromUserImage: v.optional(v.string()),
    
    // Status
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"])
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_type", ["type"]),

  // Custom usernames (unique per user)
  usernames: defineTable({
    userId: v.string(), // Clerk user ID
    username: v.string(), // Unique username (lowercase)
    displayName: v.optional(v.string()), // Display version with original casing
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsernameChange: v.optional(v.number()), // Timestamp of last username change (for rate limiting)
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"]),

  // AI Chat Conversations
  conversations: defineTable({
    userId: v.string(), // Clerk user ID
    title: v.string(), // Auto-generated or user-edited title
    model: v.string(), // The AI model used
    createdAt: v.number(),
    updatedAt: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"]),

  // Chat Messages within conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()), // Model used for this specific response
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"]),

  // Sites that users register for tracking
  sites: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    domain: v.string(),
    siteId: v.string(), // Public tracking ID (e.g., "cc_abc123")
    createdAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_siteId", ["siteId"])
    .index("by_domain", ["domain"]),

  // Page view events
  pageViews: defineTable({
    siteId: v.optional(v.string()),
    sessionId: v.string(),
    path: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    // UTM parameters
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
  })
    .index("by_siteId", ["siteId"])
    .index("by_siteId_timestamp", ["siteId", "timestamp"])
    .index("by_sessionId", ["sessionId"]),

  // Visitor sessions
  sessions: defineTable({
    siteId: v.optional(v.string()),
    sessionId: v.string(), // Unique session identifier
    visitorId: v.optional(v.string()), // Persistent visitor ID (fingerprint-based, no cookies)
    startTime: v.number(),
    lastActivity: v.number(),
    // Device info
    device: v.optional(v.string()), // "desktop" | "mobile" | "tablet"
    browser: v.optional(v.string()),
    os: v.optional(v.string()),
    userAgent: v.optional(v.string()), // Legacy field
    // Location (from IP, privacy-friendly - country only)
    country: v.optional(v.string()),
    // Traffic source
    referrer: v.optional(v.string()),
    referrerType: v.optional(v.string()), // "direct" | "organic" | "social" | "referral" | "email"
    // Session metrics
    pageCount: v.number(),
    eventCount: v.optional(v.number()), // Legacy field
    duration: v.optional(v.number()), // in seconds
    isBounce: v.optional(v.boolean()),
  })
    .index("by_siteId", ["siteId"])
    .index("by_siteId_startTime", ["siteId", "startTime"])
    .index("by_sessionId", ["sessionId"])
    .index("by_visitorId", ["visitorId"]),

  // Performance metrics (Web Vitals)
  performance: defineTable({
    siteId: v.string(),
    sessionId: v.string(),
    path: v.string(),
    timestamp: v.number(),
    // Core Web Vitals
    lcp: v.optional(v.number()), // Largest Contentful Paint (ms)
    fid: v.optional(v.number()), // First Input Delay (ms)
    cls: v.optional(v.number()), // Cumulative Layout Shift (score)
    // Other metrics
    fcp: v.optional(v.number()), // First Contentful Paint (ms)
    ttfb: v.optional(v.number()), // Time to First Byte (ms)
    loadTime: v.optional(v.number()), // Full page load time (ms)
  })
    .index("by_siteId", ["siteId"])
    .index("by_siteId_timestamp", ["siteId", "timestamp"])
    .index("by_siteId_path", ["siteId", "path"]),

  // Custom events (button clicks, form submissions, etc.)
  events: defineTable({
    siteId: v.string(),
    sessionId: v.string(),
    name: v.string(), // e.g., "button_click", "form_submit", "purchase"
    properties: v.optional(v.any()), // Custom properties as JSON
    timestamp: v.number(),
  })
    .index("by_siteId", ["siteId"])
    .index("by_siteId_name", ["siteId", "name"])
    .index("by_siteId_timestamp", ["siteId", "timestamp"]),

  // Daily aggregated stats (for faster dashboard queries)
  dailyStats: defineTable({
    siteId: v.string(),
    date: v.string(), // "YYYY-MM-DD"
    // Traffic
    visitors: v.number(),
    sessions: v.number(),
    pageViews: v.number(),
    // Engagement
    avgSessionDuration: v.number(),
    bounceRate: v.number(),
    pagesPerSession: v.number(),
    // Performance averages
    avgLoadTime: v.optional(v.number()),
    avgTtfb: v.optional(v.number()),
    avgFcp: v.optional(v.number()),
    avgLcp: v.optional(v.number()),
  })
    .index("by_siteId", ["siteId"])
    .index("by_siteId_date", ["siteId", "date"]),

  // Top pages aggregated daily
  topPages: defineTable({
    siteId: v.string(),
    date: v.string(),
    path: v.string(),
    views: v.number(),
    uniqueVisitors: v.number(),
    avgTimeOnPage: v.number(),
    bounceRate: v.number(),
  })
    .index("by_siteId_date", ["siteId", "date"]),

  // Traffic sources aggregated daily
  trafficSources: defineTable({
    siteId: v.string(),
    date: v.string(),
    source: v.string(), // "direct", "google", "facebook", etc.
    sourceType: v.string(), // "direct" | "organic" | "social" | "referral" | "email"
    visitors: v.number(),
    sessions: v.number(),
  })
    .index("by_siteId_date", ["siteId", "date"]),

  // ============ BLOG TABLES ============

  // Blog post likes
  blogLikes: defineTable({
    userId: v.string(), // Clerk user ID
    postSlug: v.string(), // Blog post slug/identifier
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_postSlug", ["postSlug"])
    .index("by_userId_postSlug", ["userId", "postSlug"]),

  // Blog post comments
  blogComments: defineTable({
    userId: v.string(), // Clerk user ID
    userName: v.string(), // Display name
    userImage: v.optional(v.string()), // Profile image URL
    postSlug: v.string(), // Blog post slug/identifier
    content: v.string(), // Comment text
    parentId: v.optional(v.id("blogComments")), // For nested replies
    mentions: v.optional(v.array(v.string())), // Array of mentioned user IDs
    createdAt: v.number(),
    updatedAt: v.number(),
    isEdited: v.boolean(),
    isDeleted: v.boolean(), // Soft delete for preserving thread structure
  })
    .index("by_postSlug", ["postSlug"])
    .index("by_userId", ["userId"])
    .index("by_postSlug_createdAt", ["postSlug", "createdAt"])
    .index("by_parentId", ["parentId"]),

  // Blog post bookmarks
  blogBookmarks: defineTable({
    userId: v.string(), // Clerk user ID
    postSlug: v.string(), // Blog post slug/identifier
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_postSlug", ["postSlug"])
    .index("by_userId_postSlug", ["userId", "postSlug"]),

  // Blog post share tracking
  blogShares: defineTable({
    userId: v.optional(v.string()), // Clerk user ID (optional for anonymous shares)
    postSlug: v.string(), // Blog post slug/identifier
    platform: v.string(), // "twitter", "facebook", "linkedin", "copy_link", "email"
    createdAt: v.number(),
  })
    .index("by_postSlug", ["postSlug"])
    .index("by_postSlug_platform", ["postSlug", "platform"]),

  // Aggregated blog stats (for quick lookups)
  blogStats: defineTable({
    postSlug: v.string(), // Blog post slug/identifier
    likesCount: v.number(),
    commentsCount: v.number(),
    sharesCount: v.number(),
    bookmarksCount: v.number(),
  })
    .index("by_postSlug", ["postSlug"]),

  // ============ NEWSLETTER TABLES ============

  // Newsletter subscribers
  newsletterSubscribers: defineTable({
    email: v.string(),
    userId: v.optional(v.string()), // Clerk user ID if logged in
    firstName: v.optional(v.string()),
    subscribedAt: v.number(),
    isActive: v.boolean(),
    source: v.string(), // "website", "blog", "seo-page", "footer"
    tags: v.optional(v.array(v.string())), // Interest tags like "seo", "growth", etc.
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_userId", ["userId"])
    .index("by_isActive", ["isActive"])
    .index("by_source", ["source"]),

  // Newsletter campaigns (for tracking sent newsletters)
  newsletterCampaigns: defineTable({
    title: v.string(),
    subject: v.string(),
    content: v.string(), // HTML content
    sentAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    status: v.string(), // "draft", "scheduled", "sent"
    recipientCount: v.number(),
    openCount: v.number(),
    clickCount: v.number(),
    tags: v.optional(v.array(v.string())), // Target tags
  })
    .index("by_status", ["status"])
    .index("by_sentAt", ["sentAt"]),

  // ============ BLOG EDITOR / AI WRITING ============

  // Blog posts (drafts and published content)
  blogPosts: defineTable({
    // Author
    authorId: v.string(), // Clerk user ID
    
    // Content (Plate JSON format)
    title: v.string(),
    content: v.string(), // JSON stringified Plate editor value
    excerpt: v.optional(v.string()), // Short excerpt/summary
    
    // Cover image
    coverImage: v.optional(v.string()), // URL to cover image
    coverImageAlt: v.optional(v.string()), // Alt text for cover image
    
    // SEO fields
    slug: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    targetKeyword: v.optional(v.string()),
    
    // Categories and tags
    category: v.optional(v.string()), // Primary category
    tags: v.optional(v.array(v.string())), // Multiple tags
    
    // Status
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled")),
    
    // Scheduling
    scheduledAt: v.optional(v.number()), // When to publish (for scheduled posts)
    
    // Reading stats
    readingTimeMinutes: v.optional(v.number()), // Calculated reading time
    wordCount: v.optional(v.number()), // Total word count
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_authorId", ["authorId"])
    .index("by_authorId_status", ["authorId", "status"])
    .index("by_authorId_updatedAt", ["authorId", "updatedAt"])
    .index("by_slug", ["slug"])
    .index("by_status_scheduledAt", ["status", "scheduledAt"])
    .index("by_category", ["category"]),

  // Blog post versions (for version history)
  blogPostVersions: defineTable({
    postId: v.id("blogPosts"),
    authorId: v.string(),
    title: v.string(),
    content: v.string(),
    versionNumber: v.number(),
    createdAt: v.number(),
    // Optional note about what changed
    changeNote: v.optional(v.string()),
  })
    .index("by_postId", ["postId"])
    .index("by_postId_versionNumber", ["postId", "versionNumber"]),

  // Blog categories
  blogCategories: defineTable({
    authorId: v.string(), // Owner
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()), // Category color for UI
    postCount: v.number(), // Number of posts in this category
    createdAt: v.number(),
  })
    .index("by_authorId", ["authorId"])
    .index("by_slug", ["slug"]),

  // Writing goals and streaks
  writingGoals: defineTable({
    userId: v.string(),
    dailyWordGoal: v.number(), // Words per day goal
    currentStreak: v.number(), // Days in a row meeting goal
    longestStreak: v.number(), // Best streak ever
    lastWritingDate: v.optional(v.string()), // YYYY-MM-DD
    totalWordsWritten: v.number(), // Lifetime words
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Daily writing progress
  dailyWritingProgress: defineTable({
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    wordsWritten: v.number(),
    goalMet: v.boolean(),
    postsWorkedOn: v.array(v.id("blogPosts")),
  })
    .index("by_userId_date", ["userId", "date"])
    .index("by_userId", ["userId"]),

  // Blog post collaboration comments (for draft reviews/feedback)
  blogPostCollabComments: defineTable({
    postId: v.id("blogPosts"), // The blog post being commented on
    authorId: v.string(), // Clerk user ID of commenter
    authorName: v.string(), // Display name
    authorImage: v.optional(v.string()), // Profile image
    
    // Comment content
    content: v.string(), // The comment text
    
    // Optional selection reference (for inline comments)
    selectionStart: v.optional(v.number()), // Character position start
    selectionEnd: v.optional(v.number()), // Character position end
    selectedText: v.optional(v.string()), // The text that was selected
    
    // Threading
    parentId: v.optional(v.id("blogPostCollabComments")), // For replies
    
    // Resolution status (for actionable feedback)
    isResolved: v.boolean(),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    isEdited: v.boolean(),
  })
    .index("by_postId", ["postId"])
    .index("by_postId_createdAt", ["postId", "createdAt"])
    .index("by_authorId", ["authorId"])
    .index("by_parentId", ["parentId"])
    .index("by_postId_isResolved", ["postId", "isResolved"]),

  // ============ AI CREDITS SYSTEM ============

  // User credit balances
  userCredits: defineTable({
    userId: v.string(), // Clerk user ID

    // Current balance
    balance: v.number(), // Current credit balance (in cents for precision)

    // Lifetime stats
    totalPurchased: v.number(), // Total credits ever purchased
    totalUsed: v.number(), // Total credits ever used

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Credit transactions (purchases and usage)
  creditTransactions: defineTable({
    userId: v.string(), // Clerk user ID

    // Transaction type
    type: v.union(
      v.literal("purchase"), // Bought credits
      v.literal("usage"), // Used credits (API call)
      v.literal("refund"), // Refunded credits
      v.literal("bonus"), // Free bonus credits
      v.literal("adjustment") // Admin adjustment
    ),

    // Amount (positive for credits in, negative for credits out)
    amount: v.number(), // In cents for precision (e.g., 100 = $1.00 worth)

    // Balance after transaction
    balanceAfter: v.number(),

    // Usage details (for type === "usage")
    usageDetails: v.optional(v.object({
      feature: v.string(), // "auto-post", "ai-chat", "copilot", etc.
      model: v.string(), // AI model used
      promptTokens: v.number(),
      completionTokens: v.number(),
      actualCostUSD: v.number(), // What we actually paid OpenRouter
    })),

    // Purchase details (for type === "purchase")
    purchaseDetails: v.optional(v.object({
      provider: v.string(), // "lemon_squeezy" or "stripe"
      orderId: v.string(),
      productId: v.optional(v.string()),
      amountPaidUSD: v.number(), // What user paid
    })),

    // Description
    description: v.string(), // Human-readable description

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_type", ["type"]),

  // Credit packages available for purchase
  creditPackages: defineTable({
    name: v.string(), // e.g., "Starter", "Pro", "Unlimited"

    // Credits included
    credits: v.number(), // Credits in the package (in cents)

    // Pricing
    priceUSD: v.number(), // Price in cents (e.g., 999 = $9.99)

    // Bonus (optional)
    bonusCredits: v.number(), // Extra credits as bonus

    // Display
    description: v.string(),
    isPopular: v.boolean(), // Highlight this package
    isActive: v.boolean(), // Available for purchase

    // Stripe integration
    stripePriceId: v.optional(v.string()),

    // Order
    order: v.number(), // Display order

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_order", ["order"]),

  // ============ AI APPOINTMENT BOOKING ============

  // Appointment settings (per admin/business)
  appointmentSettings: defineTable({
    adminEmail: v.string(), // The admin email (e.g., scottheney68@gmail.com)
    businessName: v.string(),
    timezone: v.string(), // e.g., "America/Detroit"

    // Availability - days of week (0 = Sunday, 6 = Saturday)
    availableDays: v.array(v.number()), // e.g., [1, 2, 3, 4, 5] for Mon-Fri

    // Working hours
    startHour: v.number(), // e.g., 9 for 9 AM
    endHour: v.number(), // e.g., 17 for 5 PM

    // Appointment duration in minutes
    defaultDuration: v.number(), // e.g., 30 or 60

    // Buffer time between appointments (minutes)
    bufferTime: v.number(),

    // Advance booking limits
    minAdvanceHours: v.number(), // Minimum hours in advance to book
    maxAdvanceDays: v.number(), // Maximum days in advance to book

    // Notifications
    notifyEmail: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_adminEmail", ["adminEmail"]),

  // Appointments booked through AI
  appointments: defineTable({
    adminEmail: v.string(), // Which admin's calendar this is on

    // Appointment details
    date: v.string(), // YYYY-MM-DD
    startTime: v.string(), // HH:MM (24h format)
    endTime: v.string(), // HH:MM (24h format)
    duration: v.number(), // minutes

    // Customer info
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),

    // Appointment details
    service: v.optional(v.string()), // Type of appointment
    notes: v.optional(v.string()), // Additional notes from AI conversation

    // Status
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),

    // Cancellation
    cancelledAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),

    // Tracking
    bookedVia: v.literal("ai_chatbot"), // Always AI chatbot for now
    conversationId: v.optional(v.string()), // Reference to chat session

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_adminEmail", ["adminEmail"])
    .index("by_adminEmail_date", ["adminEmail", "date"])
    .index("by_customerEmail", ["customerEmail"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  // Blocked time slots (holidays, vacations, etc.)
  blockedSlots: defineTable({
    adminEmail: v.string(),
    date: v.string(), // YYYY-MM-DD
    startTime: v.optional(v.string()), // If null, entire day is blocked
    endTime: v.optional(v.string()),
    reason: v.optional(v.string()),
    isRecurring: v.boolean(),
    recurringDays: v.optional(v.array(v.number())), // Day of week for recurring blocks
    createdAt: v.number(),
  })
    .index("by_adminEmail", ["adminEmail"])
    .index("by_adminEmail_date", ["adminEmail", "date"]),

  // ============ SECURITY & AUDIT ============

  // Audit logs for sensitive operations
  auditLogs: defineTable({
    action: v.string(),
    userId: v.optional(v.string()), // Who performed the action (Clerk ID)
    targetUserId: v.optional(v.string()), // Who was affected by the action
    resourceType: v.string(), // "organization", "user", "subscription", etc.
    resourceId: v.string(),
    details: v.optional(v.any()), // Extra contextual details
    ipAddress: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_resource_type", ["resourceType"])
    .index("by_userId", ["userId"])
    .index("by_action", ["action"]),

  // Rate limiting records
  rateLimits: defineTable({
    userId: v.string(), // Clerk user ID or IP address
    action: v.string(), // e.g., "message", "upload", "api"
    timestamp: v.number(),
  })
    .index("by_user_and_action", ["userId", "action"])
    .index("by_user_and_action_timestamp", ["userId", "action", "timestamp"]),
});
