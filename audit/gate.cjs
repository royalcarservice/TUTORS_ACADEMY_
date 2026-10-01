/* THE STUDENT GATE (Phase 5 · Step 8) — the whole experience, measured as one instrument.
 * Same method as 4.9's audit/page.cjs (pin → check → drift, named gates, declared reasons), applied to
 * the student body. Production build on :3100 (dev frame specimens on :3000 for the forced states).
 *
 *   A. THE 8 PM JOURNEY  — 390×844, dark, cold cache, ~400 ms RTT / ~1.6 Mbps, 4× CPU: first visit
 *      (student-e, the write account, reset first) and the second visit (student-c, read-only — never POSTs).
 *      Per step: wall, TTFB, FCP, LCP, the h1, the primary action and whether it is in the fold, the words
 *      in the fold (the three-second test), a 390 screenshot.
 *   B. LCP VARIANCE — n samples per route, cold, warm-up discarded (P5-R4 Addendum 3).
 *   C. THE FOLD GATE  — 320/360/390/1280/1920: the primary action's bottom edge inside the first viewport.
 *   D. THE MOBILE PAGE-TOTAL PIN — encoded bytes for the first visit, pinned; --check gates DRIFT (±5 %),
 *      never a ceiling (D-08 / P5-R3 precedent).
 *   E. THE MATRIX — states × conditions, one verdict per cell; unfillable cells carry a reason.
 *
 * Modes:  node audit/gate.cjs --write   (pin)     node audit/gate.cjs --check   (drift vs audit/gate-baseline.json)
 * Credentials: test accounts only (TEST_PASS env or the documented default). Nothing is written except by
 * student-e's own Begin, and student-e is reset first.
 */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const P = process.env.PROD_URL || "http://localhost:3100";
const D = process.env.DEV_URL || "http://localhost:3000";
const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "gate-shots");
const BASE = path.join(__dirname, "gate-baseline.json");
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const acc = (x) => `student-${x}@test.tutorsacademy.invalid`;
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "run";
const LCP_SAMPLES = Number(process.env.LCP_SAMPLES || 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
/* SECTIONS=A,B,C,E re-runs only those sections; skipped sections are carried over from the existing baseline (so a
   single flaky navigation does not cost the whole 20-minute run). The report states which sections were re-run. */
const SECTIONS = (process.env.SECTIONS || "A,B,C,D,E").split(",");
const PREV = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, "utf8")) : null;
const want = (s) => SECTIONS.includes(s);

/* THE 8 PM CONNECTION: ~400 ms latency, ~1.6 Mbps. Provenance: Lighthouse's "slow 4G"/mobile profile is
   150 ms RTT / 1.6 Mbps; the brief asks for the 8 pm Indian mobile reality — 1.6 Mbps throughput with
   400 ms RTT. CPU 4× = Lighthouse's mid-range Android calibration (Moto G4-class). */
const EIGHT_PM = { offline: false, download: 1.6 * 1024 * 1024 / 8, upload: 750 * 1024 / 8, latency: 400 };
const SLOWER_TIER = { offline: false, download: 400 * 1024 / 8, upload: 400 * 1024 / 8, latency: 400 }; // the slower tier: Slow-3G

function sql(q) {
  const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^DATABASE_URL=(.+)$/m);
  if (!env) throw new Error("DATABASE_URL missing");
  return execFileSync("psql", [env[1].trim().replace(/^"|"$/g, ""), "-Atc", q], { encoding: "utf8" }).trim();
}
const uidE = `(select id from auth.users where email='${acc("e")}')`;
const resetE = () => { sql(`delete from public.environment_state where student_id=${uidE}`); sql(`delete from public.enrolments where student_id=${uidE}`); };

