/* ════════════════════════════════════════════════════════════════════════
   FULL-PAGE AUDIT — THE PHASE 4 GATE (Phase 4 · Step 9)

   The per-scene sweeps (scene-enter / scenes-practice / scene-promise /
   scene-return) verified scenes in isolation. This is the whole-page mode
   of the same harness family: it scrolls `/` end to end and captures, per
   scene and for the page, the things only the seams can show.

   Usage (dev server on :3000 for /dev/* routes, prod on :3100 for `/`):
     NODE_PATH=./node_modules node audit/page.cjs --write   # regenerate audit/baseline.json
     NODE_PATH=./node_modules node audit/page.cjs --check   # re-run + diff vs baseline, exit 1 on gate FAIL/regression
     NODE_PATH=./node_modules node audit/page.cjs           # run + print, no write

   Gate rules (page-level pass/fail):
     G1 contrast   — every sampled text/surface pair ≥ 4.5:1 (large text ≥ 3:1), both themes
     G2 primaries  — at no scroll position is more than ONE primary-styled action visible in the page body
     G3 scroll     — page actual scroll total ≤ PAGE_SCROLL_CEILING (12vh); per-scene overrun is a WARN (defect, recorded)
     G4 links      — every link on `/` resolves 2xx/3xx and every hash target exists
     G5 outline    — exactly one h1; no skipped heading levels
     G6 a11y       — axe: zero serious/critical violations in either theme
     G7 motion     — no long task > 50ms during a fast skim; no reveal left hidden after a second pass
     G8 cls        — CLS across a complete scroll ≤ 0.1
   ════════════════════════════════════════════════════════════════════════ */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { AxePuppeteer } = require("@axe-core/puppeteer");

const P = process.env.PROD_URL || "http://localhost:3100";
const D = process.env.DEV_URL || "http://localhost:3000";
const ROOT = path.join(__dirname, "..");
const BASELINE = path.join(__dirname, "baseline.json");
const OUT = process.env.SHOTS || "/home/user/shots23";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : "run";

/* subject accents from config (the harness may read config; components may not) */
const subjectsSrc = fs.readFileSync(path.join(ROOT, "src/lib/subjects/subjects.ts"), "utf8");
const ACCENTS = [...subjectsSrc.matchAll(/(ink|ivory):\s*"(#[0-9a-fA-F]{6})"/g)].map((m) => m[2].toLowerCase());
const spineSrc = fs.readFileSync(path.join(ROOT, "src/lib/spine/scenes.ts"), "utf8");
const DECLARED = {};
for (const m of spineSrc.matchAll(/id:\s*"(\w+)",[\s\S]*?status:\s*"(\w+)",\s*scrollBehaviour:\s*"([\w-]+)",\s*(?:\/\*[\s\S]*?\*\/\s*)?scrollBudget:\s*([\d.]+)/g)) DECLARED[m[1]] = { status: m[2], behaviour: m[3], budget: +m[4] };
const CEILING = +(spineSrc.match(/PAGE_SCROLL_CEILING\s*=\s*([\d.]+)/) || fs.readFileSync(path.join(ROOT, "src/lib/spine/types.ts"), "utf8").match(/PAGE_SCROLL_CEILING\s*=\s*([\d.]+)/))[1];

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const ACCENT_RGB = ACCENTS.map((h) => "rgb(" + hexToRgb(h).join(", ") + ")");

