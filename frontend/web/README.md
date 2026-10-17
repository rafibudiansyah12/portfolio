# Public website

Next.js App Router frontend for the portfolio. Content is fetched from the REST API; this application never accesses the database directly.

## Local development

From the monorepo root:

```powershell
Copy-Item frontend/web/.env.example frontend/web/.env.local
pnpm install
pnpm --filter @portfolio/api dev
pnpm --filter @portfolio/web dev
```

Set `NEXT_PUBLIC_API_URL` to the API base URL (default `http://localhost:3001/api/v1`) and `NEXT_PUBLIC_SITE_URL` to the website origin (default `http://localhost:3000`). Open `http://localhost:3000/id` or `/en`.

## Routes and features

- Localized portfolio: `/id` and `/en`, with about, skills, experience, project search/filter, blog, testimonials, contact, and moderated guestbook.
- Case studies at `/[locale]/projects/[slug]` and articles at `/[locale]/blog/[slug]`.
- API data is fetched in Server Components and revalidated by content type. Public submissions use shared Zod schemas and the API's honeypot/rate-limit protections.
- Theme toggle with persisted accent colors, responsive navigation, Lenis smooth scrolling, GSAP ScrollTrigger, reusable Framer Motion reveal/stagger components, and reduced-motion support.
- Localized metadata, project/article SEO, `sitemap.xml`, `robots.txt`, and `rss.xml`.
- Optional SiteSetting-controlled features include command palette (Cmd/Ctrl+K), reduced-motion-aware page transitions and pointer effects, daily anonymous project views, project reactions, realtime guestbook updates, cached GitHub data, newsletter confirmation, dynamic Open Graph images, and a printable CV export.

The API should be running and CORS should allow the web origin. Published entries and profile data are managed from the separate dashboard.