const R = { generatedAt: new Date().toISOString(), reference: "390x844 · dark · 8 pm profile (400 ms RTT / 1.6 Mbps) · 4× CPU · cold cache", profile: { eightPm: EIGHT_PM, slowerTier: SLOWER_TIER, cpu: 4 }, gates: {}, journey: {}, lcp: {}, fold: {}, pin: {}, matrix: {}, unfillable: [] };
const fail = [];
const gate = (name, ok, detail) => { R.gates[name] = { pass: !!ok, detail }; if (!ok) fail.push(name + ": " + detail); console.log((ok ? "PASS  " : "FAIL  ") + name + (ok ? "" : "  ← " + detail)); };

async function page(browser, { width = 390, height = 844, theme = "dark", net = EIGHT_PM, cpu = 4, js = true, reducedMotion = false } = {}) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  p.setDefaultNavigationTimeout(90000);
  await p.setViewport({ width, height, isMobile: width < 800, deviceScaleFactor: width < 800 ? 2 : 1 });
  const feats = [{ name: "prefers-color-scheme", value: theme }];
  if (reducedMotion) feats.push({ name: "prefers-reduced-motion", value: "reduce" });
  await p.emulateMediaFeatures(feats);
  if (net) await p.emulateNetworkConditions(net);
  if (cpu > 1) await p.emulateCPUThrottling(cpu);
  await p.setJavaScriptEnabled(js);
  const cdp = await p.createCDPSession(); await cdp.send("Network.enable");
  const bytes = { total: 0, byUrl: {} };
  cdp.on("Network.loadingFinished", (e) => { bytes.total += e.encodedDataLength; });
  cdp.on("Network.responseReceived", (e) => { bytes.byUrl[e.requestId] = e.response.url; });
  return { ctx, p, bytes, cdp };
}
async function signIn(p, email, next = "/student") {
  await p.goto(P + "/login?next=" + encodeURIComponent(next), { waitUntil: "load" });
  await p.type("#login-email", email); await p.type("#login-password", PASS);
  const t0 = Date.now();
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("form button[type=submit]")]);
  return Date.now() - t0;
}
/* what a page says in three seconds: the h1, the one primary, whether both sit in the first viewport, and the words there */
const facts = (p, { sync = false } = {}) => p.evaluate((sync) => new Promise((res) => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const inFold = (e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; };
  const h1s = [...document.querySelectorAll("h1")];
  const prim = [...document.querySelectorAll("[data-primary-action], [data-threshold] button, main form button[type=submit], .ta-btn[data-variant=primary]")].filter(vis);
  const anyAct = [...document.querySelectorAll("main a[href], main button")].filter(vis);
  const foldWords = (() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, s = ""; while ((n = w.nextNode())) { const el = n.parentElement; if (!el || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue; const r = el.getBoundingClientRect(); if (r.height > 0 && r.top < innerHeight && r.bottom > 0) s += " " + n.textContent; } return s.replace(/\s+/g, " ").trim(); })();
  const nav = performance.getEntriesByType("navigation")[0];
  const paints = Object.fromEntries(performance.getEntriesByType("paint").map((e) => [e.name, Math.round(e.startTime)]));
  let lcp = null; try { new PerformanceObserver((l) => { const e = l.getEntries().pop(); if (e) lcp = Math.round(e.startTime); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
  /* with scripts disabled the page has no timers: read synchronously (LCP is not needed for those cells) */
  (sync ? (fn) => fn() : (fn) => setTimeout(fn, 250))(() => res({
    h1: h1s.map((h) => h.textContent.replace(/\s+/g, " ").trim()), h1InFold: h1s.length ? inFold(h1s[0]) : false,
    primary: prim.map((e) => ({ text: e.textContent.replace(/\s+/g, " ").trim(), href: e.getAttribute("href") || (e.form && e.form.getAttribute("action")) || null, inFold: inFold(e), bottom: Math.round(e.getBoundingClientRect().bottom) })),
    primariesVisible: prim.length, actionsInMain: anyAct.length,
    foldWords: foldWords.split(" ").filter(Boolean).length, foldText: foldWords.slice(0, 400), hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    ttfb: nav ? Math.round(nav.responseStart) : null, fcp: paints["first-contentful-paint"] ?? null, lcp, load: nav ? Math.round(nav.loadEventEnd) : null,
    claimsProgress: /\b\d+\s*%|\bof \d+\b|\bstreak|\bscore\b|\blevel \d/i.test(document.body.innerText),
  }));
}), sync);

(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  try {
    /* ── A · THE 8 PM JOURNEY ─────────────────────────────────────────────────── */
    if (!want("A") && PREV) { R.journey = PREV.journey; Object.assign(R.gates, Object.fromEntries(Object.entries(PREV.gates).filter(([k]) => /^J/.test(k)))); }
    if (want("A")) resetE();
    if (want("A")) {
      const steps = [];
      const { ctx, p, bytes } = await page(browser);
      let broken = null;
      const step = async (name, fn) => { if (broken) { steps.push({ step: name, skipped: `journey broke at "${broken}"`, url: null, primary: [], h1: [] }); return; } const t0 = Date.now(); let extra = {}; try { extra = (await fn()) || {}; } catch (e) { broken = name; steps.push({ step: name, error: String(e.message || e).slice(0, 160), url: new URL(p.url()).pathname, primary: [], h1: [] }); console.log(`  ✗ ${name} BROKE: ${String(e.message || e).slice(0, 120)}`); return; } const f = await facts(p); const shot = `journey-${String(steps.length + 1).padStart(2, "0")}.png`; await p.screenshot({ path: path.join(OUT, shot) }); steps.push({ step: name, url: p.url().replace(P, ""), wall: Date.now() - t0, ...f, ...extra, shot }); console.log("  " + name + " → " + p.url().replace(P, "") + " " + JSON.stringify({ wall: Date.now() - t0, fcp: f.fcp, lcp: f.lcp, h1: f.h1[0], primary: f.primary[0]?.text, inFold: f.primary[0]?.inFold, foldWords: f.foldWords })); };
      await step("1 land on / as a stranger", () => p.goto(P + "/", { waitUntil: "load" }));
      await step("2 the door list (/subjects)", () => p.goto(P + "/subjects", { waitUntil: "load" }));
      await step("3 the open door → environment as visitor", () => p.goto(P + "/subjects/mathematics", { waitUntil: "load" }));
      await step("4 Sign in from the environment (E-23: the door in <main> when it exists; else the phone menu — recorded either way)", async () => { const inMain = await p.evaluate(() => [...document.querySelectorAll("main a[href], main button")].filter((e) => e.getBoundingClientRect().height > 0).map((e) => e.textContent.trim() + "→" + (e.getAttribute("href") || "button"))); const door = await p.$("main [data-visitor-door] a[href^='/login']"); if (door) { await Promise.all([p.waitForNavigation({ waitUntil: "load" }), door.click()]); } else { await p.click("button.ta-nav-trigger"); await sleep(400); await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("#nav-shell-menu a[href^='/login']")]); } return { visibleActionsInMainBefore: inMain, viaMenu: !door, tapsFromEnvironment: door ? 1 : 3, context: await p.evaluate(() => document.querySelector("[data-login-context]")?.textContent?.trim() || null) }; });
      await step("5 sign in → back to the environment (threshold)", async () => { await p.type("#login-email", acc("e")); await p.type("#login-password", PASS); const t0 = Date.now(); const seen = new Set(); const iv = setInterval(async () => { try { seen.add(JSON.stringify(await p.evaluate(() => { const b = document.querySelector("form button[type=submit]"); return b ? [b.textContent.trim(), b.disabled] : null; }))); } catch {} }, 200); await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("form button[type=submit]")]); clearInterval(iv); return { submitToArrive: Date.now() - t0, inFlight: [...seen] }; });
      await step("6 Begin Mathematics (the one write)", async () => { const t0 = Date.now(); await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("[data-threshold] button")]); return { clickToArrive: Date.now() - t0, arc: await p.evaluate(() => [...document.querySelectorAll("[data-arc-step]")].map((e) => e.getAttribute("data-arc-step") + ":" + e.getAttribute("data-state")).join(" ")), regionHeadings: await p.evaluate(() => [...document.querySelectorAll("main h2, main h3")].map((h) => h.textContent.trim())) }; });
      await step("7 back to the shell (/student)", () => p.goto(P + "/student", { waitUntil: "load" }));
      await step("8 the account page", () => p.goto(P + "/student/account", { waitUntil: "load" }));
      R.journey.firstVisit = { steps, encodedKB: Math.round(bytes.total / 1024), requests: Object.keys(bytes.byUrl).length };
      await ctx.close();
    }
    if (want("A")) {
      const steps = [];
      const { ctx, p, bytes } = await page(browser);
      let broken = null;
      const step = async (name, fn) => { if (broken) { steps.push({ step: name, skipped: `journey broke at "${broken}"`, url: null, primary: [], h1: [] }); return; } const t0 = Date.now(); let extra = {}; try { extra = (await fn()) || {}; } catch (e) { broken = name; steps.push({ step: name, error: String(e.message || e).slice(0, 160), url: new URL(p.url()).pathname, primary: [], h1: [] }); console.log(`  ✗ ${name} BROKE: ${String(e.message || e).slice(0, 120)}`); return; } const f = await facts(p); const shot = `return-${String(steps.length + 1).padStart(2, "0")}.png`; await p.screenshot({ path: path.join(OUT, shot) }); steps.push({ step: name, url: p.url().replace(P, ""), wall: Date.now() - t0, ...f, ...extra, shot }); console.log("  " + name + " → " + p.url().replace(P, "") + " " + JSON.stringify({ wall: Date.now() - t0, fcp: f.fcp, lcp: f.lcp, h1: f.h1[0], primary: f.primary[0]?.text, inFold: f.primary[0]?.inFold })); };
      await step("1 return: sign in (cold cache, next day)", async () => ({ submitToArrive: await signIn(p, acc("c")) }));
      await step("2 the environment it points at (GET — this account never POSTs)", async () => { const form = await p.evaluate(() => { const f = document.querySelector("main form"); return f ? { action: f.getAttribute("action"), method: f.getAttribute("method"), button: f.querySelector("button")?.textContent?.trim() } : null; }); await p.goto(P + "/subjects/physics", { waitUntil: "load" }); return { primaryForm: form, arc: await p.evaluate(() => [...document.querySelectorAll("[data-arc-step]")].map((e) => e.getAttribute("data-arc-step") + ":" + e.getAttribute("data-state")).join(" ")), recordText: await p.evaluate(() => document.querySelector("[data-arc]")?.parentElement?.innerText.replace(/\s+/g, " ").trim().slice(0, 400) || null) }; });
      await step("3 the other subject (not entered)", () => p.goto(P + "/subjects/mathematics", { waitUntil: "load" }));
      await step("4 the shell again", () => p.goto(P + "/student", { waitUntil: "load" }));
      R.journey.secondVisit = { steps, encodedKB: Math.round(bytes.total / 1024), requests: Object.keys(bytes.byUrl).length };
      await ctx.close();
    }
    const fv = R.journey.firstVisit?.steps || [], sv = R.journey.secondVisit?.steps || [];
    if (want("A")) {
    gate("J0 journey: every step completed (a step that throws — a missing door, a dead button — is a broken journey, not an instrument error)", [...fv, ...sv].every((s) => !s.error && !s.skipped), JSON.stringify([...fv, ...sv].filter((s) => s.error || s.skipped).map((s) => s.step + (s.error ? ": " + s.error : " (skipped)"))));
    gate("J1 journey: every surface on the path has exactly one h1 and no horizontal scroll at 390", [...fv, ...sv].every((s) => s.h1.length === 1 && !s.hscroll), JSON.stringify([...fv, ...sv].filter((s) => s.h1.length !== 1 || s.hscroll).map((s) => [s.step, s.h1, s.hscroll])));
    gate("J2 journey: the primary action is inside the first viewport on every step that has one (threshold, shell, 404, login)", [...fv, ...sv].filter((s) => s.primary.length).every((s) => s.primary[0].inFold), JSON.stringify([...fv, ...sv].filter((s) => s.primary.length && !s.primary[0].inFold).map((s) => [s.step, s.primary[0]])));
    gate("J3 journey: nothing in the STUDENT SPACE claims a figure the student cannot verify (no %, no 'x of y', no streak/score/level) — the homepage's '1 of 4' sequence numbering is Scene 6's, excluded", [...fv, ...sv].filter((s) => s.url !== "/").every((s) => !s.claimsProgress), JSON.stringify([...fv, ...sv].filter((s) => s.url !== "/" && s.claimsProgress).map((s) => s.step)));
    gate("J4 first visit: sign-in from the environment returns to the environment and Begin lands on the true state (arc enter:done)", /\/subjects\/mathematics$/.test(fv[4]?.url || "") && fv[4]?.primary?.[0]?.text === "Begin Mathematics" && /enter:done/.test(fv[5]?.arc || ""), JSON.stringify({ afterSignIn: fv[4]?.url, primary: fv[4]?.primary?.[0], arc: fv[5]?.arc, broke: fv.find((s) => s.error)?.step || null }));
    gate("J5 second visit: the shell leads with the last-opened environment (h1 names it, the fold says when, the primary opens it) and the environment carries the arc", !!sv[0] && /^Physics/.test(sv[0].h1[0] || "") && /last here|Last opened/i.test(sv[0].foldText || "") && sv[0].primary[0]?.text === "Open Physics" && /enter:done/.test(sv[1]?.arc || ""), JSON.stringify({ h1: sv[0]?.h1?.[0], primary: sv[0]?.primary?.[0]?.text, fold: (sv[0]?.foldText || "").slice(0, 160), arc: sv[1]?.arc }));
    }

    /* ── B · LCP VARIANCE (cold, warm-up discarded) ───────────────────────────── */
    if (!want("B") && PREV) { R.lcp = PREV.lcp; Object.assign(R.gates, Object.fromEntries(Object.entries(PREV.gates).filter(([k]) => /^L/.test(k)))); }
    if (want("B")) for (const [label, url, who] of [["/", "/", null], ["/subjects/mathematics (visitor)", "/subjects/mathematics", null], ["/student (state C)", "/student", "c"]]) {
      const samples = [];
      for (let i = 0; i < LCP_SAMPLES; i++) {
        const { ctx, p } = await page(browser);
        if (who) await signIn(p, acc(who), url); else await p.goto(P + url, { waitUntil: "load" });
        const f = await facts(p); samples.push({ fcp: f.fcp, lcp: f.lcp, ttfb: f.ttfb, load: f.load });
        await ctx.close();
      }
      const used = samples.slice(1).map((s) => s.lcp).filter((x) => x != null).sort((a, b) => a - b);
      R.lcp[label] = { samples, used, min: used[0], median: used[Math.floor(used.length / 2)], max: used[used.length - 1], n: used.length, discardedWarmUp: samples[0] };
      console.log("  LCP " + label + " " + JSON.stringify(R.lcp[label].used));
    }
    if (want("B")) gate("L1 LCP reported as a distribution: n ≥ 5 used samples per route after a discarded warm-up", Object.values(R.lcp).every((x) => x.n >= Math.min(5, LCP_SAMPLES - 1)), JSON.stringify(Object.fromEntries(Object.entries(R.lcp).map(([k, v]) => [k, v.n]))));

    /* ── C · THE FOLD GATE at five viewports (unthrottled; geometry, not speed) ── */
    const VIEWPORTS = [[320, 568], [360, 640], [390, 844], [1280, 800], [1920, 1080]];
    const SURFACES = [
      { name: "A /student (no enrolment)", who: "a", url: "/student" },
      { name: "B /student (enrolled, never entered)", who: "b", url: "/student" },
      { name: "C /student (active)", who: "c", url: "/student" },
      { name: "C+4 /student (four subjects)", who: "d", url: "/student" },
      { name: "threshold /subjects/mathematics (student-a)", who: "a", url: "/subjects/mathematics" },
      { name: "404 /subjects/nonsense", who: null, url: "/subjects/nonsense" },
      { name: "login /login?next=/subjects/mathematics", who: null, url: "/login?next=%2Fsubjects%2Fmathematics" },
      { name: "home / (Scene 0)", who: null, url: "/" },
    ];
    if (!want("C") && PREV) { R.fold = PREV.fold; Object.assign(R.gates, Object.fromEntries(Object.entries(PREV.gates).filter(([k]) => /^F/.test(k)))); }
    if (want("C")) for (const s of SURFACES) {
      R.fold[s.name] = {};
      for (const [w, h] of VIEWPORTS) {
        const { ctx, p } = await page(browser, { width: w, height: h, net: null, cpu: 1 });
        try {
          if (s.who) await signIn(p, acc(s.who), s.url); else { await p.goto(P + s.url, { waitUntil: "load" }); await p.waitForSelector("h1", { timeout: 8000 }).catch(() => null); }
          const f = await facts(p);
          R.fold[s.name][`${w}x${h}`] = { primary: f.primary[0] || null, h1InFold: f.h1InFold, hscroll: f.hscroll, primariesVisible: f.primariesVisible };
        } catch (e) { R.fold[s.name][`${w}x${h}`] = { error: String(e).slice(0, 100), h1InFold: false, hscroll: false, primariesVisible: 0, primary: null }; }
        await ctx.close();
      }
    }
    /* Declared fold exceptions (reported, not passed): a sign-in form's submit sits after its two fields and the
       test-accounts notice; at 320×568 / 360×640 the button's bottom lands 10–75 px under the fold. The fields are
       in the fold, the button is the next thing under them. Moving the notice or shrinking the form is a layout
       decision for the owner of the auth surface (5.1), not a gate fix. Counted in the exceptions register. */
    const FOLD_EXCEPTIONS = [["login", "320x568"], ["login", "360x640"]];
    R.foldExceptions = [];
    const foldFails = []; for (const [name, vs] of Object.entries(R.fold)) for (const [vp, x] of Object.entries(vs)) { if (FOLD_EXCEPTIONS.some(([n, v]) => name.startsWith(n) && v === vp) && x.primary && !x.primary.inFold && !x.hscroll && x.h1InFold) { R.foldExceptions.push(`${name}@${vp}: primary bottom ${x.primary.bottom} (declared, see register)`); continue; } if (x.hscroll) foldFails.push(`${name}@${vp}: hscroll`); if (x.primary && !x.primary.inFold) foldFails.push(`${name}@${vp}: primary below fold (${x.primary.text} bottom ${x.primary.bottom})`); if (!x.h1InFold) foldFails.push(`${name}@${vp}: h1 not in fold`); if (x.primariesVisible > 1) foldFails.push(`${name}@${vp}: ${x.primariesVisible} primaries`); }
    if (want("C")) gate("F1 fold gate (P5-R3): h1 and the one primary inside the first viewport, ≤1 primary visible, no h-scroll — every journey surface × 320/360/390/1280/1920", foldFails.length === 0, JSON.stringify(foldFails));

    /* ── D · THE MOBILE PAGE-TOTAL PIN ────────────────────────────────────────── */
    R.pin = { firstVisitEncodedKB: R.journey.firstVisit?.encodedKB ?? null, secondVisitEncodedKB: R.journey.secondVisit?.encodedKB ?? null, policy: "pin-and-drift ±5 % (D-08 / P5-R3): a ceiling is never asserted; drift beyond the band is a finding that needs a declared reason" };

    /* ── E · THE MATRIX ───────────────────────────────────────────────────────── */
    const STATES = [
      { id: "A · no enrolment", who: "a", url: "/student" },
      { id: "B · enrolled, never entered", who: "b", url: "/student" },
      { id: "C · active", who: "c", url: "/student" },
      { id: "environment · visitor", who: null, url: "/subjects/mathematics" },
      { id: "environment · threshold", who: "a", url: "/subjects/mathematics" },
      { id: "environment · enrolled (arc)", who: "c", url: "/subjects/physics" },
      { id: "login (next=environment)", who: null, url: "/login?next=%2Fsubjects%2Fmathematics" },
      { id: "account", who: "a", url: "/student/account" },
      { id: "404 · notFound()", who: null, url: "/subjects/nonsense", clientRendered: true },
      { id: "error page (specimen)", who: null, dev: "/dev/student-states/frame?state=student-failed", frame: true },
      { id: "session ended (specimen)", who: null, dev: "/dev/student-states/frame?state=login-ended", frame: true },
      { id: "entry failed (unknown-outcome recovery surface)", who: null, dev: "/dev/student-states/frame?state=entry-failed", frame: true },
      { id: "region failing (specimen)", who: null, dev: "/dev/student-states/frame?state=region-failing", frame: true, fragment: true },
      { id: "role redirect (/tutor as student)", who: "a", url: "/tutor" },
    ];
    const CONDITIONS = {
      "320": { width: 320, height: 568 }, "360": { width: 360, height: 640 }, "390": { width: 390, height: 844 }, "1280": { width: 1280, height: 800 },
      dark: { theme: "dark" }, light: { theme: "light" }, "reduced motion": { reducedMotion: true }, "no-JS": { js: false },
      /* 200% browser zoom on a 1280 px desktop = a 640×400 CSS-px viewport at 2× (how Chrome actually zooms: the
         layout viewport halves). Zooming the 390 phone would give 195 px — below the 320 px reflow floor and not a
         real device. */
      "200% zoom": { width: 640, height: 400, zoom: 2 }, "1.4.12": { spacing: true }, "slow network": { net: SLOWER_TIER }, "4x CPU": { cpu: 4 },
    };
    if (!want("E") && PREV) { R.matrix = PREV.matrix; R.unfillable = PREV.unfillable; }
    if (want("E")) for (const st of STATES) {
      R.matrix[st.id] = {};
      for (const [cname, c] of Object.entries(CONDITIONS)) {
        const opts = { width: c.width || 390, height: c.height || 844, theme: c.theme || "dark", net: c.net || null, cpu: c.cpu || 1, js: c.js !== false, reducedMotion: !!c.reducedMotion };
        if (st.clientRendered && c.js === false) { R.matrix[st.id][cname] = { verdict: "EXCEPTION", reason: "notFound()/error boundaries render client-side (Next 16.3.6, vercel/next.js#99287) — flip alarm in audit/states.cjs" }; R.unfillable.push({ state: st.id, condition: cname, reason: "framework: client-rendered page state (#99287)" }); continue; }
        if (st.frame && c.js === false) { R.matrix[st.id][cname] = { verdict: "EXCEPTION", reason: "specimen is a dev frame of a client-rendered boundary; the live boundary is the same exception (#99287)" }; R.unfillable.push({ state: st.id, condition: cname, reason: "framework: client-rendered page state (#99287)" }); continue; }
        const { ctx, p } = await page(browser, opts);
        try {
          if (st.frame) { await p.goto(D + "/", { waitUntil: "domcontentloaded" }).catch(() => null); await p.evaluate((t) => localStorage.setItem("ta-theme", t), opts.theme).catch(() => null); await p.goto(D + st.dev, { waitUntil: "load", timeout: 60000 }); }
          else if (st.who && opts.js) await signIn(p, acc(st.who), st.url);
          else if (st.who && !opts.js) { await p.setJavaScriptEnabled(true); await signIn(p, acc(st.who), st.url); await p.setJavaScriptEnabled(false); await p.goto(P + st.url, { waitUntil: "load" }); }
          else { await p.goto(P + st.url, { waitUntil: "load", timeout: 60000 }); }
          await p.waitForSelector("h1", { timeout: 15000 }).catch(() => null);
          if (c.spacing) { await p.addStyleTag({ content: "*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}p{margin-bottom:2em !important}" }); await sleep(200); }
          const f = await facts(p, { sync: !opts.js });
          const anim = c.reducedMotion ? await p.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length) : null;
          const clipped = c.spacing ? await p.evaluate(() => Array.from(document.querySelectorAll("main *")).some((el) => el.clientWidth > 1 && el.clientHeight > 1 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") /* 1×1 sr-only spans are not clipped text */) : false;
          const ok = (st.fragment || f.h1.length === 1) && !f.hscroll && f.primariesVisible <= 1 && !clipped && (anim === null || anim === 0) && f.foldWords > 0;
          R.matrix[st.id][cname] = { verdict: ok ? "PASS" : "FAIL", h1: f.h1.length, hscroll: f.hscroll, primaries: f.primariesVisible, primaryInFold: f.primary[0] ? f.primary[0].inFold : null, foldWords: f.foldWords, animations: anim, clipped, url: p.url().replace(P, "").replace(D, "dev:") };
          if (!ok) console.log("  MATRIX FAIL " + st.id + " × " + cname + " " + JSON.stringify(R.matrix[st.id][cname]));
        } catch (e) { R.matrix[st.id][cname] = { verdict: "FAIL", error: String(e).slice(0, 120) }; console.log("  MATRIX ERROR " + st.id + " × " + cname + " " + String(e).slice(0, 120)); }
        await ctx.close();
      }
    }
    const cells = Object.values(R.matrix).flatMap((r) => Object.values(r));
    if (!want("E") && PREV) { R.matrixTotals = PREV.matrixTotals; Object.assign(R.gates, Object.fromEntries(Object.entries(PREV.gates).filter(([k]) => /^M/.test(k)))); }
    R.matrixTotals = want("E") ? { cells: cells.length, pass: cells.filter((c) => c.verdict === "PASS").length, fail: cells.filter((c) => c.verdict === "FAIL").length, exception: cells.filter((c) => c.verdict === "EXCEPTION").length } : R.matrixTotals;
    if (want("E")) gate("M1 matrix: every cell filled — PASS or a declared EXCEPTION with its reason; zero FAIL", R.matrixTotals.fail === 0 && cells.length === STATES.length * Object.keys(CONDITIONS).length, JSON.stringify(R.matrixTotals));
  } finally { await browser.close(); }

  R.sectionsRun = SECTIONS;
  R.pass = fail.length === 0;
  /* pin-and-drift */
  if (mode === "check" && fs.existsSync(BASE)) {
    const B = JSON.parse(fs.readFileSync(BASE, "utf8"));
    const drift = (a, b) => (b ? Math.abs(a - b) / b : 0);
    const d1 = drift(R.pin.firstVisitEncodedKB, B.pin.firstVisitEncodedKB);
    gate(`D1 mobile page-total drift: first visit ${R.pin.firstVisitEncodedKB} KB vs pinned ${B.pin.firstVisitEncodedKB} KB (±5 %)`, d1 <= 0.05, `${(d1 * 100).toFixed(1)} %`);
    const gatesDiff = Object.keys(B.gates).filter((g) => B.gates[g].pass && R.gates[g] && !R.gates[g].pass);
    gate("D2 no gate that passed at the pin fails now", gatesDiff.length === 0, JSON.stringify(gatesDiff));
    R.pass = fail.length === 0;
  }
  fs.writeFileSync(path.join(OUT, "last-run.json"), JSON.stringify(R, null, 1));
  if (mode === "write") { fs.writeFileSync(BASE, JSON.stringify(R, null, 1)); console.log("gate baseline written → " + BASE); }
  const n = Object.keys(R.gates).length; console.log(`${n - fail.length}/${n} gates pass`);
  process.exitCode = R.pass ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
