"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleDashed,
  Download,
  Globe,
  Info,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import BlogPageShell from "./BlogPageShell";
import SectionSeparator from "./ui/SectionSeperator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { buildAuditMarkdown, slugifyForFilename } from "@/lib/seoAuditMarkdown";
import type {
  AuditResult,
  Check,
  CheckCategory,
  CheckStatus,
  CrawledPage,
} from "@/lib/seoAuditTypes";

const AUDIT_SESSION_KEY = "ccw.analytics.session";
const ACTIVE_AUDIT_JOB_KEY = "ccw.seoAudit.activeJob";

type AuditJobStatus =
  | "queued"
  | "running"
  | "complete"
  | "failed"
  | "rate_limited";

type AuditJobStage =
  | "queued"
  | "fetching"
  | "crawling"
  | "scoring"
  | "complete"
  | "failed";

type AuditJobResponse = {
  jobId: string;
  status: AuditJobStatus;
  stage: AuditJobStage;
  errorMessage?: string | null;
  retryAfterSeconds?: number;
  cached?: boolean;
  result?: AuditResult | null;
};

async function readApiJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {
      error: response.ok
        ? "Unexpected response from the SEO checker."
        : `SEO checker returned HTTP ${response.status}.`,
      detail: text.slice(0, 500),
    };
  }
}

function getAuditSessionId() {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.sessionStorage.getItem(AUDIT_SESSION_KEY);
    if (existing) return existing;
    const generated =
      window.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem(AUDIT_SESSION_KEY, generated);
    return generated;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function storeActiveJob(jobId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (jobId) window.sessionStorage.setItem(ACTIVE_AUDIT_JOB_KEY, jobId);
    else window.sessionStorage.removeItem(ACTIVE_AUDIT_JOB_KEY);
  } catch {
    // sessionStorage is best effort only.
  }
}

function readActiveJob() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ACTIVE_AUDIT_JOB_KEY);
  } catch {
    return null;
  }
}

function isJobWorking(job: AuditJobResponse | null) {
  return job?.status === "queued" || job?.status === "running";
}

const statusMeta: Record<
  CheckStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  pass: {
    label: "Pass",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  warn: {
    label: "Warning",
    icon: CircleAlert,
    className: "text-amber-600 dark:text-amber-400",
  },
  fail: {
    label: "Fail",
    icon: XCircle,
    className: "text-destructive",
  },
  info: {
    label: "Info",
    icon: Info,
    className: "text-muted-foreground",
  },
};

function StatusBadge({ status }: { status: CheckStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]",
        meta.className
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}

function CategoryScoreDot({
  score,
  maxScore,
}: {
  score: number;
  maxScore: number;
}) {
  if (maxScore === 0) return null;
  const pct = score / maxScore;
  const color =
    pct >= 0.9
      ? "bg-emerald-500"
      : pct >= 0.7
        ? "bg-amber-500"
        : "bg-destructive";
  return <span className={cn("inline-block size-2 rounded-full", color)} />;
}

