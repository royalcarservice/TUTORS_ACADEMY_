#!/usr/bin/env node
// Onboarding logic tests (Phase 10 · Step 2, DEC-038).
// Pure — zero network, zero database: the age boundary (exact 18th
// birthday, leap years, the Postgres clamp convention), the verification
// state machine, the onboarding judgement and the migration's structural
// enforcement are proven offline, then pinned against each other.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-onboarding-logic.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const ONBOARDING = await import("@/lib/auth/onboarding");
const {
  DOB_MIN_ISO,
  VERIFICATION_TTL_DAYS,
  ONBOARDING_COPY,
  isDobShape,
  parseDob,
  addYearsClamped,
  isMinorAt,
  judgeVerification,
  judgeOnboardingInput,
} = ONBOARDING;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const MIGRATION = "supabase/migrations/20261008000012_phase10_onboarding.sql";
const ACTIONS = "src/features/auth/actions.ts";
const ROUTE = "src/app/auth/verify-guardian/route.ts";

const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const AS_OF = utc("2026-10-08");
const valid = { name: "Ananya Sharma", email: "a@example.com", password: "letters123", termsAccepted: true, privacyAccepted: true, isEmailShape: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) };

/* ── 1 · date-of-birth parsing ───────────────────────────────────────────── */
t("the shape guard admits exactly YYYY-MM-DD", () => {
  assert.ok(isDobShape("2008-02-29"));
  for (const bad of ["", "2008-2-9", "08-02-2008", "2008/02/29", "2008-02-29x"]) assert.ok(!isDobShape(bad), bad);
});
t("the calendar round-trip refuses impossible dates", () => {
  for (const bad of ["2026-02-30", "2026-13-01", "2025-02-29", "2026-00-10"]) {
    const v = parseDob(bad, AS_OF);
    assert.equal(v.ok, false, `${bad} admitted`);
    assert.equal(v.sentence, ONBOARDING_COPY.implausibleDob);
  }
});
t("a leap-year birth parses (2000 and 2008 were leap years)", () => {
  assert.equal(parseDob("2000-02-29", AS_OF).ok, true);
  assert.equal(parseDob("2008-02-29", AS_OF).ok, true);
});
t("the future and the implausibly old are refused", () => {
  const future = parseDob("2026-10-09", AS_OF);
  assert.equal(future.ok, false);
  assert.equal(future.sentence, ONBOARDING_COPY.futureDob);
  assert.equal(parseDob("1899-12-31", AS_OF).ok, false);
  assert.equal(DOB_MIN_ISO, "1900-01-01");
  assert.equal(parseDob("1900-01-01", AS_OF).ok, true);
});

/* ── 2 · the age boundary — the brief's exact conditions ─────────────────── */
t("18 years 0 days is an ADULT — the birthday itself is the first adult day", () => {
  assert.equal(isMinorAt(utc("2008-10-08"), AS_OF), false);
});
t("17 years 364 days is a MINOR", () => {
  assert.equal(isMinorAt(utc("2008-10-09"), AS_OF), true);
});
t("18 years and 1 day is an adult", () => {
  assert.equal(isMinorAt(utc("2008-10-07"), AS_OF), false);
});
t("addYearsClamped: ordinary birthdays pass through", () => {
  assert.deepEqual(addYearsClamped(utc("2008-10-08"), 18), utc("2026-10-08"));
  assert.deepEqual(addYearsClamped(utc("2010-03-15"), 18), utc("2028-03-15"));
});

