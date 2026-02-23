import { NextRequest, NextResponse } from "next/server";
import { ajAIChat } from "@/lib/arcjet";
import { SOCIAL_MEDIA_SYSTEM_PROMPT } from "@/lib/social-media-templates";
import { auth } from "@clerk/nextjs/server";


// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Models that support function calling / tools
const TOOL_CAPABLE_MODELS = [
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "anthropic/claude-sonnet-4",
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
] as const;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ReasoningConfig {
  enabled?: boolean;
  effort?: "xhigh" | "high" | "medium" | "low" | "minimal" | "none";
  max_tokens?: number;
  exclude?: boolean;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  reasoning?: ReasoningConfig;
  webSearch?: boolean;
  systemPrompt?: string; // Custom system prompt (e.g., for invoice builder)
}

// Extended message type for tool calls
interface ExtendedChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  name?: string;
}

// Available models on OpenRouter (verified working)
export const AVAILABLE_MODELS = {
  // Free models
  "meta-llama/llama-3.2-3b-instruct:free": "Llama 3.2 3B (Free)",
  "mistralai/mistral-7b-instruct:free": "Mistral 7B (Free)",
  
  // Premium models
  "openai/gpt-4o": "GPT-4o",
  "openai/gpt-4o-mini": "GPT-4o Mini",
  "anthropic/claude-sonnet-4": "Claude Sonnet 4",
  "google/gemini-3-flash-preview": "Gemini 3 Flash",
  "google/gemini-2.5-pro": "Gemini 2.5 Pro",
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  "meta-llama/llama-3.1-70b-instruct": "Llama 3.1 70B",
  
  // Reasoning/Thinking models
  "deepseek/deepseek-r1": "DeepSeek R1",
  "openai/o3-mini": "OpenAI o3-mini",
} as const;

// Models that support reasoning tokens
export const REASONING_MODELS = [
  "deepseek/deepseek-r1",
  "openai/o3-mini",
  "anthropic/claude-sonnet-4",
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
] as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

const DEFAULT_MODEL: ModelId = "meta-llama/llama-3.2-3b-instruct:free";

// Clean up content from models that have formatting issues (like Gemini)
function cleanModelContent(content: string, model: string): string {
  if (!content) return content;
  
  // Gemini-specific fixes
  if (model.includes('gemini')) {
    // Fix escaped asterisks that break bold/italic
    content = content.replace(/\\\*/g, '*');
    // Fix escaped underscores
    content = content.replace(/\\_/g, '_');
    // Fix escaped brackets
    content = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
    // Fix escaped parentheses  
    content = content.replace(/\\\(/g, '(').replace(/\\\)/g, ')');
    // Fix double line breaks that create too much space
    content = content.replace(/\n{4,}/g, '\n\n\n');
    // Fix numbered lists with wrong formatting (e.g., "1\." -> "1.")
    content = content.replace(/(\d+)\\\./g, '$1.');
    // Fix bullet points that got mangled
    content = content.replace(/^\\\-/gm, '-');
    content = content.replace(/^\\\*/gm, '*');
  }
  
  return content;
}

const BASE_SYSTEM_PROMPT = `You are CherryCap AI, a helpful business assistant for small businesses in Northern Michigan and beyond. You help users with:
- Marketing strategy and copywriting
- Social media content creation (your specialty!)
- Business planning and brainstorming
- Email marketing campaigns
- Brand messaging and positioning
- Content ideas and calendars
- Customer engagement strategies
- Local business marketing tips

Be concise, professional, and actionable in your responses. Format your responses with markdown when appropriate.
Use a friendly, approachable tone while being genuinely helpful.

${SOCIAL_MEDIA_SYSTEM_PROMPT}`;

function buildSystemPrompt(): string {
  return BASE_SYSTEM_PROMPT;
}

