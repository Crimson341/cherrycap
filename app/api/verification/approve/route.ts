import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse(generateHtml("Error", "Missing approval token", "error"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Approve the request
    const result = await convex.mutation(api.verification.approveByToken, { token });

    return new NextResponse(
      generateHtml(
        "Verification Approved! 🍒",
        `<strong>${result.businessName}</strong> has been verified!<br><br>
        The user (${result.email}) will receive a notification and can now publish content with their cherry badge.`,
        "success"
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return new NextResponse(
      generateHtml("Approval Failed", message, "error"),
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

function generateHtml(title: string, message: string, type: "success" | "error"): string {
  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  const icon = type === "success" ? "✓" : "✕";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - CherryCap</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: ${bgColor}20;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
      color: ${bgColor};
    }
    h1 {
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #a3a3a3;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    .button:hover { opacity: 0.9; }
    .logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fb7185, #e11d48);
      margin: 0 auto 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"></div>
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/dashboard" class="button">Go to Dashboard</a>
  </div>
</body>
</html>
  `;
}