/* ── 3 · leap-year arithmetic — the Postgres convention, pinned ──────────── */
t("29 February + 18 years clamps to 28 February in a common year", () => {
  // 2026 is common: the platform's convention (mirroring Postgres
  // interval arithmetic) observes the 18th birthday on 28 February.
  assert.deepEqual(addYearsClamped(utc("2008-02-29"), 18), utc("2026-02-28"));
});
t("a leap-day birth is a minor through 27 Feb, an adult on 28 Feb (2026)", () => {
  const dob = utc("2008-02-29");
  assert.equal(isMinorAt(dob, utc("2026-02-27")), true);
  assert.equal(isMinorAt(dob, utc("2026-02-28")), false);
});
t("a leap-day birth lands on the true date when the year is leap", () => {
  // 2012-02-29 + 18y = 2030-02-28 (2030 common)… but 2028 keeps the 29th
  // for a 2010 birth? No — use a direct check: 2012-02-29's 18th is 2030.
  assert.deepEqual(addYearsClamped(utc("2012-02-29"), 18), utc("2030-02-28"));
  // And a year where the target IS leap: 2004-02-29 + 16y = 2020-02-29.
  assert.deepEqual(addYearsClamped(utc("2004-02-29"), 16), utc("2020-02-29"));
});

/* ── 4 · the verification state machine ──────────────────────────────────── */
t("a link is redeemable exactly while unverified and unexpired", () => {
  const future = "2026-10-15T00:00:00.000Z";
  assert.equal(judgeVerification({ verifiedAt: null, expiresAt: future }, AS_OF), "redeemable");
  assert.equal(judgeVerification({ verifiedAt: "2026-10-08T01:00:00Z", expiresAt: future }, AS_OF), "already");
});
t("the expiry boundary is strict: equal to now is expired", () => {
  assert.equal(judgeVerification({ verifiedAt: null, expiresAt: "2026-10-08T00:00:00.000Z" }, AS_OF), "expired");
  assert.equal(judgeVerification({ verifiedAt: null, expiresAt: "2026-10-07T23:59:59.999Z" }, AS_OF), "expired");
});
t("the TTL is seven days, mirrored by the ledger's comment", () => {
  assert.equal(VERIFICATION_TTL_DAYS, 7);
});

/* ── 5 · the onboarding judgement ────────────────────────────────────────── */
t("an adult with both consents takes the adult path", () => {
  const j = judgeOnboardingInput({ ...valid, dobIso: "2000-05-01" }, AS_OF);
  assert.deepEqual(j, { ok: true, path: "adult" });
});
t("an adult missing a consent is refused — calmly, one at a time", () => {
  const noTerms = judgeOnboardingInput({ ...valid, dobIso: "2000-05-01", termsAccepted: false }, AS_OF);
  assert.equal(noTerms.ok, false);
  assert.equal(noTerms.sentence, ONBOARDING_COPY.termsRequired);
  const noPrivacy = judgeOnboardingInput({ ...valid, dobIso: "2000-05-01", privacyAccepted: false }, AS_OF);
  assert.equal(noPrivacy.sentence, ONBOARDING_COPY.privacyRequired);
});
t("a minor takes the minor path — consent flags are the guardian's, not asked here", () => {
  const j = judgeOnboardingInput({ ...valid, dobIso: "2012-01-15", termsAccepted: false, privacyAccepted: false }, AS_OF);
  assert.deepEqual(j, { ok: true, path: "minor" });
});
t("missing or malformed dates of birth are refused with their own sentences", () => {
  const missing = judgeOnboardingInput({ ...valid, dobIso: "" }, AS_OF);
  assert.equal(missing.sentence, ONBOARDING_COPY.missingDob);
  const malformed = judgeOnboardingInput({ ...valid, dobIso: "not-a-date" }, AS_OF);
  assert.equal(malformed.sentence, ONBOARDING_COPY.implausibleDob);
});
t("the boundary minor (born yesterday-under-18) is judged minor by one day", () => {
  const j = judgeOnboardingInput({ ...valid, dobIso: "2008-10-09" }, AS_OF);
  assert.deepEqual(j, { ok: true, path: "minor" });
});