export async function POST(req: NextRequest) {
  // Arcjet rate limiting + bot protection for AI chat
  const decision = await ajAIChat.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    // Provide user-friendly error messages based on denial reason
    let errorMessage = "Request blocked";
    let statusCode = 403;
    
    if (decision.reason.isRateLimit?.()) {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
      statusCode = 429;
    } else if (decision.reason.isBot?.()) {
      errorMessage = "Automated requests are not allowed";
    }
    
    return NextResponse.json(
      { error: errorMessage, reason: decision.reason },
      { status: statusCode }
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

    // Get auth for Kanban access
    const { userId } = await auth();

    const body: ChatRequest = await req.json();
    const { messages, model = DEFAULT_MODEL, stream = false, reasoning, webSearch = false, systemPrompt: customSystemPrompt } = body;
    
    // Check if model supports reasoning
    const supportsReasoning = REASONING_MODELS.includes(model as typeof REASONING_MODELS[number]);
    
    
    // For web search, we append :online to the model slug
    const effectiveModel = webSearch ? `${model}:online` : model;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Build system prompt - use custom if provided (e.g., for invoice builder)
    const systemPrompt = customSystemPrompt 
      ? `${buildSystemPrompt()}\n\n${customSystemPrompt}`
      : buildSystemPrompt();

    // Prepend system message
    const messagesWithSystem: ExtendedChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ ...m, content: m.content })),
    ];

    // Build request body with optional reasoning config and web search
    const buildRequestBody = (isStream: boolean, msgs: ExtendedChatMessage[] = messagesWithSystem) => {
      const requestBody: Record<string, unknown> = {
        model: effectiveModel,
        messages: msgs,
        stream: isStream,
      };
      
      // Add tools if Kanban is enabled
      
      // Add reasoning config if model supports it and reasoning is requested
      if (supportsReasoning && reasoning?.enabled) {
        requestBody.reasoning = {
          effort: reasoning.effort || "medium",
          exclude: reasoning.exclude || false,
        };
        if (reasoning.max_tokens) {
          requestBody.reasoning = { ...requestBody.reasoning as object, max_tokens: reasoning.max_tokens };
        }
      }
      
      // For web search, we can also use the plugins approach for more control
      // The :online suffix is simpler but plugins allow customization
      if (webSearch && !effectiveModel.includes(":online")) {
        requestBody.plugins = [{ id: "web", max_results: 5 }];
      }
      
      return requestBody;
    };

    // Non-streaming response
    if (!stream) {
      let currentMessages = [...messagesWithSystem];
      let maxIterations = 5; // Prevent infinite loops
      let iteration = 0;
      
      while (iteration < maxIterations) {
        iteration++;
        
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "CherryCap AI",
          },
          body: JSON.stringify(buildRequestBody(false, currentMessages)),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("OpenRouter API error:", error);
          return NextResponse.json(
            { error: "Failed to get response from AI" },
            { status: response.status }
          );
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const message = choice?.message;
        
        // Check if AI wants to call tools
        
        // No tool calls, return the response
        const rawMessage = message?.content || "Sorry, I couldn't generate a response.";
        const assistantMessage = cleanModelContent(rawMessage, model);
        const reasoningContent = message?.reasoning || null;

        return NextResponse.json({
          message: assistantMessage,
          reasoning: reasoningContent,
          model: data.model,
          usage: data.usage,
        });
      }
      
      // Max iterations reached
      return NextResponse.json({
        message: "I encountered an issue processing your request. Please try again.",
        model,
      });
    }

    // Streaming response with tool call support
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // For streaming with tools, we need a custom approach
    // First, make a non-streaming call to check for tool calls

    // Regular streaming (no Kanban tools)
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CherryCap AI",
      },
      body: JSON.stringify(buildRequestBody(true)),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    // Track citations for web search
    let collectedCitations: Array<{ url: string; title: string; content?: string }> = [];
    let citationsSent = false;

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              // Send collected citations before done signal
              if (webSearch && collectedCitations.length > 0 && !citationsSent) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations: collectedCitations })}\n\n`));
                citationsSent = true;
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              const message = parsed.choices?.[0]?.message; // For non-streaming chunks
              const content = delta?.content || "";
              const reasoningDetails = delta?.reasoning_details;
              const reasoning = delta?.reasoning;
              
              // Handle web search annotations/citations
              const annotations = delta?.annotations || message?.annotations;
              if (annotations && Array.isArray(annotations)) {
                for (const annotation of annotations) {
                  if (annotation.type === "url_citation" && annotation.url_citation) {
                    const citation = {
                      url: annotation.url_citation.url,
                      title: annotation.url_citation.title || new URL(annotation.url_citation.url).hostname,
                      content: annotation.url_citation.content,
                    };
                    // Avoid duplicates
                    if (!collectedCitations.some(c => c.url === citation.url)) {
                      collectedCitations.push(citation);
                    }
                  }
                }
              }
              
              // Handle reasoning tokens (thinking) - reasoning_details array format
              if (reasoningDetails && Array.isArray(reasoningDetails)) {
                for (const detail of reasoningDetails) {
                  if (detail.type === "reasoning.text" && detail.text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ reasoning: detail.text })}\n\n`));
                  }
                  else if (detail.type === "reasoning.summary" && detail.summary) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ reasoning: detail.summary })}\n\n`));
                  }
                }
              }
              // Handle direct reasoning field (some models like DeepSeek)
              else if (reasoning) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ reasoning })}\n\n`));
              }
              
              // Handle regular content
              if (content) {
                const cleanedContent = cleanModelContent(content, model);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cleanedContent })}\n\n`));
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
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET endpoint to return available models
export async function GET(req: NextRequest) {
  // Arcjet rate limiting + bot protection for AI chat
  const decision = await ajAIChat.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    let errorMessage = "Request blocked";
    let statusCode = 403;
    
    if (decision.reason.isRateLimit?.()) {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
      statusCode = 429;
    }
    
    return NextResponse.json(
      { error: errorMessage, reason: decision.reason },
      { status: statusCode }
    );
  }

  return NextResponse.json({
    models: AVAILABLE_MODELS,
    defaultModel: DEFAULT_MODEL,
  });
}
