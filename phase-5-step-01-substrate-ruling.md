# TUTORS ACADEMY — PHASE 5 SUBSTRATE RULING (P5-R1)

**Attach to Step 5.1. Where this ruling and the 5.1 brief differ, this ruling wins.**
**Re:** the precondition-failure report on 5.3. **The stop was correct.** No auth exists, so 5.3 had
nothing to render against. Nothing was built, and nothing should have been.

Log this in your decision log under whatever number comes next (your D-08 addendum is on record).

---

## PART 0 — WHAT THIS RULING IS FOR

Your report identified the real gate correctly: **the Phase 5 plan requires a data substrate and a
real identity provider, and neither the locked stack nor the brief had been executed down to that
layer.** That decision is mine to make, not yours. It is made below.

Your precondition failure also revealed two things the plan did not know:

1. **Step 5.1's output does not exist on disk.** Phase 5 has not actually started, despite 5.1's
   brief having been issued.
2. **The project has no version control** (`git rev-parse` → not a repository).

Both are handled here. **5.3 remains blocked until 5.1's report exists.** Do not resume it early.

---

## PART 1 — THE SUBSTRATE: DECIDED

**Provider: Supabase.** Auth for identity and sessions, Postgres for data, **Row Level Security as
the enforcement point** for the permission matrix.

**This is not a new decision. It executes the stack locked in Phase 1.** The locked stack was never
installed, which is why this felt like an open question. It is not open.

**PERMITTED DEPENDENCIES — 5.1 only:**

```
npm install @supabase/supabase-js @supabase/ssr
```

Nothing else without a separate ruling. Zustand, TanStack Query, Motion and R3F remain authorised
in principle but **are not to be installed until a step genuinely needs them** — and each install is
reported with exact version and one-line reason.

**INTERPRETATION OF "NO NEW DEPENDENCIES"** — the rule as written in every step brief means *no
dependency outside the locked stack and not authorised by the step in hand.* **The locked stack is
not "new".** The constraint exists to stop a step reaching for a library to solve a local problem;
it does not freeze the architecture.

**SESSION MODEL:** cookie-based sessions via `@supabase/ssr`, refreshed in middleware. **No
localStorage sessions. No client-only session state. No fake session.**

**ENFORCEMENT:** the roles and permission matrix from 5.1 are implemented **as RLS policies**, not
as application-level checks. The test that proves a student cannot read another student's data runs
**against the database**, not against a mocked client. An application check is a convenience; the
policy is the boundary.

**SERVICE ROLE KEY**: server-only, never `NEXT_PUBLIC_`, never in a client bundle, never used for a
student-facing read. Report where it is referenced.

**VISITOR → STUDENT BOUNDARY:** a visitor needs no account for anything that does not persist. **Do
not gate `/`, `/subjects`, or the homepage behind auth.** An account is required the moment
something must be remembered.

---

## PART 2 — CREDENTIALS: THREE TIERS. REPORT WHICH ONE YOU ARE ON.

Two independent gates. Establish both before you write code, and state the result.

### GATE A — can the SDK be installed?

If `@supabase/supabase-js` and `@supabase/ssr` cannot be installed (no network, no package access),
**stop and report.** Nothing in 5.1 can be real without them, and improvising a substitute is
forbidden.

### GATE B — is there a live instance?

**TIER 1 — hosted Supabase project (preferred).** The user supplies, in `.env.local`:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and a server-only service-role key.
Add `.env*.local` to `.gitignore` **before anything else is written.**
**TIER 2 — local Supabase** (`supabase start`, Docker): identical schema, identical RLS, identical
auth, only the URL changes. Permitted if the environment supports it. Report the command output.
**TIER 3 — no live instance.** Then: write the schema, the migrations and the RLS policies as
committed files; write the code paths; run **every test that does not require a live instance**; and
**report auth as UNVERIFIED — not working, not tested, not complete.** Do not stub the session, do
not mock auth and call it verified, do not claim 5.1 complete. **5.3 stays blocked.** If you can see
a workable path in your environment that I have not, say so.

### FORBIDDEN

Hand-rolled sessions. NextAuth, Clerk, Better Auth, Lucia — none are in the locked stack. Any
credential committed to the repository. Any `.env` file in a commit.

**Report:** the tier, the exact env var names, and confirmation that nothing secret is committed
(paste `git status --porcelain` after the first commit).

---

## PART 3 — VERSION CONTROL, BEFORE ANYTHING ELSE

`git rev-parse` failed: there is no repository. **`git init`, and commit the current certified state
as the pre-Phase-5 baseline before 5.1 writes a line.**

5.1 introduces a database and an auth model. You need a rollback point, and both 3.7's committed
baseline and 4.9's recorded defects assume version control that apparently does not exist.

