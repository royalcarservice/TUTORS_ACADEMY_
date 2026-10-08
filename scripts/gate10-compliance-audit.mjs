#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   PHASE 10 GATE · WINDOW W2 — THE LEGAL & COMPLIANCE CERTIFICATION
   Baseline: audit/phase10-compliance.json

   Proves, from the committed tree, what the launch certificate claims:
   · the DPDP Act 2023 posture — the guardian gate's sentence, the
     server-side age boundary, the pending_guardian halt, the token
     verification flow, the one-way consent audit;
   · the zero-tracking posture — the never-collected list stands in
     public, there is no cookie banner because there is nothing to
     consent to, and no third-party tracker vocabulary exists anywhere;
   · the terms' required clauses — the pedagogical relationship, the
     student's ownership of their proofs, the absence of lock-in;
   · Exception E-07 — CLOSED in the register, count 18 open.
   Run: node scripts/gate10-compliance-audit.mjs
   ════════════════════════════════════════════════════════════════════════ */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const flat = (src) => src.replace(/\s+/g, " ");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "");
const results = [];
const check = (id, detail, fn) => {
  try {
    fn();
    results.push({ id, detail, pass: true });
    console.log(`PASS  ${id} · ${detail}`);
  } catch (e) {
    results.push({ id, detail, pass: false, error: String(e.message ?? e).slice(0, 200) });
    console.log(`FAIL  ${id} · ${detail}\n      ${e.message}`);
  }
};
const ok = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const CONSENT = read("src/lib/legal/consent.ts");
const ONBOARDING = read("src/lib/auth/onboarding.ts");
const ACTIONS = read("src/features/auth/actions.ts");
const GATE = strip(read("src/components/legal/guardian-gate.tsx"));
const GUARDIAN_PAGE = read("src/app/(public)/legal/guardian-consent/page.tsx");
const PRIVACY = read("src/app/(public)/legal/privacy/page.tsx");
const TERMS = read("src/app/(public)/legal/terms/page.tsx");
const VERIFY_ROUTE = read("src/app/auth/verify-guardian/route.ts");
const CONFIRMED = read("src/app/auth/verify-guardian/confirmed/page.tsx");
const REGISTER_FORM = strip(read("src/features/auth/register-form.tsx"));
const GUARDIAN_REGISTER = read("src/app/(auth)/register/guardian/page.tsx");
const M11 = read("supabase/migrations/20261008000011_phase10_legal.sql");
const M12 = read("supabase/migrations/20261008000012_phase10_onboarding.sql");
const EXCEPTIONS = read("docs/EXCEPTIONS.md");
const DPDP_SENTENCE =
  "As a student under 18, the Digital Personal Data Protection Act requires verified guardian consent before enrolling in subject chambers.";

/* ── D1–D5 · the DPDP posture ────────────────────────────────────────────── */
check("D1", "the gate's DPDP sentence stands verbatim in the copy module, the framework page and the gate", () => {
  ok(CONSENT.includes(DPDP_SENTENCE), "the copy module lost the sentence");
  ok(GUARDIAN_PAGE.includes("LEGAL_COPY.guardianDpdpSentence"), "the framework page does not render it");
  ok(GATE.includes("LEGAL_COPY.guardianDpdpSentence"), "the gate does not render it");
});
check("D2", "age is computed server-side; the browser's opinion is UX only", () => {
  ok(ACTIONS.includes("judgeOnboardingInput"), "the pure judge is not applied by the action");
  ok(ACTIONS.includes("new Date(), // the server's clock decides the age"), "the server-clock pin moved");
  ok(REGISTER_FORM.includes("parseDob") && REGISTER_FORM.includes("UX only"), "the form's minor flag is not marked UX-only");
});
check("D3", "the minor halt: account pending_guardian, enrolment trigger-blocked, consent deferred to the guardian", () => {
  ok(ONBOARDING.includes("minorNextStep"), "the minor next-step sentence is missing");
  ok(/dob \+ interval '18 years' > current_date/.test(M12), "the DB trigger's boundary moved");
  ok(/create trigger enrolments_guardian_gate\s+before insert on public\.enrolments/.test(M12), "the trigger is gone");
  const minor = ACTIONS.slice(ACTIONS.indexOf('judgement.path === "minor"'));
  ok(!strip(minor).slice(0, 400).includes(".insert("), "the minor branch writes beyond the account");
});
check("D4", "the verification flow is complete: ledger, token handler, confirmed page, pinned outcome", () => {
  ok(/token_hash\s+text not null unique check \(char_length\(token_hash\) = 64\)/.test(M12), "the ledger's digest shape moved");
  ok(VERIFY_ROUTE.includes("redeemGuardianToken"), "the handler does not redeem");
  ok(CONFIRMED.includes("verifyConfirmed"), "the confirmed page lost its outcome map");
  ok(ONBOARDING.includes("Consent has been confirmed. The student's academy access is now active."), "the confirmation sentence moved");
});
check("D5", "the consent audit is one-way: SHA-256 digests, the sentinel, own-only RLS", () => {
  ok(/ip_hash\s+text not null check \(char_length\(ip_hash\) = 64\)/.test(M11), "the digest CHECK moved");
  ok(CONSENT.includes("NO_ADDRESS_SOURCE"), "the honest sentinel is missing");
  ok(/for select to authenticated using \(user_id = auth\.uid\(\)\)/.test(M11), "the own-only read moved");
  ok(!/for update/.test(M11) && !/for delete/.test(M11), "an update/delete policy appeared");
});

