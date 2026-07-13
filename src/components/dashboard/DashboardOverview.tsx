import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardSignOutButton } from "@/components/dashboard/DashboardSignOutButton";
import type { DashboardPayload, DashboardRange } from "@/lib/dashboard/types";
import { dashboardRanges } from "@/lib/dashboard/types";
import { updateLeadAction } from "@/app/dashboard/actions";
import { leadStatuses, type LeadStatus } from "@/lib/leads/types";

const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) {
    return "Not captured yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function formatDelta(delta: number | null) {
  if (delta === null) {
    return "No prior baseline";
  }

  const prefix = delta > 0 ? "+" : "";
  return `${prefix}${delta}% vs prior window`;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function leadStatusLabel(status: LeadStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function rangeLabel(range: DashboardRange) {
  if (range === "24h") return "Last 24 hours";
  if (range === "7d") return "Last 7 days";
  return "Last 30 days";
}

function TrafficChart({
  series,
}: {
  series: DashboardPayload["traffic"]["trafficSeries"];
}) {
  if (series.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Waiting on traffic snapshots. Data will populate here as new traffic data
        arrives.
      </div>
    );
  }

  const maxPageviews = Math.max(...series.map((point) => point.pageviews), 1);
  const barWidth = 100 / series.length;

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 100 40`}
        className="h-44 w-full overflow-visible rounded-lg border bg-card p-3"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {series.map((point, index) => {
          const height = (point.pageviews / maxPageviews) * 32;
          const x = index * barWidth + 0.8;
          const y = 36 - height;

          return (
            <rect
              key={point.bucketStart}
              x={x}
              y={y}
              width={Math.max(barWidth - 1.6, 1)}
              height={Math.max(height, 1.5)}
              rx="0.8"
              fill="var(--chart-1)"
              opacity={0.88}
            />
          );
        })}
      </svg>
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{formatTimestamp(series[0]?.bucketStart ?? null)}</span>
        <span>{formatTimestamp(series.at(-1)?.bucketStart ?? null)}</span>
      </div>
    </div>
  );
}

function BreakdownList({
  items,
  emptyMessage,
}: {
  items: DashboardPayload["traffic"]["topRegions"];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-mono text-sm">{item.label}</p>
            <span className="text-sm text-muted-foreground">
              {numberFormatter.format(item.visitors)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-[var(--chart-2)]"
                style={{ width: `${Math.max(item.percentage, 4)}%` }}
              />
            </div>
            <span className="w-12 text-right text-xs text-muted-foreground">
              {formatPercent(item.percentage)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClickList({
  items,
  emptyMessage,
}: {
  items: DashboardPayload["traffic"]["topClicks"];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.label}-${item.target}`} className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-mono text-sm">{item.label}</p>
              <p className="truncate text-xs text-muted-foreground">{item.target}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {numberFormatter.format(item.clicks)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-[var(--chart-1)]"
              style={{ width: `${Math.max(item.percentage, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardOverview({
  payload,
}: {
  payload: DashboardPayload;
}) {
  const metricCards = [
    {
      label: "Visitors",
      value: payload.traffic.visitors,
      detail: payload.traffic.isLive
        ? payload.traffic.sourceLabel
        : "Live source not connected yet",
      live: payload.traffic.isLive,
    },
    {
      label: "Page Views",
      value: payload.traffic.pageviews,
      detail: formatDelta(payload.traffic.pageviewDelta),
      live: payload.traffic.isLive,
    },
    {
      label: "Tracked Clicks",
      value: payload.traffic.clicks,
      detail: formatDelta(payload.traffic.clickDelta),
      live: payload.traffic.isLive,
    },
    {
      label: "Top Region",
      value: payload.traffic.topRegion ?? "Pending",
      detail: payload.traffic.topRegion
        ? `${formatPercent(payload.traffic.topRegions[0]?.percentage ?? 0)} of tracked visitors`
        : "Waiting on geographic breakdowns",
      live: payload.traffic.isLive,
    },
    {
      label: "Uptime",
      value: payload.uptimeSummary.uptimePercentage === null
        ? "Pending"
        : `${payload.uptimeSummary.uptimePercentage}%`,
      detail: payload.uptimeSummary.note,
      live: payload.uptimeSummary.isLive,
    },
    {
      label: "Leads",
      value: payload.leadSummary.total,
      detail: payload.leadSummary.note,
      live: payload.leadSummary.isLive,
    },
  ];

  return (
    <main className="min-h-screen border-x">
      <section className="border-b px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">Internal analytics</Badge>
              <Badge variant={payload.traffic.isLive ? "secondary" : "outline"}>
                {payload.traffic.sourceLabel}
              </Badge>
            </div>
            <DashboardSignOutButton />
          </div>

          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              {payload.siteName} traffic, click activity, and audience detail.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              This dashboard now tracks page traffic, click activity, regions,
              referrers, devices, and browsers from live site interactions. The
              D1 lead pipeline keeps every website inquiry organized in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {dashboardRanges.map((range) => (
              <Link
                key={range}
                href={`/dashboard?range=${range}`}
                className="inline-flex"
              >
                <Badge variant={payload.range === range ? "secondary" : "outline"}>
                  {rangeLabel(range)}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <Card key={metric.label} className="rounded-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardDescription className="font-mono uppercase tracking-[0.2em]">
                    {metric.label}
                  </CardDescription>
                  <Badge variant={metric.live ? "secondary" : "outline"}>
                    {metric.live ? "Live" : "Placeholder"}
                  </Badge>
                </div>
                <CardTitle className="pt-3 text-4xl">
                  {typeof metric.value === "number"
                    ? numberFormatter.format(metric.value)
                    : metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                {metric.detail}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[1.25fr_0.9fr_0.9fr]">
          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Traffic trend
              </CardDescription>
              <CardTitle>{rangeLabel(payload.range)}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrafficChart series={payload.traffic.trafficSeries} />
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last traffic snapshot: {formatTimestamp(payload.traffic.capturedAt)}
            </CardFooter>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Top pages
              </CardDescription>
              <CardTitle>Most viewed paths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payload.topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pageview data yet. It will populate here when traffic is
                  being received.
                </p>
              ) : (
                payload.topPages.map((page) => (
                  <div key={page.path} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-mono text-sm">{page.path}</p>
                      <span className="text-sm text-muted-foreground">
                        {numberFormatter.format(page.pageviews)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-[var(--chart-2)]"
                        style={{ width: `${Math.max(page.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Top clicks
              </CardDescription>
              <CardTitle>Most used actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ClickList
                items={payload.traffic.topClicks}
                emptyMessage="No tracked clicks yet. Link and button interactions will show up here."
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-3">
          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Regions
              </CardDescription>
              <CardTitle>Where visitors are coming from</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownList
                items={payload.traffic.topRegions}
                emptyMessage="No regional data has been captured yet."
              />
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Referrers
              </CardDescription>
              <CardTitle>How they found the site</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownList
                items={payload.traffic.topReferrers}
                emptyMessage="No referrer data has been captured yet."
              />
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Devices
              </CardDescription>
              <CardTitle>Device and browser mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Devices
                </p>
                <BreakdownList
                  items={payload.traffic.topDevices}
                  emptyMessage="No device data has been captured yet."
                />
              </div>
              <div className="space-y-3 border-t pt-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Browsers
                </p>
                <BreakdownList
                  items={payload.traffic.topBrowsers}
                  emptyMessage="No browser data has been captured yet."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant={payload.leadSummary.isLive ? "secondary" : "outline"}>
                {payload.leadSummary.isLive ? "D1 live" : "D1 unavailable"}
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight">Lead pipeline</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Website inquiries are saved here. Update each lead as the
                conversation progresses and keep private follow-up notes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {leadStatuses.map((status) => (
                <Badge key={status} variant="outline">
                  {leadStatusLabel(status)} {payload.leadSummary.byStatus[status] ?? 0}
                </Badge>
              ))}
            </div>
          </div>

          {payload.leads.length === 0 ? (
            <Card className="rounded-none border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {payload.leadSummary.isLive
                  ? "The pipeline is ready. New contact-form submissions will appear here automatically."
                  : "Connect the LEADS_DB binding to activate the lead pipeline."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {payload.leads.map((lead) => (
                <Card key={lead.id} className="rounded-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate">{lead.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {lead.company || "No business name provided"}
                        </CardDescription>
                      </div>
                      <Badge variant={lead.status === "new" ? "secondary" : "outline"}>
                        {leadStatusLabel(lead.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-1 text-sm">
                      <a className="block underline-offset-4 hover:underline" href={`mailto:${lead.email}`}>
                        {lead.email}
                      </a>
                      {lead.phone ? (
                        <a className="block underline-offset-4 hover:underline" href={`tel:${lead.phone}`}>
                          {lead.phone}
                        </a>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Received {formatTimestamp(lead.createdAt)} · Notification {lead.notificationStatus}
                      </p>
                    </div>

                    <div className="rounded-md border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                      {lead.message}
                    </div>

                    <form action={updateLeadAction} className="space-y-3 border-t pt-4">
                      <input type="hidden" name="id" value={lead.id} />
                      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <select
                            name="status"
                            defaultValue={lead.status}
                            className="h-10 w-full rounded-md border bg-background px-3"
                          >
                            {leadStatuses.map((status) => (
                              <option key={status} value={status}>
                                {leadStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Private notes</span>
                          <textarea
                            name="notes"
                            defaultValue={lead.notes}
                            maxLength={2000}
                            rows={3}
                            placeholder="Follow-up details, proposal notes, next step..."
                            className="w-full rounded-md border bg-background px-3 py-2"
                          />
                        </label>
                      </div>
                      <Button type="submit" size="sm">Save lead</Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Data notes
              </CardDescription>
              <CardTitle>What is live right now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {payload.dataFreshness.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Status panel
              </CardDescription>
              <CardTitle>Freshness and placeholders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Traffic</span>
                <span>{formatTimestamp(payload.dataFreshness.trafficCapturedAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Clicks</span>
                <span>{formatTimestamp(payload.dataFreshness.clickCapturedAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Leads</span>
                <span>{formatTimestamp(payload.dataFreshness.leadCapturedAt)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Uptime</span>
                <span>{formatTimestamp(payload.dataFreshness.uptimeCapturedAt)}</span>
              </div>
              <div className="border-t pt-4 text-muted-foreground">
                Uptime status: {formatStatus(payload.uptimeSummary.status)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
