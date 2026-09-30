/* THE STUDENT JOURNEY, MEASURED (Phase 5 · Step 8 — validation gate).
 * Production build (:3100), 390×844, dark (8 pm), Slow-3G emulation (400 kbps / 400 ms RTT), 4× CPU throttle.
 *   FIRST NIGHT — student-e (write account): / → /subjects → environment → Sign in (from the environment) → Begin → /student.
 *   NEXT DAY    — student-c (read-only; NEVER POSTs): sign in → what the shell says → the environment → account.
 *   BLANK WINDOW — how long a client-rendered failure page (notFound(), next#99287) is blank after its document arrives.
 * Reset student-e first:  delete from environment_state / enrolments where student = student-e.
 * Run: node audit/journey.cjs   (writes audit/journey-baseline.json; report-only, no gate — the numbers are the evidence). */
const puppeteer = require("puppeteer");
const P = "http://localhost:3100"; const PASS = "Test-Pass-2026!";
const SLOW3G = { offline: false, download: 400 * 1024 / 8, upload: 400 * 1024 / 8, latency: 400 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function setup(browser, theme = "dark") {
  const ctx = await browser.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
  await p.emulateNetworkConditions(SLOW3G); await p.emulateCPUThrottling(4);
  const cdp = await p.createCDPSession(); await cdp.send("Network.enable");
  const bytes = { total: 0, byType: {} }; cdp.on("Network.loadingFinished", (e) => { bytes.total += e.encodedDataLength; });
  p.on("response", (r) => { const t = r.request().resourceType(); bytes.byType[t] = (bytes.byType[t] || 0) + 1; });
  return { ctx, p, cdp, bytes };
}
const metrics = (p) => p.evaluate(() => new Promise((res) => {
  const nav = performance.getEntriesByType("navigation")[0];
  const paints = Object.fromEntries(performance.getEntriesByType("paint").map((e) => [e.name, Math.round(e.startTime)]));
  let lcp = null; try { const po = new PerformanceObserver((l) => { const e = l.getEntries().pop(); if (e) lcp = Math.round(e.startTime); }); po.observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
  setTimeout(() => res({ ttfb: Math.round(nav.responseStart), domContentLoaded: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fcp: paints["first-contentful-paint"] || null, lcp, h1: document.querySelector("h1")?.textContent?.trim() || null, hscroll: document.documentElement.scrollWidth > innerWidth + 1, primary: document.querySelector("[data-primary-action], [data-threshold] button, main a[href], main button")?.textContent?.trim() || null }), 300);
}));
const step = async (p, name, fn, R) => { const t0 = Date.now(); const out = await fn(); const m = await metrics(p).catch(() => ({})); R.push({ step: name, url: p.url().replace(P, ""), wall: Date.now() - t0, ...m, ...(out || {}) }); console.log(name, JSON.stringify(R[R.length - 1])); };
(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const R = { firstNight: [], nextDay: [], blankWindow: {} };
  /* ── FIRST NIGHT: student-e, never signed in, phone, slow 3G, dark ── */
  { const { ctx, p, bytes } = await setup(browser); const S = R.firstNight;
    await step(p, "1 homepage", () => p.goto(P + "/", { waitUntil: "load" }), S);
    await step(p, "2 subjects", () => p.goto(P + "/subjects", { waitUntil: "load" }), S);
    await step(p, "3 environment (visitor)", () => p.goto(P + "/subjects/mathematics", { waitUntil: "load" }), S);
    await step(p, "4 visitor's way in → /login", async () => { const sel = await p.evaluate(() => { const a = [...document.querySelectorAll("a[href^='/login']")][0]; return a ? a.textContent.trim() : null; }); const visibleInMain = await p.evaluate(() => [...document.querySelectorAll("main a, main button")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((e) => e.textContent.trim() + "→" + (e.getAttribute("href") || "button")));
      const signInVisibleBeforeMenu = await p.evaluate(() => [...document.querySelectorAll("a[href^='/login']")].some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }));
      await p.click("button.ta-nav-trigger"); await sleep(400);
      await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("#nav-shell-menu a[href^='/login']")]); return { linkText: sel, visibleInMain, signInVisibleBeforeMenu, viaMenu: true, context: await p.evaluate(() => document.querySelector("[data-login-context]")?.textContent?.trim() || null) }; }, S);
    await step(p, "5 sign in (typing on a phone)", async () => {
      await p.type("#login-email", "student-e@test.tutorsacademy.invalid"); await p.type("#login-password", PASS);
      const t0 = Date.now(); const inflight = []; const iv = setInterval(async () => { try { inflight.push(await p.evaluate(() => { const b = document.querySelector("form button[type=submit]"); return b ? [b.textContent.trim(), b.disabled] : null; })); } catch {} }, 250);
      await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("form button[type=submit]")]); clearInterval(iv);
      return { submitToArrive: Date.now() - t0, inflightSeen: [...new Set(inflight.map((x) => JSON.stringify(x)))] }; }, S);
    if (!(await p.$("[data-threshold] button"))) {
      // landed somewhere other than the environment: follow the page's own primary action back to Mathematics (this IS the journey cost)
      await step(p, "5b detour: follow the primary action", async () => { await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("[data-primary-action]")]); }, S);
      await step(p, "5c detour: open Mathematics again", () => p.goto(P + "/subjects/mathematics", { waitUntil: "load" }), S);
    }
    await step(p, "6 Begin Mathematics (POST, slow 3G)", async () => { const t0 = Date.now(); const seen = []; const iv = setInterval(async () => { try { seen.push(await p.evaluate(() => { const b = document.querySelector("[data-threshold] button"); return b ? [b.textContent.trim(), b.disabled, !!document.querySelector("[data-action-outcome]")] : "gone"; })); } catch {} }, 250); await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("[data-threshold] button")]); clearInterval(iv); return { clickToArrive: Date.now() - t0, inflightSeen: [...new Set(seen.map((x) => JSON.stringify(x)))], arc: await p.evaluate(() => [...document.querySelectorAll("[data-arc-step]")].map((e) => e.getAttribute("data-arc-step") + ":" + e.getAttribute("data-state")).join(" ")), text: await p.evaluate(() => document.querySelector("main")?.innerText.replace(/\s+/g, " ").slice(0, 600)) }; }, S);
    await step(p, "7 back to /student", () => p.goto(P + "/student", { waitUntil: "load" }), S);
    S.push({ step: "bytes (whole first night)", encodedKB: Math.round(bytes.total / 1024), requestsByType: bytes.byType });
    await ctx.close(); }
  /* ── NEXT DAY: student-c (physics entered yesterday; read-only account) ── */
  { const { ctx, p, bytes } = await setup(browser); const S = R.nextDay;
    await p.goto(P + "/login", { waitUntil: "load" }); await p.type("#login-email", "student-c@test.tutorsacademy.invalid"); await p.type("#login-password", PASS);
    await step(p, "1 sign in → /student (returning)", async () => { await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.click("form button[type=submit]")]); return { text: await p.evaluate(() => document.querySelector("main")?.innerText.replace(/\s+/g, " ").slice(0, 700)) }; }, S);
    await step(p, "2 the primary action (read only — never POST as student-c): GET the environment", async () => { const form = await p.evaluate(() => { const f = document.querySelector("main form"); return f ? { action: f.getAttribute("action"), method: f.getAttribute("method"), button: f.querySelector("button")?.textContent?.trim() } : null; }); await p.goto(P + "/subjects/physics", { waitUntil: "load" }); return { primaryForm: form, arc: await p.evaluate(() => [...document.querySelectorAll("[data-arc-step]")].map((e) => e.getAttribute("data-arc-step") + ":" + e.getAttribute("data-state")).join(" ")), text: await p.evaluate(() => document.querySelector("main")?.innerText.replace(/\s+/g, " ").slice(0, 700)) }; }, S);
    await step(p, "3 /student/account", () => p.goto(P + "/student/account", { waitUntil: "load" }), S);
    S.push({ step: "bytes (next day)", encodedKB: Math.round(bytes.total / 1024), requestsByType: bytes.byType });
    await ctx.close(); }
  /* ── BLANK WINDOW: on slow 3G, how long is a client-rendered failure page (notFound → #99287) blank, vs a server-rendered one? ── */
  { const { ctx, p } = await setup(browser);
    const probe = async (url) => { const t0 = Date.now(); let firstByte = null; const onResp = (r) => { if (r.url() === P + url && firstByte === null) firstByte = Date.now() - t0; }; p.on("response", onResp);
      const nav = p.goto(P + url, { waitUntil: "domcontentloaded" }).catch(() => null); let h1At = null; for (let i = 0; i < 400; i++) { await sleep(100); const has = await p.evaluate(() => !!document.querySelector("h1")).catch(() => false); if (has) { h1At = Date.now() - t0; break; } }
      await nav; p.off("response", onResp); const dcl = await p.evaluate(() => Math.round(performance.getEntriesByType("navigation")[0]?.domContentLoadedEventEnd || 0)).catch(() => null);
      return { url, msFirstByte: firstByte, msDomContentLoaded: dcl, msH1: h1At, blankAfterDocumentMs: h1At !== null && dcl !== null ? Math.max(0, h1At - dcl) : null }; };
    R.blankWindow = { notFoundCall: await probe("/subjects/nonsense"), unmatched: await probe("/no/such/route"), note: "notFound() pages are client-rendered (next#99287): the honest 404 appears only after the JS arrives; the unmatched route is in the HTML" };
    console.log("blank", JSON.stringify(R.blankWindow)); await ctx.close(); }
  require("fs").writeFileSync(require("path").join(__dirname, "journey-baseline.json"), JSON.stringify(R, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
