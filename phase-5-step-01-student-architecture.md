# TUTORS ACADEMY — Phase 5 · Step 1
## Student Experience Architecture — Data Model, Roles, and the Honest Map

> Depends on Phases 2, 3 and 4 (certified).
>
> **This step builds NO interface.** No dashboard, no cards, no student shell, no screens.
> It defines: the stack lock, the data model, roles and permissions, the auth boundary, the
> momentum principle, and the honest map of what exists today.
>
> **If Phases 2–4 are not certified, STOP and report.** This step assumes the environment system
> is real, because the student experience is built on top of it.

---

### WHY THIS STEP EXISTS

Every phase so far has been **presentational**. The homepage renders what the scene config says.
The environments render their own identity. **Nothing has needed to know anything.**

A student command center is the first thing in this product that needs **real data**:

- who the student is
- what they are enrolled in
- where they were, last time
- what they have done
- what is next

**None of that exists.** And Phase 1's foundation setup was never executed — there is no locked
backend, no auth, no schema, no folder architecture for server/client boundaries.

So this step builds the foundation, and defines the model that Phases 6, 7, 8, 9 and the eventual
admin will all be built on. **Get it wrong here and every later phase pays for it.**

---

### THE THREE LOCKED PRINCIPLES

**1. MOMENTUM, NOT ACCOUNTING.**

The homepage's job is a **decision**. The student space's job is **returning**.

> **The student space exists to make a student return tomorrow, and to make sure they know what
> to do when they do.**

- **One test for every proposed element: does this help the student take the next action, or does
  it report on past actions?**
- **Reports are permitted only where they create momentum** — where seeing the state changes what
  the student does next.
- **A statistics dashboard is a failure state.** Progress exists in this product to *orient*, not
  to audit.
- **The student should be able to answer "what should I do next?" in under three seconds**, at
  every visit, in every state — including with nothing at all.

**2. THE EMPTY STATE IS THE PRIMARY STATE.**

- A new student has **no classes, no recordings, no resources, no progress, no streak, nothing.**
- **That is most arrivals.** It is the most common experience of this product — **not an edge
  case.**
- **The null state is therefore a first-class design surface**, not a fallback. It is built and
  designed before the populated state.
- **A product that looks empty is not the same as a product that looks broken.** These must be
  designed as different states with different treatments. **Report how they differ.**
- **No skeletons, no shimmer, no "loading" on a state that is simply empty.** Loading and empty are
  different states (3.6 rule, carried forward).

**3. THE NEXT-ACTION ENGINE RESOLVES TO WHAT EXISTS TODAY.**

The command center's heart is a **next-action derivation**. But:

| Capability | Phase | Exists today? |
|---|---|---|
| Live classes | 7 | **No** |
| Recordings | 8 | **No** |
| AI learning layer | 9 | **No** |
| Progress tracking | 9 | **No** |
| **The environments** | 3 | **YES — certified** |

**So the honest next action today is: continue in your environment.**

- **This is not a placeholder.** It is the correct action, and it happens to be **exactly the hook
  the product is built on** — the thing Scene 3 offered and Scene 4 crossed.
- **The engine must be designed so future phases add sources to it**, not rebuild it. **Report the
  extension contract:** how does Phase 7 add "a class starts in 20 minutes" as a higher-priority
  action without rewriting the engine?
- **Priority order matters.** Define it now, with today's sources, and state where future sources
  slot in.

---

### FIRST: INSPECT

1. **Everything that exists**, so the map in Part 6 is accurate: routes, components, the scene
   spine, the subject system, the environment shell, the honest placeholder treatment.
2. **Step 2.6** — the **honesty decision** about auth, and exactly what was rendered instead. This
   step resolves it.
3. **Step 3.1** — the subject schema, **the `id` immutability rule and its stated purpose** (keying
   progress, recordings, classes, tutoring data). **This is the anchor the whole data model hangs
   from.** Report the exact wording.
4. **Step 4.4 + amendment** — the eligibility model and the derived-copy pattern. **The student
   space uses the same eligibility model** — a student may be enrolled in a `draft` subject.
