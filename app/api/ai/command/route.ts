import { NextRequest, NextResponse } from "next/server";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Available models for AI commands
export const AI_MODELS = {
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  "openai/gpt-4.1": "GPT-4.1",
  "openai/gpt-4.1-mini": "GPT-4.1 Mini", 
  "anthropic/claude-sonnet-4": "Claude Sonnet 4",
  "x-ai/grok-3-mini": "Grok 3 Mini",
} as const;

const DEFAULT_MODEL = "google/gemini-2.5-flash";

// AI command types and their prompts
const COMMAND_PROMPTS: Record<string, string> = {
  improve: "Improve the writing quality of this text. Make it clearer, more engaging, and better structured. Keep the same meaning and length.",
  shorten: "Make this text more concise while keeping the key message. Remove unnecessary words and redundancy.",
  expand: "Expand on this text with more detail, examples, or context. Make it more comprehensive.",
  paraphrase: "Rewrite this text in a different way while keeping the same meaning. Use different words and sentence structures.",
  grammar: "Fix all grammar, spelling, and punctuation errors in this text. Keep the original meaning intact.",
  formal: "Rewrite this text in a more professional and formal tone.",
  casual: "Rewrite this text in a more conversational and friendly tone.",
  simplify: "Simplify this text for easier reading. Use simpler words and shorter sentences.",
  continue: "Continue writing from where this text ends. Match the style and tone.",
  summarize: "Summarize the key points of this text in 1-2 sentences.",
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const { command, text, customPrompt, model } = await req.json();
    
    // Use provided model or default
    const selectedModel = model && AI_MODELS[model as keyof typeof AI_MODELS] ? model : DEFAULT_MODEL;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get the prompt for this command, or use custom prompt
    const systemPrompt = customPrompt || COMMAND_PROMPTS[command];
    
    if (!systemPrompt) {
      return NextResponse.json(
        { error: "Invalid command" },
        { status: 400 }
      );
    }

    // For streaming response
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap Blog Editor",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `You are an AI writing assistant helping with blog content. ${systemPrompt}

Important:
- Only return the improved/modified text, nothing else
- Don't include explanations or preamble
- Don't wrap the response in quotes
- Maintain the same format (paragraphs, lists, etc.) unless asked otherwise`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      }),
      signal: req.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to process command" },
        { status: response.status }
      );
    }

    // Stream the response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      },
    });

    const readable = response.body?.pipeThrough(transformStream);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(null, { status: 408 });
    }
    console.error("Command API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to return available commands and models
export async function GET() {
  return NextResponse.json({
    commands: Object.keys(COMMAND_PROMPTS),
    descriptions: {
      improve: "Improve writing quality",
      shorten: "Make more concise",
      expand: "Add more detail",
      paraphrase: "Rewrite differently",
      grammar: "Fix grammar & spelling",
      formal: "Make more professional",
      casual: "Make more conversational",
      simplify: "Simplify language",
      continue: "Continue writing",
      summarize: "Summarize key points",
    },
    models: AI_MODELS,
    defaultModel: DEFAULT_MODEL,
  });
}