**First commit includes:** the whole working tree, plus every existing report — the 3.7 baseline, the
4.9 gate report, the D-08 addendum.
**First commit excludes:** `.env*`, `node_modules`, build output. Verify with `git status` afterwards.

If a `.gitignore` does not exist, creating it is the first file you write.

---

## PART 4 — ROUTE ROOT: DECIDED ON THE EVIDENCE. `/student` STANDS.

5.3's brief recommended `/learn`. **That recommendation was made without knowing `/student` already
exists** — and the brief's own rules say reuse beats creating and working code is not replaced for a
naming preference.

**DECISION: keep `/student`.** It is already in `ROUTES`, already one of `PORTAL_IDS` alongside
`tutor` and `admin`, and Phase 6 will want that symmetry. **Do not create `/learn`. Do not create a
parallel route.**

- Implement the shell **at the existing `/student` route, inside the existing `(portal)` group**,
  replacing the `NotBuiltYet` panel. That panel is the intended extension point, not a placeholder to
  work around.
- **AMENDED 5.3 RULE (supersedes the `/learn` recommendation):** *the route root is the one that
  already exists.* Any future portal wanting a different root is a Phase 6 decision.
- Any earlier reference to `/learn` in this plan is dead. Ignore it.

---

## PART 5 — THE HONESTY CONVENTION STANDS, AND NOW IT HAS TEETH

`src/config/modules` remains the single source of the "Next · not built yet" labels that Scenes 5–7
already derive from.

**Nothing in 5.1 or 5.3 may render, imply, or link to a capability that the module registry does not
declare as built.** This is 4.1's structural-honesty rule arriving at real product surfaces, where it
matters more: on the homepage a false claim is a lie to a stranger; in a student's own shell it is a
lie to someone who came back.

The login form's self-labelling comment — *"deliberately NOT wired to any authentication service"* —
is exactly the right instinct. Keep that standard. **It stops being necessary the moment auth is
real, and not one step before.**

---

## PART 6 — TWO THINGS 5.1 MUST NOW AUDIT, BECAUSE YOUR REPORT IMPLIES THEM

Your report lists installed dependencies as: `clsx, lucide-react, next, react, react-dom,
tailwind-merge`. **But Phases 2, 3 and 4 were certified complete**, and they included a motion
grammar, a reveal system, a spatial system, and 3.6's ambient 3D layer. Something does not add up.

**AUDIT A — report the full `package.json`, dependencies and devDependencies, verbatim.**

- If Motion and R3F are absent, **say so plainly** and report **how the certified motion was actually
  implemented** — CSS transitions, `IntersectionObserver`, hand-written keyframes, or not at all.
- If 3.6's ambient layer and 4.5's substrate exist as code, report the files. If they were labelled
  or deferred, report that instead.
- **A certified phase whose machinery was never installed is a defect to surface now, not in Phase
  7.** Do not quietly backfill a dependency to make an old report look correct.

**AUDIT B — what survived the sandbox reset.**

List what is on disk from Phases 2–4 that the baseline and the harness depend on: the committed
baseline file, `audit/page.cjs`, the `/dev/*` routes, the scene spine, the scene components, the
subject configs, the token layer. **Anything missing is a 4.9 regression.** Report it as such, with
the file list, so it is recorded rather than discovered later.

---

## PART 7 — THE LEGAL LINE, STATED ONCE

**Real auth means real accounts, so this is the moment to say it plainly:** the privacy policy,
terms, contact route and the DPDP Act 2023 position (including children's data — this product's
students include minors) are **launch blockers, and they are the user's to resolve.** They have
never been drafted or stubbed in code, and they must not be invented now.

**Build the mechanism. Do not open it.** Signup in Phase 5 is for test accounts only, and the report
must say so. Onboarding a real student is out of scope for the whole of Phase 5 — not because the
code would differ, but because the obligations begin the moment a real person's data lands in that
database.

**No seeded, demo or sample student records in production.** Test accounts are test accounts and are
labelled as such.

---

## HOW TO PROCEED

1. `git init` + first commit (Part 3). Report the commit hash.
2. Establish Gate A and Gate B (Part 2). Report the tier.
3. Read `prompts/phase-5-step-01-student-architecture.md` in full, if it is available to you; if it
   is not, report that before starting.
4. Execute 5.1 with this ruling attached.
5. Complete **Audit A** and **Audit B** (Part 6) inside 5.1's report, as their own sections.
6. Report using 5.1's report format, plus: **the tier**, **the commit hash**, **Audit A**, **Audit B**,
   and a plain statement of whether auth is **VERIFIED** or **UNVERIFIED**.

**Then stop.** 5.3 resumes only after 5.1 reports and its precondition is met. Do not begin 5.3, 5.4
or any other work in this turn.
