import { createLead, setLeadNotificationStatus } from "@/lib/leads/db";
import { z } from "zod";

const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY ?? "c2147bbb-80e5-4247-be9b-59b36f804b59";

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
  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_ACCESS_KEY);
  formData.append("name", input.name);
  formData.append("email", input.email);
  formData.append("phone", input.phone || "Not provided");
  formData.append("company", input.company || "Not provided");
  formData.append("message", input.message);
  formData.append("subject", `New Cherry Capital lead: ${input.name}`);
  formData.append("from_name", "Cherry Capital Web");

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Notification service returned ${response.status}`);
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
