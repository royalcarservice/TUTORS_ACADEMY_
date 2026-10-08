# PHASE 6 · STEP 6 — THE TUTOR GATE

**Verification, not construction.** Windows run in gate order: W1 ✅ W2 ✅ W3 ✅ W4 ✅ W5 ✅ W6 ✅ **W7 ✅ (this report)** — W8 onward pending.
Branch `arena/e6e6e569-tutors-academy`. Every command under `timeout -k 5 N`; servers killed by port (`ss -ltnp`) in the same invocation.

**Preconditions confirmed:** 6.5 reported (`PHASE6_STEP5_REPORT.md`, commit `0c79f3d`); its Part 0 rulings P6-R17–P6-R20 landed (DEC-018); P6-R21 delivered as the owner ruling that closed 6.5 §10 / `docs/TUTOR_DISTANCE.md` row 8 (DEC-018 addendum, `ebcbe87`); typography self-hosted so `npm run build` runs here (DEC-019). Nothing known-broken outstanding.

## Part 0 — windows closed before this report

- **W1 (environment · deps · static guards · logic · cold build).** `tsc` clean; `npm run build` exit 0 (28.881 s wall; prebuild validator 108/108 ran first); documented runner suites green — next-action 34/34, progress 16/16, attacks 7/7, RLS static audit, SQL check. Two static guards fail on the tree — **declared pre-existing, awaiting rulings** (check-subject-imports false positive on `import type { MotionChar }`; check-breakpoints, two deliberate off-by-one max-widths).
- **W2 (migrations · identity · recovery).** Migrations static-audit clean (live apply owed to a credentialed environment); zero-real-identity by construction (`is_test_account` never referenced by product code); cold recovery probe 1.51 s.
- **W3 (report debt · recorded baselines · HTTP battery).** The owed 6.5 report written from recorded evidence (`0c79f3d`); live suites green where runnable; carried harnesses cited from their recorded baselines (no Chrome/Puppeteer, no DB in this sandbox — owed re-runs). Production HTTP battery: `/` `/subjects` `/subjects/mathematics` `/login` `/register` 200 · draft + unknown subjects 404 canonical · `/student*` `/tutor*` `/admin` 307 → `/login?next=…` · `/dev/*` 404 · `GET /subjects/mathematics/enter` 405.

---

## Part W4 — THE PROMISE LEDGER

**Method.** Every tutor-relevant promise string was extracted **verbatim from the rendered production page** (`npm run build` → `next start` on port 3100, HTML captured, server killed by port in the same invocation), then mapped against the Phase 6 surfaces, `src/config/modules.ts` (the registry), `supabase/migrations/20261001000002_relationship.sql` / `20261002000003_environment_settings.sql`, and `docs/TUTOR_DISTANCE.md` / `docs/TUTOR_VISIBILITY.md`. Verdicts strictly three: **DELIVERED / DECLARED DISTANCE / CONTRADICTION.** Scene numbering: the gate's "Scene 5" is the 4.6 module-status-beat scenes (People · Practice); the Promise scene is 4.7's. Both directions run. A CONTRADICTION is fixed in-window by correcting **the claim half** (homepage copy) — never the honesty treatment.

### Direction A — homepage claims → tutor experience

