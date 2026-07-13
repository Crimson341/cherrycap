# Convex backend

This directory contains Cherry Capital's authentication and analytics backend.

- `auth.ts` configures the single-owner credentials provider.
- `dashboard.ts` ingests analytics events and builds dashboard snapshots.
- `schema.ts` defines authentication, traffic, click, lead, and uptime tables.
- `users.ts` creates and looks up the dashboard owner.
- `_generated/` is managed by the Convex CLI and should not be edited manually.

Run `npx convex dev` from the project root to develop against a Convex deployment.
