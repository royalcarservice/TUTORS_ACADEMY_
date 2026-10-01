/* TUTOR SHELL HARNESS (Phase 6 · Step 2). The 5.3 shell harness's shape,
 * the tutor's facts. Reference viewport 390×844; second viewport 1280.
 *   node audit/tutor.cjs --write | --check
 * States are REAL accounts (no fixture content on /tutor):
 *   A  tutor-u  related to nobody
 *   B  tutor-a  related to student-c in physics (one row)
 * Measures: one dominant surface (one h1, no control in it, no primary
 * action anywhere), fold at 390, hierarchy ratio, targets ≥44, row =
 * name · subject · nothing else, rows are not links, no region DOM, no
 * numerals/counts, the never-contains sweep (5.3 + P6-R3 + money), no-JS
 * parity, script bytes vs the student shell, axe, both themes, grayscale.
 * Also Test 28: the stale-string sweep across public + portal routes.   */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { AxePuppeteer } = require("@axe-core/puppeteer");
const { execFileSync } = require("child_process");

const P = process.env.PROD_URL || "http://localhost:3100";
const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(__dirname, "tutor-baseline.json");
const OUT = path.join(__dirname, "tutor-shots");
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const ACCOUNTS = { A: process.env.TEST_TUTOR_U || "tutor-u@test.tutorsacademy.invalid", B: process.env.TEST_TUTOR || "tutor-a@test.tutorsacademy.invalid" };
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "run";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function sql(q) {
  try { const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m); if (!env) return null; return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim(); } catch { return null; }
}

/* ── word lists ───────────────────────────────────────────────────────── */
const DASHBOARD = ["stat card", "metric", "your numbers", "streak", "\\bxp\\b", "\\blevel\\b", "badge", "leaderboard", "points", "notification", "unread", "recommended for you", "keep it up", "doing great", "welcome back", "welcome,"];
const SKELETON = ["skeleton", "shimmer", "placeholder-card", "loading-card", "\\bloading\\b", "coming soon", "no data", "no activity", "\\b0 students", "no students yet"];
const P6R3 = ["needs attention", "at risk", "inactive", "falling behind", "hasn't opened", "has not opened", "last seen", "last active", "overdue", "behind", "ahead", "\\bprogress\\b", "\\bscore", "\\bgrade", "attendance", "engagement", "\\broster", "caseload", "dashboard", "pipeline", "\\bqueue"];
const MONEY = ["\\bearn", "\\bpaid\\b", "payout", "payment", "billing", "invoice", "\\brate\\b", "\\bfees?\\b", "salary", "income", "revenue"];
const STALE = ["get paid", "Teach, schedule, assess", "Classes, assignments, tests and progress", "Operations, people, content and billing", "sessions, rosters, grading and earnings", "operations, users, content and finance", "foundation task", "next build drops", "Scheduled for this surface", "the next build"];
const hits = (text, list) => list.filter((w) => new RegExp(w, "i").test(text));

