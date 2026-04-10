"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

const OWNER_EMAIL = "scott@cherrycapitalweb.com";

export function DashboardSignInForm() {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen border-x">
      <section className="border-b px-4 py-14 md:px-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard access
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Email and password access for Cherry Capital analytics.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            This dashboard is private. Sign in with owner credentials to continue.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Sign in
              </CardDescription>
              <CardTitle className="text-3xl">Enter the dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPending(true);
                  setError(null);

                  void fetch("/api/auth", {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      action: "auth:signIn",
                      args: {
                        provider: "dashboard-owner",
                        params: {
                          email: OWNER_EMAIL,
                          password: password.trim(),
                          redirectTo: "/dashboard",
                        },
                      },
                    }),
                  })
                    .then(async (response) => {
                      const data = (await response.json().catch(() => null)) as
                        | { error?: string }
                        | null;

                      if (!response.ok) {
                        throw new Error(
                          data?.error || "Could not complete authentication.",
                        );
                      }

                      window.location.replace("/dashboard");
                    })
                    .catch((authError) => {
                      setError(
                        authError instanceof Error
                          ? authError.message
                          : "Could not complete authentication.",
                      );
                    })
                    .finally(() => {
                      setPending(false);
                    });
                }}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="dashboard-email"
                    className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="dashboard-email"
                    type="email"
                    autoComplete="email"
                    value={OWNER_EMAIL}
                    readOnly
                    className="rounded-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="dashboard-password"
                    className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="dashboard-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Owner password"
                    className="rounded-none"
                    required
                  />
                </div>

                {error ? (
                  <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={pending}
                    className="rounded-none font-mono uppercase tracking-[0.18em]"
                  >
                    {pending ? "Working" : "Sign in"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardDescription className="font-mono uppercase tracking-[0.2em]">
                Access rules
              </CardDescription>
              <CardTitle>Internal only</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                This is an owner-only login. There is no public sign-up path and
                no account creation flow exposed in the UI.
              </p>
              <p>
                Traffic is updated from site activity snapshots. Auth controls who
                can view the dashboard and its metrics.
              </p>
              <p>
                <Link href="/" className="underline underline-offset-4">
                  Return to the site
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
