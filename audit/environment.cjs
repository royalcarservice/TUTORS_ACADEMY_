#!/usr/bin/env node
/* ENVIRONMENT HARNESS (Phase 5 · Step 5) — /subjects/[id] across identities.
 *
 * usage: PROD_URL=http://localhost:3100 NODE_PATH=$PWD/node_modules node audit/environment.cjs --write|--check
 *
 * States (the 5.5 matrix): signed-out · signed-in non-enrolled (ready + draft)
 * · enrolled (ready + draft) · enrolled with no environment_state row.
 * Accounts are the 5.1 TEST ACCOUNTS (never real students):
 *   A student-a  no enrolment
 *   B student-b  physics + mathematics, never entered
 *   C student-c  physics + mathematics, physics entered
 *
 * Gates:
 *   VISITOR UNCHANGED — the signed-out HTML of /subjects/mathematics (and the
 *     404 of /subjects/physics) is byte-comparable to the pinned baseline after
 *     normalising build hashes (/_next/static/<hash>/…). Any change to what a
 *     visitor receives is a diff and must be a declared exception.
 *   REGION VISIBILITY — no [data-student-region] in visitor HTML; no
 *     [data-threshold] in visitor HTML; a student's HTML never carries another
 *     student's rows (the surface proof; RLS proves the data layer).
 *   NO WRITE ON GET — row counts before/after every GET are equal (needs
 *     DATABASE_URL; skipped with a note otherwise).
 *   PRIMARY ACTION ABOVE THE FOLD (P5-R3 standard) — for every state that
 *     has a primary action, its bottom ≤ innerHeight at 320×568, 360×640,
 *     390×844, 1280×800, 200 % zoom (640×400), WCAG 1.4.12 text spacing @390.
 *     Document height is NOT asserted.
 *   ONE PRIMARY PER VIEW — at most one [data-variant="primary"] in <main>.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const puppeteer = require("puppeteer");

const P = process.env.PROD_URL || "http://localhost:3100";
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "environment-shots");
const BASE = path.join(__dirname, "environment-baseline.json");
const MODE = process.argv.includes("--write") ? "write" : "check";
const PASS = "Test-Pass-2026!";
const ACCOUNTS = { A: "student-a@test.tutorsacademy.invalid", B: "student-b@test.tutorsacademy.invalid", C: "student-c@test.tutorsacademy.invalid", E: "student-e@test.tutorsacademy.invalid" };
/* E = the WRITE account: reset to no enrolment before the journey, left enrolled in mathematics after. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWPORTS = [["320x568", 320, 568, true], ["360x640", 360, 640, true], ["390x844", 390, 844, true], ["1280x800", 1280, 800, false], ["zoom200", 640, 400, false]];
const TEXT_SPACING_CSS = `*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}p{margin-bottom:2em !important}`;

const normalise = (html) => html.replace(/\/_next\/static\/[A-Za-z0-9_-]+\//g, "/_next/static/HASH/").replace(/"buildId":"[^"]+"/g, '"buildId":"X"').replace(/\/_next\/static\/chunks\/[^"']+/g, "/_next/static/chunks/X");
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
/* The byte-comparison is on the SERVER-RENDERED DOM (raw HTML with <script> blocks
   removed, build hashes normalised). The React flight payload inside <script> is
   recorded separately as `rscHash` for information only: it changes with chunk ids
   and streaming order on every build and is not what a visitor sees. */
const domOnly = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "");

function sql(q) {
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m);
    if (!env) return null;
    return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim();
  } catch { return null; }
}
const dbCounts = () => sql("select (select count(*) from public.enrolments)||'/'||(select count(*) from public.environment_state)||'/'||coalesce((select max(last_entered_at)::text from public.environment_state),'')");
const rowsE = () => sql(`select 'enrolments='||(select count(*) from public.enrolments e join auth.users u on u.id=e.student_id where u.email='${ACCOUNTS.E}')||' env_state='||(select count(*) from public.environment_state e join auth.users u on u.id=e.student_id where u.email='${ACCOUNTS.E}')||' entry_count='||coalesce((select max(entry_count)::text from public.environment_state e join auth.users u on u.id=e.student_id where u.email='${ACCOUNTS.E}'),'-')`);

