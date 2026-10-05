# TUTORS ACADEMY — Phase 1 · Step 1
## Project Reconnaissance

> **This step is read-only. Change nothing.**
> One task only: inspect the project and report what actually exists.

---

### Why this step exists

Every future prompt depends on the real state of the repo. Guessing the stack now
costs us days later. So we look before we touch.

---

### TASK

Inspect the project and report back in the exact format below.
Do not write, edit, delete, install, or commit anything.

---

### INSPECT (in this order)

1. **Root config** — `package.json`, lockfile, `tsconfig.json`, `next.config.*` / `vite.config.*`, `tailwind.config.*`, `postcss.config.*`, `.env.example`
2. **Folder structure** — 3 levels deep, excluding `node_modules`, `.git`, `dist`, `build`, `.next`
3. **Routing** — which router, and which routes actually exist
4. **Styling system** — approach (Tailwind / CSS Modules / CSS-in-JS?), any token or theme file, global CSS
5. **Motion + 3D** — any animation or 3D libraries already present
6. **Components** — inventory: count, naming convention, any existing primitives (Button, Card, Nav, etc.)
7. **Backend** — API routes / server actions / external services / DB client / auth setup
8. **Tooling** — scripts, lint, format, test, `git status`, current branch

---

### CONSTRAINTS

- **READ ONLY.** No file created, modified, or deleted. No `npm`/`pnpm`/`yarn install`. No commits.
- Read the actual files. Do not summarise from memory, convention, or assumption.
- If something is absent, write `absent`. Never invent or infer it.

---

### REPORT BACK (exact format)

1. **Stack** — framework + version, language, styling, motion, 3D, state mgmt, backend.
   Write `absent` where applicable.
2. **Structure** — folder tree, 3 levels, trimmed.
3. **Routes** — list of existing routes, or `none`.
4. **Design system status** — tokens present? primitives present? naming convention?
5. **Backend boundaries** — what is real, what is mocked, what is absent.
6. **Runnability** — does a `dev` script exist? Does the project install/run/build?
   Paste any error verbatim. Do not fix it.
7. **Blockers** — anything that would obstruct a cinematic, motion-heavy,
   3D-capable build. (e.g. wrong router, JS instead of TS, CSS-in-JS conflicts,
   no lockfile, pinned old framework version.)
8. **Recommendation** — for each blocker, the *minimal* fix. Nothing more.
9. **Confirmation** — an explicit statement that no file was changed.

---

### DO NOT

- Do NOT install anything
- Do NOT refactor, restructure, upgrade, or "clean up"
- Do NOT create a design system, tokens, components, or configs yet
- Do NOT commit or push
- Do NOT start Phase 1 Step 2

---

### TEST (proof required)

Run `git status --porcelain` before finishing and paste the raw output.

Expected result: empty. That is the proof this step was non-destructive.

---

### STOP

End your response after the report. Wait for the next instruction.
