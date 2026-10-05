# PHASE 6 · STEP 6 — THE GATE IN ELEVEN SMALL WINDOWS

**Spec unchanged:** `phase-6-step-06-tutor-gate.md` defines every part, test and constraint.
**This file is only the run order.** One window per command window. Small enough that a stall costs one
window, not the pass.

**RULES IN EVERY WINDOW**
- Per-step `timeout -k 5 <N>`. Every server-starting step kills by port (`ss -ltnp`) in the **same**
  invocation.
- Verification only: no new features, surfaces, copy or client JS; no analytics; test accounts only.
- **A window that stalls is reported with what was measured and where it stopped.** Partial > stuck.
- **A window that needs a ruling stops and asks.** Nothing is decided inside a window.
- Each window ends by pasting its findings into the running report.

---

## W1 — COLD START, FIRST HALF
Steps 1–6 of the sequence only (clone/confirm → install → build). Paste each timing.

## W2 — COLD START, SECOND HALF
Steps 7–12 (migrate → seed test accounts → one harness smoke run). Paste each timing; teardown by port.

## W3 — HARNESS STATE
Bring the server up **once**. Run every harness. Paste every pass count. Teardown by port.
Then `git log --oneline -1` and `git status --porcelain`, raw. **Confirm 6.5's report exists** on disk.
→ closes the gate's cold-start row.

## W4 — THE PROMISE LEDGER
Scene 5's strings **verbatim** against what was built. Exactly three verdicts (DELIVERED · DECLARED
DISTANCE · CONTRADICTION). **Both directions.** Every contradiction fixed in-window by correcting the
wrong half; report which half.

## W5 — THE SECOND LEDGER
What a tutor can do | what a student would think if they knew. Every row that reads badly is a finding.
Rows that read well go in too. Fixes limited to **copy on tutor surfaces**.

## W6 — THE JOURNEY
One phone, one sitting. First visit (timed) · the walk with status codes · dead ends and whether the
product says so at the point it stops · the second visit · the three-second skim (measured) · the
adversarial read (monitored · blamed · duty not agreed).

## W7 — THE IDENTITY MATRIX AS A SET
Paste it whole. Flag every route whose rows look like a fork. Revised rows visible as revisions.
**Prove the coverage gate by dropping a row.**

## W8 — THE INSIDE/OUTSIDE PASS
Six questions, evidence each: tutor-sees · tutor-changes · what-is-missing · role-visibility ·
what-probing-reveals · what-the-product-never-says.

## W9 — THE HONESTY AUDIT
30 categories. Methods. **Evidence of absence** where clean. The audit's stated limits.

## W10 — MATRIX AND PERFORMANCE
Every cell filled or its reason stated. Mobile-first, the floor, both themes. Fold gate · the pin ·
LCP variance with sample counts · the 8pm profile · payload per route (**no client JS**) · **P6-R20
re-measured**.

## W11 — TRUST, DISTANCE, VERDICT
Eight-plus breakages, each with **the named gate** and the pasted failure (**any breakage no gate caught
is a missing gate**). Exceptions register counted, with the Phase 5 comparison. `/dev/tutor-gate`.
Production build. **No real identity anywhere (query; expected zero).** The nine phase-close questions.
Commit. Paste the final `git status --porcelain` raw.
