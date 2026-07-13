import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isOwnerSignInPage = createRouteMatcher(["/signin"]);
const isOwnerDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const ownerAuthConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
const clientAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  && process.env.CLERK_SECRET_KEY,
);

const ownerAuthMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // The owner dashboard must fail closed. If its auth provider is unavailable,
    // never pass dashboard traffic through to lead and analytics data.
    if (!ownerAuthConfigured) {
      if (isOwnerDashboardRoute(request)) {
        return nextjsMiddlewareRedirect(request, "/signin");
      }

      return NextResponse.next();
    }

    if (isOwnerSignInPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }

    if (isOwnerDashboardRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }

    return NextResponse.next();
  },
  {
    // Sign-in and sign-out are handled by src/app/api/auth/route.ts so we can
    // recover from stale JWT cookies before calling Convex.
    apiRoute: "/api/_convex-auth",
  },
);

const clientAndOwnerAuthMiddleware = clerkMiddleware(
  (_auth, request, event) => ownerAuthMiddleware(request, event),
  {
    authorizedParties: [
      "https://cherrycapitalweb.com",
      "https://www.cherrycapitalweb.com",
      ...(process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:3001"]
        : []),
    ],
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (clientAuthConfigured) {
    return clientAndOwnerAuthMiddleware(request, event);
  }

  return ownerAuthMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
