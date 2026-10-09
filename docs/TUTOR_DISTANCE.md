# TUTOR DISTANCE — what a tutor cannot do yet, and where that is said (Phase 6 · Step 5, P6-R16)

This is a design document, not UI. It lists every tutor capability that does not exist, **the exact
place in the product where a tutor would reach for it and finds the sentence instead**, and which
phase delivers it. The rule it serves (P6-R16): *a gap is not a changelog entry; it is a sentence
where the person would look for the thing* — and its inverse, *do not add a place for a capability
that does not exist*. A page that exists only to say it is empty invents a destination to hold a
disclaimer.

The test: a tutor should never be able to say *"I thought there would be somewhere to do X and I
could not find whether that was me or the product."*

## What a tutor can do today (so the distance is measured from something)

| capability | surface | since |
| --- | --- | --- |
| see the students placed with them, by subject | `/tutor` | 6.2 |
| open one relationship and read where the learning is (the arc) | `/tutor/[subject]/[relationship]` | 6.3 |
| shape one subject's environment (density · motion character) for everyone in it; revert | `/tutor/[subject]/environment` | 6.4 |
| stand in the room they shape (identity, no student region) | `/subjects/[subject]` | P6-R19 |
| see who they are signed in as, their role as a fact, and sign out | `/tutor/account` | 6.2 / P6-R14 |

## The distance — each gap, where it is named, what delivers it

