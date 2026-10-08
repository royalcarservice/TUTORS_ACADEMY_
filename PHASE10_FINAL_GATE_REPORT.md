# PHASE 10 FINAL GATE REPORT — LAUNCH CERTIFICATION (WINDOWS W1 → W5)

*Run 2026-10-08 on branch `arena/e6e6e569-tutors-academy` (commit `0772794` → this close-out).
Execution mode: FINAL CAPSTONE GATE RUNNER — verification only. Zero new features, surfaces, or
dependencies in the gate itself; the only code added is the gate's own audit harnesses
(`scripts/gate10-*.mjs`) whose verdicts are committed under `audit/`. House rules kept: one
window at a time, `timeout -k 5` on every command, servers killed strictly by port (the W3
harness kills its own server and proves the port closed). **Rule 18: zero real identities** —
every window ran offline; the credentialed harnesses stand owed with their committed baselines.*

**The question before the gate:** Phases 1–10 built the whole platform — the brand and the six
subject environments, the identity substrate, the live classroom, the archive, the Socratic
engine, and the legal framework with age-gated onboarding and the security edge. Does the
platform stand as ONE piece, ready for production, or does it owe corrections before launch?

---

## WINDOW W1 — COLD START, MASTER STATIC BATTERY & PRODUCTION BUILD

The sandbox re-provisioned at turn start (the twentieth); recovery was `git fetch` +
`reset --hard origin/arena/e6e6e569-tutors-academy` → `0772794`, `npm ci` to EXIT 0, then the
window ran from cold. **One declared fix landed in the window:** the zero-leak sweep caught its
OWN documentation header quoting the shapes it hunts (a connection-string sample, the allowlist's
example address); both were rendered self-clean at the source — the sweep stayed strict.

| check | result |
|---|---|
| `validate-subjects.mjs` | **✓ ALL SUBJECTS VALID** (108 lever combinations) |
| `check-subject-imports.mjs` | exactly the **4 DECLARED false-positives** of the Phase 7 gate — zero new |
| `check-subject-sql.mjs` | **PASS** — subject ids, lever density, motion vocabulary match SQL |
| `check-breakpoints.mjs` | exactly the **3 DECLARED pre-existing drifts** — count unchanged |
| `audit-secrets.mjs` (zero-leak sweep) | **CLEAN — 535 tracked text files**, zero unexplained findings |
| test-next-action | 34/34 |
| test-progress | 16/16 |
| test-socratic-logic | 31/31 |
| test-socratic-surface | 19/19 |
| test-socratic-oversight | 15/15 |
| test-archive-logic | 26/26 |
| test-archive-surface | 16/16 |
| test-archive-viewer | 22/22 |
| test-progress-record | 18/18 |
| test-academic-surface | 20/20 |
| test-milestone-synthesis | 21/21 |
| test-legal-logic | 23/23 |
| test-onboarding-logic | 33/33 |
| test-security-logic | 14/14 |
| `npm run build` | **EXIT 0 — 41 pages** (production build, gate evidence) |

**W1 verdict: PASS.** The unified sweep across all ten phases: **308 tests green**, both static
guards exactly at their declared baselines, the zero-leak sweep clean, the production build
compiles without warning.

---

## WINDOW W2 — THE LEGAL & COMPLIANCE CERTIFICATION

Harness: `scripts/gate10-compliance-audit.mjs` → baseline `audit/phase10-compliance.json`.
**14/14 checks**, in five groups:

1. **The DPDP posture (D1–D5).** The guardian gate's sentence stands verbatim in the copy
   module, the framework page and the gate itself. Age is computed SERVER-SIDE — the form's
   minor flag is pinned as UX-only, the action applies the pure judge with the server's clock.
   The minor halt is complete: `pending_guardian` account, enrolment trigger-blocked in the
   database (`dob + interval '18 years' > current_date`, the 18th birthday the first adult
   day), consent deferred to the guardian. The verification flow is whole: ledger with 64-hex
   token digests, the token handler, the confirmed page, the pinned outcome sentence. The
   consent audit is one-way: SHA-256 digests, the honest `no-address` sentinel, own-only RLS,
   no update or delete policies.
2. **Zero tracking, stated in public (T1–T3).** The privacy notice's never-collected list
   stands complete — facial recognition, keystroke logs, attention metrics, location and
   fingerprinting, third-party advertising data. The zero-cookie-banner sentence stands
   verbatim: *"There is no cookie banner on this site because there is nothing to consent
   to."* No third-party tracker vocabulary exists anywhere in the tree (vendor sweep over all
   src TypeScript).
