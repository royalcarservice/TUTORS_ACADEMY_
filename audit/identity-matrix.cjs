/* IDENTITY MATRIX (P6-R6 · standing). Every app route × every reader class.
 *
 *   node audit/identity-matrix.cjs --write   pin audit/identity-matrix.json
 *   node audit/identity-matrix.cjs --check   diff against the pin; FAIL on any
 *                                            cell change and on any route with
 *                                            no row (coverage gate)
 *
 * READER CLASSES (one shared identity set, fixture accounts only):
 *   visitor   no cookies
 *   expired   cookies present, session invalid (student A's cookies corrupted)
 *   studentA  student-c  — enrolled; RELATED to tutor T in physics (draft)
 *   studentB  student-b  — enrolled; related to nobody
 *   tutorT    tutor-a    — related to student A in physics only
 *   tutorU    tutor-u    — related to nobody
 *   admin     ABSENCE    — no admin account exists (handle_new_user collapses
 *             the role; no service-role admin was ever created). Recorded as a
 *             DB fact, not as a row of requests.
 *
 * ROUTES are DERIVED from src/app (page.tsx + route.ts), so a new route with
 * no pinned row fails --check. Dynamic [subject]/[relationship] (6.3) is
 * instantiated five ways from the live fixture: tutor T's active relationship
 * (student-c, physics) · an ENDED one · a random uuid · the active one under
 * the WRONG subject · a user id in the slot. Dynamic [subject] is instantiated for the one
 * ready subject and one draft subject. Route handlers are requested with GET
 * (no state-changing POST is issued by this harness).
 *
 * NAMED REGRESSION ROW: "tutor T denied student A's draft door" =
 *   routes["/subjects/physics"].tutorT → 404 (the E-23 tutor-leak, DEC-014).
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { execFileSync } = require("child_process");

const P = process.env.PROD_URL || "http://localhost:3100";
const ROOT = path.join(__dirname, "..");
const PIN = path.join(__dirname, "identity-matrix.json");
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const ACCOUNTS = {
  studentA: process.env.TEST_C || "student-c@test.tutorsacademy.invalid",
  studentB: process.env.TEST_B || "student-b@test.tutorsacademy.invalid",
  tutorT: process.env.TEST_TUTOR || "tutor-a@test.tutorsacademy.invalid",
  tutorU: process.env.TEST_TUTOR_U || "tutor-u@test.tutorsacademy.invalid",
};
const CLASSES = ["visitor", "expired", "studentA", "studentB", "tutorT", "tutorU"];
const mode = process.argv.includes("--write") ? "write" : "check";
const dropRow = (process.argv.find((a) => a.startsWith("--drop-row=")) || "").split("=")[1]; // coverage-gate proof

function sql(q) {
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m);
    if (!env) return null;
    return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim();
  } catch { return null; }
}

/* the 6.3 fixture, read once from the DB (ids are stable test rows) */
let _rf;
function relationshipFixture() {
  if (_rf) return _rf;
  const q = (w) => sql(`select r.id from public.relationships r join auth.users t on t.id=r.tutor_id join auth.users s on s.id=r.student_id where t.email='tutor-a@test.tutorsacademy.invalid' and ${w} limit 1`) || "00000000-0000-4000-8000-000000000000";
  const active = q("s.email='student-c@test.tutorsacademy.invalid' and r.subject_id='physics' and r.state='active'");
  const ended = q("r.subject_id='physics' and r.state='ended'");
  const userId = sql("select id from auth.users where email='student-c@test.tutorsacademy.invalid'") || "00000000-0000-4000-8000-000000000001";
  return (_rf = { "active (tutor T ↔ student A, physics)": { subject: "physics", id: active }, "ended (physics)": { subject: "physics", id: ended }, "nonexistent (fixed uuid)": { subject: "physics", id: "7d1f2a4e-9c3b-4e8a-b2d6-5f0a1c9e8b7d" }, "wrong subject (the active one under /mathematics)": { subject: "mathematics", id: active }, "a user id in the slot": { subject: "physics", id: userId } });
}