function SiteCrawlPanel({
  crawl,
}: {
  crawl: NonNullable<AuditResult["siteCrawl"]>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? crawl.pages : crawl.pages.slice(0, 10);
  const pagesWithIssues = crawl.pages.filter((p) => p.issues.length > 0).length;
  return (
    <section className="relative border-x bg-card/70 full-line-bottom">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
              Site-wide crawl
            </p>
            <h3 className="text-lg font-semibold tracking-tight">
              {crawl.audited} pages audited
              {crawl.capped ? ` (capped at ${crawl.cap})` : ""}
            </h3>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              Discovered via {crawl.source}. {crawl.totalIssues} total issues across{" "}
              {pagesWithIssues} pages.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.22em]">
            {crawl.brokenPages} broken · {crawl.duplicateTitles.length} dup titles
          </Badge>
        </div>
      </div>
      <ul>
        {visible.map((p) => (
          <li
            key={p.url}
            className="relative full-line-bottom last:after:hidden p-4"
          >
            <PageRow page={p} />
          </li>
        ))}
      </ul>
      {crawl.pages.length > 10 ? (
        <div className="border-t border-border p-3 text-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
          >
            {expanded
              ? "Show fewer"
              : `Show all ${crawl.pages.length} pages`}
            <ChevronDown
              className={cn(
                "size-3 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function PageRow({ page }: { page: CrawledPage }) {
  const statusColor =
    page.status === 0 || page.status >= 500
      ? "text-destructive"
      : page.status >= 400
        ? "text-destructive"
        : page.status >= 300
          ? "text-amber-600 dark:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400";
  const hasIssues = page.issues.length > 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.2em]", statusColor)}>
          {page.status || "ERR"}
        </span>
        <a
          href={page.url}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sm font-medium hover:underline"
        >
          {page.url}
        </a>
        {page.fetchedMs !== undefined ? (
          <span className="font-mono text-[10px] text-muted-foreground">
            {page.fetchedMs}ms
          </span>
        ) : null}
        {page.noindex ? (
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            noindex
          </Badge>
        ) : null}
      </div>
      {page.title ? (
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Title:</span>{" "}
          {page.title}
        </p>
      ) : null}
      {hasIssues ? (
        <ul className="flex flex-wrap gap-1.5">
          {page.issues.map((issue) => (
            <li
              key={issue}
              className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400"
            >
              {issue}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          No issues
        </p>
      )}
    </div>
  );
}

function CategoryBlock({ category }: { category: CheckCategory }) {
  return (
    <section className="relative border-x bg-card/70 full-line-bottom">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-3">
          <CategoryScoreDot
            score={category.score}
            maxScore={category.maxScore}
          />
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {category.title}
            </h3>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {category.score.toFixed(1)} / {category.maxScore}
        </span>
      </div>
      <ul>
        {category.checks.map((check) => (
          <li
            key={check.id}
            className="relative full-line-bottom last:after:hidden p-4"
          >
            <CheckRow check={check} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CheckRow({ check }: { check: Check }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={check.status} />
        <span className="font-medium">{check.label}</span>
        {check.impact === "high" && (
          <Badge
            variant="secondary"
            className="rounded-full font-mono text-[10px] uppercase tracking-[0.22em]"
          >
            High impact
          </Badge>
        )}
      </div>
      {check.value && (
        <div className="break-all font-mono text-xs text-muted-foreground">
          {check.value}
        </div>
      )}
      {check.detail && (
        <pre className="whitespace-pre-wrap break-all rounded-md border border-border/70 bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
          {check.detail}
        </pre>
      )}
      {check.recommendation && (
        <p className="font-mono text-xs leading-relaxed tracking-wide text-foreground/80">
          <span className="mr-1 text-primary">›</span>
          {check.recommendation}
        </p>
      )}
    </div>
  );
}

function Summary({ result }: { result: AuditResult }) {
  const pct = result.maxScore
    ? Math.round((result.overallScore / result.maxScore) * 100)
    : 0;
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

  const gradeColor =
    pct >= 90
      ? "text-emerald-500"
      : pct >= 70
        ? "text-amber-500"
        : "text-destructive";

  const handleExport = () => {
    const md = buildAuditMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-audit-${slugifyForFilename(result.finalUrl)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative border-x bg-card/70 px-4 py-8 full-line-bottom">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Full report · {result.categories.length} categories
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          className="rounded-md font-mono text-[10px] uppercase tracking-[0.22em]"
        >
          <Download className="mr-1 size-3" />
          Export fix list (.md)
        </Button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Audit summary
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className={cn("text-7xl font-semibold tracking-tight", gradeColor)}>
              {result.grade}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              {pct}/100 · {result.overallScore.toFixed(1)} / {result.maxScore} points
            </span>
          </div>
          <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
            <Globe className="mr-1 inline size-3" />
            {result.finalUrl}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs uppercase tracking-[0.2em]">
          <div className="rounded-md border border-border/70 bg-background/60 px-3 py-2">
            <div className="text-emerald-500 text-lg font-semibold">
              {passed}
            </div>
            <div className="text-muted-foreground">Pass</div>
          </div>
          <div className="rounded-md border border-border/70 bg-background/60 px-3 py-2">
            <div className="text-amber-500 text-lg font-semibold">{warned}</div>
            <div className="text-muted-foreground">Warn</div>
          </div>
          <div className="rounded-md border border-border/70 bg-background/60 px-3 py-2">
            <div className="text-destructive text-lg font-semibold">{failed}</div>
            <div className="text-muted-foreground">Fail</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="HTTP" value={`${result.response.status}`} />
        <Metric label="TTFB" value={`${result.timings.responseMs}ms`} />
        <Metric
          label="HTML size"
          value={`${Math.max(1, Math.round(result.response.sizeBytes / 1024))} KB`}
        />
        <Metric
          label="Compression"
          value={result.response.encoding || "none"}
        />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/60 px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function AuditProgress({ job }: { job: AuditJobResponse | null }) {
  const activeStage = job?.stage ?? "queued";
  const steps: { id: AuditJobStage; label: string }[] = [
    { id: "queued", label: "Queued" },
    { id: "fetching", label: "Fetching" },
    { id: "crawling", label: "Crawling" },
    { id: "scoring", label: "Scoring" },
    { id: "complete", label: "Complete" },
  ];
  const activeIndex =
    activeStage === "failed"
      ? -1
      : Math.max(0, steps.findIndex((step) => step.id === activeStage));

  return (
    <section className="border border-border/80 bg-card/80 p-4">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          Audit progress
        </p>
        {job?.cached ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Cached result
          </span>
        ) : null}
      </div>
      <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {steps.map((step, index) => {
          const complete = activeIndex >= index || job?.status === "complete";
          const current = activeStage === step.id;
          return (
            <li
              key={step.id}
              className={cn(
                "min-h-14 rounded-md border px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                complete
                  ? "border-primary/55 bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/50 text-muted-foreground",
                current && "shadow-[inset_0_-2px_0_var(--primary)]",
              )}
            >
              <span className="block text-lg leading-none">
                {complete ? "•" : "·"}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
      {job?.status === "failed" || job?.status === "rate_limited" ? (
        <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs text-destructive">
          {job.errorMessage ?? "The audit could not be completed."}
        </p>
      ) : null}
    </section>
  );
}

function PriorityFixes({ result }: { result: AuditResult }) {
  const fixes: (Check & { category: string })[] = [];
  for (const cat of result.categories) {
    for (const check of cat.checks) {
      if (check.status === "fail" || (check.status === "warn" && check.impact === "high")) {
        fixes.push({ ...check, category: cat.title });
      }
    }
  }
  const top = fixes
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "fail" ? -1 : 1;
      if (a.impact === "high" && b.impact !== "high") return -1;
      if (b.impact === "high" && a.impact !== "high") return 1;
      return 0;
    })
    .slice(0, 6);

  if (top.length === 0) {
    return (
      <section className="relative border-x bg-card/70 px-4 py-6 full-line-bottom">
        <h2 className="text-xl font-semibold tracking-tight">
          <ShieldCheck className="mr-2 inline size-5 text-emerald-500" />
          No critical issues
        </h2>
        <p className="mt-2 font-mono text-sm tracking-wide text-muted-foreground">
          Everything is looking healthy. Scroll down for the full breakdown.
        </p>
      </section>
    );
  }

  return (
    <section className="relative border-x bg-card/70 full-line-bottom">
      <h2 className="relative border-b border-border py-3 pl-4 text-2xl font-semibold tracking-tight">
        Priority fixes
      </h2>
      <ul>
        {top.map((fix) => (
          <li
            key={`${fix.category}-${fix.id}`}
            className="relative full-line-bottom last:after:hidden p-4"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={fix.status} />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {fix.category}
              </span>
            </div>
            <p className="font-semibold">{fix.label}</p>
            {fix.recommendation && (
              <p className="mt-1 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
                {fix.recommendation}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MetaInspector({ result }: { result: AuditResult }) {
  const items: { label: string; value?: string }[] = [
    { label: "Title", value: result.meta.title },
    { label: "Description", value: result.meta.description },
    { label: "Canonical", value: result.meta.canonical },
    { label: "Robots", value: result.meta.robots },
    { label: "Viewport", value: result.meta.viewport },
    { label: "Lang", value: result.meta.lang },
    { label: "Theme color", value: result.meta.themeColor },
    { label: "Favicon", value: result.meta.favicon },
  ];

  return (
    <section className="relative border-x bg-card/70 full-line-bottom">
      <h2 className="relative border-b border-border py-3 pl-4 text-2xl font-semibold tracking-tight">
        Meta inspector
      </h2>
      <dl className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-card p-4"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 break-words font-mono text-xs">
              {item.value || (
                <span className="text-muted-foreground">— not set —</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function SeoCheckerClient() {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [job, setJob] = useState<AuditJobResponse | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const loading = submitting || isJobWorking(job);

  const loadJob = useCallback(async (jobId: string) => {
    const res = await fetch(`/api/seo-audit/jobs/${encodeURIComponent(jobId)}`, {
      cache: "no-store",
    });
    const data = await readApiJson(res);
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Could not load audit job.");
    }
    const nextJob = data as AuditJobResponse;
    setJob(nextJob);
    if (nextJob.status === "complete" && nextJob.result) {
      setResult(nextJob.result);
      storeActiveJob(null);
    }
    if (nextJob.status === "failed" || nextJob.status === "rate_limited") {
      setError(nextJob.errorMessage || "Audit failed.");
      storeActiveJob(null);
    }
  }, []);

  useEffect(() => {
    const activeJob = readActiveJob();
    if (!activeJob) return;
    void loadJob(activeJob).catch((err) => {
      setError(err instanceof Error ? err.message : "Could not restore audit.");
      storeActiveJob(null);
    });
  }, [loadJob]);

  useEffect(() => {
    if (!job || !isJobWorking(job)) return;
    const delay = job.stage === "queued" ? 1200 : 2200;
    const timer = window.setTimeout(() => {
      void loadJob(job.jobId).catch((err) => {
        setError(err instanceof Error ? err.message : "Could not refresh audit.");
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [job, loadJob]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setJob(null);
    setSubmitting(true);
    try {
      const sessionId = getAuditSessionId();
      const referrerPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : undefined;
      const res = await fetch("/api/seo-audit/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, sessionId, referrerPath }),
      });
      const data = await readApiJson(res);
      if (!res.ok) {
        const retry = typeof data.retryAfterSeconds === "number"
          ? ` Try again in ${Math.ceil(data.retryAfterSeconds / 60)} minutes.`
          : "";
        setJob(data as AuditJobResponse);
        const message =
          typeof data.error === "string"
            ? data.error
            : typeof data.errorMessage === "string"
              ? data.errorMessage
              : "Audit failed.";
        setError(message + retry);
      } else {
        const nextJob = data as AuditJobResponse;
        setJob(nextJob);
        storeActiveJob(nextJob.jobId);
        void loadJob(nextJob.jobId).catch((err) => {
          setError(err instanceof Error ? err.message : "Could not start audit.");
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BlogPageShell>
      <div className="bg-background text-foreground">
      <section className="relative border-x bg-card/60 px-4 py-10 full-line-bottom">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
            Free SEO audit
          </p>
          <span className="h-px flex-1 bg-border" />
        </div>
        <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          SEO Checker
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
          A live, professional-grade crawl of any public URL. Meta, content,
          structured data, social previews, security, crawlability, and
          performance are staged into a prioritized fix list.
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="h-12 rounded-md bg-background pl-9 font-mono"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !url}
            className="h-12 rounded-md px-6 font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Crawling…
              </>
            ) : (
              <>
                Audit site
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 font-mono text-sm text-destructive">
            {error}
          </div>
        )}

        {job && <div className="mt-6"><AuditProgress job={job} /></div>}
        {loading && !result && <LoadingSteps />}
      </section>
      <SectionSeparator className="full-line-bottom" />

      {result && (
        <>
          <Summary result={result} />
          <SectionSeparator className="full-line-bottom" />
          <PriorityFixes result={result} />
          <SectionSeparator className="full-line-bottom" />
          <MetaInspector result={result} />
          <SectionSeparator className="full-line-bottom" />
          {result.siteCrawl ? (
            <>
              <SiteCrawlPanel crawl={result.siteCrawl} />
              <SectionSeparator className="full-line-bottom" />
            </>
          ) : null}
          {result.categories.map((category) => (
            <React.Fragment key={category.id}>
              <CategoryBlock category={category} />
              <SectionSeparator className="full-line-bottom" />
            </React.Fragment>
          ))}
          <section className="relative border-x full-line-bottom px-4 py-4">
            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "size-3 transition-transform",
                  showRaw && "rotate-180"
                )}
              />
              {showRaw ? "Hide" : "Show"} raw JSON
            </button>
            {showRaw && (
              <pre className="mt-4 max-h-96 overflow-auto rounded-md border border-border/70 bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </section>
          <SectionSeparator className="full-line-bottom" />
          <section className="relative border-x full-line-bottom p-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Want me to fix this for you?
            </h2>
            <p className="mt-2 font-mono text-sm tracking-wide text-muted-foreground">
              Every issue above has a root cause. Let&apos;s talk through the
              priority fixes and what makes sense to tackle first.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-full font-mono">
                <Link href="/#contact">
                  Start a conversation
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full font-mono"
              >
                <Link href="/services/seo-audit">See the full audit service</Link>
              </Button>
            </div>
          </section>
          <SectionSeparator className="full-line-bottom" />
        </>
      )}

      {!result && !loading && (
        <>
          <section className="relative border-x full-line-bottom px-4 py-8">
            <h2 className="text-xl font-semibold tracking-tight">
              What gets checked
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {CHECK_PREVIEW.map((group) => (
                <div
                  key={group.title}
                  className="rounded-xl border border-border/70 p-4"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    {group.title}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 font-mono text-xs">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-primary">›</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <SectionSeparator className="full-line-bottom" />
        </>
      )}

      <footer className="relative h-fit border-x full-line-bottom p-4">
        <p className="text-center font-mono text-sm text-balance text-muted-foreground">
          Built by{" "}
          <Link className="font-semibold underline" href="/">
            Cherry Capital
          </Link>
          .
        </p>
      </footer>
      <SectionSeparator className="full-line-bottom" />
      </div>
    </BlogPageShell>
  );
}

function LoadingSteps() {
  const steps = [
    "Preparing the job",
    "Fetching the page",
    "Checking robots.txt and sitemap.xml",
    "Crawling internal pages",
    "Sampling links and images",
    "Scoring the report",
  ];
  return (
    <ul className="mt-6 grid gap-2 rounded-md border border-border bg-background/65 p-4 font-mono text-xs sm:grid-cols-2">
      {steps.map((step, i) => (
        <li
          key={step}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <CircleDashed className="size-3 animate-spin" style={{ animationDelay: `${i * 120}ms` }} />
          {step}…
        </li>
      ))}
    </ul>
  );
}

const CHECK_PREVIEW = [
  {
    title: "Meta & tags",
    items: [
      "Title tag + length",
      "Meta description + length",
      "Canonical, robots, viewport",
      "Favicon & lang",
    ],
  },
  {
    title: "Content & structure",
    items: [
      "H1 uniqueness + heading hierarchy",
      "Word count & text/HTML ratio",
      "Mobile viewport presence",
    ],
  },
  {
    title: "Open Graph & social",
    items: [
      "og:title / og:description / og:image",
      "twitter:card",
      "Preview parity with your brand",
    ],
  },
  {
    title: "Structured data",
    items: [
      "JSON-LD blocks detected",
      "Schema validation",
      "Organization / LocalBusiness coverage",
    ],
  },
  {
    title: "Links",
    items: [
      "Total / internal / external counts",
      "Nofollow share",
      "Live-sample broken link check",
    ],
  },
  {
    title: "Images",
    items: ["Alt-text coverage", "Missing alt samples"],
  },
  {
    title: "Security headers",
    items: [
      "HTTPS + HSTS",
      "CSP, X-Frame-Options, X-Content-Type-Options",
      "Referrer-Policy, Permissions-Policy",
    ],
  },
  {
    title: "Performance",
    items: [
      "TTFB response time",
      "HTML page weight",
      "Compression + Cache-Control",
    ],
  },
  {
    title: "Crawlability",
    items: [
      "robots.txt accessibility & directives",
      "Sitemap discovery + URL count",
    ],
  },
];
