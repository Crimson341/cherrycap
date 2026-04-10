# CodeGuard Dashboard Plan

This plan assumes the dashboard is for the `CodeGuard` SaaS described in [SAAS_IDEA.md](/Users/thugbunny/home/cherrycap/SAAS_IDEA.md), not for the marketing portfolio pages.

## Goal

Build a dashboard that helps a developer or team answer three questions fast:

1. Which repositories need attention right now?
2. What findings are blocking trust in AI-generated code?
3. Are scans and pattern learning improving over time?

## What Is Set Up Now

- Convex is wired into the Next app through [src/components/ConvexClientProvider.tsx](/Users/thugbunny/home/cherrycap/src/components/ConvexClientProvider.tsx).
- The first Convex schema exists in [convex/schema.ts](/Users/thugbunny/home/cherrycap/convex/schema.ts).
- Starter dashboard functions live in [convex/dashboard.ts](/Users/thugbunny/home/cherrycap/convex/dashboard.ts).
- A first dashboard route exists at [src/app/dashboard/page.tsx](/Users/thugbunny/home/cherrycap/src/app/dashboard/page.tsx).

## Initial Data Model

### `repositories`

Tracks each codebase under review.

- `name`, `fullName`, `provider`, `defaultBranch`
- `isActive`
- `lastScanAt`, `createdAt`, `updatedAt`

### `scans`

Tracks each scan run for a repository and branch.

- `repositoryId`
- `branch`, `commitSha`
- `status`
- `findingsCount`, `criticalCount`, `warningCount`
- `durationMs`, `startedAt`, `completedAt`

### `findings`

Tracks issues surfaced by a scan.

- `repositoryId`, `scanId`
- `severity`, `category`, `status`
- `title`, `message`
- `filePath`, `line`
- `createdAt`

## Recommended Build Sequence

### Phase 1: Useful in a Week

Ship the dashboard as an internal operator console.

- Add repo onboarding flow with GitHub import.
- Add a mutation to create scans from incoming CLI or webhook results.
- Replace demo seed data with real writes from the scanner.
- Add a table view for recent findings with severity, repo, file, and status filters.
- Add a scan detail page that groups findings by category and file.

### Phase 2: Useful for a Team

Turn the operator console into a shared workflow.

- Add auth and organizations.
- Add repository ownership and assignee fields on findings.
- Add status transitions: `open`, `in_review`, `resolved`, `ignored`.
- Add saved views for "critical only", "my repos", and "new since last deploy".
- Add GitHub deep links so a finding can jump straight to file and line.

### Phase 3: Useful as a Product

Turn the workflow into a differentiator.

- Add trend charts for findings over time, by severity and category.
- Add false-positive capture so the system can learn team preferences.
- Add pattern coverage metrics: how much of a repo has strong reusable guidance.
- Add recommendation acceptance metrics to measure whether suggested fixes are actually used.
- Add per-library confidence reporting so the user can tell whether React, Convex, or other ecosystems are well understood.

## Immediate Next Tasks

1. Create a real Convex deployment and set `NEXT_PUBLIC_CONVEX_URL`.
2. Run `npx convex dev` so generated types match the new dashboard functions.
3. Decide the ingestion path for scan results:
   - CLI posts directly to Convex
   - Next API route validates and forwards to Convex
   - GitHub Action triggers an authenticated endpoint
4. Add repo and scan creation mutations once the ingestion path is chosen.
5. Replace the marketing-style dashboard shell with a tighter product UI after the data plumbing is stable.

## Product Notes

- The first version should optimize for triage speed, not pretty charts.
- Repository health, recent failures, and critical findings should be visible without scrolling.
- Historical analytics matter, but only after new scan ingestion is reliable.
