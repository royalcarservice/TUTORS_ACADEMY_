# TUTORS ACADEMY — PHASE 5 · STEP 7: THE STUDENT STATES

Loading · error · partial · expired · unknown-outcome · offline.

Depends on 5.3, 5.4, 5.5, 5.6, and every ruling in force (P5-R2 through P5-R8).

**PRECONDITION — 5.6 REPORTED.** Confirmed. And **three close-out items from earlier rulings are
folded into this step** (Part 0 below) — they are small and they belong to the evidence chain.

**THIS STEP IS MOSTLY DECISIONS AND REFUSALS.** Expect to build very little. Expect to *decide*
everything, and to write down what was refused and why. **A spinner library would be a failure of
this step.**

---

## WHY

Every surface so far was designed in its working state: the shell when it answers, the environment
when it opens, the arc when the record is empty but correct. **This step is about the states nobody
designs, which students see constantly** — the flaky connection, the expired session, the request
that failed, the page that arrived halfway.

**AND IT IS WHERE THE PROJECT'S HONESTY DISCIPLINE IS EITHER REAL OR DECORATIVE.** An overstatement
in a working state is corrigible — the student clicks and finds out. **A lie in a failure state is
not**, because the student has no way to check it. *"We couldn't save that"* when it saved. *"You're
offline"* when the server returned a 500. *"Try again later"* when trying again would work.
Service-rendered products lie more in their error states than anywhere else, and almost always by
accident, because error copy is written last by whoever is least sure what actually happened.

**THE RULE THIS STEP ENFORCES, AND IT IS ONE SENTENCE: WHEN THE OUTCOME IS UNKNOWN, SHOW STATE — NOT
A VERDICT.** Every surface in this product can be re-read. The truth is one request away. **Say what
is known, render what is true, and never issue a verdict the system cannot support.**

---

## PART 0 — CLOSE-OUT ITEMS FROM EARLIER RULINGS

**These are prerequisites, not extras.** Do them first and report them.

1. **THE DDL'S HOME, PER P5-R6 AMENDMENT 3.** Confirm where the proposed `progress_record` DDL lives.
   - It belongs at **`docs/proposed/progress_record.sql`** — **not** in `supabase/migrations/`, where
     it is an applied migration waiting to happen the next time anyone runs psql or db push. **The
     location is the control.**
   - The file's header states: NOT APPLIED · do not apply without a ruling · applied only in the step
     that creates the first real event kind, alongside the real object it references.
   - It records **the open question rather than guessing**: how one table references heterogeneous
     real objects (sessions, recordings, resources) — typed column per kind · `object_kind` +
     `object_id` · join table per kind — with tradeoffs. **Do not choose now**; choosing needs P7.
   - RLS as a placeholder with its dependencies named: student reads own events · **what a TUTOR may
     see is P6's decision and is not pre-solved** · retention is undecided, so no policy may encode a
     retention assumption.
   - And the prerequisite is recorded where P7 will see it: **creating `progress_record` is Phase 7's
     first task.**
   If it currently exists only inside a report, create the file. If it is already there, paste its
   header and confirm the four contents above.

2. **THE `record` REGION vs THE `progress` SLOT — STATE THE RELATIONSHIP.** 5.6 added a `record`
   region (the arc) and kept a `progress` slot gated on facts. Two similarly-named things will
   collide when P9 lands real records.
   - Report what each is, what each renders, and **what renders when P9's real progress arrives.**
   - **The arc is not a progress figure and never merges with one.** If both ever render, they are
     distinct objects with **distinct headings**, and the arc's vocabulary stays 4.7's.
   - Write the composition rule down in the region contract, one paragraph, so P9 inherits it.

3. **THE FIXTURE-DATE DEFECT.** The shell harness's pinned strings drifted twice because fixtures
   carry absolute timestamps and the copy says "yesterday". Resetting the rows by hand is the
   workaround, and it will keep working — which is the problem.
   - **Stamp the fixtures' relative timestamps at run time, idempotently**, in the harness's own setup
     (`scripts/test-account.mjs` or a sibling), so the string is stable without freezing a clock and
     without a human remembering.
   - **A TEST THAT FAILS ON A DATE RATHER THAN ON A REGRESSION IS NOT A TEST.** Report the change and
     prove it by running the harness twice, once with a fixture aged by hand.

---

## FIRST: INSPECT

