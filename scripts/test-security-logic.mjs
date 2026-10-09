#!/usr/bin/env node
// Security hardening tests (Phase 10 · Step 3, DEC-039).
// Pure — zero network: the sliding-window boundaries, the one-way keying,
// the brief's thresholds, the CSP/header set, the calm 429 sentence and
// the anti-enumeration posture are proven offline and pinned against the
// configuration files.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-security-logic.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const RL = await import("@/lib/security/rate-limit");
const {
  SECURITY_COPY,
  RATE_LIMIT_RULES,
  bucketFor,
  rateLimitKeyFor,
  slidingWindowCheck,
  attemptRateLimited,
  resetRateLimitStore,
  addressSourceOf,
} = RL;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
// Block comments only: a line-comment stripper would eat the '//' inside URLs.
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "");
const CONFIG = "next.config.ts";
const PROXY = "src/proxy.ts";
const ACTIONS = "src/features/auth/actions.ts";

/* ── 1 · the brief's thresholds, pinned ──────────────────────────────────── */
t("thresholds stand exactly as briefed", () => {
  assert.deepEqual(RATE_LIMIT_RULES.login, { limit: 5, windowMs: 15 * 60 * 1000 });
  assert.deepEqual(RATE_LIMIT_RULES.register, { limit: 3, windowMs: 60 * 60 * 1000 });
  assert.deepEqual(RATE_LIMIT_RULES.verifyGuardian, { limit: 10, windowMs: 60 * 60 * 1000 });
});
t("only attempts count — page reads are never limited", () => {
  assert.equal(bucketFor("POST", "/login"), "login");
  assert.equal(bucketFor("POST", "/register"), "register");
  assert.equal(bucketFor("GET", "/auth/verify-guardian"), "verifyGuardian");
  assert.equal(bucketFor("GET", "/login"), null);
  assert.equal(bucketFor("GET", "/register"), null);
  assert.equal(bucketFor("GET", "/"), null);
  assert.equal(bucketFor("GET", "/auth/verify-guardian/confirmed"), null);
});

/* ── 2 · the sliding window's edges ──────────────────────────────────────── */
t("the limit-th attempt is admitted, the (limit+1)th refused", () => {
  const rule = RATE_LIMIT_RULES.login;
  for (let i = 0; i < rule.limit; i++) {
    const j = slidingWindowCheck(Array.from({ length: i }, (_, k) => 1000 + k), 2000 + i, rule);
    assert.equal(j.allowed, true, `attempt ${i + 1} refused`);
  }
  const over = slidingWindowCheck(Array.from({ length: rule.limit }, (_, k) => 1000 + k), 2000 + rule.limit, rule);
  assert.equal(over.allowed, false);
  assert.ok(over.retryAfterMs > 0, "no Retry-After computed");
});
t("the window slides: an attempt expires exactly windowMs after it was made", () => {
  const rule = { limit: 2, windowMs: 1000 };
  const atExpiry = slidingWindowCheck([0, 500], 1000, rule); // t=0 expired (strict)
  assert.equal(atExpiry.allowed, true);
  const inside = slidingWindowCheck([500, 600], 1000, rule);
  assert.equal(inside.allowed, false);
});
t("a refused attempt does not extend the refusal", () => {
  resetRateLimitStore();
  const now = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(attemptRateLimited("login", "203.0.113.9", now + i).allowed, true);
  const refused = attemptRateLimited("login", "203.0.113.9", now + 10);
  assert.equal(refused.allowed, false);
  // The oldest attempt (t=now) expires at now+15min — nothing later matters.
  assert.equal(refused.retryAfterMs, RATE_LIMIT_RULES.login.windowMs - 10);
});
t("buckets do not share budgets, and neither do addresses", () => {
  resetRateLimitStore();
  for (let i = 0; i < 3; i++) attemptRateLimited("register", "198.51.100.1", 5000 + i);
  assert.equal(attemptRateLimited("register", "198.51.100.1", 9000).allowed, false);
  assert.equal(attemptRateLimited("login", "198.51.100.1", 9001).allowed, true, "budgets crossed buckets");
  assert.equal(attemptRateLimited("register", "198.51.100.2", 9002).allowed, true, "budgets crossed addresses");
});

