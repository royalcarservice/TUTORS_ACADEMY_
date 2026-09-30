# STATE LANGUAGE — the student states (Phase 5 · Step 7)

**Status:** decided 2026-09-29 (ruling P5-R8, twelve points). This document is the
inventory of every state a student can be in that is not "the page, working", what
renders in each, **what that rendering claims**, and how the claim was verified.
Code reads from it: `src/components/state/copy.ts` holds the chosen sentences;
`/dev/student-states` renders this table and every specimen beneath it.

## The governing idea

**An error is a claim.** "Something went wrong" claims that something went wrong.
"Saved" claims that it was saved. When the outcome is **unknown**, the interface
shows a **state** ("the environment as the server now sees it"), never a
**verdict** ("failed", "done"). The product's mistakes are the product's to own —
the sentence's **subject is the page, the environment, the sign-in — never the
student** ("This page could not be shown", never "You have an error").

**P5-R9 — an error is never an absence.** In the data layer a MISSING VALUE and a
FAILED READ must never be the same value: every reader throws `DataReadError`
(`src/lib/state/read-error.ts`) when the driver reports an error, and the caller
decides — page failure (primary) or silence + log (region, `isolate.ts`) — never
emptiness, never "no enrolments", never "not signed in", never a 404 for a row that
could not be read. (Found by 5.7: `data ?? []` had rendered fabricated states.)

## Three scopes — one shape each

