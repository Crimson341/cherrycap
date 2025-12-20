import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Using Google's Gemini for image generation via OpenRouter
// This is a cost-effective alternative to DALL-E
const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

// Backup models in order of preference (cost-effective options)
const BACKUP_MODELS = [
  "google/gemini-2.0-flash-exp:free", // Free tier option
  "meta-llama/llama-4-maverick:free", // Free alternative
];

// Background style presets optimized for QR code overlay
export const QR_BACKGROUND_STYLES = {
  minimal: {
    name: "Minimal",
    description: "Clean, subtle background that won't distract from the QR code",
    promptEnhancement: `Style: Minimal, clean background design.
Soft gradient or subtle texture only.
Very light, muted colors that provide gentle contrast.
No busy patterns or strong elements.
Perfect for professional, corporate use.`,
  },
  festive: {
    name: "Festive",
    description: "Holiday and celebration themed backgrounds",
    promptEnhancement: `Style: Festive, celebratory background.
Themed decorative elements around the edges only.
Clear central area for QR code placement.
Warm, inviting atmosphere.
Subtle sparkles, confetti, or themed icons in corners.`,
  },
  nature: {
    name: "Nature",
    description: "Natural textures and organic patterns",
    promptEnhancement: `Style: Natural, organic background.
Soft botanical or nature-inspired elements.
Leaves, flowers, or natural textures at edges.
Earthy, calming color palette.
Clear center space for QR code.`,
  },
  luxury: {
    name: "Luxury",
    description: "Premium, high-end aesthetic",
    promptEnhancement: `Style: Luxury, premium background.
Gold foil, marble texture, or elegant patterns.
Sophisticated, upscale appearance.
Dark or cream base with metallic accents.
Clear central area for QR code placement.`,
  },
  tech: {
    name: "Tech",
    description: "Modern, digital aesthetic",
    promptEnhancement: `Style: Modern tech background.
Circuit patterns, geometric shapes, or digital elements.
Neon accents on dark background.
Futuristic, innovative feel.
Central area clear for QR code.`,
  },
  playful: {
    name: "Playful",
    description: "Fun, colorful designs for casual use",
    promptEnhancement: `Style: Playful, fun background.
Bright colors, rounded shapes, friendly patterns.
Cartoon-style or hand-drawn elements.
Energetic but not overwhelming.
Clear center for QR code placement.`,
  },
} as const;

function buildBackgroundPrompt(params: {
  prompt: string;
  style?: keyof typeof QR_BACKGROUND_STYLES;
  size?: number;
  season?: string;
  brandColors?: string[];
}): string {
  const styleConfig = params.style ? QR_BACKGROUND_STYLES[params.style] : null;

  let colorInstructions = "";
  if (params.brandColors && params.brandColors.length > 0) {
    colorInstructions = `
COLOR PALETTE:
Use these brand colors as the primary palette: ${params.brandColors.join(", ")}
Incorporate these colors naturally into the design.`;
  }

  let seasonalInstructions = "";
  if (params.season) {
    const seasonalPrompts: Record<string, string> = {
      christmas: "Add subtle Christmas elements: snowflakes, holly, pine branches, red and green accents",
      halloween: "Add subtle Halloween elements: pumpkins, bats, orange and purple tones",
      valentines: "Add subtle Valentine's elements: hearts, pink and red tones, romantic feel",
      spring: "Add subtle spring elements: cherry blossoms, fresh greens, pastel colors",
      summer: "Add subtle summer elements: tropical vibes, bright colors, beach tones",
      autumn: "Add subtle autumn elements: falling leaves, warm oranges and browns",
      winter: "Add subtle winter elements: snowflakes, icy blues, cozy feel",
    };
    seasonalInstructions = seasonalPrompts[params.season] || "";
  }

  return `Create a beautiful background image for a QR code.

${params.prompt}

${styleConfig?.promptEnhancement || ""}
${colorInstructions}
${seasonalInstructions}

CRITICAL REQUIREMENTS:
- The image MUST have a clear, uncluttered CENTER area where the QR code will be placed
- Decorative elements should be positioned around the EDGES and CORNERS only
- The background should ENHANCE the QR code, not compete with it
- Image should be square format
- High quality, professional appearance
- Subtle enough that a QR code placed on top remains scannable
- Use soft transitions and avoid harsh contrast in the center
- Resolution: ${params.size || 512}x${params.size || 512} pixels

Generate a single, beautiful background image optimized for QR code overlay.`;
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

    const body = await req.json();
    const {
      prompt,
      style,
      size = 512,
      season,
      brandColors,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const fullPrompt = buildBackgroundPrompt({
      prompt,
      style: style as keyof typeof QR_BACKGROUND_STYLES,
      size,
      season,
      brandColors,
    });

    // Try primary model first, then fallbacks
    let lastError = null;

    for (const model of [IMAGE_MODEL, ...BACKUP_MODELS]) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "CherryCap QR Studio",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: fullPrompt }],
            modalities: ["image", "text"],
            image_config: { aspect_ratio: "1:1" },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed:`, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        const result = await response.json();
        const message = result.choices?.[0]?.message;
        const images = message?.images || [];

        if (images.length > 0) {
          const imageUrl = images[0]?.image_url?.url || images[0]?.imageUrl?.url || images[0];

          return NextResponse.json({
            success: true,
            imageUrl,
            model,
            message: message?.content || "Background generated successfully",
          });
        }
      } catch (modelError) {
        console.error(`Model ${model} error:`, modelError);
        lastError = modelError;
        continue;
      }
    }

    // All models failed
    return NextResponse.json(
      { error: `Failed to generate image with all available models. Last error: ${lastError}` },
      { status: 500 }
    );
  } catch (error) {
    console.error("QR background API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to return available styles
export async function GET() {
  return NextResponse.json({
    styles: Object.entries(QR_BACKGROUND_STYLES).map(([key, value]) => ({
      id: key,
      ...value
    })),
    model: IMAGE_MODEL,
    backupModels: BACKUP_MODELS,
  });
}
