import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { DashboardSignInForm } from "@/components/dashboard/DashboardSignInForm";
import Link from "next/link";
import { redirect } from "next/navigation";

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
