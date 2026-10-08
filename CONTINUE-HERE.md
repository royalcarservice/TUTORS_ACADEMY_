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

1. **PHASE 8 IS UNDER WAY.** Step 1 done (2026-10-08, DEC-029): the archive's foundation —
   migration 0008 creates `session_artifacts` (board snapshot · pedagogical notes · recording, a
   closed three; one row belongs STRICTLY to one session of one subject — a composite foreign key
   into `cohort_sessions(subject_id, id)` makes crossing the boundary unrepresentable;
   storage_path unique; metadata capped at 16 KB) and the PRIVATE `session-artifacts` bucket with
   one authenticated SELECT policy deferring to the standing predicates — uploads and lifecycle
   stay service-role, anon admitted nowhere. The SELECT-only data layer (classroom posture: no
   userId — RLS is the only boundary): concluded sessions newest-first with their artifacts
   (`fetchSubjectArchive`); details sign a 60-second bearer URL through the service client only
   after the row proves visible, degrading to `unsigned` without credentials — invisible and
   unknown are the SAME null (`fetchArtifactDetails`). Pure seam `src/lib/archive/artifact.ts`
   (classification · path convention · isolation predicate · the visibility mirror, provable
   offline); zero engagement metrics by construction (no counter column exists; the banned
   vocabulary swept). Verified: archive-logic 19/19 (new) · full battery green · both gate-7
   audits still PASS · validate-subjects · check-subject-sql · tsc · build exit 0. Reconciliations
   recorded in DEC-029: numbered 0008 not the brief's 0005 (cohorts owns it) · the subject "FK" is
   the `is_subject_id` CHECK (E-13) · `is_related_tutor(auth.uid(), …)` cannot stand as written
   (DEC-026 verbatim) — the tutor READS by relationship, WRITES only into sessions they opened.
   **No surface ships with Step 1 and `recorded-classes` stays `planned`** (E-26 posture). Live
   apply of 0008 joins 0004–0007 in the credentialed environment.
   **Step 2 done (2026-10-08, DEC-030):** the archive SURFACE — `/subjects/[subject]/archive`
   carries the live chamber's gate unchanged (visitor → login door with `next`; enrolment /
   relationship decide; everyone else the SAME 404 an unknown subject gets — no enumeration) and
   renders server-complete with zero client JS; the archive read is PRIMARY (a failed read fails
   the page honestly). The shelf reads like a library (ordered, most recent first; date · title ·
   the tutor only when the boundary allows; the brief's empty sentence verbatim) and the card
   speaks the archive's own words — Board Record · Session Notation · Chamber Audio ("VOD" ·
   "Replay File" · "Recording Upload" banned and swept); the board's preview is a short signed
   URL when the service key stands, chamber audio states its owed playback calmly. Doors: the
   `recordings-notes` shell region filled through the documented fill point (the slot contract's
   one declared growth — the shell hands a slot its subject) and one quiet `ArchiveLink` per
   tutor subject group; the relationship surface stays untouched (P6-R10). Declared: the
   recordings-notes region's visitor HTML changes — environment/tutor baseline re-pins owed
   (P6-R17 precedent). Verified: archive-surface 16/16 (new) · full battery green · both gate-7
   audits PASS (273 files) · tsc · build 0 · smoke (visitor 307 · bogus 404 · environment 200).
   **Step 3 done (2026-10-08, DEC-031):** the ARTIFACT VIEWER & VECTOR WHITEBOARD REPLAY ENGINE —
   the scholarly review mode. Each card carries ONE quiet opener island; it lifts the artifact
   into a real dialog (date · kind · session title · subject mark; Escape/backdrop/Close depart;
   focus enters on open, returns to the handle on close). Board records replay through
   `canvas-replay.tsx` on the subject's own motif — the Phase 7 StrokePacket vocabulary verbatim,
   two modes by pressed buttons: BOARD (whole record; pan by arrow keys, zoom by +/−/Reset
   buttons — keyboard first) and PLAYBACK (recorded order along one scrubber; rAF only while
   playing). The fluid line + token palette live ONCE in `stroke-render.ts`, which the live
   surface and the replay both consume; records read back through surface-sync's own
   validatePacket + applyPacket (one bad entry refuses the whole). The static board is the
   opening state for every reader — reduced motion honored by default. Chamber audio plays in a
   native HTML5 player: play/pause, MM:SS scrubber, 1.0 · 1.25 · 1.5 (never pitched),
   volume/mute; no autoplay, no up-next, nothing recommended, nothing to share. Bytes arrive
   only by signed URL minted at open time through one `"use server"` action over the standing
   fetchArtifactDetails; the window follows the kind (records 60 s · audio 900 s). Declared:
   Step 2's owed-playback sentence discharged · the quadraticCurveTo pin relocated to the
   renderer. Verified: archive-viewer 22/22 (new) · archive-logic 26/26 · archive-surface 16/16 ·
   academic-surface 20/20 · next-action 34 · progress 16 · validate-subjects · check-subject-sql ·
   tsc · build 0 (33 pages) · smoke (rehearsal 200 math+physics · visitor 307 · bogus 404) ·
   gate-7 privacy PASS (282 files, zero island hits) · ledger 8/8. Proven in
   `/dev/archive-rehearsal` (404 in production) — the sandbox holds no artifacts; STATE_LANGUAGE
   8.2 speaks the viewer's sentences.
   **Next:** the archive's WRITER (service role: the board snapshot at conclusion, the notation,
   the chamber audio) — the shelf has its reader; it still owes its objects — then a
   populated-shelf + signed-playback verification in the credentialed environment.