async function login(browser, k) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (k) {
    await p.goto(P + "/login?next=%2Fstudent", { waitUntil: "load" });
    await p.type("input[name=email]", ACCOUNTS[k]); await p.type("input[name=password]", PASS);
    await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
    if (!p.url().endsWith("/student")) throw new Error(`sign-in failed for ${k}: ${p.url()}`);
  }
  return { ctx, p };
}

const inspect = () => {
  const main = document.querySelector("main");
  const q = (s) => Array.from(document.querySelectorAll(s));
  const a = document.querySelector("[data-primary-action]");
  return {
    title: document.title,
    h1: q("h1").map((h) => h.textContent.trim()),
    h1Count: q("h1").length,
    primaryCount: q('main [data-variant="primary"]').length,
    primaryAction: a ? { tag: a.tagName, text: a.textContent.trim(), form: a.closest("form") ? { method: a.closest("form").getAttribute("method"), action: a.closest("form").getAttribute("action") } : null, href: a.getAttribute("href"), accessibleName: a.getAttribute("aria-label") || a.textContent.trim() } : null,
    threshold: !!document.querySelector("[data-threshold]"),
    studentRegions: q("[data-student-region]").map((e) => e.getAttribute("data-student-region")),
    /* 5.6 — the arc region: strings, steps, interactivity, digits. */
    arc: (() => { const a = document.querySelector("[data-arc]"); if (!a) return null; return {
      steps: q("[data-arc] [data-arc-step]").map((li) => [li.getAttribute("data-arc-step"), li.querySelector("[data-arc-label]").textContent.trim(), li.querySelector("[data-arc-state]").textContent.trim()]),
      strings: q("[data-arc] li, [data-arc] p").map((e) => e.innerText.replace(/\s+/g, " ").trim()),
      interactive: a.querySelectorAll("a,button,input,select,textarea,form,[tabindex],[role=button],[onclick]").length,
      digits: (a.innerText.match(/\d/g) || []).length,
      regionHeading: a.closest("[data-student-region]")?.querySelector("h3")?.textContent.trim() || null,
      hasAnimation: q("[data-arc] *").some((e) => { const cs = getComputedStyle(e); return (cs.animationName && cs.animationName !== "none") || (cs.transitionDuration && cs.transitionDuration !== "0s"); }),
      widthOK: a.getBoundingClientRect().right <= innerWidth,
    }; })(),
    backToSpace: q('main a[href="/student"], nav a[href="/student"]').map((e) => e.textContent.trim()),
    draftBanner: !!document.querySelector("[data-shell-draft]"),
    draftLabel: (main?.innerText || "").includes("Environment in draft") || (main?.innerText || "").includes("Draft subject"),
    honestLabels: q("[data-shell-region] p").filter((e) => /not built/i.test(e.textContent)).length,
    text: (main?.innerText || "").replace(/\s+/g, " ").slice(0, 600),
    subjectRoot: document.querySelector("[data-shell-root]")?.getAttribute("data-subject") || null,
  };
};
const foldMeasure = () => { const a = document.querySelector("[data-primary-action]"); if (!a) return null; const r = a.getBoundingClientRect(); return { viewport: `${innerWidth}x${innerHeight}`, primaryActionBottom: Math.round(r.bottom), visible: r.bottom <= innerHeight && r.top >= 0 }; };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), reference: "390x844 mobile", states: {}, gates: {}, notes: {} };
  const fail = [];
  const gate = (name, ok, detail) => { R.gates[name] = { pass: !!ok, detail }; if (!ok) fail.push(name + ": " + detail); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  ← " + String(detail).slice(0, 600)}`); }; // 5.8: a FAIL prints its evidence

  const MATRIX = [
    ["visitor-ready", null, "/subjects/mathematics"],
    ["visitor-draft", null, "/subjects/physics"],
    ["nonenrolled-ready", "A", "/subjects/mathematics"],
    ["nonenrolled-draft", "A", "/subjects/physics"],
    ["enrolled-draft-entered", "C", "/subjects/physics"],
    ["enrolled-ready-no-state", "C", "/subjects/mathematics"],
    ["enrolled-draft-no-state", "B", "/subjects/physics"],
  ];

  const before = dbCounts();
  R.notes.dbCountsBeforeGets = before;
  for (const [id, acct, route] of MATRIX) {
    const { ctx, p } = await login(browser, acct);
    const res = await p.goto(P + route, { waitUntil: "load" }); await sleep(300);
    const S = { account: acct, route, status: res.status(), ...(await p.evaluate(inspect)) };
    const html = await p.content();
    const raw = acct === null ? await (await fetch(P + route)).text() : html; // visitor: raw server HTML, no cookies
    S.htmlHash = sha(domOnly(normalise(raw)));
    S.rscHash = sha(normalise(raw));
    S.htmlBytes = raw.length;
    S.htmlHasStudentRegion = /data-student-region/.test(html);
    S.htmlHasThreshold = /data-threshold/.test(html);
    S.htmlHasBeginForm = /method="post"[^>]*action="\/subjects\//i.test(html) || /action="\/subjects\/[a-z]+\/enter"/i.test(html);
    if (acct === null || id === "nonenrolled-ready" || id === "enrolled-ready-no-state") fs.writeFileSync(path.join(OUT, `${id}.html`), domOnly(normalise(raw)));
    await p.screenshot({ path: path.join(OUT, `${id}-390.png`) });
    /* fold at six conditions when there is a primary action */
    if (S.primaryAction) {
      S.primaryAboveFold = {};
      for (const [label, w, h, mobile] of VIEWPORTS) {
        await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 }); await p.goto(P + route, { waitUntil: "load" }); await sleep(200);
        S.primaryAboveFold[label] = await p.evaluate(foldMeasure);
        if (label === "320x568" || label === "1280x800") await p.screenshot({ path: path.join(OUT, `${id}-${label}.png`) });
      }
      await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await p.goto(P + route, { waitUntil: "load" });
      await p.addStyleTag({ content: TEXT_SPACING_CSS }); await sleep(100);
      S.primaryAboveFold.textSpacing390 = await p.evaluate(foldMeasure);
      /* no-JS: the control must exist and be a form in plain HTML */
      await p.setJavaScriptEnabled(false); await p.goto(P + route, { waitUntil: "load" }); await sleep(200);
      S.noJs = await p.evaluate(inspect); await p.screenshot({ path: path.join(OUT, `${id}-nojs-390.png`) });
      await p.setJavaScriptEnabled(true);
    }
    R.states[id] = S;
    await ctx.close();
  }
  const after = dbCounts();
  R.notes.dbCountsAfterGets = after;
  gate("no write on GET (rows before == after across every state)", before === null ? true : before === after, before === null ? "SKIPPED — no DATABASE_URL in .env.local" : `${before} → ${after}`);

  /* ── THE WRITE — State A → C on the write account (needs DATABASE_URL) ── */
  if (sql("select 1") === "1") {
    sql(`delete from public.enrolments where student_id in (select id from auth.users where email='${ACCOUNTS.E}')`);
    const W = { rowsStart: rowsE() };
    const { ctx, p } = await login(browser, "E");
    W.shellBefore = await p.evaluate(() => ({ state: document.querySelector("[data-student-shell]")?.getAttribute("data-state"), action: document.querySelector("[data-primary-action]")?.textContent.trim() }));
    await p.screenshot({ path: path.join(OUT, "write-1-shell-A.png") });
    await p.goto(P + "/subjects/mathematics", { waitUntil: "load" }); await sleep(200);
    W.rowsAfterGet = rowsE();
    W.prefetch = await p.evaluate(async () => ({ rscPrefetch: (await fetch("/subjects/mathematics", { headers: { RSC: "1", "Next-Router-Prefetch": "1" } })).status, getOnEnter: (await fetch("/subjects/mathematics/enter", { redirect: "manual" })).status }));
    W.rowsAfterPrefetch = rowsE();
    await p.screenshot({ path: path.join(OUT, "write-2-threshold.png") });
    const nav = []; p.on("response", (r) => { if (r.request().isNavigationRequest() && r.frame() === p.mainFrame()) nav.push(`${r.request().method()} ${new URL(r.url()).pathname} → ${r.status()}`); });
    await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("[data-threshold] [data-primary-action]")]); await sleep(200);
    W.post = nav.slice(); W.landed = new URL(p.url()).pathname; W.rowsAfterPost = rowsE();
    W.row = sql(`select e.subject_id||' | '||e.status||' | enrolled '||e.enrolled_at::text||' | last_entered '||s.last_entered_at::text||' | position '||coalesce(s.position::text,'NULL') from public.enrolments e join auth.users u on u.id=e.student_id join public.environment_state s on s.student_id=e.student_id and s.subject_id=e.subject_id where u.email='${ACCOUNTS.E}'`);
    W.thresholdAfter = await p.evaluate(() => !!document.querySelector("[data-threshold]"));
    await p.screenshot({ path: path.join(OUT, "write-3-entered.png") });
    W.doubleSubmit = await p.evaluate(async () => { const r = await fetch("/subjects/mathematics/enter", { method: "POST" }); return { status: r.status, redirected: r.redirected, finalPath: new URL(r.url).pathname }; });
    W.rowsAfterDouble = rowsE();
    W.draftPost = await p.evaluate(async () => (await fetch("/subjects/physics/enter", { method: "POST", redirect: "manual" })).status);
    W.rowsAfterDraftPost = rowsE();
    await p.goto(P + "/student", { waitUntil: "load" }); await sleep(200);
    W.shellAfter = await p.evaluate(() => ({ state: document.querySelector("[data-student-shell]")?.getAttribute("data-state"), strings: Array.from(document.querySelectorAll("[data-primary-surface] p,[data-primary-surface] h1,[data-primary-action]")).map((e) => e.textContent.trim()), actionTag: document.querySelector("[data-primary-action]")?.tagName }));
    await p.screenshot({ path: path.join(OUT, "write-4-shell-C.png") });
    await ctx.close();
    W.signedOutPost = await (await fetch(P + "/subjects/mathematics/enter", { method: "POST", redirect: "manual" })).status;
    W.signedOutPostLocation = (await fetch(P + "/subjects/mathematics/enter", { method: "POST", redirect: "manual" })).headers.get("location");
    W.rowsEnd = rowsE();
    R.write = W;
    gate("write: GET and prefetch write nothing", W.rowsStart === W.rowsAfterGet && W.rowsAfterGet === W.rowsAfterPrefetch && W.prefetch.getOnEnter === 405, JSON.stringify({ start: W.rowsStart, afterGet: W.rowsAfterGet, afterPrefetch: W.rowsAfterPrefetch, prefetch: W.prefetch }));
    gate("write: POST → 303 → 200, one enrolment + one state row, position NULL", W.post.join(" ; ").includes("→ 303") && W.landed === "/subjects/mathematics" && /enrolments=1 env_state=1/.test(W.rowsAfterPost) && /position NULL/.test(W.row || ""), JSON.stringify({ post: W.post, landed: W.landed, rows: W.rowsAfterPost, row: W.row }));
    gate("write: idempotent — second submit, still one enrolment, no error", W.doubleSubmit.status === 200 && W.doubleSubmit.finalPath === "/subjects/mathematics" && /enrolments=1 env_state=1/.test(W.rowsAfterDouble), JSON.stringify({ doubleSubmit: W.doubleSubmit, rows: W.rowsAfterDouble }));
    gate("write: draft subject refused for non-enrolled (404), no row", W.draftPost === 404 && W.rowsAfterDraftPost === W.rowsAfterDouble, JSON.stringify({ draftPost: W.draftPost, rows: W.rowsAfterDraftPost }));
    gate("write: shell A → C after the journey", W.shellBefore.state === "A-no-enrolment" && W.shellAfter.state === "C-enrolled-active" && W.shellAfter.actionTag === "BUTTON", JSON.stringify({ before: W.shellBefore, after: W.shellAfter }));
    gate("write: signed-out POST refused (303 → /login), no row", W.signedOutPost === 303 && /\/login\?next=/.test(W.signedOutPostLocation || "") && W.rowsEnd === W.rowsAfterDouble, JSON.stringify({ status: W.signedOutPost, location: W.signedOutPostLocation, rows: W.rowsEnd }));
  } else {
    R.write = { skipped: "no DATABASE_URL" };
  }

  /* ── gates ─────────────────────────────────────────────────────────── */
  const s = R.states;
  gate("visitor: ready 200, draft 404", s["visitor-ready"].status === 200 && s["visitor-draft"].status === 404, `${s["visitor-ready"].status}/${s["visitor-draft"].status}`);
  gate("non-enrolled student: ready 200, draft 404", s["nonenrolled-ready"].status === 200 && s["nonenrolled-draft"].status === 404, `${s["nonenrolled-ready"].status}/${s["nonenrolled-draft"].status}`);
  gate("enrolled student: draft 200 + draft label", s["enrolled-draft-entered"].status === 200 && s["enrolled-draft-entered"].draftLabel && s["enrolled-draft-no-state"].status === 200, JSON.stringify([s["enrolled-draft-entered"].status, s["enrolled-draft-entered"].draftLabel]));
  gate("region visibility: no student region / threshold in visitor HTML", !s["visitor-ready"].htmlHasStudentRegion && !s["visitor-ready"].htmlHasThreshold && !s["visitor-ready"].htmlHasBeginForm, JSON.stringify({ region: s["visitor-ready"].htmlHasStudentRegion, threshold: s["visitor-ready"].htmlHasThreshold }));
  /* ── 5.6 ARC GATES ── */
  const ARC = ["discover|See the system", "choose|See the doors", "enter|Watch the crossing", "learn|Learn in the room", "interact|Work with a tutor", "progress|Watch your record grow", "master|Master the subject"];
  const enrolled200 = Object.entries(s).filter(([k, v]) => k.startsWith("enrolled") && v.status === 200);
  gate("arc: present for every enrolled 200 state; absent for visitor and non-enrolled", enrolled200.every(([, v]) => v.arc) && !s["visitor-ready"].arc && !s["nonenrolled-ready"].arc && !/data-arc/.test(fs.readFileSync(path.join(OUT, "visitor-ready.html"), "utf8")), JSON.stringify(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, !!v.arc]))));
  gate("arc: same seven steps as 4.7, same order, state in words only", enrolled200.every(([, v]) => JSON.stringify(v.arc.steps.map((x) => x[0] + "|" + x[1])) === JSON.stringify(ARC) && v.arc.steps.every((x) => x[2] === "done" || x[2] === "ahead")), JSON.stringify(enrolled200.map(([k, v]) => [k, v.arc.steps.map((x) => x[2]).join(",")])));
  gate("arc: no CTA, no link, no interactive element, no animation", enrolled200.every(([, v]) => v.arc.interactive === 0 && !v.arc.hasAnimation), JSON.stringify(enrolled200.map(([k, v]) => [k, v.arc.interactive, v.arc.hasAnimation])));
  gate("arc: never a digit — no count, no zero, no 'n of 7'", enrolled200.every(([, v]) => v.arc.digits === 0 && !v.arc.strings.some((t) => /\bof 7\b|%|complete|remaining|left|streak|level|badge|behind|on track|haven't/i.test(t))), JSON.stringify(enrolled200.map(([k, v]) => [k, v.arc.digits])));
  gate("arc: never-entered enrolment shows 'enter' as ahead (missing = state, not defaulted)", (s["enrolled-ready-no-state"].arc?.steps.find((x) => x[0] === "enter") || [])[2] === "ahead" && (s["enrolled-draft-entered"].arc?.steps.find((x) => x[0] === "enter") || [])[2] === "done", JSON.stringify({ noState: s["enrolled-ready-no-state"].arc?.steps.map((x) => x[2]), entered: s["enrolled-draft-entered"].arc?.steps.map((x) => x[2]) }));
  /* 5.8 gate (breakage (h) was NOT caught before this): the rendered arc must match the evidence rule, not just
     the vocabulary. Today no evidence module is live (modules.ts: no learning kind is admissible — test-progress #21),
     so no step after "enter" can read "done" in ANY enrolled state; "discover" and "choose" are done by enrolment;
     "enter" is done only where an environment_state row exists. A consumer that invents a done step fails here. */
  gate("arc: states follow the evidence — discover/choose done; enter done only with an entry row; learn/interact/progress/master never done today (no live evidence module)", enrolled200.every(([k, v]) => { const st = Object.fromEntries(v.arc.steps.map((x) => [x[0], x[2]])); const entered = /entered/.test(k); return st.discover === "done" && st.choose === "done" && st.enter === (entered ? "done" : "ahead") && ["learn", "interact", "progress", "master"].every((id) => st[id] === "ahead"); }), JSON.stringify(enrolled200.map(([k, v]) => [k, v.arc.steps.map((x) => x[0] + ":" + x[2]).join(" ")])));
  gate("arc: the boundary sentence is present with an empty record and fits 390", enrolled200.every(([, v]) => v.arc.strings.some((t) => t.startsWith("Nothing is recorded here yet.")) && v.arc.widthOK), JSON.stringify(enrolled200.map(([k, v]) => [k, v.arc.widthOK])));
  gate("one h1 in every 200 state", Object.values(s).filter((x) => x.status === 200).every((x) => x.h1Count === 1), JSON.stringify(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.h1Count]))));
  gate("one primary per view (≤1 in main)", Object.values(s).every((x) => x.primaryCount <= 1), JSON.stringify(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.primaryCount]))));
  const withAction = Object.entries(s).filter(([, v]) => v.primaryAction);
  gate("PRIMARY ACTION ABOVE THE FOLD — 320x568, 360x640, 390x844, 1280x800, 200% zoom, 1.4.12 text spacing; document height not asserted", withAction.every(([, v]) => Object.values(v.primaryAboveFold).every((f) => f && f.visible)), JSON.stringify(Object.fromEntries(withAction.map(([k, v]) => [k, Object.fromEntries(Object.entries(v.primaryAboveFold).map(([c, f]) => [c, f ? f.primaryActionBottom : null]))]))));
  /* 5.7: the honest 404 page now carries ONE action, so 404 states join `withAction`. Their no-JS HTML is
     EMPTY — Next 16.3.6 answers notFound() with the `__next_error__` document and renders not-found.tsx
     client-side (vercel/next.js#99287; reproduced at /subjects/nonsense). That is a framework defect,
     reported in PHASE5_STEP7 and tracked as its own gate below, so the 200-state gate keeps its meaning. */
  const withAction200 = withAction.filter(([, v]) => v.status === 200);
  const withAction404 = withAction.filter(([, v]) => v.status === 404);
  gate("no-JS: primary action present and is a form or a link in plain HTML", withAction200.every(([, v]) => v.noJs && v.noJs.primaryAction && (v.noJs.primaryAction.form || v.noJs.primaryAction.href)), JSON.stringify(Object.fromEntries(withAction200.map(([k, v]) => [k, v.noJs?.primaryAction]))));
  gate("no-JS: 404 pages — KNOWN FRAMEWORK DEFECT (next#99287): not-found is client-rendered; recorded, not accepted", withAction404.every(([, v]) => v.noJs && v.noJs.primaryAction === null), "no-JS body empty for: " + JSON.stringify(withAction404.map(([k]) => k)) + " — flips to FAIL the day the framework SSRs it, so the note gets removed");

  /* ── compare ───────────────────────────────────────────────────────── */
  if (MODE === "check" && fs.existsSync(BASE)) {
    const B = JSON.parse(fs.readFileSync(BASE, "utf8"));
    const diffs = [];
    for (const k of ["visitor-ready", "visitor-draft"]) {
      if (B.states[k]?.htmlHash !== s[k].htmlHash) diffs.push({ state: k, what: "visitor DOM hash", was: B.states[k]?.htmlHash, now: s[k].htmlHash });
      if (B.states[k]?.rscHash !== s[k].rscHash) console.log(`note: ${k} RSC payload hash changed (${B.states[k]?.rscHash} → ${s[k].rscHash}) — informational, not a gate`);
    }
    for (const k of Object.keys(B.states)) {
      const b = B.states[k], n = s[k]; if (!n) { diffs.push({ state: k, what: "missing" }); continue; }
      if (b.status !== n.status) diffs.push({ state: k, what: "status", was: b.status, now: n.status });
      if (JSON.stringify(b.studentRegions) !== JSON.stringify(n.studentRegions)) diffs.push({ state: k, what: "student regions", was: b.studentRegions, now: n.studentRegions });
      if (JSON.stringify(b.primaryAction) !== JSON.stringify(n.primaryAction)) diffs.push({ state: k, what: "primary action", was: b.primaryAction, now: n.primaryAction });
      if (b.text !== n.text) diffs.push({ state: k, what: "main text", was: b.text, now: n.text });
    }
    const declared = B.declaredExceptions || [];
    const undeclared = diffs.filter((d) => !declared.some((e) => e.state === d.state && e.what === d.what));
    console.log(diffs.length ? `DIFFS vs environment baseline: ${JSON.stringify(diffs, null, 1)}` : "no diffs vs environment baseline");
    if (undeclared.length) { console.log(`UNDECLARED DIFFS: ${undeclared.length}`); process.exitCode = 1; }
    else if (diffs.length) console.log(`all ${diffs.length} diffs are declared exceptions`);
  }
  if (MODE === "write") {
    const prev = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, "utf8")) : {};
    R.declaredExceptions = prev.declaredExceptions || [];
    fs.writeFileSync(BASE, JSON.stringify(R, null, 1));
    console.log(`environment baseline written → ${BASE}`);
  }
  if (fail.length) { console.log(`\n${fail.length} gate(s) failed`); process.exitCode = 1; }
  await browser.close();
})();