/* ── 6 · the calm register ───────────────────────────────────────────────── */
t("zero exclamation marks anywhere in the onboarding vocabulary", () => {
  for (const [k, v] of Object.entries(ONBOARDING_COPY)) assert.ok(!v.includes("!"), `${k} shouts`);
});
t("the confirmation sentence stands verbatim (the brief's requirement)", () => {
  assert.equal(ONBOARDING_COPY.verifyConfirmed, "Consent has been confirmed. The student's academy access is now active.");
});
t("the tutor gate refuses self-service, with dignity", () => {
  assert.equal(
    ONBOARDING_COPY.tutorGateRefusal,
    "Tutor accounts are opened by invitation. Self-service registration for tutors is not open in this deployment.",
  );
});

/* ── 7 · the action's posture ────────────────────────────────────────────── */
t("the action computes age server-side and refuses the tutor role", () => {
  const src = rawFile(ACTIONS);
  assert.ok(src.includes("judgeOnboardingInput"), "the pure judge is not applied");
  assert.ok(/formData\.get\("role"\) === "tutor"/.test(src), "the tutor refusal is missing");
  assert.ok(src.includes("new Date(), // the server's clock decides the age"), "the clock comment moved");
});
t("no half-open doors: service credentials are checked BEFORE the account is created", () => {
  const src = rawFile(ACTIONS);
  const serviceAt = src.indexOf("createServiceClient()");
  const signUpAt = src.indexOf("supabase.auth.signUp(");
  assert.ok(serviceAt !== -1 && signUpAt > serviceAt, "signUp runs before the service check");
});
t("the adult consent failure rolls the account back", () => {
  const src = rawFile(ACTIONS);
  assert.ok(src.includes("deleteUser(userId)"), "the rollback is missing");
});
t("the minor path writes nothing but the account — enrolment dormancy is the trigger's", () => {
  const src = strip(rawFile(ACTIONS));
  const minorBlock = src.slice(src.indexOf('judgement.path === "minor"'));
  assert.ok(!minorBlock.slice(0, 400).includes(".insert("), "the minor branch writes beyond the account");
});

/* ── 8 · the migration's structural enforcement ──────────────────────────── */
t("migration — profiles gains the two onboarding columns", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/add column if not exists date_of_birth date check \(date_of_birth <= current_date\)/.test(sql));
  assert.ok(/add column if not exists guardian_verified boolean not null default false/.test(sql));
});
t("migration — the age boundary is structural, with the exact comparison", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/dob \+ interval '18 years' > current_date/.test(sql), "the 18-year comparison moved");
  assert.ok(/and not verified then/.test(sql));
});
t("migration — the trigger stands on enrolments, before insert", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/create trigger enrolments_guardian_gate\s+before insert on public\.enrolments/.test(sql));
  assert.ok(/execute function public\.enrolment_guardian_gate\(\)/.test(sql));
});
t("migration — test accounts keep working: absence of DoB means no age condition", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/if dob is not null/.test(sql), "the NULL escape is missing — fixtures would be blocked");
});
t("migration — the ledger stores only the digest, and is service-role only", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/token_hash\s+text not null unique check \(char_length\(token_hash\) = 64\)/.test(sql));
  assert.ok(/revoke all on public\.guardian_verifications from anon, authenticated/.test(sql));
  assert.ok(/grant all on public\.guardian_verifications to service_role/.test(sql));
  assert.ok(!/create policy .* on public\.guardian_verifications/.test(sql), "a policy admits someone to the ledger");
});
t("migration — the signup trigger carries DoB safely (malformed drops to NULL)", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/dob ~ '\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$' then dob::date end/.test(sql));
});

/* ── 9 · the route's posture ─────────────────────────────────────────────── */
t("the handler hashes immediately and never echoes the token", () => {
  const src = rawFile(ROUTE);
  assert.ok(src.includes("redeemGuardianToken(service, token, ipHash)"));
  assert.ok(!/searchParams\.set\("token"/.test(src), "the token is echoed into a redirect");
});

console.log(`\n${n - failed}/${n} onboarding logic tests passed`);
if (failed > 0) process.exit(1);
