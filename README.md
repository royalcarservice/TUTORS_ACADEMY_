# Tutors Academy

A single, modular foundation for an education platform: public website,
student / tutor / admin portals, and the routing + design system that future
features (live classroom, recorded classes, assignments, tests, payments, AI
assistant) will build on.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4

Full architectural rationale lives in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Routes (live today)

| Path        | Surface                     |
| ----------- | --------------------------- |
| `/`         | Public marketing site       |
| `/login`    | Sign in (form, no backend)  |
| `/register` | Create account (form only)  |
| `/student`  | Student portal shell        |
| `/tutor`    | Tutor portal shell          |
| `/admin`    | Admin portal shell          |

Portal dashboards, the live classroom and all backend integrations are
**deliberately out of scope** for this foundation task — each portal ships as a
responsive shell with an honest "what's next" panel driven by the module
registry in `src/config/modules.ts`.

## Project layout

```
src/app        routing + layouts (one route group per surface)
src/config     routes / navigation / site / module registry (data, no JSX)
src/components ui (design system) · layout (chrome) · shared (logo, placeholders)
src/features   feature-local client components (auth forms)
src/lib        cn() class-merging helper
```

## Conventions to preserve

- **Never hard-code colours / radii / shadows** — use the tokens from
  `src/app/globals.css` (`bg-brand-600`, `rounded-lg`, `shadow-brand`, …).
- **Never hard-code URLs** — import from `src/config/routes.ts`.
- **Don't use the `hidden` attribute for responsive toggling** (Tailwind v4
  preflight's `[hidden] { display: none !important }` beats `lg:block`).
- Interactive work goes in `src/features/<domain>`, rendered by a server
  `page.tsx` that owns the route's metadata.

## Verifying

A headless-browser check confirmed: no horizontal overflow at 1440 / 834 /
390 px, both fonts load, mobile & portal drawers open/close, the desktop
sidebar offsets content correctly, and the brand token resolves to `#2449eb`.
Screenshots of each surface were captured at all three breakpoints during the
foundation task.
