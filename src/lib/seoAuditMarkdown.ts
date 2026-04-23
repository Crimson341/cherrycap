import type { AuditResult, Check, CheckCategory } from "./seoAuditTypes";

const STATUS_LABEL: Record<Check["status"], string> = {
  pass: "✅ Pass",
  warn: "⚠️ Warning",
  fail: "❌ Fail",
  info: "ℹ️ Info",
};

function fmtCheck(check: Check): string {
  const lines: string[] = [];
  const impact = check.impact ? ` _(impact: ${check.impact})_` : "";
  lines.push(`- **${check.label}** — ${STATUS_LABEL[check.status]}${impact}`);
  if (check.value) lines.push(`  - Value: \`${check.value}\``);
  if (check.detail) {
    const detailLines = check.detail.split("\n").slice(0, 6);
    for (const d of detailLines) lines.push(`  - ${d}`);
  }
  if (check.recommendation) lines.push(`  - **Fix:** ${check.recommendation}`);
  return lines.join("\n");
}

function fmtCategory(category: CheckCategory): string {
  const lines: string[] = [];
  lines.push(`### ${category.title}`);
  lines.push(
    `_${category.description}_  — **Score: ${category.score.toFixed(1)} / ${category.maxScore}**`
  );
  lines.push("");
  for (const check of category.checks) lines.push(fmtCheck(check));
  lines.push("");
  return lines.join("\n");
}

function priorityFixes(result: AuditResult): Check[] {
  const all = result.categories.flatMap((c) =>
    c.checks.map((check) => ({ check, category: c.title }))
  );
  const failed = all.filter((x) => x.check.status === "fail");
  const warned = all.filter((x) => x.check.status === "warn");
  const score = (c: Check) => (c.impact === "high" ? 3 : c.impact === "medium" ? 2 : 1);
  return [...failed, ...warned]
    .sort((a, b) => score(b.check) - score(a.check))
    .map((x) => x.check);
}

