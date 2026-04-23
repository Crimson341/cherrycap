import { describe, expect, it } from "vitest";
import {
  AUDIT_RATE_LIMITS,
  hashAuditIdentifier,
  normalizeAuditUrl,
  sanitizeAuditResult,
  summarizeAuditResult,
} from "./seoAuditSecurity";
import type { AuditResult } from "./seoAuditTypes";

function makeResult(): AuditResult {
  return {
    url: "https://example.com",
    finalUrl: "https://example.com/",
    fetchedAt: "2026-04-23T00:00:00.000Z",
    timings: { responseMs: 123, totalMs: 456 },
    response: {
      status: 200,
      statusText: "OK",
      redirects: [],
      redirectChainLength: 0,
      headers: { server: "test" },
      sizeBytes: 2048,
    },
    meta: { title: "Example", description: "Description" },
    headings: { h1: ["Example"], h2: [], h3: [], h4: [], h5: [], h6: [] },
    content: { wordCount: 250, textToHtmlRatio: 12 },
    openGraph: {},
    twitter: {},
    schema: [{ type: "LocalBusiness", raw: { large: "x".repeat(20_000) } }],
    links: { total: 1, internal: 1, external: 0, nofollow: 0, brokenSampled: [], sampleChecked: 0 },
    images: { total: 0, missingAlt: 0, missingAltSamples: [], oversized: [] },
    security: {
      https: true,
      hsts: true,
      csp: true,
      xFrameOptions: false,
      xContentTypeOptions: true,
      referrerPolicy: true,
      permissionsPolicy: true,
    },
    crawlability: { robotsTxtFound: true, sitemapFound: true },
    modernWeb: {
      hasAltSvc: false,
      preconnects: [],
      preloads: [],
      lazyImages: 0,
      eagerImages: 0,
      imagesWithDimensions: 0,
      modernFormatImages: 0,
      renderBlockingScripts: 0,
      renderBlockingStyles: 0,
      thirdPartyScriptOrigins: [],
      inlineScriptBytes: 0,
      mixedContent: 0,
      hasFetchPriority: false,
      hasPictureElement: false,
      fontPreloads: 0,
    },
    accessibility: {
      landmarks: {
        header: true,
        nav: true,
        main: true,
        mainCount: 1,
        footer: true,
        article: false,
        section: true,
      },
      skipLink: false,
      formsWithoutLabels: 0,
      anchorsGenericText: 0,
      langValid: true,
    },
    deprecated: {
      metaKeywords: false,
      xFrameOptionsOnly: false,
      deprecatedSchemaTypes: [],
      deprecatedTags: [],
    },
    categories: [
      {
        id: "meta",
        title: "Meta",
        description: "Meta checks",
        score: 7,
        maxScore: 10,
        checks: [
          {
            id: "title",
            label: "Title",
            status: "fail",
            impact: "high",
            recommendation: "Add a stronger title.",
          },
        ],
      },
    ],
    overallScore: 70,
    maxScore: 100,
    grade: "C",
  };
}

describe("seo audit security helpers", () => {
  it("normalizes public URLs and rejects private ports before auditing", () => {
    expect(normalizeAuditUrl("example.com/path")).toBe("https://example.com/path");
    expect(() => normalizeAuditUrl("https://example.com:3000")).toThrow(/Only ports 80 and 443/);
    expect(() => normalizeAuditUrl("ftp://example.com")).toThrow(/Only http and https/);
  });

  it("hashes identifiers with a salt without exposing the raw value", () => {
    const hash = hashAuditIdentifier("203.0.113.10", "secret");
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("203.0.113.10");
    expect(hashAuditIdentifier("203.0.113.10", "secret")).toBe(hash);
  });

  it("defines production rate limit windows", () => {
    expect(AUDIT_RATE_LIMITS.session).toMatchObject({ limit: 5, windowMs: 60 * 60 * 1000 });
    expect(AUDIT_RATE_LIMITS.ip).toMatchObject({ limit: 20, windowMs: 24 * 60 * 60 * 1000 });
    expect(AUDIT_RATE_LIMITS.domain).toMatchObject({ limit: 3, windowMs: 60 * 60 * 1000 });
  });

  it("summarizes and sanitizes full audit results before persistence", () => {
    const result = makeResult();
    const summary = summarizeAuditResult(result, 1234);
    const sanitized = sanitizeAuditResult(result);

    expect(summary).toMatchObject({
      finalUrl: "https://example.com/",
      grade: "C",
      overallScore: 70,
      maxScore: 100,
      percentage: 70,
      durationMs: 1234,
    });
    expect(summary.priorityFixes).toEqual(["Title"]);
    expect(JSON.stringify(sanitized)).not.toContain("x".repeat(20_000));
  });

  it("caps stored percentages at 100", () => {
    const result = makeResult();
    result.overallScore = 120;
    result.maxScore = 100;

    expect(summarizeAuditResult(result).percentage).toBe(100);
  });
});
