---
name: portfolio-ui
description: Build and restyle the UI of the portfolio monorepo (apps/web public site and apps/dashboard admin) in a soft-glass, bento-grid, light-mode direction, executed with real design taste so it does not look AI-generated. Use this skill whenever a task touches any page, section, component, layout, styling, animation, copy, or design tokens of the portfolio, including small requests like "add a section", "fix the hero", "make it look better", "polish the cards", or "build the dashboard UI", even if the user never mentions design.
---

# Portfolio UI (direction + taste)

This skill has two jobs: (A) define the visual direction and page structure, (B) enforce taste rules so the result looks designed by a person for this specific owner, not generated.

## 0. Order of authority

1. The user's explicit words in the current prompt.
2. `DESIGN_BRIEF.md` in the repo root, if it exists (palette, fonts, references, owner content).
3. Part A (direction) and Part C (page structure) of this file.
4. Part B (taste rules) decides HOW A and C are executed. When A and B conflict on surface details, keep A's direction and apply B's execution.

The reference spec this skill came from was written for a different person (a product designer). Treat it as a reference for structure and rhythm only. Never copy its name, copy, numbers, logos, or quotes into the product.

---

## Part A: Visual direction

**Style:** soft glassmorphism, modern bento grid, clean light mode. Dark mode is a second theme built from the same tokens.

### Design tokens (single source of truth)

Define once in `apps/web/src/styles/tokens.css` (and share with the dashboard through `packages/config`). Components must never hardcode colors, radii, or shadows.

```css
:root {
  /* surfaces */
  --bg-from: #f4f5fa;
  --bg-to: #e6e9f5;
  --ink: #0f111a; /* primary text, dark surfaces */
  --ink-muted: #5a6075; /* secondary text */

  /* accent: default from the reference, override in DESIGN_BRIEF.md */
  --accent: #7b68ee;
  --accent-soft: #9b8bff;

  /* pastel badge fills */
  --tint-orange: #fff0e6;
  --tint-purple: #f2eeff;
  --tint-blue: #eaf4ff;
  --tint-teal: #e6faf8;

  /* glass */
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: 1px solid rgba(255, 255, 255, 0.85);
  --glass-blur: 16px;
  --glass-shadow: 0 10px 30px -10px rgba(108, 99, 255, 0.08);

  /* radius hierarchy (do not use one radius everywhere) */
  --radius-container: 28px; /* large section wrappers */
  --radius-card: 20px; /* cards inside containers */
  --radius-chip: 999px; /* pills, buttons, tags */
}
```

Page background: a soft mesh gradient from `--bg-from` to `--bg-to`, static, low contrast. Optional single decorative glass sphere or wave on the right edge, kept lightweight (CSS or one pre-rendered image). Load any 3D (React Three Fiber) lazily and only if the user asked for it.

### Glass rules

- Glass is for surfaces that float over the background: nav bar, hero container, a few featured cards. It is not for every box.
- Maximum 3 blurred layers visible at once on mobile (performance). Provide a solid fallback when `backdrop-filter` is unsupported or `prefers-reduced-transparency` is set.
- Text on glass must meet WCAG AA against the real rendered background, not the token. Check it over the mesh gradient.
- Use two elevation levels only (resting, raised). Do not put the same shadow under everything.

### Typography

- Two families at most, clearly distinct, loaded with `next/font`.
- The reference lists Inter, Plus Jakarta Sans, or Geist Sans. Treat these as the fallback, not the choice. Pick a pairing with character that suits the owner (for example a distinctive grotesque for headings with a quiet body face) and record it in `DESIGN_BRIEF.md`.
- Define a real type scale (for example 12 / 14 / 16 / 20 / 28 / 40 / 56) with deliberate weights. Section headings sit around 28 to 32px, the hero heading is much larger, and the size contrast should be obvious.
- Line length under 80 characters for body text.

---

## Part B: Taste rules (anti AI slop)

### B1. Ground the design in the real subject

The subject is one real person who builds software. The distinctive choices must come from their world: their projects, stack, and voice. Before designing, read the owner's real content (from `DESIGN_BRIEF.md`, the seed data, or the API). If content is missing, ask at most 3 short questions, otherwise state your assumptions in one line.

Pick ONE memorable element for the page (for example the hero treatment, a live project preview, or a signature interaction). Keep everything around it quiet. Spend boldness in one place.

### B2. Tells to avoid (or use only when the content truly needs them)

