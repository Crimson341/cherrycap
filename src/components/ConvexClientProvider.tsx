"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl) : null,
  );

  if (!client) {
    return <>{children}</>;
  }

  return <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>;
}
