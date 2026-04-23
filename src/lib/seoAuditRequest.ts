import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  extractAuditDomain,
  hashAuditIdentifier,
  normalizeAuditUrl,
} from "@/lib/seoAuditSecurity";
import { validatePublicUrl } from "@/lib/safeUrl";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const auditSalt =
  process.env.SEO_AUDIT_RATE_LIMIT_SALT ??
  process.env.AUTH_SECRET ??
  process.env.PAYLOAD_SECRET ??
  "development-seo-audit-salt";

function compact(value: string | null | undefined, max: number) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function extractReferrerPath(header: string | null): string | undefined {
  if (!header) return undefined;
  try {
    const url = new URL(header);
    return `${url.pathname}${url.search}`.slice(0, 240);
  } catch {
    return header.slice(0, 240);
  }
}

export function getRequestIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  return compact(
    request.headers.get("x-vercel-forwarded-for") ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-real-ip") ??
      firstForwarded,
    96,
  );
}

export function buildAuditContext(request: Request, body: Record<string, unknown>) {
  const sessionId = compact(
    typeof body.sessionId === "string" ? body.sessionId : undefined,
    96,
  );
  const referrerPath = compact(
    typeof body.referrerPath === "string" ? body.referrerPath : undefined,
    240,
  );
  const userAgent = compact(request.headers.get("user-agent"), 240);
  const country = compact(
    request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry"),
    8,
  );
  const city = compact(request.headers.get("x-vercel-ip-city"), 96);
  const ip = getRequestIp(request);

  return {
    sessionHash: hashAuditIdentifier(sessionId, auditSalt),
    ipHash: hashAuditIdentifier(ip, auditSalt),
    country,
    city,
    userAgent,
    referrerPath: referrerPath ?? extractReferrerPath(request.headers.get("referer")),
  };
}

export async function createSeoAuditJob(request: Request) {
  if (!convexUrl) {
    return {
      response: Response.json(
        { error: "SEO checker is not configured." },
        { status: 503 },
      ),
    };
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return {
      response: Response.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }

  const requestedUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!requestedUrl) {
    return {
      response: Response.json({ error: "Missing 'url' field." }, { status: 400 }),
    };
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = await validatePublicUrl(normalizeAuditUrl(requestedUrl));
  } catch (error) {
    return {
      response: Response.json(
        { error: error instanceof Error ? error.message : "Invalid URL." },
        { status: 400 },
      ),
    };
  }

  let created: Awaited<ReturnType<ConvexHttpClient["mutation"]>>;
  try {
    const client = new ConvexHttpClient(convexUrl, { logger: false });
    created = await client.mutation(api.seoAuditJobs.createJob, {
      requestedUrl,
      normalizedUrl,
      domain: extractAuditDomain(normalizedUrl),
      ...buildAuditContext(request, body),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create audit job.";
    return {
      response: Response.json(
        {
          error: message.includes("Could not find public function")
            ? "SEO checker backend is not deployed yet. Run Convex deployment for the new audit job functions."
            : "Could not create audit job.",
          detail: message,
        },
        { status: 503 },
      ),
    };
  }

  const status = created.status === "rate_limited" ? 429 : 202;
  return {
    response: Response.json(created, {
      status,
      headers: {
        "cache-control": "no-store",
        ...(created.status === "rate_limited" && created.retryAfterSeconds
          ? { "retry-after": String(created.retryAfterSeconds) }
          : {}),
      },
    }),
  };
}

export async function getSeoAuditJob(jobId: string) {
  if (!convexUrl) {
    return Response.json(
      { error: "SEO checker is not configured." },
      { status: 503 },
    );
  }
  let job: Awaited<ReturnType<ConvexHttpClient["query"]>>;
  try {
    const client = new ConvexHttpClient(convexUrl, { logger: false });
    job = await client.query(api.seoAuditJobs.getJob, {
      jobId: jobId as Id<"seoAuditJobs">,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load audit job.";
    return Response.json(
      {
        error: message.includes("Could not find public function")
          ? "SEO checker backend is not deployed yet. Run Convex deployment for the new audit job functions."
          : "Could not load audit job.",
        detail: message,
      },
      { status: 503 },
    );
  }
  if (!job) {
    return Response.json({ error: "Audit job not found." }, { status: 404 });
  }
  return Response.json(job, {
    headers: {
      "cache-control": job.status === "complete" ? "private, max-age=30" : "no-store",
    },
  });
}
