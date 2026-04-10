# Claude Development Reference

## Build & Lint
```bash
npm run build      # Build production
npm run dev        # Development server
npm run lint       # ESLint check
```

## Important Files & Patterns
- Environment: Node.js, Next.js 15, TypeScript
- Database: SQLite with better-sqlite3
- UI: Shadcn/ui components with Tailwind CSS
- Forms: React Hook Form + Zod validation
- Styling: Tailwind CSS with dark mode support

## Database
- Location: `data/raffle.db` (auto-created)
- Don't commit: Added to .gitignore
- Functions in: `src/lib/db.ts`

## Code Style
- No unnecessary comments
- Use existing patterns from codebase
- Always check package.json before adding dependencies
- Follow file naming: PascalCase for components, camelCase for utils
- Use absolute imports: `@/components/...`

## Recent Changes
- Improved About section with friendly, professional copy
- Improved project descriptions with real results
- Removed raffle system