/* ── routes from the filesystem ───────────────────────────────────────── */
function appRoutes() {
  const out = [];
  const walk = (dir, segs) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) walk(path.join(dir, ent.name), ent.name.startsWith("(") ? segs : [...segs, ent.name]);
      else if (ent.name === "page.tsx" || ent.name === "route.ts") {
        const kind = ent.name === "route.ts" ? "handler" : "page";
        const url = "/" + segs.join("/");
        if (url.includes("[relationship]")) {
          const f = relationshipFixture();
          for (const [tag, u] of Object.entries(f)) out.push({ url: url.replace("[subject]", u.subject).replace("[relationship]", u.id), kind, pattern: url + " · " + tag });
        } else if (url.includes("[subject]")) { out.push({ url: url.replace("[subject]", "mathematics"), kind, pattern: url }); out.push({ url: url.replace("[subject]", "physics"), kind, pattern: url }); }
        else out.push({ url: url === "/" ? "/" : url.replace(/\/$/, ""), kind, pattern: url });
      }
    }
  };
  walk(path.join(ROOT, "src/app"), []);
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

/* ── render fingerprint: what the body IS, not how it looks ───────────── */
function renderOf(html, status, finalUrl) {
  const u = new URL(finalUrl);
  if (/data-relationship-surface/.test(html)) return "relationship-surface";
  if (/data-tutor-shell/.test(html)) return "tutor-shell:" + (html.match(/data-state="([^"]+)"/) || [])[1];
  if (/data-student-shell/.test(html)) return "student-shell:" + (html.match(/data-state="([^"]+)"/) || [])[1];
  if (/data-subject-shell|data-environment/.test(html)) return "environment";
  if (/__next_error__/.test(html) || status === 404) return "not-found";
  if (/input\[name=email\]|name="email"/.test(html) && /\/login/.test(u.pathname)) return "login" + (u.search ? ":" + decodeURIComponent(u.search) : "");
  if (/name="email"/.test(html) && /\/register/.test(u.pathname)) return "register";
  if (/data-primary-surface|data-spine|data-scene/.test(html)) return "page";
  if (status >= 300 && status < 400) return "redirect";
  if (status === 405) return "method-not-allowed";
  return "page";
}

async function withClass(browser, cls) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (cls === "visitor") return { ctx, p };
  const email = cls === "expired" ? ACCOUNTS.studentA : ACCOUNTS[cls];
  await p.goto(P + "/login", { waitUntil: "load" });
  await p.type("input[name=email]", email);
  await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (/\/login/.test(p.url())) throw new Error(`sign-in failed for ${cls}: ${p.url()}`);
  if (cls === "expired") {
    const cookies = await p.cookies();
    for (const c of cookies.filter((c) => /^sb-.*-auth-token/.test(c.name))) {
      await p.setCookie({ ...c, value: "base64-" + Buffer.from(JSON.stringify({ access_token: "expired", refresh_token: "expired" })).toString("base64") });
    }
  }
  return { ctx, p };
}

