import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getDashboardPayload } from "@/lib/dashboard/server";
import {
  dashboardRanges,
  type DashboardRange,
} from "@/lib/dashboard/types";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description:
    "Private analytics dashboard for tracking site traffic, click activity, and engagement at Cherry Capital.",
  alternates: {
    canonical: "/dashboard",
    languages: {
      en: "/dashboard",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/dashboard",
    title: `${siteName} Analytics Dashboard`,
    description:
      "Private internal dashboard for Cherry Capital traffic and conversion analytics.",
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} Analytics Dashboard`,
    description:
      "Private internal dashboard for Cherry Capital traffic and conversion analytics.",
    images: [defaultOgImage.url],
  },
};

function parseRange(input: string | string[] | undefined): DashboardRange {
  const value = Array.isArray(input) ? input[0] : input;
  return dashboardRanges.includes(value as DashboardRange)
    ? (value as DashboardRange)
    : "30d";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  if (process.env.NEXT_PUBLIC_CONVEX_URL && !(await isAuthenticatedNextjs())) {
    redirect("/signin");
  }

  const { range } = await searchParams;
  const selectedRange = parseRange(range);
  const payload = await getDashboardPayload(selectedRange);

  return <DashboardOverview payload={payload} />;
}
