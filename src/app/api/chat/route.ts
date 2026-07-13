import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import {
  buildSystemPrompt,
  searchBlogPosts,
} from "@/lib/chat/companyKnowledge";
import {
  sendCompanyInfoEmail,
  submitLead,
} from "@/lib/chat/email";

export const maxDuration = 30;

const MAX_MESSAGES = 40;
const MAX_BODY_BYTES = 64_000;

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "Chat is not configured yet. Set AI_GATEWAY_API_KEY (or OPENAI_API_KEY) in the environment.",
      },
      { status: 503 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: { messages?: UIMessage[] };
  try {
    body = JSON.parse(rawBody) as { messages?: UIMessage[] };
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages.slice(-MAX_MESSAGES)
    : [];

  if (messages.length === 0) {
    return Response.json({ error: "messages required." }, { status: 400 });
  }

  const model = process.env.AI_CHAT_MODEL ?? "openai/gpt-4o-mini";

  const result = streamText({
    model,
    instructions: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    temperature: 0.4,
    tools: {
      search_blog_posts: tool({
        description:
          "Search Cherry Capital blog posts and return titles, excerpts, and full URLs to include in the reply.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "Topic keywords, e.g. AI, small business, SEO, Next.js, redesign",
            ),
        }),
        execute: async ({ query }) => {
          const posts = searchBlogPosts(query, 5);
          return {
            count: posts.length,
            posts,
          };
        },
      }),

      submit_lead: tool({
        description:
          "Send a visitor message / project inquiry to the Cherry Capital studio email. Use after collecting name, email, and message.",
        inputSchema: z.object({
          name: z.string().describe("Visitor full name"),
          email: z.string().email().describe("Visitor email"),
          message: z
            .string()
            .describe("Their project details or question for the studio"),
          websiteUrl: z
            .string()
            .optional()
            .describe("Optional current website URL"),
        }),
        execute: async (input) => submitLead(input),
      }),

      send_company_info_email: tool({
        description:
          "Email company information to the visitor (and notify the studio). Use when they ask for an email with studio details or confirm they want one.",
        inputSchema: z.object({
          email: z.string().email().describe("Visitor email to receive info"),
          name: z.string().optional().describe("Visitor name if known"),
          notes: z
            .string()
            .optional()
            .describe("Any project notes to include for the studio"),
        }),
        execute: async (input) => sendCompanyInfoEmail(input),
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
