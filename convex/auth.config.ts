import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // Get this from Clerk Dashboard → JWT Templates → "convex" template → Issuer URL
      // Development format: https://verb-noun-00.clerk.accounts.dev
      // Production format: https://clerk.<your-domain>.com
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
