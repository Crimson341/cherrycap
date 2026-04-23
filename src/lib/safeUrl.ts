import dns from "node:dns/promises";
import net from "node:net";
import { normalizeAuditUrl } from "./seoAuditSecurity";

const BLOCKED_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^0\./,
  /^::1$/,
  /^fe80:/i,
  /^f[cd][0-9a-f]{2}:/i,
];

function isBlockedIp(addr: string): boolean {
  return BLOCKED_RANGES.some((r) => r.test(addr));
}

export function assertPublicUrl(raw: string): void {
  const normalized = normalizeAuditUrl(raw);
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }
  const { hostname } = parsed;
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("URL resolves to a private address");
  }
  if (net.isIP(hostname) && isBlockedIp(hostname)) {
    throw new Error("URL resolves to a private address");
  }
}

export async function validatePublicUrl(raw: string): Promise<string> {
  const withScheme = normalizeAuditUrl(raw);
  assertPublicUrl(withScheme);
  const { hostname } = new URL(withScheme);
  if (net.isIP(hostname)) return withScheme;
  const [v4, v6] = await Promise.all([
    dns.resolve4(hostname).catch(() => [] as string[]),
    dns.resolve6(hostname).catch(() => [] as string[]),
  ]);
  const addrs = [...v4, ...v6];
  if (addrs.length === 0) {
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }
  for (const addr of addrs) {
    if (isBlockedIp(addr)) {
      throw new Error("URL resolves to a private address");
    }
  }
  return withScheme;
}