2. **PHASE 7 IS CERTIFIED (2026-10-08).** The Live Classroom Gate (W1–W5) ran to verdict —
   `PHASE7_GATE_REPORT.md` at the repo root; baselines committed under `audit/phase7-*.json`
   (privacy · ledger · performance). Five windows, five passes: cold start & static health ·
   the privacy & surveillance audit (zero-tolerance on the fourteen live surfaces, zero
   unexplained hits app-wide, zero real identities) · the pedagogical ledger (attend-vs-resume,
   settlement dignity, no rating instrument anywhere) · mobile & performance (one plane at a
   time below 900px, normalized canvas, payload measured) · phase close (exceptions consolidated
   — 19 open, count corrected and declared; nine phase-close questions answered). The debt list
   stands in the report's final section. **Steps 1–6 done (DEC-022…DEC-028):** `progress_record` applied · the
   first reader's policies (0006) + staged `/live` surface + silent `class` provider · the
   participant interface (opt-in local media) · the shared academic surface (canvas, motif
   substrate, one stroke protocol over the in-memory bus). **MILESTONES 1–4 OF THE AUTONOMOUS
   RUNNER done (2026-10-08, DEC-026):** migration 0007 creates `cohort_sessions` (the
   session-of-record; settles DEC-009's referent question in shape — `ref_id` names a session row;
   FK deferred because the column is polymorphic); the pure chamber state machine
   (STANDBY→ACTIVE→SETTLING→CONCLUDED, 15-minute settling window) + the classroom SELECT-only data
   layer; `/live` pivots its session facts to `cohort_sessions` and opens on ACTIVE-or-SETTLING;
   the `live-chamber.tsx` client shell (status bar + the tested RoomLayout composition) with the
   brief's superseded standby sentence; `participant-dock.tsx` + `chamber-controls.tsx` +
   `classroom/use-surface-sync.ts` (the last two are bridge re-exports — one implementation, two
   names). **STEP 5 done (2026-10-08, DEC-027):** the lifecycle closes — the settle route
   (`/live/settle`, POST-only, service-role writes, standing by RLS) concludes a session with ONE
   atomic guarded UPDATE and then records one `session-attended` fact per enrolled student
   (ref_id = the session row, idempotent); the dignified `session-settlement.tsx` renders the
   student's closing sentence and the tutor's confirm/confirmation; the open room narrows to ACTIVE
   (SETTLING/CONCLUDED show the settlement); conclusion unmounts the room, so nothing of the
   session lingers on the device. Notes about a student are NOT kept (P5-R6) and the surface says
   so; `milestoneKey` validates against STEP_EVIDENCE and is stored nowhere (the arc derives its
   position from facts). The write is in the P6-R15 settling table. **STEP 6 done (2026-10-08,
   DEC-028):** the session channel — one closed vocabulary (`PRESENCE_UPDATE` · `CANVAS_STROKE` ·
   `STAGE_STATE` over one envelope; the stroke IS the adjudicated SurfacePacket, the stage words
   round-trip with the chamber machine), isolation STRUCTURAL (room = `subject:session`, wrong-room
   signals refused at the door), the 16 KB byte budget rejects with a named defect, the memory
   transport delivers synchronously to the whole room including the sender, and `chooseTransport`
   names the LiveKit seam (DEC-023 — no carrier dependency). The hook seeds presence with the local
   participant alone, the island reports speaking/video facts through an OPTIONAL tap, the tutor
   alone holds the lifecycle word, cleanup unsubscribes completely — zero telemetry vocabulary,
   swept. The chamber binds it all: the banner word rides the channel (server word seeds — zero
   hydration drift), the presence line names who the room knows, the surface draws on the session's
   OPTIONAL bus, and a concluded signal closes the workspace calmly. The whole room rehearses at
   `/dev/live-stage` — settlement variants AND the signaling rehearsal (presence · shared strokes ·
   conclude/reopen, no credentials). **Next:** the WIRING step that makes the room real — LiveKit
   credentials + `livekit-server-sdk`, the signed webhook that writes `session-attended` rows
   through the service role (referent = `cohort_sessions`), the carrier the channel seam is waiting
   for (the memory bus turns into the room the day it lands), the session END ruling (unlocks
   Tier 1; the conclusion instant — `cohort_sessions.updated_at` — is the candidate end), and the
   clear-permission ruling.
   Reconnaissance: `docs/proposed/livekit_recon.md`. **Kinds stay inadmissible until the module is
   live** — the scaffolding alone changes nothing on the arc.
