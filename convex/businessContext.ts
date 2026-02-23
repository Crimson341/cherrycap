import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

// Get business context for current user
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

// Get business context by user ID (for current user)
export const getByUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

// Create or update business context
export const upsert = mutation({
  args: {
    // Company basics
    companyName: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    foundedYear: v.optional(v.number()),
    website: v.optional(v.string()),
    
    // Industry
    industry: v.string(),
    niche: v.optional(v.string()),
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
    
    // Target audience
    targetAudience: v.string(),
    audiencePainPoints: v.optional(v.array(v.string())),
    audienceDemographics: v.optional(v.string()),
    
    // Brand voice
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
    toneAttributes: v.optional(v.array(v.string())),
    writingStyle: v.optional(v.string()),
    
    // Products
    products: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      category: v.optional(v.string()),
      priceRange: v.optional(v.string()),
      isflagship: v.optional(v.boolean()),
    }))),
    
    // Differentiators
    uniqueValue: v.optional(v.string()),
    competitiveAdvantages: v.optional(v.array(v.string())),
    competitors: v.optional(v.array(v.string())),
    
    // Content
    contentTopics: v.optional(v.array(v.string())),
    avoidTopics: v.optional(v.array(v.string())),
    keyMessages: v.optional(v.array(v.string())),
    callToAction: v.optional(v.string()),
    
    // SEO
    primaryKeywords: v.optional(v.array(v.string())),
    secondaryKeywords: v.optional(v.array(v.string())),
    brandTerms: v.optional(v.array(v.string())),
    
    // Social
    socialLinks: v.optional(v.object({
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),
    contactEmail: v.optional(v.string()),
    location: v.optional(v.string()),
    
    // Additional
    additionalContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Check if context already exists
    const existing = await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    // Calculate completion percentage
    const fields = [
      args.companyName,
      args.description,
      args.industry,
      args.targetAudience,
      args.brandVoice,
      args.tagline,
      args.website,
      args.niche,
      args.businessModel,
      args.uniqueValue,
      args.products && args.products.length > 0,
      args.primaryKeywords && args.primaryKeywords.length > 0,
      args.contentTopics && args.contentTopics.length > 0,
      args.socialLinks && Object.values(args.socialLinks).some(Boolean),
    ];
    const filledFields = fields.filter(Boolean).length;
    const completionPercentage = Math.round((filledFields / fields.length) * 100);
    const isComplete = completionPercentage >= 70; // Consider complete at 70%

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        isComplete,
        completionPercentage,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("businessContext", {
        userId: identity.subject,
        ...args,
        isComplete,
        completionPercentage,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Quick update for specific fields
export const updateField = mutation({
  args: {
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!existing) {
      throw new Error("Business context not found. Please complete setup first.");
    }

    await ctx.db.patch(existing._id, {
      [args.field]: args.value,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Add a product
export const addProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    isflagship: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!existing) {
      throw new Error("Business context not found");
    }

    const products = existing.products || [];
    products.push(args);

    await ctx.db.patch(existing._id, {
      products,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove a product
export const removeProduct = mutation({
  args: { index: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!existing || !existing.products) {
      throw new Error("Business context or products not found");
    }

    const products = [...existing.products];
    products.splice(args.index, 1);

    await ctx.db.patch(existing._id, {
      products,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get formatted context for AI (public query for API)
// Supports different scopes to reduce context size for different AI features
export const getForAI = internalQuery({
  args: { 
    userId: v.string(),
    // Scope determines which sections to include
    // "full" = everything, "voice" = just voice/tone, "products" = products focus,
    // "content" = content guidelines, "minimal" = company basics only
     scope: v.optional(v.union(
      v.literal("full"),
      v.literal("voice"),
      v.literal("products"),
      v.literal("content"),
      v.literal("minimal")
    )),
  },
  handler: async (ctx, args) => {
    const context = await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!context) {
      return null;
    }

    const scope = args.scope || "full";
    const sections: string[] = [];

    // ALWAYS include company basics (minimal context)
    sections.push(`# ${context.companyName}`);
    if (context.tagline) sections.push(`*${context.tagline}*`);
    sections.push(context.description);
    sections.push(`Industry: ${context.industry}${context.niche ? ` - ${context.niche}` : ""}`);

    // VOICE scope: Include voice/tone info
    if (scope === "full" || scope === "voice" || scope === "content") {
      sections.push(`\n**Voice:** ${context.brandVoice}`);
      if (context.toneAttributes && context.toneAttributes.length > 0) {
        sections.push(`**Tone:** ${context.toneAttributes.join(", ")}`);
      }
      if (context.writingStyle) {
        sections.push(`**Style:** ${context.writingStyle}`);
      }
    }

    // AUDIENCE: Include for most scopes except minimal
    if (scope === "full" || scope === "content") {
      sections.push(`\n**Audience:** ${context.targetAudience}`);
      if (context.audiencePainPoints && context.audiencePainPoints.length > 0) {
        sections.push(`**Pain Points:** ${context.audiencePainPoints.slice(0, 5).join(", ")}`);
      }
    }

    // PRODUCTS scope: Include products info (limit to top 10 for context size)
    if (scope === "full" || scope === "products") {
      if (context.products && context.products.length > 0) {
        const flagships = context.products.filter(p => p.isflagship);
        const others = context.products.filter(p => !p.isflagship);
        const productsToShow = [...flagships, ...others].slice(0, 10);
        
        sections.push(`\n**Products/Services:**`);
        productsToShow.forEach((p) => {
          const flagship = p.isflagship ? " [Flagship]" : "";
          sections.push(`- ${p.name}${flagship}: ${p.description}`);
        });
        
        if (context.products.length > 10) {
          sections.push(`(+${context.products.length - 10} more products)`);
        }
      }

      if (context.uniqueValue) {
        sections.push(`\n**Unique Value:** ${context.uniqueValue}`);
      }
      
      if (context.competitiveAdvantages && context.competitiveAdvantages.length > 0) {
        sections.push(`**Advantages:** ${context.competitiveAdvantages.slice(0, 5).join(", ")}`);
      }
    }

    // CONTENT scope: Include content guidelines
    if (scope === "full" || scope === "content") {
      if (context.contentTopics && context.contentTopics.length > 0) {
        sections.push(`\n**Topics to Cover:** ${context.contentTopics.join(", ")}`);
      }
      if (context.avoidTopics && context.avoidTopics.length > 0) {
        sections.push(`**Topics to Avoid:** ${context.avoidTopics.join(", ")}`);
      }
      if (context.keyMessages && context.keyMessages.length > 0) {
        sections.push(`**Key Messages:** ${context.keyMessages.slice(0, 5).join("; ")}`);
      }
      if (context.callToAction) {
        sections.push(`**Default CTA:** ${context.callToAction}`);
      }
    }

    // Additional context only for full scope
    if (scope === "full" && context.additionalContext) {
      sections.push(`\n**Additional Notes:** ${context.additionalContext}`);
    }

    return {
      raw: context,
      formatted: sections.join("\n"),
      companyName: context.companyName,
      brandVoice: context.brandVoice,
      toneAttributes: context.toneAttributes,
      industry: context.industry,
      callToAction: context.callToAction,
    };
  },
});

// Delete business context
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("businessContext")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});
