import { NextRequest, NextResponse } from "next/server";
import { ajAIChat } from "@/lib/arcjet";
import { SOCIAL_MEDIA_SYSTEM_PROMPT } from "@/lib/social-media-templates";
import { KANBAN_TOOLS, KANBAN_FUNCTION_TO_ACTION, KANBAN_SYSTEM_PROMPT } from "@/lib/kanban-tools";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Initialize Convex HTTP client for Kanban operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
  enableKanban?: boolean; // Enable Kanban board access
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
- Project management and task tracking (via Kanban boards)

Be concise, professional, and actionable in your responses. Format your responses with markdown when appropriate.
Use a friendly, approachable tone while being genuinely helpful.

${SOCIAL_MEDIA_SYSTEM_PROMPT}`;

function buildSystemPrompt(includeKanban: boolean = false): string {
  if (includeKanban) {
    return BASE_SYSTEM_PROMPT + KANBAN_SYSTEM_PROMPT;
  }
  return BASE_SYSTEM_PROMPT;
}

// Execute a Kanban tool call directly via Convex
async function executeKanbanTool(
  functionName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<{ success: boolean; data?: unknown; message?: string; error?: string }> {
  const action = KANBAN_FUNCTION_TO_ACTION[functionName];
  if (!action) {
    return { success: false, error: `Unknown Kanban function: ${functionName}` };
  }

  try {
    let result: unknown;

    switch (action) {
      case "getBoards": {
        result = await convex.query(api.kanban.getBoards, { userId });
        return {
          success: true,
          data: result,
          message: `Found ${Array.isArray(result) ? result.length : 0} board(s)`,
        };
      }

      case "getBoard": {
        if (!args.boardId) {
          return { success: false, error: "boardId is required" };
        }
        result = await convex.query(api.kanban.getBoard, {
          boardId: args.boardId as Id<"kanbanBoards">,
        });
        if (!result) {
          return { success: false, error: "Board not found" };
        }
        return {
          success: true,
          data: result,
          message: "Board retrieved successfully",
        };
      }

      case "createBoard": {
        if (!args.boardName) {
          return { success: false, error: "boardName is required" };
        }
        result = await convex.mutation(api.kanban.createBoard, {
          userId,
          name: args.boardName as string,
          description: args.boardDescription as string | undefined,
          color: args.boardColor as string | undefined,
        });
        return {
          success: true,
          data: { boardId: result },
          message: `Board "${args.boardName}" created successfully`,
        };
      }

      case "createTask": {
        if (!args.boardId || !args.columnId || !args.title) {
          return { success: false, error: "boardId, columnId, and title are required" };
        }
        result = await convex.mutation(api.kanban.createTask, {
          boardId: args.boardId as Id<"kanbanBoards">,
          columnId: args.columnId as Id<"kanbanColumns">,
          title: args.title as string,
          description: args.description as string | undefined,
          priority: args.priority as "low" | "medium" | "high" | "urgent" | undefined,
          dueDate: args.dueDate ? new Date(args.dueDate as string).getTime() : undefined,
          labels: args.labels as string[] | undefined,
          assignedTo: args.assignedTo as string[] | undefined,
        });
        return {
          success: true,
          data: { taskId: result },
          message: `Task "${args.title}" created successfully`,
        };
      }

      case "updateTask": {
        if (!args.taskId) {
          return { success: false, error: "taskId is required" };
        }
        await convex.mutation(api.kanban.updateTask, {
          taskId: args.taskId as Id<"kanbanTasks">,
          title: args.title as string | undefined,
          description: args.description as string | undefined,
          priority: args.priority as "low" | "medium" | "high" | "urgent" | undefined,
          dueDate: args.dueDate ? new Date(args.dueDate as string).getTime() : undefined,
          labels: args.labels as string[] | undefined,
          assignedTo: args.assignedTo as string[] | undefined,
        });
        return {
          success: true,
          message: "Task updated successfully",
        };
      }

      case "deleteTask": {
        if (!args.taskId) {
          return { success: false, error: "taskId is required" };
        }
        await convex.mutation(api.kanban.deleteTask, {
          taskId: args.taskId as Id<"kanbanTasks">,
        });
        return {
          success: true,
          message: "Task deleted successfully",
        };
      }

      case "moveTask": {
        if (!args.taskId || !args.targetColumnId) {
          return { success: false, error: "taskId and targetColumnId are required" };
        }
        await convex.mutation(api.kanban.moveTask, {
          taskId: args.taskId as Id<"kanbanTasks">,
          targetColumnId: args.targetColumnId as Id<"kanbanColumns">,
          newOrder: (args.newOrder as number) ?? 0,
        });
        return {
          success: true,
          message: "Task moved successfully",
        };
      }

      case "getMyTasks": {
        result = await convex.query(api.kanban.getMyTasks, { userId });
        return {
          success: true,
          data: result,
          message: `Found ${Array.isArray(result) ? result.length : 0} task(s) assigned to you`,
        };
      }

      case "completeTask": {
        if (!args.taskId || !args.boardId) {
          return { success: false, error: "taskId and boardId are required" };
        }
        // Get the board to find the "Done" column
        const board = await convex.query(api.kanban.getBoard, {
          boardId: args.boardId as Id<"kanbanBoards">,
        }) as { columns: Array<{ _id: string; name: string }> } | null;
        
        if (!board) {
          return { success: false, error: "Board not found" };
        }
        
        const doneColumn = board.columns?.find(
          (col) => col.name.toLowerCase() === "done"
        );
        
        if (doneColumn) {
          await convex.mutation(api.kanban.moveTask, {
            taskId: args.taskId as Id<"kanbanTasks">,
            targetColumnId: doneColumn._id as Id<"kanbanColumns">,
            newOrder: 0,
          });
        }
        return {
          success: true,
          message: "Task marked as complete",
        };
      }

      case "addSubtask": {
        if (!args.taskId || !args.subtaskTitle) {
          return { success: false, error: "taskId and subtaskTitle are required" };
        }
        result = await convex.mutation(api.kanban.addSubtask, {
          taskId: args.taskId as Id<"kanbanTasks">,
          title: args.subtaskTitle as string,
        });
        return {
          success: true,
          data: { subtaskId: result },
          message: "Subtask added successfully",
        };
      }

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (error) {
    console.error("Kanban tool error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Kanban operation failed: ${errorMessage}` };
  }
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
    const { messages, model = DEFAULT_MODEL, stream = false, reasoning, webSearch = false, systemPrompt: customSystemPrompt, enableKanban = false } = body;
    
    // Check if model supports reasoning
    const supportsReasoning = REASONING_MODELS.includes(model as typeof REASONING_MODELS[number]);
    
    // Check if model supports tools (for Kanban)
    const supportsTools = TOOL_CAPABLE_MODELS.includes(model as typeof TOOL_CAPABLE_MODELS[number]);
    
    // Only enable Kanban if user is authenticated and model supports tools
    const useKanban = enableKanban && supportsTools && !!userId;
    
    // Debug logging
    if (enableKanban) {
      console.log("[Chat API] Kanban requested:", { enableKanban, supportsTools, userId: !!userId, useKanban, model });
    }
    
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
      ? `${buildSystemPrompt(useKanban)}\n\n${customSystemPrompt}`
      : buildSystemPrompt(useKanban);

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
      if (useKanban) {
        requestBody.tools = KANBAN_TOOLS;
        requestBody.tool_choice = "auto";
      }
      
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
        if (message?.tool_calls && message.tool_calls.length > 0 && useKanban) {
          console.log("[Chat API] AI requested tool calls:", message.tool_calls.map((t: { function: { name: string } }) => t.function.name));
          
          // Add assistant message with tool calls
          currentMessages.push({
            role: "assistant",
            content: message.content || null,
            tool_calls: message.tool_calls,
          });
          
          // Execute each tool call
          for (const toolCall of message.tool_calls) {
            const functionName = toolCall.function.name;
            let args: Record<string, unknown> = {};
            
            try {
              args = JSON.parse(toolCall.function.arguments);
            } catch {
              args = {};
            }
            
            console.log("[Chat API] Executing tool:", functionName, args);
            
            // Execute the Kanban tool
            const result = await executeKanbanTool(functionName, args, userId!);
            console.log("[Chat API] Tool result:", result);
            
            // Add tool result to messages
            currentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: functionName,
              content: JSON.stringify(result),
            });
          }
          
          // Continue the loop to get AI's response after tool execution
          continue;
        }
        
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
    if (useKanban) {
      // For Kanban-enabled requests, use non-streaming for tool handling
      // then stream the final response
      let currentMessages = [...messagesWithSystem];
      let maxIterations = 5;
      let iteration = 0;
      let toolsExecuted: Array<{ name: string; result: unknown }> = [];
      
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
          body: JSON.stringify(buildRequestBody(false, currentMessages)), // Non-streaming for tool detection
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
        
        if (message?.tool_calls && message.tool_calls.length > 0) {
          currentMessages.push({
            role: "assistant",
            content: message.content || null,
            tool_calls: message.tool_calls,
          });
          
          for (const toolCall of message.tool_calls) {
            const functionName = toolCall.function.name;
            let args: Record<string, unknown> = {};
            
            try {
              args = JSON.parse(toolCall.function.arguments);
            } catch {
              args = {};
            }
            
            const result = await executeKanbanTool(functionName, args, userId);
            toolsExecuted.push({ name: functionName, result });
            
            currentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: functionName,
              content: JSON.stringify(result),
            });
          }
          
          continue;
        }
        
        // No more tool calls, stream the final response
        // Create a readable stream from the final content
        const finalContent = message?.content || "";
        const cleanedContent = cleanModelContent(finalContent, model);
        
        const responseStream = new ReadableStream({
          start(controller) {
            // If tools were executed, send tool execution info first
            if (toolsExecuted.length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                toolsExecuted: toolsExecuted.map(t => t.name) 
              })}\n\n`));
            }
            
            // Stream the content character by character for a typing effect
            const words = cleanedContent.split(' ');
            let wordIndex = 0;
            
            const streamWords = () => {
              if (wordIndex < words.length) {
                const word = words[wordIndex] + (wordIndex < words.length - 1 ? ' ' : '');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
                wordIndex++;
                // Small delay between words for typing effect
                setTimeout(streamWords, 10);
              } else {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              }
            };
            
            streamWords();
          },
        });
        
        return new Response(responseStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }
    }

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
