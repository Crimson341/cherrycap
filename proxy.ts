import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const authConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (!authConfigured) {
    if (process.env.NODE_ENV === "production" && isDashboardRoute(request)) {
      return new NextResponse("Dashboard unavailable", { status: 503 });
    }
    return NextResponse.next();
  }

  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  if (isDashboardRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }

  return NextResponse.next();
}, {
  // Sign-in and sign-out are handled by src/app/api/auth/route.ts so we can
  // recover from stale JWT cookies before calling Convex.
  apiRoute: "/api/_convex-auth",
});

// Auth proxy for private routes + auth API only — marketing pages skip this work
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/api/auth",
    "/api/_convex-auth",
  ],
};