5. **Step 3.7 and 4.9** — the committed baseline, the audit harness, and every recorded defect and
   deferred item. **Report anything already deferred that this step must account for.**
6. **The stack table** in the prompt log, and whether any of it was ever actually installed.
   **Report the real state of the dependencies, not the intended state.**
7. **Any existing backend, auth, database or environment configuration.** Report and extend.

Report findings before building anything.

---

### BUILD — PART 1: THE STACK LOCK (foundation setup, executed now)

**This should have happened in Phase 1 Step 2. It never did. So it happens here, and it is
scoped to what Phase 5 and later actually need.**

- **Confirm or revise the stack**, and state the decision explicitly:
  - backend provider (database, auth, storage, realtime)
  - the migration approach and where schemas live
  - environment variable handling and where secrets live (**.env.example only — never commit
    secrets**)
  - the **server/client boundary** — what runs where, and the rule that prevents leaking server
    concerns into client bundles
- **Folder architecture for the backend:** where schema, migrations, policies, queries and types
  live. **Follow the existing conventions from Phases 2–4** — do not introduce a second pattern.
- **Generate types from the schema** so the client and server share one source of truth. **Report
  the type-generation command.**
- **No local-only state that pretends to be persistence.** If data is not persisted, it is not
  data.

**If no backend provider is appropriate, STOP and report with reasoning** — do not invent a fake
one, and do not build a client-only mock and call it a data layer.

---

### BUILD — PART 2: THE DATA MODEL

Define the schema. **Designed for Phases 6–9 and admin, populated for what exists today.**

**Required entities — shape first, then what is actually populated:**

```
profile              — the person. Extends the auth identity. No duplicate credentials.
role                 — 'student' | 'tutor' | 'admin'. A person may hold more than one.
subject              — mirrors the 3.1 config. The immutable `id` is the anchor.
enrolment            — student × subject. The RELATIONSHIP, and the student's entry point.
environment_state    — where this student is: current subject, last position, last visit.
class_session        — Phase 7 shape. Needs: tutor, subject, time, status, join state.
recording            — Phase 8 shape. Needs: subject, topic, duration, position-kept.
resource             — Phase 8/9 shape. Needs: subject, type, provenance.
progress_record      — Phase 9 shape. Keyed to the IMMUTABLE subject id.
```

**Rules that must hold in the schema itself:**

- **`subject.id` is the anchor.** Every record that will outlive a subject's marketing copy keys to
  it. **State this in the schema, referencing 3.1.**
- **Enrolment is the relationship, not a flag on the profile.** A student is enrolled in subjects;
  the enrolment is where state, progress and permissions attach.
- **`environment_state` is the one entity that makes Phase 5 useful today.** It holds: current
  subject, last position, last visit. **It is the data behind "continue in your environment."**
- **Session, recording and resource entities are declared but empty.** They are **shaped now,
  populated in their own phases.** Report which are empty.
- **Every entity gets `created_at` / `updated_at`** and a clear owner. **No orphan rows.**
- **Soft deletes or hard deletes — pick one and state it.** Do not mix.
- **No entity may store a value that duplicates a subject config.** Subject names, taglines and
  accents live in config; the database stores the `id`. **A duplicated name is a drift bug.**

---

### BUILD — PART 3: ROLES AND PERMISSIONS

**Per the brief: keep admin architecture in mind without building its UI.**

- **Roles are modeled now.** Student, tutor, admin — and the rule for a person holding more than
  one.
- **Permissions are enforced at the data layer, not the UI.** Define the policy matrix — **who can
  read and write what** — and implement it at the database/provider level (row-level security or
  equivalent).
- **The matrix must cover at minimum:**

| | student | tutor | admin |
|---|---|---|---|
| own profile | read/write | read/write | read |
| others' profiles | none | limited (their students) | read |
| own enrolment | read/write | — | read/write |
| their subject's students | — | read | read/write |
| sessions | read own | read/write own | read/write |
| recordings | read enrolled | read/write own | read/write |
| progress | read/write own | read their students' | read all |

- **A student must never be able to read another student's data.** Prove it with a test, not a
  claim. **Paste the test.**
- **Report any permission that cannot yet be enforced** because the entity is unpopulated, and how
  it will be enforced when populated.