3. **The terms' required clauses (C1–C2).** The pedagogical relationship defined; the engine's
   boundary stated (never supplies answers, no outcome promised); the student's ownership of
   their proofs pinned; the absence of commercial lock-in pinned (*"Nothing here is designed
   to be difficult to leave"*).
4. **The register itself (E1–E2).** Exception E-07 stands CLOSED with its full resolution
   record; the count stands at **18 open** with both Phase 10 notes present.
5. **The guardian gate's integrity (G1–G2).** One field, one act, zero dark-pattern anatomy
   (no checkbox, no countdown, no pre-checked anything); the onboarding gate at
   `/register/guardian` is wired to the real act and reads the verified flag.

Beside the harness, the standing app-wide privacy audit re-ran: **gate7-privacy-audit PASS over
311 files** — zero unexplained findings, zero live-surface hits. The zero-tracking posture is
proven app-wide, not just on the legal pages.

**W2 verdict: PASS.** DPDP 2023 compliance is structural (schema + trigger + token flow), the
guardian gate is whole, no cookie banner is required because nothing is tracked, and E-07's
closure stands exactly as recorded.

---

## WINDOW W3 — THE SECURITY & ZERO-LEAK AUDIT (MEASURED LIVE)

Harness: `scripts/gate10-security-audit.mjs` → baseline `audit/phase10-security.json`.
**8/8 checks — measured against the committed production build**, booted on port 3126 and
killed strictly by port by the harness itself (`serverKilledByPort: true` recorded in the
baseline):

- **S1:** all six security headers stand live on a real response (CSP · HSTS · nosniff ·
  X-Frame-Options DENY · referrer discipline · Permissions-Policy with interest-cohort
  refused);
- **S2:** the live CSP carries `default-src 'self'` and `frame-ancestors 'none'`, includes
  the Supabase sources, and admits **no unsafe-eval**;
- **S3:** the headers reach every route class (legal pages and registration sampled);
- **S4:** `/login` admits exactly five POSTs; the sixth is the calm 429 with the pinned
  sentence as its body;
- **S5:** `/register` holds its three-per-hour budget, and page reads never spend it;
- **S6:** `/auth/verify-guardian` holds its ten-per-hour budget — the eleventh probe is 429;
- **S7:** the zero-leak sweep re-ran clean inside the harness (535 files);
- **S8:** the static security suite re-ran green (14 pins).

**W3 verdict: PASS.** The edge defenses are not configuration claims — they are measured
behaviour of the shipped build.

---

## WINDOW W4 — THE END-TO-END PERSONA WALK

No browser stands in the sandbox (the established debt — no Puppeteer/Chrome); the window
therefore proves the maximum the environment allows: the LIVE HTTP journey of every persona,
measured against the production build on port 3127 (server killed by port in the same
invocation), plus the construction pins for the 390px viewport.

| persona | journey measured | result |
|---|---|---|
| **Visitor** | `/` · `/subjects` · `/subjects/mathematics` · `/login` · `/register` · the three legal routes — all **200**; the subject environment carries `data-visitor-door` (one tap to the login door) | PASS |
| **Student** (unsigned) | `/student` → **307** `/login?next=%2Fstudent` · `/register/guardian` → **307** with its own `next` preserved | PASS |
| **Tutor** (unsigned) | `/tutor` → **307** `/login?next=%2Ftutor` | PASS |
| **Admin** | `/admin` → **307** — reachable by no account, exactly as the registry promises | PASS |
| **Guardian** | `/auth/verify-guardian?token=…` → honest `unavailable` outcome (no service credentials in the sandbox — the handler says so rather than guessing) · the confirmed page **200** | PASS |

**The 390px posture, by construction** (the Phase 6–9 precedent — construction pins stand in
where no browser stands): the rendered HTML carries `width=device-width, initial-scale=1`
(measured in the live document) · every control clears the 44px touch floor
(`.ta-btn` min-height `max(2.75rem, var(--ta-control-h))`, all sizes) · the legal pages are
bound to the reading measure (`var(--ta-measure)`, 68ch) · the guardian gate is one 34rem
region with wrapping controls · the registration form is a single column of stacked fields.

**Declared owed** (recorded, not hidden): the browsered 390px visual walk of every persona and
the signed-in journey walks (a real adult signup round-trip, a minor→guardian verification
round-trip, the trigger's refusal observed live) require credentials and a browser — they
stand with the credentialed debt, as at every prior gate.

**W4 verdict: PASS** at the depth the sandbox allows; the visual walk stands owed with its
baselines.

---

## WINDOW W5 — THE WHOLE-PLATFORM VERDICT & HANDOVER DOSSIER

### Whole-platform integrity — ten phases, one sweep

| phase | what stands | gate |
|---|---|---|
| 1–2 | Brand frame (Ink & Signal), typography, tokens, self-hosted fonts | locked 2.1–2.6 |
| 3 | Six subject environments, levers, motifs, ambient layer | Phase 3 reports |
| 4 | Homepage spine, eight scenes, footer honesty | PHASE4_STEP9_GATE_REPORT |
| 5 | Identity substrate, RLS posture, test-account discipline | PHASE5 gate, DEC-001…013 |
| 6 | Tutor gate, placement, relationship surface | PHASE6_STEP6_REPORT (11 windows) |
| 7 | Live classroom scaffolding, surveillance-free posture | PHASE7_GATE_REPORT — CERTIFIED |
| 8 | Archive: schema, shelf, whiteboard replay, milestone synthesis | PHASE8_GATE_REPORT — CERTIFIED |
| 9 | Socratic engine, lens, oversight mirror | PHASE9_GATE_REPORT — CERTIFIED |
| 10 · 1 | Legal framework, guardian gate, E-07 CLOSED | DEC-037 |
| 10 · 2 | Age-gated onboarding, token verification, tutor invitation gate | DEC-038 |
| 10 · 3 | Security headers, rate limiting, zero-leak sweep | DEC-039 |
| 10 · 4 | **This gate** | DEC-040 |

Every gate's baselines stand committed under `audit/`; every ruling stands in
`docs/DECISIONS.md` (DEC-001…DEC-040); every register state stands in `docs/EXCEPTIONS.md`
(**18 open, each stated, none hidden**); the language stands pinned in `docs/STATE_LANGUAGE.md`.

### The prompt tracker, closed

The brief's tracker lived in the chat workspace; `prompts/README.md` was never committed to
the tree (declared here, and the stale references in CONTINUE-HERE are corrected by this
close-out). The tracker's substance survives in three committed places — CONTINUE-HERE's
IMMEDIATE ORDER (where every phase stands) · `docs/DECISIONS.md` (every ruling, DEC-001…040) ·
the four gate reports (every verdict). Nothing owed remains outside the tree.

### THE LAUNCH CERTIFICATE

**THE PLATFORM IS CERTIFIED READY FOR PRODUCTION**, with the honesty this lineage requires:
ready means every committed claim is proven — 308 tests green, five gates passed, the edge
defenses measured live, zero leaks, zero surveillance, zero real identities anywhere in the
tree. It does NOT mean the sandbox proved what only credentials can prove. The owner's launch
checklist, in order:

1. **Apply migrations 0001–0012** in the production project (the sandbox applied none; every
   surface is dormant until they stand).
2. **Set the three environment variables**: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (names only — values never
   committed).
3. **Wire the confirmation-link delivery channel** (an email provider) — the guardian gate
   says the channel is owed until then; the copy already tells the truth.
4. **Run the credentialed walks**: the RLS and tutor-visibility harnesses (baselines stand in
   `audit/`) · a real adult signup round-trip · a minor→guardian verification round-trip ·
   the enrolment trigger's refusal observed live · the timing-parity probe.
5. **Re-pin the browsered baselines**: the 390px persona walks · the relationship baseline
   (DEC-035, owed with DEC-030) · the environment/tutor baselines (DEC-030) ·
   `audit/relationship.cjs`.
6. **Rule the open owner questions** (carried from every gate): the homepage tagline · the
   two static guards · the LiveKit wiring (adds the connect-src entry) · the shared-store
   rate limiter if the deployment grows multi-instance.

### The nine phase-close questions

1. **Did Phase 10 deliver what its steps promised?** Yes — the legal framework (DEC-037,
   E-07 closed) · age-gated onboarding (DEC-038) · the security edge (DEC-039) · this gate
   (DEC-040). Every step closed with its DEC, its suite, and a pushed commit.
2. **Is the platform's legal posture real?** Yes — proven by W2's 14 checks: DPDP compliance
   structural (trigger + token flow), zero tracking stated and swept, the terms' clauses
   pinned, E-07 closed in the register.
3. **Is the security edge real?** Yes — proven by W3's 8 MEASURED checks: headers live, CSP
   exact, budgets hold at limit+1, the sweep clean, the server killed by its own harness.
4. **Do the personas hold?** Yes at the depth the sandbox allows — W4 walked all four
   personas live; the visual walk stands owed with construction pins.
5. **Did Phase 10 break any prior phase?** No — the unified battery ran green in W1 across
   every suite Phases 5–9 left behind; both static guards sit exactly at their declared
   baselines.
6. **What stands between the build and real students?** The six-item launch checklist above —
   migrations, credentials, the email channel, the credentialed walks, the browsered
   re-pins, the owner rulings. Each is stated in the open.
7. **What did the sandbox not prove?** Anything requiring credentials or a browser — the
   round-trips, the trigger observed live, the visual walks, the timing parity. All owed,
   all recorded.
8. **Does the platform hide anything?** No — 18 exceptions open and STATED in the register;
   zero-leak sweep clean; zero surveillance vocabulary; honest absence on every dormant
   surface; the launch checklist names every debt.
9. **Is it one platform?** Yes — one brand frame, one token system, one identity substrate,
   one consent audit, one rate limiter, one sweep; the ten phases share them, and the gate
   swept them together.

---

## VERDICT

**PHASE 10 IS CERTIFIED, AND THE PLATFORM IS MARKED READY FOR PRODUCTION.** Five windows,
five passes: W1 the master battery (308 tests, guards at baseline, sweep clean, 41-page
build) · W2 legal & compliance (14/14 + the app-wide privacy re-run) · W3 security measured
live (8/8, the harness killed its own server by port) · W4 the persona walk (all four
personas at their honest boundaries) · W5 this close (tracker consolidated, certificate
issued, handover checklist committed). Every verdict stands committed under
`audit/phase10-*.json`; the lineage stands in DEC-001…DEC-040 and STATE_LANGUAGE 1–10.4.

The platform waits now for credentials, not code.
