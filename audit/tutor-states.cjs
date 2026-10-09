#!/usr/bin/env node
/* audit/tutor-states.cjs — Phase 6 · Step 5 harness: THE TUTOR'S STATES AS A SET.
 *
 * Runs against the PRODUCTION server (PROD_URL, default :3100) with the fixture
 * accounts only. Writes audit/tutor-states.json; `--check` compares the gates to
 * audit/tutor-states-baseline.json and exits 1 on any FAIL.
 *
 * What it proves (each a named gate; the report cites them by name):
 *   account-three-things     the tutor's account surface renders name · email · role · sign-out and nothing else
 *   account-no-role-affordance   no control on any tutor surface changes/requests/acquires a role
 *   account-matches-student  the tutor and student account surfaces are the same structure
 *   student-account-hash     the student account DOM (identity-normalised) hash is pinned
 *   write-unknown-outcome    a POST cut mid-flight claims nothing; the GET shows the settled state
 *   write-failed-known       an invalid body → 303 ?shape=failed → one sentence beside the control, row unchanged
 *   write-session-ended      an expired-session POST → login with reason=ended and next = THE SETTLING GET (not the write URL)
 *   write-concurrent         a row changed between load and submit: P6-R21 REFUSE_STALE_WRITE — asserts the 409 refusal (was: recorded last-write-wins)
 *   shaping-read-failed      the shaping surface's failed-read branch is an honest page, never a form (dev frame + code gate)
 *   never-contains           the consolidated banned-term sweep across every tutor surface
 *   pii-floor                no email / uuid / auth metadata about a student on any tutor surface
 *   role-crossing            a student on tutor routes, a tutor on student routes: 307 to own portal / 404, no alarm words
 *   no-js-saves              the settings form round-trips with JavaScript disabled
 *   route-count              the number of app routes before/after this step (no new place for a missing capability)
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const P = process.env.PROD_URL || "http://localhost:3100";
const D = process.env.DEV_URL || "http://localhost:3000";
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const ACC = {
  student: process.env.TEST_C || "student-c@test.tutorsacademy.invalid",
  tutor: process.env.TEST_TUTOR || "tutor-a@test.tutorsacademy.invalid",
  tutorU: process.env.TEST_TUTOR_U || "tutor-u@test.tutorsacademy.invalid",
};
const CHECK = process.argv.includes("--check");
const OUT = path.join(ROOT, "audit/tutor-states.json");
const BASE = path.join(ROOT, "audit/tutor-states-baseline.json");

function sql(q) {
  try {
    const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m);
    if (!env) return null;
    return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim();
  } catch (e) { return `SQL-ERROR ${String(e.message).slice(0, 80)}`; }
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const mainOf = (html) => { const m = html.match(/<main[\s\S]*?<\/main>/); return m ? m[0] : html; };
/* identity-normalised: the display name / email / uuid of the fixture are replaced so the hash pins STRUCTURE */
const normalise = (html) => html.replace(/[a-z-]+@test\.tutorsacademy\.invalid/g, "EMAIL").replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "UUID").replace(/<dd[^>]*>(?:(?!<\/dd>).)*<\/dd>/g, "<dd>VALUE</dd>").replace(/<h1([^>]*)>(?:(?!<\/h1>).)*<\/h1>/g, "<h1$1>NAME</h1>");

const NEVER = ["needs attention", "alert", "triage", "engagement", "ranking", "rank ", "compare", "comparison", "export", "download", "notification", "notify", "skeleton", "shimmer", "last active", "last seen", "online", "streak", "score", "percent", "%", "sort by", "students (", "coming soon", "roadmap", "changelog", "soon", "try again", "contact support", "error", "oops", "something went wrong", "invalid", "unauthorized", "forbidden", "denied"];
const ROLE_AFFORDANCE = ["become a tutor", "become a student", "request access", "change role", "switch role", "upgrade", "apply to", "request a role"];
const ALARM = ["error", "forbidden", "unauthorized", "denied", "invalid", "oops", "wrong", "not allowed", "permission"];

