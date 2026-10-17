# Portfolio monorepo

pnpm workspace and Turborepo for the public Next.js site, Vite admin, NestJS API, and shared TypeScript packages.

## Requirements

Node.js 20.11+ and pnpm 10.18.3 (`corepack enable`). Copy each app's `.env.example` to `.env` as needed.

## Local development

Run `docker compose up -d` for PostgreSQL and Redis, then `pnpm install` and `pnpm dev`. Frontend apps use ports 3000 (web) and 5173 (dashboard); the backend API uses port 3001. Root commands: `pnpm lint`, `pnpm typecheck`, `pnpm build`.

## Fase 5 features

Feature switches are managed from Dashboard → Pengaturan situs and saved under the API's `features` SiteSetting. Configure `GITHUB_USERNAME` (and optional `GITHUB_TOKEN` for contribution totals) plus `PUBLIC_SITE_URL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` in `backend/api/.env` to enable GitHub and double opt-in email. Guestbook SSE polls approved entries every five seconds; GitHub summaries are cached in the API process for 15 minutes. CV data is formatted on `/[locale]/resume` and uses the browser's Print / Save as PDF dialog.

The Fase 5 Prisma migration is `20261017120000_phase5_features`. Apply it to the configured database with `pnpm --filter @portfolio/api db:migrate:deploy` before using reactions or newsletter confirmation.
