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
  const q = (w) => sql(`select r.id from public.relationships r join auth.users t on t.id=r.tutor_id join auth.users s on s.id=r.student_id where t.email='tutor-a@test.tutorsacademy.invalid' and ${w} order by r.id limit 1`) || "00000000-0000-4000-8000-000000000000";
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
        } else if (url.includes("[subject]")) { /* 6.5 · P6-R19: every subject — the one ready one and EVERY draft one (tutor × draft-environment cell per subject) */ for (const sid of ["mathematics", "physics", "chemistry", "biology", "english", "history"]) out.push({ url: url.replace("[subject]", sid), kind, pattern: url }); }
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
  if (/data-environment-levers/.test(html)) return "environment-levers:" + (html.match(/data-shaped="([^"]+)"/) || [])[1];
  if (/data-relationship-surface/.test(html)) return "relationship-surface";
  if (/data-tutor-shell/.test(html)) return "tutor-shell:" + (html.match(/data-state="([^"]+)"/) || [])[1];
  if (/data-student-shell/.test(html)) return "student-shell:" + (html.match(/data-state="([^"]+)"/) || [])[1];
  /* the environment: what the composition HOLDS for this reader — student regions · threshold/door · the shaping link (6.5) */
  if (/data-shell-root/.test(html)) return "environment" + (/data-student-region/.test(html) ? ":student-regions" : "") + (/data-threshold|data-visitor-door/.test(html) ? ":door" : "") + (/data-shape-link/.test(html) ? ":shape-link" : "");
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

  /* ── 6.4 THE WRITE, per class (P6-R6: the write is a matrix row too) ──
     A real form POST from the browser context (cookies attached) to the
     shaping handler, for a subject tutor T is placed in (physics) and one
     nobody is (mathematics). Recorded: the status and whether a row EXISTS
     afterwards — the DB is the truth, not the response. Each probe starts
     and ends with no row (owner cleanup through DATABASE_URL). */
  /* P6-R21: every write probe carries the FRESHNESS TOKEN the state actually
     has at probe time — `version=` (empty) is correct here because each probe
     clears its row first: absence is the true loaded state. The probes test
     AUTHORIZATION, so they must not trip the staleness refusal on the way. */
  const WRITES = [
    { url: "/tutor/physics/environment/shape", body: "intent=save&density=dense&motionChar=energetic&version=", subject: "physics" },
    { url: "/tutor/mathematics/environment/shape", body: "intent=save&density=dense&motionChar=energetic&version=", subject: "mathematics" },
    { url: "/tutor/physics/environment/shape", body: "intent=save&density=very-dense&motionChar=energetic&version=", subject: "physics", tag: " · unauthored value" },
  ];
  R.writes = {};
  const rowOf = (subject) => sql(`select coalesce((select density||'/'||motion_char from public.environment_settings where subject_id='${subject}'), 'none')`);
  const clearRow = (subject) => sql(`delete from public.environment_settings where subject_id='${subject}'`);

  for (const cls of CLASSES) {
    const { ctx, p } = await withClass(browser, cls);
    /* writes first, from a same-origin page so cookies ride along */
    await p.goto(P + "/subjects", { waitUntil: "load" }).catch(() => {});
    for (const wr of WRITES) {
      clearRow(wr.subject);
      const before = rowOf(wr.subject);
      const res = await p.evaluate(async (u, b) => {
        try { const r = await fetch(u, { method: "POST", body: b, headers: { "content-type": "application/x-www-form-urlencoded" }, redirect: "manual", credentials: "include" }); return { status: r.status, type: r.type }; }
        catch (e) { return { status: "ERR", type: String(e).slice(0, 60) }; }
      }, P + wr.url, wr.body).catch((e) => ({ status: "ERR", type: String(e).slice(0, 60) }));
      const after = rowOf(wr.subject);
      clearRow(wr.subject);
      const key = "POST " + wr.url + (wr.tag || "");
      /* fetch with redirect:manual reports an opaque 0 for a 303; the row is the truth */
      (R.writes[key] ||= { kind: "write", pattern: "POST /tutor/[subject]/environment/shape" })[cls] = { status: res.type === "opaqueredirect" ? "303" : res.status, rowBefore: before, rowAfter: after };
    }
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
  /* 6.2's row "tutor T denied student A's draft door" REWRITTEN by P6-R19 (6.5), not deleted: a tutor with an active
     relationship in a draft subject is admitted to its IDENTITY (the visitor's rendering) and denied every STUDENT REGION
     of it; a draft flag is readiness, not secrecy. Evidence in DECISIONS (DEC-018). */
  gate("P6-R19: tutor T is admitted to the draft environment's identity (physics: 200, shaping link) and denied every student region of it (no region, no door)", draft && draft.tutorT.status === 200 && draft.tutorT.render === "environment:shape-link", JSON.stringify(draft && draft.tutorT));
  const DRAFTS = ["physics", "chemistry", "biology", "english", "history"];
  gate("P6-R19: visitor, expired, tutor U (no placement) still 404 on every draft environment", DRAFTS.every((d) => ["visitor", "expired", "tutorU"].every((c) => R.routes["/subjects/" + d][c].status === 404)), JSON.stringify(DRAFTS.map((d) => [d, R.routes["/subjects/" + d].tutorU.status])));
  gate("P6-R19: tutor T 404s on every draft subject they are NOT placed in (chemistry, biology, english, history)", DRAFTS.filter((d) => d !== "physics").every((d) => R.routes["/subjects/" + d].tutorT.status === 404), JSON.stringify(DRAFTS.map((d) => [d, R.routes["/subjects/" + d].tutorT.status])));
  gate("P6-R19/P6-R17: no student ever sees the shaping link; no tutor ever sees a student region", Object.entries(R.routes).filter(([u]) => /^\/subjects\/[a-z]+$/.test(u)).every(([, row]) => !/shape-link/.test(row.studentA.render + row.studentB.render) && !/student-regions/.test(row.tutorT.render + row.tutorU.render)), "");
  gate("tutor U (unrelated) sees state A, tutor T sees state B", R.routes["/tutor"].tutorU.render === "tutor-shell:A-no-relationships" && R.routes["/tutor"].tutorT.render === "tutor-shell:B-relationships-no-events", JSON.stringify([R.routes["/tutor"].tutorU, R.routes["/tutor"].tutorT]));
  gate("students never reach /tutor; tutors never reach /student", ["studentA", "studentB"].every((c) => R.routes["/tutor"][c].landed.startsWith("/student")) && ["tutorT", "tutorU"].every((c) => R.routes["/student"][c].landed.startsWith("/tutor")), "");
  gate("visitor and expired land on /login for every portal route", ["/student", "/student/account", "/tutor", "/tutor/account", "/admin"].every((u) => ["visitor", "expired"].every((c) => /^\/login\?next=/.test(R.routes[u][c].landed))), "");
  const W = R.writes;
  const wrote = (k, c) => W[k] && W[k][c] && W[k][c].rowAfter !== "none";
  const kP = "POST /tutor/physics/environment/shape", kM = "POST /tutor/mathematics/environment/shape", kU = kP + " · unauthored value";
  gate("6.4 write: only the placed tutor (T, physics) writes a row", wrote(kP, "tutorT") && W[kP].tutorT.rowAfter === "dense/energetic", JSON.stringify(W[kP]));
  gate("6.4 write: visitor, expired, student A, student B, tutor U never write (physics)", ["visitor", "expired", "studentA", "studentB", "tutorU"].every((c) => !wrote(kP, c)), JSON.stringify(W[kP]));
  gate("6.4 write: nobody writes mathematics (no tutor placed there)", CLASSES.every((c) => !wrote(kM, c)), JSON.stringify(W[kM]));
  gate("6.4 write: an unauthored value is never stored, even by tutor T", CLASSES.every((c) => !wrote(kU, c)), JSON.stringify(W[kU]));
  gate("6.4 write: no row left behind", CLASSES.every(() => rowOf("physics") === "none" && rowOf("mathematics") === "none"), "");
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
    const wmissing = Object.keys(R.writes).filter((k) => !(B.writes || {})[k]);
    gate("coverage: every write probe has a pinned row", wmissing.length === 0, "missing: " + wmissing.join(", "));
    const wdiffs = [];
    for (const k of Object.keys(R.writes)) for (const c of CLASSES) { const a = R.writes[k][c], b = B.writes && B.writes[k] && B.writes[k][c]; if (b && (a.status !== b.status || a.rowAfter !== b.rowAfter)) wdiffs.push({ write: k, class: c, was: b, now: a }); }
    gate("no write cell changed vs pin", wdiffs.length === 0, JSON.stringify(wdiffs).slice(0, 1500));
  }
  R.pass = fail.length === 0; R.failed = fail;
  /* console table */
  const w = 26;
  console.log("\n" + "route".padEnd(w) + CLASSES.map((c) => c.padEnd(30)).join(""));
  for (const [u, row] of Object.entries(R.routes)) console.log(u.padEnd(w) + CLASSES.map((c) => `${row[c].status} ${row[c].render || ""}`.slice(0, 29).padEnd(30)).join(""));
  console.log("\n" + "write".padEnd(w + 30) + CLASSES.map((c) => c.padEnd(22)).join(""));
  for (const [u, row] of Object.entries(R.writes)) console.log(u.padEnd(w + 30) + CLASSES.map((c) => `${row[c].status} → ${row[c].rowAfter}`.padEnd(22)).join(""));
  console.log("\nadmin:", JSON.stringify(R.admin));
  console.log("\nGATES:\n" + Object.entries(R.gates).map(([k, v]) => `${v.pass ? "PASS" : "FAIL"}  ${k}${v.pass ? "" : "  — " + String(v.detail).slice(0, 400)}`).join("\n"));
  process.exit(R.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
