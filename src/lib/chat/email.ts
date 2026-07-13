import { getCompanyInfoPacket } from "@/lib/chat/companyKnowledge";
import { portfolioConfig } from "@/lib/portfolioConfig";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

function accessKey() {
  return process.env.WEB3FORMS_ACCESS_KEY;
}

function stripControl(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

async function submitWeb3Forms(fields: Record<string, string>) {
  const key = accessKey();
  if (!key) {
    return {
      ok: false as const,
      error: "Lead delivery is not configured.",
    };
  }

  const formData = new FormData();
  formData.append("access_key", key);
  formData.append("botcheck", "");
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const response = await fetch(WEB3FORMS_URL, {
    method: "POST",
    body: formData,
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!response.ok || result?.success === false) {
    return {
      ok: false as const,
      error: result?.message ?? "Email service rejected the request.",
    };
  }

  return { ok: true as const };
}

function formatCompanyInfoEmailBody(visitorName?: string) {
  const info = getCompanyInfoPacket();
  const greeting = visitorName ? `Hi ${visitorName},` : "Hi,";

  return `${greeting}

Thanks for chatting with Cherry Capital. Here's a quick overview of the studio:

${info.business}
${info.tagline}

Location: ${info.location}
Email: ${info.email}
Website: ${info.website}
Contact form: ${info.contactPage}

Services:
${info.services.map((s) => `• ${s.title} — ${s.body}`).join("\n")}

Pricing:
${info.pricing.note}

Recent work:
${info.projects.map((p) => `• ${p.name} (${p.place}) — ${p.url}`).join("\n")}

Blog:
${info.blogs.map((b) => `• ${b.title} — ${b.url}`).join("\n") || "• " + info.blogIndex}

Reply to this thread or email ${info.email} with a few details about your site (goals, current URL if any, rough timeline) and Scott will get back to you, usually within one business day.

— Cherry Capital
${info.website}
`;
}

export type LeadInput = {
  name: string;
  email: string;
  message: string;
  websiteUrl?: string;
  source?: "chat" | "contact";
  subjectPrefix?: string;
};

export async function submitLead(input: LeadInput) {
  const name = stripControl(input.name).slice(0, 100);
  const email = stripControl(input.email).slice(0, 254);
  const message = input.message.replace(/\r\n/g, "\n").trim().slice(0, 5000);
  const websiteUrl = input.websiteUrl
    ? stripControl(input.websiteUrl).slice(0, 500)
    : "";

  if (name.length < 2) {
    return { ok: false as const, error: "Name is too short." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Invalid email address." };
  }
  if (message.length < 2) {
    return { ok: false as const, error: "Message is too short." };
  }

  const source = input.source ?? "chat";
  const sourceLabel = source === "contact" ? "website contact form" : "website AI chat";
  const subjectPrefix = input.subjectPrefix
    ? stripControl(input.subjectPrefix).slice(0, 80)
    : source === "contact"
      ? "Website contact"
      : "Chat lead";

  const body = [
    message,
    websiteUrl ? `\nProject / site URL: ${websiteUrl}` : "",
    `\n— Sent via ${sourceLabel}`,
  ].join("");

  const result = await submitWeb3Forms({
    name,
    email,
    message: body,
    subject: `${subjectPrefix}: ${name.slice(0, 80)}`,
    from_name: source === "contact" ? "Cherry Capital Website" : "Cherry Capital Chat",
    replyto: email,
  });

  if (!result.ok) return result;

  return {
    ok: true as const,
    message: `Lead sent to ${portfolioConfig.email}. Expect a reply within one business day.`,
  };
}

export type CompanyInfoEmailInput = {
  email: string;
  name?: string;
  notes?: string;
};

/**
 * Notifies the studio and attempts to deliver company info to the visitor.
 * Web3Forms delivers to the studio inbox (with reply-to set to the visitor).
 * If RESEND_API_KEY is configured, also emails the visitor directly.
 */
export async function sendCompanyInfoEmail(input: CompanyInfoEmailInput) {
  const email = stripControl(input.email).slice(0, 254);
  const name = input.name ? stripControl(input.name).slice(0, 100) : "";
  const notes = input.notes
    ? input.notes.replace(/\r\n/g, "\n").trim().slice(0, 2000)
    : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Invalid email address." };
  }

  const packet = getCompanyInfoPacket();
  const visitorBody = formatCompanyInfoEmailBody(name || undefined);

  const studioNotify = await submitWeb3Forms({
    name: name || "Website visitor",
    email,
    message: [
      "Visitor requested company information via the AI chat.",
      name ? `Name: ${name}` : "",
      `Email: ${email}`,
      notes ? `Notes: ${notes}` : "",
      "",
      "--- Info packet also prepared for visitor ---",
      visitorBody,
    ]
      .filter(Boolean)
      .join("\n"),
    subject: `Chat: company info requested by ${email.slice(0, 80)}`,
    from_name: "Cherry Capital Chat",
    replyto: email,
  });

  if (!studioNotify.ok) {
    return studioNotify;
  }

  let visitorEmailed = false;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            process.env.RESEND_FROM_EMAIL ??
            "Cherry Capital <onboarding@resend.dev>",
          to: [email],
          reply_to: portfolioConfig.email,
          subject: "Cherry Capital — studio info & next steps",
          text: visitorBody,
        }),
      });
      visitorEmailed = res.ok;
    } catch {
      visitorEmailed = false;
    }
  }

  return {
    ok: true as const,
    visitorEmailed,
    studioNotified: true,
    companyInfo: packet,
    message: visitorEmailed
      ? `Company info emailed to ${email}. Studio also notified.`
      : `Studio notified at ${portfolioConfig.email} with reply-to set to the visitor. Share the company info packet in chat (and note they can email ${portfolioConfig.email} directly).`,
  };
}
