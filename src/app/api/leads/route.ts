import { createLead, setLeadNotificationStatus } from "@/lib/leads/db";
import { z } from "zod";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(2).max(4000),
  website: z.string().trim().max(200).optional().default(""),
});

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return requestUrl.host === originUrl.host;
  } catch {
    return false;
  }
}

async function sendLeadNotification(input: z.infer<typeof LeadSchema>) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("WEB3FORMS_ACCESS_KEY is not configured");
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      name: input.name,
      email: input.email,
      phone: input.phone || "Not provided",
      company: input.company || "Not provided",
      message: input.message,
      subject: `New Cherry Capital lead: ${input.name}`,
      from_name: "Cherry Capital Web",
    }),
  });

  const result = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.message || `Notification service returned ${response.status}`,
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the form fields and try again." },
      { status: 400 },
    );
  }

  // Honeypot fields are invisible to people but commonly filled by simple bots.
  if (parsed.data.website) {
    return Response.json({ ok: true }, { status: 201 });
  }

  try {
    const createdAt = Date.now();
    const id = crypto.randomUUID();
    const lead = await createLead({
      id,
      createdAt,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      message: parsed.data.message,
    });

    if (!lead.duplicate) {
      try {
        await sendLeadNotification(parsed.data);
        await setLeadNotificationStatus(lead.id, "sent");
      } catch (error) {
        console.error("Lead notification failed", error);
        await setLeadNotificationStatus(lead.id, "failed");
      }
    }

    return Response.json(
      { ok: true, id: lead.id, duplicate: lead.duplicate },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lead persistence failed", error);
    return Response.json(
      { error: "Your message could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