- Gradient text as a style. Use solid ink; allow at most one gradient accent on the whole page.
- Tracked-out ALL-CAPS eyebrow above every heading. Use a small label only where it carries real information (for example a section name that is also navigation). Sentence case, not uppercase, not on every section.
- Accenting a single word of a headline in a different color or italic.
- Identical rounded cards chopped from the content, all with the same radius and the same soft shadow. Vary size, weight, and treatment by importance (bento means different cell sizes with purpose).
- Three identical stat blocks ("5+ / 30+ / 15+") as a default. Show a stat only if it is real, and not in a row of three just for symmetry.
- Pastel icon boxes in four colors on four equal cards.
- Emoji as icons (no ✉️ 📞 📍 📥 ✈️). Use one icon set (Lucide or Phosphor) at one stroke weight.
- A "→" or "↗" appended to every button. Use an arrow icon only for external links or navigation that actually leaves the page.
- Numbered markers (01, 02, 03) unless the content really is a sequence. The design process section is a real sequence, so numbers are fine there.
- Meta strings joined with middle dots, "WORD — fragment" labels, monospace for decorative small labels.
- Everything centered. Use left alignment and asymmetry on purpose.
- Fabricated proof: fake "Trusted by" logos, invented testimonials, invented metrics ("+120% design impact"), invented years of experience. Render proof only from real data in the API. If a section has no data, hide it (or show a useful empty state in the dashboard), never fill it with placeholders on the public site.
- Lorem ipsum, "John Doe", stock-photo faces.

### B3. Copy

- Words are design. Write specific, plain, first-person copy from the owner's real profile (`profile.headline`, `profile.bio`, project `problem/solution/result`). Content language follows i18n (ID and EN); write both properly, not machine-stiff.
- Ban filler such as "crafting meaningful digital experiences", "passionate developer", "turning ideas into reality", "cutting-edge", "seamless".
- Buttons say exactly what happens: "See projects", "Download CV", "Send message". Same action keeps the same name everywhere (the button says "Publish", the toast says "Published").
- Errors say what went wrong and how to fix it. Empty states point to the next action.
- Sentence case, active voice.

### B4. Motion

- One orchestrated moment on load (hero), plus a small number of purposeful reveals. Fade-and-slide-up on every section and a hover lift on every card is the generic default; do not do it.
- Motion that answers a user action (opening, expanding, confirming, page transition) is good.
- Durations 150 to 600ms, one easing family. Respect `prefers-reduced-motion` everywhere (disable parallax, magnetic effects, and large transitions).
- Build reusable animation primitives (`Reveal`, `Stagger`, `MagneticButton`) once. Never copy animation code between sections.
- Nothing animated above the fold may hurt LCP.

### B5. Restraint and quality floor

- Before finishing, remove one accessory: cut one decoration that does not serve the content.
- Always: responsive from 375px, visible keyboard focus, semantic HTML, alt text, AA contrast, no horizontal scroll, touch targets at least 44px.
- Cursor effects and magnetic buttons are disabled on touch devices.

---

## Part C: Page structure (public site, `apps/web`)

All content comes from the API (`/api/v1/...`) through server components with revalidation. No content is hardcoded in components. Sections can be toggled from site settings; if a section has no data, it does not render.

| Section      | Layout                                                       | Data source                |
| ------------ | ------------------------------------------------------------ | -------------------------- |
| Navbar       | Sticky glass bar, brand left, links center, one action right | `profile`, settings        |
| Hero         | 2-column asymmetric inside a large glass container           | `profile`                  |
| About        | 2-column: heading + any real stats left, bio right           | `profile`, `experiences`   |
| What I do    | Bento of capability cells, not four equal cards              | `profile` / settings       |
| Stack        | Grouped by category, real skills only                        | `skills`                   |
| Projects     | Featured case studies, 3-column grid on desktop              | `projects`                 |
| Process      | Horizontal sequence of steps                                 | settings                   |
| Testimonials | Quote cards, optional carousel                               | `testimonials` (approved)  |
| Contact      | 2-column: info left, form card right                         | `profile`, `POST /contact` |

### C1. Navbar

- Pill/bar with glass tokens, padding about 16px 24px, `--radius-card`.
- Left: monogram circle in `--ink` with the owner's initial, name in bold 14px, role in 11px muted.
- Center: Home, About, Work, Stack, Process, Testimonials, Contact (only sections that render). Active link is a white pill with a subtle shadow.
- Right: one action button (for example "Let's talk") as a glass pill. Language switch (ID/EN), theme toggle, and the command palette trigger live here too.
- Sticky, with the scroll progress bar under it.

