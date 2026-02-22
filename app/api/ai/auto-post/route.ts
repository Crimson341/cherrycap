import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Model pricing (per 1M tokens) from OpenRouter
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "google/gemini-3-pro-preview": { input: 1.25, output: 10 },
  "google/gemini-3-flash-preview": { input: 0.1, output: 0.4 },
  "google/gemini-2.5-flash": { input: 0.05, output: 0.15 },
  "openai/gpt-4.1": { input: 2, output: 8 },
  "openai/gpt-4.1-mini": { input: 0.1, output: 0.3 },
  "x-ai/grok-3-mini": { input: 0.3, output: 0.5 },
};

// Credit multiplier - users are charged 3x actual API cost
const CREDIT_MULTIPLIER = 3;

// Calculate cost from token usage
function calculateCost(model: string, promptTokens: number, completionTokens: number): { actualCost: number; creditsCost: number } {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["google/gemini-2.5-flash"];
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  const actualCost = inputCost + outputCost;
  return {
    actualCost: Math.round(actualCost * 10000) / 10000, // Round to 4 decimals
    creditsCost: Math.ceil(actualCost * CREDIT_MULTIPLIER * 100) / 100, // Round up credits
  };
}

interface AutoPostOptions {
  topic: string;
  style?: "informative" | "conversational" | "persuasive" | "storytelling";
  wordCount?: number;
  depth?: "overview" | "standard" | "deep-dive";
  includeSections?: {
    intro?: boolean;
    examples?: boolean;
    stats?: boolean;
    quotes?: boolean;
    cta?: boolean;
    faq?: boolean;
  };
  targetKeyword?: string;
  customCta?: string;
  // New Auto Mode Pro options
  format?: "article" | "listicle" | "howto" | "casestudy" | "comparison" | "tutorial" | "review";
  tone?: "professional" | "casual" | "humorous" | "authoritative" | "empathetic" | "urgent";
  audience?: "beginner" | "intermediate" | "expert" | "general";
  seoLevel?: "light" | "balanced" | "heavy";
  model?: string;
  secondaryKeywords?: string[];
  competitorUrls?: string[];
  enableInternalLinks?: boolean;
  optimizeForFeaturedSnippet?: boolean;
  readabilityLevel?: "simple" | "standard" | "advanced";
  hookStyle?: "question" | "statistic" | "story" | "bold" | "controversial";
  generateOutlineFirst?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    
    const {
      topic,
      style = "informative",
      wordCount = 1500,
      depth = "standard",
      includeSections = { intro: true, examples: true, stats: true, quotes: false, cta: true, faq: false },
      targetKeyword,
      customCta,
      // New Auto Mode Pro options
      format = "article",
      tone = "professional",
      audience = "general",
      seoLevel = "balanced",
      model = "google/gemini-3-pro-preview",
      secondaryKeywords = [],
      competitorUrls = [],
      enableInternalLinks = false,
      optimizeForFeaturedSnippet = false,
      readabilityLevel = "standard",
      hookStyle = "question",
      generateOutlineFirst = false,
    }: AutoPostOptions = await req.json();

    const searchTopic = topic || "trending business topics";

    // Fetch business context if user is authenticated
    let businessContext = null;
    let businessContextPrompt = "";
    
    if (userId) {
      try {
        // Use "content" scope to get relevant context without overwhelming token usage
        businessContext = await convex.query(api.businessContext.getForAI, { 
          userId,
          scope: "content" 
        });
        if (businessContext?.formatted) {
          const toneDescription = businessContext.toneAttributes?.length 
            ? `with a ${businessContext.toneAttributes.slice(0, 3).join(", ")} tone`
            : "";
          
          businessContextPrompt = `
=== BUSINESS CONTEXT (Use this to tailor the content) ===
${businessContext.formatted}
=== END BUSINESS CONTEXT ===

IMPORTANT: Use the business context above to:
- Match the brand voice: "${businessContext.brandVoice || "professional"}" ${toneDescription}
- Reference "${businessContext.companyName || "the company"}" naturally where appropriate
- Target their specified audience
- Align with their key messages and avoid topics they want to avoid
${businessContext.callToAction ? `- Use their default CTA: "${businessContext.callToAction}"` : ""}
`;
        }
      } catch (e) {
        console.log("No business context found:", e);
      }
    }

