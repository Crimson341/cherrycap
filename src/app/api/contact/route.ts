import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY ?? "c2147bbb-80e5-4247-be9b-59b36f804b59";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const ContactRequestSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  message: z.string().trim().min(2),
});

type Web3FormsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
  };
};

async function captureOutgoingEmail(input: {
  name: string;
  email: string;
  message: string;
  subject: string;
  providerMessageId?: string;
}) {
  if (!convexUrl) {
    return;
  }

  try {
    const client = new ConvexHttpClient(convexUrl, { logger: false });
    await client.mutation(api.dashboard.captureOutgoingEmail, {
      name: input.name,
      email: input.email,
      message: input.message,
      subject: input.subject,
      destination: "Cherry Capital contact inbox (Web3Forms)",
      provider: "web3forms",
      deliveryStatus: "sent",
      providerMessageId: input.providerMessageId,
    });
  } catch (error) {
    console.warn("Failed to capture outgoing email in Convex", error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ContactRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid contact submission." },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;
  const subject = `Portfolio Contact: ${name}`;
  const formData = new FormData();

  formData.append("access_key", WEB3FORMS_ACCESS_KEY);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("message", message);
  formData.append("subject", subject);

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      body: formData,
    });
  } catch {
    return Response.json(
      { error: "Could not reach the email provider." },
      { status: 502 },
    );
  }

  const payload = (await upstreamResponse.json().catch(() => null)) as Web3FormsResponse | null;

  if (!upstreamResponse.ok || !payload?.success) {
    return Response.json(
      {
        error: payload?.message ?? "Could not send contact email.",
      },
      { status: 502 },
    );
  }

  await captureOutgoingEmail({
    name,
    email,
    message,
    subject,
    providerMessageId: payload.data?.id,
  });

  return Response.json({
    success: true,
    messageId: payload.data?.id ?? null,
  });
}