3. **Credentialed environment first, when available:** apply migrations 0004/0005/0006/0007/0008,
   then run the Phase 6 debt list (`PHASE6_STEP6_REPORT.md` — the handover document): harness
   re-runs, DEC-020 baseline re-pin, the matrix `--write` re-pin (W7 — the filesystem scan now
   includes `/subjects/[subject]/live`), the signed-in journey re-walk.
4. **Rulings owed to the owner:** the two static guards (gate W1) · the tagline question (W4) · the
   co-teacher grant question (DEC-018 Item 5) · the tile-grid composition ruling for when remote
   participants become facts (DEC-024) · the surface's owed rulings: session bus, clear-permission,
   keyboard stroke input, late-packet ordering (DEC-025) · whether `academicNotes` ever gains an
   adjudicated home (DEC-027 — today's answer is the refusal; a schema ruling either way). DEC-018
   Item 4's cohort condition is now MET — cohort-scoped levers are arguable, but only by ruling,
   never by schema side effect.
   **Manual walk owed:** the whole room rehearsal (`/dev/live-stage`) in a real browser — media,
   drawing feel, substrate legibility — the sandbox has none.

## STANDING

`prompts/README.md` — the prompt log: phase tracker, per-step rules, and **the rulings index (P5-R1…R10,
P6-R1…R20)**. The repo's own `docs/` carry the decisions, exceptions, visibility, distance and language
documents. **Do not violate any DO-NOT-CHANGE list**, and do not build Admin.
