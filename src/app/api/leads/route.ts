import { createLead, setLeadNotificationStatus } from "@/lib/leads/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";

const LEAD_RECIPIENT = "scott@cherrycapitalweb.com";
const LEAD_SENDER = "leads@cherrycapitalweb.com";

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
  const { env } = getCloudflareContext();
  if (!env.EMAIL) {
    throw new Error("EMAIL binding is not configured");
  }

  const text = [
    "New Cherry Capital website lead",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Company: ${input.company || "Not provided"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  await env.EMAIL.send({
    from: { email: LEAD_SENDER, name: "Cherry Capital Web" },
    to: LEAD_RECIPIENT,
    replyTo: { email: input.email, name: input.name },
    subject: `New Cherry Capital lead: ${input.name}`,
    text,
  });
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
