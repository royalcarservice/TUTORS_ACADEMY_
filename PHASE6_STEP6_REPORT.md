# PHASE 6 · STEP 6 — THE TUTOR GATE

**Verification, not construction.** Windows run in gate order: W1 ✅ W2 ✅ W3 ✅ W4 ✅ **W5 ✅ (this report)** — W6 onward pending.
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

## Owed to a credentialed environment (unchanged from W3, plus this window's)

Live migration apply + live zero-real-identity count · browser/DB harness re-runs (page/journey/gate/tutor/levers/identity-matrix/states/environment/relationship) · homepage baseline re-pin (this window — DEC-020) · the two static-guard rulings.

## STOP

Gate doc end rule honoured: **report delivered; Phase 7 not begun, nothing of it touched.**
