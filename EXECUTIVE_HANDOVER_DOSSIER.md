# TUTORS ACADEMY — EXECUTIVE HANDOVER DOSSIER

*Prepared 8 October 2026 · branch `arena/e6e6e569-tutors-academy` · the platform stands
certified READY FOR PRODUCTION (DEC-040) with four unfinished-work tracks landed after.*

---

## 1 · What this platform is

Tutors Academy is a tutoring platform built one subject environment at a time. Six
subjects stand — Mathematics, Physics, Chemistry, Biology, English, History — each its
own room (The Lattice, The Field, The Vessel, The Organism, …), each admitting tutors
only by placement. The relationship it serves is pedagogical: a tutor and a student,
inside a subject, working through it together. The study lens offers Socratic
reflection — scaffolding, never answers. No outcome is promised.

Design language: dark graphite substrate, serif display headings, ochre brand brass,
disciplined cards. Zero surveillance, zero engagement metrics, zero dark patterns,
zero tracking.

## 2 · The lineage, phase by phase

| Phase | Delivered | Close |
|---|---|---|
| 1–4 | Brand spine, subject identity schema, six environments, ambient budgets | DEC-001… |
| 5 | Identity, portals, RLS-bounded reads, the three-role boundary | certified |
| 6 | Environment levers (density, motion character), tutor shell | certified |
| 7 | Live classroom scaffolding, privacy gates, opt-in capture | `audit/phase7-privacy.json` |
| 8 | Session archive — Board Record, Session Notation, Chamber Audio; signed-URL-only | `audit/phase8-*.json` |
| 9 | Socratic lens, pins, oversight | `audit/phase9-*.json` |
| 10 · S1 | Legal framework — terms_v1, privacy_v1, guardian consent (E-07 closed) | `8e3fc35` |
| 10 · S2 | Age-gated onboarding, DPDP 2023 guardian gate | `6105ea1` |
| 10 · S3 | Security edge — CSP, rate limits, credential audit | `0772794` |
| 10 · S4 | Final gate, five windows, zero remediation — **READY FOR PRODUCTION** | `6ec575b` |
| Track 1 | Admin operations console — placements, credentialing, subject rooms, billing | DEC-042 |
| Track 2 | Real onboarding & the tutor application door | DEC-043 |
| Track 3 | Tuition & payment gateway — terms_v2/privacy_v2 revision | DEC-044 |
| Track 4 | Production wiring & live-health harness | DEC-045 |

## 3 · Surface inventory

Public: `/` · `/subjects` + six chambers · `/tuition` · `/checkout/[subject]` ·
`/checkout/success` · `/legal/terms|privacy|guardian-consent` · `/login` · `/register` (+guardian gate).
Student: `/student`, `/student/account` (receipts). Tutor: `/tutor` shell.
Admin: `/admin` overview · `/admin/placements` · `/admin/tutors` · `/admin/subjects` ·
`/admin/billing` · `/admin/system`.
Machine: `/api/webhooks/payment` (signature-verified).

## 4 · Security & compliance posture

- Six security headers on every route; CSP tuned to the app (no `unsafe-eval`);
  `frame-ancestors` locked except the flagged preview door (DEC-041).
- Sensitive-route rate limits in front of the session boundary; calm 429 sentences.
- RLS on every table; the service role answers only admin tooling and webhooks;
  tutors hold no read path on invoices (migration 0014).
- Zero tracking: no cookie banner, no pixels, no beacons — stated as fact in privacy_v2.
- DPDP Act 2023: minors halt at the guardian gate; verifiable consent before onboarding.
- Battery: 308+ tests across 15 suites green; gates `gate7` (privacy sweep) and
  `gate10` (compliance) PASS at committed baselines; `scripts/smoke-live-production.mjs`
  probes the three services non-destructively (exit 0 offline).

## 5 · Production wiring (`.env.production.example`)

Names only — values live in the host's secret store, never in Git:
Supabase core (URL, anon, service role, `DATABASE_URL`), Stripe (secret, publishable,
webhook secret + one endpoint `/api/webhooks/payment`), LiveKit (url, key, secret),
`NEXT_PUBLIC_APP_URL`. Migrations 0001–0014 applied by the owner via
`npx supabase db push`. Every absent credential degrades calmly to demonstration
mode; a configured-but-failing service is the only error path (harness exit 1).

## 6 · Launch checklist (owner, in order)

1. Apply migrations 0001–0014 to the production project.
2. Set the env values (section 5) and run `node scripts/smoke-live-production.mjs`.
3. Wire confirmation-link email delivery (named owed since Track 2).
4. Credentialed walks: RLS harnesses, adult signup round-trip, minor→guardian
   verification round-trip, Stripe settlement round-trip, LiveKit connect.
5. Browsered visual re-pins (390px walks) — owed since the gate.
6. Owner rulings: tagline, the two static guards, LiveKit connect-src on connect day,
   shared-store rate limiter, **re-consent flow for existing terms_v1 accounts** (DEC-044).

## 7 · Declared debts (none hidden)

Exception register holds 18 open, all declared; E-07 closed. Additions named in
DEC-041…045: preview frame door, credentialing writes to live DB, v1 re-consent,
email channel, shared-store limiter, browsered walks. The ledger of what is owed is
this dossier, `docs/DECISIONS.md`, and `CONTINUE-HERE.md`.

---

*The platform claims only what it does. What is owed is named as owed.*
