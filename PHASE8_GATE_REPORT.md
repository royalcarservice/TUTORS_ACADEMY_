# PHASE 8 GATE REPORT — THE ARCHIVE GATE (WINDOWS W1 → W5)

*Run 2026-10-08 on branch `arena/e6e6e569-tutors-academy` (commit `9e27b7b` → this close-out).
Execution mode: PHASE-CLOSE GATE RUNNER — verification only. Zero new features, surfaces, or
dependencies; the only code added is the gate's own audit harnesses (`scripts/gate8-*.mjs`) whose
verdicts are committed under `audit/`, and one W1 remediation of a Phase 8 regression the cold
start caught (recorded below, not a feature). House rules kept: one window at a time,
`timeout -k 5` on every command, servers killed strictly by port. **Rule 18: zero real
identities** — every window ran offline; the credentialed harnesses stand owed with their
committed baselines.*

**The question before the gate:** Phase 8 built the session archive (Steps 1–4, DEC-029…DEC-032) —
schema, shelf, viewer with the vector replay engine and the restrained media player, and the
milestone synthesis. Does it stand — private, truthful, dignified, and light — or does it owe
corrections before the phase closes?

---

## WINDOW W1 — COLD START & STATIC HEALTH

The sandbox re-provisioned at turn start (the twelfth); recovery was `git fetch` +
`reset --hard origin/arena/e6e6e569-tutors-academy` → `9e27b7b`, `npm ci` to EXIT 0, then the
window ran from cold.

| check | result |
|---|---|
| `validate-subjects.mjs` | **EXIT 0 — ✓ ALL SUBJECTS VALID** (108 lever combinations) |
| `check-subject-imports.mjs` | cold start: **10 violations — 6 were Phase 8 regressions** (below, remediated); after: exactly the **4 DECLARED false-positives** of the Phase 7 gate — baseline restored |
| `check-subject-sql.mjs` | **PASS** — subject ids, lever density and motion vocabulary match SQL; environment_settings DDL names no identity value |
| `check-breakpoints.mjs` | 3 drifts = **the three DECLARED pre-existing items** (nav-shell 479px · room-layout 900px · enter.tsx 47.99rem); count unchanged |
| test-next-action | 34/34 |
| test-progress | 16/16 |
| test-progress-record | 18/18 |
| test-archive-logic | 26/26 |
| test-archive-surface | 16/16 |
| test-archive-viewer | 22/22 |
| test-milestone-synthesis | 21/21 |
| test-academic-surface | 20/20 |
| `npm run build` | **EXIT 0** — 33 pages (production build, gate evidence) |

**The W1 remediation (a correction, not a feature).** The import guard's cold read found six
violations Phase 8 itself introduced: four type-only `Density` imports from
`@/lib/subjects/subjects` in the archive islands (the same class as the Phase 7 declared
false-positives) and two RUNTIME `getSubject` calls in components (`student/slots.tsx`,
`tutor/record.tsx`) — genuine departures from the 3.1 rule. Remediated on the spot: the islands
now take `Density` from the motif grammar's own types (`@/lib/motif/types` — zero guard hits,
values identical); the tutor record region receives the subject name from the route; the student
slot resolves names through the shell's sanctioned display seam (`shellSubjectInfo`). The guard
re-read exactly its declared 4-FP baseline; tsc clean; every suite re-ran green. Nothing about
the surfaces' behaviour moved.

**W1 verdict: PASS.** Static guards report exactly their declared baselines after the remediation;
every logic suite green; the production build compiles clean.

---

## WINDOW W2 — THE PRIVACY & ISOLATION AUDIT

Two passes.

