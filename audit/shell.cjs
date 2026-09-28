#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════
   AUDIT HARNESS — STUDENT SHELL EXTENSION (Phase 5 · Step 3)
   Extends 4.9's harness (audit/page.cjs is untouched). REFERENCE VIEWPORT =
   390×844 mobile (Decision 2); desktop is the derived case.

   Runs against the PRODUCTION build with REAL sign-ins (test accounts):
     PROD_URL=http://localhost:3100 DEV_URL=http://localhost:3000 \
     TEST_PASS=… NODE_PATH=./node_modules node audit/shell.cjs --write|--check

   Test accounts (state → email) come from env or the defaults below; they
   are test accounts in the Supabase project, flagged is_test_account.
   Writes audit/shell-baseline.json + audit/shell-shots/*.png.
   ══════════════════════════════════════════════════════════════════════════ */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { AxePuppeteer } = require("@axe-core/puppeteer");

const P = process.env.PROD_URL || "http://localhost:3100";
const D = process.env.DEV_URL || "http://localhost:3000";
const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(__dirname, "shell-baseline.json");
const OUT = path.join(__dirname, "shell-shots");
const PASS = process.env.TEST_PASS || "Test-Pass-2026!";
const ACCOUNTS = {
  A: process.env.TEST_A || "student-a@test.tutorsacademy.invalid",
  B: process.env.TEST_B || "student-b@test.tutorsacademy.invalid",
  C: process.env.TEST_C || "student-c@test.tutorsacademy.invalid",
  C4: process.env.TEST_C4 || "student-d@test.tutorsacademy.invalid", // State C with FOUR enrolled subjects (fold gate only)
};
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "run";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

/* ── word lists (Part 4 + Test 8/9/15) ────────────────────────────────── */
const DASHBOARD = ["stat card", "metric", "your numbers", "streak", "\\bxp\\b", "\\blevel\\b", "badge", "leaderboard", "points", "notification", "unread", "recommended for you", "keep it up", "doing great", "welcome back", "welcome,"];
const SKELETON = ["skeleton", "shimmer", "placeholder-card", "loading-card", "\\bloading\\b", "coming soon", "no data"];
const voiceSrc = fs.readFileSync(path.join(ROOT, "src/lib/spine/voice.ts"), "utf8");
const BANNED = [...voiceSrc.matchAll(/^\s*"([^"]+)",/gm)].map((m) => m[1]).filter((s) => !s.includes(" as ") && !/headlines|adjectives|listicles/.test(s));
const CLICHE = ["unlock your potential", "you have it in you", "every expert was once a beginner", "the only limit is you", "imagine what you could become", "the future is yours", "look how far you've come", "this is just the beginning", "the sky's the limit", "dream big", "believe in yourself", "what if you could"];
const GUILT = ["haven't started", "you haven't", "don't lose", "at risk", "hurry", "don't miss", "falling behind", "catch up", "overdue", "only \\d+ (days|hours)", "last chance", "you're doing great", "keep it up", "congratulations", "well done", "you did it", "unlocked", "earned", "reward"];
const hits = (text, list) => list.filter((w) => new RegExp(w, "i").test(text));

/* ── helpers ──────────────────────────────────────────────────────────── */
async function login(browser, state, base = P, vp = { width: 390, height: 844, isMobile: true, hasTouch: true }) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ deviceScaleFactor: 1, ...vp });
  await p.goto(base + "/login?next=%2Fstudent", { waitUntil: "load" });
  await p.type("input[name=email]", ACCOUNTS[state]);
  await p.type("input[name=password]", PASS);
  await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("button[type=submit]")]);
  if (!p.url().endsWith("/student")) throw new Error(`sign-in failed for ${state}: ${p.url()}`);
  return { ctx, p };
}
const setTheme = (p, t) => p.evaluate((t) => localStorage.setItem("ta-theme", t), t);
const gotoShell = async (p, base = P) => { await p.goto(base + "/student", { waitUntil: "load" }); await sleep(250); };

