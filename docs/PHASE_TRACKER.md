# Phase tracker — standing re-test items

One line per item. Each names the trigger, the check, and where the tripwire lives.

| Item | Trigger | Check | Tripwire |
| --- | --- | --- | --- |
| Next #99287 — `notFound()` pages and error boundaries delivered client-side (blank without JS). Observed 2026-09-29 on Next 16.3.6. | **Any Next version bump**, and the **start of Phase 10** | run `node audit/states.cjs --check`; if a `FLIP-ALARM` gate FAILS the framework changed → remove the alarms, restore `h1 === 1` without JS, delete the exception section in `docs/STATE_LANGUAGE.md` | `audit/states.cjs` (three FLIP-ALARM gates) |