async function login(browser, state, vp = { width: 390, height: 844, isMobile: true, hasTouch: true }) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ deviceScaleFactor: 1, ...vp });
  await p.goto(P + "/login?next=%2Ftutor", { waitUntil: "load" });
  await p.type("input[name=email]", ACCOUNTS[state]);
  await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (!p.url().endsWith("/tutor")) throw new Error(`sign-in failed for ${state}: ${p.url()}`);
  return { ctx, p };
}
const setTheme = (p, t) => p.evaluate((t) => localStorage.setItem("ta-theme", t), t);
const gotoShell = async (p) => { await p.goto(P + "/tutor", { waitUntil: "load" }); await sleep(250); };

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), reference: "390x844 mobile", states: {}, gates: {}, sweep: {} };
  const fail = [];
  const gate = (name, ok, detail) => { R.gates[name] = { pass: !!ok, detail }; if (!ok) fail.push(name + ": " + detail); };

  R.fixture = sql("select string_agg(s.raw_user_meta_data->>'display_name'||' · '||r.subject_id, '; ' order by r.subject_id, s.raw_user_meta_data->>'display_name') from public.relationships r join auth.users s on s.id=r.student_id join auth.users t on t.id=r.tutor_id where t.email='" + ACCOUNTS.B + "' and r.state='active'");

  /* signed out */
  {
    const p = await browser.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true });
    await p.goto(P + "/tutor", { waitUntil: "load" });
    const html = await p.content();
    gate("no-fake-signed-in", /\/login\?next=%2Ftutor$/.test(p.url()) && !/data-tutor-shell/.test(html), p.url());
    await p.close();
  }

  /* same-method script measurement of the STUDENT shell (student-a), so the "no client JS added" claim compares like with like */
  R.studentScript = await (async () => {
    const ctx = await browser.createBrowserContext(); const p = await ctx.newPage();
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await p.goto(P + "/login?next=%2Fstudent", { waitUntil: "load" });
    await p.type("input[name=email]", process.env.TEST_A || "student-a@test.tutorsacademy.invalid"); await p.type("input[name=password]", PASS);
    await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
    const scripts = []; p.on("response", (r) => { if (r.request().resourceType() === "script") r.buffer().then((b) => scripts.push(b.length)).catch(() => {}); });
    await p.goto(P + "/student", { waitUntil: "load" }); await sleep(550);
    await ctx.close();
    return { scriptBytes: scripts.reduce((a, b) => a + b, 0), scriptFiles: scripts.length };
  })();

  for (const state of ["A", "B"]) {
    const S = (R.states[state] = {});
    const { ctx, p } = await login(browser, state);
    const scripts = []; p.on("response", (r) => { if (r.request().resourceType() === "script") r.buffer().then((b) => scripts.push(b.length)).catch(() => {}); });
    await gotoShell(p);
    const html = await p.content();

    S.strings = await p.evaluate(() => Array.from(document.querySelectorAll("[data-tutor-shell] *")).filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => e.textContent.trim()));
    S.dom = await p.evaluate(() => {
      const shell = document.querySelector("[data-tutor-shell]");
      const q = (s) => shell.querySelectorAll(s).length;
      const rows = Array.from(shell.querySelectorAll("[data-relationship-row]")).map((li) => ({ text: li.textContent.trim(), spans: li.children.length, links: li.querySelectorAll("a,button").length }));
      const h1 = shell.querySelector("h1");
      const row = shell.querySelector("[data-relationship-row] span");
      const fs_ = (el) => el ? parseFloat(getComputedStyle(el).fontSize) : null;
      return {
        state: shell.getAttribute("data-state"), h1Count: document.querySelectorAll("h1").length, h1Text: h1.textContent,
        primaryControls: q("[data-primary-surface] a, [data-primary-surface] button, [data-primary-surface] form"), primaryActions: document.querySelectorAll("[data-primary-action]").length,
        shellLinks: q("a"), shellButtons: q("button"), shellForms: q("form"), disabled: q("[disabled], [aria-disabled='true']"),
        subjectGroups: q("[data-subject-groups]"), subjects: Array.from(shell.querySelectorAll("[data-subject]")).map((e) => e.getAttribute("data-subject")), slotRegions: q("[data-slot-region]"), slots: q("[data-slot]"),
        rows, imgs: q("img, svg:not([aria-hidden])"), hierarchyRatio: row ? +(fs_(h1) / fs_(row)).toFixed(2) : null, h1Px: fs_(h1),
        numerals: (shell.textContent.match(/\d+/g) || []),
      };
    });
    const sub = await p.evaluate(() => sessionStorage.length + localStorage.length);
    S.fold = await p.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null; };
      return { primaryBottom: r("[data-primary-surface]"), h1Bottom: r("h1"), firstGroupHeadingBottom: r("[data-subject] h3"), firstRowBottom: r("[data-relationship-row]"), viewport: innerHeight };
    });
    S.targets = await p.evaluate(() => Array.from(document.querySelectorAll("header a, header button, nav a, nav button, [data-account-link]")).map((e) => { const b = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 24), w: Math.round(b.width), h: Math.round(b.height), visible: b.width > 0 && b.height > 0 }; }).filter((t) => t.visible));
    await sleep(300);
    S.network = { scriptBytes: scripts.reduce((a, b) => a + b, 0), scriptFiles: scripts.length };
    const text = S.strings.join(" \n ");
    S.sweeps = { dashboard: hits(text, DASHBOARD), skeleton: hits(text, SKELETON), p6r3: hits(text, P6R3), money: hits(text, MONEY), stale: hits(html, STALE), htmlNumerals: (html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ").match(/\b\d+\b/g) || []).filter((n) => !/^(20\d\d)$/.test(n)) };

    /* gates */
    gate(`${state}: one h1`, S.dom.h1Count === 1, String(S.dom.h1Count));
    gate(`${state}: expected state`, S.dom.state === (state === "A" ? "A-no-relationships" : "B-relationships-no-events"), S.dom.state);
    gate(`${state}: no control in the primary surface, no primary action, no disabled control (P6-R4)`, S.dom.primaryControls === 0 && S.dom.primaryActions === 0 && S.dom.disabled === 0, JSON.stringify([S.dom.primaryControls, S.dom.primaryActions, S.dom.disabled]));
    gate(`${state}: no links, buttons or forms inside the shell (nothing a tutor does here changes anything)`, S.dom.shellLinks === 0 && S.dom.shellButtons === 0 && S.dom.shellForms === 0, JSON.stringify([S.dom.shellLinks, S.dom.shellButtons, S.dom.shellForms]));
    gate(`${state}: no region DOM, no slot`, S.dom.slotRegions === 0 && S.dom.slots === 0, "");
    gate(`${state}: no numerals in the shell (no counts)`, S.dom.numerals.length === 0, JSON.stringify(S.dom.numerals));
    gate(`${state}: never-contains sweep clean`, !S.sweeps.dashboard.length && !S.sweeps.skeleton.length && !S.sweeps.p6r3.length && !S.sweeps.money.length && !S.sweeps.stale.length, JSON.stringify(S.sweeps));
    gate(`${state}: primary surface complete above the 390 fold`, S.fold.primaryBottom < 844, JSON.stringify(S.fold));
    gate(`${state}: every chrome target ≥44×44`, S.targets.every((t) => t.w >= 44 && t.h >= 44), JSON.stringify(S.targets));
    gate(`${state}: nothing at rest in storage`, sub === 0 || sub === 1 /* ta-theme only */, String(sub));
    gate(`${state}: script bytes within 2 KB of the student shell, same method (no client JS added)`, Math.abs(S.network.scriptBytes - R.studentScript.scriptBytes) <= 2048, `${S.network.scriptBytes} (${S.network.scriptFiles} files) vs /student ${R.studentScript.scriptBytes} (${R.studentScript.scriptFiles} files)`);
    if (state === "A") gate("A: no subject groups, no rows", S.dom.subjectGroups === 0 && S.dom.rows.length === 0, "");
    if (state === "B") {
      gate("B: subject groups present, rows are name · subject · nothing else, rows are not links", S.dom.subjectGroups === 1 && S.dom.rows.length > 0 && S.dom.rows.every((r) => r.spans === 2 && r.links === 0), JSON.stringify(S.dom.rows));
      const dbRows = (R.fixture || "").split("; ").filter(Boolean);
      const domRows = S.dom.rows.map((r) => r.text);
      gate("B: DOM rows equal the DB relationship rows (name · subject), in the fixed order", dbRows.length === domRows.length && dbRows.every((d, i) => domRows[i].replace(/\s+/g, " ") === d.replace(" · ", "").replace(/\s+/g, " ") || domRows[i] === d.split(" · ")[0] + (d.split(" · ")[1][0].toUpperCase() + d.split(" · ")[1].slice(1))), JSON.stringify({ dbRows, domRows }));
      gate("B: first subject group heading above the 390 fold", S.fold.firstGroupHeadingBottom && S.fold.firstGroupHeadingBottom < 844, JSON.stringify(S.fold));
      gate("B: hierarchy — h1 is the dominant text (ratio ≥ 1.6 over a row)", S.dom.hierarchyRatio >= 1.6, String(S.dom.hierarchyRatio));
    }

    /* screenshots: both themes × 390 + 1280, grayscale */
    for (const theme of ["dark", "light"]) {
      await setTheme(p, theme); await gotoShell(p);
      await p.screenshot({ path: path.join(OUT, `${state}-${theme}-390.png`), fullPage: true });
      if (theme === "dark") { await p.addStyleTag({ content: "html{filter:grayscale(1)}" }); await p.screenshot({ path: path.join(OUT, `${state}-${theme}-390-gray.png`) }); }
    }
    const w = await ctx.newPage(); await w.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    for (const theme of ["dark", "light"]) { await w.goto(P + "/tutor", { waitUntil: "load" }); await setTheme(w, theme); await w.goto(P + "/tutor", { waitUntil: "load" }); await w.screenshot({ path: path.join(OUT, `${state}-${theme}-1280.png`), fullPage: true }); }
    S.fold1280 = await w.evaluate(() => ({ primaryBottom: Math.round(document.querySelector("[data-primary-surface]").getBoundingClientRect().bottom), h1Count: document.querySelectorAll("h1").length }));
    gate(`${state}: claims reproduce at 1280 (one h1, primary above fold)`, S.fold1280.h1Count === 1 && S.fold1280.primaryBottom < 800, JSON.stringify(S.fold1280));
    await w.close();

    /* no-JS parity */
    const nj = await ctx.newPage(); await nj.setJavaScriptEnabled(false); await nj.setViewport({ width: 390, height: 844, isMobile: true });
    await nj.goto(P + "/tutor", { waitUntil: "load" });
    const njStrings = await nj.evaluate(() => Array.from(document.querySelectorAll("[data-tutor-shell] *")).filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => e.textContent.trim()));
    gate(`${state}: identical shell text without JavaScript`, JSON.stringify(njStrings) === JSON.stringify(S.strings), `${njStrings.length} vs ${S.strings.length}`);
    await nj.close();

    /* axe */
    await setTheme(p, "dark"); await gotoShell(p);
    const axe = await new AxePuppeteer(p).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    S.axe = axe.violations.map((v) => `${v.id}(${v.nodes.length})`);
    gate(`${state}: axe clean`, S.axe.length === 0, S.axe.join(", "));
    await ctx.close();
  }

  /* ── Test 28: stale-string sweep across routes a reader can see ─────── */
  {
    const p = await browser.newPage(); await p.setViewport({ width: 1280, height: 800 });
    for (const u of ["/", "/login", "/register", "/subjects", "/login?next=%2Ftutor"]) {
      await p.goto(P + u, { waitUntil: "load" });
      const t = await p.evaluate(() => document.body.innerText);
      R.sweep[u] = { stale: hits(t, STALE), money: hits(t, MONEY) };
    }
    R.homepageStrings = await (async () => { await p.goto(P + "/", { waitUntil: "load" }); return p.evaluate(() => Array.from(document.querySelectorAll("main *")).filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => e.textContent.trim())); })();
    R.loginBlurbs = await (async () => { await p.goto(P + "/login", { waitUntil: "load" }); return p.evaluate(() => Array.from(document.querySelectorAll("li p")).map((e) => e.textContent.trim())); })();
    await p.close();
    gate("Test 28: no stale string, no money word on any public route", Object.values(R.sweep).every((s) => !s.stale.length && !s.money.length), JSON.stringify(R.sweep));
    let src = ""; try { src = execFileSync("grep", ["-rliE", STALE.join("|"), "src"], { cwd: ROOT, encoding: "utf8" }).trim(); } catch (e) { src = e.status === 1 ? "" : String(e); }
    gate("Test 28: no stale string left in src", src === "", src);
  }

  await browser.close();
  R.pass = fail.length === 0; R.failed = fail;
  if (mode === "write") { fs.writeFileSync(BASELINE, JSON.stringify(R, null, 1)); console.log("tutor baseline written →", BASELINE); }
  if (mode === "check" && fs.existsSync(BASELINE)) {
    const B = JSON.parse(fs.readFileSync(BASELINE, "utf8")); const diffs = [];
    for (const s of ["A", "B"]) {
      if (JSON.stringify(B.states[s].strings) !== JSON.stringify(R.states[s].strings)) diffs.push({ state: s, what: "strings changed" });
      if (Math.abs(B.states[s].network.scriptBytes - R.states[s].network.scriptBytes) > 2048) diffs.push({ state: s, what: "script bytes", was: B.states[s].network.scriptBytes, now: R.states[s].network.scriptBytes });
    }
    if (JSON.stringify(B.homepageStrings) !== JSON.stringify(R.homepageStrings)) diffs.push({ what: "homepage strings changed" });
    console.log(diffs.length ? "DIFFS vs tutor baseline:\n" + JSON.stringify(diffs, null, 1) : "no diffs vs tutor baseline");
  }
  console.log("fixture (DB):", R.fixture);
  console.log("login blurbs:", JSON.stringify(R.loginBlurbs));
  console.log("homepage strings:", R.homepageStrings.length);
  console.log("GATES:\n" + Object.entries(R.gates).map(([k, v]) => `${v.pass ? "PASS" : "FAIL"}  ${k}${v.pass ? "" : "  — " + String(v.detail).slice(0, 400)}`).join("\n"));
  for (const s of ["A", "B"]) console.log(`\n${s}:`, JSON.stringify({ dom: R.states[s].dom, fold: R.states[s].fold, network: R.states[s].network, targets: R.states[s].targets }, null, 0).slice(0, 1800));
  process.exit(R.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