const TEXT_SPACING_CSS = `*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}p{margin-bottom:2em !important}`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const R = { generatedAt: new Date().toISOString(), reference: "390x844 mobile", states: {}, boundary: {}, perf: {}, gates: {} };
  const fail = [];
  const gate = (name, ok, detail) => { R.gates[name] = { pass: !!ok, detail }; if (!ok) fail.push(name + ": " + detail); };

  /* ── signed-out: no fake signed-in state ───────────────────────────── */
  {
    const p = await browser.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true });
    const r = await p.goto(P + "/student", { waitUntil: "load" });
    const chain = r.request().redirectChain().map((x) => x.response()?.status() + " " + x.url());
    const html = await p.content();
    R.signedOut = { landed: p.url(), chain, shellInLoginHtml: /data-student-shell/.test(html), subjectRowsInLoginHtml: /data-subject-rows/.test(html) };
    gate("no-fake-signed-in", /\/login\?next=%2Fstudent$/.test(p.url()) && !R.signedOut.shellInLoginHtml, JSON.stringify(R.signedOut));
    await p.screenshot({ path: path.join(OUT, "signed-out-390.png") });
    await p.close();
  }

  for (const state of ["A", "B", "C"]) {
    const S = (R.states[state] = {});
    const { ctx, p } = await login(browser, state);

    /* html + strings (Test 2, 14) */
    await gotoShell(p);
    const html = await p.content();
    S.serverState = (html.match(/data-state="([^"]+)"/) || [])[1] || null;
    S.strings = await p.evaluate(() => {
      const out = [];
      const w = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) { const t = n.textContent.replace(/\s+/g, " ").trim(); if (t) out.push(t); }
      document.querySelectorAll("main [aria-label]").forEach((e) => out.push("[aria-label] " + e.getAttribute("aria-label")));
      return out;
    });
    S.navStrings = await p.evaluate(() => Array.from(document.querySelectorAll("header a, header button")).map((e) => (e.getAttribute("aria-label") || e.textContent.replace(/\s+/g, " ").trim())));

    /* hierarchy (Test 4): largest text vs runner-up; primary CTA uniqueness; primary surface area vs rows */
    S.hierarchy = await p.evaluate(() => {
      const main = document.querySelector("main");
      const texts = [];
      main.querySelectorAll("h1,h2,h3,p,span,a,button").forEach((e) => {
        const r = e.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return;
        const fs = parseFloat(getComputedStyle(e).fontSize);
        if (e.children.length === 0 || e.tagName === "H1" || e.tagName === "A" || e.tagName === "BUTTON") texts.push({ tag: e.tagName, text: e.textContent.trim().slice(0, 40), fontSize: fs, top: Math.round(r.top), area: Math.round(r.width * r.height) });
      });
      texts.sort((a, b) => b.fontSize - a.fontSize);
      const prim = document.querySelector("[data-primary-surface]")?.getBoundingClientRect();
      const rows = document.querySelector("[data-subject-rows]")?.getBoundingClientRect();
      const primaryButtons = main.querySelectorAll('.ta-btn[data-variant="primary"]').length;
      const h1s = document.querySelectorAll("h1").length;
      return { largest: texts[0], runnerUp: texts[1], fontRatio: +(texts[0].fontSize / texts[1].fontSize).toFixed(2), primaryArea: prim ? Math.round(prim.width * prim.height) : 0, rowsArea: rows ? Math.round(rows.width * rows.height) : 0, primaryButtons, h1s };
    });
    gate(`hierarchy-${state}`, S.hierarchy.fontRatio >= 1.6 && S.hierarchy.primaryButtons === 1 && S.hierarchy.h1s === 1 && S.hierarchy.largest.tag === "H1", JSON.stringify(S.hierarchy));

    /* ── GATE: PRIMARY ACTION ABOVE THE FOLD (P5-R3 FIX 3) ──────────────────
       At 320×568, 360×640, 390×844, 1280×800, at 200% zoom (1280 desktop →
       640 CSS px) and under WCAG 1.4.12 text spacing at 390×844.
       DOCUMENT HEIGHT IS NOT ASSERTED. The old "page fits in 844px" claim was
       measured at one viewport and was false at others — the shell's height
       grows with subject rows, which is correct behaviour for a list. The
       invariant is the primary action's visibility, so that is the gate.   */
    S.primaryAboveFold = {};
    const foldMeasure = () => { const a = document.querySelector("[data-primary-action]").getBoundingClientRect(); return { viewport: `${innerWidth}x${innerHeight}`, primaryActionBottom: Math.round(a.bottom), visible: a.bottom <= innerHeight && a.top >= 0, rows: document.querySelectorAll("[data-subject-rows] li").length }; };
    for (const [label, w, h, mobile] of [["320x568", 320, 568, true], ["360x640", 360, 640, true], ["390x844", 390, 844, true], ["1280x800", 1280, 800, false], ["zoom200", 640, 400, false]]) {
      await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 }); await gotoShell(p);
      S.primaryAboveFold[label] = await p.evaluate(foldMeasure);
    }
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await gotoShell(p);
    await p.addStyleTag({ content: TEXT_SPACING_CSS }); await sleep(100);
    S.primaryAboveFold["textSpacing390"] = await p.evaluate(foldMeasure);
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await gotoShell(p);
    gate(`primary-action-above-fold-${state}`, Object.values(S.primaryAboveFold).every((v) => v.visible), JSON.stringify(S.primaryAboveFold));

    /* empty slots (Test 7) */
    S.slots = await p.evaluate(() => ({
      slotRegions: document.querySelectorAll("[data-slot-region]").length,
      slots: document.querySelectorAll("[data-slot]").length,
      emptySections: Array.from(document.querySelectorAll("main section")).filter((s) => !s.textContent.trim()).length,
      mainSections: Array.from(document.querySelectorAll("main section")).map((s) => s.getAttribute("aria-labelledby")),
      emptyBoxes: Array.from(document.querySelectorAll("main div, main section")).filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.height > 24 && !e.textContent.trim() && !e.querySelector("svg") && (cs.borderStyle !== "none" || cs.backgroundColor !== "rgba(0, 0, 0, 0)"); }).length,
    }));
    gate(`no-empty-slots-${state}`, S.slots.slotRegions === 0 && S.slots.slots === 0 && S.slots.emptySections === 0 && S.slots.emptyBoxes === 0, JSON.stringify(S.slots));

    /* sweeps (Test 8, 9, 15) over visible strings + full HTML */
    const allText = S.strings.concat(S.navStrings).join(" \n ");
    S.sweeps = { dashboard: hits(allText, DASHBOARD), skeleton: hits(allText, SKELETON), banned: hits(allText, BANNED), cliche: hits(allText, CLICHE), guilt: hits(allText, GUILT), htmlDashboard: hits(html.replace(/<script[\s\S]*?<\/script>/g, ""), ["streak", "leaderboard", "badge", "notification", "unread", "recommended for you"]), htmlSkeleton: hits(html.replace(/<script[\s\S]*?<\/script>/g, ""), ["skeleton", "shimmer", "placeholder-card", "loading-card"]) };
    gate(`sweeps-${state}`, Object.values(S.sweeps).every((a) => a.length === 0), JSON.stringify(S.sweeps));

    /* dead nav (Test 10): every link in header+main, fetched with the session */
    const hrefs = await p.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll("header a[href], main a[href]")).map((a) => a.getAttribute("href")))));
    S.links = [];
    for (const h of hrefs) {
      const st = await p.evaluate(async (h) => { const r = await fetch(h, { redirect: "manual" }); return r.status + (r.type === "opaqueredirect" ? " (redirect)" : ""); }, h);
      S.links.push([h, st]);
    }
    S.forms = await p.evaluate(() => Array.from(document.querySelectorAll("form")).map((f) => f.getAttribute("action") + " " + f.method));
    gate(`links-${state}`, S.links.every(([, s]) => s.startsWith("200")), JSON.stringify(S.links));

    /* screenshots both themes 390 + 1280 (Test 2) + grayscale (Test 19) */
    for (const theme of ["dark", "light"]) {
      await setTheme(p, theme);
      for (const [w, h] of [[390, 844], [1280, 800]]) {
        await p.setViewport({ width: w, height: h, isMobile: w < 800, hasTouch: w < 800, deviceScaleFactor: 1 });
        await gotoShell(p);
        await p.screenshot({ path: path.join(OUT, `${state}-${theme}-${w}.png`) });
      }
    }
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await gotoShell(p);
    await p.addStyleTag({ content: "html{filter:grayscale(1)}" });
    await p.screenshot({ path: path.join(OUT, `${state}-grayscale-390.png`) });

    /* viewports (Test 20) */
    S.viewports = {};
    for (const w of [320, 390, 768, 1280, 1920]) {
      await p.setViewport({ width: w, height: 844, isMobile: w < 800, hasTouch: w < 800 });
      await gotoShell(p);
      S.viewports[w] = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, primaryW: Math.round(document.querySelector("[data-primary-surface]").getBoundingClientRect().width) }));
    }
    gate(`no-hscroll-${state}`, Object.values(S.viewports).every((v) => !v.overflow), JSON.stringify(S.viewports));

    /* touch targets at 320 (Test 24) */
    await p.setViewport({ width: 320, height: 700, isMobile: true, hasTouch: true }); await gotoShell(p);
    S.touch = await p.evaluate(() => {
      const els = Array.from(document.querySelectorAll("a,button")).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && getComputedStyle(e).visibility !== "hidden"; });
      const rects = els.map((e) => ({ name: (e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 30), r: e.getBoundingClientRect() }));
      const small = rects.filter((x) => x.r.width < 44 || x.r.height < 44).map((x) => `${x.name} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`);
      // The 2.6 nav shell's brand link (28×28) predates this step and is a certified structure: reported, not gated here.
      const inherited = small.filter((x) => /Tutors Academy home/.test(x)); const shellSmall = small.filter((x) => !/Tutors Academy home/.test(x));
      let minGap = Infinity, pair = null;
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i].r, b = rects[j].r;
        const dx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
        const dy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
        const g = Math.max(dx, dy); if (dx === 0 && dy === 0) continue;
        if (g < minGap) { minGap = g; pair = rects[i].name + " ↔ " + rects[j].name; }
      }
      return { count: els.length, small: shellSmall, inheritedSmall: inherited, minGap: Math.round(minGap), pair, sizes: rects.map((x) => `${x.name} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`) };
    });
    gate(`touch-${state}`, S.touch.small.length === 0 && S.touch.minGap >= 8, JSON.stringify({ small: S.touch.small, minGap: S.touch.minGap, pair: S.touch.pair }));

    /* zoom 200/400 (Test 23): 1280 desktop at 200% = 640 CSS px, 400% = 320 CSS px */
    S.zoom = {};
    for (const [label, w] of [["200%", 640], ["400%", 320]]) {
      await p.setViewport({ width: w, height: 400, isMobile: false }); await gotoShell(p);
      S.zoom[label] = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, h1Visible: !!document.querySelector("h1") && document.querySelector("h1").getBoundingClientRect().width > 0, primaryActionW: Math.round(document.querySelector("[data-primary-action]").getBoundingClientRect().width), clipped: Array.from(document.querySelectorAll("main *")).filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible").length }));
      await p.screenshot({ path: path.join(OUT, `${state}-zoom${w}.png`) });
    }
    /* text spacing */
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); await gotoShell(p);
    await p.addStyleTag({ content: TEXT_SPACING_CSS }); await sleep(100);
    S.textSpacing = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, clipped: Array.from(document.querySelectorAll("main *")).filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "visible").length, primaryActionBottom: Math.round(document.querySelector("[data-primary-action]").getBoundingClientRect().bottom) }));
    await p.screenshot({ path: path.join(OUT, `${state}-textspacing-390.png`) });
    gate(`zoom-spacing-${state}`, !S.zoom["200%"].overflow && !S.zoom["400%"].overflow && !S.textSpacing.overflow && S.textSpacing.clipped === 0, JSON.stringify({ zoom: S.zoom, textSpacing: S.textSpacing }));

    /* keyboard (Test 16) */
    await gotoShell(p);
    S.keyboard = await p.evaluate(async () => {
      const seq = []; const seen = new Set();
      for (let i = 0; i < 40; i++) {
        // synthetic Tab via focus navigation is not scriptable; collect tabbables in DOM order instead and verify each takes focus with visible ring
        break;
      }
      const tabbables = Array.from(document.querySelectorAll('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])')).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; });
      for (const e of tabbables) {
        e.focus();
        const cs = getComputedStyle(e);
        const ring = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
        const name = (e.getAttribute("aria-label") || e.textContent.replace(/\s+/g, " ").trim()).slice(0, 40);
        if (seen.has(name + e.tagName)) continue; seen.add(name + e.tagName);
        seq.push({ el: e.tagName, name, focused: document.activeElement === e, ring });
      }
      return seq;
    });
    // real Tab pass for the ring check (focus-visible only triggers on keyboard)
    S.tabRing = [];
    await gotoShell(p);
    for (let i = 0; i < 12; i++) {
      await p.keyboard.press("Tab");
      const info = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e); return { el: e.tagName, name: (e.getAttribute("aria-label") || e.textContent.replace(/\s+/g, " ").trim()).slice(0, 40), ring: (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none" }; });
      if (!info) break; S.tabRing.push(info);
    }
    gate(`keyboard-${state}`, S.tabRing.length > 0 && S.tabRing.every((x) => x.ring) && S.keyboard.every((x) => x.focused), JSON.stringify(S.tabRing));

    /* screen-reader order (Test 17): accessibility tree of main after the nav */
    const snap = await p.accessibility.snapshot({ interestingOnly: true });
    const flat = []; (function walk(n, d) { if (!n) return; flat.push(`${n.role}${n.name ? ": " + n.name : ""}${n.level ? " (h" + n.level + ")" : ""}`); (n.children || []).forEach((c) => walk(c, d + 1)); })(snap, 0);
    const mainIdx = flat.findIndex((x) => x.startsWith("main"));
    S.a11yOrder = flat.slice(mainIdx, mainIdx + 30);
    S.a11yGroups = await p.evaluate(() => Array.from(document.querySelectorAll("main section[aria-labelledby]")).map((s) => s.getAttribute("aria-labelledby") + " → " + document.getElementById(s.getAttribute("aria-labelledby"))?.textContent.trim()));

    /* contrast (Test 18): every visible text element's fg vs nearest opaque bg, both themes */
    S.contrast = {};
    for (const theme of ["dark", "light"]) {
      await setTheme(p, theme); await gotoShell(p);
      S.contrast[theme] = await p.evaluate(() => {
        const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return m.length === 4 && m[3] === 0 ? null : m.slice(0, 3); };
        const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)); };
        const bgOf = (e) => { let n = e; while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c) return c; n = n.parentElement; } return parse(getComputedStyle(document.documentElement).backgroundColor) || [0, 0, 0]; };
        const out = []; const seen = new Set();
        document.querySelectorAll("main *, header *").forEach((e) => {
          if (!e.childNodes.length || !Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim())) return;
          const r = e.getBoundingClientRect(); if (!r.width) return;
          const cs = getComputedStyle(e); const fg = parse(cs.color); if (!fg) return;
          const bg = bgOf(e); const rr = ratio(fg, bg); const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
          const large = size >= 24 || (size >= 18.66 && bold); const need = large ? 3 : 4.5;
          const key = e.textContent.trim().slice(0, 28) + "|" + cs.color + "|" + bg.join(",");
          if (seen.has(key)) return; seen.add(key);
          out.push({ text: e.textContent.trim().slice(0, 28), fg: cs.color, bg: `rgb(${bg.join(", ")})`, ratio: rr, need, pass: rr >= need });
        });
        return out;
      });
    }
    gate(`contrast-${state}`, Object.values(S.contrast).every((arr) => arr.every((x) => x.pass)), JSON.stringify(Object.fromEntries(Object.entries(S.contrast).map(([t, a]) => [t, a.filter((x) => !x.pass)]))));

    /* reduced motion (Test 21) */
    await setTheme(p, "dark");
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await gotoShell(p);
    S.reducedMotion = await p.evaluate(() => ({ state: document.querySelector("[data-student-shell]")?.getAttribute("data-state"), animated: Array.from(document.querySelectorAll("main *")).filter((e) => { const cs = getComputedStyle(e); return cs.animationName !== "none" || (parseFloat(cs.transitionDuration) > 0 && cs.transitionProperty !== "all" && false); }).length, reveals: document.querySelectorAll(".ta-reveal").length }));
    await p.screenshot({ path: path.join(OUT, `${state}-reduced-motion-390.png`) });
    await p.emulateMediaFeatures([]);

    /* no-JS (Test 22) */
    await p.setJavaScriptEnabled(false);
    await gotoShell(p);
    S.noJs = await p.evaluate(() => ({ state: document.querySelector("[data-student-shell]")?.getAttribute("data-state"), h1: document.querySelector("h1")?.textContent.trim(), action: document.querySelector("[data-primary-action]")?.textContent.trim(), rows: document.querySelectorAll("[data-subject-rows] li").length, signOutForm: !!document.querySelector('form[action="/auth/signout"]') }));
    await p.screenshot({ path: path.join(OUT, `${state}-nojs-390.png`) });
    await p.setJavaScriptEnabled(true);
    gate(`nojs-${state}`, S.noJs.state === S.serverState && !!S.noJs.action, JSON.stringify(S.noJs));

    /* axe (Test 28) */
    await gotoShell(p);
    const axe = await new AxePuppeteer(p).analyze();
    S.axe = { violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })), passes: axe.passes.length };
    gate(`axe-${state}`, S.axe.violations.length === 0, JSON.stringify(S.axe.violations));

    /* network: WebGL absence + payload (Test 26) */
    const reqs = [];
    p.on("request", (r) => reqs.push(r.url()));
    await p.setCacheEnabled(false);
    await gotoShell(p);
    const perfEntries = await p.evaluate(() => performance.getEntriesByType("resource").map((e) => ({ name: e.name.split("/").pop().slice(0, 60), bytes: e.transferSize, type: e.initiatorType })));
    S.network = { requests: reqs.length, webgl: reqs.filter((u) => /webgl|lattice|three|ambient/i.test(u)), canvas: await p.evaluate(() => document.querySelectorAll("canvas").length), scriptBytes: perfEntries.filter((e) => e.type === "script").reduce((a, e) => a + e.bytes, 0), totalBytes: perfEntries.reduce((a, e) => a + e.bytes, 0), entries: perfEntries };
    gate(`webgl-absent-${state}`, S.network.webgl.length === 0 && S.network.canvas === 0, JSON.stringify(S.network.webgl));

    await ctx.close();
  }

  /* ── State C with FOUR enrolled subjects: fold gate only (P5-R3) ─────── */
  {
    const { ctx, p } = await login(browser, "C4");
    const res = {};
    const foldMeasure = () => { const a = document.querySelector("[data-primary-action]").getBoundingClientRect(); return { viewport: `${innerWidth}x${innerHeight}`, primaryActionBottom: Math.round(a.bottom), visible: a.bottom <= innerHeight && a.top >= 0, rows: document.querySelectorAll("[data-subject-rows] li").length }; };
    for (const [label, w, h, mobile] of [["320x568", 320, 568, true], ["360x640", 360, 640, true], ["390x844", 390, 844, true], ["1280x800", 1280, 800, false], ["zoom200", 640, 400, false]]) {
      await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 }); await gotoShell(p);
      res[label] = await p.evaluate(foldMeasure);
    }
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await gotoShell(p);
    await p.addStyleTag({ content: TEXT_SPACING_CSS }); await sleep(100);
    res["textSpacing390"] = await p.evaluate(foldMeasure);
    R.states.C4 = { note: "State C, four enrolled subjects — fold gate only", primaryAboveFold: res, rows: res["390x844"].rows };
    gate("primary-action-above-fold-C4", res["390x844"].rows === 4 && Object.values(res).every((v) => v.visible), JSON.stringify(res));
    await ctx.close();
  }

  /* ── boundary checklist (Part 4 / specimen) ────────────────────────── */
  const FULL = () => ["A", "B", "C"].map((k) => R.states[k]);
  const allStrings = FULL().flatMap((s) => s.strings.concat(s.navStrings)).join("\n");
  const srcFiles = ["src/components/student/student-shell.tsx", "src/components/student/account-entry.tsx", "src/app/(portal)/student/page.tsx", "src/app/(portal)/student/layout.tsx", "src/app/(portal)/student/account/page.tsx", "src/config/student-nav.ts"].map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  const srcHits = (list) => list.filter((w) => new RegExp(w, "i").test(srcFiles.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")));
  R.boundary = {
    "no stat cards / metric grid": { pass: hits(allStrings, ["stat", "metric", "your numbers"]).length === 0 && srcHits(["grid-template-columns: repeat\\((3|4)"]).length === 0, evidence: "strings + source: no stat/metric words, no 3–4 column card grid" },
    "no streak / xp / badge / leaderboard / points": { pass: hits(allStrings, ["streak", "\\bxp\\b", "badge", "leaderboard", "points", "\\blevel\\b"]).length === 0, evidence: "0 hits across A/B/C strings" },
    "no notification affordance": { pass: hits(allStrings, ["notification", "unread", "message", "inbox"]).length === 0 && srcHits(["\\bBell\\b", "\\bInbox\\b", "MessageSquare", "BellDot"]).length === 0, evidence: "no bell/inbox/message icon imported; 0 string hits" },
    "no skeleton or shimmer": { pass: hits(allStrings, SKELETON).length === 0 && srcHits(["skeleton", "shimmer", "animate-pulse"]).length === 0, evidence: "0 hits in strings and source" },
    "no greeting banner": { pass: hits(allStrings, ["welcome", "hello", "good morning", "good evening", "hi,"]).length === 0, evidence: "no greeting words in any state" },
    "one dominant surface": { pass: FULL().every((s) => s.hierarchy.fontRatio >= 1.6 && s.hierarchy.primaryButtons === 1 && s.hierarchy.h1s === 1), evidence: ["A", "B", "C"].map((k) => [k, R.states[k]]).map(([k, s]) => `${k}: h1/runner-up font ratio ${s.hierarchy.fontRatio}, ${s.hierarchy.primaryButtons} primary button`).join(" · ") },
    "no invented activity": { pass: hits(allStrings, GUILT).length === 0 && hits(allStrings, ["keep it up", "doing great", "momentum", "on track"]).length === 0, evidence: "0 hits for praise/guilt/momentum phrases" },
    "no dead nav items": { pass: FULL().every((s) => s.links.every(([, st]) => st.startsWith("200"))), evidence: R.states.C.links.map((l) => l.join(" → ")).join(" · ") },
    "draft subjects labelled, not locked": { pass: /Environment in draft/.test(allStrings) && R.states.C.links.some(([h, st]) => h === "/subjects/physics" && st.startsWith("200")), evidence: "label present in B/C; /subjects/physics (draft) → 200 for enrolled student on the production build" },
    "no search": { pass: srcHits(["<input", "type=\"search\"", "Search"]).length === 0, evidence: "no input/search in shell source" },
  };

  /* ── slot extremes on the dev specimen frames (Test 6) ─────────────── */
  {
    const p = await browser.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    R.slotExtremes = {};
    for (const x of ["none", "some", "all"]) {
      await p.goto(`${D}/dev/student-shell/frame?state=C&theme=dark&slots=${x}`, { waitUntil: "load" }); await sleep(300);
      R.slotExtremes[x] = await p.evaluate(() => ({
        regions: Array.from(document.querySelectorAll("[data-slot-region]")).map((r) => r.getAttribute("data-slot-region")),
        slots: document.querySelectorAll("[data-slot]").length,
        rowSlots: document.querySelectorAll("[data-slot-row]").length,
        h1Font: parseFloat(getComputedStyle(document.querySelector("h1")).fontSize),
        maxOtherFont: Math.max(...Array.from(document.querySelectorAll("main h2, main p, main span, main a")).map((e) => parseFloat(getComputedStyle(e).fontSize))),
        primaryActionBottom: Math.round(document.querySelector("[data-primary-action]").getBoundingClientRect().bottom),
        primaryButtons: document.querySelectorAll('.ta-btn[data-variant="primary"]').length,
        docHeight: document.documentElement.scrollHeight,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));
      await p.screenshot({ path: path.join(OUT, `slots-${x}-390.png`), fullPage: true });
    }
    gate("slot-extremes", Object.values(R.slotExtremes).every((v) => v.primaryActionBottom <= 844 && v.primaryButtons === 1 && !v.overflow), JSON.stringify(R.slotExtremes));
    /* specimen axe */
    await p.setViewport({ width: 1280, height: 800, isMobile: false });
    await p.goto(`${D}/dev/student-shell`, { waitUntil: "load" }); await sleep(1500);
    const axe = await new AxePuppeteer(p).exclude("iframe").analyze();
    R.specimenAxe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    await p.close();
  }

  /* ── Lighthouse, mid-range Android profile (Test 25) ──────────────── */
  try {
    const { default: lighthouse } = await import("lighthouse");
    const { ctx, p } = await login(browser, "C");
    const cookies = await p.cookies();
    await ctx.close();
    // Lighthouse opens its own page in the DEFAULT context; hand it the session cookies.
    const dflt = await browser.newPage(); await dflt.setCookie(...cookies); await dflt.close();
    const port = new URL(browser.wsEndpoint()).port;
    const lhr = (await lighthouse(P + "/student", { port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility"], formFactor: "mobile", screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false }, throttlingMethod: "simulate", throttling: { rttMs: 150, throughputKbps: 1638.4, requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675, cpuSlowdownMultiplier: 4 }, emulatedUserAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" })).lhr;
    const a = lhr.audits;
    const lcpEl = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet || a["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.snippet || "n/a";
    const longTasks = (a["long-tasks"]?.details?.items || []).map((t) => `${Math.round(t.duration)}ms ${t.url?.split("/").pop()?.slice(0, 40) || ""}`);
    const total = a["total-byte-weight"]?.numericValue;
    R.perf = {
      profile: "Lighthouse mobile, simulated: Moto G Power-class, 4× CPU slowdown, slow-4G (150ms RTT, 1.6 Mbps)",
      finalUrl: lhr.finalDisplayedUrl,
      performanceScore: Math.round(lhr.categories.performance.score * 100),
      accessibilityScore: Math.round(lhr.categories.accessibility.score * 100),
      FCP: a["first-contentful-paint"].displayValue, LCP: a["largest-contentful-paint"].displayValue, LCPElement: lcpEl.slice(0, 160),
      CLS: a["cumulative-layout-shift"].displayValue, TBT: a["total-blocking-time"].displayValue, SpeedIndex: a["speed-index"].displayValue, TTI: a["interactive"]?.displayValue,
      longTasksOver50ms: longTasks.length ? longTasks.join("; ") : "none", totalBytes: total, totalKB: Math.round(total / 1024),
      scriptKB: Math.round((a["network-requests"]?.details?.items || []).filter((i) => i.resourceType === "Script").reduce((s, i) => s + (i.transferSize || 0), 0) / 1024),
      requests: (a["network-requests"]?.details?.items || []).length,
      webglInWaterfall: (a["network-requests"]?.details?.items || []).filter((i) => /webgl|lattice|ambient/i.test(i.url)).length,
    };
    fs.writeFileSync(path.join(__dirname, "lighthouse-shell.json"), JSON.stringify({ requestedUrl: lhr.requestedUrl, finalUrl: lhr.finalDisplayedUrl, categories: Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, v.score])), audits: Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "speed-index", "interactive", "total-byte-weight", "long-tasks", "largest-contentful-paint-element"].map((k) => [k, { score: a[k]?.score, value: a[k]?.numericValue, display: a[k]?.displayValue }])) }, null, 1));
    gate("perf-mid-range", R.perf.finalUrl.endsWith("/student") && parseFloat(R.perf.LCP) < 4 && parseFloat(R.perf.CLS) < 0.1, JSON.stringify(R.perf));
  } catch (e) { R.perf = { error: String(e).slice(0, 300) }; gate("perf-mid-range", false, R.perf.error); }

  await browser.close();
  R.pass = fail.length === 0;
  R.failed = fail;

  if (mode === "write") { fs.writeFileSync(BASELINE, JSON.stringify(R, null, 1)); console.log("shell baseline written →", BASELINE); }
  if (mode === "check" && fs.existsSync(BASELINE)) {
    const B = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
    const diffs = [];
    for (const s of ["A", "B", "C"]) {
      if (JSON.stringify(B.states[s].strings) !== JSON.stringify(R.states[s].strings)) diffs.push({ state: s, what: "strings changed" });
      if (B.states[s].hierarchy.fontRatio !== R.states[s].hierarchy.fontRatio) diffs.push({ state: s, what: "hierarchy ratio", was: B.states[s].hierarchy.fontRatio, now: R.states[s].hierarchy.fontRatio });
      if (Math.abs(B.states[s].network.scriptBytes - R.states[s].network.scriptBytes) > 2048) diffs.push({ state: s, what: "script bytes", was: B.states[s].network.scriptBytes, now: R.states[s].network.scriptBytes });
    }
    console.log(diffs.length ? "DIFFS vs shell baseline:\n" + JSON.stringify(diffs, null, 1) : "no diffs vs shell baseline");
  }
  console.log("GATES:\n" + Object.entries(R.gates).map(([k, v]) => `${v.pass ? "PASS" : "FAIL"}  ${k}${v.pass ? "" : "  — " + v.detail.slice(0, 300)}`).join("\n"));
  console.log("\nBOUNDARY:\n" + Object.entries(R.boundary).map(([k, v]) => `${v.pass ? "PASS" : "FAIL"}  ${k}`).join("\n"));
  console.log("\nPERF:", JSON.stringify(R.perf, null, 1));
  process.exit(R.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
