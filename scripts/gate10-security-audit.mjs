#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   PHASE 10 GATE · WINDOW W3 — THE SECURITY & ZERO-LEAK AUDIT
   Baseline: audit/phase10-security.json

   MEASURED, not assumed: this harness boots the committed production
   build on port 3126, verifies the six headers live on real responses,
   walks each rate-limit budget to its exact refusal, then kills the
   server strictly by port. The zero-leak sweep and the static security
   suite run as subprocesses. Requires `npm run build` (done in W1).
   Run: node scripts/gate10-security-audit.mjs
   ════════════════════════════════════════════════════════════════════════ */
import { execFileSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const PORT = 3126;
const BASE = `http://127.0.0.1:${PORT}`;
const results = [];
const record = (id, detail, pass, error) => {
  results.push({ id, detail, pass, ...(error ? { error: String(error).slice(0, 200) } : {}) });
  console.log(`${pass ? "PASS" : "FAIL"}  ${id} · ${detail}${pass ? "" : `\n      ${error}`}`);
};
const check = (id, detail, fn) => {
  try {
    fn();
    record(id, detail, true);
  } catch (e) {
    record(id, detail, false, e.message ?? e);
  }
};
const ok = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const curl = (args) => execFileSync("curl", args, { encoding: "utf8", timeout: 15000 });

function killByPort() {
  try {
    const out = execFileSync("bash", ["-c", `ss -ltnp 2>/dev/null | grep ":${PORT} " | sed -n 's/.*pid=\\([0-9]*\\).*/\\1/p' | sort -u`], { encoding: "utf8" });
    for (const pid of out.split("\n").filter(Boolean)) {
      try { process.kill(Number(pid), 9); } catch { /* already gone */ }
    }
  } catch { /* nothing listening */ }
}

async function waitPortClosed() {
  for (let i = 0; i < 10; i++) {
    const out = execFileSync("bash", ["-c", `ss -ltn | grep ":${PORT} " || true`], { encoding: "utf8" });
    if (out.trim() === "") return true;
    await sleep(500);
  }
  return false;
}

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      curl(["-s", "-o", "/dev/null", `${BASE}/legal/terms`]);
      return true;
    } catch {
      await sleep(1000);
    }
  }
  return false;
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "ignore",
  detached: true, // own process group, so the kill reaches `next start` too
});

try {
  const ready = await waitReady();

  check("S1", "the six security headers stand live on a real response", () => {
    ok(ready, "the production server did not come up");
    const headers = curl(["-sI", `${BASE}/`]).toLowerCase();
    for (const key of [
      "content-security-policy",
      "strict-transport-security",
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy",
      "permissions-policy",
    ]) {
      ok(headers.includes(key), `missing header ${key}`);
    }
    ok(headers.includes("x-frame-options: deny"), "XFO is not DENY");
    ok(headers.includes("nosniff"), "nosniff missing");
    ok(headers.includes("interest-cohort=()"), "interest-cohort not refused");
  });

  check("S2", "the live CSP carries no unsafe-eval and locks framing", () => {
    const csp = curl(["-sI", `${BASE}/legal/terms`]).split("\n").find((l) => /^content-security-policy/i.test(l)) ?? "";
    ok(csp.includes("default-src 'self'"), "default-src moved");
    ok(csp.includes("frame-ancestors 'none'"), "frame-ancestors moved");
    ok(!csp.includes("unsafe-eval"), "unsafe-eval admitted live");
    ok(csp.includes("https://*.supabase.co"), "supabase source missing");
  });

  check("S3", "headers reach every route class (legal pages sampled)", () => {
    for (const path of ["/legal/terms", "/legal/privacy", "/legal/guardian-consent", "/register"]) {
      const h = curl(["-sI", `${BASE}${path}`]).toLowerCase();
      ok(h.includes("content-security-policy"), `no CSP on ${path}`);
    }
  });

  check("S4", "/login: exactly five POSTs admitted, the sixth is the calm 429", () => {
    const SENTENCE = "Too many attempts have been made recently. Please wait a few moments before trying again.";
    for (let i = 1; i <= 5; i++) {
      const code = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", `${BASE}/login`]).trim();
      ok(code !== "429", `attempt ${i} limited early`);
    }
    const body = execFileSync("bash", ["-c", `curl -s -X POST ${BASE}/login`], { encoding: "utf8" });
    const code = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", `${BASE}/login`]).trim();
    ok(code === "429", `the 7th probe saw ${code}, not 429`);
    ok(body.includes(SENTENCE), "the calm sentence is not the 429 body");
  });

  check("S5", "/register: three POST budget, and GETs never spend it", () => {
    for (let i = 1; i <= 3; i++) {
      const code = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", `${BASE}/register`]).trim();
      ok(code !== "429", `register attempt ${i} limited early`);
    }
    const denied = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", `${BASE}/register`]).trim();
    ok(denied === "429", "the fourth register POST was not limited");
    const get = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", `${BASE}/register`]).trim();
    ok(get !== "429", "a page read was limited");
  });

  check("S6", "/auth/verify-guardian: ten GET budget, the eleventh is 429", () => {
    for (let i = 1; i <= 10; i++) {
      const code = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", `${BASE}/auth/verify-guardian?token=gate10-${i}`]).trim();
      ok(code !== "429", `verification probe ${i} limited early`);
    }
    const denied = curl(["-s", "-o", "/dev/null", "-w", "%{http_code}", `${BASE}/auth/verify-guardian?token=gate10-11`]).trim();
    ok(denied === "429", "the eleventh probe was not limited");
  });

  check("S7", "the zero-leak sweep is clean over the committed tree", () => {
    const out = execFileSync("node", ["scripts/audit-secrets.mjs"], { encoding: "utf8" });
    ok(out.includes("zero-leak sweep clean"), out.trim());
  });

  check("S8", "the static security suite is green (14 pins)", () => {
    const out = execFileSync("node", ["--import", "./scripts/ts-loader.mjs", "scripts/test-security-logic.mjs"], { encoding: "utf8" });
    ok(/14\/14 security logic tests passed/.test(out), out.split("\n").filter((l) => l.includes("FAIL")).join("; ") || "suite not green");
  });
} finally {
  // Kill the process GROUP (npx spawns `next start` as a child), then by port.
  try { process.kill(-server.pid, 9); } catch { /* already gone */ }
  try { server.kill(9); } catch { /* already gone */ }
  killByPort();
}

const portClosed = await waitPortClosed();

const passed = results.filter((r) => r.pass).length;
writeFileSync(
  new URL("../audit/phase10-security.json", import.meta.url),
  JSON.stringify(
    {
      gate: "PHASE 10 · WINDOW W3 — THE SECURITY & ZERO-LEAK AUDIT",
      run: "2026-10-08",
      measured: { port: PORT, serverKilledByPort: portClosed },
      verdict: passed === results.length && portClosed ? "PASS" : "FAIL",
      passed,
      total: results.length,
      checks: results,
    },
    null,
    2,
  ),
);
console.log(`\n${passed}/${results.length} checks passed · server killed by port: ${portClosed}`);
if (passed !== results.length || !portClosed) process.exit(1);
