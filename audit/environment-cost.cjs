/* THE DECLARED COST (6.5 · P6-R20). The visitor environment pays ONE anon
 * round trip for the room's levers since 6.4 (P6-R10: the same environment
 * for everyone). This script re-measures it and RECORDS it in the
 * environment baseline as `declaredCosts` — a cost with its cause, not drift.
 *   node audit/environment-cost.cjs            (n=8 per viewport, first discarded)
 * Profile: CDP emulation 4× CPU, 150 ms RTT, 1.6 Mbps down (the same as every
 * other perf measurement in audit/). Both viewports: 390×844 and 1280×800. */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const P = process.env.PROD_URL || "http://localhost:3100";
const BASELINE = path.join(__dirname, "environment-baseline.json");
const N = 8;
async function measure(p, url) {
  const cdp = await p.target().createCDPSession(); await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const s = [];
  for (let i = 0; i < N; i++) {
    await p.goto(P + url, { waitUntil: "load" });
    s.push(await p.evaluate(() => new Promise((res) => { const nav = performance.getEntriesByType("navigation")[0]; let lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.renderTime || e.loadTime; }).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => res({ ttfb: Math.round(nav.responseStart), lcp: Math.round(lcp) }), 1200); })));
  }
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const kept = s.slice(1); const sorted = (k) => kept.map((x) => x[k]).sort((a, b) => a - b);
  return { samples: N, discardedWarmUp: 1, kept: kept.length, ttfbMs: sorted("ttfb"), lcpMs: sorted("lcp"), ttfbMedian: sorted("ttfb")[Math.floor(kept.length / 2)], lcpMedian: sorted("lcp")[Math.floor(kept.length / 2)] };
}
(async () => {
  const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const out = {};
  for (const [name, vp] of Object.entries({ "390x844": { width: 390, height: 844, isMobile: true, hasTouch: true }, "1280x800": { width: 1280, height: 800 } })) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); await p.setViewport({ deviceScaleFactor: 1, ...vp });
    out[name] = await measure(p, "/subjects/mathematics"); await ctx.close();
  }
  await b.close();
  const B = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  B.declaredCosts = (B.declaredCosts || []).filter((c) => c.id !== "visitor-environment-levers-read");
  B.declaredCosts.push({
    id: "visitor-environment-levers-read", since: "6.4", ruledAcceptedBy: "P6-R20 (6.5)",
    cause: "ONE anon round trip to environment_settings per environment render (src/lib/environment/settings.ts), run in Promise.all with getIdentity() — in parallel, so the cost is the round trip itself. The visitor path made no DB call before 6.4.",
    before64: { "390x844": { ttfbMs: [15, 36], lcpMs: [260, 300], note: "6.4 BEFORE probe, n=5" } },
    measured: { at: new Date().toISOString(), route: "/subjects/mathematics (visitor)", profile: "CDP 4× CPU · 150 ms RTT · 1.6 Mbps", ...out },
    noCache: "No cross-request cache: a stale room after a tutor saves is a worse defect than the round trip (P6-R20).",
    phase10: "First public page that pays for a write-able setting; static/ISR treatment for the visitor environment is a Phase 10 question. No work now.",
  });
  fs.writeFileSync(BASELINE, JSON.stringify(B, null, 1));
  console.log(JSON.stringify(out, null, 1)); console.log("declared cost recorded →", BASELINE);
})().catch((e) => { console.error(e); process.exit(2); });
