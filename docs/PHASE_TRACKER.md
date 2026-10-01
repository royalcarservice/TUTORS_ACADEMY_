# Phase tracker — standing re-test items

One line per item. Each names the trigger, the check, and where the tripwire lives.

| Item | Trigger | Check | Tripwire |
| --- | --- | --- | --- |
| Next #99287 — `notFound()` pages and error boundaries delivered client-side (blank without JS). Observed 2026-09-29 on Next 16.3.6. | **Any Next version bump**, and the **start of Phase 10** | run `node audit/states.cjs --check`; if a `FLIP-ALARM` gate FAILS the framework changed → remove the alarms, restore `h1 === 1` without JS, delete the exception section in `docs/STATE_LANGUAGE.md` | `audit/states.cjs` (three FLIP-ALARM gates) |
| `audit/shell.cjs` `perf-mid-range` (Lighthouse, simulated Moto-G) is memory-sensitive in the 2 GB sandbox: a red with TBT in the seconds is swapping, not a regression (5.8, `docs/EXCEPTIONS.md` E-24). | **Any `perf-mid-range` FAIL** | stop the dev server (`:3000`), drop caches, re-run `audit/shell.cjs --check` once; believe the second run | `docs/EXCEPTIONS.md` E-24 |
| The 5.8 gate pin (`audit/gate-baseline.json`: 479 KB first visit · 422 KB second, 8 pm profile) drifts ±5 % → D1 fails; a pinned gate flipping → D2 fails. Re-pin only with a written reason in the step report. | **Every phase close**, and any change under `src/app/(portal)`, `src/app/subjects`, `src/components/student`, `src/components/layout/nav-shell.tsx` | `node audit/gate.cjs --check` (prod `:3100` + dev `:3000` for specimen frames; `DATABASE_URL` from `.env.local`) | `audit/gate.cjs` D1/D2 |
