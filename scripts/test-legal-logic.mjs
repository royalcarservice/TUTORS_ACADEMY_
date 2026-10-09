#!/usr/bin/env node
// Legal framework tests (Phase 10 · Step 1, DEC-037 · resolves E-07).
// Pure — zero network, zero database: the consent union's closure, the
// guardian-email guard, the one-way address hashing, the closed calm
// vocabulary (zero exclamation, the DPDP sentence verbatim) and the
// migration's boundaries are proven offline, then the migration's CHECK
// list is pinned against the code's union.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-legal-logic.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const CONSENT = await import("@/lib/legal/consent");
const {
  CONSENT_TYPES,
  isConsentType,
  GUARDIAN_EMAIL_MAX,
  isGuardianEmail,
  NO_ADDRESS_SOURCE,
  hashConsentSource,
  consentAddressSource,
  LEGAL_COPY,
  validateConsentInput,
} = CONSENT;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const MIGRATION = "supabase/migrations/20261008000011_phase10_legal.sql";
const GATE_SRC = "src/components/legal/guardian-gate.tsx";
const DATA_SRC = "src/lib/legal/data.ts";

/* ── 1 · the consent union is closed ─────────────────────────────────────── */
t("the consent union is exactly the closed three", () => {
  assert.deepEqual([...CONSENT_TYPES], ["terms_v1", "privacy_v1", "guardian_consent_v1", "terms_v2", "privacy_v2"]);
});
t("the type guard admits only the union", () => {
  for (const c of CONSENT_TYPES) assert.ok(isConsentType(c), `${c} refused`);
  for (const bad of ["terms_v3", "guardian_consent_v2", "answer", "", "TERMS_V1"]) {
    assert.ok(!isConsentType(bad), `${bad} admitted`);
  }
});
t("validateConsentInput refuses anything outside the union — calmly", () => {
  for (const bad of ["terms_v3", "marketing_v1", ""]) {
    const v = validateConsentInput(bad, null);
    assert.equal(v.ok, false, `${bad} admitted`);
    assert.equal(v.sentence, LEGAL_COPY.recordFailed);
  }
});

/* ── 2 · the guardian-email guard ────────────────────────────────────────── */
t("the email gate admits one clean address shape", () => {
  assert.ok(isGuardianEmail("guardian@example.com"));
  assert.ok(isGuardianEmail("  guardian.name+tag@mail.example.co.in  ")); // trims
});
t("the email gate refuses malformed addresses", () => {
  for (const bad of ["", "   ", "no-at-sign", "a@b", "@b.com", "a b@c.com", "a@@b.com", "a@b.com.", "a".padEnd(300, "x") + "@b.com"]) {
    assert.ok(!isGuardianEmail(bad), JSON.stringify(bad.slice(0, 20)) + " admitted");
  }
});
t("the cap is 254, mirrored thrice (code, gate field, DB CHECK)", () => {
  assert.equal(GUARDIAN_EMAIL_MAX, 254);
  const gate = rawFile(GATE_SRC);
  assert.ok(gate.includes("maxLength={GUARDIAN_EMAIL_MAX}"), "the gate field is uncapped");
  const sql = rawFile(MIGRATION);
  assert.ok(/char_length\(guardian_email\) <= 254/.test(sql), "the DB CHECK is missing");
});
t("a guardian consent REQUIRES the email; terms/privacy FORBID it", () => {
  const good = validateConsentInput("guardian_consent_v1", "guardian@example.com");
  assert.equal(good.ok, true);
  assert.equal(good.guardianEmail, "guardian@example.com");
  const missing = validateConsentInput("guardian_consent_v1", "");
  assert.equal(missing.ok, false);
  assert.equal(missing.sentence, LEGAL_COPY.invalidEmail);
  for (const plain of ["terms_v1", "privacy_v1"]) {
    const v = validateConsentInput(plain, "ignored@example.com"); // the column means one thing
    assert.equal(v.ok, true);
    assert.equal(v.guardianEmail, null, `${plain} carried a guardian email`);
  }
});

/* ── 3 · the address is never stored — hashing pins ──────────────────────── */
t("the hash is a 64-hex SHA-256 digest, deterministic", () => {
  const h = hashConsentSource("203.0.113.7");
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.equal(hashConsentSource("203.0.113.7"), h);
  assert.notEqual(hashConsentSource("203.0.113.7"), hashConsentSource("203.0.113.8"));
});
t("the sentinel hashes to the same shape — absence stays indistinguishable", () => {
  assert.match(hashConsentSource(NO_ADDRESS_SOURCE), /^[0-9a-f]{64}$/);
});
t("the address source: first xff entry, else real-ip, else the honest sentinel", () => {
  assert.equal(consentAddressSource("203.0.113.7, 10.0.0.1", null), "203.0.113.7");
  assert.equal(consentAddressSource(" 198.51.100.9 , 10.0.0.1", null), "198.51.100.9");
  assert.equal(consentAddressSource(null, "192.0.2.4"), "192.0.2.4");
  assert.equal(consentAddressSource("", "  "), NO_ADDRESS_SOURCE);
  assert.equal(consentAddressSource(null, null), NO_ADDRESS_SOURCE);
});
t("the DB mirrors the digest's shape (64 characters, NOT NULL)", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/ip_hash\s+text not null check \(char_length\(ip_hash\) = 64\)/.test(sql));
});