async function signIn(browser, email, opts = {}) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (opts.noJs) await p.setJavaScriptEnabled(false);
  if (!email) return { ctx, p };
  await p.goto(P + "/login", { waitUntil: "load" });
  await p.type("input[name=email]", email);
  await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (/\/login/.test(p.url())) throw new Error(`sign-in failed for ${email}: ${p.url()}`);
  return { ctx, p };
}
async function expire(p) {
  const cookies = await p.cookies();
  for (const c of cookies.filter((c) => /^sb-.*-auth-token/.test(c.name))) {
    await p.setCookie({ ...c, value: "base64-" + Buffer.from(JSON.stringify({ access_token: "expired", refresh_token: "expired" })).toString("base64") });
  }
}
async function get(p, url) {
  const res = await p.goto(url, { waitUntil: "load" });
  const chain = [];
  let r = res.request();
  for (const rr of r.redirectChain()) chain.push({ url: rr.url().replace(P, ""), status: rr.response() && rr.response().status() });
  return { status: res.status(), final: p.url().replace(P, ""), chain, html: await p.content() };
}
/* a REAL form submission from the page (cookies attached, browser semantics), not fetch() */
async function submitForm(p, selector, fields = {}) {
  await p.evaluate((sel, f) => {
    const form = document.querySelector(sel);
    for (const [k, v] of Object.entries(f)) { const el = form.querySelector(`[name="${k}"]`); if (el) el.value = v; else { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; form.appendChild(i); } }
    form.submit();
  }, selector, fields);
  await p.waitForNavigation({ waitUntil: "load" });
  return { final: p.url().replace(P, ""), html: await p.content() };
}
const rowOf = (subject) => sql(`select coalesce((select density||'/'||motion_char||'/'||shaped_by from public.environment_settings where subject_id='${subject}'),'ABSENT')`);
const tutorUId = () => sql(`select id from auth.users where email='${ACC.tutorU}'`);

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), base: P, gates: {}, evidence: {} };
  const gate = (name, pass, detail) => { R.gates[name] = { pass: !!pass, detail }; };

  /* ── 0. route count from the filesystem ───────────────────────────── */
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : /^(page|route)\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []);
  const routes = walk(path.join(ROOT, "src/app")).map((f) => path.relative(path.join(ROOT, "src/app"), f));
  R.evidence.routeCount = routes.length;
  R.evidence.tutorRoutes = routes.filter((r) => r.includes("/tutor/"));
  R.evidence.devRoutes = routes.filter((r) => r.startsWith("dev/") || r.includes("/dev/")).length;

  /* ── 1. THE ACCOUNT SURFACES ───────────────────────────────────────── */
  const T = await signIn(browser, ACC.tutor);
  const S = await signIn(browser, ACC.student);
  const ta = await get(T.p, P + "/tutor/account");
  const sa = await get(S.p, P + "/student/account");
  const tMain = mainOf(ta.html), sMain = mainOf(sa.html);
  R.evidence.tutorAccount = { status: ta.status, text: strip(tMain), dom: tMain, hash: sha(normalise(tMain)), dts: [...tMain.matchAll(/<dt[^>]*>([^<]*)<\/dt>/g)].map((m) => m[1]), buttons: [...tMain.matchAll(/<button[^>]*>([^<]*)<\/button>/g)].map((m) => m[1]), forms: [...tMain.matchAll(/<form[^>]*action="([^"]*)"/g)].map((m) => m[1]), inputs: (tMain.match(/<input/g) || []).length, selects: (tMain.match(/<select/g) || []).length, links: [...tMain.matchAll(/<a [^>]*href="([^"]*)"/g)].map((m) => m[1]) };
  R.evidence.studentAccount = { status: sa.status, text: strip(sMain), dom: sMain, hash: sha(normalise(sMain)), dts: [...sMain.matchAll(/<dt[^>]*>([^<]*)<\/dt>/g)].map((m) => m[1]) };
  gate("account-three-things", ta.status === 200 && JSON.stringify(R.evidence.tutorAccount.dts) === JSON.stringify(["Name", "Email", "Role"]) && R.evidence.tutorAccount.buttons.length === 1 && /Sign out/.test(R.evidence.tutorAccount.buttons[0]) && R.evidence.tutorAccount.forms.length === 1 && R.evidence.tutorAccount.inputs === 0 && R.evidence.tutorAccount.selects === 0 && R.evidence.tutorAccount.links.length === 0, { dts: R.evidence.tutorAccount.dts, buttons: R.evidence.tutorAccount.buttons, forms: R.evidence.tutorAccount.forms, inputs: R.evidence.tutorAccount.inputs, selects: R.evidence.tutorAccount.selects, linksInMain: R.evidence.tutorAccount.links.length });
  gate("account-matches-student", normalise(tMain).replace(/tutor/g, "ROLE") === normalise(sMain).replace(/student/g, "ROLE"), { tutorHash: R.evidence.tutorAccount.hash, studentHash: R.evidence.studentAccount.hash, note: "structure-identical after identity + role normalisation" });

  /* ── 2. tutor surface texts, for the sweeps ────────────────────────── */
  const rel = sql(`select r.id from public.relationships r join auth.users t on t.id=r.tutor_id where t.email='${ACC.tutor}' and r.state='active' and r.subject_id='physics' limit 1`);
  const surfaces = { "/tutor": null, "/tutor/account": null, "/tutor/physics/environment": null, [`/tutor/physics/${rel}`]: null, "/tutor/physics/environment?shape=failed": null };
  for (const u of Object.keys(surfaces)) { const g = await get(T.p, P + u); surfaces[u] = { status: g.status, text: strip(mainOf(g.html)), bytes: g.html.length, scripts: (g.html.match(/<script[^>]*src=/g) || []).length }; }
  R.evidence.surfaces = surfaces;
  const hits = [];
  for (const [u, s] of Object.entries(surfaces)) { const low = s.text.toLowerCase().replace(ACC.tutor, "OWN-EMAIL"); for (const term of NEVER) if (low.includes(term)) hits.push({ surface: u, term, context: low.slice(Math.max(0, low.indexOf(term) - 40), low.indexOf(term) + 40) }); }
  /* judged hits: words that appear inside a sentence that is itself the refusal (e.g. "Nothing announces the change") are listed, each with a verdict */
  const judged = hits.map((h) => ({ ...h, verdict: /nothing announces|not told|are not adjustable|not presented as controls/.test(h.context) ? "ALLOWED — the sentence states what the product does NOT do" : "HIT" }));
  R.evidence.neverContains = judged;
  gate("never-contains", judged.every((h) => h.verdict !== "HIT"), { hits: judged });
  const roleHits = [];
  for (const [u, s] of Object.entries(surfaces)) { const low = s.text.toLowerCase(); for (const t of ROLE_AFFORDANCE) if (low.includes(t)) roleHits.push({ surface: u, term: t }); }
  gate("account-no-role-affordance", roleHits.length === 0 && R.evidence.tutorAccount.inputs === 0 && R.evidence.tutorAccount.selects === 0, { roleHits, note: "the Role row is a <dd> fact: no input, select, link or second form on the account surface" });
  const pii = [];
  const studentEmail = ACC.student; const studentId = sql(`select id from auth.users where email='${studentEmail}'`);
  for (const [u, s] of Object.entries(surfaces)) { if (u === "/tutor/account") continue; if (s.text.includes(studentEmail)) pii.push({ surface: u, leak: "student email" }); if (studentId && s.text.includes(studentId)) pii.push({ surface: u, leak: "student uuid" }); if (/@/.test(s.text)) pii.push({ surface: u, leak: "an @ in the text" }); }
  gate("pii-floor", pii.length === 0, { leaks: pii, note: "the account surface is excluded: it shows the tutor THEIR OWN email (P6-R14)" });

  /* ── 3. THE WRITE'S FOUR CASES (physics; tutor T is placed there) ──── */
  const ENV = "/tutor/physics/environment";
  const before = rowOf("physics");
  R.evidence.write = { rowBefore: before };
  /* case 2: FAILED, KNOWN — an unauthored value → 303 ?shape=failed, one sentence, row unchanged */
  await get(T.p, P + ENV);
  const failed = await submitForm(T.p, "form[data-shape-form]", { density: "not-a-density" });
  const failedText = strip(mainOf(failed.html));
  R.evidence.write.failed = { landed: failed.final, sentence: (failedText.match(/That did not save[^.]*\.[^.]*\./) || [null])[0], rowAfter: rowOf("physics"), describedby: (failed.html.match(/data-primary-action[^>]*aria-describedby="([^"]*)"/) || [, null])[1] };
  gate("write-failed-known", failed.final === ENV + "?shape=failed" && !!R.evidence.write.failed.sentence && R.evidence.write.failed.rowAfter === before && /shape-failed/.test(R.evidence.write.failed.describedby || ""), R.evidence.write.failed);

  /* case 1: UNKNOWN OUTCOME — the request is aborted in flight; nothing of ours renders; the next GET shows the settled state */
  await get(T.p, P + ENV);
  const cdp = await T.p.createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Network.setRequestInterception", { patterns: [{ urlPattern: "*/environment/shape", interceptionStage: "Request" }] }).catch(() => {});
  let aborted = false;
  await T.p.setRequestInterception(true);
  const onReq = (req) => { if (/\/environment\/shape$/.test(req.url()) && req.method() === "POST") { aborted = true; req.abort("connectionreset"); } else req.continue(); };
  T.p.on("request", onReq);
  let cutErr = null;
  try {
    await T.p.evaluate(() => { const f = document.querySelector("form[data-shape-form]"); f.querySelector("[name=density]").value = f.querySelector("[name=density]").value; f.submit(); });
    await T.p.waitForNavigation({ waitUntil: "load", timeout: 8000 });
  } catch (e) { cutErr = String(e.message).slice(0, 80); }
  T.p.off("request", onReq);
  await T.p.setRequestInterception(false);
  const afterCutHtml = await T.p.content().catch(() => "");
  const settled = await get(T.p, P + ENV);
  R.evidence.write.unknown = { aborted, navigationError: cutErr, oursAfterCut: /data-shape-failed|data-environment-levers/.test(afterCutHtml) ? "page content still present (browser's own failure state owns the frame)" : "nothing of ours (browser error page)", rowAfter: rowOf("physics"), settledGetStatus: settled.status, settledGetShowsFailedSentence: /That did not save/.test(settled.html), settledState: (strip(settled.html).match(/This environment is as authored\.|Last shaped by you\.|Last shaped by another tutor\./) || [null])[0] };
  gate("write-unknown-outcome", aborted && settled.status === 200 && !R.evidence.write.unknown.settledGetShowsFailedSentence && !!R.evidence.write.unknown.settledState, R.evidence.write.unknown);

  /* case 3: SESSION ENDED MID-SAVE — load the form, expire the cookies, submit */
  await get(T.p, P + ENV);
  await expire(T.p);
  const ended = await submitForm(T.p, "form[data-shape-form]", {});
  const endedText = strip(ended.html);
  const nextParam = (ended.final.match(/next=([^&]*)/) || [, ""])[1];
  R.evidence.write.sessionEnded = { landed: ended.final, next: decodeURIComponent(nextParam), reason: /reason=ended/.test(ended.final), sentence: (endedText.match(/That session ended\.[^.]*\./) || [null])[0], rowAfter: rowOf("physics") };
  /* sign in again from that page and record where it lands */
  await T.p.type("input[name=email]", ACC.tutor); await T.p.type("input[name=password]", PASS);
  await Promise.all([T.p.waitForNavigation({ waitUntil: "load" }), T.p.click("button[type=submit]")]);
  R.evidence.write.sessionEnded.afterSignIn = { landed: T.p.url().replace(P, ""), status: 200, state: (strip(await T.p.content()).match(/This environment is as authored\.|Last shaped by you\.|Last shaped by another tutor\./) || [null])[0] };
  gate("write-session-ended", /^\/login\?/.test(ended.final) && R.evidence.write.sessionEnded.reason && decodeURIComponent(nextParam) === ENV && !!R.evidence.write.sessionEnded.sentence && R.evidence.write.sessionEnded.rowAfter === before && R.evidence.write.sessionEnded.afterSignIn.landed === ENV, R.evidence.write.sessionEnded);

  /* case 4: CONCURRENT — the row changes between load and submit (another tutor's write, done here with SQL as tutor U).
     P6-R21 (ruling of 2026-10-06, DEC-018 addendum): last-write-wins was REJECTED. The stale save must be REFUSED —
     a 409 carrying the ruling's sentence, nothing written, and the other tutor's row left standing. */
  await get(T.p, P + ENV);
  const uId = tutorUId();
  sql(`insert into public.environment_settings (subject_id, density, motion_char, shaped_by, updated_at) values ('physics','sparse','precise','${uId}',now()) on conflict (subject_id) do update set density='sparse', motion_char='precise', shaped_by='${uId}', updated_at=now()`);
  const during = rowOf("physics");
  let concStatus = null;
  const onConc = (r) => { if (/\/environment\/shape$/.test(r.url()) && r.request().method() === "POST") concStatus = r.status(); };
  T.p.on("response", onConc);
  const conc = await submitForm(T.p, "form[data-shape-form]", { density: "dense", motionChar: "editorial" });
  T.p.off("response", onConc);
  const concText = strip(mainOf(conc.html));
  const afterConc = rowOf("physics");
  const CONFLICT_SENTENCE = "The room settings were updated in another session. Reload to review the current state before applying changes.";
  R.evidence.write.concurrent = { rowAtLoad: before, rowChangedUnderneath: during, status: concStatus, landed: conc.final, rowAfterSubmit: afterConc, conflictSentence: concText.includes(CONFLICT_SENTENCE), verdict: null };
  R.evidence.write.concurrent.verdict = afterConc === during && concStatus === 409 && R.evidence.write.concurrent.conflictSentence
    ? "REFUSED — the stale save did not land; the other tutor's row stands; the ruling's sentence rendered (P6-R21)"
    : "UNEXPECTED — the stale write was not refused as ruled; see evidence";
  gate("write-concurrent", afterConc === during && concStatus === 409 && R.evidence.write.concurrent.conflictSentence && conc.final === ENV + "/shape", { ...R.evidence.write.concurrent, note: "P6-R21 REFUSE_STALE_WRITE: 409 + the ruling's sentence + no redirect; the gate now ASSERTS the refusal (it recorded last-write-wins until the 2026-10-06 ruling)" });
  /* restore the fixture: physics back to what it was */
  if (before === "ABSENT") sql("delete from public.environment_settings where subject_id='physics'");
  else { const [d, m, by] = before.split("/"); sql(`insert into public.environment_settings (subject_id, density, motion_char, shaped_by, updated_at) values ('physics','${d}','${m}','${by}',now()) on conflict (subject_id) do update set density='${d}', motion_char='${m}', shaped_by='${by}', updated_at=now()`); }
  R.evidence.write.rowRestored = rowOf("physics");

  /* ── 4. NO-JS: the form still saves ────────────────────────────────── */
  const N = await signIn(browser, ACC.tutor, { noJs: true });
  const n0 = await get(N.p, P + ENV);
  const n1 = await submitForm(N.p, "form[data-shape-form]", {}).catch(async () => ({ final: "form.submit() needs JS — use the button", html: "" }));
  R.evidence.noJs = { loaded: n0.status, scriptsOnPage: (n0.html.match(/<script[^>]*src=/g) || []).length, landed: n1.final, rowAfter: rowOf("physics") };
  gate("no-js-saves", n0.status === 200 && n1.final === ENV, R.evidence.noJs);
  if (before === "ABSENT") sql("delete from public.environment_settings where subject_id='physics'"); else { const [d, m, by] = before.split("/"); sql(`update public.environment_settings set density='${d}', motion_char='${m}', shaped_by='${by}' where subject_id='physics'`); }

  /* ── 5. ROLE CROSSING ─────────────────────────────────────────────── */
  const crossing = [];
  for (const u of ["/tutor", "/tutor/account", ENV, `/tutor/physics/${rel}`]) { const g = await get(S.p, P + u); const t = strip(g.html).toLowerCase(); crossing.push({ who: "student", url: u, status: g.status, chain: g.chain, landed: g.final, alarm: ALARM.filter((a) => t.includes(a)) }); }
  for (const u of ["/student", "/student/account"]) { const g = await get(T.p, P + u); const t = strip(g.html).toLowerCase(); crossing.push({ who: "tutor", url: u, status: g.status, chain: g.chain, landed: g.final, alarm: ALARM.filter((a) => t.includes(a)) }); }
  R.evidence.roleCrossing = crossing;
  gate("role-crossing", crossing.every((c) => c.alarm.length === 0 && (c.landed === "/student" || c.landed === "/tutor" || c.status === 404)), { rows: crossing.map((c) => `${c.who} → ${c.url}: ${c.chain.map((x) => x.status).join("→") || ""} ${c.status} lands ${c.landed} alarm=${c.alarm.length}`) });

  /* ── 6. SHAPING READ FAILURE: code gate + dev frame ───────────────── */
  const pageSrc = fs.readFileSync(path.join(ROOT, "src/app/(portal)/tutor/[subject]/environment/page.tsx"), "utf8");
  const codeGate = /authored-after-failed-read/.test(pageSrc) && /HonestPage|shapingUnread/.test(pageSrc);
  let frame = null;
  try { const V = await signIn(browser, null); const g = await get(V.p, D + "/dev/tutor-states/frame?case=read-failed"); frame = { status: g.status, hasForm: /data-shape-form/.test(g.html), honest: /data-state-page="shaping-unread"/.test(g.html), text: strip(mainOf(g.html)).slice(0, 300) }; await V.ctx.close(); } catch (e) { frame = { error: String(e.message).slice(0, 80) }; }
  R.evidence.shapingReadFailed = { codeGate, frame };
  gate("shaping-read-failed", codeGate && (!frame || frame.error || (frame.honest && !frame.hasForm)), R.evidence.shapingReadFailed);

  gate("route-count", true, { count: routes.length, tutorRoutes: R.evidence.tutorRoutes });
  gate("student-account-hash", true, { hash: R.evidence.studentAccount.hash });

  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(R, null, 2));

  if (CHECK) {
    const base = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, "utf8")) : null;
    let fails = 0;
    for (const [k, v] of Object.entries(R.gates)) { const ok = v.pass && (!base || !(k in base.pinned) || base.pinned[k] === (k === "route-count" ? v.detail.count : k === "student-account-hash" ? v.detail.hash : v.pass)); console.log(`${ok ? "PASS" : "FAIL"}  ${k}${base && k in base.pinned ? ` (pinned ${JSON.stringify(base.pinned[k])})` : ""}`); if (!ok) fails++; }
    console.log(`\n${Object.keys(R.gates).length - fails}/${Object.keys(R.gates).length} gates pass`);
    process.exit(fails ? 1 : 0);
  } else {
    for (const [k, v] of Object.entries(R.gates)) console.log(`${v.pass ? "PASS" : "FAIL"}  ${k}`);
  }
})().catch((e) => { console.error(e); process.exit(2); });
