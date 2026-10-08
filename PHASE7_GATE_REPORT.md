# PHASE 7 GATE REPORT — THE LIVE CLASSROOM GATE (WINDOWS W1–W5)

*Run 2026-10-08 on branch `arena/e6e6e569-tutors-academy` (commit `5cab7eb` → this close-out).
Execution mode: PHASE-CLOSE GATE RUNNER — verification only. Zero new features, surfaces, or
dependencies; the only code added is the gate's own audit harnesses (`scripts/gate7-*.mjs`) whose
verdicts are committed under `audit/`. House rules kept: one window at a time, `timeout -k 5`
on every command, servers killed strictly by port, zero real identities.*

**The question before the gate:** Phase 7 built a live classroom (Steps 1–6, DEC-022…DEC-028).
Does it stand — honest, surveillance-free, dignified, and mobile — or does it owe corrections
before the phase closes?

---

## WINDOW W1 — COLD START & STATIC HEALTH

| check | result |
|---|---|
| `validate-subjects.mjs` | **EXIT 0 — ✓ ALL SUBJECTS VALID** (first attempt exited 1 for a tooling reason — `npx tsc` fetched a stub before `npm ci` finished; re-run after deps: clean) |
| `check-subject-imports.mjs` | 4 violations = **the DECLARED false-positive class** (type-only imports in academic-surface · live-chamber · live-stage · subject-shell); count unchanged since DEC-026 — no new violations introduced by Steps 5–6 |
| `check-subject-sql.mjs` | **PASS** — levers sparse/balanced/dense and motion vocabulary match SQL; environment_settings DDL names no identity value |
| `check-breakpoints.mjs` | 3 drifts = **the three DECLARED pre-existing items** (nav-shell 479px · room-layout 900px · enter.tsx 47.99rem); the room-layout 900px drift is the TESTED split threshold (DEC-026) |
| test-next-action | 34/34 |
| test-progress | 16/16 |
| full logic battery | classroom 22/22 · cohort-live 27/27 · live-participant 23/23 · academic-surface 20/20 · settlement 26/26 · signaling 26/26 · progress-record 18/18 |
| `npm run build` | **EXIT 0** — compiled in 11.6 s, 32/32 static pages |

**W1 verdict: PASS.** Static guards report exactly their declared baselines; every logic suite
green; the production build compiles clean.

---

## WINDOW W2 — THE PRIVACY & SURVEILLANCE AUDIT

Harness: `scripts/gate7-privacy-audit.mjs` → baseline `audit/phase7-privacy.json`. Two passes over
267 src files, comments stripped.

**STRICT PASS — the certification.** Fourteen live surfaces (the chamber shell, stage, dock, tile,
controls, academic surface, settlement, room layout, the session hook, transport, types, state
machine, surface-sync, LiveKit config) get ZERO tolerance: facial/gaze tracking, tab/focus
monitoring, idle-dwell tracking, capture/exfiltration, gamification, timers — **0 hits.** The one
recorded exemption is `room-participant.tsx`'s capture family, which is the island's OWN opt-in
button (DEC-024: gated behind an explicit action, nothing leaves the device, no timers — pinned by
test-live-participant 23/23). Timers are never exempt anywhere.

**BROAD PASS — the app-wide sweep.** 31 pattern hits, all on pre-existing Phase 1–6 surfaces, each
hand-read and allowlisted with its audit finding recorded in the harness:

- **visibility listeners** (ambient-stage · motion · subject-switch · two dev previews) pause and
  resume rendering when the tab hides — lifecycle and battery respect; nothing logged, stored, or
  sent;
- **gamification words** are REFUSAL vocabulary (the promise/practice/shell surfaces name
  "streaks, XP, badges, leaderboards" only to ban them), typography specimen copy, or the `Badge`
  UI primitive — a neutral module-status chip, name collision only;
- **localStorage** is the ONE app-level theme preference (`ta-theme`, Phase 2, certified in the
  Phase 6 gate) plus a refusal sentence in choice.tsx ("Nothing persisted: no localStorage…");
- **zero facial, gaze, geolocation, or exfiltration code anywhere.**