    // Determine word count based on depth
    const depthWordCounts = {
      "overview": Math.max(800, wordCount * 0.6),
      "standard": wordCount,
      "deep-dive": Math.max(2500, wordCount * 1.5),
    };
    const targetWordCount = Math.round(depthWordCounts[depth]);

    // Format-specific instructions
    const formatInstructions: Record<string, string> = {
      article: "Write as a traditional blog article with flowing prose and clear sections.",
      listicle: "Structure as a numbered list article (e.g., '10 Ways to...', '7 Tips for...'). Each list item should have a clear heading and 2-3 supporting sentences.",
      howto: "Write as a step-by-step guide with numbered instructions. Include a 'What You'll Need' or 'Prerequisites' section if applicable.",
      casestudy: "Structure as a case study with Problem, Solution, Implementation, and Results sections. Include specific metrics and outcomes.",
      comparison: "Write as a comparison article comparing multiple options. Include a summary comparison table if possible.",
      tutorial: "Write as an educational tutorial with clear learning objectives, step-by-step instructions, and examples at each step.",
      review: "Write as an in-depth review with pros/cons, ratings for different aspects, and a final verdict with recommendations.",
    };

    // Tone descriptions
    const toneDescriptions: Record<string, string> = {
      professional: "Maintain a professional, business-appropriate tone. Be authoritative but accessible.",
      casual: "Use a friendly, conversational tone. Write as if talking to a friend. Use contractions and casual language.",
      humorous: "Inject humor and wit throughout. Use clever wordplay, pop culture references, and lighthearted examples.",
      authoritative: "Write as a definitive expert. Be confident, use strong statements, and cite your expertise.",
      empathetic: "Write with empathy and understanding. Acknowledge reader challenges and be supportive in tone.",
      urgent: "Create a sense of urgency. Use time-sensitive language and emphasize the importance of acting now.",
    };

    // Audience-specific adjustments
    const audienceInstructions: Record<string, string> = {
      beginner: "Write for complete beginners. Explain all technical terms, avoid jargon, and provide context for concepts.",
      intermediate: "Assume readers have basic knowledge. You can use industry terms but briefly explain advanced concepts.",
      expert: "Write for industry experts. Use technical language freely and focus on advanced insights and nuances.",
      general: "Write for a general audience. Balance accessibility with depth, explaining key terms as needed.",
    };

    // SEO level adjustments
    const seoInstructions: Record<string, string> = {
      light: "Focus on natural writing. Include the main keyword 2-3 times and use variations naturally.",
      balanced: "Optimize for SEO while maintaining readability. Include the main keyword 4-6 times, use secondary keywords, and optimize headings.",
      heavy: "Maximize SEO optimization. Include the main keyword 8-10 times, densely incorporate secondary keywords, use LSI keywords, optimize every heading, and structure for featured snippets.",
    };

    // Readability level adjustments
    const readabilityInstructions: Record<string, string> = {
      simple: "Write at an 8th-grade reading level. Use short sentences, simple words, and clear explanations.",
      standard: "Write at a college reading level. Balance sophistication with clarity.",
      advanced: "Write for highly educated readers. Use sophisticated vocabulary and complex sentence structures when appropriate.",
    };

    // Hook style instructions
    const hookInstructions: Record<string, string> = {
      question: "Open with a thought-provoking question that resonates with the reader's challenges or curiosity.",
      statistic: "Open with a surprising or compelling statistic that immediately establishes the importance of the topic.",
      story: "Open with a brief, engaging story or anecdote that illustrates the topic's relevance.",
      bold: "Open with a bold, declarative statement that challenges conventional thinking.",
      controversial: "Open with a provocative or contrarian take that makes the reader want to keep reading.",
    };

