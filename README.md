# Cherry Capital

Production website for [Cherry Capital](https://www.cherrycapitalweb.com), a Northern Michigan web studio. The application includes the public marketing site, security-services page, blog, AI-assisted contact chat, analytics ingestion, and a private owner dashboard.

## Stack

- Next.js 16 App Router and React 19
- TypeScript with strict checking
- Tailwind CSS 4
- Convex for authentication and analytics storage
- Vercel AI SDK and AI Gateway for chat
- Web3Forms, with optional Resend delivery, for contact email

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Public pages work without Convex, but authentication and live dashboard data require a configured Convex deployment:

```bash
npx convex dev
```

Set Convex deployment variables such as `DASHBOARD_OWNER_PASSWORD` with `npx convex env set`. Keep application secrets in the hosting environment or `.env.local`; never commit them.

## Checks

```bash
npm run check
npm run build
```

`check` runs ESLint and TypeScript. This repository does not currently include an automated test suite.

## Data flows

- `/api/contact` validates contact-form submissions and sends them through Web3Forms.
- `/api/chat` streams AI responses and exposes constrained tools for blog search and lead delivery.
- `/api/analytics/drain` verifies Vercel Analytics drain signatures and stores normalized page-view events in Convex.
- `/api/analytics/click` accepts bounded same-origin click events and stores them in Convex.
- `/dashboard` revalidates authentication on the server before loading private analytics.

See [.env.example](./.env.example) for the complete configuration inventory.
