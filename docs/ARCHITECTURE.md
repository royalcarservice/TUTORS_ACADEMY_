# Tutors Academy — Architecture

The foundation for a multi-surface education platform. This document is the
contract for how the codebase is organised so future features are **additive**,
not rewrites.

> Stack: Next.js (App Router) · React · TypeScript · Tailwind CSS v4

---

## 1. Guiding principles

1. **One design system.** All visual decisions live in `src/app/globals.css`
   (semantic tokens) and are consumed via Tailwind utilities. No component may
   hard-code a hex colour, radius or shadow.
2. **Config-driven navigation.** Routes, portal metadata and the module
   roadmap live in `src/config/*`. UI renders from these; it never hard-codes a
   URL or a feature name.
3. **Surfaces share one shell.** The student / tutor / admin portals all render
   through `<PortalShell>`; the public site through its own header/footer.
   Swapping chrome is a layout-file change, not a page change.
4. **Server pages + client forms.** A route's `page.tsx` owns metadata and
   renders interactive work as a client component under `src/features/*`.

---

## 2. Directory map

```
src/
├── app/                     # Routing (App Router). URL structure lives ONLY here.
│   ├── layout.tsx           # Root: <html>/<body>, fonts, global CSS, skip link.
│   ├── globals.css          # ★ Design tokens (single source of truth).
│   ├── not-found.tsx        # Branded global 404.
│   ├── (public)/            # Marketing site  →  "/"
│   │   ├── layout.tsx       #   SiteHeader + main + SiteFooter
│   │   └── page.tsx         #   Home
│   ├── (auth)/              # Auth            →  /login, /register
│   │   ├── layout.tsx       #   split form + brand panel
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (portal)/            # Portals         →  /student, /tutor, /admin
│       ├── student/  { layout.tsx, page.tsx }   # layout → <PortalShell portal="student">
│       ├── tutor/    { layout.tsx, page.tsx }
│       └── admin/    { layout.tsx, page.tsx }
│
├── config/                  # ★ Data that drives UI (no JSX).
│   ├── site.ts              # brand, tagline, url, support email.
│   ├── routes.ts            # ROUTES const + PORTAL_META. Type-safe links.
│   ├── navigation.ts        # public nav, portal entries, footer columns.
│   └── modules.ts           # platform module registry (the roadmap).
│
├── components/
│   ├── ui/                  # design-system primitives (barrel: ui/index.ts).
│   ├── layout/              # chrome: headers, footer, portal shell, drawers.
│   └── shared/              # cross-cutting: logo, not-built-yet placeholder.
│
├── features/                # feature-local client components.
│   └── auth/                # login-form.tsx, register-form.tsx
│
└── lib/
    └── cn.ts                # clsx + tailwind-merge class helper.
```

Route groups `(public)` / `(auth)` / `(portal)` keep URLs clean
(`/student`, not `/portal/student`) while letting each surface carry its own
layout.

---

## 3. The design system

`globals.css` is layered:

1. `:root` — raw semantic tokens (`--ta-brand-600`, `--ta-radius-lg`, …).
2. `@theme inline` — maps tokens onto Tailwind namespaces so
   `bg-brand-600`, `rounded-lg`, `shadow-brand`, `font-display`, etc. resolve
   to the tokens. Changing a token restyles the whole platform.
3. `@layer base` — resets, focus rings, reduced-motion, anchor offset.

Type: `Inter` (body) + `Plus Jakarta Sans` (display headings), loaded via
`next/font/google` with CSS variables.

Primitives (`components/ui`): `Button`, `Input`, `Label`, `FieldHint`,
`Checkbox`, `RadioCard`, `Card*`, `Badge`, `StatusBadge`, `Alert`, `Container`,
`Divider`, `SectionHeading`. All funnel through `cn()` so consumers can
override safely.

---

## 4. The module registry (`config/modules.ts`)

The roadmap is data. Each module declares `id`, `name`, `summary`, `status`,
`surfaces` (which portals it appears on) and a reserved `routePrefix`.

```ts
{ id: "live-classroom", status: "planned", surfaces: ["student", "tutor"], … }
```

- The marketing "Platform" grid, the portal sidebars and the "what's next"
  panels all read from it.
- **Planned modules are rendered as non-links** so the app never advertises a
  404. When a module ships, flip `status` and add its route; navigation picks
  it up without editing existing components.

---

## 5. Adding a feature (the contract)

Example — ship **Assignments** in the student portal:

1. `config/modules.ts`: set `status` of `assignments` to `live` (or
   `in-progress`).
2. Add a route: `src/app/(portal)/student/assignments/page.tsx`.
3. Add a nav entry in the portal sidebar (it already renders the row; give it
   an `href`).
4. Put any interactive work in `src/features/assignments/*`.

No existing layout, token or component file needs rewriting.

---

## 6. Responsive contract

- Breakpoints follow Tailwind (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem).
- Portals: fixed 264px sidebar at `lg` (main offset by
  `lg:pl-[var(--ta-sidebar-w)]`); below `lg` it is an off-canvas drawer.
- Public site: full nav at `lg`; below it a slide-down panel (locked scroll +
  auto-close on resize via `matchMedia`).
- ⚠️ **Do not use the `hidden` attribute to toggle responsive visibility.**
  Tailwind v4's preflight emits `[hidden] { display: none !important }`, which
  outranks `lg:block`/`lg:flex` and will hide content on desktop. Use
  visibility/transform classes instead (see `portal-sidebar.tsx`,
  `mobile-nav.tsx`).

---

## 7. Known limitations (deliberate, foundation scope)

- No dashboards, live classroom, or backend. Portals show an honest
  "not built yet" panel listing the real roadmap.
- Auth forms validate but do **not** call an API; no session is created.
- Upstream React 19.2.8 SSR quirk: `autoComplete` / `minLength` serialise
  camelCase in the initial HTML (browsers ignore them) but React repairs both
  on hydration. Verified — see comment in `components/ui/input.tsx`.
- No dark mode / i18n / theme toggle yet — tokens are structured to support it.
