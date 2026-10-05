# CONTINUE HERE — read this file first, then `prompts/README.md`

*Written at the handover. **The repository's own documents are the source of truth for what was built** —
this file tells you where the work stands and how to run it, not what the code does.*

---

## WHERE THINGS STAND

- **Repo:** HEAD `80760ff`, branch `main`, clean tree, 544 tracked files.
- **Phase 6:** 6.1–6.4 executed and reported. **6.5 (the tutor's states, the account surface, and the
  honest distance) is BUILT** — `audit/tutor-states.cjs` + `tutor-states.json`/`-baseline.json`,
  `docs/TUTOR_DISTANCE.md`, DEC-018 in `docs/DECISIONS.md` — **but its REPORT WAS NEVER WRITTEN.** There is
  no `PHASE6_STEP5_REPORT.md`. Treat "built" as unverified until that report exists.
- **6.6 (the tutor gate) is WRITTEN, NOT RUN:** `phase-6-step-06-tutor-gate.md` is the spec;
  `phase-6-step-06-gate-chunks.md` is the run order — **eleven small windows, W1 → W11.**
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

1. **LINEAGE CHECK** — read-only, one window. Do the hashes recorded in `prompts/README.md` and
   `docs/DECISIONS.md` exist on this remote? *If the remote's history was re-imported, every recorded
   commit hash is unverifiable — record that rather than silently ignoring it.*
2. **THE 6.5 REPORT** — a few small windows. Run 6.5's tests from
   `prompts/phase-6-step-05-tutor-states-account.md`, write `PHASE6_STEP5_REPORT.md`, commit it. **Nothing
   else.**
3. **THEN the gate** — `prompts/phase-6-step-06-gate-chunks.md`, W1 → W11, one window per message.
   **Do not start the gate before 6.5's report exists** — its precondition is "6.5 REPORTED", and it
   reads the report and `docs/TUTOR_DISTANCE.md` as evidence.

## STANDING

`prompts/README.md` — the prompt log: phase tracker, per-step rules, and **the rulings index (P5-R1…R10,
P6-R1…R20)**. The repo's own `docs/` carry the decisions, exceptions, visibility, distance and language
documents. **Do not violate any DO-NOT-CHANGE list**, and do not build Admin.