(async () => {
  const routes = appRoutes();
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), base: P, classes: CLASSES, identitySet: {
    visitor: "no cookies", expired: "student A's cookies with the token replaced (present, invalid)",
    studentA: "student-c (fixture) — related to tutor T in physics", studentB: "student-b (fixture) — related to nobody",
    tutorT: "tutor-a (fixture) — related to student A in physics only", tutorU: "tutor-u (fixture) — related to nobody",
    admin: "ABSENCE — see R.admin",
  }, admin: {}, routes: {} };

  /* admin as an absence: a DB fact, re-checked every run */
  R.admin = {
    profilesWithAdminRole: sql("select count(*) from public.profiles where role='admin'"),
    usersWithAdminMetadata: sql("select count(*) from auth.users where raw_user_meta_data->>'role'='admin'"),
    note: "no admin account exists; /admin is reachable by nobody. Any count above other than 0 is a FAIL.",
  };
  /* the relationship fixture, stated */
  R.relationships = sql("select string_agg(t.email||' -> '||s.email||' : '||r.subject_id||' ('||r.state||')', '; ' order by t.email) from public.relationships r join auth.users t on t.id=r.tutor_id join auth.users s on s.id=r.student_id");

  for (const cls of CLASSES) {
    const { ctx, p } = await withClass(browser, cls);
    for (const r of routes) {
      const res = await p.goto(P + r.url, { waitUntil: "load" }).catch((e) => ({ error: String(e) }));
      if (res.error) { (R.routes[r.url] ||= { kind: r.kind, pattern: r.pattern })[cls] = { status: "ERR", landed: res.error.slice(0, 80) }; continue; }
      const chain = res.request().redirectChain();
      const first = chain.length ? chain[0].response()?.status() : res.status();
      const html = await p.content();
      const landed = new URL(p.url()).pathname + new URL(p.url()).search;
      (R.routes[r.url] ||= { kind: r.kind, pattern: r.pattern })[cls] = { status: first, landed: decodeURIComponent(landed), render: renderOf(html, res.status(), p.url()) };
    }
    await ctx.close();
  }
  await browser.close();

  /* ── gates ──────────────────────────────────────────────────────────── */
  const fail = [];
  const gate = (n, ok, d) => { R.gates = R.gates || {}; R.gates[n] = { pass: !!ok, detail: d }; if (!ok) fail.push(`${n}: ${d}`); };
  gate("admin-absence", R.admin.profilesWithAdminRole === "0" && R.admin.usersWithAdminMetadata === "0", JSON.stringify(R.admin));
  const draft = R.routes["/subjects/physics"];
  gate("regression: tutor T denied student A's draft door", draft && draft.tutorT.status === 404 && draft.tutorT.render === "not-found", JSON.stringify(draft && draft.tutorT));
  gate("tutor U (unrelated) sees state A, tutor T sees state B", R.routes["/tutor"].tutorU.render === "tutor-shell:A-no-relationships" && R.routes["/tutor"].tutorT.render === "tutor-shell:B-relationships-no-events", JSON.stringify([R.routes["/tutor"].tutorU, R.routes["/tutor"].tutorT]));
  gate("students never reach /tutor; tutors never reach /student", ["studentA", "studentB"].every((c) => R.routes["/tutor"][c].landed.startsWith("/student")) && ["tutorT", "tutorU"].every((c) => R.routes["/student"][c].landed.startsWith("/tutor")), "");
  gate("visitor and expired land on /login for every portal route", ["/student", "/student/account", "/tutor", "/tutor/account", "/admin"].every((u) => ["visitor", "expired"].every((c) => /^\/login\?next=/.test(R.routes[u][c].landed))), "");
  gate("/dev/* is 404 for every class", Object.entries(R.routes).filter(([u]) => u.startsWith("/dev")).every(([, row]) => CLASSES.every((c) => row[c].status === 404)), "");

  if (mode === "write") {
    fs.writeFileSync(PIN, JSON.stringify(R, null, 1));
    console.log("identity matrix pinned →", PIN, `(${Object.keys(R.routes).length} routes × ${CLASSES.length} classes)`);
  } else {
    if (!fs.existsSync(PIN)) { console.error("no pin; run --write"); process.exit(2); }
    const B = JSON.parse(fs.readFileSync(PIN, "utf8"));
    if (dropRow) { delete B.routes[dropRow]; console.log(`(coverage-gate proof) dropped pinned row for ${dropRow}`); }
    /* COVERAGE GATE: every route on disk must have a pinned row; every pinned row must still exist. */
    const missing = Object.keys(R.routes).filter((u) => !B.routes[u]);
    const stale = Object.keys(B.routes).filter((u) => !R.routes[u]);
    gate("coverage: every app route has a pinned row", missing.length === 0, "missing rows: " + missing.join(", "));
    gate("coverage: no pinned row for a route that no longer exists", stale.length === 0, "stale rows: " + stale.join(", "));
    const diffs = [];
    for (const u of Object.keys(R.routes)) for (const c of CLASSES) {
      const a = R.routes[u][c], b = B.routes[u] && B.routes[u][c];
      if (!b) continue;
      if (a.status !== b.status || a.landed !== b.landed || a.render !== b.render) diffs.push({ route: u, class: c, was: b, now: a });
    }
    gate("no cell changed vs pin", diffs.length === 0, JSON.stringify(diffs).slice(0, 1500));
  }
  R.pass = fail.length === 0; R.failed = fail;
  /* console table */
  const w = 26;
  console.log("\n" + "route".padEnd(w) + CLASSES.map((c) => c.padEnd(30)).join(""));
  for (const [u, row] of Object.entries(R.routes)) console.log(u.padEnd(w) + CLASSES.map((c) => `${row[c].status} ${row[c].render || ""}`.slice(0, 29).padEnd(30)).join(""));
  console.log("\nadmin:", JSON.stringify(R.admin));
  console.log("\nGATES:\n" + Object.entries(R.gates).map(([k, v]) => `${v.pass ? "PASS" : "FAIL"}  ${k}${v.pass ? "" : "  — " + String(v.detail).slice(0, 400)}`).join("\n"));
  process.exit(R.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