export function buildAuditMarkdown(result: AuditResult): string {
  const lines: string[] = [];
  const pct = result.maxScore
    ? Math.round((result.overallScore / result.maxScore) * 100)
    : 0;

  lines.push(`# SEO Audit Report`);
  lines.push("");
  lines.push(`**URL:** ${result.finalUrl}`);
  lines.push(`**Audited:** ${new Date(result.fetchedAt).toLocaleString()}`);
  lines.push(
    `**Grade:** ${result.grade} · **Score:** ${pct}/100 (${result.overallScore.toFixed(1)} / ${result.maxScore})`
  );
  lines.push("");

  // Quick stats
  const passed = result.categories.reduce(
    (sum, c) => sum + c.checks.filter((ch) => ch.status === "pass").length,
    0
  );
  const warned = result.categories.reduce(
    (sum, c) => sum + c.checks.filter((ch) => ch.status === "warn").length,
    0
  );
  const failed = result.categories.reduce(
    (sum, c) => sum + c.checks.filter((ch) => ch.status === "fail").length,
    0
  );

  lines.push(`| Passing | Warnings | Failures |`);
  lines.push(`| --- | --- | --- |`);
  lines.push(`| ${passed} | ${warned} | ${failed} |`);
  lines.push("");

  // Priority fix list
  const priority = priorityFixes(result);
  if (priority.length > 0) {
    lines.push(`## Priority Fix List`);
    lines.push("");
    lines.push(`The issues below are ordered by impact. Start at the top.`);
    lines.push("");
    priority.forEach((check, idx) => {
      const impactTag = check.impact ? ` [${check.impact.toUpperCase()}]` : "";
      lines.push(
        `${idx + 1}. **${check.label}**${impactTag} — ${STATUS_LABEL[check.status]}`
      );
      if (check.value) lines.push(`   - Current: \`${check.value}\``);
      if (check.recommendation) lines.push(`   - Fix: ${check.recommendation}`);
    });
    lines.push("");
  }

  // Core Web Vitals
  if (result.coreWebVitals && !result.coreWebVitals.error) {
    const cwv = result.coreWebVitals;
    lines.push(`## Core Web Vitals (${cwv.strategy})`);
    lines.push("");
    lines.push(`| Metric | Value | Target |`);
    lines.push(`| --- | --- | --- |`);
    if (typeof cwv.lcpMs === "number")
      lines.push(`| LCP | ${Math.round(cwv.lcpMs)}ms | ≤ 2500ms |`);
    if (typeof cwv.inpMs === "number")
      lines.push(`| INP | ${Math.round(cwv.inpMs)}ms | ≤ 200ms |`);
    if (typeof cwv.cls === "number")
      lines.push(`| CLS | ${cwv.cls.toFixed(3)} | ≤ 0.1 |`);
    if (typeof cwv.ttfbMs === "number")
      lines.push(`| TTFB | ${Math.round(cwv.ttfbMs)}ms | ≤ 600ms |`);
    if (typeof cwv.performanceScore === "number")
      lines.push(`| Performance | ${cwv.performanceScore}/100 | ≥ 90 |`);
    if (typeof cwv.accessibilityScore === "number")
      lines.push(`| Accessibility | ${cwv.accessibilityScore}/100 | ≥ 90 |`);
    if (typeof cwv.seoScore === "number")
      lines.push(`| SEO | ${cwv.seoScore}/100 | ≥ 90 |`);
    lines.push("");
  }

  // Site-wide crawl
  if (result.siteCrawl) {
    const sc = result.siteCrawl;
    lines.push(`## Site-Wide Crawl`);
    lines.push("");
    lines.push(
      `Discovered **${sc.discovered}** pages via ${sc.source}, audited **${sc.audited}**${sc.capped ? ` (capped at ${sc.cap})` : ""}.`
    );
    lines.push("");
    lines.push(`- Broken pages: **${sc.brokenPages}**`);
    lines.push(`- Duplicate titles: **${sc.duplicateTitles.length}**`);
    lines.push(`- Duplicate descriptions: **${sc.duplicateDescriptions.length}**`);
    lines.push(`- Missing titles: **${sc.missingTitles}**`);
    lines.push(`- Missing descriptions: **${sc.missingDescriptions}**`);
    lines.push(`- Noindex pages: **${sc.noindexPages}**`);
    lines.push(`- Total issues across site: **${sc.totalIssues}**`);
    lines.push("");

    if (sc.duplicateTitles.length > 0) {
      lines.push(`### Duplicate titles`);
      for (const t of sc.duplicateTitles.slice(0, 20)) lines.push(`- \`${t}\``);
      lines.push("");
    }
    if (sc.duplicateDescriptions.length > 0) {
      lines.push(`### Duplicate descriptions`);
      for (const d of sc.duplicateDescriptions.slice(0, 20))
        lines.push(`- \`${d}\``);
      lines.push("");
    }

    const pagesWithIssues = sc.pages.filter((p) => p.issues.length > 0);
    if (pagesWithIssues.length > 0) {
      lines.push(`### Per-page issues`);
      lines.push("");
      for (const p of pagesWithIssues) {
        lines.push(`#### ${p.status || "ERR"} — ${p.url}`);
        if (p.title) lines.push(`- Title: ${p.title}`);
        if (p.description) lines.push(`- Description: ${p.description}`);
        lines.push(`- Words: ${p.wordCount} · H1s: ${p.h1Count} · Images: ${p.imagesTotal} (${p.imagesMissingAlt} missing alt)`);
        lines.push(`- Issues:`);
        for (const issue of p.issues) lines.push(`  - ${issue}`);
        lines.push("");
      }
    }
  }

  // Full per-category breakdown
  lines.push(`## All Checks by Category`);
  lines.push("");
  for (const category of result.categories) lines.push(fmtCategory(category));

  // Metadata snapshot
  lines.push(`## Page Metadata`);
  lines.push("");
  lines.push(`- **Title:** ${result.meta.title ?? "_(missing)_"}`);
  lines.push(`- **Description:** ${result.meta.description ?? "_(missing)_"}`);
  lines.push(`- **Canonical:** ${result.meta.canonical ?? "_(missing)_"}`);
  lines.push(`- **Robots:** ${result.meta.robots ?? "_(not set)_"}`);
  lines.push(`- **Viewport:** ${result.meta.viewport ?? "_(missing)_"}`);
  lines.push(`- **Lang:** ${result.meta.lang ?? "_(missing)_"}`);
  lines.push("");

  lines.push(`---`);
  lines.push(`_Generated by Cherry Capital SEO Checker_`);
  return lines.join("\n");
}

export function slugifyForFilename(url: string): string {
  try {
    const u = new URL(url);
    return (u.host + u.pathname)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  } catch {
    return "seo-audit";
  }
}
