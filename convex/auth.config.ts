import type { AuthConfig } from "convex/server";

function requireEnv(name: "CONVEX_SITE_URL") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
}
const issuer = requireEnv("CONVEX_SITE_URL");

export default {
  providers: [
    {
      type: "customJwt",
      issuer,
      applicationID: "convex",
      jwks: `${issuer}/.well-known/jwks.json`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
