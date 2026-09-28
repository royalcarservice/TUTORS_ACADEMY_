#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════
   AUTHORIZATION TESTS (P5-R2 FIX 3) — records the two accepted behaviour
   changes on certified routes as EXPECTED in the 3.7/4.9 baseline:
     (a) an ENROLLED identity reaches a DRAFT environment; visitors 404
     (b) /tutor and /admin check ROLE server-side (student → /student)
   Runs against the PRODUCTION build with real sign-ins. Reports status code
   AND rendered surface for every (actor, route) pair, and proves the check
   is server-side by reading the FIRST response (no JS executed).
     PROD_URL=http://localhost:3100 NODE_PATH=./node_modules node audit/permissions.cjs --write
   --write merges `authorization` into audit/baseline.json (page.cjs never
   compares that key, so it documents rather than gates 4.9's own metrics).
   ══════════════════════════════════════════════════════════════════════════ */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const P = process.env.PROD_URL || "http://localhost:3100";
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const ACCOUNTS = { A: process.env.TEST_A || "student-a@test.tutorsacademy.invalid", C: process.env.TEST_C || "student-c@test.tutorsacademy.invalid" };
const BASELINE = path.join(__dirname, "baseline.json");
const write = process.argv.includes("--write");

async function login(browser, state) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto(P + "/login?next=%2Fstudent", { waitUntil: "load" });
  await p.type("input[name=email]", ACCOUNTS[state]); await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (!p.url().endsWith("/student")) throw new Error("sign-in failed " + state);
  return { ctx, p };
}
const surfaceOf = (html, status) => {
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, "").trim() || "(no h1)";
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  const kind = status === 404 ? "404 page" : /data-student-shell/.test(body) ? "student shell" : /Tutor overview/.test(body) ? "TUTOR PLACEHOLDER" : /Admin overview/.test(body) ? "ADMIN PLACEHOLDER" : /name="password"/.test(body) ? "login form" : /data-spatial="stage"/.test(body) ? "subject environment" : "other";
  return { h1, surface: kind, shellMarkup: /data-student-shell/.test(html), draftBanner: /draft/i.test(html.replace(/<script[\s\S]*?<\/script>/g, "")) };
};
// First-response fetch WITH the session cookies, no JS, redirect=manual → proves the decision is server-side.
async function raw(p, url) {
  return p.evaluate(async (u) => {
    const r = await fetch(u, { redirect: "manual", headers: { accept: "text/html" } });
    const loc = r.headers.get("location");
    return { status: r.status, type: r.type, location: loc, body: r.type === "opaqueredirect" ? "" : await r.text() };
  }, url);
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const ROUTES = ["/tutor", "/admin", "/subjects/physics", "/subjects/mathematics", "/student"];
  const R = { generatedAt: new Date().toISOString(), note: "EXPECTED behaviour since 5.3 (P5-R1/P5-R2): enrolled identity admitted to own draft environment; role checked server-side on /tutor and /admin.", results: {} };

  // signed-out visitor
  {
    const p = await browser.newPage(); await p.setJavaScriptEnabled(false);
    R.results.visitor = {};
    for (const r of ROUTES) {
      const res = await p.goto(P + r, { waitUntil: "load" });
      const chain = res.request().redirectChain().map((x) => x.response()?.status() + " " + new URL(x.url()).pathname);
      const html = await p.content();
      R.results.visitor[r] = { firstStatus: chain.length ? +chain[0].split(" ")[0] : res.status(), landed: new URL(p.url()).pathname + new URL(p.url()).search, finalStatus: res.status(), ...surfaceOf(html, res.status()), js: false };
    }
    await p.close();
  }
  // student A (no enrolment) and student C (enrolled physics=draft, mathematics)
  for (const s of ["A", "C"]) {
    const { ctx, p } = await login(browser, s);
    const out = (R.results[`student-${s}`] = {});
    for (const r of ROUTES) {
      const first = await raw(p, r); // server's first answer, no client code
      const res = await p.goto(P + r, { waitUntil: "load" });
      const html = await p.content();
      out[r] = { firstStatus: first.type === "opaqueredirect" ? "3xx (redirect, server)" : first.status, firstSurface: first.body ? surfaceOf(first.body, first.status).surface : "(redirect)", landed: new URL(p.url()).pathname, finalStatus: res.status(), ...surfaceOf(html, res.status()) };
    }
    await ctx.close();
  }
  await browser.close();

  // assertions
  const v = R.results.visitor, a = R.results["student-A"], c = R.results["student-C"];
  const checks = {
    "visitor /tutor → login": v["/tutor"].landed.startsWith("/login") && v["/tutor"].surface === "login form",
    "visitor /admin → login": v["/admin"].landed.startsWith("/login") && v["/admin"].surface === "login form",
    "visitor draft env → 404": v["/subjects/physics"].finalStatus === 404,
    "visitor ready env → 200": v["/subjects/mathematics"].finalStatus === 200,
    "student /tutor → /student, server-side": a["/tutor"].landed === "/student" && String(a["/tutor"].firstStatus).startsWith("3") && a["/tutor"].surface === "student shell",
    "student /admin → /student, server-side": a["/admin"].landed === "/student" && String(a["/admin"].firstStatus).startsWith("3") && a["/admin"].surface === "student shell",
    "student never sees tutor/admin placeholder": [a, c].every((x) => !/PLACEHOLDER/.test(x["/tutor"].surface + x["/admin"].surface + x["/tutor"].firstSurface + x["/admin"].firstSurface)),
    "non-enrolled student draft env → 404": a["/subjects/physics"].finalStatus === 404,
    "enrolled student draft env → 200 + draft label": c["/subjects/physics"].finalStatus === 200 && c["/subjects/physics"].surface === "subject environment" && c["/subjects/physics"].draftBanner,
  };
  R.checks = checks; R.pass = Object.values(checks).every(Boolean);
  console.log(JSON.stringify(R.results, null, 1));
  console.log("\nCHECKS:\n" + Object.entries(checks).map(([k, ok]) => `${ok ? "PASS" : "FAIL"}  ${k}`).join("\n"));
  if (write) {
    const B = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
    B.authorization = R;
    fs.writeFileSync(BASELINE, JSON.stringify(B, null, 1));
    console.log("\nrecorded as baseline.authorization →", BASELINE);
  }
  process.exit(R.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