| Scope | Shape | Where it lives |
| --- | --- | --- |
| **PAGE** | the brand frame · one `h1` · one sentence · one action (a GET) | `src/components/state/honest-page.tsx`, rendered by `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/global-error.tsx` |
| **REGION** | **silence** in the interface + one log line in the system | `src/lib/state/isolate.ts` (the one pattern, shared with 5.4's providers) |
| **ACTION** | one sentence in the running type beside the control, `aria-describedby` from the control | `src/components/student/threshold.tsx` (`failed`), the auth forms' result line |

**The primary-answer exception (P5-R8.9):** the shell's next action and the
environment itself are never silently absent. Order: benign action (5.4) if it is
still truthful; otherwise the honest **page** failure. A shell with a hole in it is a
lie by omission and is forbidden (`return null` on the overview page was removed).

## The inventory

Legend for "how verified": **H** = harness gate (`audit/shell.cjs`, `audit/environment.cjs`, `audit/permissions.cjs`), **T** = test in `PHASE5_STEP7_STUDENT_STATES_REPORT.md`, **D** = specimen on `/dev/student-states`, **N** = negative evidence (nothing renders / nothing stored).

| # | State | Where it happens | What renders | What it claims | How verified |
| --- | --- | --- | --- | --- | --- |
| 1 | Page arriving (first load) | every route | **Nothing of ours** — the browser's own navigation indication only. No `loading.tsx`, no spinner, no skeleton, no shimmer. | nothing | T9 grep (spinner/skeleton/shimmer/setTimeout = 0 outside dev/motion), N |
| 2 | Soft navigation pending (client-side link) | nav shell links between routes | Nothing of ours; the current page stays until the next is ready (React transition). | nothing | T9, D (statement) |
| 3 | A supplemental region failing | shell slots (`resolveSlots`), environment regions (`resolveEnvironmentSlots`), the facts read for the arc | **Nothing** — the region is absent, as if unpopulated. One log line `{scope:"region:<id>"…}`. | nothing (an absent region claims nothing; the page's headings say what IS there) | T7 (DOM has no region + log line pasted), D (forced throw) |
| 4 | The primary answer failing (shell) | `/student` — a provider throws → benign action; the enrolments/entries read fails → page failure | Provider: the benign action ("Choose a subject") from the other providers. Read: the honest page **"Your subjects could not be read just now."** | provider: a true, weaker action. read: only "nothing was recorded; opening again only reads" | T8 (both forced), 5.4 tests 34/34, D |
| 5 | The environment page failing | `/subjects/[id]` — the enrolment read fails, or the render throws | Honest page **"This environment could not be opened just now."**, action "Open it again" → same path (GET). | nothing was recorded; a re-read is safe | T8, T16 (no internals), D |
| 6 | A write in flight (Begin / Open / Sign in) | threshold POST, shell POST, auth forms | Threshold/shell: a plain form POST — the browser's own pending state; **no copy of ours** (no JS on those routes). Auth forms (existing 5.1 client JS): the button is disabled and reads **"Signing in…" / "Creating…"** — the student's own action, named; no outcome claimed. | "this is being attempted" and nothing more | T3 network-cut, T22 (JS payload unchanged), D |
| 7 | A write failed (known, before commit) | POST `/subjects/[id]/enter` → the enrolment upsert errors | 303 back to the environment; beside **Begin**: *"Beginning did not go through, and nothing was recorded — beginning again is safe."* | no row exists; the write is idempotent so repeating is safe | T5/T6 (row counts), D |
| 8 | **A write with unknown outcome** (network cut mid-POST) — critical | any POST | **Nothing of ours.** The browser shows its own failure; the recovery surface is the environment page, a GET, which shows the **true state** (threshold if no row; the environment if the row landed). No auto-retry (P5-R8.12). | nothing — we do not know, so we say nothing; the next GET says what is true | **T3** (POST with network cut → nothing claimed → GET ends on the true state), D (statement) |
| 9 | A write that failed **after** commit (enrolment written, entry stamp failed) | POST `/subjects/[id]/enter` | 303 to the environment, which now renders **as enrolled, never entered** — no message. One log line `EntryWriteFailed`. | exactly the true state: enrolled; entry not recorded | T4 |
| 10 | Session expired mid-action | any protected GET; POST `/enter` without a session | GET: proxy 307 → `/login?next=<path>&reason=ended`; login shows *"That session ended. Signing in again goes back to Mathematics."* Signing in returns to `next` (a GET — never a replay of the write). POST: 303 → `/login?next=/subjects/<id>` (no cookies were readable, so no `reason`), then the environment GET. | "that session ended" is stated ONLY when auth cookies were present and invalid — a fact the proxy observed | T18 (status codes), D |
| 11 | Signed out mid-action (another tab / device) | same path as 10 | identical to 10 — the proxy cannot and should not tell the two apart; "ended" is true of both | same | T18 |
| 12 | 404 — no such subject | `/subjects/anything` | Honest page **"There is no page at this address."**, one action "See the subjects" → `/subjects`. No numeral, no portal list, no second CTA. | there is no page here (true) | T19, environment.cjs 404 gates, D |
| 13 | 404 — draft subject, student not enrolled (production) | `/subjects/<draft>` | **Byte-identical to 12** on purpose: the draft's existence is not announced. (`/subjects` lists the draft as plain text "in foundation" — see the tension note.) | same as 12 | T19, environment.cjs `visitor-draft-404`, D |
| 14 | Role redirect | a student at `/tutor` or `/admin`; a tutor at `/student` | 307 to the role's own portal. No sentence, no page: the person was never "wrong", the address was. | nothing | T20, permissions.cjs |
| 15 | 500 — a render threw | any route | the root error boundary → honest page (4/5). **No message, no digest, no stack** reaches the HTML. | nothing was recorded; re-read is safe | T16, D (forced throw) |
| 16 | Supabase project unreachable / paused | every read | reads throw `DataReadError` → 4/5 (page scope) or 3 (region scope). Never "no enrolments", never a 404 for a draft the student is enrolled in. | the page could not be shown — NOT "you have nothing" | T8 (simulated by a throwing read), D |
| 17 | Double submit (Begin twice, two tabs) | POST `/enter` | second POST upserts `ignoreDuplicates` → one row, second 303; the page is the same either way. No JS disabling — the server is the guard. | nothing (the true state renders) | T5 (row count = 1), T21 |
| 18 | Slow network (page arriving slowly) | any route | as 1: nothing of ours; no determinate bar for an indeterminate wait; no minimum display time | nothing | T9, N |
| 19 | Offline | anywhere | **Nothing of ours renders.** No service worker, nothing cached, no student data in `localStorage`/`sessionStorage`/IndexedDB/CacheStorage. The browser's own offline page. We never claim "you're offline" (we cannot know it). | nothing | **T11/T12/T13 negative evidence** |
| 20 | Sign-in refused (wrong email/password) | `/login` | *"That email and password do not match an account here."* — vague by decision (which half is wrong is not disclosed). Same type, existing 5.1 result line; no red. | only that the pair does not match | T17, D |
| 21 | Sign-in / create-account service failure | `/login`, `/register` | *"Sign-in could not be completed just now. Nothing was changed; signing in again is safe."* / *"The account could not be created just now. Nothing was saved; sending the form again is safe."* Driver message never shown; class logged. | nothing changed; repeating is safe | T16 (no internals), D |
| 22 | Sign-out | POST `/auth/signout` | 303 → `/login` (relative Location). No message: the login page IS the state. | nothing | T18 |
| 23 | Arrived at `/login` from a protected page with no session ever | proxy 307 without `reason` | *"Signing in opens Mathematics."* (or "your subjects") — where, not why; we do not know why. | where sign-in goes | T18, D |

## The copy — candidates, and the choice

Subject rule applied throughout: the sentence's subject is **the page / the
environment / the sign-in / beginning**, never "you". Chosen line in **bold**.

**Page could not be shown (15/4)**
- **"This page could not be shown just now."** + *"Nothing was recorded. Opening it again only reads — it is safe to do."*
- "This page did not arrive." (poetic; unclear whether it will)
- "Tutors Academy could not answer this request." (names the company as the actor; a little grand)

**Student overview failed (4)**
- **"Your subjects could not be read just now."** ("your subjects" = the page's name in the nav; the subject of the sentence is the read)
- "The overview could not be shown just now." (no student says "overview")
- "Nothing here could be read just now." (sounds like emptiness)

**Environment failed (5)**
- **"This environment could not be opened just now."**
- "Mathematics could not be opened just now." (true, but the subject name is unavailable when the read itself failed)
- "The room did not open." (4.x vocabulary drift)

**Not found (12/13)**
- **"There is no page at this address."** + *"The six subject environments are listed on the subjects page."*
- "Nothing is at this address." (reads like a broken product)
- "This address does not lead anywhere." (blames the address the student typed)

**Entry failed, known (7)**
- **"Beginning did not go through, and nothing was recorded — beginning again is safe."**
- "Mathematics was not begun. Nothing was recorded; Begin again is safe." (starts with the subject name — the eye reads it as a heading)
- "The entry was not recorded. Begin again — nothing was kept." ("kept" is vague)

**Session ended (10/11)**
- **"That session ended. Signing in again goes back to Mathematics."**
- "The session ended while this was open. Sign in to go back to Mathematics." (imperative: subject becomes the student)
- "Signed out. Mathematics is waiting behind sign-in." (verdict without a subject; "waiting" is theatre)

**Arrived without a session (23)**
- **"Signing in opens Mathematics."**
- "Mathematics needs a sign-in." (turns the subject into a gatekeeper)
- "Sign in to continue." (says nothing about where)

**Sign-in refused (20)**
- **"That email and password do not match an account here."**
- "Invalid login credentials." (the driver's line — accurate, but in the driver's voice)
- "Those details were not recognised." ("recognised" implies memory of the person)

**Service failure on auth (21)**
- **"Sign-in could not be completed just now. Nothing was changed; signing in again is safe."**
- "The sign-in service did not answer." (names a service the student cannot see)
- "Sign-in is unavailable." (a verdict about the future)

**In flight (6)** — existing 5.1 labels kept: **"Signing in…"**, **"Creating…"**. Threshold/shell: none (no JS; the browser's state). "Beginning…" is the approved shape if a client transition ever exists there; it does not today and none was added.

## Refusals (what is NOT in the product, and why)

- **No spinner, skeleton, shimmer, progress bar, or minimum display time** anywhere on the student surface. A spinner is a claim of progress the interface cannot know; a skeleton is a claim of shape before content. A page arriving shows nothing of ours.
- **No `loading.tsx`.** Same reason.
- **No error design language**: no red panels, no warning icons, no shake, no toast, no modal, no banner. The honest page is set in the same type as the primary surface. Errors are sentences, not events.
- **No "Oops", "Sorry", "Uh-oh", "Whoops", "Something went wrong", "Please try again later", "Contact support".** Apology is theatre; "something went wrong" is a verdict with no subject; "later" is a promise; "support" does not exist.
- **No "you're offline".** We cannot know it. Nothing of ours renders offline.
- **No service worker, no caching of student data, no localStorage/sessionStorage/IndexedDB of anything the student did.** The decision about minors' data at rest on a device has not been made; until it is, the answer is none.
- **No automatic retry of a write.** A retry is a second write. The student repeats it, on a page that first shows the true state.
- **No verdict on unknown outcome.** The recovery surface after any POST whose outcome the browser lost is the environment page — a GET.
- **No client JavaScript added.** The root error boundary is the framework's required client component; measured payloads are in the report.
- **No internals**: no stack, no digest, no SQL, no table names, no status codes on any page. Table names appear in log lines only.
- **No blame**: no sentence has the student as its grammatical subject in a failure.

## The subject rule, restated

In every failure, the product is the subject and the student is never the object
of a verdict. *This page could not be shown.* *That session ended.* *Beginning did
not go through.* Never *You are not allowed*, *You entered the wrong password*,
*You are offline*, *Your session has expired* (the session was ours to keep).
The single deliberate vagueness — the sign-in refusal — is a security decision,
recorded here, not a failure of nerve.

## Framework-dependent declared exception (not a design choice) — FLIP ALARM

Next **16.3.6** delivers `notFound()` pages and **error boundaries client-side**: the
server answers with the empty `__next_error__` document and the honest page appears
only after hydration, so PAGE-level states are blank without JavaScript. Unmatched
routes (no `notFound()` call) are server-rendered. Reference **vercel/next.js#99287**,
observed **2026-09-29**. `global-error.tsx` could not be reached by test: a throwing
second root layout (`/dev/global-throw`, route group) is caught by `app/error.tsx`,
which wraps every segment below `app/`; only the real `app/layout.tsx` failing reaches
it. It is a client component by the framework's contract, so its delivery is
client-side by construction — the same class of exception, stated without a
measurement. Not worked around: a
`[...catchall]` would change the frozen 404 behaviour. The copy inside those pages is
correct; only its delivery is framework-bound.

`audit/states.cjs` carries three **FLIP-ALARM** gates that assert TODAY'S DEFECTIVE
behaviour on purpose. **If any of them fails, the framework has changed**: delete the
alarm, restore the real assertion (`h1 === 1` without JS), and remove this section.
Re-test on every Next version bump and at the start of Phase 10.

Measured cost (5.8, Slow-3G 400 kbps/400 ms, 4× CPU, production build): a
`notFound()` 404 is **blank for ≈5.2 s after its document arrives** (h1 at 5.7 s);
the server-rendered unmatched-route 404 shows its h1 **52 ms** after the document.
That is the size of the exception on the connection the product is for.

## Known tension (reported, not redesigned)

`/subjects` lists a draft subject as plain text ("in foundation") while the direct
route `/subjects/<draft>` is a 404 for anyone not enrolled. A student who reads the
list learns the subject exists; a student who types the address is told there is no
page. Both are individually honest; together they are two answers to one question.
5.7 leaves it: the 404 is not redesigned, the list is 3.6's. Recorded for the owner.