(async () => {
  const b = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  /* DECLARATION CORRECTIONS — a record of diffs, not results. The failure stays
     visible here even though the check is green. One-time rule (D-08, 4.9):
     retroactive corrections are permitted ONLY where the declaration predates
     the geometry it describes; no future overrun may be settled this way. */
  const CORRECTIONS = [
    { scene: "choice", field: "scrollBudget", from: 1.2, to: 1.4, step: "4.9 (D-08)", measuredWhenCorrected: { "1280x800": 1.39, "390x844": 1.73 }, reason: "Declared in 4.1 against the skeleton; the 4.4 amendment mandated the six-door colonnade (floor ≈982px > 960px), making 1.2 unreachable without degrading touch/reading targets. Disclosed by 4.4 §12 at the time.", oneTimeOnly: true },
  ];
  const R = { generatedAt: new Date().toISOString(), ceiling: CEILING, declared: DECLARED, corrections: CORRECTIONS, correctionPolicy: "ONE-TIME. A declaration may be corrected retroactively only where it predates the geometry it describes. Every later scope change updates its declaration when it lands; an overrun found by this harness after 4.9 is a defect in the scene, never in the declaration.", gate: {}, warnings: [] };
  const newPage = async (o = {}) => {
    const p = await b.newPage();
    await p.setViewport({ width: o.w || 1280, height: o.h || 800, deviceScaleFactor: 1, isMobile: !!o.mobile, hasTouch: !!o.mobile });
    if (o.rm) await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    p._hyd = [];
    p.on("console", (m) => { const t = m.text(); if (/hydrat|did not match|Warning:|error/i.test(t)) p._hyd.push(t.slice(0, 160)); });
    return p;
  };
  const home = async (p, theme, base = P) => {
    await p.goto(base + "/", { waitUntil: "networkidle0" });
    await p.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
    if (theme) await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  };

  /* Browser-side helpers, injected as a string so the same code runs per theme. */
  const HELPERS = `
    window.__lum=(rgb)=>{const m=rgb.match(/[\\d.]+/g).map(Number);const c=m.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    window.__contrast=(a,b)=>{const x=__lum(a),y=__lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    window.__bg=(el)=>{let e=el;while(e){const c=getComputedStyle(e).backgroundColor;if(c&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(c))return c;e=e.parentElement}return getComputedStyle(document.body).backgroundColor||'rgb(255,255,255)'};
    window.__textEls=(root)=>[...root.querySelectorAll('h1,h2,h3,p,a,button,span,li,td,th,label,dt,dd')].filter(e=>{const t=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());const cs=getComputedStyle(e);return t&&cs.visibility!=='hidden'&&cs.display!=='none'&&e.getBoundingClientRect().height>0});
    window.__isPrimary=(e)=>/bg-surface-brand|bg-brand-600|ta-btn--primary/.test(e.className)||e.matches('[data-return-action]')||(/primary/.test(e.className)&&/outline|ghost|secondary/.test(e.className)===false);
  `;

  /* ── 1. PER-SCENE CAPTURE, both themes ─────────────────────────────── */
  R.scenes = {};
  R.consistency = {};
  for (const theme of ["dark", "light"]) {
    const p = await newPage();
    await home(p, theme);
    await p.evaluate(HELPERS);
    await p.evaluate(() => {
      window.__shifts = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shifts.push({ v: e.value, nodes: (e.sources || []).map((s) => { const n = s.node; const sc = n && n.nodeType === 1 ? n.closest("section[data-scene]") : null; return sc ? sc.getAttribute("data-scene") : n ? (n.closest && n.closest("footer") ? "footer" : n.closest && n.closest("header") ? "header" : "other") : "other"; }) }); }).observe({ type: "layout-shift", buffered: true });
      window.__lcp = null;
      new PerformanceObserver((l) => { const e = l.getEntries().pop(); if (e) window.__lcp = { t: Math.round(e.startTime), el: e.element ? e.element.tagName + (e.element.id ? "#" + e.element.id : "") : "?" }; }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    // scroll end to end slowly
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= H; y += 200) { await p.evaluate((v) => scrollTo(0, v), y); await sleep(30); }
    await sleep(400);
    const data = await p.evaluate((ACCENT_RGB) => {
      const out = {};
      const secs = [...document.querySelectorAll("section[data-scene]")];
      const allSizes = {};
      for (const s of secs) {
        const id = s.getAttribute("data-scene");
        const r = s.getBoundingClientRect();
        const content = s.querySelector("[data-scene-content], :scope > div") || s.firstElementChild;
        const texts = __textEls(s);
        const pairs = {};
        for (const e of texts) {
          const cs = getComputedStyle(e);
          const fg = cs.color, bg = __bg(e);
          const size = parseFloat(cs.fontSize), weight = +cs.fontWeight || 400;
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          const key = fg + "|" + bg + "|" + (large ? "L" : "N");
          if (!pairs[key]) pairs[key] = { fg, bg, large, ratio: +__contrast(fg, bg).toFixed(2), sample: (e.textContent || "").trim().slice(0, 40), tag: e.tagName, count: 0 };
          pairs[key].count++;
        }
        const sizes = {};
        for (const e of texts) { const fs = getComputedStyle(e).fontSize; sizes[fs] = (sizes[fs] || 0) + 1; allSizes[fs] = (allSizes[fs] || new Set()); allSizes[fs].add(id); }
        const headings = [...s.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.tagName + ":" + (h.textContent || "").trim().slice(0, 50));
        const treatment = texts.filter((e) => /in foundation|not built|live today|system state|not yet available|ahead$|done, on this page/i.test(e.textContent || "")).map((e) => ({ tag: e.tagName, text: (e.textContent || "").trim().slice(0, 60), mono: /mono/i.test(getComputedStyle(e).fontFamily), size: getComputedStyle(e).fontSize, upper: getComputedStyle(e).textTransform === "uppercase" }));
        const accent = [...s.querySelectorAll("*")].filter((e) => { const cs = getComputedStyle(e); return ACCENT_RGB.includes(cs.color) || ACCENT_RGB.includes(cs.backgroundColor) || ACCENT_RGB.includes(cs.borderTopColor) && cs.borderTopWidth !== "0px" || ACCENT_RGB.includes(cs.stroke) || ACCENT_RGB.includes(cs.fill); }).length;
        const focusables = [...s.querySelectorAll("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter((e) => !e.disabled);
        const cs = getComputedStyle(s);
        const first = s.firstElementChild ? getComputedStyle(s.firstElementChild) : cs;
        out[id] = {
          extentPx: Math.round(r.height), extentVh: +(r.height / innerHeight).toFixed(2), contentVh: +((content ? content.getBoundingClientRect().height : r.height) / innerHeight).toFixed(2),
          top: Math.round(r.top + scrollY), behaviour: s.getAttribute("data-scroll"), sticky: [...s.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "sticky").length,
          headings, pairs: Object.values(pairs), sizes, treatment, accentElements: accent, subjectScoped: s.querySelectorAll("[data-subject]").length,
          focusables: focusables.map((e) => ({ tag: e.tagName, text: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30), href: e.getAttribute("href"), primary: __isPrimary(e), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })),
          spacing: { minHeight: cs.minHeight, height: cs.height, justify: cs.justifyContent, paddingTop: first.paddingTop, paddingBottom: first.paddingBottom, borderBottom: getComputedStyle(s.parentElement).borderBottomWidth },
          words: (() => { const c = s.cloneNode(true); c.querySelectorAll("style,script,noscript,template,[data-scene-meta]").forEach((n) => n.remove()); return (c.textContent || "").trim().split(/\s+/).filter(Boolean).length; })(),
          motifs: (() => { const per = [...s.querySelectorAll("[data-motif]")].map((m) => ({ commands: [...m.querySelectorAll("path")].reduce((a, p) => a + ((p.getAttribute("d") || "").match(/[MLHVCSQTAZ]/gi) || []).length, 0), dom: m.querySelectorAll("*").length })); return { surfaces: per.length, commands: per.reduce((a, x) => a + x.commands, 0), dom: per.reduce((a, x) => a + x.dom, 0), maxCommands: Math.max(0, ...per.map((x) => x.commands)), maxDom: Math.max(0, ...per.map((x) => x.dom)) }; })(),
        };
      }
      const cls = {}; let clsTotal = 0;
      for (const sh of window.__shifts) { clsTotal += sh.v; const k = sh.nodes[0] || "other"; cls[k] = +((cls[k] || 0) + sh.v).toFixed(4); }
      const sizesBy = {}; for (const k in allSizes) sizesBy[k] = [...allSizes[k]];
      return { scenes: out, cls: { total: +clsTotal.toFixed(4), byScene: cls }, lcp: window.__lcp, sizesBy, h1: document.querySelectorAll("h1").length, outline: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]), landmarks: [...document.querySelectorAll("header,nav,main,footer,[role=region],section[aria-labelledby]")].map((e) => e.tagName.toLowerCase() + (e.getAttribute("aria-label") ? "[" + e.getAttribute("aria-label") + "]" : e.getAttribute("aria-labelledby") ? "[by " + e.getAttribute("aria-labelledby") + "]" : "")), pageH: document.documentElement.scrollHeight, footer: { h: Math.round(document.querySelector("footer").getBoundingClientRect().height), insideSpine: !!document.querySelector("[data-spine] footer") } };
    }, ACCENT_RGB);
    // focus visibility for every focusable on the page
    const focus = await p.evaluate(() => {
      const els = [...document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter((e) => !e.disabled && e.getBoundingClientRect().width > 0);
      return els.map((e) => { e.focus({ preventScroll: true }); const cs = getComputedStyle(e); const vis = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== "none"); const sc = e.closest("section[data-scene]"); return { where: sc ? sc.getAttribute("data-scene") : e.closest("footer") ? "footer" : "header", text: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 28), visible: vis, ring: cs.outlineStyle + " " + cs.outlineWidth }; });
    });
    // axe per scene
    const axe = await new AxePuppeteer(p).analyze();
    const violations = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, where: [...new Set(v.nodes.map((n) => { const s = n.html.match(/data-scene="?(\w+)/); return n.target.join(" ").slice(0, 60); }))].slice(0, 4) }));
    R.scenes[theme] = data.scenes;
    R.consistency[theme] = { cls: data.cls, lcp: data.lcp, sizesBy: data.sizesBy, h1: data.h1, outline: data.outline, landmarks: data.landmarks, pageH: data.pageH, footer: data.footer, focus, axe: violations, hydration: p._hyd };
    await p.close();
  }

  /* ── 2. PRIMARY VISIBILITY AT EVERY SCROLL POSITION ─────────────────── */
  {
    const p = await newPage();
    await home(p, "dark");
    await p.evaluate(HELPERS);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    const rows = [];
    for (let y = 0; y <= H; y += 100) {
      await p.evaluate((v) => scrollTo(0, v), y);
      await sleep(15);
      rows.push(await p.evaluate((y) => {
        const els = [...document.querySelectorAll("a,button")].filter((e) => __isPrimary(e)).filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && getComputedStyle(e).visibility !== "hidden" && +getComputedStyle(e).opacity > 0.5; });
        return { y, body: els.filter((e) => !e.closest("header")).map((e) => (e.textContent || "").trim() + "@" + (e.closest("section")?.getAttribute("data-scene") || "footer")), header: els.filter((e) => e.closest("header")).length };
      }, y));
    }
    const bad = rows.filter((r) => r.body.length > 1);
    R.primaries = { positions: rows.length, perPosition: rows.map((r) => ({ y: r.y, body: r.body.length, header: r.header })), maxBodyPrimaries: Math.max(...rows.map((r) => r.body.length)), violations: bad.slice(0, 5), headerAlwaysHas: rows.every((r) => r.header >= 1), seen: [...new Set(rows.flatMap((r) => r.body))] };
    // CTA inventory
    R.ctas = await p.evaluate(() => [...document.querySelectorAll("main a[href],main button")].map((e) => ({ scene: e.closest("section")?.getAttribute("data-scene") || "footer", label: (e.textContent || "").trim() || e.getAttribute("aria-label"), aria: e.getAttribute("aria-label"), href: e.getAttribute("href"), variant: __isPrimary(e) ? "primary" : /outline|ta-btn--outline/.test(e.className) ? "outline" : /btn|ta-btn/.test(e.className) ? "button" : "link", tag: e.tagName })));
    R.footerLinks = await p.evaluate(() => [...document.querySelectorAll("footer a[href]")].map((a) => ({ scene: "footer", label: (a.getAttribute("aria-label") || a.textContent || "").trim(), href: a.getAttribute("href"), variant: "link" })));
    R.headerLinks = await p.evaluate(() => [...document.querySelectorAll("header a[href]")].map((a) => ({ label: (a.getAttribute("aria-label") || a.textContent || "").trim(), href: a.getAttribute("href") })));
    await p.close();
  }

  /* ── 3. LINK RESOLUTION ──────────────────────────────────────────────── */
  {
    const p = await newPage();
    const all = [...R.ctas.filter((c) => c.href), ...R.footerLinks, ...R.headerLinks.map((h) => ({ ...h, scene: "header" }))];
    const seen = new Map();
    for (const l of all) {
      if (seen.has(l.href)) continue;
      const url = l.href.startsWith("#") ? P + "/" + l.href : l.href.startsWith("/") ? P + l.href : l.href;
      const [pathPart, hash] = url.split("#");
      try {
        const r = await p.goto(pathPart, { waitUntil: "load" });
        const anchor = hash ? await p.evaluate((id) => !!document.getElementById(id), hash) : null;
        seen.set(l.href, { href: l.href, status: r.status(), anchor, ok: r.status() < 400 && anchor !== false });
      } catch (e) { seen.set(l.href, { href: l.href, status: "ERR", ok: false }); }
    }
    R.links = [...seen.values()];
    await p.close();
  }

  /* ── 4. SECOND PASS ──────────────────────────────────────────────────── */
  {
    const p = await newPage();
    await home(p, "dark");
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    const pass = async () => { for (let y = 0; y <= H; y += 250) { await p.evaluate((v) => scrollTo(0, v), y); await sleep(40); } };
    await pass(); await sleep(800);
    await p.evaluate(() => scrollTo(0, 0)); await sleep(300);
    const before = await p.evaluate(() => ({ hidden: [...document.querySelectorAll(".ta-reveal, .ta-stagger > *")].filter((e) => +getComputedStyle(e).opacity < 1).length, revealTotal: document.querySelectorAll(".ta-reveal,.ta-stagger").length }));
    await pass(); await sleep(600);
    const second = await p.evaluate(() => {
      const hidden = [...document.querySelectorAll(".ta-reveal, .ta-stagger > *, .ta-stagger")].filter((e) => +getComputedStyle(e).opacity < 1).map((e) => e.closest("section")?.getAttribute("data-scene"));
      const enter = document.querySelector("[data-scene=enter]");
      return { hiddenAfterSecondPass: hidden, beatsVisible: [...document.querySelectorAll("[data-beat]")].every((e) => +getComputedStyle(e).opacity === 1), markersVisible: [...document.querySelectorAll("[data-marker]")].every((e) => +getComputedStyle(e).opacity === 1), markerStates: [...document.querySelectorAll("[data-marker]")].map((m) => m.getAttribute("data-state")).join(","), enterLayers: enter.querySelectorAll("[data-switch-layer]").length, enterName: enter.querySelector("[data-enter-name]")?.textContent, emptyContainers: [...document.querySelectorAll("section[data-scene]")].filter((s) => (s.textContent || "").trim().length < 20).map((s) => s.getAttribute("data-scene")) };
    });
    // re-enter Scene 4 from below
    await p.evaluate(() => document.querySelector("[data-scene=people]").scrollIntoView()); await sleep(200);
    const enterTop = await p.evaluate(() => document.querySelector("[data-scene=enter]").getBoundingClientRect().top + scrollY);
    for (let y = enterTop + 1400; y >= enterTop - 200; y -= 150) { await p.evaluate((v) => scrollTo(0, v), y); await sleep(40); }
    await sleep(500);
    const reenter = await p.evaluate(() => { const enter = document.querySelector("[data-scene=enter]"); const st = enter.querySelector("[style*='sticky'],[data-enter-stage]") || enter.firstElementChild; const cs = getComputedStyle(st); return { layers: enter.querySelectorAll("[data-switch-layer]").length, stagePosition: cs.position, name: enter.querySelector("[data-enter-name]")?.textContent, cta: enter.querySelector("[data-enter-cta]")?.textContent?.trim(), tier: enter.querySelector("[data-enter]")?.getAttribute("data-enter-tier") }; });
    R.secondPass = { firstPassHiddenAtTop: before.hidden, revealContainers: before.revealTotal, ...second, reenterFromBelow: reenter };
    await p.screenshot({ path: `${OUT}/second-pass-enter.png` });
    await p.close();
  }

  /* ── 5. FAST SKIM ────────────────────────────────────────────────────── */
  {
    const p = await newPage();
    await home(p, "dark");
    await p.evaluate(() => { window.__frames = []; let last = -1; const rec = () => { const n = performance.now(); if (last >= 0) window.__frames.push(n - last); last = n; requestAnimationFrame(rec); }; requestAnimationFrame(rec); window.__long = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ entryTypes: ["longtask"] }); } catch { } window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    // fling: 12 steps of ~750px at 16ms
    for (let y = 0; y <= H; y += 750) { await p.evaluate((v) => scrollTo(0, v), y); await sleep(16); }
    await sleep(120);
    const midSettle = await p.evaluate(() => ({ animating: [...document.querySelectorAll(".ta-reveal,.ta-stagger > *")].filter((e) => { const o = +getComputedStyle(e).opacity; return o > 0 && o < 1; }).length }));
    // keyboard End, Home, End
    await p.keyboard.press("End"); await sleep(80); await p.keyboard.press("Home"); await sleep(80); await p.keyboard.press("End"); await sleep(700);
    const after = await p.evaluate(() => { const enter = document.querySelector("[data-scene=enter]"); return { y: scrollY, atBottom: Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight) < 3, hiddenLeft: [...document.querySelectorAll(".ta-reveal,.ta-stagger > *")].filter((e) => +getComputedStyle(e).opacity < 1).map((e) => e.closest("section")?.getAttribute("data-scene")), enterLayers: enter.querySelectorAll("[data-switch-layer]").length, enterStickyOffscreen: enter.getBoundingClientRect().bottom < 0, frames: { n: window.__frames.length, avg: +(window.__frames.reduce((a, b) => a + b, 0) / window.__frames.length).toFixed(1), worst: +Math.max(...window.__frames).toFixed(1), over50: window.__frames.filter((f) => f > 50).length, over33: window.__frames.filter((f) => f > 33).length }, long: window.__long, cls: +window.__cls.toFixed(4) }; });
    R.skim = { midFlingAnimating: midSettle.animating, ...after };
    await p.screenshot({ path: `${OUT}/skim-settled.png` });
    await p.close();
  }

  /* ── 6. PAYLOAD / WEBGL / NO-JS / RM / MOBILE / ZOOM / SPACING / SLOW-3G ── */
  {
    const p = await newPage();
    const reqs = [];
    const pending = [];
    p.on("response", (r) => { const rec = { u: r.url().replace(P, ""), len: 0, type: r.headers()["content-type"] || "" }; reqs.push(rec); pending.push(r.buffer().then((b) => { rec.len = b.length; }).catch(() => { })); });
    await home(p);
    await Promise.all(pending); // len = uncompressed body bytes (prod serves chunked/gzip, so content-length is absent)
    R.payload = { requests: reqs.length, bytes: reqs.reduce((a, r) => a + r.len, 0), js: reqs.filter((r) => /javascript/.test(r.type)).reduce((a, r) => a + r.len, 0), webgl: reqs.filter((r) => /three|webgl|ambient/i.test(r.u)).map((r) => r.u), canvas: await p.evaluate(() => document.querySelectorAll("canvas").length), chunks: reqs.filter((r) => /_next\/static\/chunks/.test(r.u)).map((r) => r.u.split("/").pop() + ":" + r.len) };
    await p.close();

    const nj = await newPage(); await nj.setJavaScriptEnabled(false); await nj.goto(P + "/", { waitUntil: "networkidle0" });
    R.noJs = await nj.evaluate(() => ({ scenes: [...document.querySelectorAll("section[data-scene]")].map((s) => s.getAttribute("data-scene") + ":" + (s.textContent || "").trim().split(/\s+/).length + "w"), hiddenByMotion: [...document.querySelectorAll("*")].filter((e) => +getComputedStyle(e).opacity === 0).length, links: document.querySelectorAll("main a[href]").length, footer: !!document.querySelector("footer") }));
    await nj.screenshot({ path: `${OUT}/nojs-full.png`, fullPage: true }); await nj.close();

    const rm = await newPage({ rm: true }); await home(rm, "dark");
    const Hh = await rm.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= Hh; y += 400) { await rm.evaluate((v) => scrollTo(0, v), y); await sleep(20); }
    R.reducedMotion = await rm.evaluate(() => ({ motionClasses: document.querySelectorAll(".ta-reveal,.ta-stagger").length, hidden: [...document.querySelectorAll("section[data-scene] *")].filter((e) => +getComputedStyle(e).opacity === 0 && e.getBoundingClientRect().height > 0).length, order: [...document.querySelectorAll("section[data-scene]")].map((s) => s.getAttribute("data-scene")).join(">") }));
    await rm.close();

    const m = await newPage({ w: 390, h: 844, mobile: true }); await home(m, "dark");
    R.mobile = await m.evaluate(() => ({ pageH: document.documentElement.scrollHeight, screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, scenes: [...document.querySelectorAll("section[data-scene]")].map((s) => [s.getAttribute("data-scene"), +(s.getBoundingClientRect().height / innerHeight).toFixed(2)]) }));
    await m.screenshot({ path: `${OUT}/mobile-390-full.png`, fullPage: true });
    await m.setViewport({ width: 320, height: 700, isMobile: true, hasTouch: true }); await sleep(300);
    R.touch = await m.evaluate(() => [...document.querySelectorAll("main a[href],main button,footer a[href]")].map((e) => { const r = e.getBoundingClientRect(); return { where: e.closest("section")?.getAttribute("data-scene") || "footer", text: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), ok: r.width >= 44 && r.height >= 44 }; }));
    R.touch320overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    await m.close();

    const z = await newPage({ w: 320, h: 200 }); await home(z, "dark"); // 400% of 1280×800
    R.zoom400 = await z.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, clipped: [...document.querySelectorAll("main p,main a,main h1,main h2,main h3,footer a,footer p")].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => (e.closest("section")?.getAttribute("data-scene") || "footer") + ":" + (e.textContent || "").trim().slice(0, 20)) }));
    await z.setViewport({ width: 640, height: 400 }); await sleep(200);
    R.zoom200 = await z.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    await z.setViewport({ width: 1280, height: 800 });
    await z.evaluate(() => { const s = document.createElement("style"); s.textContent = "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}"; document.head.appendChild(s); }); await sleep(300);
    R.textSpacing = await z.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, clipped: [...document.querySelectorAll("main *,footer *")].filter((e) => e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 2).map((e) => (e.closest("section")?.getAttribute("data-scene") || "chrome") + ":" + e.textContent.trim().slice(0, 20)).slice(0, 8) }));
    await z.close();

    const g = await newPage(); await home(g, "dark"); await g.evaluate(() => (document.documentElement.style.filter = "grayscale(1)"));
    await g.evaluate(() => document.querySelector("[data-scene=choice]").scrollIntoView()); await sleep(300); await g.screenshot({ path: `${OUT}/gray-choice.png` });
    await g.evaluate(() => document.querySelector("[data-scene=promise]").scrollIntoView()); await sleep(300); await g.screenshot({ path: `${OUT}/gray-promise.png` }); await g.close();

    // slow 3G
    const s3 = await newPage();
    const cdp = await s3.target().createCDPSession(); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
    const t0 = Date.now(); const nav = s3.goto(P + "/", { waitUntil: "load" });
    await sleep(2500); const at2 = await s3.evaluate(() => ({ h1: !!document.querySelector("h1"), text: (document.body?.innerText || "").length, fontsSettled: document.fonts ? document.fonts.status : "?" })).catch(() => ({ h1: false }));
    await s3.screenshot({ path: `${OUT}/slow3g-2500ms.png` }).catch(() => { });
    await nav; const loadMs = Date.now() - t0;
    const usable = await s3.evaluate(() => ({ h1: !!document.querySelector("h1"), ctas: document.querySelectorAll("[data-arrival-cta] a").length, hidden: [...document.querySelectorAll("section[data-scene] *")].filter((e) => +getComputedStyle(e).opacity === 0).length }));
    R.slow3g = { at2500ms: at2, loadMs, afterLoad: usable };
    await s3.close();
  }

  /* ── 7. DEV ROUTES gated + hydration ─────────────────────────────────── */
  {
    const routes = fs.readdirSync(path.join(ROOT, "src/app/dev")).filter((d) => fs.existsSync(path.join(ROOT, "src/app/dev", d, "page.tsx"))).map((d) => "/dev/" + d);
    const p = await newPage();
    R.devRoutes = [];
    for (const r of routes) {
      const prod = await p.goto(P + r, { waitUntil: "load" }).then((x) => x.status()).catch(() => "ERR");
      p._hyd = [];
      const dev = await p.goto(D + r, { waitUntil: "load" }).then((x) => x.status()).catch(() => "ERR");
      await sleep(600);
      let axeCount = null; try { const a = await new AxePuppeteer(p).analyze(); axeCount = a.violations.map((v) => v.id + ":" + v.nodes.length); } catch { }
      R.devRoutes.push({ route: r, prod, dev, hydration: p._hyd.length, axe: axeCount });
    }
    R.subjectsScaffold = { status: await p.goto(P + "/subjects", { waitUntil: "load" }).then((x) => x.status()), text: await p.evaluate(() => (document.querySelector("main")?.innerText || "").slice(0, 400)) };
    await p.close();
  }

  await b.close();

  /* ── GATE ────────────────────────────────────────────────────────────── */
  const gate = R.gate;
  const contrastFails = [];
  for (const theme of ["dark", "light"]) for (const [id, s] of Object.entries(R.scenes[theme])) for (const pr of s.pairs) if (pr.ratio < (pr.large ? 3 : 4.5)) contrastFails.push({ theme, scene: id, ...pr });
  gate.G1_contrast = { pass: contrastFails.length === 0, fails: contrastFails };
  gate.G2_primaries = { pass: R.primaries.maxBodyPrimaries <= 1, max: R.primaries.maxBodyPrimaries, violations: R.primaries.violations };
  const actualTotal = +Object.values(R.scenes.dark).reduce((a, s) => a + s.extentVh, 0).toFixed(2);
  const declaredTotal = +Object.values(DECLARED).reduce((a, d) => a + d.budget, 0).toFixed(2);
  const overruns = Object.entries(R.scenes.dark).filter(([id, s]) => DECLARED[id] && s.extentVh > DECLARED[id].budget + 0.02).map(([id, s]) => ({ scene: id, declared: DECLARED[id].budget, actual: s.extentVh }));
  gate.G3_scroll = { pass: actualTotal <= CEILING, actualTotal, declaredTotal, ceiling: CEILING, perSceneOverruns: overruns };
  gate.G4_links = { pass: R.links.every((l) => l.ok), dead: R.links.filter((l) => !l.ok) };
  const outline = R.consistency.dark.outline; let skip = false; for (let i = 1; i < outline.length; i++) if (outline[i] > outline[i - 1] + 1) skip = true;
  gate.G5_outline = { pass: R.consistency.dark.h1 === 1 && !skip, h1: R.consistency.dark.h1, skipped: skip };
  const serious = ["dark", "light"].flatMap((t) => R.consistency[t].axe.filter((v) => /serious|critical/.test(v.impact)).map((v) => ({ theme: t, ...v })));
  gate.G6_axe = { pass: serious.length === 0, serious, all: { dark: R.consistency.dark.axe, light: R.consistency.light.axe } };
  gate.G7_motion = { pass: R.skim.long.filter((x) => x > 50).length === 0 && R.secondPass.hiddenAfterSecondPass.length === 0 && R.skim.hiddenLeft.length === 0, longTasks: R.skim.long, hiddenAfterSecondPass: R.secondPass.hiddenAfterSecondPass, hiddenAfterSkim: R.skim.hiddenLeft };
  gate.G8_cls = { pass: R.consistency.dark.cls.total <= 0.1 && R.consistency.light.cls.total <= 0.1, dark: R.consistency.dark.cls, light: R.consistency.light.cls };
  const words = Object.values(R.scenes.dark).reduce((a, s) => a + s.words, 0);
  R.totals = { words, readingMin: +(words / 230).toFixed(1), scrollActual: actualTotal, scrollDeclared: declaredTotal, ceiling: CEILING, motifs: Object.values(R.scenes.dark).reduce((a, s) => ({ surfaces: a.surfaces + s.motifs.surfaces, commands: a.commands + s.motifs.commands, dom: a.dom + s.motifs.dom, maxCommandsPerSurface: Math.max(a.maxCommandsPerSurface, s.motifs.maxCommands), maxDomPerSurface: Math.max(a.maxDomPerSurface, s.motifs.maxDom) }), { surfaces: 0, commands: 0, dom: 0, maxCommandsPerSurface: 0, maxDomPerSurface: 0 }), motifCeilings: { perSurface: { commands: 400, domGrouped: 12, genMs: 8 }, note: "3.3 ceilings are PER SURFACE (src/lib/motif/budgets.ts). `dom` here counts every SVG descendant incl. defs/mask/title (stricter than motifBudget() grouped count); `commands` counts path commands, same as 3.3." } };
  R.pass = Object.values(gate).every((g) => g.pass);
  // type-step usage: steps used by exactly one scene
  const single = Object.entries(R.consistency.dark.sizesBy).filter(([, s]) => s.length === 1).map(([k, s]) => k + " only in " + s[0]);
  R.consistency.singleUseTypeSteps = single;
  /* Mobile per-scene: outlier detection vs SIBLINGS (median), report-only.
     No threshold is justified by today's data (max ratio 1.44, six-door
     stacking is legitimate), so this is a signal, not a WARN. */
  { const ext = R.mobile.scenes.map(([, v]) => v).sort((a, b) => a - b); const med = ext[Math.floor(ext.length / 2)]; R.mobile.median = med; R.mobile.ratioToMedian = Object.fromEntries(R.mobile.scenes.map(([id, v]) => [id, +(v / med).toFixed(2)])); R.mobile.outliersReportOnly = R.mobile.scenes.filter(([, v]) => v / med >= 2).map(([id, v]) => `${id} ${v} (${(v / med).toFixed(2)}× median)`); R.mobile.note = "Total mobile screens are PINNED in the baseline and drift-checked (±0.02 screens ≈ 17px, measured jitter 0px). Per-scene ratio-to-median is report-only; ≥2× median is listed as an outlier signal." ; }
  if (overruns.length) R.warnings.push("per-scene scroll overrun (defect, declaration untouched): " + overruns.map((o) => `${o.scene} ${o.actual}/${o.declared}`).join(", "));

  const summary = { pass: R.pass, corrections: R.corrections.map((c) => `${c.scene}.${c.field} ${c.from} -> ${c.to} (${c.step}; measured ${JSON.stringify(c.measuredWhenCorrected)})`), gate: Object.fromEntries(Object.entries(gate).map(([k, v]) => [k, v.pass ? "PASS" : "FAIL"])), totals: R.totals, warnings: R.warnings };
  console.log(JSON.stringify(summary, null, 1));

  if (mode === "write") { fs.writeFileSync(BASELINE, JSON.stringify(R, null, 1)); console.log("baseline written →", BASELINE); }
  if (mode === "check") {
    if (!fs.existsSync(BASELINE)) { console.error("no baseline; run --write"); process.exit(2); }
    const B = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
    const diffs = [];
    const cmp = (name, a, b, tol = 0) => { if (typeof a === "number" && typeof b === "number" ? Math.abs(a - b) > tol : JSON.stringify(a) !== JSON.stringify(b)) diffs.push({ name, baseline: b, now: a }); };
    cmp("totals.words", R.totals.words, B.totals.words, 0);
    cmp("totals.scrollActual", R.totals.scrollActual, B.totals.scrollActual, 0.05);
    cmp("totals.motifs.commands", R.totals.motifs.commands, B.totals.motifs.commands, 0);
    cmp("payload.js", R.payload.js, B.payload.js, 5000);
    cmp("gate", summary.gate, Object.fromEntries(Object.entries(B.gate).map(([k, v]) => [k, v.pass ? "PASS" : "FAIL"])));
    cmp("links", R.links.map((l) => l.href + ":" + l.ok).sort(), B.links.map((l) => l.href + ":" + l.ok).sort());
    /* ACTUALS, not declarations: every per-scene measured extent (desktop + mobile) and the pinned mobile total. Correcting a declaration cannot hide a regression here. */
    for (const id of Object.keys(R.scenes.dark)) { cmp(`scenes.${id}.extentVh (measured)`, R.scenes.dark[id].extentVh, B.scenes.dark[id] && B.scenes.dark[id].extentVh, 0.02); }
    for (const [id, v] of R.mobile.scenes) { const b = (B.mobile.scenes.find((x) => x[0] === id) || [])[1]; cmp(`mobile.${id}.screens (measured)`, v, b, 0.02); }
    cmp("mobile.pageH (pinned)", R.mobile.pageH, B.mobile.pageH, 17);
    cmp("mobile.screens (pinned)", R.mobile.screens, B.mobile.screens, 0.02);
    cmp("corrections", R.corrections.map((c) => `${c.scene}.${c.field} ${c.from}->${c.to}`), (B.corrections || []).map((c) => `${c.scene}.${c.field} ${c.from}->${c.to}`));
    console.log(diffs.length ? "DIFFS vs baseline:\n" + JSON.stringify(diffs, null, 1) : "no diffs vs baseline");
    process.exit(R.pass && diffs.length === 0 ? 0 : 1);
  }
  fs.writeFileSync("/tmp/page-audit.json", JSON.stringify(R, null, 1));
  process.exit(R.pass ? 0 : 1);
})();
