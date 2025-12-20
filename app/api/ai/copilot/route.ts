import { NextRequest, NextResponse } from "next/server";

// Groq API - FASTEST inference available
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Llama 3 8B on Groq - blazing fast
const COPILOT_MODEL = "llama3-8b-8192";

export async function POST(req: NextRequest) {
  try {
    // Try Groq first (fastest), fallback to OpenRouter
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!groqKey && !openrouterKey) {
      return NextResponse.json(
        { error: "No API key configured" },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use Groq if available (way faster), otherwise OpenRouter
    const useGroq = !!groqKey;
    const apiUrl = useGroq ? GROQ_API_URL : "https://openrouter.ai/api/v1/chat/completions";
    const apiKey = useGroq ? groqKey : openrouterKey;
    const model = useGroq ? COPILOT_MODEL : "meta-llama/llama-3.2-3b-instruct:free";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(useGroq ? {} : {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "CherryCap",
        }),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `Complete the text naturally. Output ONLY the completion (5-15 words). If unsure, output: 0`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 25,
        temperature: 0.6,
        stream: false,
      }),
      signal: req.signal,
    });

    if (!response.ok) {
      return NextResponse.json({ text: "0" });
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "0";
    
    // Quick cleanup
    text = text.trim().replace(/^["']|["']$/g, '').replace(/^(Output:|Completion:)\s*/i, '');
    
    if (!text || text === "0" || text.length < 2) {
      return NextResponse.json({ text: "0" });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: "0" });
  }
}