/* ── 3 · the keying is one-way ───────────────────────────────────────────── */
t("keys are 64-hex digests, deterministic, bucket-prefixed", () => {
  const k1 = rateLimitKeyFor("login", "203.0.113.7");
  assert.match(k1, /^[0-9a-f]{64}$/);
  assert.equal(rateLimitKeyFor("login", "203.0.113.7"), k1);
  assert.notEqual(rateLimitKeyFor("register", "203.0.113.7"), k1, "buckets share a key");
  assert.notEqual(rateLimitKeyFor("login", "203.0.113.8"), k1);
  assert.ok(!k1.includes("203"), "the address leaks into the key");
});
t("the address source matches the consent audit's convention", () => {
  const h = (o) => new Headers(o);
  assert.equal(addressSourceOf(h({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })), "203.0.113.7");
  assert.equal(addressSourceOf(h({ "x-real-ip": "192.0.2.4" })), "192.0.2.4");
  assert.equal(addressSourceOf(h({})), "no-address");
});

/* ── 4 · the calm sentence ───────────────────────────────────────────────── */
t("the 429 sentence stands verbatim (the brief's requirement)", () => {
  assert.equal(
    SECURITY_COPY.rateLimited,
    "Too many attempts have been made recently. Please wait a few moments before trying again.",
  );
  assert.ok(!SECURITY_COPY.rateLimited.includes("!"), "the sentence shouts");
});
t("the proxy returns 429 with the sentence and an honest Retry-After", () => {
  const src = rawFile(PROXY);
  assert.ok(src.includes("status: 429"));
  assert.ok(src.includes("SECURITY_COPY.rateLimited"));
  assert.ok(src.includes('"Retry-After"'));
  assert.ok(src.includes("attemptRateLimited"), "the limiter is not wired at the boundary");
});

/* ── 5 · the CSP and header set ──────────────────────────────────────────── */
t("the CSP carries the briefed directives, and nothing looser", () => {
  const src = strip(rawFile(CONFIG));
  for (const directive of [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ]) {
    assert.ok(src.includes(directive), `missing ${directive}`);
  }
  assert.ok(src.includes("wss://*.supabase.co"), "missing the realtime websocket source");
  assert.ok(!src.includes("unsafe-eval"), "unsafe-eval admitted");
  assert.ok(!src.includes("connect-src 'self' *"), "loose connect wildcard");
});
t("the six headers stand for every route", () => {
  const src = rawFile(CONFIG);
  for (const key of [
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.ok(src.includes(key), `missing header ${key}`);
  }
  assert.ok(src.includes('value: "DENY"'));
  assert.ok(src.includes('value: "nosniff"'));
  assert.ok(src.includes('value: "strict-origin-when-cross-origin"'));
  assert.ok(src.includes("camera=(self), microphone=(self), geolocation=(), interest-cohort=()"));
  assert.ok(src.includes('source: "/:path*"'));
});
t("the WebGL lattice needs no eval — script-src 'self' suffices", () => {
  const lattice = rawFile("src/lib/ambient/webgl-lattice.ts");
  assert.ok(!/\beval\(|new Function\(/.test(lattice), "the lattice evals");
});

/* ── 6 · anti-enumeration posture ────────────────────────────────────────── */
t("sign-in failures stay generic — the wrong half is never named", () => {
  const src = rawFile(ACTIONS);
  assert.ok(src.includes("signInRefused"), "the generic refusal sentence moved");
  assert.ok(!/wrong password/i.test(src.replace(/never disclose|which half was wrong/gi, "")), "a specific password-refusal sentence exists");
  assert.ok(!/no such (user|account|email)/i.test(src), "the response names the absence of an account");
});

console.log(`\n${n - failed}/${n} security logic tests passed`);
if (failed > 0) process.exit(1);
