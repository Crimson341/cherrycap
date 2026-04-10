import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const DEFAULT_OWNER_EMAIL = "scott@cherrycapitalweb.com";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function normalizePassword(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOwnerEmail() {
  return normalizeEmail(process.env.DASHBOARD_OWNER_EMAIL) || DEFAULT_OWNER_EMAIL;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "dashboard-owner",
      authorize: async (credentials, ctx) => {
        const email = normalizeEmail(credentials.email);
        const password = normalizePassword(credentials.password);
        const ownerEmail = getOwnerEmail();
        const ownerPassword = normalizePassword(process.env.DASHBOARD_OWNER_PASSWORD);

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        if (!ownerPassword) {
          throw new Error("Dashboard owner password is not configured");
        }

        if (email !== ownerEmail || password !== ownerPassword) {
          throw new Error("Invalid credentials");
        }

        const existingUser = await ctx.runQuery(internal.users.getByEmail, {
          email: ownerEmail,
        });

        if (existingUser) {
          return { userId: existingUser._id };
        }

        const userId = await ctx.runMutation(internal.users.createOwner, {
          email: ownerEmail,
        });

        return { userId };
      },
    }),
  ],
});
