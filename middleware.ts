import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import arcjet, { shield, detectBot } from "@arcjet/next";
import { NextResponse } from 'next/server';

// Arcjet Shield for site-wide protection
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Shield protects against common attacks like SQL injection, XSS, etc.
    shield({
      mode: "LIVE",
    }),
    // Bot detection - allow good bots, block bad ones
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "CATEGORY:VERCEL",
      ],
    }),
  ],
});

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/changelog(.*)',
  '/about(.*)',
  '/blog(.*)',
  '/careers(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/development(.*)',
  '/api/hello(.*)',
  '/api/send(.*)',
  '/api/script(.*)',
  '/api/public-chat(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Apply Arcjet Shield protection to all routes
  const decision = await aj.protect(request);

  // If Arcjet blocks the request, return a 403
  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  // Clerk authentication for non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