---

### BUILD — PART 4: THE AUTH BOUNDARY

**Real auth is a prerequisite, not a phase.** No student experience exists without identity.

- **Implement real authentication**, not a stub. Sign-in, sign-out, session handling, and
  protected routes.
- **Resolve the 2.6 honesty decision.** Whatever was rendered instead of a user menu — a
  placeholder, an omitted element, an honest "sign in" entry — is now replaced with something
  real. **Report the before and after.**
- **Define the visitor → student relationship explicitly**, because it interacts with a Phase 4
  decision:
  - **The homepage still ENDS AT ENTER** (4.1). **A visitor can enter an environment without an
    account.** This does not change.
  - **An account is required for anything that persists** — enrolment, environment state,
    progress.
  - **So define where the account is asked for:** on entering, on returning, or on first action
    that needs persistence. **Propose the boundary, with reasoning, and report it.** Do not
    implement the UX here — **define the boundary.**
- **No fake auth.** No mock session, no hardcoded user, no "logged in as Demo Student." **If auth
  cannot be implemented, STOP and report.**
- **Sign-out must actually end the session**, and protected routes must actually redirect.
- **Report the session strategy**: cookie vs token, expiry, refresh, and the security posture.

---

### BUILD — PART 5: THE MOMENTUM PRINCIPLE, WRITTEN

**Commit the rule as a document, so later phases write against it rather than re-deciding.**

It must state, precisely:

- **The single job** of the student space.
- **The next-action test** every element must pass.
- **The priority order** for next-action sources — today's, plus where Phases 7–9 slot in.
- **What is forbidden:** any element that only reports, any statistic with no action attached, any
  metric that exists to look impressive.
- **The three-second rule:** the student answers "what should I do next?" in under three seconds,
  in every state.
- **The extension contract:** how a later phase adds a next-action source.

---

### BUILD — PART 6: THE REAL-VS-UNBUILT MAP

**A single honest table in the repo.** This is the document every later phase reads.

For each capability the product will have, state:

| Capability | Phase | Exists today | Data available | What the student space may show |
|---|---|---|---|---|

**Rules:**
- **Cross-check every entry against the codebase.** Do not trust the phase plan.
- **Anything listed as existing must be demonstrable.**
- **Anything not existing must be named as unbuilt** and rendered per the honesty treatment when
  it eventually appears.
- **Report the map in full.**

---

### BUILD — PART 7: THE STUDENT SHELL CONTRACT (shape, not design)

**Define the shell's architecture now so Step 5.3 can build it without re-deciding.**

- **It is a Room** (2.4 / 3.6). Contained, compact density, **no substrate, no canvas, vector
  only.**
- **It is subject-scoped or subject-agnostic?** Decide and justify. **Recommendation to consider:**
  the student space is **subject-agnostic chrome with a subject-scoped workspace inside it** —
  because a student is enrolled in several subjects and the shell should not pretend otherwise.
  **Report the decision either way.**
- **What the shell must never contain:** invented stats, a fake streak, a leaderboard, a
  leaderboard-shaped thing, gamification, or a notification bell with nothing behind it.
- **Where the next-action surface lives**, and its priority position.
- **How it handles zero enrolments**, and how it handles one, and several.
- **Its relationship to the environment shell** (3.6) — what is shared, what differs. **Do not
  duplicate chrome.**

---

### SPECIMEN ROUTE — `/dev/student-architecture` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:

- **The data model rendered as a readable diagram or table** — entities, relationships, which are
  populated and which are empty.
- **The permission matrix**, with the enforcement points marked.
- **The real-vs-unbuilt map**, live.
- **The momentum principle**, rendered as reference.
- **The next-action priority order**, with today's sources marked and future sources shown as
  slots.
- **A state panel** showing, for a test account: profile, roles, enrolments, environment state —
  **and honestly showing the empty entities as empty.**
- **The auth boundary decision**, stated on the page, with the visitor→student reasoning.
- **A note stating what this step built** (foundation, model, roles, auth, documents) **and what it
  explicitly did not** (any student interface).

---

### CONSTRAINTS