**Identities:** a sweep for email-shaped strings found only documented `.example` placeholders
(one already removed from the footer as defect D-06 in 4.8) and dev input placeholders. Test
accounts provision via `scripts/test-account.mjs` with `is_test_account` flags; the classroom data
layer is SELECT-only, names default to monograms when unreadable. **Zero real identities.**

**W2 verdict: PASS.** The brief's four zeroes are proven: zero facial tracking, zero gaze/tab
monitoring, zero dwell timers, zero gamification — zero-tolerance on every surface a student
stands in, audited app-wide.

---

## WINDOW W3 — THE PEDAGOGICAL LEDGER

Harness: `scripts/gate7-ledger-audit.mjs` → baseline `audit/phase7-ledger.json`. **8/8 checks.**

1. **Attend vs Resume is ONE rule with ONE vocabulary.** `record.ts` decides the VERB from facts
   (`attendanceState`: any admissible `session-attended` fact flips attend→resume; it never
   speaks — no sentence strings in the record); the engine's `sessionActionSentence`
   ("Attend the {Subject} session" / "Resume the {Subject} session") speaks it; corporate
   vocabulary stays banned from both. Supporting suite: progress-record 18/18, next-action 34/34.
2. **Settlement dignity.** The settlement surface speaks the ruled sentences (STATE_LANGUAGE 7.5),
   STATES the refusal of notes ("Notes about the student are not kept: the record holds facts,
   never summaries."), and contains no `<select>`, star, rating, survey, feedback or emoji. The
   settle route is POST-only with no GET export (405 by absence), service-role, atomic and
   idempotent by construction. Supporting suite: settlement 26/26.
3. **No rating modal exists anywhere.** App-wide component sweep: no RateSession/RatingModal/
   FeedbackModal/SurveyModal/StarRating/ThumbsVote; no rate-the-session feedback actions; no
   exclamatory copy in the live vocabulary (Step 3 rule holds).

Declared finding (pre-existing since Step 2, not a gate regression): `live-stage.tsx:114` holds a
BYTE-IDENTICAL duplicate of the engine's sentence pair. The verdict is unaffected today; the
duplication is a drift risk and owes a consolidation ruling.

**W3 verdict: PASS.** The ledger reads: attend names attendance, resume names return, settlement
speaks facts and refusals, and no instrument anywhere asks a student or tutor to rate a person.

---

## WINDOW W4 — THE MOBILE & PERFORMANCE PASS

Harness: `scripts/gate7-perf-audit.mjs` → baseline `audit/phase7-performance.json`. **8/8 checks.**

**The chamber at 390px (by construction — no browser in the sandbox; Phase 6 precedent records
baselines and cites them):** below the 900px split, RoomLayout renders ONE plane at a time behind
a real `aria-pressed` toggle ("Chamber" / "Surface"), the decision observed live from
`matchMedia`; no ≥100px fixed element widths in the shell, the layout, or the participant island.
The 900px threshold is the TESTED constant (DEC-026: the brief's sub-768 tab intent is met by the
same mechanism; changing it would break pinned composition without changing behaviour).

**Canvas responsiveness:** `ResizeObserver` re-measures; high-DPI by the device's own
`devicePixelRatio`; geometry normalized to 0..1 (packets carry no pixel truth), and replay
multiplies by the live canvas size — any viewport re-renders the same strokes.

**Client JS payload, MEASURED from the committed production build** (the prerendered rehearsal
mounts the same three islands the production chamber mounts): **5 scripts · 538.4 KB raw ·
165.2 KB gzip** — including the shared framework runtime; the preload link is already counted.
Island discipline pinned: exactly THREE client islands carry the open room (chamber ·
participant · surface); the gate page, the standby stage, and the settlement surface are server
components with zero client JS of their own.

**W4 verdict: PASS.** A phone gets one plane at a time behind a named toggle; strokes re-render at
any size; the payload is measured, not assumed.

---

## WINDOW W5 — PHASE CLOSE & EXCEPTIONS CONSOLIDATION

**Exceptions register (`docs/EXCEPTIONS.md`):** no new product exception — the module gate holds
the classroom staged while `live-classroom` is `in-progress`, so nothing built in Phase 7 can be
encountered half-finished. E-09, E-10 and E-16, assigned to "Phase 7" when the roadmap expected
switch/harness work, are struck and carried forward honestly (Phase 7 built the classroom
instead). Count corrected: the count line was stale (Phase 5); recounted from the table — 26
opened, 7 closed → **19 open.**

### The nine phase-close questions

1. **Did Phase 7 deliver what its steps promised?** Yes. Step 1 schema (0004–0005) + the ruled
   progress record · Step 2 cohort surfaces + staged room + silent class provider (DEC-023) ·
   Step 3 participant interface, opt-in media only (DEC-024) · Step 4 academic surface + one
   stroke protocol over the memory bus (DEC-025) · Milestones 1–5 sessions table, chamber
   machine, live chamber (DEC-026) · Step 5 settlement + progress capture (DEC-027) · Step 6 the
   session channel (DEC-028). Every step closed with its DEC, its suite, and a pushed commit.
2. **Is the classroom surveillance-free by construction?** Yes — and it is now certified by a
   repeatable audit (`gate7-privacy-audit.mjs`): zero-tolerance on the fourteen live surfaces,
   zero unexplained hits across 267 files. No presence/dwell/heartbeat column exists in any
   migration; the data layer is SELECT-only.
3. **Is the pedagogy preserved?** Yes (W3): attend-vs-resume from facts, dignified settlement,
   zero evaluative instruments. The register holds one fact — attendance — and says so verbatim.
4. **Can a student meet something half-built?** No. The room opens only on module-live AND
   credentials AND chamber ACTIVE; today the module is in-progress and the environment lacks
   credentials, so every reachable surface is the staged one (standby sentence, reserved empty
   tile grid) — pinned and smoke-tested (307 / 404 / 200).
5. **Did the schema grow safely?** Yes. 0004–0007: RLS enabled+forced on every table; students
   read by enrolment; tutors read/open by relationship; no student writes; lifecycle is
   service-role; writes register in the P6-R15 settling table or they do not ship. Live apply is
   owed to the credentialed environment.
6. **Did Phase 7 break any pinned surface?** No. Full battery green at every step; the only pin
   changes were DECLARED with reasons (settlement gate narrowing, the channel binding's
   composition, the optional bus) — and W1 re-proves the baselines from cold.
7. **What stands between the scaffold and a real room?** The wiring list, unchanged since
   DEC-023 and now smaller by one item (the session bus seam exists, DEC-028): LiveKit
   credentials + `livekit-server-sdk`, the signed webhook writing `session-attended` rows, the
   carrier the channel seam waits for, live apply of 0004–0007.
8. **What did the sandbox not prove?** No browser here: drawing feel, media walk, and 390px
   visual proof are owed to a browsered environment (construction and pins stand in, per Phase 6
   precedent). No credentials: the settle route answers 503 "Auth not configured" without the
   service key; end-to-end settlement and multi-client acoustic sync are owed likewise.
9. **Does the phase leave debt?** Yes — the ruling list (below), the manual walk, the credentialed
   re-runs, and one consolidation item (the duplicated attend/resume pair, W3 finding).

**W5 verdict: PASS.** Register consolidated honestly, nine questions answered from evidence.

---

## THE DEBT LIST (owed beyond the gate)

1. **Credentialed environment:** live apply of migrations 0004–0007 · end-to-end settlement walk ·
   the RLS/tutor-visibility/credentials harness re-runs (baselines stand in `audit/`).
2. **The wiring step:** LiveKit credentials + `livekit-server-sdk` · signed webhook writer ·
   the carrier the channel seam reads (DEC-023/028) · webhook idempotency key.
3. **Rulings owed:** session END (unlocks Tier 1) · `academicNotes` home (today: refusal) ·
   surface clear-permission · late-packet ordering · keyboard stroke input · tile-grid
   composition when remote participants become facts · test-18 digit-allowlist · the two
   static-guard rulings carried from the Phase 6 gate · the attend/resume pair consolidation.
4. **The manual walk** in a browsered environment: media opt-in, drawing feel, substrate
   legibility, 390px chamber, conclude→settle round trip.

---

## VERDICT

**PHASE 7 IS CERTIFIED.** Five windows, five passes; every measurement recorded above and every
verdict committed under `audit/phase7-*.json`. The classroom stands staged, honest, and
surveillance-free; the door to a live room opens the day the wiring lands — never before.