1. **What Next renders today, in every failure mode.** `error.tsx`, `not-found.tsx`,
   `global-error.tsx`, `loading.tsx` — which exist, at which route levels, and **what they actually
   say.** Paste the current text of each.
2. **The route inventory** and which ones are server-rendered vs client components. **Count how many
   loading states genuinely exist**: a server-rendered page has none, because the browser owns it.
3. **The four form routes** — sign-in, register, begin-here (5.5's write), sign-out — their failure
   paths, what they render when the POST fails, and whether anything is claimed about the outcome.
4. **The auth boundary's failure modes** — session expired mid-action, signed out mid-action, a
   307 to `/login?next=` and **what happens to `next` after a successful sign-in.**
5. **5.4's provider-failure isolation** — the pattern already in place. **This step reuses it at the
   region level; name the shared pattern once and use it in both places.**
6. **5.5's region contract** — how a region renders nothing, and how it is gated.
7. **The 404s**: a missing subject · a draft subject for a non-enrolled reader · a route that does not
   exist. **And the tension to check:** `/subjects` lists a draft subject honestly with 3.6's label,
   while the direct route 404s. **Confirm the product never denies, in one place, an existence it
   asserts in another** — report the finding and the current behaviour; do not redesign it here.
8. **Everything already banned**, so this step bans nothing twice and contradicts nothing: 4.1's voice
   and banned list · 5.1's report-only ban · 5.3's never-contains list · 5.4's honesty rules · 5.6's
   vocabulary document, including **the subject rule**.
9. **The harnesses and the baseline** — what exists to extend, and the 390 reference.

Report findings before building.

---

## RULING P5-R8 — AN ERROR IS A SENTENCE, NOT A SCENE

**1. AN ERROR MESSAGE IS A CLAIM.** Never claim an action failed unless the failure is known; never
claim it succeeded unless it is confirmed. **When the outcome is unknown, show state, not a verdict.**

**2. THE SUBJECT RULE** (5.6, now standing). The grammatical subject of a limitation, absence or
failure sentence is **the product or the environment, never the student.**
*"We couldn't open your space just now."* ✓ · *"You did something wrong."* ✗ · *"Something went
wrong."* — true but weak; **prefer naming what could not happen.**

**3. NO ERROR DESIGN LANGUAGE.** No red panels, no alarm icons, no exclamation triangles, no shake, no
toasts, no modals, no full-width banners. **Same type, same Room, one sentence, one action.** And **no
apology theatre** — no "Oops", "Uh-oh", "Whoops", "Sorry!". The voice is adult and plainspoken (4.1).

**4. NEVER BLAME, NEVER VAGUELY ACCUSE.** Not "you entered the wrong password" when it could be our
bug; not "invalid" without saying what is invalid. **Vagueness is permitted only where it is a
security decision** (sign-in's "Invalid login credentials" is one) — never for convenience.

**5. EVERY ERROR OFFERS THE TRUTHFUL NEXT ACTION**, and it must be true. **No "contact support"** — no
such route exists (still a launch blocker). **No "please try again later" as the whole sentence.**
Where retrying is genuinely safe, say why: the write is idempotent, and that is sayable in plain
words.

**6. NO SYSTEM INTERNALS TO THE STUDENT.** No stack traces, no SQL, no table names, no error codes.

**7. NO PROGRESS THEATRE.** No spinner on a page that is simply arriving. **No determinate bar for an
indeterminate wait** (the `ui/progress.tsx` primitive remains off-limits for anything but a real,
simultaneous denominator). **No artificial minimum display time** — if it is fast, it is fast; a
300 ms spinner is a lie about latency.

**8. LOADING HAS ALMOST NO HOME HERE, AND THAT IS THE FINDING, NOT A GAP.** This product is
server-rendered: **a page that has not arrived yet is the browser's job**, with its own progress
indicator, and it does not need ours. Loading copy exists only where **the student's own action is in
flight**, and it says what is happening, in the voice — *"Beginning…"*, not *"Loading…"*.

**9. A FAILED SUPPLEMENTAL REGION IS SILENT.** No red box beside working content, no "couldn't load",
no placeholder. **It renders nothing, like an unpopulated region — and the server logs it**, because
silence in the interface must not mean silence in the system. **The primary answer is the exception it
may never be silently absent:** if the engine cannot answer, the benign action renders (5.4); if even
that cannot resolve, **the page fails honestly rather than rendering a shell with a hole in it.**

**10. NEVER SHOW A STATE YOU CANNOT KNOW.** Not "You're offline" — a failed request could be a 500, a
timeout, a proxy, a paused project. **Claim only what is known**, which is usually "we couldn't reach
it", never "you are disconnected".

**11. NOTHING OBSERVES THE STUDENT.** Server error logs carry error class, route and ids — **never
student content, never a person's data**. No analytics, no beacons, no third-party error reporting.

**12. NO SILENT AUTO-RETRY OF WRITES.** A GET may be retried by the browser or a proxy — that is
normal and harmless. **A POST that changes something is never retried behind the student's back.**

---

## OFFLINE — THE HONEST REFUSAL

**Offline is not a state this product can render, and that is the correct answer.**

It is server-rendered with no service worker: when the network is gone, **the browser shows its own
failure page and nothing of ours renders at all.** That is not a gap to close.

- **DO NOT add a service worker to "handle" offline** — and not only for scope. A service worker means
  **caching student data on the device**, which is a decision about minors' data at rest that nobody
  has made. **Student data is never cached on the device.**
- The evidence for this section is therefore **negative**, and it must be gathered: with the network
  off, prove that nothing of ours renders, **nothing is cached, and no student data persists in the
  browser** — check storage, IndexedDB and Cache Storage, and paste the result.
- **The recovery surface is the environment page** — a GET that always shows truth. **After a POST
  with an unknown outcome, that is where the student is sent**, because the page's real state is a
  better answer than any message we could write.

---

## THE THREE SCOPES

Every state below is one of three, and the treatment differs:

- **PAGE** — the whole surface cannot render. An honest page, in the brand frame, one sentence, one
  action, one h1.
- **REGION** — a supplemental part failed. **Silence + a server log. Nothing else.**
- **ACTION** — the student did something and its outcome is known, failed, or unknown. **A sentence
  beside the control**, in the same design language as everything else.

---

## THE STATE INVENTORY — THE STEP'S CENTRAL DELIVERABLE

**A table, in a document (`docs/STATE_LANGUAGE.md`), with one row per state:**

| state | where it occurs | what renders | **what it claims** | how the claim is verified |

Cover at minimum:

1. **A page arriving** — no state, deliberately (P5-R8.8)
2. **Soft navigation pending** (Next's client transition) — what appears, and is it a claim?
3. **A supplemental region failing** — silence + log
4. **The primary answer failing** — benign action, then honest page failure
5. **The environment page failing entirely** — honest page
6. **A write in flight** — what the student sees, and **what the product claims while it is unknown**
7. **A write that returned a failure** — known-failed, what is claimed
8. **A write whose outcome is unknown** (network died mid-POST) — **the critical one. No verdict. The
   environment page, which shows truth.**
9. **A write that failed after committing** — the honest case; the re-read settles it
10. **Session expired mid-action** — what happens to `next`, and what the student is told
11. **Signed out mid-action** — same, without an alarm
12. **404 — no such subject**
13. **404 — a draft subject, non-enrolled reader** (and the `/subjects` tension from INSPECT §7)
14. **Role redirect** — a student reaching `/tutor` lands on their own space (P5-R2), stated honestly
15. **500** — an honest page
16. **The project unreachable** (the paused-project case) — recognizable in dev, honest in production
17. **A double submit** — one enrolment, no error, no duplicate, no message
18. **A slow network** — nothing added, nothing claimed
19. **Offline** — the refusal above, with negative evidence

**For every row: exactly what the student is told, and the test that proves it is true.** A row whose
claim cannot be verified does not ship.

---

## BUILD

**PART 1 — `docs/STATE_LANGUAGE.md`**: the inventory table · the copy list (every shipped sentence in
every state, with 2–3 candidates and the choice for each novel one) · the refusals, written down
(no service worker, no spinners, no toasts, no "offline" claims we cannot make, no support links, no
error codes) · and the subject rule restated, with examples.

**PART 2 — THE PAGE LEVEL.** `error.tsx` (a *dumb* client component — no data fetching, no client
state) and `not-found.tsx`, reviewed or added at the route levels that need them. Brand frame, Room
chrome, one h1, one sentence, one action, one primary. **Not a second homepage** — no marketing, no
extra nav, no links beyond the truthful action.

**PART 3 — THE ACTION LEVEL.** The four form paths: what they render on known failure, what they
claim while in flight, and **no added client JS.** If an existing client form shows something
during submit, **report what it shows and confirm it claims nothing about the outcome.** The submit
control must not become a spinner that pretends to know the duration.

**PART 4 — THE REGION LEVEL.** One reusable isolation wrapper (name it once; **the same pattern as
5.4's provider isolation**, used in both places), silence on failure, a server log on failure, and the
primary-answer exception implemented.

**PART 5 — THE LOGGER.** One function, no dependency, no third-party service. Error class, route, ids.
**Never student content.** Report what a log line contains, verbatim, from a real forced failure.

**PART 6 — THE SESSION-EXPIRY RETURN.** A student sent to sign-in mid-action **returns to where they
were**, and is told what happened in one plain sentence — no alarm, no abandonment.

**PART 7 — `/dev/student-states`** (dev-only, `NODE_ENV !== 'production'`):
- **every row of the inventory rendered**, at 390 first, both themes, with its claim printed beneath
  it so the claim and the rendering are read together
- forced failures: a thrown region resolver, a forced 500, a forced 404, an expired session, a
  double submit, a POST with the network cut after send
- the negative offline evidence rendered as its findings
- grayscale, reduced motion, no-JS, 390 first paint
- a plain statement: **what is real, and what is a dev-only simulation**

---

## CONSTRAINTS

- **NO SPINNERS, TOASTS, MODALS, BANNERS, OR ERROR ICONS.** No new design language of any kind.
- **NO SERVICE WORKER. NO CACHING OF STUDENT DATA. NO localStorage OF ANY STUDENT DATA.**
- **NO NEW DEPENDENCIES.** No error-reporting SDK, no toast library, no form library.
- **NO CLIENT JS ADDED** to any route. Report the payload before and after, per route.
- **NO ANALYTICS, BEACONS, OR ERROR TELEMETRY TO ANY THIRD PARTY.**
- **NO ARTIFICIAL LATENCY** in any loading state, and no minimum display time.
- **NO CHANGES TO THE PRIMARY SURFACE, THE ARC, THE REGIONS, OR THE ENGINE** beyond the failure
  handling required above.
- **NO REDESIGN OF THE 404s** — report the tension in INSPECT §7, then leave the behaviour as it is.
- Do not touch 5.6's computation module, vocabulary document or arc region; 5.5's write, predicate or
  region contract beyond the composition rule in Part 0; 5.4's resolver, tiers or treatments; 5.3's
  three null states' composition; 5.1's model, roles or policies; the certified subject system; the
  brand frame; or any Phase 3/4 surface.
- **DO NOT BEGIN STEP 5.8** (the phase gate).

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives (including the frozen `ui/progress.tsx`) · brand mark,
lockup, nav shell · subject system 3.1–3.6, the door logic, and the 404 behaviour · 3.6's chrome and
honest labels · the 3.7 baseline and the harnesses · the scene contract, spine, scroll grammar, voice
document · Scenes 0–8, the footer, Scene 7's arc vocabulary · 4.9's findings · 5.1's model, roles,
policies · 5.3's IA, nav, ratio, fold gate · 5.4's resolver, providers, extension contract · 5.5's
write, predicate, region contract · 5.6's module, arc region, `src/config/arc.ts` · `/subjects`
scaffold · the module registry's entries · existing build and deploy setup.

---

## TESTS (all required)

1. **CLOSE-OUTS** — Part 0's three items, each with evidence: the DDL's location and header · the
   `record`/`progress` relationship and the composition rule · the fixture-stamp fix, proven by a
   hand-aged fixture.
2. **INVENTORY COMPLETENESS** — every row of the state inventory renders in `/dev/student-states`, and
   every row's claim is verified by a test. Paste the table.
3. **THE UNKNOWN-OUTCOME CASE** — cut the network during the enrolment POST. **Assert: no claim of
   failure, no claim of success, and the student ends on a surface showing true state.** Paste the
   observation and the resulting row.
4. **FAILED-AFTER-COMMIT** — force a failure after the write commits. Assert the student sees truth,
   not a verdict. Paste.
5. **DOUBLE SUBMIT** — two rapid POSTs → one enrolment, no error, no message. Paste the row count.
6. **NO WRITE ON RETRY** — a retry of the write does not create a second enrolment. Paste.
7. **REGION FAILURE** — a thrown region resolver renders **nothing**, logs one line, and the rest of
   the page is intact. Paste the DOM and the log line.
8. **PRIMARY CANNOT BE SILENT** — force the engine to fail: the benign action renders; force that to
   fail too: an honest page, not a shell with a hole. Paste both.
9. **NO FABRICATED LOADING** — grep for spinner, skeleton, shimmer, `setTimeout` in any rendering
   path, and any artificial delay. Paste every hit with its justification or removal.
10. **PROGRESS BAR PRIMITIVE** — confirm `ui/progress.tsx` remains unused by any student surface, and
    that no indeterminate wait renders a determinate bar. Paste the imports grep.
11. **OFFLINE — NEGATIVE EVIDENCE** — network off: nothing of ours renders, no service worker is
    registered, and **no student data exists in storage, IndexedDB or Cache Storage.** Paste the
    inspection output.
12. **NO SERVICE WORKER ANYWHERE** — grep the repo and the browser. Expected: none.
13. **NO STUDENT DATA AT REST IN THE BROWSER** — after a full journey, inspect storage and cookies;
    report exactly what persists and confirm it contains no student content.
14. **THE SUBJECT RULE SWEEP** — every shipped string in every state, checked for a sentence whose
    subject is the student. Paste the list with verdicts.
15. **BANNED ERROR LANGUAGE** — grep for oops, uh-oh, whoops, sorry, oopsie, "something went wrong",
    "try again later", "contact", "support", "please". Paste every hit with justification or removal.
16. **NO INTERNALS** — force a 500 and paste the rendered page; confirm no stack, no SQL, no table
    name, no code.
17. **NO BLAME ON FAILED SIGN-IN** — paste the exact copy for a wrong password and confirm it neither
    blames nor reveals whether the account exists.
18. **SESSION EXPIRY RETURN** — expire a session mid-action; confirm the student returns to the same
    place afterwards and is told in one sentence. Paste the journey with status codes.
19. **404s** — no-such-subject and draft-non-enrolled, pasted, with the `/subjects` listing beside
    them; report the tension from INSPECT §7 and confirm nothing was redesigned.
20. **ROLE REDIRECT** — a student at `/tutor` lands on their own space with no error language. Paste.
21. **DOUBLE SUBMIT UI** — confirmation that no client JS was added to make a button "safe".
22. **NO CLIENT JS ADDED** — the JS payload per route, before and after, pasted.
23. **ACCESSIBILITY OF EVERY STATE** — one h1, correct heading nesting, reading order puts the message
    first, focus lands at the top of the document on a fresh load, contrast ratios at both themes,
    text-only status, 200%/400% zoom, WCAG 1.4.12 text spacing, touch targets ≥44. Paste.
24. **EVERY STATE AT 390 AND 1280**, both themes, screenshots, no horizontal scroll.
25. **REDUCED MOTION, NO-JS, GRAYSCALE** — every state; screenshots. **No-JS: the failure paths that
    matter must still work**, since no JS was added.
26. **PERFORMANCE** — payload and LCP before/after per route, mid-range profile, **warm-up discarded
    (P5-R4 Addendum 3)**; report variance with sample counts. Report the environment route's TTFB
    against 5.6's 600–740 ms, and **state in one line how many round trips it makes.**
27. **HARNESS EXTENDED + BASELINE UPDATED** — including the named folds: page, shell, environment,
    permissions. Paste pass/fail.
28. **PRODUCTION BUILD** — succeeds; `/dev/student-states` absent or 404; no simulation reachable in
    production; `.env.local` untouched; nothing secret printed.
29. **LOGGER** — a real forced failure, its log line pasted, confirming no student content.
30. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and Part 0's three close-outs with evidence
2. **The state inventory table**, complete, with each row's claim and its verification
3. **The unknown-outcome case**, in full — this is the step's most important deliverable
4. Every shipped sentence in every state, listed, with its candidates and the choice
5. **What was refused, and why** — the refusals list, including the offline refusal
6. The offline negative evidence
7. The region-isolation pattern, and confirmation it is shared with 5.4's provider isolation
8. The logger's line format, from a real failure
9. The session-expiry return journey, with status codes
10. The 404 tension findings, and confirmation nothing was redesigned
11. Sweeps: subject rule, banned error language, internals, fabricated loading
12. Accessibility, both themes, 390 and 1280, no-JS, reduced motion, performance with variance
13. **What is real, and what exists only as a dev simulation**
14. Anything you could not implement, anything deferred, and confirmation nothing was half-built
15. Confirmation nothing outside the state handling, the logger, the region wrapper and the documents
    was changed

**STOP after the report.** Do not begin Step 5.8 — the phase gate.
