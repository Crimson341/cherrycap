import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { DashboardSignInForm } from "@/components/dashboard/DashboardSignInForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dashboard Sign-In",
  description:
    "Owner-only sign-in page for accessing Cherry Capital analytics and dashboard insights.",
  alternates: {
    canonical: "/signin",
    languages: {
      en: "/signin",
    },
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/signin",
    title: `${siteName} Analytics Sign-In`,
    description:
      "Owner authentication portal for private Cherry Capital site analytics.",
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} Analytics Sign-In`,
    description:
      "Owner-only sign-in page for Cherry Capital analytics dashboard access.",
    images: [defaultOgImage.url],
  },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (process.env.NEXT_PUBLIC_CONVEX_URL && (await isAuthenticatedNextjs())) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const error = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main className="min-h-screen border-x">
        <section className="border-b px-4 py-14 md:px-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Dashboard access
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Dashboard is unavailable right now
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              This dashboard is in owner setup mode. Please contact the site
              administrator if you need access.
            </p>
            <p>
              <Link href="/" className="underline underline-offset-4">
                Return to the site
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return <DashboardSignInForm error={error} />;
}
