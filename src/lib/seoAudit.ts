import * as cheerio from "cheerio";
import tls from "node:tls";
import { validatePublicUrl } from "./safeUrl";
import type {
  AuditResult,
  Check,
  CheckCategory,
  CheckStatus,
  CrawledPage,
  SiteCrawlResult,
} from "./seoAuditTypes";

const USER_AGENT =
  "CherryCapitalSEOBot/1.0 (+https://cherrycapitalweb.com/tools/seo-checker)";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 5 * 1024 * 1024;
const LINK_SAMPLE_SIZE = 8;
const PSI_TIMEOUT_MS = 30_000;
const SITE_CRAWL_CAP = 40;
const SITE_CRAWL_CONCURRENCY = 5;
const PAGE_FETCH_TIMEOUT_MS = 10_000;

const AI_CRAWLERS = [
  "GPTBot",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "CCBot",
  "Applebot-Extended",
  "Bytespider",
];

const DEPRECATED_SCHEMA_TYPES = new Set([
  "HowTo",
  "Book",
  "Course",
  "ClaimReview",
  "EstimatedSalary",
  "LearningVideo",
  "SpecialAnnouncement",
  "VehicleListing",
]);

const DEPRECATED_TAGS = ["center", "font", "marquee", "big", "strike", "tt", "frame", "frameset"];

const GENERIC_ALT_TEXTS = new Set([
  "image", "img", "photo", "picture", "icon", "logo", "graphic",
  "screenshot", "thumbnail", "banner", "figure", "media",
]);

const SCHEMA_REQUIRED_FIELDS: Record<string, string[]> = {
  LocalBusiness: ["name", "address"],
  ProfessionalService: ["name", "address"],
  Organization: ["name", "url"],
  Article: ["headline", "author", "datePublished"],
  BlogPosting: ["headline", "author", "datePublished"],
  NewsArticle: ["headline", "author", "datePublished"],
  Product: ["name", "image"],
  Recipe: ["name", "recipeIngredient", "recipeInstructions"],
  Event: ["name", "startDate", "location"],
  Person: ["name"],
  FAQPage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
  VideoObject: ["name", "thumbnailUrl", "uploadDate"],
  JobPosting: ["title", "description", "datePosted", "hiringOrganization"],
};

async function fetchLlmsTxt(origin: string): Promise<AuditResult["llmsTxt"]> {
  try {
    const { response } = await timedFetch(`${origin}/llms.txt`, {}, 5000);
    const text = await response.text();
    return {
      found: response.ok,
      status: response.status,
      bytes: text.length,
    };
  } catch (err) {
    return {
      found: false,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

async function inspectTls(host: string): Promise<AuditResult["tls"]> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        { host, port: 443, servername: host, timeout: 5000 },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            const protocol = socket.getProtocol() || undefined;
            const cipher = socket.getCipher()?.name;
            const validFrom = cert?.valid_from;
            const validTo = cert?.valid_to;
            let daysUntilExpiry: number | undefined;
            if (validTo) {
              const ms = new Date(validTo).getTime() - Date.now();
              daysUntilExpiry = Math.floor(ms / 86_400_000);
            }
            socket.end();
            resolve({ protocol, cipher, validFrom, validTo, daysUntilExpiry });
          } catch {
            socket.destroy();
            resolve({ error: "cert parse failed" });
          }
        }
      );
      socket.on("error", (err) => {
        resolve({ error: err.message });
      });
      socket.on("timeout", () => {
        socket.destroy();
        resolve({ error: "timeout" });
      });
    } catch (err) {
      resolve({ error: err instanceof Error ? err.message : "tls failed" });
    }
  });
}

async function measureOgImage(
  imageUrl: string
): Promise<AuditResult["ogImageMeta"]> {
  try {
    const { response } = await timedFetch(imageUrl, {}, 8000);
    if (!response.ok) return { error: `HTTP ${response.status}` };
    const buf = Buffer.from(await response.arrayBuffer());
    const loadSharp = new Function("return import('sharp')") as () => Promise<typeof import("sharp")>;
    const sharpModule = await loadSharp();
    const sharp = sharpModule as unknown as typeof import("sharp");
    const meta = await sharp(buf).metadata();
    return {
      width: meta.width,
      height: meta.height,
      bytes: buf.length,
      format: meta.format,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "decode failed" };
  }
}

