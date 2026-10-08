# PHASE 9 GATE REPORT — THE SOCRATIC ENGINE GATE (WINDOWS W1 → W5)

*Run 2026-10-08 on branch `arena/e6e6e569-tutors-academy` (commit `fdfb3b0` → this close-out).
Execution mode: PHASE-CLOSE GATE RUNNER — verification only. Zero new features, surfaces, or
dependencies; the only code added is the gate's own audit harnesses (`scripts/gate9-*.mjs`) whose
verdicts are committed under `audit/`. No product code changed in any window — Phase 9 shipped
clean, so W1 found nothing to remediate. House rules kept: one window at a time, `timeout -k 5`
on every command, servers killed strictly by port. **Rule 18: zero real identities** — every
window ran offline; the credentialed harnesses stand owed with their committed baselines.*

**The question before the gate:** Phase 9 built the Socratic assistance engine — schema,
pedagogical contract, deterministic resolver (Step 1, DEC-033); the student's lens with composer,
guidance cards and persistence seam (Step 2, DEC-034); the tutor's diagnostic mirror with
preparation marks (Step 3, DEC-035). Does it stand — bounded, private, dignified, and light —
or does it owe corrections before the phase closes?

---

## WINDOW W1 — COLD START & STATIC HEALTH

The sandbox re-provisioned at turn start (the sixteenth); recovery was `git fetch` +
`reset --hard origin/arena/e6e6e569-tutors-academy` → `fdfb3b0`, `npm ci` to EXIT 0, then the
window ran from cold.

| check | result |
|---|---|
| `validate-subjects.mjs` | **EXIT 0 — ✓ ALL SUBJECTS VALID** (108 lever combinations) |
| `check-subject-imports.mjs` | **exactly the 4 DECLARED false-positives** of the Phase 7 gate (academic-surface · live-chamber · live-stage · subject-shell, all type-only) — **zero new hits: no remediation needed this gate** |
| `check-subject-sql.mjs` | **PASS** — subject ids, lever density and motion vocabulary match SQL; environment_settings DDL names no identity value |
| `check-breakpoints.mjs` | 3 drifts = **the three DECLARED pre-existing items** (nav-shell 479px · room-layout 900px · enter.tsx 47.99rem); count unchanged |
| test-next-action | 34/34 |
| test-progress | 16/16 |
| test-socratic-logic | 31/31 |
| test-progress-record | 18/18 |
| test-archive-logic | 26/26 |
| test-archive-surface | 16/16 |
| test-archive-viewer | 22/22 |
| test-academic-surface | 20/20 |
| test-milestone-synthesis | 21/21 |
| test-socratic-surface | 19/19 |
| test-socratic-oversight | 15/15 |
| `npm run build` | **EXIT 0** — 34 pages (production build, gate evidence) |

**W1 verdict: PASS.** Every static guard reports exactly its declared baseline; every logic suite
green across Phases 5–9; the production build compiles clean. Unlike the Phase 8 gate (which
remediated a subject-import regression), Phase 9 shipped with zero guard drift — the components
were built guard-clean from the first commit.

---

## WINDOW W2 — THE PEDAGOGICAL BOUNDARY & ANTI-CHATBOT AUDIT

Harness: `scripts/gate9-pedagogy-audit.mjs` → baseline `audit/phase9-pedagogy.json`.
**12/12 checks**, in four groups:

1. **The conversational register (P1–P3).** Twenty-one filler classes swept across all twelve
   Socratic files (comments stripped): "Hey there", "How can I help you today", "Certainly",
   "Great question", "I'd love to help", congratulations-adjacent praise — zero hits. Zero
   exclamation marks in any quoted string; zero emoji. Zero chatbot-widget anatomy (no avatar,
   no bubble, no typing indicator, no launcher); the lens is pinned as a BORDERED REGION
   (`data-socratic-lens`, `--ta-border-subtle`); zero animation vocabulary in all four components.
2. **Anti-auto-answer machinery (A1–A4).** The guidance union is pinned CLOSED — hint, question,
   reference; "answer" is unrepresentable by construction. Fourteen completion-demand markers
   feed ONE deterministic redirect ("the working stays the student's own") — pinned as the only
   path a demand takes. For a known milestone the disciplined question is emitted FIRST
   (question → hint → proof, pinned in the resolution body). Brevity holds end-to-end: the
   composer enforces 300 (maxLength + slice + submit guard, thrice pinned), the contract's 500
   caps every authored text (all re-measured), and the DB mirrors the 500.