| # | Claim (verbatim, as rendered) | Where verified | Verdict |
|---|---|---|---|
| A1 | "There is no roster on this page. A tutor does not get a profile page and a video call; a tutor gets an environment, and shapes it." | `/` People scene (`src/components/spine/scenes/people.tsx`). The page lists no tutors (true). "An environment, and shapes it": `tutor-environment` is **live** in the registry since 6.4 (density + motion character); the shaping surface `/tutor/[subject]/environment` exists with placement-gated writes; P6-R21 refusal verified W1. No profile page exists (`/tutor/[subject]` is 404 by TUTOR_DISTANCE row 6). | **DELIVERED** |
| A2 | "A tutor here has a place, not a profile." | The tutor shell `/tutor` renders placements as rows grouped by subject (6.2); no profile object anywhere. | **DELIVERED** |
| A3 | "Five things are theirs to set: accent, atmosphere, motif, motion character, density." | CONTRADICTED by P6-R11/P6-R13 (6.4): identity levers immutable, atmosphere authored-once and never presented; only **density and motion character** adjustable — the live module's own registry summary says exactly two. | **CONTRADICTION → fixed** (below) |
| A4 | People scene status: was "Next · not built yet — the tutor's side of the environment." (bound to `tutor-portal`, planned) | The registry has carried a **live** `tutor-environment` entry since 6.4; E-26's own rule — the label binds to the fact its sentence asserts — applied to the post-6.4 registry demanded "Live today". | **CONTRADICTION → fixed** (below) |
| A5 | "The environment is the workspace. You meet your tutor inside it." | Workspace half delivered (the room + shaping surface exist). "Meet your tutor inside it" presupposes live presence; the gap is named on the same page by the practice beats' own labels (live-classroom / recorded-classes → "Next · not built yet"), and no tutor surface contradicts. | **DECLARED DISTANCE** |
| A6 | "The class happens live, in the same room you entered from this page, with the tutor and whoever else is in it." (beat: You attend) | Beat's own label renders `data-state="next"` → "Next · not built yet"; `live-classroom` planned. Gap named at the point of the claim. | **DECLARED DISTANCE** |
| A7 | "Afterwards the class is still there, as a recording, with the notes beside it. Miss one and it waits for you." (beat: You revisit) | Own label "Next · not built yet"; `recorded-classes` planned. | **DECLARED DISTANCE** |
| A8 | "You do the work in the same place: the assignments, the notes from class, and help when you are stuck — from the tutor, or from the assistant." (beat: You work) | Own label "Next · not built yet"; `assignments` + `ai-assistant` planned; both remain in the registry (a module entry exists only while a phase delivers it). | **DECLARED DISTANCE** |
| A9 | "Your work leaves a record. You and your tutor read the same one, so you can both see where you have moved." (beat: You see yourself move) | Own label renders "In foundation". Today the ONE record both sides read is the arc — one definition (`src/config/arc.ts`): the student sees it in the environment, the related tutor reads the same arc on the relationship surface (6.3). The fuller record is honestly labelled. | **DECLARED DISTANCE** |
| A10 | "Next, in this order:" sequence — was "assignments, **tests** and the assistant" | `tests` was deleted from the registry in 6.3 (P6-R8: no phase delivers it); the homepage promised a module nothing will build. Beat modules are `assignments` + `ai-assistant`. | **CONTRADICTION → fixed** (below) |
| A11 | "Live today: six environments and the switch between them." | 4.9-certified; re-verified W3 battery — six subject environments 200 + `/subjects` switch. | **DELIVERED** |
| A12 | "Mastery here is a place that remembers where you were. Your classes, recordings and work are kept against the same environment, and your progress is read there — at the point of work, not on a separate dashboard." + "In foundation — the record." | Label renders `data-state="foundation"`. `progress_record` is a proposal only (`docs/proposed/progress_record.sql`, DEC-009) — nothing renders a score, nothing pretends the record exists. Gap named by the label itself. | **DECLARED DISTANCE** |
| A13 | Arc marker "Work with a tutor" — state "ahead" | Marker state derives from evidence rules (5.6): `interact` has no evidence rule until P7, so it renders "ahead" — true today, self-correcting when P7 defines evidence. | **DECLARED DISTANCE** |
| A14 | Meta/title: "Tutors Academy — Live tutoring, built for real learning outcomes." / description "…each with its own room, and a tutor who has a place in it." | "A place in it" = delivered (A2). "Live tutoring" as tagline while live classes are "Next · not built yet": the page-wide honesty apparatus declares the gap, so this is not a contradiction — but it is the closest call in the ledger and is **surfaced for ruling** rather than passed silently or rewritten inside the gate (the gate doc: a third mid-phase ruling deserves the same treatment, not a quiet decision). | **DECLARED DISTANCE** · surfaced |

**Ratio, as the gate predicted:** delivered 3 · declared distance 8 · contradiction 3 — a low delivered ratio, correct for the phase that built the frame, not the content.

### The three contradictions, and which half was corrected

In every case the **claim half was corrected — the homepage copy was adjusted to the shipped truth.** No behaviour, schema, route, surface or honesty treatment changed; `tutor-portal` stays `planned` in the registry (no status flip).