    // Build sections instructions
    const sectionInstructions = [];
    if (includeSections.intro) sectionInstructions.push("- Start with a compelling introduction that hooks the reader");
    if (includeSections.examples) sectionInstructions.push("- Include real-world examples and case studies");
    if (includeSections.stats) sectionInstructions.push("- Add relevant statistics and data points (use realistic estimates if needed)");
    if (includeSections.quotes) sectionInstructions.push("- Include expert quotes or notable perspectives");
    if (includeSections.cta) sectionInstructions.push(`- End with a clear call-to-action${customCta ? `: "${customCta}"` : ""}`);
    if (includeSections.faq) sectionInstructions.push("- Include a FAQ section addressing common questions");

    // Build advanced context for the research phase
    const advancedContext = `
=== CONTENT CONFIGURATION ===
Format: ${format} - ${formatInstructions[format]}
Tone: ${tone} - ${toneDescriptions[tone]}
Target Audience: ${audience} - ${audienceInstructions[audience]}
SEO Level: ${seoLevel} - ${seoInstructions[seoLevel]}
Readability: ${readabilityLevel} - ${readabilityInstructions[readabilityLevel]}
Hook Style: ${hookStyle} - ${hookInstructions[hookStyle]}
${secondaryKeywords.length > 0 ? `User-provided Secondary Keywords: ${secondaryKeywords.join(", ")}` : ""}
${competitorUrls.length > 0 ? `Competitor URLs to analyze/outrank: ${competitorUrls.join(", ")}` : ""}
${enableInternalLinks ? "Include suggestions for internal linking opportunities" : ""}
${optimizeForFeaturedSnippet ? "PRIORITY: Structure content to win featured snippets (use definition boxes, numbered lists, tables)" : ""}
=== END CONFIGURATION ===
`;

    // Step 1: Research the best trending topic and gather all SEO data
    const researchResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap Auto Mode Pro",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an expert SEO content strategist with deep knowledge of content marketing, keyword research, and viral content creation. Your job is to find the single BEST trending topic opportunity and provide comprehensive research for creating a viral, high-ranking blog post.

${businessContextPrompt}

${advancedContext}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "topic": {
    "title": "The exact blog post title (compelling, SEO-optimized, 50-60 chars, formatted for ${format})",
    "hook": "A powerful opening hook using ${hookStyle} style that grabs attention",
    "angle": "The unique angle/perspective that makes this stand out from competitors",
    "targetKeyword": "${targetKeyword || "The primary keyword to rank for"}",
    "secondaryKeywords": [${secondaryKeywords.length > 0 ? secondaryKeywords.map(k => `"${k}"`).join(", ") : '"keyword1", "keyword2", "keyword3", "keyword4", "keyword5"'}],
    "lsiKeywords": ["related term 1", "related term 2", "related term 3"],
    "searchVolume": "Estimated monthly searches (e.g., 45K)",
    "difficulty": "easy/medium/hard",
    "intent": "informational/commercial/transactional",
    "targetAudience": "${audience} level readers - specific description",
    "emotionalTrigger": "The emotion this content should evoke",
    "contentGap": "What competitors are missing that we'll address"
  },
  "seo": {
    "metaDescription": "Compelling 150-160 char meta description with keyword",
    "slug": "url-friendly-slug-here",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "category": "Primary category",
    "readingTime": ${Math.ceil(targetWordCount / 200)},
    "wordCountTarget": ${targetWordCount},
    "keywordDensity": "${seoLevel === "heavy" ? "2-3%" : seoLevel === "light" ? "0.5-1%" : "1-2%"}",
    "featuredSnippetOpportunity": ${optimizeForFeaturedSnippet},
    "internalLinkSuggestions": ${enableInternalLinks ? '["suggestion1", "suggestion2"]' : "[]"}
  },
  "structure": {
    "introduction": "2-3 sentences for the intro approach using ${hookStyle} hook style",
    "sections": [
      {
        "heading": "H2 Section Title (${format}-appropriate)",
        "purpose": "What this section accomplishes",
        "keyPoints": ["Point 1", "Point 2", "Point 3"],
        "includeExample": ${includeSections.examples},
        "includeStats": ${includeSections.stats},
        "featuredSnippetFormat": "${optimizeForFeaturedSnippet ? "paragraph/list/table" : "none"}"
      }
    ],
    "conclusion": "Approach for the conclusion",
    "cta": "${customCta || "Call-to-action recommendation"}"
  },
  "socialMedia": {
    "twitterPost": "Tweet version (under 280 chars) - punchy, engaging, ${tone} tone, with 1-2 hashtags",
    "instagramCaption": "Instagram caption (150-200 words) - engaging, ${tone} tone, with emojis, line breaks, and 5+ hashtags at the end",
    "facebookPost": "Facebook post (80-150 words) - ${tone} tone, conversational, shareable, question or hook at end",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
  },
  "competitorAnalysis": {
    "gaps": ["Gap 1 in competitor content", "Gap 2"],
    "differentiators": ["How this content will be better"],
    "uniqueValue": "The key unique value proposition"
  }
}

