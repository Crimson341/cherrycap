import Link from "next/link";
import {
  Activity,
  ExternalLink,
  Eye,
  Globe2,
  MapPin,
  Monitor,
  MousePointerClick,
  Users,
} from "lucide-react";

import { DashboardSignOutButton } from "@/components/dashboard/DashboardSignOutButton";
import { Sparkline } from "@/components/dashboard/Sparkline";
import type { DashboardPayload, DashboardRange } from "@/lib/dashboard/types";
import { dashboardRanges } from "@/lib/dashboard/types";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) return "No data received";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function rangeLabel(range: DashboardRange) {
  if (range === "24h") return "24 hours";
  if (range === "7d") return "7 days";
  return "30 days";
}

function formatDelta(delta: number | null) {
  if (delta === null) return "No prior-period data";
  if (delta === 0) return "No change";
  return `${delta > 0 ? "+" : ""}${delta}% vs. prior period`;
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/10 px-6 text-center text-sm text-[var(--dash-text-muted)]">
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  series,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Users;
  series?: number[];
  color: string;
}) {
  return (
    <section className="dash-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--dash-text-dim)]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {numberFormatter.format(value)}
          </p>
        </div>
        <span
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {series && series.length > 0 ? (
        <div className="h-14">
          <Sparkline data={series} color={color} />
        </div>
      ) : null}
      <p className="mt-3 text-xs text-[var(--dash-text-muted)]">{detail}</p>
    </section>
  );
}

function BreakdownList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Globe2;
  items: DashboardPayload["traffic"]["topRegions"];
}) {
  return (
    <section className="dash-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-violet-300" aria-hidden="true" />
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--dash-text-muted)]">No data yet.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={item.label} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
              <span className="truncate text-[var(--dash-text-muted)]">{item.label}</span>
              <span className="tabular-nums">{item.percentage}%</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ConnectionStatus({
  title,
  connected,
  note,
  detail,
}: {
  title: string;
  connected: boolean;
  note: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <span
          className={
            connected
              ? "rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-medium text-emerald-300"
              : "rounded-full bg-white/5 px-2 py-1 text-[11px] font-medium text-[var(--dash-text-muted)]"
          }
        >
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>
      <p className="mt-3 text-sm text-[var(--dash-text-muted)]">{note}</p>
      <p className="mt-2 text-xs text-[var(--dash-text-dim)]">{detail}</p>
    </div>
  );
}

export function DashboardOverview({ payload }: { payload: DashboardPayload }) {
  const pageviewSeries = payload.traffic.trafficSeries.map(
    (point) => point.pageviews,
  );

  return (
    <div className="dashboard-shell">
      <header className="border-b border-white/6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-sm font-semibold tracking-tight">
              {payload.siteName}
            </Link>
            <p className="text-xs text-[var(--dash-text-muted)]">Owner analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="dash-pill">
              View site
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
            <DashboardSignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-300">
              Analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Site activity
            </h1>
            <p className="mt-2 text-sm text-[var(--dash-text-muted)]">
              Last captured: {formatTimestamp(payload.traffic.capturedAt)}
            </p>
          </div>
          <nav aria-label="Analytics date range" className="flex gap-2">
            {dashboardRanges.map((range) => (
              <Link
                key={range}
                href={`/dashboard?range=${range}`}
                className="dash-pill"
                data-active={payload.range === range}
                aria-current={payload.range === range ? "page" : undefined}
              >
                {rangeLabel(range)}
              </Link>
            ))}
          </nav>
        </div>

        {!payload.traffic.isLive ? (
          <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 px-4 py-3 text-sm text-amber-100/80">
            No analytics snapshot is available yet. This dashboard will show real
            traffic after the Vercel Analytics drain sends its first valid event.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Unique visitors"
            value={payload.traffic.visitors}
            detail={payload.traffic.topRegion ? `Top region: ${payload.traffic.topRegion}` : "No region data yet"}
            icon={Users}
            series={pageviewSeries}
            color="#a78bfa"
          />
          <MetricCard
            label="Page views"
            value={payload.traffic.pageviews}
            detail={formatDelta(payload.traffic.pageviewDelta)}
            icon={Eye}
            series={pageviewSeries}
            color="#fbbf24"
          />
          <MetricCard
            label="Tracked clicks"
            value={payload.traffic.clicks}
            detail={formatDelta(payload.traffic.clickDelta)}
            icon={MousePointerClick}
            color="#34d399"
          />
          <MetricCard
            label="Collection status"
            value={payload.traffic.isLive ? 1 : 0}
            detail={payload.traffic.sourceLabel}
            icon={Activity}
            color={payload.traffic.isLive ? "#34d399" : "#8b8ba3"}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <section className="dash-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Traffic trend</h2>
            <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
              Page views over the selected {rangeLabel(payload.range)}.
            </p>
            {pageviewSeries.length > 0 ? (
              <div className="mt-6 h-56">
                <Sparkline data={pageviewSeries} color="#a78bfa" showDots />
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState>No traffic series has been recorded.</EmptyState>
              </div>
            )}
          </section>

          <section className="dash-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Data connections</h2>
            <div className="mt-5 space-y-3">
              <ConnectionStatus
                title="Lead capture"
                connected={payload.leadSummary.isLive}
                note={payload.leadSummary.note}
                detail={`Last event: ${formatTimestamp(payload.leadSummary.lastCapturedAt)}`}
              />
              <ConnectionStatus
                title="Uptime monitoring"
                connected={payload.uptimeSummary.isLive}
                note={payload.uptimeSummary.note}
                detail={`Last check: ${formatTimestamp(payload.uptimeSummary.lastCheckedAt)}`}
              />
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="dash-card overflow-hidden">
            <div className="border-b border-white/6 px-5 py-4">
              <h2 className="text-sm font-semibold">Top pages</h2>
            </div>
            {payload.topPages.length === 0 ? (
              <div className="p-5"><EmptyState>No page data yet.</EmptyState></div>
            ) : (
              <ol className="divide-y divide-white/6">
                {payload.topPages.map((page) => (
                  <li key={page.path} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 text-sm">
                    <span className="truncate font-mono text-xs">{page.path}</span>
                    <span className="text-[var(--dash-text-muted)]">{page.percentage}%</span>
                    <span className="min-w-12 text-right tabular-nums">{numberFormatter.format(page.pageviews)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="dash-card overflow-hidden">
            <div className="border-b border-white/6 px-5 py-4">
              <h2 className="text-sm font-semibold">Top clicks</h2>
            </div>
            {payload.traffic.topClicks.length === 0 ? (
              <div className="p-5"><EmptyState>No click data yet.</EmptyState></div>
            ) : (
              <ol className="divide-y divide-white/6">
                {payload.traffic.topClicks.map((click) => (
                  <li key={`${click.label}-${click.target}`} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate">{click.label}</p>
                      <p className="truncate text-xs text-[var(--dash-text-dim)]">{click.target}</p>
                    </div>
                    <span className="self-center tabular-nums">{numberFormatter.format(click.clicks)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BreakdownList title="Regions" icon={MapPin} items={payload.traffic.topRegions} />
          <BreakdownList title="Referrers" icon={Globe2} items={payload.traffic.topReferrers} />
          <BreakdownList title="Devices" icon={Monitor} items={payload.traffic.topDevices} />
          <BreakdownList title="Browsers" icon={Globe2} items={payload.traffic.topBrowsers} />
        </div>
      </main>
    </div>
  );
}