/* ── 4 · the calm vocabulary — swept ─────────────────────────────────────── */
t("the DPDP sentence stands verbatim (the brief's requirement)", () => {
  assert.equal(
    LEGAL_COPY.guardianDpdpSentence,
    "As a student under 18, the Digital Personal Data Protection Act requires verified guardian consent before enrolling in subject chambers.",
  );
  assert.ok(rawFile(GATE_SRC).includes("LEGAL_COPY.guardianDpdpSentence"), "the gate does not render the pinned sentence");
});
t("zero exclamation marks anywhere in the consent vocabulary", () => {
  for (const [k, v] of Object.entries(LEGAL_COPY)) {
    assert.ok(!v.includes("!"), `${k} shouts`);
  }
});
t("zero coercive or dark-pattern vocabulary in the gate", () => {
  const gate = strip(rawFile(GATE_SRC)).toLowerCase();
  for (const banned of ["countdown", "pre-check", "prechecked", "defaultchecked", "are you sure", "last chance", "don't miss", "only few", "limited time"]) {
    assert.ok(!gate.includes(banned), `the gate contains "${banned}"`);
  }
  assert.ok(!/type="checkbox"/.test(strip(rawFile(GATE_SRC))), "the gate carries a checkbox");
});
t("the failure sentence claims only what is known", () => {
  assert.equal(LEGAL_COPY.recordFailed, "The consent could not be recorded. Nothing was changed; repeating is safe.");
});
t("the success sentence is honest about the delivery channel", () => {
  assert.ok(LEGAL_COPY.guardianRecorded.includes("not wired in this deployment"), "the success sentence claims a sent email");
});

/* ── 5 · the action's posture ────────────────────────────────────────────── */
t("the action reads the headers, hashes server-side, never echoes the hash", () => {
  const src = rawFile(DATA_SRC);
  assert.ok(src.includes('"use server"'), "not a server module");
  assert.ok(src.includes("hashConsentSource"), "the hash is not computed server-side");
  assert.ok(src.includes("ip_hash: ipHash"), "the insert carries the digest");
  assert.ok(!/notice: ipHash|error: ipHash/.test(src), "the digest reaches the client");
});
t("the action enforces idempotency by deliberation (read before insert)", () => {
  const src = rawFile(DATA_SRC);
  assert.ok(src.includes("alreadyRecorded"), "the duplicate path is missing");
  const readAt = src.indexOf('.from("legal_consents")');
  const insertAt = src.lastIndexOf(".insert(");
  assert.ok(readAt !== -1 && insertAt > readAt, "the standing consent is not read first");
});

/* ── 6 · the migration's boundaries ──────────────────────────────────────── */
t("migration — RLS enabled AND forced; own-only select and insert", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/alter table public\.legal_consents enable row level security/.test(sql));
  assert.ok(/alter table public\.legal_consents force row level security/.test(sql));
  assert.ok(/for select to authenticated using \(user_id = auth\.uid\(\)\)/.test(sql));
  assert.ok(/for insert to authenticated with check \(user_id = auth\.uid\(\)\)/.test(sql));
});
t("migration — no update, no delete policy; anon admitted nowhere", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(!/for update/.test(sql), "an update policy exists");
  assert.ok(!/for delete/.test(sql), "a delete policy exists");
  assert.ok(!/to anon/.test(sql), "a policy admits anon");
});
t("migration — the CHECK mirrors the code's union byte-for-byte", () => {
  const sql = rawFile(MIGRATION);
  const dbList = [...sql.matchAll(/consent_type in \(([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(dbList.length >= 1, "the CHECK is missing");
  const dbTypes = dbList[0].split(",").map((s) => s.trim().replace(/^'|'$/g, "")).sort();
  assert.deepEqual(dbTypes, [...CONSENT_TYPES].sort());
});
t("migration — append-only audit: deliberately NO unique (user_id, consent_type)", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(!/unique\s*\(\s*user_id\s*,\s*consent_type\s*\)/i.test(sql), "a unique constraint would eat a re-grant row");
});
t("migration — the profile cascade and the grants posture", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/references public\.profiles \(id\) on delete cascade/.test(sql));
  assert.ok(/revoke all on public\.legal_consents from anon, authenticated/.test(sql));
  assert.ok(/grant select, insert on public\.legal_consents to authenticated/.test(sql));
});

console.log(`\n${n - failed}/${n} legal logic tests passed`);
if (failed > 0) process.exit(1);