| # | capability a tutor would reach for | where they would look | the sentence that is there (verbatim) | named nowhere else | delivered by |
| --- | --- | --- | --- | --- | --- |
| 1 | **Teach**: hold a session, set work, give feedback | the shell, after the list of students (the only place there is nothing *to* do) | `Nothing to do here.` / `The students placed with you are listed below, by subject. Placing is done by the academy, not from this page. Teaching surfaces are not built.` (`/tutor`, P6-R4 line) | correct — not on the account page, not on the shaping surface | **Phase 7** (classes, learning events, `progress_record`) |
| 2 | **Teach this student** (a session, work, feedback for the one in front of them) | the relationship's surface, after the arc | `This page reads the record and prepares the next dialogue. Nothing else is done here by a tutor yet: teaching surfaces are not built.` (`/tutor/[subject]/[relationship]`; DEC-035 declared evolution — the one thing a tutor may now write here is their OWN preparation mark on a Socratic inquiry, the diagnostic mirror of Phase 9 · Step 3; it carries no evaluation) | correct | Phase 7 (teaching proper); the preparation mark arrived Phase 9 · Step 3 |
| 3 | **See the student's record** (what they did, when) | the relationship's surface — the `record` region | the region renders **nothing** (no events table → nothing, structurally; `resolveRecord` returns null) and the arc says where the learning *is*; the tutor statement above is the sentence | correct — the arc is the one true thing to show, and it is shown | Phase 7 writes events; **Phase 9** renders the record under P5-R6 (counts, never a zero, never a score) |
| 4 | **Be placed with a student / request a student** | the shell, when no one is placed | `No student is placed with you.` / `The academy places a student with a tutor, one subject at a time; it is not done from this page. Teaching surfaces are not built.` | correct — no "request" control anywhere (an affordance that cannot succeed is false, P6-R11) | the **consent ruling** (6.1 §6 creation-flow options; P6-R1 — recommend, don't build). Not a numbered phase until ruled |
| 5 | **See their own arrangements**: which relationships exist, which have ended | the account surface would be the wrong place (P6-R14: identity and the way out only). **The named future home is the shell** (`/tutor`): active relationships are already its rows; ended ones become a second, quieter group there when relationship management exists | the shell's active rows ARE the statement of what exists; nothing says "ended" today because no tutor action on a relationship exists and the ended row is `404 — same bytes` by P6-R9 | correct — no "manage relationships" page invented | the **consent ruling** (P6-R9 deferred it to the tutor's own account/arrangements surface; **this document moves the home from "account" to "shell"**, because the account page is three things and nothing else) |
| 6 | **The tutor's own subject page** — what a tutor sees about a subject beyond the levers (its students, its sessions, its record) | they would reach for `/tutor/[subject]`. **It does not exist and is not added**: today a subject's only tutor-facing facts are its placed students (already grouped on the shell under the subject's heading) and its levers (the shaping surface, one link away). A page would hold a heading and two links | the shell's subject group heading + `Shape the {Subject} environment` link; `/tutor/physics` is `404 — There is no page at this address.` | correct by the inverse rule — a route would exist to be empty | Phase 7 gives a subject tutor-facing content (its classes); the route appears when there is something on it |
| 7 | **Co-tutor awareness** (who else shapes this room; what they changed) | the shaping surface's state line | `Last shaped by another tutor.` — the fact the row carries, no name, no date | correct — not a roster, not a notice | a **user ruling with a policy attached** (DEC-018 Item 5; co-tutor read grant refused) |
| 8 | **Know that a co-tutor changed the room while they were editing** | the shaping surface, at Save | **RESOLVED by ruling P6-R21 (2026-10-06, DEC-018 addendum): REFUSE_STALE_WRITE.** The save is no longer last-write-wins: a write that does not match the state the surface loaded is REFUSED — one 409 document with the single factual sentence *"The room settings were updated in another session. Reload to review the current state before applying changes."*, nothing written, the other tutor's row left standing. Names the fact, never the person. | ~~ruling required~~ → **ruled and delivered 2026-10-06** (this row stays until the gate re-runs green: `audit/tutor-states.cjs` `write-concurrent` now asserts the refusal) |
| 9 | **Notify students that the room changed** | nowhere — by decision, not by distance | `Nothing announces the change. Students are not told their room was rearranged; the subject simply looks as you set it.` (the shaping surface states what it does not do, P6-R10) | correct | **not planned** (silence toward students is a decision) |
| 10 | **Per-student anything** (a room for one student; a note on one student; progress columns) | they might reach for it on the relationship's surface | nothing names it, deliberately: naming "per-student environment" would advertise a thing the model forbids (attack 6/7: unrepresentable) | correct | **never** (P6-R10; reopening condition is cohort levers in Phase 7, DEC-018 Item 4 — cohort, not person) |
| 11 | **Export, aggregate, roster, notifications, preferences, profile editing** | the account surface, the shell | nothing, and no place for them: the account page is name · email · role · sign out (P6-R14); the shell is rows and one link per subject | correct | not planned (`docs/TUTOR_VISIBILITY.md` refusals) |

## Placement audit (test 15)

For each row: **is it named where a tutor would look, and nowhere it shouldn't be?**

- Rows 1, 2, 4 — named at the point of expectation, in the voice, without apology ("are not built", not "coming soon"). Not repeated on the account surface, the shaping surface, or the login page.
- Row 3 — the absence is structural (the region renders nothing) and the sentence beside it says why. Not a skeleton, not "no activity yet".
- Rows 5, 6 — **the inverse rule applied**: no page was created. The future home is written here, not in the product.
- Rows 7, 8 — row 7 is as far as the row's facts allow; row 8 was the step's reported defect and is now RESOLVED: ruling P6-R21 (DEC-018 addendum, 2026-10-06) refuses the stale write with one factual sentence; the refusal document is the only place the sentence lives.
- Rows 9, 10, 11 — decisions, named once (row 9) or by construction (10, 11).
- **Sweep:** `coming soon` · `roadmap` · `changelog` · `soon` · `planned` · `not yet available` across every tutor surface's rendered text: **0 hits** (`audit/tutor-states.cjs` never-contains, surfaces `/tutor`, `/tutor/account`, `/tutor/physics/environment`, `/tutor/physics/[relationship]`, `?shape=failed`). The one word that appears is "yet" in *"Nothing else is done here by a tutor yet"* — a statement about the page, not a promise with a date.

## The oversight's distance — what the diagnostic mirror refuses (Phase 9 · Step 3, DEC-035)

The Socratic oversight panel (`/tutor/[subject]/[relationship]`, beneath the record) is a MIRROR, not a wiretap, and its distance is fixed:

- **The engine does not grade or score student inquiry history.** No comprehension rating, no difficulty flag, no "struggled", no figure of any kind attaches to an inquiry — not in the schema (no such column exists in `socratic_exchanges` or `socratic_pins`), not in the resolver (its union has no evaluative kind), not in the panel (it renders the inquiry as asked, the milestone it names and the instant it stood, and nothing else).
- **No observation of behaviour.** The panel shows no idle time, no presence, no timing pattern, no count of questions — recency beyond the read's own order is the most it implies, and it implies nothing about the student.
- **The one write is preparation.** "Mark for Next Live Session" stores the tutor's OWN note (migration 0010): binary, withdrawable, scoped to the relationship's subject, carrying no judgment. Unmarking is the mark's own undoing.
- **Subject isolation rides the boundary.** Both reads re-decide under RLS (0009, 0010) on every request; an ended relationship admits nothing.

## What this document is not

Not a roadmap (no dates, no order beyond the phase that owns the capability). Not UI (nothing here is
rendered to a tutor; `/dev/tutor-states` prints it for the owner, in development only). Not a reason to
add a surface: when a phase delivers a row above, the sentence at the point of expectation is replaced
by the capability, and the row is deleted here.
