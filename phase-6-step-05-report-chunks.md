# PHASE 6 · STEP 5 — WRITING THE REPORT, IN SEVEN SMALL WINDOWS

**The spec is unchanged:** `phase-6-step-05-tutor-states-account.md` (its TESTS, CONSTRAINTS and REPORT
BACK sections rule). **This file is only the run order.** The 6.5 *code* is already committed — this is the
**report run**: the tests in small groups, with the report assembled as we go.

**RULES IN EVERY WINDOW**
- One server at a time. **Anything that starts a server kills it BY PORT (`ss -ltnp`) in the same
  invocation.** Never `pkill` on a pattern.
- Per-step `timeout -k 5 <N>`. **A window that stalls is reported with what was measured and where it
  stopped.**
- **A window that needs a ruling stops and asks.** Nothing is decided inside a window.
- **EVERY WINDOW ENDS BY APPENDING ITS SECTION TO `PHASE6_STEP5_REPORT.md`** (created in S1) — so a stall
  loses a window, never the report.
- Verification only: no new features, surfaces, copy or client JS; test accounts only.
- If Window A (briefs ingested) or B (lineage) have not run, **do those first.**

---

## S1 — THE ACCOUNT SURFACE (spec tests 2, 3, 4)
Server up once. Paste the full DOM and every string the account surface renders — **three things only**:
who they're signed in as (own email), role stated as fact, sign out. Paste the **student's** account
surface beside it; on divergence, **follow the student's and report the divergence**. Grep for any role
change/request/acquire affordance (**expected: none** — remember grep exit 1 = PASS). Hash the student
account route's DOM and compare against any recorded baseline; if none exists, say so and record this one.
Kill by port. **Create `PHASE6_STEP5_REPORT.md` and append §"2–4".**

## S2 — THE WRITE'S FOUR CASES (spec tests 5, 6, 7, 8 · ruling P6-R15)
1. **Unknown outcome** — cut the network during the settings POST: **no verdict** ("saved"/"failed"/"try
   again" are all wrong), and the shaping surface shows the settled true state on return. Paste it.
2. **Failed save** — a sentence beside the control; no verdict about anywhere else.
3. **Session ended mid-save** — return to the same place, one plain sentence, the settled state rendered.
   Paste the journey with status codes.
4. **Concurrent co-tutor change** — report last-write-wins or otherwise.
   **IF THE RESULT IS A SILENT OVERWRITE OF ANOTHER TUTOR'S CHANGE: STOP AND REPORT.** That is a design
   decision, not an implementation detail.
Append §"5–8".

## S3 — THE STATES, NO-JS, MOTION, ROLE CROSSING (spec tests 9, 10, 11, 12, 13, 14)
The shaping surface's read failure (**honest failure, NOT a form pre-filled with defaults** — paste what
renders and the log line) · the fourteen states, each verified or reported untestable with its reason ·
the region rule (a failed supplemental region is silent and logged; the primary answer is never silently
absent) · role crossing both ways, no alarm language, status codes pasted · **no-JS: every state complete
and the settings form still saves** · reduced motion. Append §"9–14".

## S4 — THE SWEEPS AND THE MATRIX (spec tests 15–22)
The distance placed — for each unbuilt capability, **the exact place it is named**, and confirm nothing is
named where it does not belong (no roadmap on the account page) · no new place for a missing capability,
route count before/after · the consolidated never-contains sweep across all three surfaces · the PII floor
(display name and subject only) · no aggregate, no export · the subject rule with every sentence's
grammatical subject · the identical-statement property re-verified · **the identity matrix: every tutor
route has its rows, and the coverage gate proven by dropping a row.** Append §"15–22".

## S5 — THE REGRESSION SWEEP (spec test 23)
Run **each certified harness sequentially**, per-harness `timeout`, pasting each pass count as it lands:
page · shell · environment · permissions · next-action · progress · tutor · identity-matrix · levers ·
subjects · RLS · tutor-visibility. Bring the server up once for those that need it; kill by port.
**Homepage strings unchanged.** A stall is reported partial, with the harnesses that did report.
Append §"23".

## S6 — MOBILE, ACCESSIBILITY, PERFORMANCE, ROWS, BUILD (spec tests 24–29)
390/360/320 and 1280, both themes, primary above the fold, one dominant element, 44px targets ·
accessibility (one h1, nesting, keyboard, SR order, measured contrast, grayscale, 200%/400% zoom, 1.4.12)
· payload per route before/after and **no client JS added** · the account surface's LCP with a discarded
warm-up and sample counts · **row counts: non-test identities expected ZERO** · production build succeeds,
`/dev/tutor-states` absent or 404, `.env.local` untouched, nothing secret printed. Append §"24–29".

## S7 — THE REPORT AND THE COMMIT (spec tests 30, 31 · REPORT BACK 1–13)
Test 30 — **every state reported untestable, with its reason.** Read `PHASE6_STEP5_REPORT.md` end to end,
add the preamble (files created/modified + the two report states quoted), check it against REPORT BACK
1–13, fix gaps. `git status --porcelain` raw → commit → paste `git log --oneline -1` and the final raw
status. **Then report back to the user with the report's file path.**