1. **Five levers → two.** `people.tsx`: `PEOPLE_COPY.lines[0]` and the render now say *"Two things are theirs to set: **density** and **motion character**. Everything else in the room — accent, atmosphere, motif — is the subject's own: authored, not adjustable."* The `LEVERS` constant (the schema's five) is kept, re-commented as record. Evidence of truth: P6-R11/P6-R13, the live `tutor-environment` registry summary, the shaping form's two selects.
2. **Status binding.** `people.tsx`: `statusFor(modules, ["tutor-portal"])` → `statusFor(modules, ["tutor-environment"])`. Byte-level proof on the production render: `<span data-status="true" data-state="live">Live today</span> — the tutor's side of the environment.` (was `data-state="next"`). E-26 (tutor-portal planned) unchanged — its rationale ("the label bound to the fact the sentence asserts") is exactly what produced this fix.
3. **The removed module leaves the promise.** `practice.tsx`: `BEAT_PHRASE.assisted` "assignments, tests and the assistant" → **"assignments and the assistant"**. Rendered sequence: *"Next, in this order: live classes, recordings and notes, assignments and the assistant, your record of progress."*

**Verification (all this window):** `tsc --noEmit` exit 0 · `npm run build` exit 0 (prebuild validator first) · production smoke on `/`: both new sentences present byte-for-byte, status label live, consolidated sequence fixed, **zero occurrences of "tests" on the page** · NEVER-word sweep on the rendered homepage (coming soon / roadmap / changelog / try again / five things / tests and the assistant) clean · route set unchanged (copy-only).

**Baseline consequence (declared):** the homepage string pins change — 6.4's pin `141/c4b478181b3dbcdd` is superseded; page/journey/gate/tutor harness baselines re-pin on the next credentialed run, with DEC-020 as the reason.

### Direction B — tutor capabilities → what a student would think if they knew

Capabilities from `docs/TUTOR_DISTANCE.md` (its capability table, 6.2/6.3/6.4/P6-R19) and `docs/TUTOR_VISIBILITY.md` §2 (the policy in prose), checked against the SQL (`20261001000002_relationship.sql`, the `is_related_tutor` predicate scoped per-row to student + subject).

| what the tutor can do | what the student would think if they knew | reading |
|---|---|---|
| See the students placed with them, by subject (`/tutor`) | "My tutor can see that I'm placed with them in this subject — that fact, and nothing about my life outside it." | **GOOD** |
| Open one relationship and read where the learning is — the arc (`/tutor/[subject]/[relationship]`) | "My tutor can see where I am in my subject. It's the same arc I see myself — a stage in words, never a score, never a number." | **GOOD** — one arc definition, both sides read it (A9) |
| Shape one subject's environment — density and motion character, for everyone in it; revert (`/tutor/[subject]/environment`) | "My tutor can change how full the room feels and how it moves. It changes for everyone in the subject, it's the same for all of us, and it can be set back." | **GOOD** — subject-wide, no per-student targeting (P6-R10; attack 6/7 unrepresentable by design) |
| Stand in the room they shape (`/subjects/[subject]`, P6-R19) | "My tutor can stand in the same room I enter — but my regions, my threshold, my record are not visible to them there." | **GOOD** — identity matrix: tutor gets identity, every student region denied |
| See who they are signed in as, their role as a fact, and sign out (`/tutor/account`) | "There's a page where my tutor sees their own name and the way out. Nothing about me is on it." | **GOOD** — P6-R14: identity and the door, nothing else |
| Read only under an active relationship, in that subject (RLS predicate `is_related_tutor(student_id, subject_id)`) | "My tutor can't see my other subjects, other students only if we're placed together — and if our arrangement ends, the window closes." | **GOOD** — row-scoped per subject; ended grants nothing (VISIBILITY §1) |
| **Cannot**: see contact/auth/account state, entry counts, timing, device, aggregates, leaderboards, "needs attention", exports | "No one can see when or how often I come in, or compare me with anyone. My tutor included." | **GOOD** — refused by design (P6-R3; VISIBILITY §2), RLS makes a `count()` return the policy's rows (tested: 1, not the table's) |
| Know a co-tutor shaped the room: "Last shaped by another tutor." | "If two tutors share my subject, they know someone else set the room — no name, no date, no roster." | **GOOD** — a fact, minimally told |
| Shape silently — students are not told the room changed (declared on the shaping surface: "Nothing announces the change…") | "The room can change without me knowing it changed, or whose hand did it." | **READS BOTH WAYS — see finding** |

**The one finding this ledger exists to produce.** The silent-shaping row: the capability itself reads well (subject-wide, reversible, never per-student), and the silence is a **declared decision** (TUTOR_DISTANCE row 9: "silence toward students is a decision"; the shaping surface states what it does not do, P6-R10). But from the student's chair the plain description — *"the room you study in can change, and nothing will tell you"* — is the one line a student could not raise and a builder is structurally least able to see. **Recommendation with evidence, not a gate fix** (the fix would be student-surface copy, which this gate may not invent): when Phase 7 introduces classes, the owner may want a one-line attribution inside the room (e.g. the subject's environment stating it is shaped by its tutors). Decision stands as declared until ruled; recorded here so it is visible from the student's side of the asymmetry, which no other document shows.

**Ride-along, stated for the ledger (already declared in VISIBILITY §2):** `environment_state.entry_count`, `profiles.role` / `is_test_account` / timestamps are readable over REST by a related tutor (RLS is row-grained); **no surface renders any of them**, and column-grain tightening is a documented deferral. Surface-level reading: good; the REST residue is declared, not hidden.

### Declared distances that stay declared (no in-window action)

- A5's "You meet your tutor inside it" — gap named by the practice beats' labels; closes when live-classroom ships (Phase 7+).
- A14's tagline — surfaced for ruling above; not rewritten inside the gate.

---

## Part W5 — THE SECOND LEDGER, WHOLE

**Session note (honesty first):** between W4 and W5 the sandbox was re-provisioned — the branch was re-cloned from origin at `a893f5b`, and the three unpushed commits were lost from the object database. The **working tree survived intact** (byte-verified against the committed content: W4 copy, P6-R21 code, fonts, DEC-018/019/020, both reports all present). History was re-laid from it at its original boundaries and **pushed to origin** so it cannot be lost again: `f3db035` (6.5 report) → `b4ba8cc` (P6-R21 + self-hosted typography) → `77e1efb` (W4 promise ledger). Content identical to the lost `0c79f3d` / `ebcbe87` / `d0f9deb`; hashes changed.

**Method.** Full inventory of every tutor capability built in Phase 6, read from source (`src/components/tutor/*`, `src/lib/tutor/*`, `src/lib/environment/*`, the tutor routes, `docs/TUTOR_VISIBILITY.md` §1–3, `docs/TUTOR_DISTANCE.md`), then the counterpart question for each: *what would a student reasonably conclude if this were described to them plainly?* Followed by a vocabulary sweep of every tutor-facing string for surveillance/management language.

