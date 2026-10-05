# TUTORS ACADEMY — PHASE 6 · STEP 1: THE TUTOR ARCHITECTURE

## ENTRY POINT — CONFIRMED AGAINST THE GATE

**The Phase 5 gate recommended: the tutor–student assignment (roster) and its RLS policy** — *the first
fact that puts a person in the room* — and named **`tutor-presence`** as the registry slot it fills.
**This step is that step.** Sequence unchanged: 6.1 is the entry point.

## RULINGS CARRIED INTO 6.1 (from the gate's exceptions register)

**E-13 — SUBJECT STATUS STAYS IN TYPESCRIPT; SUBJECT IDENTITY MAY BE CHECKED IN THE DATABASE.**
- The relationship references the subject's **immutable `id`** (3.1). **Ids are locked, not config** — a
  `CHECK`/enum of the six ids is permitted, since adding a subject is a migration either way.
- **STATUS (ready / draft / locked) stays in TS config and may not be referenced by any policy or
  constraint.** Do not move it into the database; do not duplicate it. **P5-R4 stands.**
- **If a policy would need subject status, that policy is wrong** — say what it was trying to enforce
  and report it rather than encoding status to satisfy it.
- **E-13 closes as: identity checkable, status not.** Record it in the visibility document.

**E-14 — REPLACE THE MAGIC NUMBER.** The RLS fixture asserting `count(profiles) = 4` breaks on every
schema change — **a fixture that fails on a change rather than a regression**, the same class as the
fixture-date defect. Derive the expectation from the fixture script's own manifest and assert
**invariants** (*every row belongs to a test identity · no row belongs to a non-test identity*) rather
than cardinalities. Report before and after.

**E-23 — NO READER CLASS DEAD-ENDS.** Ruled now; **implemented as its own bounded defect fix after this
step's report and before 6.2, not inside 6.1** (6.1 builds no interface). The environment page must
have a truthful action or an honest statement for **every** reader class:
signed-out visitor · signed-in non-enrolled on an enterable subject · signed-in non-enrolled on a
non-enterable subject · enrolled. **None may be a dead end with no way onward.**
- Exactly one primary per view; **ENTRY language, never outcomes** (4.4).
- **No "sign in to enter"** — that is a gate plus an outcome promise.
- The visitor's action leads to the canonical choice, reusing existing vocabulary.
- It must not create a second primary for a reader who already has one.
- **Report the resulting table**: reader class → action → destination → status code.

**E-07 — LEGAL.** Unchanged and restated: privacy policy · terms · contact route · **DPDP Act 2023
including children's data**. **Phase 6 adds a capability for an adult to read a minor's record**, so
this moves from "launch blocker" to **"blocker on any real onboarding"**. No real identity may be
created, imported or inferred, at any point in this phase.

