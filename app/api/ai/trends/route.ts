import { NextRequest, NextResponse } from "next/server";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const { topic, type = "all" } = await req.json();
    const searchTopic = topic || "general";

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap Trend Finder",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert content strategist and SEO researcher. Generate comprehensive trending blog post ideas based on the topic.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "trends": [
    {
      "title": "Compelling, SEO-optimized blog post title",
      "views": "125K",
      "category": "Specific sub-category",
      "growth": "+45%",
      "type": "trending",
      "difficulty": "medium",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "searchIntent": "informational",
      "contentAngles": ["Angle 1 to approach this topic", "Angle 2 for unique perspective"],
      "targetAudience": "Who this content is for",
      "estimatedWordCount": 1500,
      "competitorGap": "What's missing in existing content"
    }
  ],
  "relatedTopics": ["related topic 1", "related topic 2", "related topic 3", "related topic 4", "related topic 5"],
  "trendingSummary": "Brief 1-2 sentence summary of what's hot in this space right now"
}

Guidelines for each trend:
- title: Compelling, click-worthy, SEO-friendly (60 chars max)
- views: Realistic monthly search estimates (5K, 25K, 125K, 1.2M format)
- category: Specific niche within the topic
- growth: Trending momentum percentage (+15% to +200%)
- type: One of "trending" (hot now), "rising" (gaining traction), "evergreen" (always relevant), "seasonal" (time-specific)
- difficulty: "easy" (low competition), "medium" (moderate), "hard" (very competitive)
- keywords: 3-5 related search terms people use
- searchIntent: "informational", "transactional", "navigational", or "commercial"
- contentAngles: 2-3 unique ways to approach this topic differently
- targetAudience: Specific audience segment
- estimatedWordCount: Recommended article length (800-3000)
- competitorGap: What existing content is missing

Generate exactly 10 diverse trends mixing different types and difficulties.`,
          },
          {
            role: "user",
            content: `Find 10 trending blog post ideas for: ${searchTopic}${type !== "all" ? `. Focus on ${type} content types.` : ""}`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch trends" },
        { status: response.status }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      // If parsing fails, return empty trends
      console.error("Failed to parse trends:", content);
      return NextResponse.json({ trends: [], relatedTopics: [], trendingSummary: "" });
    }
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