- **No student interface of any kind.** No dashboard, no cards, no shell, no screens. **Those are
  5.3 onward.**
- **No fake data presented as real.** Test accounts and seed data must be **clearly marked as test
  data** and **must never be reachable in production.** Enforce mechanically.
- **No mock auth. No hardcoded user. No demo session.**
- **No speculative entities beyond the list in Part 2.** Do not model payments, messaging,
  notifications, or anything not required by a phase in the plan.
- **No admin UI.** Roles and permissions only.
- **Do not modify** the subject system, brand frame, scene spine, primitives, or any certified
  Phase 3/4 surface.
- **No new tokens, colours, components, or primitives.**
- **Do not add a UI library, an ORM beyond what the provider requires, or a state manager.**
  If a dependency is genuinely required for auth or data access, **stop and report** with
  reasoning.
- **Do not build the tutor experience** — that is Phase 6.
- Do not touch existing `/dev/*` routes beyond adding this one.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- The entire subject system (3.1–3.6)
- The committed baseline (3.7) — extend if needed, do not rewrite
- The scene contract, scene sequence, scroll grammar, voice document, honesty treatment (4.1)
- Scenes 0–8 and the footer (4.2–4.8)
- The homepage's ENDS AT ENTER decision (4.1)
- The `/subjects` scaffold
- Existing routes, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Auth works end to end** — sign up, sign in, sign out, protected route redirects, session
   persists across reload. Report each.
2. **No fake auth** — grep for hardcoded users, demo sessions, mock auth, bypass flags.
   **Expected: none.** Paste the sweep.
3. **Permission enforcement** — a student cannot read another student's data. **Paste the test and
   its result.** Then deliberately break the policy and confirm the test fails. Revert.
4. **Test data is unreachable in production** — confirm production cannot serve seed or test
   accounts. **Paste the enforcement point.**
5. **Type generation** — the command runs, and types match the schema. Paste the output diff or
   confirmation.
6. **Server/client boundary** — confirm no server-only value or secret reaches the client bundle.
   **Paste the check.**
7. **Secrets** — confirm no secret is committed; `.env.example` exists and is accurate. Report.
8. **Schema integrity** — no orphan entities, no duplicated subject names or taglines in the
   database, every entity has an owner and timestamps. Report the check.
9. **Subject id anchor** — confirm every record keys to the immutable subject `id`, never to a
   name or slug that could change. Report the check.
10. **The empty entities are genuinely empty** — confirm `class_session`, `recording`, `resource`
    and `progress_record` are shaped and unpopulated. Report row counts.
11. **Migrations** — apply cleanly from a fresh database. **Paste the migration run.** Then confirm
    a rollback works.
12. **The real-vs-unbuilt map is accurate** — cross-check every claim against the codebase and
    report any mismatch.
13. **`/dev/student-architecture` renders correctly**, both themes, and is absent or 404 in
    production.
14. **Production build** succeeds.
15. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — and confirmation **no interface was built**
2. **The stack decision** — provider, migration approach, environment handling, folder
   architecture, type generation. Include the **real** dependency state, not the intended one.
3. **The complete data model** — entities, fields, relationships, and which are populated vs empty
4. **The subject-id anchor** as implemented, referencing 3.1's rule
5. **The role and permission matrix**, with **enforcement points** and the security test result
6. **The auth implementation** — strategy, session handling, and the **before/after of the 2.6
   honesty decision**
7. **The visitor → student boundary** — where the account is asked for, with reasoning
8. **The momentum principle**, as committed
9. **The next-action priority order** — today's sources, and where Phases 7–9 slot in
10. **The real-vs-unbuilt map**, in full, cross-checked against the codebase
11. **The student shell contract** — including the subject-agnostic vs subject-scoped decision, and
    the zero/one/several enrolment behaviour
12. **Every test result**, including the deliberate permission-policy break
13. **Anything you could not implement**, and why — with the phase that resolves it
14. **Anything deferred**, and confirmation nothing was half-built
15. Confirmation that nothing in the brand frame, subject system, homepage, primitives, or existing
    routes was changed

---

### STOP

End after the report. Do not begin Step 5.2 (the student shell) or build any student interface.