Depends on 5.1 (identity, roles, policies), 5.6 (the progress model and the P6 deferral), **4.6
(Scene 5 — the relationship, not a roster)**, 3.1 (the five levers), P5-R5 (role-scoped regions) and
P5-R7 (the registry's corrected unit).

**PRECONDITION — THE PHASE 5 GATE IS CLOSED.** Before building anything, **read the gate's own
recommendation for the Phase 6 entry point.** If it names a different first step, **STOP AND REPORT**
and the sequence changes.

**THIS STEP BUILDS NO INTERFACE.** Exactly like 5.1. It establishes who a tutor is, what a tutor may
see, and where a tutor acts. **A tutor screen built before those three are settled is a screen built
on a guess about children's data.**

---

## WHY

The homepage has been promising a relationship since Scene 5: **the tutor as the thing that makes the
environment mean something, drawn as a relationship rather than a roster, with no names, no photos, no
credentials.** Phase 6 is where that promise gets a mechanism.

**AND THE TUTOR IS THE FIRST ROLE IN THIS PRODUCT THAT SEES ANOTHER PERSON'S DATA.** Everything so
far — a visitor's own journey, a student's own record — was one person looking at themselves. A tutor
reading a student's record is a different category of thing: **personal data about a third party, very
often a minor, rendered to an adult who is not their guardian.**

That is a **DPDP question before it is a design question**, and it is why this phase opens with an
architecture step rather than a dashboard. **The order matters: boundary first, then the screen that
lives inside it.**

**AND THE INSTINCT THIS STEP EXISTS TO PREVENT.** The obvious tutor product is a management console —
a roster, progress columns, a red flag for whoever is behind, sorted by who is worst. **Every one of
those is a software-issued verdict about a child, and it is the exact thing the student-facing rules
forbid when the audience is the student.** That the audience is now an adult does not make it better;
**it makes it the harm the DPDP Act is written about.**

---

## FIRST: INSPECT

1. **The Phase 5 gate's report** — its verdict, its exceptions register, and its Phase 6 entry-point
   recommendation. **This step inherits all of it.**
2. **4.6's Scene 5 strings**, verbatim — what the homepage says the relationship is. **Phase 6 must not
   contradict the page.**
3. **3.1's five levers and the tutor-shaping rule** — the model question only; **the feature is not
   this step's.**
4. **5.1's roles, permission matrix, RLS policies and the policy-break test** — the machinery this step
   extends. **Name what already exists; do not rebuild it.**
5. **`/tutor` as it exists** — the route is already in `ROUTES` and `PORTAL_IDS`, and `requireIdentity`
   already guards it (P5-R2). **Report what it renders today** and how a tutor reaches it (there is no
   way to be a tutor yet — say how accounts get the role today, or confirm none can).
6. **5.6's progress model and its explicit deferral** — *what a tutor may see is P6's decision and was
   not pre-solved.* **That deferral comes due in this step.**
7. **P5-R5's role-scoped regions** and the region contract — **the third scope, if one is needed, is an
   extension of the same mechanism, never a second one.**
8. **P5-R7's registry unit** — a capability a phase can deliver and a surface can depend on. **Report
   what Phase 6 will add to it.**
9. **Everything already banned** — the vocabulary documents, the subject rule, never-emit-a-zero,
   no-comparison, no-celebration, report-only bans. **The tutor's surface is held to all of them.**

Report findings before building.

---

## RULING P6-R1 — THE RELATIONSHIP IS THE UNIT

**A tutor does not "have students".** There is a **relationship** between a tutor, a student, and a
subject — scoped, explicit, and revocable. **A tutor is attached to a student's learning; they do not
own it.**

- **The model is a relationship row**, naming all three: tutor · student · subject. **Not a tutor
  flag on a student, not a student list on a tutor.** Every question about a tutor's access is
  answered by *"does a relationship exist, for this subject"* — and by nothing else.
- **NO RELATIONSHIP EXISTS BY DEFAULT. NONE IS INFERRED.** Not from a shared subject, not from an
  enrolment, not from anything the system can observe. **A student enrols in Physics; that creates no
  relationship with anybody.**
- **NOTHING CREATES A RELATIONSHIP BY BROWSING.** A tutor cannot acquire access by looking.
- **The relationship carries a state and a beginning**, and its end is a real state — **not a delete.**
  Whether ending it is available in the product is a later step; **the model must not make "ended" and
  "never existed" the same thing.**
- **THE HOMEPAGE'S RULE, CARRIED:** Scene 5 showed a relationship rather than a roster. **So the
  tutor's space is organised around subjects and relationships, never around a student list.** Report
  how the model makes that true structurally rather than by discipline.

**DECISION THIS STEP MUST PROPOSE AND REPORT:** how a relationship comes into being.
Options — tutor-invited · provisioned by the academy · student-requested — **with the consent
question named explicitly**, since the student may be a minor and the relationship involves an adult
reading their record. **Recommend one, give the reasoning, and report it for approval.** Do not build
the creation flow in this step; the model must permit whichever is chosen.

---

## RULING P6-R2 — WHAT A TUTOR MAY SEE

**THE PRINCIPLE, ONE SENTENCE: A TUTOR SEES WHAT THE RELATIONSHIP IS FOR, AND NOTHING ELSE.**

**MAY SEE — for a student, in a subject, where a relationship exists:**
- **Where the student is** — the arc position (5.6's honest map), because teaching requires knowing it.
- **The learning events in that subject** — attended · watched · submitted: **the teaching record**,
  which is what the relationship is for.
- **How to address the student** — the profile's display name, and **nothing else about the account.**

**MAY NEVER SEE, AT ANY PHASE, WITHOUT A RULING:**
- **Any other subject's events.** A relationship is per subject; **the tutor's view is per subject.**
- **Anything about a student with whom no relationship exists.** Not a name, not a count, not an
  "unnamed student".
- **Behavioural data of any kind** — which is easy to promise because **it does not exist** (5.6: the
  record is learning events, not behaviour). Confirm it stays that way and say so.
- **Any aggregate across students.** No class average, no ranking, no percentile, no "top of the
  group", no distribution. **5.6 banned comparisons for the student; P6-R3 makes the same ban binding
  on the tutor, for a different reason: it turns teaching into scoring.**
- **Any export, bulk download, or third-party access.** No CSV, no "download my students", no
  integration. **This is the one most likely to be requested later, and it is the one that converts a
  tutoring relationship into a data-processing relationship.**
- **Contact details, auth metadata, account state, or anything about the person beyond the
  relationship.**

**AND THE RULE THAT MATTERS MOST, WHICH THE STEP MUST IMPLEMENT AND TEST:**
**THE ABSENCE OF A RECORD IS NOT A SIGNAL ABOUT THE STUDENT.** A student with no events renders as
**nothing**, never as zero, never as "no activity", never as a flag (P5-R6's never-emit-a-zero — **held
more strongly here, because the reader is a person whose judgment about a child is part of the harm**).

**ENFORCEMENT: RLS, NOT APPLICATION CODE.** The relationship is the policy predicate, and the
policy-break test is extended: **a tutor must be proven unable to read a non-related student's rows,
and unable to read a related student's other subjects.** An application-layer filter is a convenience;
**the policy is the boundary** (P5-R1).

**AND THE LIMIT, STATED PLAINLY:** this is a **recommended default**, and it is **the user's policy to
change.** What matters technically is that changing it is **a policy edit, never a schema rewrite**
(5.6's deferral). **Report how the shape achieves that**, and report what a *tighter* policy would
require, so the user can move in either direction.

---

## RULING P6-R3 — THE TUTOR SPACE IS NOT A MANAGEMENT CONSOLE

**5.1's momentum doctrine, adapted rather than repeated.** The student's space exists to make a student
return tomorrow. **The tutor's space exists to make the next useful teaching act obvious** — the same
three-second rule, and the same refusal of the statistics dashboard.

**BANNED FOR THE TUTOR SPACE — the list the homepage never has to publish and the product must still
keep:**
- **Students as a count, a pipeline, or a list to work through.**
- **Progress columns, sortable tables, "students needing attention", anything auto-ordered by
  software.** *A tutor's judgment may be assisted; **it may not be automated into a verdict about a
  child**.*
- **Alerts, triage queues, at-risk flags, notifications requiring action.**
- **Engagement metrics** — sessions, minutes, logins, "last seen". **They do not exist, and they must
  not be added for the tutor's benefit.**
- **Any comparison between students**, in any form.
- **Leaderboards of any kind**, including inverted ones (*"most improved"*, *"needs help"*).

**WHAT THE TUTOR SPACE IS:** their subjects, their relationships, and the record within each —
**with the next act obvious and nothing judged.**

**AND TODAY IT IS MOSTLY EMPTY, WHICH IS CORRECT.** No classes, no recordings, no submissions exist.
**The tutor's space gets the same honest treatment the student's got: name the distance, fabricate
nothing.**

---

## BUILD

**PART 1 — THE RELATIONSHIP MODEL.** The row, its states, its constraints, its indexes, its
uniqueness, and **the policy predicate it defines.** Report the DDL.

**PART 2 — THE POLICY MATRIX EXTENSION.** The RLS policies for tutor reads, written as policies over
the relationship, plus **the extended policy-break test** (non-related student · other subject ·
ended relationship · no relationship but a shared subject). Paste every assertion.

**PART 3 — `docs/TUTOR_VISIBILITY.md`.** The table: data type · who may see it · under what condition ·
why · what is refused. **With the refusals written down** and the reason the reader is a third party.
Plus: what changes if the user tightens the policy, and what changes if they loosen it.

**PART 4 — THE PORTAL ARCHITECTURE, NO UI.** Following P5-R1's precedent, **the route root that
exists stands: `/tutor`.** Report its IA (≤3 destinations), **and confirm every one resolves** — no
dead nav items, and **nothing in the nav may name a capability the registry does not declare built**
(P5-R7). Report what `/tutor` renders today and what it will render when this step's model exists —
**which is still nothing, honestly named.**

**PART 5 — THE ROLE PATH.** How an account becomes a tutor. **Report what exists today** (the role,
the guard, the absence of any way to acquire it) and **what the model needs** — without building an
admin surface, and without inventing an onboarding flow that implies a capability this step cannot
deliver.

**PART 6 — THE LEVERS: THE MODEL QUESTION ONLY.** 3.1 said a tutor shapes an environment via the five
levers. **Decide nothing here** — report the options: levers held per subject by the academy · levers
per tutor per subject · levers per relationship. **Name what each implies for the student's experience
(one subject, many tutors) and for the brand frame's invariance.** Recommend, with reasoning. **Build
nothing.**

**PART 7 — THE ENGINE'S P6 PROVIDER: REPORT, DO NOT BUILD.** What candidate could a tutor's space
resolve, given nothing exists? **Likely the origin-only case, mirroring the student's Tier 4.**
Confirm, and confirm **no provider ships that cannot resolve** (5.4's rules: capability-gated,
href resolves, one answer).

**PART 8 — `/dev/tutor-architecture`** (dev-only, `NODE_ENV !== 'production'`): the model · the policy
matrix · the policy-break results · the visibility table · the route/IA map · **what is real and what
does not exist yet** · and a plain statement that **no tutor interface exists as a result of this
step.**

**PART 9 — THE REGISTRY.** What Phase 6 adds as capabilities, **using P5-R7's unit** — and what stays
absent. **Do not mark anything live that has no surface.**

---

## CONSTRAINTS

- **NO INTERFACE.** No screens, no components, no IA beyond the route's honest placeholder, no copy for
  surfaces that do not exist.
- **NO SCHEMA CHANGE OUTSIDE THE RELATIONSHIP MODEL.** If something else is needed, **STOP AND REPORT.**
- **NO ADMIN SURFACE**, no matter how convenient.
- **NO NEW TOKENS, COMPONENTS, PRIMITIVES, MOTION OR DEPENDENCIES.**
- **NO SEEDED OR DEMO TUTOR/STUDENT DATA IN PRODUCTION.** Test accounts only, and **relationships
  between them only** — never a synthetic relationship involving an account that is not a test
  account.
- **NO REAL STUDENT DATA, ANYWHERE.** Report the row counts as 5.8 did.
- **DO NOT touch the certified subject system, the brand frame, the scene spine, Scenes 0–8, any Phase
  3/4 surface, 5.1's model except as extended here, 5.3's shell, 5.4's resolver, 5.5's write and region
  contract, 5.6's module and vocabulary, or 5.7's states and isolation pattern.**
- **DO NOT BEGIN STEP 6.2.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 ·
3.6's chrome and honest labels · the 3.7 baseline · the scene contract, spine, scroll grammar, voice
document · Scene 5's promises and vocabulary · 4.9's and 5.8's findings · 5.1's policies except as
extended · 5.3's IA and gates · 5.4's tiers and treatment map · 5.5's predicate and write · 5.6's model
and documents · 5.7's inventory, logger and `isolate.ts` · the registry's existing entries ·
`docs/proposed/progress_record.sql` · existing build and deploy setup.

---

## TESTS

1. **PRECONDITION** — the Phase 5 gate's entry-point recommendation, quoted, and confirmation this step
   is it.
2. **THE MODEL** — paste the relationship DDL and its constraints. **Report the uniqueness rule and
   what it prevents.**
3. **NO DEFAULT, NO INFERENCE** — prove a student's enrolment creates no relationship, and that no code
   path infers one. Paste the query and the result.
4. **THE POLICY-BREAK TEST, EXTENDED** — a tutor cannot read: a non-related student's rows · a related
   student's other subjects · a student's rows after the relationship ends · a student who shares a
   subject but has no relationship. **Paste all four, against the live database, and confirm RLS is
   the enforcement point, not application code.**
5. **THE STUDENT SIDE IS UNCHANGED** — a student's own reads, writes and surfaces are byte-comparable;
   the shell and environment harnesses show no diffs.
6. **NO ZERO FOR A TUTOR** — with a relationship and no events, paste exactly what a tutor would
   render. **No "0", no "no activity", no flag.**
7. **NO AGGREGATE** — grep for any query that counts, averages or ranks across students. **Expected:
   none.** Paste.
8. **NO EXPORT PATH** — grep for CSV, download, export, or any endpoint returning more than one
   student's data. **Expected: none.** Paste.
9. **ROUTE AND GUARD** — paste `/tutor`'s behaviour for a signed-out visitor, a student, and the test
   tutor: status codes and what renders. **Confirm no student can reach it and no tutor sees another
   tutor's data.**
10. **IA RESOLVES** — every nav item and link on `/tutor` returns 200. **No dead nav** (P5-R7).
11. **REGISTRY HONESTY** — paste the entries added and confirm nothing is marked live that has no
    surface; confirm the homepage's labels are unchanged (string by string) or record the declared
    exception.
12. **NO INTERFACE BUILT** — paste the file list of what was created. **Expected: model, policies,
    tests, documents, the dev route, and the route's honest placeholder — nothing else.**
13. **THE LEVERS QUESTION** — the options and the recommendation, in writing, with no implementation.
14. **THE ROLE PATH** — how an account becomes a tutor today, pasted, and the gap stated.
15. **DPDP NOTE** — in writing: this step added a capability for an adult to read a minor's record,
    gated by policy; confirm no real student data exists, no export path exists, no third-party access
    exists, and no retention behaviour was added. **Confirm the recommended default is changeable by
    policy alone, and report what tightening it would cost.**
16. **PRODUCTION BUILD** — succeeds; `/dev/tutor-architecture` absent or 404; no test data reachable;
    `.env.local` untouched and nothing secret printed.
17. **ROW COUNTS** — non-test identities in every table: **expected zero.** Paste.
18. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and **the gate's Phase 6 entry-point recommendation, quoted**
2. **The relationship model**, with the uniqueness rule and what it prevents
3. **The creation-flow options and your recommendation**, with the consent question named
4. **The policy matrix**, and **all four policy-break assertions pasted**
5. **`docs/TUTOR_VISIBILITY.md` in full** — what a tutor may see, what is refused, and why
6. What the tutor would render with a relationship and no events — **paste the strings**
7. The portal architecture: `/tutor` today, its IA, and confirmation every destination resolves
8. **The role path** — how an account becomes a tutor, and the gap
9. **The levers question** — options, implications for one-subject-many-tutors, and your recommendation
10. The engine's P6 provider verdict
11. The registry additions, and confirmation the homepage is unchanged
12. **What does not exist as a result of this step**, stated plainly
13. The DPDP note
14. Anything you could not implement, anything deferred, and confirmation nothing was half-built
15. Confirmation nothing outside the relationship model, the policies, the documents and the dev route
    was changed

**STOP after the report.** Do not begin Step 6.2.