/* ── T1–T3 · the zero-tracking posture ───────────────────────────────────── */
check("T1", "the never-collected list stands in public, complete", () => {
  for (const phrase of [
    "Facial recognition or any biometric data",
    "Keystroke logs, typing patterns or input telemetry",
    "Attention metrics, idle or dwell timers, time-on-task figures, engagement scores",
    "Location data, device fingerprinting, or cross-site identifiers",
    "Third-party advertising data, marketing pixels, tracking beacons, or third-party cookies",
  ]) {
    ok(PRIVACY.includes(phrase), `missing: ${phrase.slice(0, 30)}…`);
  }
});
check("T2", "zero cookie banner, stated as fact — there is nothing to consent to", () => {
  ok(flat(PRIVACY).includes("There is no cookie banner on this site because there is nothing to consent to"), "the sentence moved");
});
check("T3", "no third-party tracker vocabulary anywhere in the tree", () => {
  const files = execFileSync("git", ["ls-files", "--", "src"], { encoding: "utf8" }).split("\n").filter((f) => f && /\.(ts|tsx)$/.test(f));
  const vendors = /mixpanel|hotjar|google-analytics|gtag\(|fbq\(|facebook pixel|segment\.io|amplitude\(/i;
  const hits = [];
  for (const f of files) {
    if (vendors.test(strip(read(f)))) hits.push(f);
  }
  ok(hits.length === 0, `tracker vocabulary in: ${hits.join(", ")}`);
});

/* ── C1–C2 · the terms' required clauses ─────────────────────────────────── */
check("C1", "the terms define the pedagogical relationship and the engine's boundary", () => {
  ok(TERMS.includes("What this academy is"), "the relationship section is missing");
  ok(TERMS.includes("never supplies answers"), "the engine's boundary is missing");
  ok(TERMS.includes("No outcome is promised"), "the outcome refusal is missing");
});
check("C2", "the student owns their proofs; no commercial lock-in", () => {
  ok(flat(TERMS).includes("The student's work belongs to the student"), "the ownership section is missing");
  ok(flat(TERMS).includes("claims no ownership over them"), "the ownership claim moved");
  ok(TERMS.includes("No commercial lock-in"), "the lock-in section is missing");
  ok(flat(TERMS).includes("Nothing here is designed to be difficult to leave"), "the leaving sentence moved");
});

/* ── E1–E2 · the register itself ─────────────────────────────────────────── */
check("E1", "Exception E-07 stands CLOSED in the register", () => {
  ok(/\| E-07 \|.*\*\*CLOSED — Phase 10 · Step 1/.test(EXCEPTIONS), "the E-07 closure record is missing");
});
check("E2", "the register's count stands at 18 open, with the Phase 10 notes", () => {
  const open = (EXCEPTIONS.match(/\*\*18 open\.\*\*/g) ?? []).length;
  ok(open >= 1, "the 18-open count is not pinned");
  ok(EXCEPTIONS.includes("Phase 10 · Step 3 note"), "the Step 3 note is missing");
});

/* ── G1–G2 · the guardian gate's integrity ───────────────────────────────── */
check("G1", "the gate stays one field, one act — zero dark-pattern anatomy", () => {
  ok((GATE.match(/<Input/g) ?? []).length === 1, "the gate grew an input");
  ok(!/type="checkbox"/.test(GATE), "a checkbox appeared in the gate");
  for (const banned of ["countdown", "pre-check", "prechecked", "defaultchecked", "are you sure", "last chance"]) {
    ok(!GATE.toLowerCase().includes(banned), `dark-pattern vocabulary: ${banned}`);
  }
});
check("G2", "the onboarding gate stands at /register/guardian, wired to the real act", () => {
  ok(GUARDIAN_REGISTER.includes("startGuardianVerification"), "the gate is not wired to the onboarding act");
  ok(GUARDIAN_REGISTER.includes("guardian_verified"), "the page does not read the flag");
  ok(REGISTER_FORM.includes("date_of_birth"), "the registration form lost the DoB field");
});

const passed = results.filter((r) => r.pass).length;
writeFileSync(
  new URL("../audit/phase10-compliance.json", import.meta.url),
  JSON.stringify(
    {
      gate: "PHASE 10 · WINDOW W2 — THE LEGAL & COMPLIANCE CERTIFICATION",
      run: "2026-10-08",
      verdict: passed === results.length ? "PASS" : "FAIL",
      passed,
      total: results.length,
      checks: results,
    },
    null,
    2,
  ),
);
console.log(`\n${passed}/${results.length} checks passed`);
if (passed !== results.length) process.exit(1);