### C2. Hero

- Left: small greeting only if it earns its place, then the owner's name as H1 (about 52px or larger, extrabold), then the role line in solid ink or accent (no gradient text), then 1 to 2 sentences of specific copy, then two buttons: primary solid `--ink` pill ("See projects"), secondary glass pill ("Download CV", with a Lucide download icon).
- "Trusted by" row: render only if the owner has real clients or employers with permission to show logos. Otherwise omit it entirely.
- Right: portrait or a stronger visual from the owner's work, framed in a tilted rounded glass shape. At most 2 floating widgets (for example a real years-of-experience figure and an availability badge from `profile.availability`). Do not add a third decorative badge.
- The hero carries the page's one memorable element. Decide what it is in the plan.

### C3. About

- Large glass container, 2 columns.
- Left: two-line heading that states the owner's actual stance, plus real stats (only if real, any count, laid out by importance rather than a forced row of three).
- Right: bio paragraph and a secondary glass button to a fuller about page.

### C4. What I do

- A bento grid with cells of different sizes: one lead cell for the owner's main strength, smaller cells for others. Each cell has a title, a plain one-sentence description, and optionally a real example project link.
- No pastel icon box on every cell. Use an icon only where it helps scanning.

### C5. Stack

- Group skills by category (Frontend, Backend, Tools). Show real skills from the `skills` endpoint with a consistent icon set (devicon or simple-icons) in neutral tone. Not a decorative row of eight logo tiles.

### C6. Projects

- Header row: heading left, "All projects" button right.
- Cards: thumbnail on top, title and category left, a link icon right. Featured projects get a larger cell. Cards open `/projects/[slug]`, a case study page (problem, solution, result, gallery, stack, repo and demo links).
- Filter and search on the full list page.

### C7. Process

- Five (or the number configured) step cards in a horizontal sequence with subtle connectors. Numbers are allowed here. Steps and wording come from settings so the owner can edit them in the dashboard. Collapse to a vertical list on mobile.

### C8. Testimonials

- Quote cards: quote text, small quote mark watermark, avatar + name + role at the bottom. Carousel arrows only if there are more than 3. Render approved entries only. Hide the section if there are none.

### C9. Contact and footer

- Left: heading in the owner's voice, then email, phone, and location only if the owner chose to publish them, with Lucide icons. Copyright line uses the current year.
- Right: form card with name, email, a topic select, and a message textarea (4 rows). Primary submit button "Send message". Validate with the shared Zod schema, honeypot field, rate limit on the server, clear success and error states.

---

## Part D: Dashboard UI (`apps/dashboard`)

- Same tokens, different density. The dashboard is a tool: flat solid surfaces for tables and forms, no backdrop blur on data-heavy areas. Glass only on the top bar or sidebar if at all.
- Tables with search, filter, sort, pagination. Forms with inline validation. Destructive actions confirm. Toasts use the same verbs as the buttons.
- Empty states say what to create first and offer the action.
- Light and dark mode both supported, keyboard accessible, status badges (DRAFT, PUBLISHED, SCHEDULED) readable without color alone.

---

## Part E: Workflow for every UI task

1. **Read** `DESIGN_BRIEF.md` (if present) and the real content needed for the section.
2. **Plan** in a few lines before coding: 4 to 6 named hex colors, font roles, a layout sketch (ASCII is fine), and the one memorable element. Then review the plan against Part B: if any part is what you would produce for any portfolio, change it and say what you changed.
3. **Build** one section or page at a time. Use tokens and the shared components. Keep changes scoped to what was asked; do not rewrite unrelated files.
4. **Check** with `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
5. **Look**: run the app, take screenshots at 375px, 768px, and 1280px (Playwright if available), and critique honestly. List 3 weaknesses, especially anything from the B2 list. Fix them, then re-check once.
6. **Report**: what changed, which tokens or components were added, and any assumptions or missing content the owner must supply.

## Definition of done

- Nothing from the B2 list appears unless the content needs it.
- No fabricated content on the public site; empty data hides the section.
- All values come from tokens; all content comes from the API.
- `prefers-reduced-motion` and keyboard navigation verified; contrast verified over the glass surfaces.
- Lint, typecheck, and build pass; screenshots reviewed at three widths.
