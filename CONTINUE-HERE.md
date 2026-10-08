# CONTINUE HERE — read this file first, then `prompts/README.md`

*Written at the handover. **The repository's own documents are the source of truth for what was built** —
this file tells you where the work stands and how to run it, not what the code does.*

---

## WHERE THINGS STAND

- **PHASE 6 IS CLOSED (2026-10-08).** Steps 6.1–6.5 built and reported; **6.6 THE TUTOR GATE RAN TO
  VERDICT in eleven windows (W1–W11)** — the full record is `PHASE6_STEP6_REPORT.md` at the repo root:
  the promise ledger (3 contradictions found and corrected by fixing the CLAIM half, W4/DEC-020), the
  second ledger (W5), the journey (W6), the identity matrix as a set with its coverage gate catching
  real drift (W7), the inside/outside pass (W8), the honesty audit 30/30 clean (W9), performance with
  sample counts (W10), and the phase-close verdict with the nine questions answered (W11).
- **Work lives on branch `arena/e6e6e569-tutors-academy`, pushed to origin** — commits `f3db035` (the
  owed 6.5 report) → `b4ba8cc` (P6-R21 + self-hosted fonts) → `77e1efb`…`65a375f` (gate windows) →
  this close-out. The sandbox re-provisioned repeatedly during the run; history survived on origin.
- **The phase's debt list is final and declared** (the report's "Owed to a credentialed environment"):
  live migration apply · credentialed harness re-runs · homepage baseline re-pin (DEC-020) · the
  identity-matrix `--write` re-run pinning `/dev/tutor-states{,/frame}` (W7 drift) · a signed-in
  journey re-walk with timings/screenshots · LCP/fold/320 live re-measurement · P6-R20 round-trip
  confirmation · timing-parity of probe denials · the two static-guard rulings (W1, declared red).
- **Open owner questions carried forward:** the homepage "Live tutoring" tagline (surfaced in W4,
  not rewritten inside the gate) · the co-teacher read grant (refused; DEC-018 Item 5) · the
  silent-shaping attribution candidate (W5/W8 recommendation for Phase 7).
- **These prompt files lived only in a chat workspace and were nearly lost.** They now live in the repo.
  **Version them with the code. Never keep a brief only in a chat.**

## HOUSE RULES — why they exist

*A 24-step pipeline (two Next.js servers + Puppeteer) wedged a 2 GB sandbox for 30 minutes and cost a
whole pass. These rules are the fix, not ceremony.*

1. **ONE window per message** — one harness, or one small group of commands. **Never two servers plus
   Puppeteer in one call.**
2. **Wrap every long step:** `timeout -k 5 <N>`.
3. **Anything that starts a server kills it BY PORT** (`ss -ltnp`) in the **same** invocation. Never
   `pkill` on a pattern.
4. **Read a brief from disk** rather than pasting it.
5. **A window that stalls is reported with what was measured and where it stopped.** Partial > stuck.
6. **A window that needs a ruling stops and asks.** Nothing is decided inside a window.

## IMMEDIATE ORDER

1. **PHASE 7 AWAITS ITS BRIEF.** Phase 6 closed with a verdict; the gate doc's end rule was honoured —
   nothing of Phase 7 has been started or touched. When the brief arrives, its first task is already
   ruled: **create `progress_record`** (DEC-009; the accepted shape is `docs/proposed/progress_record.sql`),
   then the cohort model that reopens P6-R13 (DEC-018 Item 4), the attend-versus-resume sentence rule,
   and P6-R15's settling-GET check on every new write. Delivering module: `live-classroom`.
2. **Credentialed environment first, when available:** run the debt list above before new construction —
   the harness re-runs, the baseline re-pin (DEC-020), the matrix `--write` re-pin (W7), the signed-in
   journey re-walk. Read `PHASE6_STEP6_REPORT.md` end to end; it is the handover document.
3. **Rulings owed to the owner:** the two static guards (W1) · the tagline question (W4) · the
   co-teacher grant question (DEC-018 Item 5).

## STANDING

`prompts/README.md` — the prompt log: phase tracker, per-step rules, and **the rulings index (P5-R1…R10,
P6-R1…R20)**. The repo's own `docs/` carry the decisions, exceptions, visibility, distance and language
documents. **Do not violate any DO-NOT-CHANGE list**, and do not build Admin.