Guidelines:
- Pick the topic with the BEST combination of: high search volume, low-medium difficulty, clear intent, timely relevance
- Title must be irresistible, SEO-friendly, and formatted appropriately for ${format} content
- Include ${depth === "overview" ? "3-4" : depth === "deep-dive" ? "7-10" : "5-7"} well-structured sections appropriate for ${format}
- Focus on topics that can go viral and rank well
- Ensure content matches the ${audience} audience level
- Apply ${seoLevel} SEO optimization principles
- Write the hook in ${hookStyle} style
${targetKeyword ? `- MUST use "${targetKeyword}" as the primary target keyword` : ""}
${businessContext ? `- Tailor content for ${businessContext.companyName} and their audience` : ""}
${competitorUrls.length > 0 ? `- Analyze and aim to outrank these competitors: ${competitorUrls.join(", ")}` : ""}`,
          },
          {
            role: "user",
            content: `Research and find the best trending topic opportunity in: "${searchTopic}".

Content Requirements:
- Format: ${format}
- Style: ${style}
- Tone: ${tone}
- Audience: ${audience}
- Depth: ${depth}
- SEO Level: ${seoLevel}
- Target word count: ${targetWordCount}
${secondaryKeywords.length > 0 ? `- Must incorporate these keywords: ${secondaryKeywords.join(", ")}` : ""}
${optimizeForFeaturedSnippet ? "- PRIORITY: Optimize for featured snippets" : ""}