**The standing app-wide audit** — `gate7-privacy-audit.mjs`: **PASS over 284 src files** (282 at
the Step 4 close + the two Step 4 modules), comments stripped. Zero hits on any archive island;
the allowlisted broad-pass findings remain the pre-existing Phase 1–7 classes (visibility
listeners for battery respect, refusal vocabulary, the `ta-theme` preference, the `Badge`
primitive's name). The strict live-surface tolerance still reads zero.

**The archive-specific audit (new harness)** — `scripts/gate8-archive-audit.mjs` →
baseline `audit/phase8-archive.json`. **16/16 checks**, in five groups:

1. **RLS on the archive's table.** `session_artifacts`: RLS enabled AND forced; reads admit ONLY
   the enrolled-student and related-tutor policies; writes belong to the session's OPENING tutor
   alone (`tutor_id = auth.uid()` through the standing EXISTS); no update/delete policies; no
   policy admits anon.
2. **The bucket is private by construction.** ONE bucket `session-artifacts`, `public: false`;
   one authenticated SELECT policy on `storage.objects`, scoped to the bucket, deferring to the
   standing predicates with the subject read from the path's first segment; no anon, no client
   upload policy.
3. **Cross-subject isolation is structural.** The composite foreign key
   `(subject_id, session_id) → cohort_sessions(subject_id, id)` makes cross-subject artifacts
   unrepresentable; `storage_path` is unique; the path convention is built once and the parser
   refuses traversal and wrong arity; `progress_record` is forced-RLS with own-read + the
   standing related-tutor predicate, no anon, no client writes.
4. **The data layer: RLS first, signature second, honesty always.** The shelf spells the subject
   on every query and is SELECT-only with no service-role import; signing happens ONLY after the
   row proves visible, through the service client, degrading to `unsigned` on any failure;
   INVISIBLE and UNKNOWN are the SAME null in the reader and the server action; the signed
   windows are named and bounded (60 s consume-at-once · 900 s listening ≤ 1800) and follow the
   kind; the synthesis reader spells whose record and which subject on ALL THREE of its reads,
   and answers the honest empty without an identity.
5. **The surfaces admit nobody without an identity.** The route doors visitors before any data
   and answers unknown subjects with the framework 404; the viewer fetches ONLY signed URLs and
   states the unsigned case in one calm sentence; the schema and the layer carry ZERO engagement
   vocabulary — a counter column cannot exist.

Three harness corrections were made on first run, each verified against the source before the
regex moved (aliased predicates in the insert policy; the bucket INSERT's real syntax; the
composite-unique living in 0008 before the FK that needs it; honesty comments read from the
unstripped file). No product drift was found.

**Rule 18 compliance:** the window created no identities anywhere — every check is textual over
committed migrations and source; the credentialed live-RLS harnesses (`test-tutor-visibility.mjs`,
`test-rls.sh`) stand owed with their baselines (`audit/tutor-visibility.json`, the rls_test
record).

**W2 verdict: PASS.** Strict subject isolation is proven structural, RLS is the only boundary,
and no public or unauthenticated path reaches an artifact.

---

## WINDOW W3 — THE PEDAGOGICAL TRUTH & LANGUAGE AUDIT

**The language audit (new harness)** — `scripts/gate8-language-audit.mjs` →
baseline `audit/phase8-language.json`. **11/11 checks** over fifteen archive surfaces
(comments stripped — they legitimately name the banned words in refusal sentences):

- **BANNED archive vocabulary absent:** "VOD" · "Replay File" · "Recording Upload" appear nowhere
  in code or copy.
- **The commercial register is absent:** no recommendation, trending, subscription, sharing,
  playlist, related-video or up-next machinery; **no autoplay anywhere**; the media element
  preloads metadata only.
- **The shelf's register holds:** no duration badge, no thumbnail feed, no counts on the shelf,
  the card or the page.
- **Zero engagement vocabulary everywhere** — with the declared refusal-vocabulary allowance:
  `artifact.ts` NAMES the banned words in `BANNED_ENGAGEMENT_WORDS` so the gate can sweep them;
  the sweep removes the list and finds nothing else. The schema carries no counter column.
- **No gamified progress wherever a milestone is spoken** — with the declared geometric
  allowance: the replay engine speaks stroke POINTS (coordinates), so the reward class is
  carried by the unambiguous words (badge/unlock/XP/level-up/streak/trophy/medal/leaderboard/
  congratulations) — zero hits. The composer's output fields are swept: no ratio, percent,
  score, rank, grade or composite; every entry names its row.
- **The REQUIRED vocabulary stands VERBATIM:** the three archive words in the seam and the card;
  "Conceptual Arc" · "Milestone Reached" · "Substantiated by" · "Your Milestone Record in
  {Subject}" · "Milestones co-certified" in the chronology; the viewer's four calm sentences.
- **No exclamation marks in any quoted copy** — with the declared PostgREST allowance
  (identifier!identifier embed syntax is query grammar, not exclamation) — and no emoji anywhere.

**The standing ledger audit** — `gate7-ledger-audit.mjs`: **8/8 PASS** (attend-vs-resume rule,
corporate vocabulary ban, settlement dignity, no rating instrument anywhere).

**W3 verdict: PASS.** The archive reads like a library: zero commercial buzzwords, zero vanity
counters, zero gamified progress; the milestone word speaks chronology, never reward.

---

## WINDOW W4 — THE MOBILE & PERFORMANCE PASS

Harness: `scripts/gate8-perf-audit.mjs` → baseline `audit/phase8-performance.json`. **11/11
checks.** No browser stands in the sandbox — the Phase 6/7 precedent records baselines and cites
them; construction proves what construction proves, and the build is measured.

**The archive at 390px, by construction:**
- the card grid is `repeat(auto-fill, minmax(min(16rem, 100%), 1fr))` — one column on a phone,
  never an overflow;
- the viewer drawer is `min(60rem, 100%)`, padded, internally scrollable;
- every control row wraps and every control meets the `--ta-target-primary` touch token;
- no archive island fixes a width above 16rem (the drawer's 60rem is a max via `min()`);
- the board is fluid geometry: a 16/10 aspect box, an absolute inset canvas, strokes normalized
  0..1 — any viewport re-renders the same record.

**The replay engine's clock discipline:** `requestAnimationFrame` runs ONLY while playing and is
cancelled on stop/unmount; ZERO timers in any island — nothing ticks at rest; high-DPI by the
device's own ratio (capped at 3) with one ResizeObserver, disconnected on cleanup; the frame is
the pure module's word (`replayFrame`), and the opening state is the static board — no motion
unasked (the reduced-motion posture).

**Client payload, MEASURED from the committed production build** (the prerendered rehearsal mounts
the same islands the production cards mount): **5 scripts · 538.4 KB raw · 165.2 KB gzip** —
including the shared framework runtime. The archive's and the chamber's rehearsals resolve to the
same five shared turbopack chunks (verified by set comparison): the islands ride the platform's
shared bundle, and the number is measured, not assumed. The shelf itself ships NO client
JavaScript: the page, the shelf, the card and the chronology are server components — the only
client bridges are the opener island (which mounts the viewer on demand) and the rehearsal's
direct island mounts.

**Declared findings (recorded in the baseline, not blocking):**
- `canvas-replay` reads the stroke palette from `getComputedStyle` once per drawn frame (the live
  surface caches it); one computed-style read on one element beside the stroke drawing itself —
  consolidation owed with the first measured frame budget in a browsered environment;
- 390px VISUAL proof is owed to a browsered environment (construction pins stand in, per the
  Phase 6/7 precedent).

**W4 verdict: PASS.** A phone gets one column and a fluid drawer; the replay engine's clock is
disciplined; the payload is measured from the build.

---

## WINDOW W5 — PHASE CLOSE & LINEAGE CONSOLIDATION

**Exceptions register (`docs/EXCEPTIONS.md`):** **no new product exception.** The archive can
never be met half-finished: it speaks only where real rows stand, and the ONLY capability that
can write them (the service-role artifact writer) is unwired — so every reachable state today is
an honest, pinned absence (the empty shelf sentence; the opener that mounts nothing; the
synthesis dormant under the registry gate while `live-classroom` is `in-progress`). Nothing built
in Phase 8 asserts a fact the record does not hold. E-09/E-10/E-16 remain struck as the Phase 7
gate recorded them; E-07 (legal/DPDP) still blocks real students. **Count unchanged: 19 open.**

### The nine phase-close questions

1. **Did Phase 8 deliver what its steps promised?** Yes. Step 1 the schema, the private bucket
   and the pure seam (DEC-029) · Step 2 the archive route, the shelf, the card and the doors
   (DEC-030) · Step 3 the viewer, the vector whiteboard replay engine, the restrained media
   player and the open-time signed seam (DEC-031) · Step 4 the milestone synthesis joining the
   record to its artifacts (DEC-032). Every step closed with its DEC, its suite and a pushed
   commit; the gate closes the phase.
2. **Is the archive private by construction?** Yes — proven by W2's 16 checks: RLS enabled and
   forced; reads by enrolment or active relationship; writes by the session's opening tutor
   alone; one PRIVATE bucket with one authenticated objects policy; anon admitted nowhere;
   cross-subject artifacts unrepresentable (composite FK); invisible and unknown are the same
   null; signed URLs are bounded, scoped and minted only at open time, after visibility.
3. **Does it read like a library, never a feed?** Yes — proven by W3: the banned archive
   vocabulary, the commercial register, autoplay, duration badges, thumbnail feeds and every
   engagement word are absent; the required vocabulary stands verbatim; the chronology speaks
   dated facts with evidence, never scores, badges or ranks.
4. **Can a student meet something half-built?** No. Without artifacts the shelf is the honest
   empty sentence; the opener mounts nothing; the viewer states absence calmly; the synthesis
   renders no DOM. Every state is pinned by a suite and smoke-tested (rehearsal 200 · visitor
   307 · bogus 404).
5. **Did the schema grow safely?** Yes. 0008: RLS enabled+forced; the three artifact kinds a
   closed CHECK; the composite FK and unique storage path; metadata capped at 16 KB; no
   update/delete; no client writes anywhere (progress_record and cohort_sessions hold the same
   posture). Live apply is owed to the credentialed environment with 0004–0007.
6. **Did Phase 8 break any pinned surface?** No. The full battery ran green at every step and
   again at W1; the only pin movements were DECLARED with reasons (the quadraticCurveTo pin
   relocated to the shared renderer; Step 2's owed-playback sentence discharged by the wiring;
   the achievements map entry filled by the owner's ruling). W1's one correction was the
   subject-import regression, remediated inside the window and recorded above.
7. **What stands between the archive and real artifacts?** The writer: a service-role capability
   that snapshots the board at conclusion, stores the notation and the chamber audio — the only
   code path that may write. Then live apply of 0008, and `live-classroom`'s `live` flip
   (the carrier wiring, DEC-023/028) which makes `session-attended` admissible for the arc and
   the chronology.
8. **What did the sandbox not prove?** No credentials: no rows exist, so signed-URL fetches,
   a populated shelf, real media playback and a populated chronology are owed to the credentialed
   environment (harness baselines stand committed). No browser: 390px visual proof, pan/zoom
   feel and playback smoothness are owed likewise (construction pins stand in). The
   tutor-visibility and RLS harnesses re-run there.
9. **Does the phase leave debt?** Yes — the list below: the writer, the credentialed walks, the
   declared baseline re-pins (DEC-030), the palette-per-frame consolidation, and the rulings
   inherited from the Phase 6/7 debt lists.

**W5 verdict: PASS.** Register consolidated honestly (19 open, unchanged), nine questions
answered from evidence, lineage recorded in DEC-029…DEC-032 and STATE_LANGUAGE 8.1–8.3.

---

## THE DEBT LIST (owed beyond the gate)

1. **Credentialed environment:** live apply of migrations 0004–0008 · the populated-shelf +
   signed-playback + populated-chronology walks · the environment/tutor baseline re-pins
   (declared, DEC-030) · the identity-matrix re-pins for the archive route · the RLS and
   tutor-visibility harness re-runs (baselines stand in `audit/`).
2. **The artifact writer (service role):** the board snapshot at conclusion · the notation ·
   the chamber audio — the only capability that can give the shelf its objects; the settle
   route's `session-attended` facts feed the chronology the day sessions conclude for real.
3. **The wiring step:** LiveKit credentials + `livekit-server-sdk` · the carrier the channel
   seam waits for (DEC-023/028) · `live-classroom`'s `live` flip — which wakes the
   `session-attended` kind for the arc and the synthesis.
4. **The manual walk in a browsered environment:** 390px shelf and drawer · replay pan/zoom and
   playback smoothness · the palette-per-frame consolidation (W4 finding) · media playback on a
   real signed URL.
5. **Rulings inherited unchanged:** the two static guards (Phase 6) · the homepage tagline ·
   the co-teacher grant refusal · the surface rulings carried from Phase 7 (session END,
   clear-permission, keyboard stroke input, late-packet ordering, tile-grid composition) ·
   the attend/resume pair consolidation.

---

## VERDICT

**PHASE 8 IS CERTIFIED.** Five windows, five passes: W1 cold start (baselines restored after one
remediated regression, full battery green, build clean) · W2 privacy & isolation (16/16,
RLS the only boundary, anon nowhere) · W3 truth & language (11/11 + ledger 8/8, zero commercial
or gamified register) · W4 mobile & performance (11/11, payload measured: 165.2 KB gzip) · W5
close (19 exceptions open, nine questions answered). Every verdict is committed under
`audit/phase8-*.json`; the full lineage stands in DEC-029…DEC-032. The archive waits for its
writer — honest, private, and dignified — and opens the day the first real artifact lands.
