import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const authConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (!authConfigured) {
    return NextResponse.next();
  }

  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  if (isDashboardRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
