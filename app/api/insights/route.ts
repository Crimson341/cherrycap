import { NextRequest, NextResponse } from "next/server";
import { ajStrict } from "@/lib/arcjet";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface AnalyticsData {
  siteName: string;
  domain: string;
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Record<string, number>;
  devices: Record<string, number>;
  performance: {
    avgLoadTime: number;
    avgTTFB: number;
    avgFCP: number;
  };
}

export interface InsightsRequest {
  analyticsData: AnalyticsData;
}

const INSIGHTS_SYSTEM_PROMPT = `You are an expert business analyst and growth strategist. Your job is to analyze website analytics data and provide actionable business insights and recommendations.

Based on the analytics data provided, generate 4-6 specific, actionable insights. Each insight should:
1. Identify a pattern or opportunity in the data
2. Explain why it matters for the business
3. Provide a clear, actionable recommendation

Format your response as a JSON array of insights with this structure:
[
  {
    "title": "Brief title for the insight",
    "type": "opportunity" | "warning" | "success" | "tip",
    "description": "Detailed explanation of the insight",
    "action": "Specific action the user should take",
    "metric": "The key metric this relates to",
    "priority": "high" | "medium" | "low"
  }
]

Focus on:
- Traffic growth opportunities
- Conversion optimization
- Performance improvements
- Content strategy
- User engagement
- Device/platform optimization

Be specific with numbers from the data. Don't be generic - tailor insights to their actual metrics.`;

export async function POST(req: NextRequest) {
  const decision = await ajStrict.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Request blocked", reason: decision.reason },
      { status: 403 }
    );
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const body: InsightsRequest = await req.json();
    const { analyticsData } = body;

    if (!analyticsData) {
      return NextResponse.json(
        { error: "Analytics data is required" },
        { status: 400 }
      );
    }

    const userPrompt = `Analyze this website analytics data and provide actionable business insights:

Site: ${analyticsData.siteName} (${analyticsData.domain})

Traffic (Last 30 Days):
- Total Visitors: ${analyticsData.visitors.toLocaleString()}
- Page Views: ${analyticsData.pageViews.toLocaleString()}
- Bounce Rate: ${analyticsData.bounceRate}%
- Avg Session Duration: ${analyticsData.avgSessionDuration} seconds

Top Pages:
${analyticsData.topPages.slice(0, 5).map((p, i) => `${i + 1}. ${p.path}: ${p.views.toLocaleString()} views`).join('\n')}

Traffic Sources:
${Object.entries(analyticsData.trafficSources).map(([source, count]) => `- ${source}: ${count.toLocaleString()}`).join('\n')}

Devices:
${Object.entries(analyticsData.devices).map(([device, count]) => `- ${device}: ${count.toLocaleString()}`).join('\n')}

Performance:
- Avg Load Time: ${analyticsData.performance.avgLoadTime}ms
- Avg Time to First Byte: ${analyticsData.performance.avgTTFB}ms
- Avg First Contentful Paint: ${analyticsData.performance.avgFCP}ms

Provide specific, actionable insights based on this data.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap AI Insights",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: INSIGHTS_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No insights generated" },
        { status: 500 }
      );
    }

    try {
      const insights = JSON.parse(content);
      return NextResponse.json({
        insights: Array.isArray(insights) ? insights : insights.insights || [],
        generatedAt: new Date().toISOString(),
        model: data.model,
      });
    } catch {
      // If JSON parsing fails, return raw content
      return NextResponse.json({
        insights: [],
        rawContent: content,
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
