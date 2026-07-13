import { z } from "zod";

import { submitLead } from "@/lib/chat/email";

const MAX_BODY_BYTES = 16_384;

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(2).max(5_000),
  subjectPrefix: z.string().trim().min(1).max(80).optional(),
});

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid origin." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return Response.json({ error: "Invalid contact details." }, { status: 400 });
  }

  const result = await submitLead({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    source: "contact",
    subjectPrefix: parsed.data.subjectPrefix,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