3. **The pedagogical truth (E1–E3).** Unknown milestones receive the honest absence — one calm
   sentence, pinned as the only path. The two capability statements stand verbatim and refuse
   what they refuse ("It does not replace your tutor or solve exercises directly" · "nothing on
   this panel scores, rates or flags them"). The prompt-type union is the closed four,
   cross-pinned byte-for-byte against migration 0009's CHECK; `reflection_summary` stays
   deliberately reserved — no guidance kind emits it.
4. **The inherited register (R1–R2).** The archive's words are kept (citation sentence and
   ARTIFACT_WORD wiring pinned); "VOD"/"Replay File"/"Recording Upload" absent. The reward
   register is swept across every surface literal — zero hits; the single word "point" in the
   scaffold map remains the secant's geometric point (the Phase 8 W3 precedent, re-pinned).

Behavioural proofs (the redirect, the honest absence, determinism, the archive-citation rule)
are the suites' — all re-ran green in W1 (logic 31 · surface 19 · oversight 15).

**W2 verdict: PASS.** The engine cannot answer homework by construction, never fills a bubble,
and speaks the discipline of brevity end-to-end.

---

## WINDOW W3 — THE PRIVACY, SURVEILLANCE & GRADING AUDIT

Two passes.

**The archive-specific audit (new harness)** — `scripts/gate9-privacy-audit.mjs` →
baseline `audit/phase9-privacy.json`. **14/14 checks**, in four groups:

1. **The schema's boundaries (S1–S5).** `socratic_exchanges` (0009): RLS enabled AND forced;
   own-student SELECT/INSERT; related-tutor SELECT through the standing predicate; no
   update/delete policies; anon admitted nowhere; grants revoked. `socratic_pins` (0010): RLS
   enabled AND forced; the tutor's SELECT re-decides relatedness on every read; the INSERT
   re-derives the (student, subject) pair from the exchange row itself under 0009's RLS — a
   mark can never name an inquiry its marker cannot read; DELETE own-only; no update (the mark
   stays binary); the unique pair holds; anon nowhere. `is_subject_id` CHECKs both tables; zero
   engagement columns in either DDL; payloads bounded (inquiry ≤500 · milestone ≤128 ·
   payload ≤16 KB).
