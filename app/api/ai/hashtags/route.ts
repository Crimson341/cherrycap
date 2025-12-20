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

    const { content, title, platforms } = await req.json();
    
    if (!content || content.length < 20) {
      return NextResponse.json(
        { error: "Content too short for hashtag generation" },
        { status: 400 }
      );
    }

    // Build platform-specific context
    const platformContext = platforms && platforms.length > 0
      ? `Target platforms: ${platforms.join(", ")}. Adjust hashtag style accordingly (e.g., fewer hashtags for Twitter, more for Instagram).`
      : "Generate versatile hashtags suitable for multiple platforms.";

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap Hashtag Generator",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a social media hashtag expert. Generate relevant, trending hashtags for the given content.

Rules:
- Generate 10-15 hashtags
- Mix popular and niche hashtags for better reach
- Include hashtags with different reach levels (high-volume trending + specific niche)
- All hashtags must start with #
- No spaces in hashtags, use CamelCase for multi-word tags
- Focus on discoverability and engagement
- ${platformContext}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`,
          },
          {
            role: "user",
            content: `Generate hashtags for this content:

Title: ${title || "Untitled"}

Content: ${content.slice(0, 800)}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to generate hashtags" },
        { status: response.status }
      );
    }

    const data = await response.json();
    let responseContent = data.choices?.[0]?.message?.content || "";
    
    // Clean up the response - remove markdown code blocks if present
    responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(responseContent);
      
      // Ensure all hashtags start with #
      const hashtags = (parsed.hashtags || []).map((tag: string) => 
        tag.startsWith('#') ? tag : `#${tag}`
      );
      
      return NextResponse.json({ hashtags });
    } catch {
      // If parsing fails, try to extract hashtags from text
      console.error("Failed to parse hashtags:", responseContent);
      const hashtagMatches = responseContent.match(/#\w+/g) || [];
      return NextResponse.json({ hashtags: hashtagMatches.slice(0, 15) });
    }
  } catch (error) {
    console.error("Hashtags API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