async function traceRedirectChain(
  url: string,
  maxHops = 8
): Promise<{
  chain: { from: string; to: string; status: number }[];
  finalUrl: string;
}> {
  const chain: { from: string; to: string; status: number }[] = [];
  let current = await validatePublicUrl(url);
  for (let i = 0; i < maxHops; i += 1) {
    try {
      const res = await fetch(current, {
        method: "HEAD",
        redirect: "manual",
        headers: { "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) break;
        const next = await validatePublicUrl(new URL(loc, current).toString());
        chain.push({ from: current, to: next, status: res.status });
        current = next;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return { chain, finalUrl: current };
}

function validateSchemaItem(item: unknown): { type: string; issues: string[] }[] {
  const out: { type: string; issues: string[] }[] = [];
  if (!item || typeof item !== "object") return out;
  const obj = item as Record<string, unknown>;
  const rawType = obj["@type"];
  const types = Array.isArray(rawType) ? rawType.map(String) : [String(rawType ?? "")];
  for (const type of types) {
    const required = SCHEMA_REQUIRED_FIELDS[type];
    if (!required) continue;
    const missing: string[] = [];
    for (const field of required) {
      const val = obj[field];
      if (val === undefined || val === null || val === "") missing.push(field);
    }
    if (missing.length > 0) {
      out.push({ type, issues: [`missing required: ${missing.join(", ")}`] });
    }
  }
  return out;
}

function classifyAltText(alt: string, src: string): {
  generic: boolean;
  tooLong: boolean;
  filenameLike: boolean;
} {
  const trimmed = alt.trim().toLowerCase();
  const generic = GENERIC_ALT_TEXTS.has(trimmed) || /^(image|img|photo)\s*\d*$/.test(trimmed);
  const tooLong = alt.length > 125;
  const srcName = src.split("/").pop()?.split("?")[0].toLowerCase() || "";
  const srcBase = srcName.replace(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/i, "");
  const filenameLike = !!srcBase && (trimmed === srcBase || trimmed === srcName);
  return { generic, tooLong, filenameLike };
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const stripped = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function computeReadability(
  text: string
):
  | {
      fleschReadingEase: number;
      gradeLevel: number;
      avgWordsPerSentence: number;
      avgSyllablesPerWord: number;
      sentenceCount: number;
    }
  | undefined {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;
  const sentences = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter((s) => s.trim().length > 0);
  const words = cleaned.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (words.length < 30 || sentences.length === 0) return undefined;
  let syllables = 0;
  for (const w of words) syllables += countSyllables(w);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const fre = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  return {
    fleschReadingEase: +fre.toFixed(1),
    gradeLevel: +grade.toFixed(1),
    avgWordsPerSentence: +avgWordsPerSentence.toFixed(1),
    avgSyllablesPerWord: +avgSyllablesPerWord.toFixed(2),
    sentenceCount: sentences.length,
  };
}

async function validateSitemap(
  sitemapUrl: string
): Promise<AuditResult["sitemapValidation"]> {
  try {
    const { response } = await timedFetch(sitemapUrl, {}, 8000);
    if (!response.ok) {
      return {
        urlCount: 0,
        sizeBytes: 0,
        tooManyUrls: false,
        tooLarge: false,
        hasXmlns: false,
        invalidLastmod: 0,
        parseError: `HTTP ${response.status}`,
      };
    }
    const xml = await response.text();
    const sizeBytes = xml.length;
    const hasXmlns = /xmlns\s*=\s*["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\//i.test(
      xml
    );
    const urlMatches = xml.match(/<loc>/gi) || [];
    const urlCount = urlMatches.length;
    const lastmodMatches = xml.match(/<lastmod>([^<]+)<\/lastmod>/gi) || [];
    let invalidLastmod = 0;
    for (const m of lastmodMatches) {
      const value = m.replace(/<\/?lastmod>/gi, "").trim();
      if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(value)) {
        invalidLastmod += 1;
      }
    }
    return {
      urlCount,
      sizeBytes,
      tooManyUrls: urlCount > 50_000,
      tooLarge: sizeBytes > 50 * 1024 * 1024,
      hasXmlns,
      invalidLastmod,
    };
  } catch (err) {
    return {
      urlCount: 0,
      sizeBytes: 0,
      tooManyUrls: false,
      tooLarge: false,
      hasXmlns: false,
      invalidLastmod: 0,
      parseError: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

async function inspectDns(host: string): Promise<AuditResult["dns"]> {
  try {
    const { resolveTxt, resolveMx, resolveCaa } = await import("node:dns/promises");
    const apex = host.replace(/^www\./i, "");
    const [dmarcRes, txtRes, mxRes, caaRes] = await Promise.allSettled([
      resolveTxt(`_dmarc.${apex}`),
      resolveTxt(apex),
      resolveMx(apex),
      resolveCaa(apex),
    ]);
    let dmarc: string | undefined;
    if (dmarcRes.status === "fulfilled") {
      const flat = dmarcRes.value.map((chunks) => chunks.join(""));
      dmarc = flat.find((t) => /v=DMARC1/i.test(t));
    }
    let spf: string | undefined;
    if (txtRes.status === "fulfilled") {
      const flat = txtRes.value.map((chunks) => chunks.join(""));
      spf = flat.find((t) => /v=spf1/i.test(t));
    }
    const mx =
      mxRes.status === "fulfilled"
        ? mxRes.value.map((m) => `${m.priority} ${m.exchange}`)
        : undefined;
    const caa =
      caaRes.status === "fulfilled"
        ? caaRes.value.map((c) => `${c.critical ? "!" : ""}${c.issue || c.issuewild || c.iodef || ""}`).filter(Boolean)
        : undefined;
    return { dmarc, spf, mx, caa };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "dns failed" };
  }
}

function scanSubresourceIntegrity(
  $: cheerio.CheerioAPI,
  pageOrigin: string
): NonNullable<AuditResult["subresourceIntegrity"]> {
  const withoutIntegrity: string[] = [];
  let externalScripts = 0;
  let withIntegrity = 0;
  $("script[src], link[rel='stylesheet'][href]").each((_, el) => {
    const $el = $(el);
    const src = $el.attr("src") || $el.attr("href");
    if (!src) return;
    let isExternal = false;
    try {
      const u = new URL(src, pageOrigin);
      const pageHost = new URL(pageOrigin).host;
      if (u.host && u.host !== pageHost) isExternal = true;
    } catch {
      return;
    }
    if (!isExternal) return;
    externalScripts += 1;
    if ($el.attr("integrity")) withIntegrity += 1;
    else if (withoutIntegrity.length < 10) withoutIntegrity.push(src);
  });
  return { externalScripts, withIntegrity, withoutIntegrity };
}

function computeRichResultsEligibility(
  schemaBlocks: { type: string; raw: unknown }[],
  validationIssues: { type: string; issues: string[] }[]
): NonNullable<AuditResult["richResultsEligibility"]> {
  const eligibleTypes: string[] = [];
  const ineligibleReasons: string[] = [];
  const failingTypes = new Set(validationIssues.map((v) => v.type));
  const recommendedFields: Record<string, string[]> = {
    Article: ["image", "publisher", "dateModified", "mainEntityOfPage"],
    BlogPosting: ["image", "publisher", "dateModified", "mainEntityOfPage"],
    NewsArticle: ["image", "publisher", "dateModified"],
    Product: ["offers", "aggregateRating", "review"],
    Recipe: ["image", "nutrition", "recipeYield", "totalTime"],
    LocalBusiness: ["telephone", "openingHoursSpecification", "priceRange"],
    ProfessionalService: ["telephone", "openingHoursSpecification", "priceRange"],
    Event: ["image", "description", "offers", "performer"],
    JobPosting: ["baseSalary", "jobLocation", "employmentType", "validThrough"],
    VideoObject: ["description", "contentUrl"],
    FAQPage: [],
    BreadcrumbList: [],
    Organization: ["logo", "contactPoint", "sameAs"],
  };
  for (const block of schemaBlocks) {
    if (block.type === "InvalidJSON") continue;
    const types = block.type.split(",");
    for (const type of types) {
      if (failingTypes.has(type)) {
        ineligibleReasons.push(`${type}: missing required fields`);
        continue;
      }
      const recommended = recommendedFields[type];
      if (!recommended) continue;
      if (recommended.length === 0) {
        eligibleTypes.push(type);
        continue;
      }
      const obj = (block.raw ?? {}) as Record<string, unknown>;
      const missing = recommended.filter(
        (f) => obj[f] === undefined || obj[f] === null || obj[f] === ""
      );
      if (missing.length === 0) {
        eligibleTypes.push(type);
      } else {
        ineligibleReasons.push(
          `${type}: missing recommended ${missing.join(", ")}`
        );
      }
    }
  }
  return {
    eligibleTypes: Array.from(new Set(eligibleTypes)),
    ineligibleReasons: Array.from(new Set(ineligibleReasons)),
  };
}

function computeShingles(text: string, k = 5): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const shingles = new Set<string>();
  for (let i = 0; i <= tokens.length - k; i += 1) {
    shingles.add(tokens.slice(i, i + k).join(" "));
  }
  return shingles;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const v of a) if (b.has(v)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function findNearDuplicates(
  pages: CrawledPage[]
): { pages: string[]; similarity: number }[] {
  const withShingles = pages
    .filter((p) => p.shingles && p.shingles.length > 20)
    .map((p) => ({ url: p.url, set: new Set(p.shingles) }));
  const clusters = new Map<string, { pages: string[]; similarity: number }>();
  for (let i = 0; i < withShingles.length; i += 1) {
    for (let j = i + 1; j < withShingles.length; j += 1) {
      const sim = jaccardSimilarity(withShingles[i].set, withShingles[j].set);
      if (sim >= 0.8) {
        const key = [withShingles[i].url, withShingles[j].url].sort().join("||");
        clusters.set(key, {
          pages: [withShingles[i].url, withShingles[j].url],
          similarity: +sim.toFixed(2),
        });
      }
    }
  }
  return Array.from(clusters.values());
}

function canonicalKey(raw: string, base?: string): string | null {
  try {
    const u = base ? new URL(raw, base) : new URL(raw);
    const host = u.host.replace(/^www\./i, "").toLowerCase();
    const path = u.pathname.replace(/\/$/, "") || "/";
    const query = u.search || "";
    return `${host}${path}${query}`;
  } catch {
    return null;
  }
}

function detectCanonicalIssues(
  pages: CrawledPage[]
): { page: string; canonical: string; reason: string }[] {
  const out: { page: string; canonical: string; reason: string }[] = [];
  const pageKeys = new Set<string>();
  for (const p of pages) {
    const k = canonicalKey(p.url);
    if (k) pageKeys.add(k);
  }
  const canonicalMap = new Map<string, string>();
  for (const p of pages) {
    if (!p.canonical) continue;
    const fromKey = canonicalKey(p.url);
    const toKey = canonicalKey(p.canonical, p.url);
    if (!toKey) {
      out.push({ page: p.url, canonical: p.canonical, reason: "invalid URL" });
      continue;
    }
    if (fromKey) canonicalMap.set(fromKey, toKey);
  }
  for (const p of pages) {
    if (!p.canonical) continue;
    const from = canonicalKey(p.url);
    if (!from) continue;
    let current = from;
    const visited = new Set<string>([current]);
    for (let i = 0; i < 5; i += 1) {
      const next = canonicalMap.get(current);
      if (!next) break;
      if (next === current) break;
      if (visited.has(next)) {
        out.push({
          page: p.url,
          canonical: p.canonical,
          reason: "canonical loop detected",
        });
        break;
      }
      visited.add(next);
      current = next;
      if (i === 4) {
        out.push({
          page: p.url,
          canonical: p.canonical,
          reason: "canonical chain >5 hops",
        });
      }
    }
    const canonicalAbs = canonicalMap.get(from);
    if (canonicalAbs && canonicalAbs !== from && !pageKeys.has(canonicalAbs)) {
      out.push({
        page: p.url,
        canonical: p.canonical,
        reason: "canonical points to uncrawled URL",
      });
    }
  }
  return out;
}

function checkHreflangReciprocity(pages: CrawledPage[]): string[] {
  const issues: string[] = [];
  const pagesWithHreflang = pages.filter(
    (p) => p.hreflang && p.hreflang.length > 0
  );
  if (pagesWithHreflang.length === 0) return issues;
  const hreflangByUrl = new Map<string, { hreflang: string; href: string }[]>();
  for (const p of pagesWithHreflang) {
    hreflangByUrl.set(p.url.replace(/\/$/, ""), p.hreflang || []);
  }
  for (const p of pagesWithHreflang) {
    const normalized = p.url.replace(/\/$/, "");
    const entries = p.hreflang || [];
    const hasSelf = entries.some((e) => {
      try {
        return new URL(e.href, p.url).toString().replace(/\/$/, "") === normalized;
      } catch {
        return false;
      }
    });
    if (!hasSelf) {
      issues.push(`${p.url}: missing self-referential hreflang`);
    }
    const hasXDefault = entries.some((e) => e.hreflang.toLowerCase() === "x-default");
    if (!hasXDefault) {
      issues.push(`${p.url}: missing x-default hreflang`);
    }
    for (const entry of entries) {
      try {
        const target = new URL(entry.href, p.url).toString().replace(/\/$/, "");
        const targetEntries = hreflangByUrl.get(target);
        if (!targetEntries) continue; // target not crawled
        const reciprocates = targetEntries.some((e) => {
          try {
            return (
              new URL(e.href, target).toString().replace(/\/$/, "") === normalized
            );
          } catch {
            return false;
          }
        });
        if (!reciprocates) {
          issues.push(
            `${p.url} → ${target} (${entry.hreflang}): not reciprocated`
          );
        }
      } catch {
        // skip
      }
    }
  }
  return Array.from(new Set(issues)).slice(0, 20);
}

async function runHeadlessAudit(
  url: string
): Promise<AuditResult["headless"]> {
  try {
    const loadPlaywright = new Function(
      "return import('playwright-core')",
    ) as () => Promise<typeof import("playwright-core")>;
    const { chromium } = await loadPlaywright();
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
    } catch (err) {
      return {
        attempted: true,
        available: false,
        error: `launch failed: ${err instanceof Error ? err.message : "unknown"}`,
      };
    }
    try {
      const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: USER_AGENT,
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
      const renderedText = await page.evaluate(() => document.body.innerText || "");
      const renderedWordCount = renderedText.trim().split(/\s+/).filter(Boolean).length;
      const tapTargetInfo = await page.evaluate(() => {
        const clickable = Array.from(
          document.querySelectorAll("a, button, input, select, textarea, [role='button']")
        ) as HTMLElement[];
        let small = 0;
        const samples: string[] = [];
        for (const el of clickable) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.width < 44 || rect.height < 44) {
            small += 1;
            if (samples.length < 5) {
              const tag = el.tagName.toLowerCase();
              const text = (el.textContent || "").trim().slice(0, 30);
              samples.push(`${tag} "${text}" ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
          }
        }
        return { small, samples };
      });
      const fontInfo = await page.evaluate(() => {
        const textNodes = Array.from(document.querySelectorAll("p, li, span, div")) as HTMLElement[];
        let tooSmall = 0;
        for (const el of textNodes.slice(0, 500)) {
          if (!el.textContent?.trim()) continue;
          const size = parseFloat(getComputedStyle(el).fontSize);
          if (size > 0 && size < 12) tooSmall += 1;
        }
        return tooSmall;
      });
      const horizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      let axeViolations: { id: string; impact?: string; nodes: number; help?: string }[] = [];
      try {
        const axeModule = await import("axe-core");
        const axeSource = (axeModule as unknown as { source: string }).source;
        if (axeSource) {
          await page.addScriptTag({ content: axeSource });
          type AxeResults = {
            violations: { id: string; impact?: string; nodes: unknown[]; help?: string }[];
          };
          const axeResults = await page.evaluate(
            async () =>
              await (window as unknown as {
                axe: { run: () => Promise<AxeResults> };
              }).axe.run()
          );
          axeViolations = axeResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            help: v.help,
          }));
        }
      } catch (err) {
        axeViolations = [];
        void err;
      }
      await browser.close();
      return {
        attempted: true,
        available: true,
        renderedWordCount,
        axeViolations,
        mobileUsability: {
          tapTargetsTooSmall: tapTargetInfo.small,
          fontTooSmall: fontInfo,
          horizontalScroll,
          smallTargetSamples: tapTargetInfo.samples,
        },
      };
    } catch (err) {
      try { await browser.close(); } catch { /* noop */ }
      return {
        attempted: true,
        available: true,
        error: err instanceof Error ? err.message : "navigation failed",
      };
    }
  } catch (err) {
    return {
      attempted: true,
      available: false,
      error: err instanceof Error ? err.message : "playwright-core not available",
    };
  }
}

const SENSITIVE_HEADERS = new Set([
  "set-cookie",
  "authorization",
  "www-authenticate",
  "proxy-authenticate",
  "proxy-authorization",
  "cookie",
]);

async function timedFetch(
  input: string,
  init: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<{ response: Response; elapsedMs: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();
  try {
    let current = await validatePublicUrl(input);
    let response: Response | null = null;
    const shouldFollow = init.redirect !== "manual";
    for (let hop = 0; hop < 8; hop += 1) {
      response = await fetch(current, {
        ...init,
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9",
          ...init.headers,
        },
      });
      if (
        !shouldFollow ||
        response.status < 300 ||
        response.status >= 400
      ) {
        break;
      }
      const location = response.headers.get("location");
      if (!location) break;
      current = await validatePublicUrl(new URL(location, current).toString());
    }
    if (!response) throw new Error("Fetch failed");
    if (
      shouldFollow &&
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("location")
    ) {
      throw new Error("Too many redirects");
    }
    const elapsedMs = Math.round(performance.now() - start);
    return { response, elapsedMs };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("URL required");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function readBody(
  response: Response
): Promise<{ text: string; bytes: number }> {
  const reader = response.body?.getReader();
  if (!reader) return { text: await response.text(), bytes: 0 };
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > MAX_HTML_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
  }
  const bytes = total;
  const merged = new Uint8Array(
    chunks.reduce((n, c) => n + c.byteLength, 0)
  );
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return { text: new TextDecoder("utf-8").decode(merged), bytes };
}

function makeCheck(
  id: string,
  label: string,
  status: CheckStatus,
  opts: Partial<Omit<Check, "id" | "label" | "status">> = {}
): Check {
  return { id, label, status, ...opts };
}

function scoreCheck(status: CheckStatus): number {
  if (status === "pass") return 1;
  if (status === "warn") return 0.5;
  return 0;
}

function buildCategory(
  id: string,
  title: string,
  description: string,
  checks: Check[]
): CheckCategory {
  const scorable = checks.filter((c) => c.status !== "info");
  const score = scorable.reduce((sum, c) => sum + scoreCheck(c.status), 0);
  const maxScore = scorable.length;
  return { id, title, description, score, maxScore, checks };
}

type RobotsGroup = { agents: string[]; allow: string[]; disallow: string[] };

function parseRobotsGroups(text: string): {
  groups: RobotsGroup[];
  sitemaps: string[];
} {
  const lines = text.split(/\r?\n/);
  const sitemaps: string[] = [];
  const groups: RobotsGroup[] = [];
  let currentGroup: RobotsGroup | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [keyRaw, ...rest] = line.split(":");
    if (!keyRaw || rest.length === 0) continue;
    const key = keyRaw.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "sitemap") {
      sitemaps.push(value);
      continue;
    }
    if (key === "user-agent") {
      if (!currentGroup || currentGroup.allow.length || currentGroup.disallow.length) {
        currentGroup = { agents: [value.toLowerCase()], allow: [], disallow: [] };
        groups.push(currentGroup);
      } else {
        currentGroup.agents.push(value.toLowerCase());
      }
      continue;
    }
    if (!currentGroup) continue;
    if (key === "allow") currentGroup.allow.push(value);
    else if (key === "disallow") currentGroup.disallow.push(value);
  }
  return { groups, sitemaps };
}

function isAllowedForAgent(groups: RobotsGroup[], agent: string): boolean {
  const ua = agent.toLowerCase();
  const matching = groups.find((g) => g.agents.some((a) => a === ua));
  const wildcard = groups.find((g) => g.agents.includes("*"));
  const group = matching ?? wildcard;
  if (!group) return true;
  const blanketBlock = group.disallow.includes("/");
  const blanketAllow = group.allow.includes("/");
  if (blanketBlock && !blanketAllow) return false;
  return true;
}

function aiCrawlerStatus(
  groups: RobotsGroup[],
  agent: string
): "allow" | "disallow" | "not-set" {
  const ua = agent.toLowerCase();
  const matching = groups.find((g) => g.agents.some((a) => a === ua));
  if (!matching) return "not-set";
  const blanketBlock = matching.disallow.includes("/");
  const blanketAllow = matching.allow.includes("/");
  if (blanketBlock && !blanketAllow) return "disallow";
  return "allow";
}

async function fetchRobotsAndSitemap(origin: string) {
  const robotsUrl = `${origin}/robots.txt`;
  let robotsTxtFound = false;
  let robotsTxtStatus: number | undefined;
  let robotsTxt = "";
  let sitemapUrl: string | undefined;
  let sitemapUrlCount: number | undefined;
  let robotsAllowsAll: boolean | undefined;
  let robotsTxtDeclaresSitemap = false;
  const aiCrawlerDirectives: Record<string, "allow" | "disallow" | "not-set"> = {};
  try {
    const { response } = await timedFetch(robotsUrl, {}, 8000);
    robotsTxtStatus = response.status;
    if (response.ok) {
      robotsTxtFound = true;
      robotsTxt = await response.text();
      const { groups, sitemaps } = parseRobotsGroups(robotsTxt);
      robotsAllowsAll = isAllowedForAgent(groups, "*");
      if (sitemaps.length > 0) {
        sitemapUrl = sitemaps[0];
        robotsTxtDeclaresSitemap = true;
      }
      for (const ua of AI_CRAWLERS) {
        aiCrawlerDirectives[ua] = aiCrawlerStatus(groups, ua);
      }
    }
  } catch {
    robotsTxtFound = false;
  }

  if (!sitemapUrl) sitemapUrl = `${origin}/sitemap.xml`;
  let sitemapFound = false;
  try {
    const { response } = await timedFetch(sitemapUrl, {}, 8000);
    if (response.ok) {
      sitemapFound = true;
      const xml = await response.text();
      const urlMatches = xml.match(/<loc>/gi);
      sitemapUrlCount = urlMatches ? urlMatches.length : 0;
    }
  } catch {
    sitemapFound = false;
  }

  return {
    robotsTxtFound,
    robotsTxtStatus,
    robotsAllowsAll,
    sitemapFound,
    sitemapUrl: sitemapFound ? sitemapUrl : undefined,
    sitemapUrlCount,
    robotsTxtSample: robotsTxt.slice(0, 500),
    robotsTxtDeclaresSitemap,
    aiCrawlerDirectives: Object.keys(aiCrawlerDirectives).length
      ? aiCrawlerDirectives
      : undefined,
  };
}

const IMAGE_WEIGHT_SAMPLE_SIZE = 10;
const OVERSIZED_IMAGE_BYTES = 200 * 1024; // 200 KB

async function sampleImageWeights(
  imageUrls: string[],
  origin: string
): Promise<{ src: string; bytes: number }[]> {
  const sample = imageUrls.slice(0, IMAGE_WEIGHT_SAMPLE_SIZE);
  const results = await Promise.all(
    sample.map(async (src) => {
      try {
        const target = src.startsWith("http") ? src : new URL(src, origin).toString();
        if (target.startsWith("data:")) return { src, bytes: 0 };
        const { response } = await timedFetch(
          target,
          { method: "HEAD", redirect: "follow" },
          5000
        );
        const len = response.headers.get("content-length");
        if (len && /^\d+$/.test(len)) return { src: target, bytes: parseInt(len, 10) };
        if (response.status === 405 || response.status === 501 || !len) {
          const retry = await timedFetch(
            target,
            { method: "GET", redirect: "follow" },
            8000
          );
          const buf = await retry.response.arrayBuffer();
          return { src: target, bytes: buf.byteLength };
        }
        return { src: target, bytes: 0 };
      } catch {
        return { src, bytes: 0 };
      }
    })
  );
  return results.filter((r) => r.bytes >= OVERSIZED_IMAGE_BYTES);
}

async function sampleLinkStatuses(
  links: string[],
  origin: string
): Promise<{ href: string; status: number }[]> {
  const sample = links.slice(0, LINK_SAMPLE_SIZE);
  const results = await Promise.all(
    sample.map(async (href) => {
      try {
        const target = href.startsWith("http") ? href : new URL(href, origin).toString();
        const { response } = await timedFetch(
          target,
          { method: "HEAD", redirect: "manual" },
          5000
        );
        let status = response.status;
        if (status === 405 || status === 501) {
          const retry = await timedFetch(
            target,
            { method: "GET", redirect: "manual" },
            5000
          );
          status = retry.response.status;
        }
        return { href: target, status };
      } catch {
        return { href, status: 0 };
      }
    })
  );
  return results.filter((r) => r.status >= 400 || r.status === 0);
}

type PsiResult = NonNullable<AuditResult["coreWebVitals"]>;

async function fetchPageSpeedInsights(
  url: string,
  strategy: "mobile" | "desktop" = "mobile"
): Promise<PsiResult | undefined> {
  const key = process.env.PAGESPEED_INSIGHTS_KEY || process.env.PSI_API_KEY;
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  for (const cat of ["performance", "accessibility", "seo", "best-practices"]) {
    endpoint.searchParams.append("category", cat);
  }
  if (key) endpoint.searchParams.set("key", key);

  try {
    const { response } = await timedFetch(
      endpoint.toString(),
      { headers: { accept: "application/json" } },
      PSI_TIMEOUT_MS
    );
    if (!response.ok) {
      return {
        strategy,
        source: "PageSpeed Insights",
        error: `PSI HTTP ${response.status}`,
      };
    }
    const data = (await response.json()) as Record<string, unknown>;
    const lighthouse = (data.lighthouseResult ?? {}) as Record<string, unknown>;
    const audits = (lighthouse.audits ?? {}) as Record<string, { numericValue?: number; displayValue?: string }>;
    const categories = (lighthouse.categories ?? {}) as Record<string, { score?: number }>;
    const loadingExp = (data.loadingExperience ?? {}) as {
      metrics?: Record<string, { percentile?: number }>;
    };
    const metrics = loadingExp.metrics ?? {};

    const fieldLcp = metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile;
    const fieldInp = metrics.INTERACTION_TO_NEXT_PAINT?.percentile;
    const fieldCls = metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;

    return {
      strategy,
      source: "PageSpeed Insights",
      lcpMs: fieldLcp ?? audits["largest-contentful-paint"]?.numericValue,
      inpMs: fieldInp ?? audits["interaction-to-next-paint"]?.numericValue,
      cls:
        typeof fieldCls === "number"
          ? fieldCls / 100
          : audits["cumulative-layout-shift"]?.numericValue,
      ttfbMs: audits["server-response-time"]?.numericValue,
      fcpMs: audits["first-contentful-paint"]?.numericValue,
      performanceScore: categories.performance?.score
        ? Math.round(categories.performance.score * 100)
        : undefined,
      accessibilityScore: categories.accessibility?.score
        ? Math.round(categories.accessibility.score * 100)
        : undefined,
      seoScore: categories.seo?.score
        ? Math.round(categories.seo.score * 100)
        : undefined,
      bestPracticesScore: categories["best-practices"]?.score
        ? Math.round(categories["best-practices"].score * 100)
        : undefined,
    };
  } catch (err) {
    return {
      strategy,
      source: "PageSpeed Insights",
      error: err instanceof Error ? err.message : "PSI request failed",
    };
  }
}

async function fetchSitemapUrls(sitemapUrl: string, seen = new Set<string>()): Promise<string[]> {
  if (seen.has(sitemapUrl)) return [];
  seen.add(sitemapUrl);
  try {
    const { response } = await timedFetch(sitemapUrl, {}, 8000);
    if (!response.ok) return [];
    const xml = await response.text();
    const urls: string[] = [];
    // Sitemap index: recurse
    const indexMatches = xml.match(/<sitemap>[\s\S]*?<\/sitemap>/gi) || [];
    for (const block of indexMatches) {
      const loc = block.match(/<loc>([^<]+)<\/loc>/i)?.[1]?.trim();
      if (loc && seen.size < 20) {
        const nested = await fetchSitemapUrls(loc, seen);
        urls.push(...nested);
      }
    }
    if (urls.length === 0) {
      const urlMatches = xml.match(/<url>[\s\S]*?<\/url>/gi) || [];
      for (const block of urlMatches) {
        const loc = block.match(/<loc>([^<]+)<\/loc>/i)?.[1]?.trim();
        if (loc) urls.push(loc);
      }
    }
    return urls;
  } catch {
    return [];
  }
}

function normalizeInternalUrl(href: string, base: string, host: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.host !== host) return null;
    if (!/^https?:/i.test(u.protocol)) return null;
    u.hash = "";
    // Ignore common non-HTML assets
    if (/\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|woff2?|ttf|otf|mp4|webm|pdf|zip|xml|json|txt)(\?|$)/i.test(u.pathname)) {
      return null;
    }
    return u.toString();
  } catch {
    return null;
  }
}

async function discoverSitePages(
  origin: string,
  startUrl: string,
  sitemapUrl: string | undefined,
  initialHtml: string,
  initialFinalUrl: string
): Promise<{ urls: string[]; source: "sitemap" | "link-crawl" | "hybrid" }> {
  const host = new URL(origin).host;
  const discovered = new Set<string>();
  discovered.add(startUrl);

  let sitemapCount = 0;
  if (sitemapUrl) {
    const sitemapUrls = await fetchSitemapUrls(sitemapUrl);
    for (const u of sitemapUrls) {
      const normalized = normalizeInternalUrl(u, origin, host);
      if (normalized) {
        discovered.add(normalized);
        sitemapCount += 1;
      }
    }
  }

  // Always seed from homepage links too
  const $initial = cheerio.load(initialHtml);
  const seedLinks: string[] = [];
  $initial("a[href]").each((_, el) => {
    const href = $initial(el).attr("href");
    if (!href) return;
    const normalized = normalizeInternalUrl(href, initialFinalUrl, host);
    if (normalized) seedLinks.push(normalized);
  });

  // BFS one level deep if we have room
  const queue = seedLinks.filter((u) => !discovered.has(u));
  for (const u of queue) {
    if (discovered.size >= SITE_CRAWL_CAP * 2) break;
    discovered.add(u);
  }

  const source: "sitemap" | "link-crawl" | "hybrid" =
    sitemapCount > 0 && seedLinks.length > 0
      ? "hybrid"
      : sitemapCount > 0
        ? "sitemap"
        : "link-crawl";

  return { urls: Array.from(discovered), source };
}

async function auditPage(pageUrl: string, host: string): Promise<CrawledPage> {
  try {
    const { response, elapsedMs } = await timedFetch(
      pageUrl,
      {},
      PAGE_FETCH_TIMEOUT_MS
    );
    const status = response.status;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return {
        url: pageUrl,
        status,
        fetchedMs: elapsedMs,
        h1Count: 0,
        wordCount: 0,
        noindex: false,
        imagesMissingAlt: 0,
        imagesTotal: 0,
        internalLinks: 0,
        issues: status >= 400 ? [`HTTP ${status}`] : [],
      };
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $("head title").first().text().trim() || undefined;
    const description =
      $('meta[name="description"]').attr("content")?.trim() || undefined;
    const canonical = $('link[rel="canonical"]').attr("href") || undefined;
    const robots = $('meta[name="robots"]').attr("content") || "";
    const noindex = /noindex/i.test(robots);
    const h1Count = $("h1").length;
    const h1Text = $("h1").first().text().trim() || undefined;
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

    let imagesMissingAlt = 0;
    let imagesTotal = 0;
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (!src) return;
      imagesTotal += 1;
      const alt = $(el).attr("alt");
      if (alt === undefined || alt.trim() === "") imagesMissingAlt += 1;
    });

    let internalLinks = 0;
    const outboundInternalLinks = new Set<string>();
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const u = new URL(href, pageUrl);
        if (u.host === host) {
          internalLinks += 1;
          u.hash = "";
          outboundInternalLinks.add(u.toString().replace(/\/$/, ""));
        }
      } catch {
        // ignore
      }
    });

    let canonicalMismatch = false;
    if (canonical) {
      const pageKey = canonicalKey(pageUrl);
      const respKey = canonicalKey(response.url || pageUrl);
      const canonKey = canonicalKey(canonical, pageUrl);
      if (!canonKey) canonicalMismatch = true;
      else canonicalMismatch = canonKey !== pageKey && canonKey !== respKey;
    }

    const hreflang: { hreflang: string; href: string }[] = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const hl = $(el).attr("hreflang");
      const href = $(el).attr("href");
      if (hl && href) hreflang.push({ hreflang: hl, href });
    });

    const shingles = Array.from(computeShingles(bodyText.slice(0, 20_000), 5));

    const issues: string[] = [];
    const skipContentChecks = status >= 400 || noindex;
    if (status >= 400) issues.push(`HTTP ${status}`);
    if (noindex && status < 400) issues.push("noindex");
    if (!skipContentChecks) {
      if (!title) issues.push("Missing title");
      else if (title.length < 30 || title.length > 65) {
        issues.push(`Title ${title.length} chars (target 51–60)`);
      }
      if (!description) issues.push("Missing description");
      else if (description.length < 120 || description.length > 170) {
        issues.push(`Description ${description.length} chars (target 150–160)`);
      }
      if (h1Count === 0) issues.push("No H1");
      else if (h1Count > 1) issues.push(`${h1Count} H1s`);
      if (wordCount < 200) issues.push(`Thin content (${wordCount} words)`);
      if (canonicalMismatch) issues.push("Canonical points elsewhere");
      if (imagesTotal > 0 && imagesMissingAlt / imagesTotal > 0.2) {
        issues.push(`${imagesMissingAlt}/${imagesTotal} images missing alt`);
      }
    }

    return {
      url: pageUrl,
      status,
      fetchedMs: elapsedMs,
      title,
      titleLength: title?.length,
      description,
      descriptionLength: description?.length,
      h1Count,
      h1Text,
      wordCount,
      canonical,
      canonicalMismatch,
      noindex,
      imagesMissingAlt,
      imagesTotal,
      internalLinks,
      outboundInternalLinks: Array.from(outboundInternalLinks),
      hreflang: hreflang.length > 0 ? hreflang : undefined,
      shingles,
      issues,
    };
  } catch (err) {
    return {
      url: pageUrl,
      status: 0,
      h1Count: 0,
      wordCount: 0,
      noindex: false,
      imagesMissingAlt: 0,
      imagesTotal: 0,
      internalLinks: 0,
      issues: ["Fetch failed"],
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}

async function runSiteCrawl(
  origin: string,
  startUrl: string,
  sitemapUrl: string | undefined,
  initialHtml: string,
  initialFinalUrl: string
): Promise<SiteCrawlResult> {
  const { urls, source } = await discoverSitePages(
    origin,
    startUrl,
    sitemapUrl,
    initialHtml,
    initialFinalUrl
  );
  const host = new URL(origin).host;
  const capped = urls.length > SITE_CRAWL_CAP;
  const toAudit = urls.slice(0, SITE_CRAWL_CAP);

  const results: CrawledPage[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < toAudit.length) {
      const idx = cursor++;
      const pageUrl = toAudit[idx];
      const result = await auditPage(pageUrl, host);
      results.push(result);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(SITE_CRAWL_CONCURRENCY, toAudit.length) }, () =>
      worker()
    )
  );

  // Aggregate
  const titleMap = new Map<string, number>();
  const descMap = new Map<string, number>();
  const h1Map = new Map<string, number>();
  let missingTitles = 0;
  let missingDescriptions = 0;
  let noindexPages = 0;
  let brokenPages = 0;
  let totalIssues = 0;
  for (const p of results) {
    if (p.status === 0 || p.status >= 400 || p.noindex) {
      if (p.noindex) noindexPages += 1;
      if (p.status === 0 || p.status >= 400) brokenPages += 1;
      totalIssues += p.issues.length;
      continue;
    }
    if (!p.title) missingTitles += 1;
    else titleMap.set(p.title, (titleMap.get(p.title) || 0) + 1);
    if (!p.description) missingDescriptions += 1;
    else descMap.set(p.description, (descMap.get(p.description) || 0) + 1);
    if (p.h1Text) h1Map.set(p.h1Text, (h1Map.get(p.h1Text) || 0) + 1);
    totalIssues += p.issues.length;
  }
  const duplicateTitles = Array.from(titleMap.entries())
    .filter(([, n]) => n > 1)
    .map(([t]) => t);
  const duplicateDescriptions = Array.from(descMap.entries())
    .filter(([, n]) => n > 1)
    .map(([d]) => d);
  const duplicateH1s = Array.from(h1Map.entries())
    .filter(([, n]) => n > 1)
    .map(([h]) => h);

  // Orphan detection: URLs discovered but no other audited page links to them
  const inboundCounts = new Map<string, number>();
  const normalizeKey = (u: string) => {
    try {
      const url = new URL(u);
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch {
      return u.replace(/\/$/, "");
    }
  };
  for (const p of results) {
    if (!p.outboundInternalLinks) continue;
    for (const link of p.outboundInternalLinks) {
      const key = normalizeKey(link);
      inboundCounts.set(key, (inboundCounts.get(key) || 0) + 1);
    }
  }
  const homepageKey = normalizeKey(startUrl);
  const orphanPages: string[] = [];
  for (const p of results) {
    const key = normalizeKey(p.url);
    if (key === homepageKey) continue;
    if (!inboundCounts.get(key)) orphanPages.push(p.url);
  }

  const canonicalIssues = detectCanonicalIssues(results);
  const hreflangIssues = checkHreflangReciprocity(results);
  const nearDuplicates = findNearDuplicates(results);

  const pagesOut = results
    .sort((a, b) => b.issues.length - a.issues.length)
    .map((p) => ({ ...p, shingles: undefined }));

  return {
    source,
    discovered: urls.length,
    audited: results.length,
    capped,
    cap: SITE_CRAWL_CAP,
    pages: pagesOut,
    duplicateTitles,
    duplicateDescriptions,
    duplicateH1s,
    missingTitles,
    missingDescriptions,
    noindexPages,
    brokenPages,
    totalIssues,
    orphanPages,
    canonicalIssues,
    hreflangIssues,
    nearDuplicates,
  };
}

function overallGrade(pct: number): "A" | "B" | "C" | "D" | "F" {
  if (pct >= 0.9) return "A";
  if (pct >= 0.8) return "B";
  if (pct >= 0.7) return "C";
  if (pct >= 0.6) return "D";
  return "F";
}

export async function runSeoAudit(rawUrl: string): Promise<AuditResult> {
  const url = normalizeUrl(rawUrl);
  const overallStart = performance.now();

  const psiPromise = fetchPageSpeedInsights(url, "mobile");
  const psiDesktopPromise = fetchPageSpeedInsights(url, "desktop");
  const redirectChainPromise = traceRedirectChain(url);

  const { response, elapsedMs: responseMs } = await timedFetch(url);
  const finalUrl = response.url || url;
  const parsedFinal = new URL(finalUrl);
  const origin = `${parsedFinal.protocol}//${parsedFinal.host}`;

  const { text: html, bytes } = await readBody(response);

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!SENSITIVE_HEADERS.has(k)) headers[k] = value;
  });

  const redirects: AuditResult["response"]["redirects"] = [];
  if (response.redirected) {
    redirects.push({ from: url, to: finalUrl, status: 301 });
  }

  const $ = cheerio.load(html);

  const title = $("head title").first().text().trim() || undefined;
  const description =
    $('meta[name="description"]').attr("content")?.trim() || undefined;
  const canonical = $('link[rel="canonical"]').attr("href") || undefined;
  const robots = $('meta[name="robots"]').attr("content") || undefined;
  const viewport = $('meta[name="viewport"]').attr("content") || undefined;
  const lang = $("html").attr("lang") || undefined;
  const charset =
    $('meta[charset]').attr("charset") ||
    $('meta[http-equiv="Content-Type"]').attr("content") ||
    undefined;
  const favicon =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    undefined;
  const author = $('meta[name="author"]').attr("content") || undefined;
  const themeColor =
    $('meta[name="theme-color"]').attr("content") || undefined;
  const metaKeywords = !!$('meta[name="keywords"]').attr("content");

  const headings = {
    h1: $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h2: $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h3: $("h3").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h4: $("h4").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h5: $("h5").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h6: $("h6").map((_, el) => $(el).text().trim()).get().filter(Boolean),
  };

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;
  const textToHtmlRatio = html.length
    ? +((bodyText.length / html.length) * 100).toFixed(2)
    : 0;
  const readability = computeReadability(bodyText);

  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const key = $(el).attr("property");
    const value = $(el).attr("content");
    if (key && value) openGraph[key] = value;
  });

  const twitter: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const key = $(el).attr("name");
    const value = $(el).attr("content");
    if (key && value) twitter[key] = value;
  });

  const schema: AuditResult["schema"] = [];
  const deprecatedSchemaTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const t = item?.["@type"];
        const types = Array.isArray(t) ? t.map(String) : [String(t ?? "Thing")];
        const typeLabel = types.join(",");
        schema.push({ type: typeLabel, raw: item });
        for (const typeName of types) {
          if (DEPRECATED_SCHEMA_TYPES.has(typeName)) {
            deprecatedSchemaTypes.add(typeName);
          }
        }
      }
    } catch {
      schema.push({ type: "InvalidJSON", raw });
    }
  });

  const allLinks: string[] = [];
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  let nofollow = 0;
  let anchorsGenericText = 0;
  const genericAnchorText = new Set([
    "click here", "here", "read more", "learn more", "more", "this", "link",
  ]);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const textRaw = $(el).text().replace(/\s+/g, " ").trim().toLowerCase();
    if (textRaw && genericAnchorText.has(textRaw)) anchorsGenericText += 1;
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("sms:") ||
      href.startsWith("javascript:")
    )
      return;
    // Skip malformed URLs that look like an email was wrapped in https:// (userinfo@host with no path).
    if (/^https?:\/\/[^/]*@/.test(href)) return;
    allLinks.push(href);
    const rel = $(el).attr("rel") || "";
    if (/\bnofollow\b/i.test(rel)) nofollow += 1;
    try {
      const abs = new URL(href, finalUrl);
      if (abs.host === parsedFinal.host) internalLinks.push(abs.toString());
      else externalLinks.push(abs.toString());
    } catch {
      // ignore malformed
    }
  });

  // Image analysis with modern-format + dimensions
  const images: string[] = [];
  const missingAltSrcs: string[] = [];
  let lazyImages = 0;
  let eagerImages = 0;
  let imagesWithDimensions = 0;
  let modernFormatImages = 0;
  let hasFetchPriority = false;
  let altGeneric = 0;
  let altTooLong = 0;
  let altFilenameLike = 0;
  const altQualitySamples: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (!src) return;
    images.push(src);
    const alt = $(el).attr("alt");
    if (alt === undefined || alt.trim() === "") missingAltSrcs.push(src);
    else {
      const q = classifyAltText(alt, src);
      if (q.generic) altGeneric += 1;
      if (q.tooLong) altTooLong += 1;
      if (q.filenameLike) altFilenameLike += 1;
      if ((q.generic || q.tooLong || q.filenameLike) && altQualitySamples.length < 5) {
        altQualitySamples.push(`${src} → "${alt.slice(0, 60)}"`);
      }
    }
    const loading = $(el).attr("loading");
    if (loading === "lazy") lazyImages += 1;
    else if (loading === "eager") eagerImages += 1;
    if ($(el).attr("width") && $(el).attr("height")) imagesWithDimensions += 1;
    const srcDecoded = (() => {
      try {
        return decodeURIComponent(src);
      } catch {
        return src;
      }
    })();
    if (/\.(avif|webp)(\?|&|$)/i.test(srcDecoded)) modernFormatImages += 1;
    if ($(el).attr("fetchpriority")) hasFetchPriority = true;
  });
  $("link[rel='preload'][fetchpriority], link[fetchpriority]").each(() => {
    hasFetchPriority = true;
  });

  const hasPictureElement = $("picture").length > 0;

  // Modern web signals
  const preconnects: string[] = [];
  $('link[rel="preconnect"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) preconnects.push(href);
  });
  const preloads: string[] = [];
  let fontPreloads = 0;
  $('link[rel="preload"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) preloads.push(href);
    const asAttr = $(el).attr("as");
    if (asAttr === "font") fontPreloads += 1;
  });

  let renderBlockingScripts = 0;
  let inlineScriptBytes = 0;
  const thirdPartyOrigins = new Set<string>();
  $("head script").each((_, el) => {
    const src = $(el).attr("src");
    const isAsync = $(el).attr("async") !== undefined;
    const isDefer = $(el).attr("defer") !== undefined;
    const type = $(el).attr("type") || "";
    if (src && !isAsync && !isDefer && type !== "module") renderBlockingScripts += 1;
    if (!src) {
      inlineScriptBytes += ($(el).html() || "").length;
    } else {
      try {
        const u = new URL(src, finalUrl);
        if (u.host !== parsedFinal.host) thirdPartyOrigins.add(u.host);
      } catch {
        // ignore
      }
    }
  });
  $("body script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    try {
      const u = new URL(src, finalUrl);
      if (u.host !== parsedFinal.host) thirdPartyOrigins.add(u.host);
    } catch {
      // ignore
    }
  });

  let renderBlockingStyles = 0;
  $('head link[rel="stylesheet"]').each((_, el) => {
    const media = $(el).attr("media");
    if (!media || media === "all" || media === "screen") renderBlockingStyles += 1;
  });

  let mixedContent = 0;
  if (parsedFinal.protocol === "https:") {
    $("[src], [href]").each((_, el) => {
      const val = $(el).attr("src") || $(el).attr("href") || "";
      if (/^http:\/\//i.test(val)) mixedContent += 1;
    });
  }

  // Font-display detection (inline CSS or style blocks)
  let hasFontDisplay: boolean | undefined;
  $("style").each((_, el) => {
    const css = $(el).html() || "";
    if (/font-display\s*:/i.test(css)) hasFontDisplay = true;
  });
  if (hasFontDisplay === undefined && $('link[rel="stylesheet"]').length === 0) {
    hasFontDisplay = false;
  }

  // Hreflang
  const hreflangCount = $('link[rel="alternate"][hreflang]').length;

  // Accessibility landmarks
  const mainEls = $("main, [role='main']");
  const accessibility = {
    landmarks: {
      header: $("header, [role='banner']").length > 0,
      nav: $("nav, [role='navigation']").length > 0,
      main: mainEls.length > 0,
      mainCount: mainEls.length,
      footer: $("footer, [role='contentinfo']").length > 0,
      article: $("article").length > 0,
      section: $("section").length > 0,
    },
    skipLink:
      $('a[href^="#"]').filter((_, el) => /skip|main|content/i.test($(el).text())).length > 0,
    formsWithoutLabels: (() => {
      let count = 0;
      $("input, select, textarea").each((_, el) => {
        const $el = $(el);
        const type = ($el.attr("type") || "").toLowerCase();
        if (["hidden", "submit", "button", "image"].includes(type)) return;
        const id = $el.attr("id");
        const ariaLabel = $el.attr("aria-label");
        const ariaLabelledby = $el.attr("aria-labelledby");
        const wrappedLabel = $el.parents("label").length > 0;
        const labelFor = id ? $(`label[for="${id}"]`).length > 0 : false;
        if (!ariaLabel && !ariaLabelledby && !wrappedLabel && !labelFor) count += 1;
      });
      return count;
    })(),
    anchorsGenericText,
    langValid: !!lang && /^[a-z]{2}(-[A-Z]{2})?$/i.test(lang),
  };

  // Deprecated tags detection
  const deprecatedTags: string[] = [];
  for (const tag of DEPRECATED_TAGS) {
    if ($(tag).length > 0) deprecatedTags.push(tag);
  }

  const canonicalReachablePromise: Promise<{ status: number; finalUrl: string } | null> = (async () => {
    if (!canonical) return null;
    try {
      const target = canonical.startsWith("http")
        ? canonical
        : new URL(canonical, finalUrl).toString();
      const { response } = await timedFetch(
        target,
        { method: "HEAD", redirect: "follow" },
        5000
      );
      let status = response.status;
      if (status === 405 || status === 501) {
        const retry = await timedFetch(
          target,
          { method: "GET", redirect: "follow" },
          5000
        );
        status = retry.response.status;
        return { status, finalUrl: retry.response.url || target };
      }
      return { status, finalUrl: response.url || target };
    } catch {
      return { status: 0, finalUrl: canonical };
    }
  })();

  const [brokenSampled, oversizedImages, canonicalReachable] = await Promise.all([
    sampleLinkStatuses([...internalLinks, ...externalLinks], origin),
    sampleImageWeights(images, origin),
    canonicalReachablePromise,
  ]);

  const https = parsedFinal.protocol === "https:";
  const hsts = !!headers["strict-transport-security"];
  const csp = !!headers["content-security-policy"];
  const xFrameOptions = !!headers["x-frame-options"];
  const xContentTypeOptions = !!headers["x-content-type-options"];
  const referrerPolicy = !!headers["referrer-policy"];
  const permissionsPolicy =
    !!headers["permissions-policy"] || !!headers["feature-policy"];

  const crawlability = await fetchRobotsAndSitemap(origin);
  const crawlabilityFull = { ...crawlability, hreflangCount };

  // HTTP version hints
  const altSvc = headers["alt-svc"] || "";
  const serverHeader = headers["server"] || "";
  const hasAltSvc = !!altSvc;
  const http3Hint = /h3/i.test(altSvc);
  const httpVersionHint = http3Hint
    ? "HTTP/3 (alt-svc)"
    : /cloudflare|fastly|vercel|akamai/i.test(serverHeader) || hasAltSvc
      ? "HTTP/2 likely"
      : undefined;
  const http2 = !!httpVersionHint;

  // Core Web Vitals from PSI
  const coreWebVitals = await psiPromise;
  const coreWebVitalsDesktop = await psiDesktopPromise;
  const redirectTrace = await redirectChainPromise;

  // llms.txt, TLS, OG image
  const llmsTxt = await fetchLlmsTxt(origin);
  const tlsInfo = https ? await inspectTls(parsedFinal.host) : undefined;
  const ogImageUrl = openGraph["og:image"];
  const ogImageMeta = ogImageUrl
    ? await measureOgImage(new URL(ogImageUrl, finalUrl).toString())
    : undefined;

  // SRI scan (synchronous, uses already-parsed cheerio)
  const subresourceIntegrity = scanSubresourceIntegrity($, finalUrl);

  // DNS + sitemap validation + headless (run concurrently with site crawl below)
  const dnsPromise = inspectDns(parsedFinal.host);
  const sitemapValidationPromise = crawlability.sitemapUrl
    ? validateSitemap(crawlability.sitemapUrl)
    : Promise.resolve(undefined);
  const headlessPromise =
    process.env.SEO_AUDIT_HEADLESS === "1"
      ? runHeadlessAudit(finalUrl)
      : Promise.resolve<AuditResult["headless"]>({
          attempted: false,
          available: false,
        });

  // Schema validation + opportunities
  const schemaValidation: { type: string; issues: string[] }[] = [];
  const schemaTypeSet = new Set<string>();
  for (const block of schema) {
    if (block.type === "InvalidJSON") continue;
    schemaValidation.push(...validateSchemaItem(block.raw));
    for (const t of block.type.split(",")) schemaTypeSet.add(t);
  }
  const schemaOpportunities = {
    breadcrumb: schemaTypeSet.has("BreadcrumbList"),
    faq: schemaTypeSet.has("FAQPage"),
    article:
      schemaTypeSet.has("Article") ||
      schemaTypeSet.has("BlogPosting") ||
      schemaTypeSet.has("NewsArticle"),
    localBusiness:
      schemaTypeSet.has("LocalBusiness") ||
      schemaTypeSet.has("ProfessionalService"),
  };

  // Site-wide crawl
  const siteCrawl = await runSiteCrawl(
    origin,
    finalUrl,
    crawlability.sitemapUrl,
    html,
    finalUrl
  );

  const [dnsInfo, sitemapValidation, headless] = await Promise.all([
    dnsPromise,
    sitemapValidationPromise,
    headlessPromise,
  ]);

  const richResultsEligibility = computeRichResultsEligibility(
    schema,
    schemaValidation
  );

  // --- Checks ---
  const metaChecks: Check[] = [];
  metaChecks.push(
    makeCheck("title-present", "Title tag present", title ? "pass" : "fail", {
      value: title,
      impact: "high",
      recommendation: !title
        ? "Every page needs a unique <title>. Search engines use it as the primary headline."
        : undefined,
    })
  );
  if (title) {
    const len = title.length;
    metaChecks.push(
      makeCheck(
        "title-length",
        "Title length (optimal 51–60 chars)",
        len >= 51 && len <= 60 ? "pass" : len >= 30 && len <= 65 ? "warn" : "fail",
        {
          value: `${len} chars`,
          recommendation:
            len < 30
              ? "Under 30 chars wastes SERP space. Aim for 51–60."
              : len > 65
                ? "Over 65 chars gets truncated in SERPs. Tighten to 51–60."
                : len > 60
                  ? "Slightly long — 51–60 is the safest truncation range."
                  : len < 51
                    ? "Short titles miss keyword opportunities. Push closer to 60."
                    : undefined,
        }
      )
    );
  }
  metaChecks.push(
    makeCheck(
      "meta-description",
      "Meta description present",
      description ? "pass" : "fail",
      {
        value: description,
        impact: "high",
        recommendation: !description
          ? 'Add <meta name="description"> between 150–160 chars — what shows under your title in Google.'
          : undefined,
      }
    )
  );
  if (description) {
    const len = description.length;
    metaChecks.push(
      makeCheck(
        "meta-description-length",
        "Description length (150–160)",
        len >= 150 && len <= 160 ? "pass" : len >= 120 && len <= 170 ? "warn" : "fail",
        {
          value: `${len} chars`,
          recommendation:
            len < 120
              ? "Too short. Expand to 150–160 to use all SERP real estate."
              : len > 170
                ? "Too long — will be truncated by Google."
                : "Tighten toward the 150–160 sweet spot.",
        }
      )
    );
  }
  metaChecks.push(
    makeCheck("canonical", "Canonical URL set", canonical ? "pass" : "warn", {
      value: canonical,
      recommendation: !canonical
        ? 'Add <link rel="canonical" href="..."> to prevent duplicate-content dilution.'
        : undefined,
    })
  );
  if (canonical) {
    const status = canonicalReachable?.status ?? 0;
    const canonicalStatus: CheckStatus =
      status === 0 ? "warn" : status >= 200 && status < 300 ? "pass" : "fail";
    const redirected =
      canonicalReachable &&
      canonicalKey(canonical, finalUrl) !== canonicalKey(canonicalReachable.finalUrl);
    metaChecks.push(
      makeCheck(
        "canonical-reachable",
        "Canonical URL resolves to 200",
        canonicalStatus === "pass" && !redirected
          ? "pass"
          : canonicalStatus === "pass" && redirected
            ? "warn"
            : canonicalStatus,
        {
          value:
            status === 0
              ? "fetch failed"
              : redirected
                ? `${status} after redirect to ${canonicalReachable!.finalUrl}`
                : `${status} ${status >= 200 && status < 300 ? "OK" : ""}`.trim(),
          impact: "high",
          recommendation:
            status === 0
              ? "Canonical URL did not respond. Broken canonicals deindex pages — fix the target."
              : status >= 400
                ? `Canonical points to a ${status} page. Update the canonical to a live URL, or Google may drop the page from its index.`
                : redirected
                  ? "Canonical redirects — point to the final URL directly to avoid wasted crawl budget."
                  : undefined,
        }
      )
    );
  }
  metaChecks.push(
    makeCheck(
      "robots-meta",
      "robots meta directive",
      !robots || !/noindex/i.test(robots) ? "pass" : "fail",
      {
        value: robots,
        impact: "high",
        recommendation:
          robots && /noindex/i.test(robots)
            ? "This page is noindex. Google will drop it from search unless removed."
            : undefined,
      }
    )
  );
  metaChecks.push(
    makeCheck("lang-attribute", "HTML lang attribute", lang ? "pass" : "warn", {
      value: lang,
      recommendation: !lang
        ? 'Add lang="en" (or your target language) to <html>.'
        : undefined,
    })
  );
  metaChecks.push(
    makeCheck("charset", "Charset declaration", charset ? "pass" : "warn", {
      value: charset,
    })
  );
  metaChecks.push(
    makeCheck("favicon", "Favicon present", favicon ? "pass" : "warn", {
      value: favicon,
    })
  );

  const contentChecks: Check[] = [];
  contentChecks.push(
    makeCheck(
      "h1-count",
      "Exactly one H1",
      headings.h1.length === 1
        ? "pass"
        : headings.h1.length === 0
          ? "fail"
          : "warn",
      {
        value: `${headings.h1.length} H1 tag(s)`,
        impact: "high",
        recommendation:
          headings.h1.length === 0
            ? "Every page should have exactly one H1."
            : headings.h1.length > 1
              ? "Multiple H1s dilute topical focus."
              : undefined,
      }
    )
  );
  contentChecks.push(
    makeCheck(
      "headings-present",
      "Secondary headings (H2)",
      headings.h2.length >= 2 ? "pass" : "warn",
      {
        value: `${headings.h2.length} H2 tag(s)`,
        recommendation:
          headings.h2.length < 2
            ? "Break content into scannable H2 sections."
            : undefined,
      }
    )
  );
  contentChecks.push(
    makeCheck(
      "heading-skip",
      "No heading-level skips",
      (() => {
        if (headings.h3.length > 0 && headings.h2.length === 0) return "warn";
        if (headings.h4.length > 0 && headings.h3.length === 0) return "warn";
        return "pass";
      })(),
      {
        recommendation:
          headings.h3.length > 0 && headings.h2.length === 0
            ? "Skipping heading levels confuses assistive tech. Don't jump from H1 to H3."
            : undefined,
      }
    )
  );
  contentChecks.push(
    makeCheck(
      "word-count",
      "Content depth (word count)",
      wordCount >= 400 ? "pass" : wordCount >= 200 ? "warn" : "fail",
      {
        value: `${wordCount.toLocaleString()} words`,
        recommendation:
          wordCount < 400
            ? "Thin pages rarely rank. Aim for 400+ words of useful content."
            : undefined,
      }
    )
  );
  contentChecks.push(
    makeCheck(
      "text-html-ratio",
      "Text-to-HTML ratio",
      textToHtmlRatio >= 15 ? "pass" : textToHtmlRatio >= 8 ? "warn" : "fail",
      {
        value: `${textToHtmlRatio}%`,
        recommendation:
          textToHtmlRatio < 15
            ? "Low ratio suggests heavy markup with little content. Trim bloat or add copy."
            : undefined,
      }
    )
  );
  contentChecks.push(
    makeCheck("viewport", "Mobile viewport meta", viewport ? "pass" : "fail", {
      value: viewport,
      impact: "high",
      recommendation: !viewport
        ? 'Missing viewport meta breaks mobile. Add <meta name="viewport" content="width=device-width, initial-scale=1">.'
        : undefined,
    })
  );
  contentChecks.push(
    makeCheck(
      "readability",
      "Reading ease (Flesch score)",
      (() => {
        if (!readability) return "info";
        const fre = readability.fleschReadingEase;
        if (fre >= 55) return "pass";
        if (fre >= 35) return "warn";
        return "fail";
      })(),
      {
        value: readability
          ? `FRE ${readability.fleschReadingEase} · grade ${readability.gradeLevel} · ${readability.avgWordsPerSentence} words/sentence`
          : wordCount < 30
            ? "too little prose to score"
            : "unable to score",
        detail: readability
          ? `${readability.sentenceCount} sentences · ${readability.avgSyllablesPerWord} syllables/word`
          : undefined,
        recommendation: readability && readability.fleschReadingEase < 55
          ? (() => {
              const parts: string[] = [
                `FRE ${readability.fleschReadingEase} (aim for 55+, grade 9 or lower).`,
              ];
              if (readability.avgWordsPerSentence > 20) {
                parts.push(
                  `Sentences average ${readability.avgWordsPerSentence} words — break long ones in half.`
                );
              }
              if (readability.avgSyllablesPerWord > 1.7) {
                parts.push(
                  `Words average ${readability.avgSyllablesPerWord} syllables — swap jargon for plainer words.`
                );
              }
              return parts.join(" ");
            })()
          : undefined,
      }
    )
  );

  const socialChecks: Check[] = [];
  socialChecks.push(
    makeCheck("og-title", "Open Graph title", openGraph["og:title"] ? "pass" : "warn", {
      value: openGraph["og:title"],
    })
  );
  socialChecks.push(
    makeCheck("og-description", "Open Graph description", openGraph["og:description"] ? "pass" : "warn", {
      value: openGraph["og:description"],
    })
  );
  socialChecks.push(
    makeCheck("og-image", "Open Graph image", openGraph["og:image"] ? "pass" : "warn", {
      value: openGraph["og:image"],
      recommendation: !openGraph["og:image"]
        ? "Without og:image, link previews look blank."
        : undefined,
    })
  );
  socialChecks.push(
    makeCheck("og-url", "Open Graph URL", openGraph["og:url"] ? "pass" : "warn", {
      value: openGraph["og:url"],
    })
  );
  socialChecks.push(
    makeCheck("og-type", "Open Graph type", openGraph["og:type"] ? "pass" : "warn", {
      value: openGraph["og:type"],
    })
  );
  socialChecks.push(
    makeCheck("twitter-card", "Twitter card tag", twitter["twitter:card"] ? "pass" : "warn", {
      value: twitter["twitter:card"],
    })
  );

  const schemaChecks: Check[] = [];
  schemaChecks.push(
    makeCheck(
      "schema-present",
      "JSON-LD structured data",
      schema.length > 0 ? "pass" : "warn",
      {
        value: schema.length > 0 ? `${schema.length} block(s)` : undefined,
        detail: schema.length > 0 ? schema.map((s) => s.type).join(", ") : undefined,
        recommendation:
          schema.length === 0
            ? "Add JSON-LD Organization + LocalBusiness schema for rich results."
            : undefined,
      }
    )
  );
  const invalidSchema = schema.some((s) => s.type === "InvalidJSON");
  schemaChecks.push(
    makeCheck("schema-valid", "Structured data parses", invalidSchema ? "fail" : "pass", {
      recommendation: invalidSchema
        ? "One JSON-LD block has a syntax error — invalid schema is ignored."
        : undefined,
    })
  );
  if (deprecatedSchemaTypes.size > 0) {
    schemaChecks.push(
      makeCheck(
        "schema-deprecated",
        "No deprecated schema types",
        "warn",
        {
          value: Array.from(deprecatedSchemaTypes).join(", "),
          recommendation:
            "Google has deprecated these rich-result types. They'll still parse but no longer drive SERP features.",
        }
      )
    );
  } else {
    schemaChecks.push(
      makeCheck("schema-deprecated", "No deprecated schema types", "pass")
    );
  }
  schemaChecks.push(
    makeCheck(
      "schema-required-fields",
      "Schema required fields present",
      schema.length === 0
        ? "info"
        : schemaValidation.length === 0
          ? "pass"
          : "fail",
      {
        value: schemaValidation.length === 0
          ? "all required fields"
          : `${schemaValidation.length} block(s) incomplete`,
        detail: schemaValidation
          .map((v) => `${v.type}: ${v.issues.join("; ")}`)
          .join("\n"),
        recommendation:
          schemaValidation.length > 0
            ? (() => {
                const first = schemaValidation[0];
                const example = `${first.type} needs ${first.issues.slice(0, 2).join(" and ")}`;
                return schemaValidation.length === 1
                  ? `${example}. Google ignores incomplete schema — add the missing fields to restore rich-result eligibility.`
                  : `${schemaValidation.length} schema blocks are incomplete (e.g. ${example}). See detail for the full list — Google ignores them until the required fields are filled in.`;
              })()
            : undefined,
      }
    )
  );
  schemaChecks.push(
    makeCheck(
      "schema-opportunity-breadcrumb",
      "BreadcrumbList schema",
      schemaOpportunities.breadcrumb ? "pass" : "info",
      {
        recommendation: !schemaOpportunities.breadcrumb
          ? "Add BreadcrumbList JSON-LD for hierarchical SERP snippets."
          : undefined,
      }
    )
  );
  schemaChecks.push(
    makeCheck(
      "schema-opportunity-faq",
      "FAQPage schema",
      "info",
      {
        value: schemaOpportunities.faq ? "present" : "not present",
        recommendation: !schemaOpportunities.faq
          ? "If the page has Q&A content, FAQPage schema can unlock expandable SERP features."
          : undefined,
      }
    )
  );
  schemaChecks.push(
    makeCheck(
      "schema-opportunity-article",
      "Article/BlogPosting schema",
      "info",
      {
        value: schemaOpportunities.article ? "present" : "not present",
        recommendation: !schemaOpportunities.article
          ? "For editorial content, Article/BlogPosting schema drives Top Stories + Discover surfaces."
          : undefined,
      }
    )
  );
  schemaChecks.push(
    makeCheck(
      "schema-rich-results",
      "Rich Results eligibility",
      (() => {
        if (schema.length === 0) return "info";
        const eligible = richResultsEligibility.eligibleTypes.length;
        const ineligible = richResultsEligibility.ineligibleReasons.length;
        if (eligible === 0) return "warn";
        if (ineligible === 0) return "pass";
        return "warn";
      })(),
      {
        value:
          richResultsEligibility.eligibleTypes.length > 0
            ? `${richResultsEligibility.eligibleTypes.length} eligible · ${richResultsEligibility.ineligibleReasons.length} incomplete`
            : "none eligible",
        detail: [
          richResultsEligibility.eligibleTypes.length
            ? `Eligible: ${richResultsEligibility.eligibleTypes.join(", ")}`
            : "",
          ...richResultsEligibility.ineligibleReasons.slice(0, 6),
        ]
          .filter(Boolean)
          .join("\n"),
        recommendation:
          richResultsEligibility.eligibleTypes.length === 0 && schema.length > 0
            ? "Schema parses but is missing Google-recommended fields for rich results. Check Search Console's Rich Results Test."
            : richResultsEligibility.ineligibleReasons.length > 0
              ? "Some schema types are missing recommended fields — filling these unlocks more SERP features."
              : undefined,
      }
    )
  );

  const linkChecks: Check[] = [];
  linkChecks.push(
    makeCheck("link-count", "Link health", allLinks.length < 150 ? "pass" : "warn", {
      value: `${allLinks.length} links (${internalLinks.length} internal / ${externalLinks.length} external)`,
      recommendation:
        allLinks.length >= 150
          ? "Over 150 links on a page is a lot — Google may not crawl them all."
          : undefined,
    })
  );
  linkChecks.push(
    makeCheck(
      "broken-links",
      "Broken links (sampled)",
      brokenSampled.length === 0 ? "pass" : "fail",
      {
        value:
          brokenSampled.length === 0
            ? `0 / ${Math.min(LINK_SAMPLE_SIZE, allLinks.length)} sampled`
            : `${brokenSampled.length} broken`,
        detail: brokenSampled.map((b) => `${b.status || "ERR"} ${b.href}`).join("\n"),
        recommendation:
          brokenSampled.length > 0
            ? "Broken outbound links hurt trust and crawl signals."
            : undefined,
      }
    )
  );
  linkChecks.push(
    makeCheck("nofollow-balance", "Nofollow link share", "info", {
      value: `${nofollow} nofollow / ${allLinks.length} total`,
    })
  );

  const imageChecks: Check[] = [];
  imageChecks.push(
    makeCheck(
      "alt-text",
      "Images with alt text",
      images.length === 0
        ? "info"
        : missingAltSrcs.length === 0
          ? "pass"
          : missingAltSrcs.length / images.length < 0.1
            ? "warn"
            : "fail",
      {
        value: `${images.length - missingAltSrcs.length} / ${images.length} with alt`,
        impact: "medium",
        detail: missingAltSrcs.slice(0, 5).join("\n"),
        recommendation:
          missingAltSrcs.length > 0
            ? "Alt text drives accessibility and image SEO."
            : undefined,
      }
    )
  );
  imageChecks.push(
    makeCheck(
      "image-dimensions",
      "Images declare width + height",
      images.length === 0
        ? "info"
        : imagesWithDimensions / images.length >= 0.9
          ? "pass"
          : imagesWithDimensions / images.length >= 0.6
            ? "warn"
            : "fail",
      {
        value: `${imagesWithDimensions} / ${images.length}`,
        recommendation:
          imagesWithDimensions / Math.max(images.length, 1) < 0.9
            ? "Width/height on <img> prevents CLS. Set explicit dimensions."
            : undefined,
      }
    )
  );
  imageChecks.push(
    makeCheck(
      "image-modern-format",
      "AVIF/WebP usage",
      images.length === 0
        ? "info"
        : modernFormatImages / images.length >= 0.6
          ? "pass"
          : modernFormatImages / images.length >= 0.2
            ? "warn"
            : "fail",
      {
        value: `${modernFormatImages} / ${images.length} modern`,
        recommendation:
          modernFormatImages / Math.max(images.length, 1) < 0.6
            ? "Serve AVIF/WebP — 30–50% smaller than JPEG/PNG."
            : undefined,
      }
    )
  );
  imageChecks.push(
    makeCheck(
      "alt-text-quality",
      "Alt text quality",
      (() => {
        const bad = altGeneric + altTooLong + altFilenameLike;
        if (images.length === 0 || images.length - missingAltSrcs.length === 0) return "info";
        if (bad === 0) return "pass";
        return bad / Math.max(images.length, 1) >= 0.3 ? "fail" : "warn";
      })(),
      {
        value: `${altGeneric} generic, ${altTooLong} too-long, ${altFilenameLike} filename-like`,
        detail: altQualitySamples.join("\n"),
        recommendation:
          altGeneric + altTooLong + altFilenameLike > 0
            ? "Alt text should describe the image concisely (<125 chars) — avoid \"image\", filenames, or repeating filenames."
            : undefined,
      }
    )
  );
  imageChecks.push(
    makeCheck(
      "og-image-dimensions",
      "OG image dimensions (≥1200×630)",
      (() => {
        if (!ogImageUrl) return "info";
        if (ogImageMeta?.error) return "warn";
        const w = ogImageMeta?.width ?? 0;
        const h = ogImageMeta?.height ?? 0;
        if (w === 0 || h === 0) return "warn";
        return w >= 1200 && h >= 630 ? "pass" : "fail";
      })(),
      (() => {
        const w = ogImageMeta?.width;
        const h = ogImageMeta?.height;
        const bytesKB = Math.round((ogImageMeta?.bytes || 0) / 1024);
        const value = w && h
          ? `${w}×${h} (${ogImageMeta?.format || ""}, ${bytesKB} KB)`
          : ogImageMeta?.error || (ogImageUrl ? "measuring failed" : "no og:image");
        let recommendation: string | undefined;
        if (ogImageUrl && w && h && (w < 1200 || h < 630)) {
          const wTooSmall = w < 1200;
          const hTooSmall = h < 630;
          const ratio = w / h;
          const ratioOff = ratio < 1.7 || ratio > 2.1;
          if (wTooSmall && hTooSmall) {
            recommendation = `${w}×${h} is too small — export a 1200×630 PNG/JPG for crisp Facebook, LinkedIn, and X previews.`;
          } else if (wTooSmall) {
            recommendation = `Width ${w} < 1200 (height ${h} is fine). Export a 1200×630 PNG/JPG to stop social scrapers from upscaling it.`;
          } else if (hTooSmall) {
            recommendation = `Height ${h} < 630 (width ${w} is fine) — your image is letterboxed. Export 1200×630 so LinkedIn and X don't crop the top/bottom.`;
          }
          if (ratioOff && !(wTooSmall && hTooSmall)) {
            recommendation = `${recommendation ?? ""} Aspect ratio ${ratio.toFixed(2)}:1 is off (target ~1.91:1).`.trim();
          }
        } else if (ogImageUrl && w && h && bytesKB > 8000) {
          recommendation = `OG image is ${bytesKB} KB — compress to under 8 MB (target <1 MB) so social scrapers don't time out.`;
        }
        return { value, recommendation };
      })()
    )
  );
  imageChecks.push(
    makeCheck(
      "image-lazy-loading",
      "Below-the-fold lazy loading",
      images.length <= 2
        ? "info"
        : lazyImages > 0
          ? "pass"
          : "warn",
      {
        value: `${lazyImages} lazy / ${eagerImages} eager`,
        recommendation:
          images.length > 2 && lazyImages === 0
            ? 'Add loading="lazy" to below-the-fold images to save bandwidth.'
            : undefined,
      }
    )
  );
  imageChecks.push(
    makeCheck(
      "image-weight",
      "Image file sizes (≤200 KB sampled)",
      (() => {
        if (images.length === 0) return "info";
        if (oversizedImages.length === 0) return "pass";
        const biggestKB = Math.round(
          Math.max(...oversizedImages.map((o) => o.bytes)) / 1024
        );
        if (biggestKB > 1000 || oversizedImages.length >= 5) return "fail";
        return "warn";
      })(),
      {
        value:
          images.length === 0
            ? "no images"
            : oversizedImages.length === 0
              ? `all ${Math.min(IMAGE_WEIGHT_SAMPLE_SIZE, images.length)} sampled images ≤200 KB`
              : `${oversizedImages.length} / ${Math.min(IMAGE_WEIGHT_SAMPLE_SIZE, images.length)} sampled > 200 KB`,
        detail:
          oversizedImages.length > 0
            ? oversizedImages
                .slice(0, 5)
                .map((o) => `${Math.round(o.bytes / 1024)} KB — ${o.src}`)
                .join("\n")
            : undefined,
        recommendation:
          oversizedImages.length > 0
            ? "Compress and serve in AVIF/WebP — images over 200 KB drag LCP. Use next/image or a CDN image transformer."
            : undefined,
        impact: oversizedImages.length >= 5 ? "high" : oversizedImages.length > 0 ? "medium" : "low",
      }
    )
  );

  const securityChecks: Check[] = [];
  securityChecks.push(
    makeCheck("https", "HTTPS", https ? "pass" : "fail", {
      impact: "high",
      recommendation: !https
        ? 'Serve over HTTPS. HTTP shows "not secure" in Chrome.'
        : undefined,
    })
  );
  securityChecks.push(
    makeCheck("hsts", "HSTS header", hsts ? "pass" : "warn", {
      value: headers["strict-transport-security"],
      recommendation: !hsts
        ? "Add Strict-Transport-Security to force HTTPS."
        : undefined,
    })
  );
  securityChecks.push(
    makeCheck("csp", "Content Security Policy", csp ? "pass" : "warn", {
      recommendation: !csp
        ? "A CSP header blocks XSS-style injection."
        : undefined,
    })
  );
  securityChecks.push(
    makeCheck(
      "x-content-type",
      "X-Content-Type-Options: nosniff",
      xContentTypeOptions ? "pass" : "warn"
    )
  );
  securityChecks.push(
    makeCheck(
      "x-frame",
      "Clickjacking protection (CSP frame-ancestors preferred)",
      csp ? "pass" : xFrameOptions ? "warn" : "fail",
      {
        recommendation: !csp
          ? xFrameOptions
            ? "X-Frame-Options works but is deprecated. Migrate to CSP frame-ancestors."
            : "No clickjacking protection. Add CSP frame-ancestors 'self'."
          : undefined,
      }
    )
  );
  securityChecks.push(
    makeCheck("referrer-policy", "Referrer-Policy header", referrerPolicy ? "pass" : "warn")
  );
  securityChecks.push(
    makeCheck("permissions-policy", "Permissions-Policy header", permissionsPolicy ? "pass" : "warn")
  );
  securityChecks.push(
    makeCheck(
      "tls-version",
      "TLS 1.2+ with valid cert",
      (() => {
        if (!https) return "fail";
        if (!tlsInfo || tlsInfo.error) return "info";
        const protoOk = /^TLSv1\.[23]$/.test(tlsInfo.protocol || "");
        const certOk = (tlsInfo.daysUntilExpiry ?? -1) > 14;
        if (protoOk && certOk) return "pass";
        if (!protoOk) return "fail";
        return (tlsInfo.daysUntilExpiry ?? -1) > 0 ? "warn" : "fail";
      })(),
      {
        value: tlsInfo
          ? tlsInfo.error
            ? tlsInfo.error
            : `${tlsInfo.protocol || "?"}${tlsInfo.daysUntilExpiry !== undefined ? ` · cert expires in ${tlsInfo.daysUntilExpiry}d` : ""}`
          : "n/a",
        recommendation:
          tlsInfo && !/^TLSv1\.[23]$/.test(tlsInfo.protocol || "")
            ? "Serve TLS 1.2+. TLS 1.0/1.1 are deprecated."
            : tlsInfo && (tlsInfo.daysUntilExpiry ?? 99) < 14
              ? "Cert expires soon. Renew before it lapses."
              : undefined,
      }
    )
  );
  securityChecks.push(
    makeCheck(
      "mixed-content",
      "No mixed content",
      mixedContent === 0 ? "pass" : "fail",
      {
        value: mixedContent > 0 ? `${mixedContent} http:// assets on https:// page` : undefined,
        impact: "high",
        recommendation:
          mixedContent > 0
            ? "Mixed content is blocked by browsers and fails PCI checks."
            : undefined,
      }
    )
  );
  securityChecks.push(
    makeCheck(
      "sri",
      "Subresource Integrity on external assets",
      (() => {
        const ext = subresourceIntegrity.externalScripts;
        if (ext === 0) return "info";
        if (subresourceIntegrity.withIntegrity === ext) return "pass";
        if (subresourceIntegrity.withIntegrity / ext >= 0.5) return "warn";
        return "fail";
      })(),
      {
        value: `${subresourceIntegrity.withIntegrity} / ${subresourceIntegrity.externalScripts} with integrity=`,
        detail: subresourceIntegrity.withoutIntegrity.slice(0, 5).join("\n"),
        recommendation:
          subresourceIntegrity.externalScripts > 0 &&
          subresourceIntegrity.withIntegrity < subresourceIntegrity.externalScripts
            ? 'Add integrity="sha384-…" and crossorigin to third-party scripts/stylesheets to prevent CDN tampering.'
            : undefined,
      }
    )
  );
  securityChecks.push(
    makeCheck(
      "dns-dmarc",
      "DMARC record",
      dnsInfo?.dmarc ? "pass" : dnsInfo?.error ? "info" : "warn",
      {
        value: dnsInfo?.dmarc || dnsInfo?.error || "not set",
        recommendation: !dnsInfo?.dmarc && !dnsInfo?.error
          ? "Publish a DMARC TXT record at _dmarc.<domain> to protect your email reputation and reduce spoofing."
          : undefined,
      }
    )
  );
  securityChecks.push(
    makeCheck(
      "dns-spf",
      "SPF record",
      dnsInfo?.spf ? "pass" : dnsInfo?.error ? "info" : "warn",
      {
        value: dnsInfo?.spf || dnsInfo?.error || "not set",
        recommendation: !dnsInfo?.spf && !dnsInfo?.error
          ? "Add v=spf1 TXT record so downstream mail servers can verify sending authorization."
          : undefined,
      }
    )
  );
  securityChecks.push(
    makeCheck(
      "dns-caa",
      "CAA records",
      dnsInfo?.caa && dnsInfo.caa.length > 0
        ? "pass"
        : dnsInfo?.error
          ? "info"
          : "info",
      {
        value: dnsInfo?.caa?.join(", ") || "not set",
        recommendation:
          !dnsInfo?.caa || dnsInfo.caa.length === 0
            ? "CAA records pin which CAs can issue certificates for your domain — a defense against mis-issuance."
            : undefined,
      }
    )
  );

  const perfChecks: Check[] = [];
  perfChecks.push(
    makeCheck(
      "response-time",
      "Server response time (TTFB)",
      responseMs < 600 ? "pass" : responseMs < 1500 ? "warn" : "fail",
      {
        value: `${responseMs}ms`,
        impact: "high",
        recommendation:
          responseMs >= 600
            ? "TTFB over 600ms hurts Core Web Vitals."
            : undefined,
      }
    )
  );
  const kb = Math.round(bytes / 1024);
  perfChecks.push(
    makeCheck(
      "page-weight",
      "HTML page weight",
      bytes < 150_000 ? "pass" : bytes < 400_000 ? "warn" : "fail",
      {
        value: `${kb} KB`,
        recommendation:
          bytes >= 150_000
            ? "Heavy HTML slows parsing. Defer non-critical JS."
            : undefined,
      }
    )
  );
  const compression = headers["content-encoding"] || "";
  perfChecks.push(
    makeCheck(
      "compression",
      "HTTP compression (br/zstd preferred)",
      /br|zstd/i.test(compression)
        ? "pass"
        : /gzip/i.test(compression)
          ? "warn"
          : "fail",
      {
        value: compression || "none",
        recommendation: !compression
          ? "Enable brotli (or at minimum gzip)."
          : /gzip/i.test(compression) && !/br|zstd/i.test(compression)
            ? "Upgrade from gzip to brotli for 15–20% smaller payloads."
            : undefined,
      }
    )
  );
  perfChecks.push(
    makeCheck(
      "cache-control",
      "Cache-Control set",
      headers["cache-control"] ? "pass" : "warn",
      { value: headers["cache-control"] }
    )
  );
  perfChecks.push(
    makeCheck(
      "redirect-chain",
      "Redirect chain depth",
      redirectTrace.chain.length <= 1 ? "pass" : redirectTrace.chain.length <= 2 ? "warn" : "fail",
      {
        value: `${redirectTrace.chain.length} hop(s)`,
        detail: redirectTrace.chain
          .map((r) => `${r.status} ${r.from} → ${r.to}`)
          .join("\n"),
        recommendation:
          redirectTrace.chain.length > 1
            ? "Each redirect adds a roundtrip. Collapse chains to a single 301."
            : undefined,
      }
    )
  );
  perfChecks.push(
    makeCheck(
      "http-version",
      "HTTP/2 or HTTP/3",
      http3Hint ? "pass" : hasAltSvc ? "pass" : httpVersionHint ? "warn" : "warn",
      {
        value: httpVersionHint || "unknown",
        recommendation: !httpVersionHint
          ? "Upgrade to HTTP/2 or HTTP/3 via your CDN for multiplexed requests."
          : undefined,
      }
    )
  );

  const cwvChecks: Check[] = [];
  if (coreWebVitals && !coreWebVitals.error) {
    const { lcpMs, inpMs, cls, performanceScore } = coreWebVitals;
    if (typeof lcpMs === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-lcp",
          "Largest Contentful Paint (LCP)",
          lcpMs <= 2500 ? "pass" : lcpMs <= 4000 ? "warn" : "fail",
          {
            value: `${Math.round(lcpMs)}ms`,
            impact: "high",
            recommendation:
              lcpMs > 2500
                ? "Target LCP ≤ 2.5s. Optimize hero image, preload critical assets, reduce TTFB."
                : undefined,
          }
        )
      );
    }
    if (typeof inpMs === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-inp",
          "Interaction to Next Paint (INP)",
          inpMs <= 200 ? "pass" : inpMs <= 500 ? "warn" : "fail",
          {
            value: `${Math.round(inpMs)}ms`,
            impact: "high",
            recommendation:
              inpMs > 200
                ? "Target INP ≤ 200ms. Break up long tasks and reduce main-thread work."
                : undefined,
          }
        )
      );
    }
    if (typeof cls === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-cls",
          "Cumulative Layout Shift (CLS)",
          cls <= 0.1 ? "pass" : cls <= 0.25 ? "warn" : "fail",
          {
            value: cls.toFixed(3),
            impact: "high",
            recommendation:
              cls > 0.1
                ? "Target CLS ≤ 0.1. Set image dimensions, reserve space for ads/embeds."
                : undefined,
          }
        )
      );
    }
    if (typeof performanceScore === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-perf",
          "Lighthouse Performance",
          performanceScore >= 90 ? "pass" : performanceScore >= 50 ? "warn" : "fail",
          { value: `${performanceScore} / 100` }
        )
      );
    }
    if (typeof coreWebVitals.accessibilityScore === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-a11y",
          "Lighthouse Accessibility",
          coreWebVitals.accessibilityScore >= 90
            ? "pass"
            : coreWebVitals.accessibilityScore >= 70
              ? "warn"
              : "fail",
          { value: `${coreWebVitals.accessibilityScore} / 100` }
        )
      );
    }
    if (typeof coreWebVitals.seoScore === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-seo",
          "Lighthouse SEO",
          coreWebVitals.seoScore >= 90 ? "pass" : coreWebVitals.seoScore >= 70 ? "warn" : "fail",
          { value: `${coreWebVitals.seoScore} / 100` }
        )
      );
    }
  } else {
    cwvChecks.push(
      makeCheck("cwv-unavailable", "Core Web Vitals", "info", {
        detail: coreWebVitals?.error || "PageSpeed Insights not available.",
        recommendation:
          "Set PAGESPEED_INSIGHTS_KEY to get field-data LCP/INP/CLS for this URL.",
      })
    );
  }
  if (coreWebVitalsDesktop && !coreWebVitalsDesktop.error) {
    const { lcpMs: dLcp, inpMs: dInp, cls: dCls } = coreWebVitalsDesktop;
    if (typeof dLcp === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-lcp-desktop",
          "Desktop LCP",
          dLcp <= 2500 ? "pass" : dLcp <= 4000 ? "warn" : "fail",
          { value: `${Math.round(dLcp)}ms`, detail: "Desktop strategy" }
        )
      );
    }
    if (typeof dInp === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-inp-desktop",
          "Desktop INP",
          dInp <= 200 ? "pass" : dInp <= 500 ? "warn" : "fail",
          { value: `${Math.round(dInp)}ms` }
        )
      );
    }
    if (typeof dCls === "number") {
      cwvChecks.push(
        makeCheck(
          "cwv-cls-desktop",
          "Desktop CLS",
          dCls <= 0.1 ? "pass" : dCls <= 0.25 ? "warn" : "fail",
          { value: dCls.toFixed(3) }
        )
      );
    }
  }

  const modernChecks: Check[] = [];
  modernChecks.push(
    makeCheck(
      "render-blocking-scripts",
      "No render-blocking scripts",
      renderBlockingScripts === 0 ? "pass" : renderBlockingScripts <= 2 ? "warn" : "fail",
      {
        value: `${renderBlockingScripts} blocking`,
        recommendation:
          renderBlockingScripts > 0
            ? "Add async, defer, or type=module to scripts in <head>."
            : undefined,
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "render-blocking-styles",
      "Render-blocking stylesheets",
      renderBlockingStyles <= 2 ? "pass" : renderBlockingStyles <= 4 ? "warn" : "fail",
      {
        value: `${renderBlockingStyles} stylesheets`,
        recommendation:
          renderBlockingStyles > 2
            ? "Inline critical CSS and defer the rest."
            : undefined,
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "preconnect",
      "Preconnect to critical origins",
      preconnects.length > 0 ? "pass" : "info",
      {
        value: preconnects.length > 0 ? preconnects.join(", ") : "none",
        recommendation:
          preconnects.length === 0 && thirdPartyOrigins.size > 0
            ? "Add <link rel=\"preconnect\"> for third-party origins to save handshake time."
            : undefined,
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "preload-hero",
      "Preload directives present",
      preloads.length > 0 ? "pass" : "info",
      { value: `${preloads.length} preload` }
    )
  );
  modernChecks.push(
    makeCheck(
      "fetch-priority",
      "fetchpriority used",
      hasFetchPriority ? "pass" : "info",
      {
        recommendation: hasFetchPriority
          ? undefined
          : 'Add fetchpriority="high" to your LCP hero image for faster paints.',
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "third-party-scripts",
      "Third-party script origins",
      thirdPartyOrigins.size <= 3 ? "pass" : thirdPartyOrigins.size <= 6 ? "warn" : "fail",
      {
        value: `${thirdPartyOrigins.size} origins`,
        detail: Array.from(thirdPartyOrigins).slice(0, 8).join(", "),
        recommendation:
          thirdPartyOrigins.size > 3
            ? "Each third-party origin costs handshakes + blocking time. Consolidate or self-host."
            : undefined,
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "font-preload",
      "Font files preloaded",
      fontPreloads > 0 ? "pass" : "warn",
      {
        value: `${fontPreloads} font preload(s)`,
        recommendation:
          fontPreloads === 0
            ? 'Preload custom fonts with <link rel="preload" as="font" crossorigin> to cut LCP.'
            : undefined,
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "font-display",
      "font-display: swap",
      hasFontDisplay === true ? "pass" : hasFontDisplay === false ? "warn" : "info",
      {
        recommendation:
          hasFontDisplay === false
            ? "Set font-display: swap (or optional) so text renders with a system fallback while fonts load."
            : undefined,
      }
    )
  );
  modernChecks.push(
    makeCheck(
      "inline-scripts",
      "Inline script weight",
      inlineScriptBytes < 10_000 ? "pass" : inlineScriptBytes < 50_000 ? "warn" : "fail",
      {
        value: `${Math.round(inlineScriptBytes / 1024)} KB inline`,
        recommendation:
          inlineScriptBytes >= 10_000
            ? "Large inline scripts bloat HTML and block parsing. Externalize and defer."
            : undefined,
      }
    )
  );

  const a11yChecks: Check[] = [];
  a11yChecks.push(
    makeCheck(
      "a11y-main",
      "Has <main> landmark",
      accessibility.landmarks.main && accessibility.landmarks.mainCount === 1
        ? "pass"
        : accessibility.landmarks.mainCount > 1
          ? "warn"
          : "fail",
      {
        value: `${accessibility.landmarks.mainCount} <main>`,
        recommendation:
          !accessibility.landmarks.main
            ? "Wrap primary content in <main> for screen-reader navigation."
            : accessibility.landmarks.mainCount > 1
              ? "Only one <main> per page."
              : undefined,
      }
    )
  );
  a11yChecks.push(
    makeCheck(
      "a11y-nav",
      "Has <nav> landmark",
      accessibility.landmarks.nav ? "pass" : "warn"
    )
  );
  a11yChecks.push(
    makeCheck(
      "a11y-footer",
      "Has <footer> landmark",
      accessibility.landmarks.footer ? "pass" : "warn"
    )
  );
  a11yChecks.push(
    makeCheck(
      "a11y-skip-link",
      "Skip-to-content link",
      accessibility.skipLink ? "pass" : "warn",
      {
        recommendation: !accessibility.skipLink
          ? "Add a skip link for keyboard users: <a href=\"#main\">Skip to content</a>."
          : undefined,
      }
    )
  );
  a11yChecks.push(
    makeCheck(
      "a11y-form-labels",
      "Form fields have labels",
      accessibility.formsWithoutLabels === 0 ? "pass" : "fail",
      {
        value: `${accessibility.formsWithoutLabels} unlabeled`,
        recommendation:
          accessibility.formsWithoutLabels > 0
            ? "Unlabeled inputs fail screen-readers. Use <label for> or aria-label."
            : undefined,
      }
    )
  );
  a11yChecks.push(
    makeCheck(
      "a11y-anchor-text",
      "Descriptive link text",
      accessibility.anchorsGenericText === 0
        ? "pass"
        : accessibility.anchorsGenericText <= 2
          ? "warn"
          : "fail",
      {
        value: `${accessibility.anchorsGenericText} generic`,
        recommendation:
          accessibility.anchorsGenericText > 0
            ? '"Click here" and "read more" fail screen-readers. Use descriptive link text.'
            : undefined,
      }
    )
  );
  a11yChecks.push(
    makeCheck(
      "a11y-lang-valid",
      "Valid lang attribute",
      accessibility.langValid ? "pass" : "warn",
      { value: lang }
    )
  );

  const crawlChecks: Check[] = [];
  crawlChecks.push(
    makeCheck(
      "robots-txt",
      "robots.txt accessible",
      crawlability.robotsTxtFound ? "pass" : "warn",
      {
        value: crawlability.robotsTxtStatus
          ? `HTTP ${crawlability.robotsTxtStatus}`
          : undefined,
        recommendation: !crawlability.robotsTxtFound
          ? "Add a robots.txt at root."
          : undefined,
      }
    )
  );
  crawlChecks.push(
    makeCheck(
      "robots-allows",
      "robots.txt allows crawling",
      crawlability.robotsAllowsAll === false ? "fail" : "pass",
      {
        impact: "high",
        recommendation:
          crawlability.robotsAllowsAll === false
            ? "robots.txt is blocking crawlers from the site root."
            : undefined,
      }
    )
  );
  crawlChecks.push(
    makeCheck(
      "sitemap",
      "XML sitemap found",
      crawlability.sitemapFound ? "pass" : "warn",
      {
        value: crawlability.sitemapUrl,
        detail: crawlability.sitemapUrlCount ? `${crawlability.sitemapUrlCount} URLs` : undefined,
        recommendation: !crawlability.sitemapFound
          ? "Publish sitemap.xml and reference it in robots.txt."
          : undefined,
      }
    )
  );
  crawlChecks.push(
    makeCheck(
      "robots-sitemap-link",
      "robots.txt declares sitemap",
      crawlability.robotsTxtDeclaresSitemap ? "pass" : "warn",
      {
        recommendation: !crawlability.robotsTxtDeclaresSitemap
          ? "Add `Sitemap: https://.../sitemap.xml` to robots.txt for crawler discovery."
          : undefined,
      }
    )
  );
  crawlChecks.push(
    makeCheck(
      "llms-txt",
      "llms.txt file",
      llmsTxt?.found ? "pass" : "info",
      {
        value: llmsTxt?.found
          ? `HTTP ${llmsTxt.status} · ${llmsTxt.bytes} bytes`
          : llmsTxt?.status
            ? `HTTP ${llmsTxt.status}`
            : "not found",
        recommendation: !llmsTxt?.found
          ? "Publish /llms.txt to guide LLM-powered assistants to your most important content (2025 standard)."
          : undefined,
      }
    )
  );
  crawlChecks.push(
    makeCheck(
      "hreflang",
      "hreflang annotations",
      hreflangCount > 0 ? "pass" : "info",
      {
        value: `${hreflangCount} tags`,
        recommendation:
          hreflangCount === 0
            ? "If you serve multiple languages/regions, add hreflang to tell Google which URL to serve."
            : undefined,
      }
    )
  );
  if (sitemapValidation) {
    crawlChecks.push(
      makeCheck(
        "sitemap-xmlns",
        "Sitemap declares sitemaps.org xmlns",
        sitemapValidation.parseError
          ? "warn"
          : sitemapValidation.hasXmlns
            ? "pass"
            : "fail",
        {
          value: sitemapValidation.parseError || (sitemapValidation.hasXmlns ? "present" : "missing"),
          recommendation:
            !sitemapValidation.hasXmlns && !sitemapValidation.parseError
              ? "Your <urlset> is missing xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" — crawlers may reject it."
              : undefined,
        }
      )
    );
    crawlChecks.push(
      makeCheck(
        "sitemap-size",
        "Sitemap within 50K URL / 50MB limits",
        sitemapValidation.tooManyUrls || sitemapValidation.tooLarge ? "fail" : "pass",
        {
          value: `${sitemapValidation.urlCount.toLocaleString()} URLs · ${Math.round(sitemapValidation.sizeBytes / 1024)} KB`,
          recommendation:
            sitemapValidation.tooManyUrls
              ? "Google caps single sitemaps at 50,000 URLs. Split into a sitemap index."
              : sitemapValidation.tooLarge
                ? "Google caps single sitemaps at 50 MB uncompressed. Split into a sitemap index."
                : undefined,
        }
      )
    );
    crawlChecks.push(
      makeCheck(
        "sitemap-lastmod",
        "<lastmod> uses valid ISO-8601 dates",
        sitemapValidation.invalidLastmod === 0 ? "pass" : "fail",
        {
          value: `${sitemapValidation.invalidLastmod} invalid`,
          recommendation:
            sitemapValidation.invalidLastmod > 0
              ? "Google ignores malformed <lastmod> values. Use ISO 8601 (YYYY-MM-DD or full datetime)."
              : undefined,
        }
      )
    );
  }

  const aiChecks: Check[] = [];
  const aiDirs = crawlability.aiCrawlerDirectives || {};
  for (const ua of AI_CRAWLERS) {
    const status = aiDirs[ua] ?? "not-set";
    aiChecks.push(
      makeCheck(
        `ai-${ua.toLowerCase()}`,
        ua,
        "info",
        {
          value: status,
          detail:
            status === "disallow"
              ? "Blocked — you won't appear in this AI's answers."
              : status === "allow"
                ? "Explicitly allowed."
                : "No specific directive (default allow).",
        }
      )
    );
  }

  const deprecatedChecks: Check[] = [];
  deprecatedChecks.push(
    makeCheck(
      "meta-keywords",
      "No meta keywords tag",
      metaKeywords ? "warn" : "pass",
      {
        recommendation: metaKeywords
          ? "meta keywords has been ignored by Google since 2009. Remove it."
          : undefined,
      }
    )
  );
  deprecatedChecks.push(
    makeCheck(
      "deprecated-tags",
      "No deprecated HTML tags",
      deprecatedTags.length === 0 ? "pass" : "fail",
      {
        value: deprecatedTags.length > 0 ? deprecatedTags.join(", ") : undefined,
        recommendation:
          deprecatedTags.length > 0
            ? `Replace <${deprecatedTags[0]}> with modern CSS — these tags are obsolete.`
            : undefined,
      }
    )
  );
  deprecatedChecks.push(
    makeCheck(
      "x-frame-deprecated",
      "Not relying on X-Frame-Options only",
      xFrameOptions && !csp ? "warn" : "pass",
      {
        recommendation:
          xFrameOptions && !csp
            ? "X-Frame-Options is deprecated. Migrate to CSP frame-ancestors."
            : undefined,
      }
    )
  );

  const siteChecks: Check[] = [];
  siteChecks.push(
    makeCheck(
      "site-pages-crawled",
      "Site pages audited",
      siteCrawl.audited > 0 ? "pass" : "warn",
      {
        value: `${siteCrawl.audited} of ${siteCrawl.discovered} discovered`,
        detail: siteCrawl.capped ? `Capped at ${siteCrawl.cap}.` : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-broken-pages",
      "No broken pages site-wide",
      siteCrawl.brokenPages === 0 ? "pass" : "fail",
      {
        value: `${siteCrawl.brokenPages} broken`,
        impact: "high",
        recommendation:
          siteCrawl.brokenPages > 0
            ? "Pages returning 4xx/5xx waste crawl budget and lose rankings. Fix or redirect."
            : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-duplicate-titles",
      "No duplicate titles",
      siteCrawl.duplicateTitles.length === 0 ? "pass" : "fail",
      {
        value: `${siteCrawl.duplicateTitles.length} duplicates`,
        detail: siteCrawl.duplicateTitles.slice(0, 3).join("\n"),
        recommendation:
          siteCrawl.duplicateTitles.length > 0
            ? "Duplicate titles confuse Google about which page to rank. Make each page's title unique."
            : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-duplicate-descriptions",
      "No duplicate meta descriptions",
      siteCrawl.duplicateDescriptions.length === 0 ? "pass" : "warn",
      {
        value: `${siteCrawl.duplicateDescriptions.length} duplicates`,
        detail: siteCrawl.duplicateDescriptions.slice(0, 3).join("\n"),
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-duplicate-h1s",
      "No duplicate H1 content",
      (siteCrawl.duplicateH1s?.length ?? 0) === 0 ? "pass" : "warn",
      {
        value: `${siteCrawl.duplicateH1s?.length ?? 0} duplicates`,
        detail: (siteCrawl.duplicateH1s ?? []).slice(0, 3).join("\n"),
        recommendation:
          (siteCrawl.duplicateH1s?.length ?? 0) > 0
            ? "The H1 is the clearest topical signal per page. Differentiate H1s so each page targets a distinct query."
            : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-missing-titles",
      "All pages have a title",
      siteCrawl.missingTitles === 0 ? "pass" : "fail",
      { value: `${siteCrawl.missingTitles} missing` }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-missing-descriptions",
      "All pages have a description",
      siteCrawl.missingDescriptions === 0 ? "pass" : "warn",
      { value: `${siteCrawl.missingDescriptions} missing` }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-orphan-pages",
      "No orphan pages",
      siteCrawl.orphanPages.length === 0 ? "pass" : "warn",
      {
        value: `${siteCrawl.orphanPages.length} orphan(s)`,
        detail: siteCrawl.orphanPages.slice(0, 5).join("\n"),
        recommendation:
          siteCrawl.orphanPages.length > 0
            ? "Orphan pages (no inbound internal links) rank worse and get crawled less often. Link to them from the site."
            : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck("site-noindex-count", "Noindex pages", "info", {
      value: `${siteCrawl.noindexPages} noindex`,
      detail:
        siteCrawl.noindexPages > 0
          ? "Confirm these should be excluded from Google."
          : undefined,
    })
  );
  siteChecks.push(
    makeCheck(
      "site-canonical-issues",
      "No canonical loops or chains",
      !siteCrawl.canonicalIssues || siteCrawl.canonicalIssues.length === 0
        ? "pass"
        : "fail",
      {
        value: `${siteCrawl.canonicalIssues?.length || 0} issue(s)`,
        detail: siteCrawl.canonicalIssues
          ?.slice(0, 5)
          .map((i) => `${i.page} → ${i.canonical} (${i.reason})`)
          .join("\n"),
        impact: "high",
        recommendation:
          siteCrawl.canonicalIssues && siteCrawl.canonicalIssues.length > 0
            ? "Canonical loops or long chains cause Google to pick its own canonical. Point each page's canonical directly at the intended URL."
            : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-hreflang-reciprocity",
      "hreflang reciprocity + self-ref",
      !siteCrawl.hreflangIssues || siteCrawl.hreflangIssues.length === 0
        ? "pass"
        : "warn",
      {
        value: `${siteCrawl.hreflangIssues?.length || 0} issue(s)`,
        detail: siteCrawl.hreflangIssues?.slice(0, 6).join("\n"),
        recommendation:
          siteCrawl.hreflangIssues && siteCrawl.hreflangIssues.length > 0
            ? "hreflang only works when every alternate URL links back with the inverse hreflang + a self-reference and an x-default."
            : undefined,
      }
    )
  );
  siteChecks.push(
    makeCheck(
      "site-near-duplicates",
      "No near-duplicate pages",
      !siteCrawl.nearDuplicates || siteCrawl.nearDuplicates.length === 0
        ? "pass"
        : "warn",
      {
        value: `${siteCrawl.nearDuplicates?.length || 0} pair(s) ≥80% similar`,
        detail: siteCrawl.nearDuplicates
          ?.slice(0, 5)
          .map((d) => `${d.pages.join(" ↔ ")} (${Math.round(d.similarity * 100)}%)`)
          .join("\n"),
        recommendation:
          siteCrawl.nearDuplicates && siteCrawl.nearDuplicates.length > 0
            ? "Near-duplicate content cannibalizes rankings. Consolidate, canonicalize, or differentiate."
            : undefined,
      }
    )
  );

  const renderedChecks: Check[] = [];
  if (headless?.attempted && headless.available && !headless.error) {
    if (typeof headless.renderedWordCount === "number") {
      renderedChecks.push(
        makeCheck(
          "rendered-word-count",
          "Rendered content (JS-executed)",
          headless.renderedWordCount >= 400
            ? "pass"
            : headless.renderedWordCount >= 200
              ? "warn"
              : "fail",
          {
            value: `${headless.renderedWordCount.toLocaleString()} words after JS`,
            recommendation:
              headless.renderedWordCount < wordCount * 0.8
                ? "Client-side rendering hides content from crawlers until JS runs. Server-render key copy."
                : undefined,
          }
        )
      );
    }
    const mu = headless.mobileUsability;
    if (mu) {
      renderedChecks.push(
        makeCheck(
          "mobile-tap-targets",
          "Tap targets ≥44×44px",
          mu.tapTargetsTooSmall === 0 ? "pass" : mu.tapTargetsTooSmall <= 5 ? "warn" : "fail",
          {
            value: `${mu.tapTargetsTooSmall} small`,
            detail: mu.smallTargetSamples.join("\n"),
            recommendation:
              mu.tapTargetsTooSmall > 0
                ? "Google requires ≥48×48 CSS px tap targets. Enlarge padded click areas."
                : undefined,
          }
        )
      );
      renderedChecks.push(
        makeCheck(
          "mobile-font-size",
          "Body text ≥12px",
          mu.fontTooSmall === 0 ? "pass" : mu.fontTooSmall <= 10 ? "warn" : "fail",
          {
            value: `${mu.fontTooSmall} tiny elements`,
            recommendation:
              mu.fontTooSmall > 0
                ? "Mobile usability flags <12px body text. Scale up small copy."
                : undefined,
          }
        )
      );
      renderedChecks.push(
        makeCheck(
          "mobile-horizontal-scroll",
          "No horizontal scroll on mobile",
          mu.horizontalScroll ? "fail" : "pass",
          {
            impact: "high",
            recommendation: mu.horizontalScroll
              ? "The page scrolls sideways at mobile widths — fix overflowing elements."
              : undefined,
          }
        )
      );
    }
    const axe = headless.axeViolations || [];
    const critical = axe.filter((v) => v.impact === "critical" || v.impact === "serious");
    renderedChecks.push(
      makeCheck(
        "axe-violations",
        "axe-core WCAG audit",
        axe.length === 0 ? "pass" : critical.length === 0 ? "warn" : "fail",
        {
          value: `${axe.length} violations (${critical.length} serious)`,
          detail: axe.slice(0, 5).map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes}×)`).join("\n"),
          recommendation:
            critical.length > 0
              ? "Serious axe violations typically mean real screen-reader failures. Fix the worst first."
              : axe.length > 0
                ? "Minor axe violations — worth addressing for WCAG AA compliance."
                : undefined,
        }
      )
    );
  } else if (headless?.attempted) {
    renderedChecks.push(
      makeCheck("headless-unavailable", "Headless rendering", "info", {
        value: headless.error || "browser launch unavailable",
        recommendation:
          "Install a Chromium binary and run with SEO_AUDIT_HEADLESS=1 to unlock rendered-content / axe-core / mobile-usability checks.",
      })
    );
  }

  const categories: CheckCategory[] = [
    buildCategory(
      "site-wide",
      "Site-Wide Audit",
      `Crawled ${siteCrawl.audited} pages via ${siteCrawl.source}. Duplicate titles, broken pages, missing metadata.`,
      siteChecks
    ),
    buildCategory("meta", "Meta & Tags", "The foundational tags Google and social platforms read first.", metaChecks),
    buildCategory("content", "Content & Structure", "Headings, word count, and page scannability.", contentChecks),
    buildCategory("social", "Open Graph & Social", "How this page renders when shared.", socialChecks),
    buildCategory("schema", "Structured Data", "JSON-LD that powers rich results.", schemaChecks),
    buildCategory("links", "Links", "Internal linking, broken links, and link hygiene.", linkChecks),
    buildCategory("images", "Images", "Alt text, dimensions, modern formats, lazy loading.", imageChecks),
    buildCategory("security", "Security Headers", "HTTPS and response headers that harden your site.", securityChecks),
    buildCategory("performance", "Performance", "Server response, compression, page weight.", perfChecks),
    buildCategory("core-web-vitals", "Core Web Vitals", "Real-user LCP, INP, CLS via PageSpeed Insights.", cwvChecks),
    buildCategory("modern-web", "Modern Web Practices", "Render-blocking, preconnect, fetchpriority, third-party scripts.", modernChecks),
    buildCategory("accessibility", "Accessibility", "Landmarks, labels, descriptive links — WCAG basics.", a11yChecks),
    buildCategory("crawlability", "Crawlability", "robots.txt, sitemap, hreflang — what search engines see.", crawlChecks),
    buildCategory("ai-crawlers", "AI Crawler Access", "Whether LLMs like GPTBot and ClaudeBot can read this page.", aiChecks),
    ...(renderedChecks.length
      ? [
          buildCategory(
            "rendered",
            "Rendered Page (Headless)",
            "Real rendered DOM, axe-core violations, mobile usability — only populated when a Chromium binary is available.",
            renderedChecks
          ),
        ]
      : []),
    buildCategory("deprecated", "Deprecated Practices", "Legacy tags and patterns to remove.", deprecatedChecks),
  ];

  const overallScoreRaw = categories.reduce((s, c) => s + c.score, 0);
  const maxScore = categories.reduce((s, c) => s + c.maxScore, 0);
  const overallScore = maxScore ? Math.round((overallScoreRaw / maxScore) * 100) : 0;

  return {
    url,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    timings: {
      responseMs,
      totalMs: Math.round(performance.now() - overallStart),
    },
    response: {
      status: response.status,
      statusText: response.statusText,
      redirects,
      redirectChainLength: redirectTrace.chain.length,
      headers,
      sizeBytes: bytes,
      encoding: compression || undefined,
      http2,
    },
    tls: tlsInfo,
    llmsTxt,
    ogImageMeta,
    coreWebVitalsDesktop,
    schemaValidation,
    schemaOpportunities,
    subresourceIntegrity,
    dns: dnsInfo,
    sitemapValidation,
    headless,
    richResultsEligibility,
    meta: {
      title,
      description,
      canonical,
      robots,
      viewport,
      lang,
      charset,
      favicon,
      author,
      themeColor,
    },
    headings,
    content: { wordCount, textToHtmlRatio, readability },
    openGraph,
    twitter,
    schema,
    links: {
      total: allLinks.length,
      internal: internalLinks.length,
      external: externalLinks.length,
      nofollow,
      brokenSampled,
      sampleChecked: Math.min(LINK_SAMPLE_SIZE, allLinks.length),
    },
    images: {
      total: images.length,
      missingAlt: missingAltSrcs.length,
      missingAltSamples: missingAltSrcs.slice(0, 10),
      oversized: oversizedImages,
      altQuality: {
        generic: altGeneric,
        tooLong: altTooLong,
        filenameLike: altFilenameLike,
        samples: altQualitySamples,
      },
    },
    security: {
      https,
      hsts,
      csp,
      xFrameOptions,
      xContentTypeOptions,
      referrerPolicy,
      permissionsPolicy,
    },
    crawlability: crawlabilityFull,
    coreWebVitals,
    modernWeb: {
      httpVersionHint,
      hasAltSvc,
      preconnects,
      preloads,
      lazyImages,
      eagerImages,
      imagesWithDimensions,
      modernFormatImages,
      renderBlockingScripts,
      renderBlockingStyles,
      thirdPartyScriptOrigins: Array.from(thirdPartyOrigins),
      inlineScriptBytes,
      mixedContent,
      hasFontDisplay,
      hasFetchPriority,
      hasPictureElement,
      fontPreloads,
    },
    accessibility,
    deprecated: {
      metaKeywords,
      xFrameOptionsOnly: xFrameOptions && !csp,
      deprecatedSchemaTypes: Array.from(deprecatedSchemaTypes),
      deprecatedTags,
    },
    categories,
    overallScore,
    maxScore,
    grade: overallGrade(maxScore ? overallScoreRaw / maxScore : 0),
    siteCrawl,
  };
}