2. **Zero surveillance, zero grading (B1–B3).** Eighteen surveillance classes swept across all
   twelve Socratic files — idle, dwell, gaze, keystroke, time-on-task, attention score,
   engagement… — zero hits. Twenty grading/diagnosis classes swept — sentiment, mood,
   frustration, comprehension, difficulty, percentile, diagnosis… — zero hits; the ONE place the
   word "scores" stands is the refusal of scoring itself. Zero clock reads, zero timers, zero
   telemetry anywhere in the engine — instants render from stored ISO words alone. (One harness
   false-positive resolved on first run and declared: "amplitude" is the specimen physics
   question's vocabulary, not a telemetry vendor.)
3. **Subject isolation in logic (C1–C4).** Cross-subject milestone keys resolve to null; the
   citation filter sees only the prompt's own subject. All three readers spell their boundaries
   (`subject_id`, and the oversight's `student_id` join key); no signature carries a userId or
   tutorId. Both server actions re-decide identity from the cookie session (student for the
   reflection, tutor for the mark) and the toggle READ-VERIFIES the boundary pair before any
   write. The surfaces are guard-clean; the panel's `studentId` feeds the mark's write and
   renders nowhere (declared join key, P6-R2).
4. **Honest failure, dormant surfaces (D1–D2).** Invisible and refused are the same answer;
   the composer speaks the closed vocabulary of calm sentences, verbatim; the toggle fails
   silent in every branch. No client → honest empty; failed read → absent region; empty
   overview → no DOM; the rehearsal 404s in production.

**The standing app-wide audit** — `gate7-privacy-audit.mjs`: **PASS over 296 src files**
(rebaselined from 284 at the Phase 8 gate — the twelve new Phase 9 files, declared; zero new
findings; the allowlisted broad-pass findings remain the pre-existing Phase 1–7 classes).

**Rule 18 compliance:** the window created no identities anywhere — every check is textual over
committed migrations and source; the credentialed live-RLS harnesses (`test-tutor-visibility.mjs`,
`test-rls.sh`) stand owed with their baselines, unchanged.

**W3 verdict: PASS.** Zero sentiment tracking, zero psychological profiling, zero difficulty
scoring — proven structural in the schema and swept in the vocabulary; strict subject isolation
holds in SQL and in logic alike.

---

## WINDOW W4 — THE MOBILE & PERFORMANCE PASS

Harness: `scripts/gate9-perf-audit.mjs` → baseline `audit/phase9-performance.json`. **11/11
checks.** No browser stands in the sandbox — the Phase 6–8 precedent records baselines and cites
them; construction proves what construction proves, and the build is measured.

**The surfaces at 390px, by construction:**
- the lens panel is a padded flex column with a wrapping header — one fluid region, zero fixed
  widths (M1); the guidance card is a rail plus a fluid body under the reading measure (M3);
- the composer's select and field cap at 100% with a wrapping control row — no pixel-fixed
  inputs (M2); the input constraints hold: maxLength + slice + counter, and both controls are
  NATIVE (the platform renders them on a phone) (M5);
- the oversight panel stacks the same way, and its mark is a `ta-btn sm` — min-height
  `max(2.75rem, var(--ta-control-h))` ≥ 44px, the touch floor proven from globals.css (M4).

**The clock discipline:**
- the composer island holds zero timers, zero rAF, zero effects — it re-renders only on input;
  nothing ticks at rest (P1);
- server-first: the composer is the SOLE client island; the lens, the card, the oversight panel
  and the relationship surface render server-side, and the preparation mark is a PLAIN FORM —
  the oversight ships zero client JavaScript (P2);
- zero transitions, animations or transforms in all five components (P3).

**Client payload, MEASURED from the committed production build** (the prerendered rehearsal
mounts the same islands the production lens mounts): **6 scripts · 538.6 KB raw · 165.9 KB
gzip** — including the shared framework runtime. All six chunks are SHARED with the archive
rehearsal (verified by set comparison): the Socratic island carries **zero dedicated load-time
bundle** — it rides the platform's shared chunks, and the number is measured, not assumed (B1–B2).
The oversight panel's import surface is app-internal and dependency-light: no third-party, no
database client in the component (B3).

**Declared findings (recorded in the baseline, not blocking):**
- the 390px VISUAL walk of the lens and the panel is owed to a browsered environment
  (construction pins stand in, per the Phase 6–8 precedent);
- the relationship-baseline re-pin (the declared statement evolution, DEC-035) is owed with the
  DEC-030 baseline debt.

Three harness defects were corrected on first run, each verified against the build before the
check moved (the `_next`→`.next` path mapping; `textTransform` typography mistaken for paint
work; relative imports mistaken for third-party). No product drift was found.

**W4 verdict: PASS.** A phone gets one fluid region, native inputs and touch-sized marks; the
island's clock is disciplined; the payload is measured from the build.

---

## WINDOW W5 — PHASE CLOSE & LINEAGE CONSOLIDATION

**Exceptions register (`docs/EXCEPTIONS.md`):** **no new product exception.** Nothing Phase 9
built can be met half-finished: the lens and the panel speak only where real rows stand, and the
schema that holds them (0009–0010, with 0004–0008) is unapplied in the project DB — today the
reads fail and both surfaces render nothing (the isolate posture); the composer cannot write
without the schema; `ai-assistant` stays `planned` in the registry (facts-gated lens, the
DEC-008 precedent — no homepage drift); the rehearsal 404s in production. Two declared
evolutions, both recorded, neither an exception: the slot map's `ai-assistance` gate (DEC-034)
and the relationship statement (DEC-035, re-pin owed). Count unchanged: **19 open.**

### The nine phase-close questions

1. **Did Phase 9 deliver what its steps promised?** Yes. Step 1 the schema, the pedagogical
   contract and the deterministic engine (DEC-033) · Step 2 the lens, the composer, the guidance
   cards, the persistence seam and the workspace integration (DEC-034) · Step 3 the diagnostic
   mirror, the preparation marks and both visibility documents (DEC-035). Every step closed with
   its DEC, its suite and a pushed commit; the gate closes the phase.
2. **Is the engine pedagogically bounded?** Yes — proven by W2's 12 checks: "answer" is
   unrepresentable in the guidance union; completion demands redirect, never answered;
   questions lead; brevity holds end-to-end (300 composer < 500 contract = DB); unknown
   milestones receive the honest absence; zero filler, zero exclamation, zero widget anatomy.
3. **Is it a mirror, never a wiretap?** Yes — proven by W3: zero surveillance vocabulary, zero
   grading vocabulary, zero clock or timer; the schema holds no evaluative column; the only
   write anywhere is the tutor's own binary preparation mark; the inquiry stands as asked.
4. **Is subject isolation structural?** Yes — proven twice: in SQL (RLS forced on both tables,
   `is_subject_id` CHECKs, the pin's pair re-derived from the exchange under 0009's RLS) and in
   logic (cross-subject keys and foreign artifacts resolve to nothing; every reader spells its
   boundary; identity rides the cookie alone).
5. **Did the schema grow safely?** Yes. 0009–0010 carry the established posture forward: RLS
   enabled+forced, occurrences never updated, anon nowhere, payloads bounded. Live apply is owed
   to the credentialed environment with 0004–0008.
6. **Did Phase 9 break any pinned surface?** No. The full battery ran green at every step and
   again at W1 — including every Phase 5–8 suite. TWO declared evolutions, both recorded:
   the environment slot map's `ai-assistance` entry moved to gate "facts" (the DEC-008
   precedent; the module stays `planned` — zero homepage drift), and the relationship surface's
   statement sentence evolved to name preparation (DEC-035; the 6.3 browsered baseline re-pin
   stands owed with the DEC-030 debt). The placement view, the levers, the archive and the
   chronology are untouched — their suites re-ran green.
7. **What stands between the engine and real exchanges?** The live apply of migrations
   0004–0010 in the credentialed environment. The day they stand, the lens and the mirror wake
   with ZERO edits: the student's own INSERT writes the exchange, the related tutor reads it,
   the mark lands. The provider-backed capability ruling decides the registry flip — until then
   the deterministic engine is honestly named in the module summary.
8. **What did the sandbox not prove?** No credentials: no rows exist, so the populated-lens
   walk (a real exchange round-trip), the populated-oversight walk (a marked inquiry) and the
   live-RLS harness re-runs are owed to the credentialed environment (baselines stand committed).
   No browser: the 390px visual walk and the relationship-baseline re-pin are owed likewise
   (construction pins stand in).
9. **Does the phase leave debt?** Yes — the list below.

**W5 verdict: PASS.** Register consolidated honestly (19 open, unchanged), nine questions
answered from evidence, lineage recorded in DEC-033…DEC-036 and STATE_LANGUAGE 9.1–9.3.

---

## THE DEBT LIST (owed beyond the gate)

1. **Credentialed environment:** live apply of migrations 0004–0010 · the populated-lens walk
   (a real exchange round-trip through the student's own INSERT) · the populated-oversight walk
   (a marked inquiry, withdrawn and re-marked) · the RLS and tutor-visibility harness re-runs
   (baselines stand in `audit/`) · the environment/tutor baseline re-pins (DEC-030 debt,
   carried) · the relationship-baseline re-pin (DEC-035 declared).
2. **The browsered manual walk:** the lens at 390px · the composer's native controls on a
   phone · the panel beneath the arc · the rehearsal's round-trip with real rendering.
3. **The capability ruling:** the provider-backed assistant (when the owner is ready) decides
   the `ai-assistant` registry flip; until then the deterministic engine stands honestly named.
4. **Rulings inherited unchanged:** the two static guards (Phase 6) · the homepage tagline ·
   the co-teacher grant refusal · the Phase 7 rulings (session END, clear-permission, keyboard
   stroke input, late-packet ordering, tile-grid composition) · the artifact writer and
   live-classroom's `live` flip (Phase 8 debt) · the attend/resume pair consolidation.

---

## VERDICT

**PHASE 9 IS CERTIFIED.** Five windows, five passes: W1 cold start (every guard at its declared
baseline — zero remediation needed; full battery green, build clean) · W2 the pedagogical
boundary (12/12 — answers unrepresentable, demands redirected, filler absent) · W3 privacy,
surveillance & grading (14/14 + the app-wide re-run over 296 files — zero tracking, zero
scoring, isolation structural) · W4 mobile & performance (11/11 — fluid by construction, zero
timers, payload measured: 165.9 KB gzip on shared chunks) · W5 close (19 exceptions open, nine
questions answered). Every verdict is committed under `audit/phase9-*.json`; the full lineage
stands in DEC-033…DEC-036 and STATE_LANGUAGE 9.1–9.3. The engine waits for its schema —
bounded, private, and dignified — and opens the day the migrations land.
