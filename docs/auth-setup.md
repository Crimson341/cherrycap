# Cherry Capital authentication setup

The site intentionally uses two separate authentication boundaries.

## Owner dashboard

`/dashboard` is owner-only. The application-level Convex Auth check now fails
closed when its configuration is missing. Cloudflare Access should also protect
the following paths at the network edge:

- `cherrycapitalweb.com/dashboard`
- `cherrycapitalweb.com/dashboard/*`
- `www.cherrycapitalweb.com/dashboard`
- `www.cherrycapitalweb.com/dashboard/*`

Create a Cloudflare Access self-hosted application for those paths and allow
only the Cherry Capital owner identity. Do not include `/portal`, `/sign-in`, or
`/sign-up` in that policy; those routes are for customers.

## Customer accounts

Customer authentication uses Clerk. Create a Clerk application, then set these
variables locally and in the Cloudflare production build/runtime environment:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/portal
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/portal
```

The publishable key and all `NEXT_PUBLIC_` values must be available during the
Cloudflare build. The secret key must be stored as a secret and must never be
committed. Configure both `https://cherrycapitalweb.com` and
`https://www.cherrycapitalweb.com` as allowed application origins in Clerk.

Until both Clerk keys are present, the client routes show a safe setup state and
do not attempt to create sessions. When configured, `/portal` requires a valid
Clerk session and redirects unauthenticated visitors to `/sign-in`.
