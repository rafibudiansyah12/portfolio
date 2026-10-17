# API

NestJS REST API backed by PostgreSQL through Prisma. `GET /api/v1` returns hello and `GET /api/v1/health` checks the database connection.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `DIRECT_URL` for your database. Keep `.env` private.
2. Apply committed migrations with `pnpm --filter @portfolio/api db:migrate:deploy`.
3. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters in `.env`, then run `pnpm --filter @portfolio/api db:seed`.
4. Start the API with `pnpm --filter @portfolio/api dev` and check `http://localhost:3001/api/v1/health`.
5. Run auth flow tests with `pnpm --filter @portfolio/api test`.

The seed is safe to rerun for the configured admin email. The password is hashed with Argon2 before it is stored.

## Authentication

- `POST /api/v1/auth/login` accepts `{ "email", "password" }`, returns a short-lived bearer access token, and sets the rotating refresh token in an HTTP-only cookie.
- `POST /api/v1/auth/refresh` rotates the refresh cookie and returns a new access token.
- `POST /api/v1/auth/logout` revokes the refresh token and clears the cookie.
- `GET /api/v1/auth/me` requires `Authorization: Bearer <accessToken>`.

Set `JWT_ACCESS_SECRET` to a unique random value of at least 32 characters. Refresh tokens are random opaque values; only their SHA-256 hashes are stored in the database. Browser requests must come from the exact `WEB_ORIGIN` or `DASHBOARD_ORIGIN` values.

HTTP request logs use Pino and redact authorization, cookie, and set-cookie headers. Unhandled API errors use a shared JSON response shape and do not expose internal exception details.

## Public content API

Public reads: `GET /api/v1/projects`, `/projects/:slug`, `/skills`, `/experiences`, `/profile`, `/posts`, `/posts/:slug`, `/settings/public`, and `/guestbook`.

Public submissions: `POST /api/v1/contact`, `/guestbook`, `/subscribe`, and `/views`. Public reads also include paginated `GET /api/v1/testimonials` (approved only). Contact, guestbook, and newsletter submissions include a `website` honeypot field. Contact submissions are stored before a best-effort Resend notification is sent to `CONTACT_NOTIFY_EMAIL`. Newsletter subscriptions are marked confirmed when the visitor submits the form. Rich project and post HTML is sanitized before it is returned. Page views store only the path, referrer origin, and optional country code; they never store IP addresses or cookies.

Interactive OpenAPI documentation is available at `GET /api/docs`.

## Admin content API

All admin routes require `Authorization: Bearer <accessToken>` and enforce role permissions. `ADMIN` and `EDITOR` can manage projects, skills, and experiences; only `ADMIN` can manage the profile.

- `/api/v1/admin/projects`: paginated/searchable list, get by ID, create, update, and delete. Project creation generates a URL slug from its title when one is omitted. Skill and gallery media IDs are validated against existing records.
- `/api/v1/admin/projects/reorder`: update project order in one transaction; every reordering is audited. Scheduled projects require a publish date.
- `/api/v1/admin/skills`: paginated/searchable list, create, update, and delete.
- `/api/v1/admin/experiences`: paginated/searchable list, create, update, and delete.
- `/api/v1/admin/profile`: get and patch the authenticated admin's profile.

Each content mutation and profile change writes an audit log in the same database transaction. Rich project fields are sanitized when returned by the public API.

Additional admin endpoints:

- `/api/v1/admin/posts`: searchable, paginated blog CRUD with automatic slug generation and draft/published status.
- `/api/v1/admin/media`: searchable, paginated media library, upload, and delete. Uploads accept JPG, PNG, WebP, GIF, and PDF up to 10 MB and require Cloudinary credentials.
- `/api/v1/admin/messages`: searchable inbox, mark read/archive, and email reply. Replies require `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- `/api/v1/admin/guestbook`: paginated moderation list, approve/reject, and delete.
- `/api/v1/admin/testimonials`: searchable CRUD and approval state.
- `/api/v1/admin/settings`: read/update JSON site settings (ADMIN role only).
- `/api/v1/admin/audit-logs`: searchable by entity/action and paginated (ADMIN role only).
- `/api/v1/admin/subscribers`: paginated/searchable list and delete.

Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for media upload. Configure `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` for inbox replies. The API returns a service unavailable response for those integrations until configured.

Scheduled projects are published by a database-safe job every minute. The job records a system audit entry when it changes a project from `SCHEDULED` to `PUBLISHED`.