Give me everything I need to create a viral, SEO-optimized ${format} post.`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!researchResponse.ok) {
      const error = await researchResponse.text();
      console.error("Research API error:", error);
      return NextResponse.json(
        { error: "Failed to research topic" },
        { status: researchResponse.status }
      );
    }

    const researchData = await researchResponse.json();
    let researchContent = researchData.choices?.[0]?.message?.content || "";
    researchContent = researchContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Track token usage from research phase
    const researchUsage = researchData.usage || { prompt_tokens: 0, completion_tokens: 0 };

    let research;
    try {
      research = JSON.parse(researchContent);
    } catch {
      console.error("Failed to parse research:", researchContent);
      return NextResponse.json({ error: "Failed to parse research data" }, { status: 500 });
    }

    // Step 2: Generate the full blog post content
    const contentResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap Auto Mode Pro",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are an expert content writer who creates engaging, well-researched, SEO-optimized content that ranks and converts. You specialize in ${format} content.

${businessContextPrompt}

=== WRITING CONFIGURATION ===
Format: ${formatInstructions[format]}
Tone: ${toneDescriptions[tone]}
Target Audience: ${audienceInstructions[audience]}
SEO Level: ${seoInstructions[seoLevel]}
Readability: ${readabilityInstructions[readabilityLevel]}
=== END CONFIGURATION ===

Write the FULL blog post in HTML format. Use these HTML tags:
- <h2> for main sections
- <h3> for subsections
- <p> for paragraphs
- <strong> for emphasis
- <ul><li> for unordered lists
- <ol><li> for numbered lists (especially for ${format === "listicle" || format === "howto" || format === "tutorial" ? "this format" : "step-by-step sections"})
- <blockquote> for quotes/callouts
${optimizeForFeaturedSnippet ? "- Use <div class=\"featured-snippet\"> to wrap content optimized for featured snippets" : ""}

Content Requirements:
${sectionInstructions.join("\n")}
${format === "listicle" ? "- Structure entire post as a numbered list with detailed explanations for each item" : ""}
${format === "howto" ? "- Include clear step-by-step numbered instructions" : ""}
${format === "casestudy" ? "- Include Problem, Solution, Implementation, and Results sections with specific metrics" : ""}
${format === "comparison" ? "- Include a comparison summary and clear pros/cons for each option" : ""}
${format === "tutorial" ? "- Include learning objectives at the start and step-by-step instructions with examples" : ""}
${format === "review" ? "- Include ratings, pros/cons, and a final verdict" : ""}
${optimizeForFeaturedSnippet ? "- Structure key sections to win featured snippets (use concise definitions, numbered steps, or comparison tables)" : ""}

Guidelines:
- Start with a powerful ${hookStyle} hook (no H1, title is separate)
- Include the target keyword "${research.topic?.targetKeyword || targetKeyword}" naturally in the first 100 words
- Use ${seoLevel === "heavy" ? "the keyword 8-10 times" : seoLevel === "light" ? "the keyword 2-3 times" : "the keyword 4-6 times"} throughout
- Include secondary keywords: ${research.topic?.secondaryKeywords?.join(", ")}
${research.topic?.lsiKeywords ? `- Incorporate LSI keywords: ${research.topic?.lsiKeywords?.join(", ")}` : ""}
- Use ${readabilityLevel === "simple" ? "short sentences and simple words" : readabilityLevel === "advanced" ? "sophisticated vocabulary" : "clear, balanced language"}
- Add subheadings every 200-300 words
- Include actionable takeaways
- Aim for approximately ${targetWordCount} words
- Make it scannable with bullets and bold text
- Write like a human expert, not AI - be ${tone} but authoritative
${businessContext ? `- Write as if you're the content team at ${businessContext.companyName}` : ""}
${customCta ? `- End with this CTA: "${customCta}"` : ""}`,
          },
          {
            role: "user",
            content: `Write a complete ${format} blog post based on this research:

Title: ${research.topic?.title}
Hook (${hookStyle} style): ${research.topic?.hook}
Angle: ${research.topic?.angle}
Target Keyword: ${research.topic?.targetKeyword}
Secondary Keywords: ${research.topic?.secondaryKeywords?.join(", ")}
${research.topic?.lsiKeywords ? `LSI Keywords: ${research.topic?.lsiKeywords?.join(", ")}` : ""}
Target Audience: ${research.topic?.targetAudience} (${audience} level)
Emotional Trigger: ${research.topic?.emotionalTrigger}
Content Gap to Fill: ${research.topic?.contentGap}
${research.competitorAnalysis ? `Unique Value Proposition: ${research.competitorAnalysis?.uniqueValue}` : ""}

Structure:
${research.structure?.sections?.map((s: { heading: string; purpose: string; keyPoints: string[]; includeExample?: boolean; includeStats?: boolean; featuredSnippetFormat?: string }, i: number) =>
  `${i + 1}. ${s.heading} - ${s.purpose} (Key points: ${s.keyPoints?.join(", ")})${s.featuredSnippetFormat && s.featuredSnippetFormat !== "none" ? ` [Optimize for featured snippet: ${s.featuredSnippetFormat}]` : ""}`
).join("\n")}

