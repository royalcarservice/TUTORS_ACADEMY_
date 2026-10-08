# LiveKit reconnaissance — Phase 7 · Step 1 (2026-10-08)

RECONNAISSANCE ONLY — nothing here is built, installed, or applied. No LiveKit
dependency was added in Step 1 and no client JS exists in the repo. These are the
facts the next brief needs, gathered from the public LiveKit docs
(docs.livekit.io server SDK reference, access-tokens reference) and recorded under
the same discipline as `docs/proposed/progress_record.sql`: noted, not applied.

## What LiveKit gives the server side

1. **No user database in LiveKit.** Authentication is fully delegated to our
   backend: we sign short-lived JWTs with an API key/secret pair; LiveKit trusts
   the token and nothing else. This fits the existing ruling — our auth decides
   who may join; LiveKit only enforces what the token grants.
2. **Server SDK (`livekit-server-sdk`, Node)** is the only server-side dependency.
   It exposes:
   - `AccessToken` — per-participant JWTs with *video grants*: `roomJoin`, `room`,
     `canPublish`, `canSubscribe`, `canPublishData`, `roomAdmin`, `roomRecord`.
     A **subscribe-only token is a first-class shape** (canSubscribe without
     canPublish) — the distance lever "watch without speaking" needs no custom
     machinery, just a grant.
   - `RoomServiceClient` — create/list/delete rooms and moderate participants.
     Rooms may auto-create on first join, but explicit provisioning
     (`createRoom({ name, emptyTimeout, maxParticipants, metadata })`) is the
     production pattern — which suits us: a cohort session provisions its room,
     with metadata naming the cohort/session ids.
3. **Signed webhooks return the lifecycle facts**: `room_started` / `room_finished`
   (finished carries duration), `participant_joined` / `participant_left`
   (carrying participant identity). Signature verification is built into the SDK's
   webhook receiver. **These events are the natural service-role writer for
   `session-attended` rows** — exactly the write posture migration
   `20261008000004` already holds open (no authenticated INSERT).

## How it maps onto what Step 1 built

- A cohort session ↔ one LiveKit room, provisioned when the session is created.
- The webhook handler (service role) inserts
  `(student_id, subject_id, 'session-attended', at = join instant, ref_id = session row)`
  into `progress_record`. Subject comes from the cohort; the room itself never
  needs to know the subject.
- **attend vs resume stays ours**: `attendanceState` (src/lib/progress/record.ts)
  already chooses the verb from the record — LiveKit only supplies facts; the
  sentence rule needs no LiveKit-side state.
- Tutor reads keep flowing through `is_related_tutor` on `progress_record`;
  nothing about LiveKit changes the tutor-distance predicate.

## What a live-classroom step would add (NOT added now)

- `livekit-server-sdk` (server-only) + three env variable NAMES (values never
  recorded anywhere): `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
- One webhook route (service role, signature-verified) writing
  `progress_record` and, later, session state.
- `livekit-client` on the live-room surface only — the ONLY browser-facing LiveKit
  JS, introduced when that surface is built, not before.
- A `live_sessions` table that becomes `ref_id`'s real foreign key (DEC-009's
  open question settles there — variant (a): we own the session row; the
  alternative (b)-lite of storing the room sid keeps its stated cost).

## Open questions owed to the next brief

1. Referent ruling: session table first (variant (a)) or room-sid-as-ref
   ((b)-lite)? Migration 0004 is neutral between them by design.
2. Webhook idempotency: LiveKit may retry deliveries; the placeholder uniqueness
   `(student_id, subject_id, kind, at)` is not a dedupe key — the session table
   will want one (e.g. unique (session_id, student_id, kind)).
3. Presence honesty: does a join count as attendance at the join instant, or only
   after a minimum stay? The fact's `at` should mean what we say it means.
