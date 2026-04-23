import { createHash } from "node:crypto";
import type { AuditResult, Check } from "./seoAuditTypes";

export const AUDIT_RATE_LIMITS = {
  session: { limit: 5, windowMs: 60 * 60 * 1000 },
  ip: { limit: 20, windowMs: 24 * 60 * 60 * 1000 },
  domain: { limit: 3, windowMs: 60 * 60 * 1000 },
} as const;

const MAX_DETAIL_CHARS = 2_000;
const MAX_ARRAY_ITEMS = 30;
const MAX_SCHEMA_RAW_CHARS = 2_000;

export type AuditProgressStage =
  | "queued"
  | "fetching"
  | "crawling"
  | "scoring"
  | "complete"
  | "failed";

export type AuditJobSummary = {
  finalUrl?: string;
  grade?: AuditResult["grade"];
  overallScore?: number;
  maxScore?: number;
  percentage?: number;
  durationMs?: number;
  categoryCount?: number;
  checkedPages?: number;
  priorityFixes: string[];
};

export function normalizeAuditUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("URL required");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    throw new Error("Only http and https URLs are allowed");
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    throw new Error("Only ports 80 and 443 are allowed");
  }

  parsed.hash = "";
  return parsed.toString();
}

export function extractAuditDomain(normalizedUrl: string): string {
  return new URL(normalizedUrl).hostname.toLowerCase().replace(/^www\./, "");
}

export function hashAuditIdentifier(value: string | undefined, salt: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return createHash("sha256").update(`${salt}:${trimmed}`).digest("hex");
}

function truncateString(value: string, max = MAX_DETAIL_CHARS): string {
  return value.length > max ? `${value.slice(0, max)}…[truncated]` : value;
}

function truncateArray<T>(value: T[]): T[] {
  return value.slice(0, MAX_ARRAY_ITEMS);
}

function sanitizeCheck(check: Check): Check {
  return {
    ...check,
    value: check.value ? truncateString(check.value) : undefined,
    detail: check.detail ? truncateString(check.detail) : undefined,
    recommendation: check.recommendation
      ? truncateString(check.recommendation)
      : undefined,
  };
}

export function sanitizeAuditResult(result: AuditResult): AuditResult {
  return {
    ...result,
    response: {
      ...result.response,
      headers: Object.fromEntries(
        Object.entries(result.response.headers).map(([key, value]) => [
          key,
          truncateString(value, 500),
        ]),
      ),
      redirects: truncateArray(result.response.redirects),
    },
    schema: result.schema.map((schema) => ({
      type: schema.type,
      raw: truncateString(JSON.stringify(schema.raw).slice(0, MAX_SCHEMA_RAW_CHARS), MAX_SCHEMA_RAW_CHARS),
    })),
    links: {
      ...result.links,
      brokenSampled: truncateArray(result.links.brokenSampled),
    },
    images: {
      ...result.images,
      missingAltSamples: truncateArray(result.images.missingAltSamples),
      oversized: truncateArray(result.images.oversized),
      altQuality: result.images.altQuality
        ? {
            ...result.images.altQuality,
            samples: truncateArray(result.images.altQuality.samples),
          }
        : undefined,
    },
    siteCrawl: result.siteCrawl
      ? {
          ...result.siteCrawl,
          pages: truncateArray(result.siteCrawl.pages).map((page) => ({
            ...page,
            outboundInternalLinks: page.outboundInternalLinks
              ? truncateArray(page.outboundInternalLinks)
              : undefined,
            issues: truncateArray(page.issues),
            error: page.error ? truncateString(page.error) : undefined,
          })),
          duplicateTitles: truncateArray(result.siteCrawl.duplicateTitles),
          duplicateDescriptions: truncateArray(result.siteCrawl.duplicateDescriptions),
          duplicateH1s: result.siteCrawl.duplicateH1s
            ? truncateArray(result.siteCrawl.duplicateH1s)
            : undefined,
          orphanPages: truncateArray(result.siteCrawl.orphanPages),
          canonicalIssues: result.siteCrawl.canonicalIssues
            ? truncateArray(result.siteCrawl.canonicalIssues)
            : undefined,
          hreflangIssues: result.siteCrawl.hreflangIssues
            ? truncateArray(result.siteCrawl.hreflangIssues)
            : undefined,
          nearDuplicates: result.siteCrawl.nearDuplicates
            ? truncateArray(result.siteCrawl.nearDuplicates)
            : undefined,
        }
      : undefined,
    categories: result.categories.map((category) => ({
      ...category,
      checks: category.checks.map(sanitizeCheck),
    })),
  };
}

export function summarizeAuditResult(
  result: AuditResult,
  durationMs?: number,
): AuditJobSummary {
  const percentage = result.maxScore
    ? Math.min(100, Math.round((result.overallScore / result.maxScore) * 1000) / 10)
    : undefined;
  const priorityFixes = result.categories
    .flatMap((category) => category.checks)
    .filter((check) => check.status === "fail" || (check.status === "warn" && check.impact === "high"))
    .sort((left, right) => {
      if (left.status !== right.status) return left.status === "fail" ? -1 : 1;
      if (left.impact === "high" && right.impact !== "high") return -1;
      if (right.impact === "high" && left.impact !== "high") return 1;
      return 0;
    })
    .slice(0, 6)
    .map((check) => check.label);

  return {
    finalUrl: result.finalUrl,
    grade: result.grade,
    overallScore: result.overallScore,
    maxScore: result.maxScore,
    percentage,
    durationMs,
    categoryCount: result.categories.length,
    checkedPages: result.siteCrawl?.audited,
    priorityFixes,
  };
}