Introduction approach: ${research.structure?.introduction}
Conclusion approach: ${research.structure?.conclusion}
CTA: ${research.structure?.cta}

Content Configuration:
- Format: ${format}
- Tone: ${tone}
- Audience: ${audience}
- Readability: ${readabilityLevel}
- Target word count: ${targetWordCount} words
- Content depth: ${depth}
- SEO Level: ${seoLevel}
${optimizeForFeaturedSnippet ? "- PRIORITY: Optimize for featured snippets" : ""}

Write the full ${format} post now in HTML format. Make it exceptional and ensure it matches the ${tone} tone throughout.`,
          },
        ],
        max_tokens: depth === "deep-dive" ? 8000 : depth === "overview" ? 3000 : 5000,
        temperature: 0.8,
      }),
    });

    if (!contentResponse.ok) {
      const error = await contentResponse.text();
      console.error("Content API error:", error);
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: contentResponse.status }
      );
    }

    const contentData = await contentResponse.json();
    let content = contentData.choices?.[0]?.message?.content || "";

    // Track token usage from content generation phase
    const contentUsage = contentData.usage || { prompt_tokens: 0, completion_tokens: 0 };

    // Calculate total usage and cost
    const totalPromptTokens = researchUsage.prompt_tokens + contentUsage.prompt_tokens;
    const totalCompletionTokens = researchUsage.completion_tokens + contentUsage.completion_tokens;
    const { actualCost, creditsCost } = calculateCost(model, totalPromptTokens, totalCompletionTokens);

    // Clean up any markdown artifacts
    content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    // Deduct credits if user is authenticated
    let creditsDeducted = false;
    if (userId) {
      try {
        // Convert cost to cents for credit system
        const creditsToDeduct = Math.ceil(creditsCost * 100);

        await convex.mutation(api.credits.deductCredits, {
          userId,
          amount: creditsToDeduct,
          feature: "auto-post",
          model,
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          actualCostUSD: actualCost,
          serverSecret: process.env.CONVEX_SERVER_SECRET || "",
        });

        creditsDeducted = true;
      } catch (creditError) {
        console.warn("Failed to deduct credits (user may not have credits set up):", creditError);
        // Don't fail the request if credit deduction fails
        // This allows users without credits to still use the feature
      }
    }

    return NextResponse.json({
      success: true,
      research,
      content,
      title: research.topic?.title,
      metaDescription: research.seo?.metaDescription,
      slug: research.seo?.slug,
      tags: research.seo?.tags,
      category: research.seo?.category,
      targetKeyword: research.topic?.targetKeyword,
      secondaryKeywords: research.topic?.secondaryKeywords,
      lsiKeywords: research.topic?.lsiKeywords,
      socialMedia: research.socialMedia,
      competitorAnalysis: research.competitorAnalysis,
      configuration: {
        format,
        tone,
        audience,
        seoLevel,
        readabilityLevel,
        hookStyle,
        depth,
        wordCount: targetWordCount,
        model,
      },
      businessContext: businessContext ? {
        companyName: businessContext.companyName,
        brandVoice: businessContext.brandVoice,
      } : null,
      // Usage and cost tracking
      usage: {
        researchPhase: {
          promptTokens: researchUsage.prompt_tokens,
          completionTokens: researchUsage.completion_tokens,
        },
        contentPhase: {
          promptTokens: contentUsage.prompt_tokens,
          completionTokens: contentUsage.completion_tokens,
        },
        total: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          totalTokens: totalPromptTokens + totalCompletionTokens,
        },
        cost: {
          actualUSD: actualCost,
          creditsCharged: creditsCost,
          creditsDeducted,
          model,
        },
      },
    });

  } catch (error) {
    console.error("Auto post API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