**Inventory note (template vs reality):** the window brief listed shaping levers as "density, motion, contrast, ring". The codebase has **exactly two** — `LeverId = "density" | "motionChar"` (`src/lib/environment/levers.ts`; the other three of 3.1's five levers are identity/inert by P6-R11/P6-R13). "contrast" and "ring" exist nowhere in this repository; the ledger is built from what exists.

### Step 1 — capabilities, as verified from source

| # | Capability | Surface / reader | What it actually reads or writes |
|---|---|---|---|
| C1 | See the students placed with them, by subject | `/tutor` via `src/lib/tutor/data.ts` | `relationships WHERE tutor_id = me AND state = 'active'` + display names; **two tables, no arguments** — no parameter exists to ask about another student, subject, or ordering |
| C2 | Open one relationship and read where the learning is | `/tutor/[subject]/[relationship]` via `src/lib/tutor/relationship.ts` | display_name · enrolment status · `first_entered_at` — nothing else. **Never** `last_entered_at` or `entry_count`: "Position is a state of the learning; recency is a measure of the person." |
| C3 | Shape one subject's environment; revert | `/tutor/[subject]/environment` → POST `…/shape` | Two closed authored selects (density ×3, motion character ×6); freshness-token write (P6-R21); revert = DELETE, tokenless |
| C4 | Stand in the room they shape | `/subjects/[subject]` (P6-R19) | Admitted to the draft environment's **identity only**; every student region denied |
| C5 | See who they are signed in as, and sign out | `/tutor/account` | name · email · role · sign out; test-account sentence. Nothing about any student |
| C6 | Visibility bounds (the negative capability) | RLS (`is_related_tutor(student_id, subject_id)`), `docs/TUTOR_VISIBILITY.md` §2 | No contact/auth/account state · no behavioural data · no aggregates/lists/comparisons/"needs attention" · no export; ended relationship grants nothing; never-related / ended / malformed = one null path (P6-R9) |

### Step 2 — the ledger

| What the tutor can do | What the student would think if they knew | Assessment |
|---|---|---|
| See a list of the students placed with them, grouped by subject — a name and a subject per row, in fixed alphabetical order | *"They can see that I'm placed with them in this subject — just that. The list can't sort me by anything I did."* | **Reads well** — order is `localeCompare` by name; the type cannot express an evaluative field; no counts |
| Read where the learning is: my arc in this subject, as stage words | *"They can see where I am in Physics so our next conversation makes sense. It's the same arc I see — a stage in words, never a score."* | **Reads well** — one arc definition (`src/config/arc.ts`), third consumer; no CTA, no interaction on it |
| Adjust the environment's density and motion character — for everyone in the subject | *"They tuned the room — how full it feels, how it moves — so working in it is easier. It's the same room for all of us, and it can be put back."* | **Reads well** — subject-wide by construction; per-student anything is unrepresentable (attack 6/7); revert exists |
| Save is refused if the room moved between load and submit (P6-R21) | *"If two tutors share my subject, neither can silently overwrite the other — the second save is refused and told to reload."* | **Reads well** — the refusal names the fact, never a person |
| Know a co-tutor shaped the room: *"Last shaped by another tutor."* | *"They know someone else set the room — no name, no date, no roster of who else teaches me."* | **Reads well** — minimal, structural |
| Stand in the same room I enter (draft included) | *"They can stand in the room. But my regions, my threshold, my record are not visible to them there — they see what any visitor sees."* | **Reads well** — identity matrix: identity admitted, every student region denied |
| See my other subjects, my activity outside this one, my email, my sign-ins | *Blocked by RLS & schema: the predicate is per-row `(student_id, subject_id)`; `auth.*` has no tutor policy at all; the readers can name only the admitted tables.* | **Reads well — dignified boundary.** The sentence this product should be able to publish: *"My tutor can see my work in this subject, and nothing else about my life."* |
| Time-spent tracking, idle detection, entry counts, timing patterns, device data | *Absent by design. The one date a reader may read (`first_entered_at`) renders only as the arc's "entered" step — never as a date; `entry_count` rides along over REST but no surface renders it (declared, VISIBILITY §2).* | **Reads well — no surveillance metrics exist** |
| Compare students, rank them, see a "needs attention" list, export anything | *Absent by ruling (P6-R3: not a management console). The slot registry's refusal is written into the config: there is no "attention", "progress" or "activity" region, and none may be added. RLS makes a `count()` return the policy's rows (tested: 1, not the table's).* | **Reads well** |
| Act on me: set work, hold a session, write feedback, end the relationship | *They cannot — and every surface says so plainly: "Teaching surfaces are not built." / "This page reads the record and changes nothing." No disabled control pretends otherwise.* | **Reads well** — absence is stated at the point of absence (P6-R4) |
| Know the relationship existed after it ends | *The row is retained so each side can know it ended — but an ended row grants nothing; the tutor sees nothing further of me.* | **Reads well** — DPDP transparency without lingering access |
| Shape silently: students are not told the room changed | *"The room can change without me knowing it changed, or whose hand did it."* | **READS BOTH WAYS — the finding** (below) |

### Step 3 — vocabulary sweep & copy check

Swept every tutor-facing string (`src/components/tutor/*`, `src/app/(portal)/tutor/**`, `src/lib/tutor/*`, `src/lib/environment/*`, the shape route, the tutor error copy) against the surveillance/management vocabulary: *inspect · monitor · track · activity · attend · deficiency · performance · attention · flag · alert · compliance · engage · idle · time spent · last seen/active · streak · usage · metric · analytic · dashboard · score · rank · leaderboard · compare · overdue · missed · warn · risk · intervention · escalate · history.*

**Result: zero hits in rendered copy.** The only matches are code comments recording *refusals* ("there is no 'attention', 'progress' or 'activity' region … and none may be added"). Every label in use is academic/relational: *Overview · Your students · The students placed with you · Where the learning is · Shape the {Subject} environment · The two levers · Put the environment back as authored · Open the {Subject} room · Back to the students placed with you.* Read failures stay factual (*"Your students could not be read just now… Opening the page again only reads — it is safe to do."*; *"That did not save. The environment is unchanged — the values shown are the ones in force."*) — no alarm words, no blame.

**Bounded copy fixes applied: none — none were needed.** The sweep found no tutor-surface copy that creates anxiety or implies surveillance, so the window's fix condition did not fire. The one finding below is a *student-side* question, and this gate may not invent student surfaces — it is a recommendation, as the gate rules require.

### The finding (carried from W4, now evidenced from the tutor side)

**Silent shaping.** Capability C3's declared silence (`LEVERS_COPY.noNotice`: *"Nothing announces the change. Students are not told their room was rearranged; the subject simply looks as you set it."*; TUTOR_DISTANCE row 9: "silence toward students is a decision"). From the tutor's chair the sentence is dignified — the surface says what it does *not* do. From the student's chair the plain description reads: *the room you study in can change, and nothing will tell you.* This remains the ledger's only both-ways row. **Recommendation with evidence (unchanged from W4):** Phase 7 candidate — a one-line attribution inside the room if the owner rules for it. The decision stands as declared until ruled.

### W5 verdict

**12 rows: 11 read well, 1 reads both ways (declared decision, recommendation recorded). No CRITICAL FINDING — no row reads as surveillance, micromanagement, ranking, or exposure; the boundaries that prevent those are structural (types, RLS, rulings), not just copy. Zero tutor-surface copy corrections required.**

---

## Part W6 — THE TUTOR'S JOURNEY, READ WHOLE

**Environment note (declared up front).** `.env.local` is absent in this sandbox, so **no signed-in session can be created here**. The journey therefore has two evidentiary classes, labelled on every row: **LIVE** — measured this window against the production build (`npm ci` 384 packages after the re-provision · `npm run build` exit 0, validator first · `next start` on port 3000, torn down by port in the same invocation each time) — covering the signed-out path and the visitor-rendered room; and **RECORDED** — the credentialed-project baselines (`audit/identity-matrix.json` 2026-10-03, 80 routes × 6 identity classes + write probes; `audit/tutor-baseline.json` 38 gates; `audit/relationship-baseline.json` 32 gates / 11 cases; `audit/tutor-states.json` 14 gates) plus the 6.2–6.5 step reports. The W4/W5 windows touched homepage copy and docs only — no tutor surface changed since those baselines, so they remain current.

### Step 1 — the timed walk & status trace

**The six steps of the journey, signed-out (LIVE, measured this window):**

| # | Step | Observed | Status | Where it sends you | Latency |
|---|---|---|---|---|---|
| 1 | `/tutor` (the shell) | first hit cold, warm after | **307** | `/login?next=%2Ftutor` | 0.107 s → 0.007 s |
| 2 | `/tutor/physics/<uuid>` (a relationship) | the URL names an arrangement, never a person | **307** | `/login?next=…` preserved exactly | 0.007 s |
| 3 | `/tutor/physics/environment` (shaping) | | **307** | `/login?next=…` | 0.008 s |
| 4 | `/subjects/physics` (the room itself) | physics is **draft** (the authored set: 1 ready subject — mathematics — and 5 draft). A visitor gets the canonical 404; the PLACED tutor gets 200 (RECORDED: identity matrix, tutor T × physics) | **404** visitor / **200** placed tutor | — | 0.197 s |
| 4′ | `/subjects/mathematics` (the ready room — what standing in a room renders) | identity only: "Mathematics — The Lattice — structure you can stand on." | **200** | — | 0.261 s |
| 5 | `POST /tutor/physics/environment/shape` (unauthed) | the proxy's auth redirect fires BEFORE route handling — an unauthored write can never reach the write path | **307** | `/login?next=…environment` | 0.010 s |
| 5′ | `GET /tutor/physics/environment/shape` (POST-only route) | same layering while signed out; the observable GET-only 405 without a session is `/subjects/<subject>/enter` (W3) | **307** unauthed | — | 0.007 s |
| 6 | `/tutor/account` | | **307** | `/login?next=…` | 0.004 s |
| — | `/login?next=%2Ftutor` (where every step lands) | the honest arrival: one form, the destination preserved as a hidden GET input — never replayed as a write (5.7) | **200** | — | 0.054 s |

**Signed-in (RECORDED, credentialed project):** the same walk as tutor T — `/tutor` 200 (statement-first shell) · `/tutor/physics/<rel>` 200 for the one active relationship, **404 · same bytes** for never-related / ended / malformed ids (P6-R9: the surface cannot confirm or deny that a person exists) · `/tutor/physics/environment` 200 with the two-lever form · `/subjects/physics` 200 — admitted to the draft room's identity, every student region denied (P6-R19) · `POST …/shape` 303 on success / `?shape=failed` on unauthored values / **409 + the ruling's sentence** on a stale write (P6-R21); visitor/expired probes recorded at 303 with the row untouched. Every step is 200 at the end of 6.5 for a placed tutor; the one 404 such a tutor meets is a subject they are not placed in, and it says *"There is no page at this address."*

**3-second / 10-second takeaway (signed-out):** at 3 s — a login page that guesses nothing about the visitor; at 10 s — the preserved `next` parameter makes plain that signing in returns them exactly where they were headed. No content leaks ahead of identity; the 307 carries no hint of what the page holds.

### Step 2 — dead-end inventory (honesty at the point of stopping)

Swept every tutor surface for the four capability classes the journey names. **None exists as a control anywhere** — there is nothing to disable, grey out, or spin:

| Where a tutor would stop | What is actually there | Honest at the point of stopping? |
|---|---|---|
| Direct messaging / chat | No component, no route, no nav item. The shell's statement: *"The students placed with you are listed below, by subject. Placing is done by the academy, not from this page. **Teaching surfaces are not built.**"* | ✅ sentence, not a dead button |
| Assignment dispatch / grading | Nothing. The relationship surface: *"This page reads the record and changes nothing. Nothing here is done by a tutor yet: **teaching surfaces are not built.**"* | ✅ sentence at the point of absence |
| Live class launch / video room | Nothing; the nav holds three real destinations, all 200 — *"No disabled or 'coming soon' items; nothing named that the registry does not declare built"* (`config/tutor-nav.ts`) | ✅ nothing to click, nothing pretending |
| Student removal / relationship termination | No control by ruling (P6-R9); an ended row is 404 · same bytes; a tutor with no placements gets *"No student is placed with you."* + the academy-does-placing reason | ✅ the absence is stated |

`grep disabled` across all tutor surfaces: **zero controls** (the only match is the comment *"No invented CTA, no disabled control, no apology"*). No spinner, skeleton, or loader exists on any tutor route (5.7's refusals apply segment-wide).

### Step 3 — the second visit

**"Nothing changed" — confirmed as the product's true and dignified answer.** Evidence: no events table exists, so shell state C is unreachable (`data.ts`: *"C is unreachable today: no events table exists"*); the tutor slot registry is **empty by construction** (`slots.tsx`: *"Today the registry is EMPTY on purpose"*); and no notification, streak, badge, unread count, "since your last visit", or welcome-back string exists anywhere in the tutor segment (swept — the only matches are a read-failure class name `SettingsUnread` and the student-space `StatusBadge`, which the tutor layout does not import). The shell renders the **same two sentences on every visit**; the relationship surface the same arc; and the arc cannot move without an admissible event (5.6: none admissible today). The only legitimate difference a second visit can show is the shaping surface's own record of the tutor's action — *"Last shaped by you."* — which is theirs. **No invented urgency, no artificial streaks, no unearned notifications: verified absent, not merely unused.**

### Step 4 — the three-second skim ("what now?")

| Surface | The 3-second answer | P6-R4 held? |
|---|---|---|
| `/tutor` | h1 **is** the answer: *"Nothing to do here."* (or *"No student is placed with you."*) with the WHY in the next line of the same frame | ✅ — the statement precedes everything; no hunting |
| `/tutor/[subject]/[relationship]` | Name · subject · where the learning is — then *"This page reads the record and changes nothing."* Read, then one link back | ✅ |
| `/tutor/[subject]/environment` | The honest answer here is NOT "nothing": shaping is live. 3-second read: which room · its current state · the two levers · the blast-radius sentence before the one primary | ✅ — the act it offers is real (the write works, refuses honestly), never a pose |

Two surfaces that say "nothing right now, and here is why"; one that offers exactly one real act. That is the shape P6-R4 designed, and it held across all three.

### Step 5 — the adversarial read (monitored · blamed · given a duty not agreed)

Hunted deliberately — vocabulary-swept (`must · should · need to · failed · forgot · responsib · overdue · remind · missed · late · absent · inactive · obligation · check in`) plus a line-by-line read of every tutor string:

- **Responsibility for a student's absence?** No. No tutor surface reads or renders login recency, entry counts, or timing — the relationship reader's column list *is* the enforcement (`select("first_entered_at")` only, and even that renders as the arc's stage word, never a date, never "hasn't visited"). There is no sentence anywhere that could attach a student's silence to the tutor.
- **The platform monitoring the tutor?** The only record of the tutor on any surface is their own — *"Last shaped by you."* / *"Last shaped by another tutor."* (a fact on a design-config row; no name, no date rendered). The row's timestamp exists in code only as P6-R21's freshness token and is **never rendered as a date**. No tutor activity log, no "last active", no responsiveness metric exists in the codebase. The conflict refusal names the fact, never the person.
- **Duties never contracted?** None imposed. *"Teaching surfaces are not built"* reads as a **release** from duty, not an assignment of one. The blast-radius sentence checked: deliberately weighty (*"…including students you do not teach…"*) — informed consent before a shared-room write (P6-R12), pressure applied to the *save*, never to the person. Two near-misses examined and cleared: *"Nothing to do here."* could read curt — it is immediately followed by its reason in the same frame (6.2's copy audit chose it over apology-flavoured alternatives); and no failure path carries alarm words (*"That did not save. The environment is unchanged…"*, *"Your students could not be read just now…"*).

**Adversarial verdict: no moment found where a tutor would feel monitored, blamed, or conscripted.**

### W6 verdict

**The journey is dignified end to end on every leg this window can run, and recorded-green on the credentialed leg.** Signed-out: one uniform 307-to-login across every tutor route, destination preserved, nothing leaked. Signed-in (recorded): statement-first shell, one-address-one-relationship pages, a live act offered exactly once, honesty sentences at every stopping point, and nothing that changes between visits except the tutor's own deed. **Zero defects found; zero copy changes made — this window changed nothing.** Owed to the credentialed environment: a live re-walk with a placed-tutor session (timing the signed-in leg, screenshotting the first visit), alongside the owed harness re-runs.

---

## Part W7 — THE IDENTITY MATRIX AS A SET

**Method.** Read-only audit of `audit/identity-matrix.json` (generated 2026-10-03T09:15Z on the credentialed project: 80 pinned route rows × 6 reader classes + write probes) against the route set derived from the current filesystem, plus the source of every guard the matrix observes. One verification script was added as gate evidence — `audit/proofs/w7-coverage-check.cjs` (runs the harness's PURE derivation without Chrome/DB; the only substitution declared inside it: the relationship fixture ids are read from the pinned rows because no database is reachable here). No application code touched.

### Step 1 — route inventory × reader classes

**The app route set** (16 files under `src/app`, dev pages excluded from production reach but included in the walk): `/` · `/login` · `/register` · `/subjects` · `/subjects/[subject]` · `POST /subjects/[subject]/enter` · `/student` · `/student/account` · `/tutor` · `/tutor/account` · `/tutor/[subject]/[relationship]` · `/tutor/[subject]/environment` · `POST /tutor/[subject]/environment/shape` · `/admin` · `/auth/callback` · `POST /auth/signout` — expanded: `[subject]` across the six locked ids, `[relationship]` across the five fixture probes (active · ended · nonexistent · wrong-subject · user-id-in-the-slot). The walk derives **82 concrete URLs**; the pinned matrix holds **80 rows** (the two-row difference is this window's finding — Step 4).

**Class correspondence** (the brief's five archetypes ↔ the matrix's six fixture identities):

| brief class | matrix class | fixture |
|---|---|---|
| ANON | `visitor` | no cookies |
| — (session hygiene, not in the brief's five) | `expired` | student A's cookies with the token replaced — present, invalid |
| STUDENT_OWN | `studentA` | student-c — enrolled, active, related to tutor T in physics |
| STUDENT_OTHER | `studentB` | student-b — enrolled, never entered; on any subject without enrolment this class is the "without enrolment" reader |
| TUTOR_RELATED | `tutorT` | tutor-a — active relationship with student A in physics ONLY |
| TUTOR_UNRELATED | `tutorU` | tutor-u — related to nobody |

(The brief's boundary routes `/not-found` · `/error` are not matrix rows — they are the 5.7/5.8 states harness's territory: `audit/states-baseline.json`, 38 gates. The matrix observes them through its `not-found` render fingerprint.)

**Canonical outcomes, as pinned (every cell verified by the credentialed run):** `/` `/login` `/register` `/subjects` → 200 for all six classes · `/student` → 307→login (anon/expired), student shell states (students), **307→their own shell** (tutors — a tutor is never inside the student space) · `/tutor` `/tutor/account` → 307→login (anon/expired), 307→/student (students), 200 (tutors) · `/admin` → 307→login for everyone signed out, 307→own shell for every signed-in role (the portal is not built — the redirect is honest, E-26) · `/subjects/mathematics` (ready) → `environment:door` (visitor) / `environment:student-regions` (enrolled students) / `environment` (tutors) · `/subjects/physics` (draft) → **404 visitor · 404 tutorU · 200 student-regions (enrolled) · 200 `environment:shape-link` (tutorT)** · `/subjects/chemistry…history` → 404 for all six (no fixture placement or enrolment) · `GET` on both `…/enter` and `…/shape` → 405 for all classes · `POST /tutor/physics/environment/shape` → visitor/expired 303 row-untouched · studentA 404 · tutorU 404 · tutorT the write path (303 / `?shape=failed` / 409 on staleness — the `writes` block) · every `/dev/*` route → 404 for all six classes.

### Step 2 — fork detection (reading the matrix as a product)

**One URL renders different fingerprints for different readers — is `/subjects/[subject]` two disjoint applications? No. It is deliberate progressive disclosure, and the code says so in so many words** (P5-R5, in the route's header): *"ONE ENVIRONMENT, ROLE-SCOPED REGIONS: this is the same place for everyone. What differs by identity is decided HERE, server-side."* The evidence:

- **One renderer.** Every class lands in the same `SubjectShell` composition; the variants are additive slots — `threshold` (gated on `role=student` + `mayEnrol`), `regions` (gated on `role=student` + enrolment), `shaping` (gated on an active relationship). Removing what a class lacks always yields what the lesser class sees — the definition of disclosure, not a fork.
- **One data model.** The identity (mark, motif, density, tagline, the room's levers) is read by an ANON settings query that does not know who is asking — P6-R10: **byte-identical identity for every reader class**; the visitor and the placed tutor see the same room. No reader class gets a different subject.
- **One draft guard, uniform** (`draft && prod && !enrolled && !isRelated → notFound()`), with exactly two adjudicated exceptions — enrolment (5.3) and relationship (P6-R19) — each a stronger-relationship rule, not a carve-out.
- **Everything else in the matrix is single-behaviour per URL**: portal routes role-redirect, handlers method-gate, `/` family renders one page. **No URL in the set acts as two disjoint applications.**

### Step 3 — P6-R19 policy revision audit

**The ruling as written** (README, the P6-R19 block): *"a reader with an active relationship in a subject may view that subject's environment page, draft or not, rendered as the visitor's rendering — identity, structure and honest labels only. No student regions, no student data, no change to P6-R2. A draft flag is a readiness flag, not a secrecy flag… This REVISES 6.2's gate row — 'tutor T denied student A's draft door' becomes 'tutor T is admitted to the draft environment's identity, and denied every student region of it' — rewritten, never silently edited."*

**Verified in both halves:**
- **Route guard** (`src/app/subjects/[subject]/page.tsx`): `relatedSubjectIds()` issues the relationships read **only when the identity is a tutor** (visitors and students: empty set, no query); the draft guard admits `isRelated`; the `shaping` prop renders the quiet levers link only where the write permission exists (P6-R17). Student regions/threshold stay gated on `role=student` — structurally unreachable for a tutor.
- **Matrix rows**: tutorT × `/subjects/physics` = **200 `environment:shape-link`** (admitted, visitor rendering + the one link) · visitor/tutorU × `/subjects/physics` = 404 · tutorT × every other draft subject = 404 (placement-scoped, not role-scoped) · tutorT × `/tutor/physics/environment` = 200 `environment-levers:authored`; tutorU = 404. The revised gate row is recorded in DEC-018 and the 6.5 report.

**Verdict: the revised policy is accurately reflected in the guards and in the matrix — the admission, its scope (placement, not role), and its denials (every student region) all hold.**

### Step 4 — the coverage gate, proven

**Mechanism (audit/identity-matrix.cjs):** `appRoutes()` derives the route set **from the filesystem** (walk of `src/app`, group-route folding, `[subject]` × 6, `[relationship]` × 5 fixture probes). Check mode asserts both directions — *"every app route has a pinned row"* and *"no pinned row for a route that no longer exists"* — plus write-probe coverage, and ships `--drop-row=<route>` as its built-in proof that an unmapped route fails the gate.

**Executed here:** `node audit/proofs/w7-coverage-check.cjs` (committed evidence; pure derivation, no Chrome/DB):

```
── AS-IS: 82 app routes derived from src/app, 80 pinned rows ──
FAIL  coverage: every app route has a pinned row  -> missing rows: /dev/tutor-states, /dev/tutor-states/frame
PASS  coverage: no pinned row for a route that no longer exists
PASS  coverage: every write probe has a pinned row
PASS  class completeness: every pinned row defines all 6 reader classes

(drop simulation) deleted pinned row for /subjects/physics
── DROPPED: 82 app routes, 79 pinned rows ──
FAIL  coverage: …  -> missing rows: /dev/tutor-states, /dev/tutor-states/frame, /subjects/physics
PASS  drop simulation: the gate DETECTS the unmapped route
```

**Reading the result — the gate works, and it caught real drift.** The drop simulation proves detection: remove one pinned row, the gate names it. And the AS-IS run is not clean: **`/dev/tutor-states` and `/dev/tutor-states/frame` have no pinned rows** — they were added in 6.5, after the matrix's 2026-10-03 generation. Assessment: **coverage drift, not a product defect.** Both are dev-only inventory pages that 404 for all six classes in production (the same mechanism as the 40 pinned `/dev/*` rows; their page header states it), so the missing outcomes are deterministic and boring — but the gate's rule is absolute, and a live `--write` run today would correctly fail until they are pinned. Zero stale rows: nothing was removed or renamed since the matrix was cut, and all 80 rows × 6 classes are complete. **Fix owed to the credentialed environment: the harness's `--write` re-run pins the two rows; no application change is required or made.**

### W7 verdict

**80 pinned rows × 6 classes stand, with one coverage drift named and bounded.** The route set is closed and unchanged since the matrix was cut (zero stale rows); `/subjects/[subject]` is progressive disclosure by construction, not a fork; P6-R19 is accurately enforced in code and matrix alike; the coverage gate demonstrably fails on an unmapped route — proven both by the built-in drop simulation and by the genuine two-row drift it caught this window. The owed credentialed run gains one task: pin the two 6.5 dev pages.

---

## Owed to a credentialed environment (cumulative through W6)

Live migration apply + live zero-real-identity count · browser/DB harness re-runs (page/journey/gate/tutor/levers/identity-matrix/states/environment/relationship) · homepage baseline re-pin (W4 — DEC-020 is the reason) · a live signed-in re-walk of the tutor journey with a placed-tutor session, timed and screenshotted (W6) · the identity-matrix `--write` re-run to pin `/dev/tutor-states{,/frame}` (W7 drift) · the two static-guard rulings.

## STOP

Gate doc end rule honoured: **report delivered; Phase 7 not begun, nothing of it touched.**
