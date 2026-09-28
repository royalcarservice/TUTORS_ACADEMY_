"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* /dev/page · client read-out. See page.tsx for what this route is and is not. */

type J = Record<string, unknown>;
type Contract = { id: string; order: number; name: string; status: string; scrollBehaviour: string; scrollBudget: number; pins: boolean; accentUse: string; anchorId: string | null };
type Props = { baseline: J | null; lighthouse: J | null; ceiling: number; contract: Contract[] };

const g = (o: unknown, path: string): unknown => path.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as J)[k] : undefined), o);
const arr = (o: unknown, path: string): J[] => (Array.isArray(g(o, path)) ? (g(o, path) as J[]) : []);
const num = (o: unknown, path: string): number | null => (typeof g(o, path) === "number" ? (g(o, path) as number) : null);
const str = (v: unknown) => (v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", lineHeight: "var(--ta-leading-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 var(--ta-space-4)", color: "var(--ta-text-primary)" };
const H2: React.CSSProperties = { fontSize: "var(--ta-text-xl)", fontWeight: 600, margin: "var(--ta-space-10) 0 var(--ta-space-3)", color: "var(--ta-text-primary)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "70ch", margin: "0 0 var(--ta-space-3)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-secondary)" };
const CELL: React.CSSProperties = { ...MONO, padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", textAlign: "left" };
const BOX: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-4)", background: "var(--ta-surface-raised)" };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 12px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const PASS = (ok: boolean | null) => ({ ...MONO, color: ok === null ? "var(--ta-text-muted)" : ok ? "var(--ta-text-primary)" : "var(--ta-signal)", fontWeight: 600 });

function Table({ head, rows }: { head: string[]; rows: (string | number | null | boolean | undefined)[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth: "48rem" }}>
        <thead><tr>{head.map((h) => <th key={h} style={{ ...CELL, color: "var(--ta-text-muted)" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={CELL}>{c === true ? "✓" : c === false ? "✗" : str(c)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ── Authored findings (4.9). These are prose, not measurements. ─────────── */

const ARC = [
  ["Duplicate claims (location → location)", [
    "“Every subject is a place you can enter.” — S0 h1 and S8 h2. Deliberate echo: the ending re-states the opening after the proof. Keep.",
    "“Six environments” — S1 h3, S2 h2, S2 h3, S3 h2, S4 body, S7 body: six occurrences. The phrase is the page's spine, but S2 says it twice within 60 words (h2 + specimen h3). Candidate trim: S2 h3 → “Side by side”.",
    "“The environment becomes the page / the subject.” — S3 closing line, S4 h2. Adjacent scenes making the same claim across the boundary reads as a handoff, not a repeat. Keep.",
    "“One of the six is open today.” — S3 availability line and S8 support line. S8's repeat is the honest re-statement before the door; keep.",
    "“Enter a world” → #for-students — S0 primary and S8 primary, same destination. Intentional loop (the end returns to the threshold). Keep.",
    "“in the same room / place you entered” — S6 beats 1 and 3. Second use is redundant; candidate trim (beat 3 loses the clause).",
    "“Next · not built yet” — S5 ×1, S6 ×4, S7 ×1: six identical labels within 2.6 viewports. Correct as honesty treatment; the density is the cost of not pretending. Recorded as an attention risk, not a defect.",
  ]],
  ["Narrative breaks", [
    "None hard. One soft break: S4 (enter) asks the reader to “watch one become another” — the switch needs an action (Next/Previous); a reader who does not press sees a static Mathematics stage and moves on with the claim undemonstrated. This is the 4.5 decision (no autoplay) and stands; it is the arc's single unproved-if-passive claim.",
    "S5 (people) opens on “There is no roster on this page” — a negation before a claim. It reads as a defence. Works on second pass, weak on first.",
  ]],
  ["Pairwise boundaries", [
    "2/3 (difference → choice): the strongest boundary — S2 ends “One of these six is the subject you are here for. It is next.” and S3 opens on the threshold. Motif surfaces continue across the boundary (same six motifs, edge → door). Reads as one motion.",
    "3/4 (choice → enter): S3 ends “the environment becomes the page”, S4 h2 “The environment becomes the subject.” The word change (page → subject) is the argument. Sticky engages after a static scene; the shift from scroll-past to held viewport is the only pinned moment on the page, and it lands where the story needs a hold.",
    "7/8 (promise → return): S7 ends “What is left on this page is the door you already saw.” S8 delivers it. Tight. The two scenes together are 1.8 viewports — the closing is short and the primary appears once.",
    "5/6 (people → practice): weakest boundary. S5 (tutor) and S6 (session) are both “ahead” material, both carry the same status label, and S6 opens with a framing sentence that S5 already made (“inside an environment you have already seen”). This is where attention drops (see below).",
  ]],
  ["Attention drops (position)", [
    "~5.8–7.6 vh (S5 → S6 beats 2–3): four consecutive not-built labels and 234 words with no new visual device. Reading-time share: 28% of the page's words in 22% of its scroll.",
    "~8.8 vh (S7 marker list): seven mono markers; the done/ahead split is the point but the list is the third vertical list in three scenes (doors, beats, markers).",
  ]],
  ["What could be cut (RECOMMEND ONLY — no scene is cut in 4.9)", [
    "Merge S5 into S6 as a fifth beat (“You meet your tutor inside it”) — saves ~1.0 vh and 68 words, removes the weakest boundary. Requires a contract change (scene count 9 → 8) and is therefore a Phase 5 decision with the 3.6/4.1 spine owner.",
    "Trim S6 to three beats (attend / work / see yourself move; “revisit” folds into “attend”) — saves ~0.4 vh and ~40 words.",
    "S1: cut the third h3 (“Moving between subjects is one motion”) — S4 demonstrates it 2 scenes later; the claim ahead of its proof is 30 words.",
    "Net if all three: ~580 words, ~9.4 vh actual, four fewer “Next · not built yet” labels. Ending still earns beginning.",
  ]],
  ["Does the ending earn the beginning?", [
    "Yes, with one condition. S0 promises “Choose one and step inside”; S8 says “You have now seen what that means … The choice is where it was.” The page proves “built as places” (S1–S4, demonstrable on this page) and is honest that S5–S7 are ahead. The condition: the primary CTA loops back to S3, so the beginning's promise is kept only if the one open door (Mathematics) is the reader's subject. For five of six readers the ending delivers a threshold they cannot yet cross — stated plainly on the page, which is the correct behaviour, but it is also why `/` is not yet a front door (see verdict).",
  ]],
  ["Reading time vs ceiling", [
    "746 words on the page (incl. footer 19) → 3.2 min at 230 wpm. The 4.1 spine set no word ceiling; the 4.8 read-through recommended ≤ ~580 words (≈2.5 min). Current page is 29% over that recommendation. Scroll: 11.0 vh actual vs 12 vh ceiling (PAGE_SCROLL_CEILING) — inside the hard ceiling, over the declared 10.8 by the S3 overrun.",
  ]],
  ["Mobile 390 px", [
    "Page 9,262 px = 11 screens at 844 px. S3 is 1.73 vh on mobile (six full-width doors stacked); S4 is 0.86 vh (the stage compresses; the sticky releases early). No horizontal overflow at 320/390. Verdict: readable, honest, one scene too long (S3) — same defect as desktop, larger.",
  ]],
] as const;

const HONESTY: { item: string; finding: string; action: string }[] = [
  { item: "Fake functionality", finding: "None on `/`. S4's switch is the real 3.4 state machine; S3's five inert doors are inert by data (draft status), not disabled controls.", action: "Verified (harness: ctas, secondPass.enterLayers = 1)." },
  { item: "Fake data", finding: "None. No stats, testimonials, counts or dates. `/subjects` scaffold lists six real config subjects.", action: "Verified (grep + read-through)." },
  { item: "Placeholders", finding: "`siteConfig.supportEmail = hello@tutorsacademy.example` — a fake mailbox in config, unused by any route since 4.8 removed it from the footer.", action: "FIXED — removed from src/config/site.ts (defect D-06)." },
  { item: "Treatment inconsistency", finding: "Honesty treatment appears in three forms: mono 11px upper (S3 doors, S7 markers), mono 14px upper (S5, S6, S7 “Next · not built yet”), and body-size prose (S3 availability line, S6 “Live today:”, S8 support). The 4.6 rule — never smaller than the text it describes — holds for all three; the 11px form labels 2xs metadata, the 14px form labels body text.", action: "Verified consistent with the rule; the three sizes are recorded, not changed." },
  { item: "Silent failures", finding: "Baseline reader on this route returns null (not a throw) if audit/baseline.json is missing, and says so in the UI. HomeSpine validator is loud at build.", action: "Verified." },
  { item: "Pretend auth", finding: "Header “Sign in” / “Create account” go to real routes (200). Whether those routes authenticate is Phase-2 scope, not this page's claim.", action: "Verified (links table)." },
  { item: "Dead links", finding: "All 11 distinct hrefs on `/` resolve: 4 anchors exist in the DOM, 5 routes return 200, `/` 200/304. FOOTER_NAV (unused) still listed `/#platform`-style columns from the pre-4.8 footer.", action: "FIXED — FOOTER_NAV removed from src/config/navigation.ts (D-05)." },
  { item: "Non-functional affordances", finding: "S0 scroll cue (·↓) is a real anchor link. /dev/spine's copy says “reorder it below and watch the page follow” — the control reorders the dev page's own sequence list and budget bars, not a rendered page.", action: "FIXED — /dev/spine copy corrected to what the control does (D-09); the rendered-reorder proof now lives on this route (frame=spine&order=swap)." },
  { item: "Hardcoded values", finding: "viewport.themeColor was `#2449eb` — a pre-Phase-2 blue outside the locked hue, shown in browser chrome on mobile.", action: "FIXED — now ink-900 / ivory-50 by colour-scheme (D-07)." },
  { item: "Unused code", finding: "FOOTER_NAV, supportEmail (above). No other unused exports found by tsc/lint in src/.", action: "FIXED (D-05, D-06)." },
  { item: "Half-built", finding: "`arrival.status` was still `skeleton` in the contract although the authored ArrivalScene has been registered since 4.2 — a stale declaration, no render effect (slot registry wins) but false metadata on /dev/spine.", action: "FIXED — status → authored (D-04). `/subjects` remains a self-declared scaffold (recommend, not changed)." },
];

const DEFECTS: { id: string; defect: string; evidence: string; fix: string; files: string }[] = [
  { id: "D-01", defect: "Primary button: white text on brass in dark theme = 2.62:1 (WCAG AA fail) on every primary CTA (header, S0, S4, S8).", evidence: "G1 first run: 3 fails, all rgb(255,255,255) on rgb(194,154,69); axe color-contrast serious ×4 (dark).", fix: "Primary variant now uses the designed pairing tokens `bg-surface-brand text-text-on-brand` (brass-500 + ink-950 in both themes, 7.4:1) — the same pairing `.ta-btn[data-variant=primary]` already used. Lightness-only change; no new token.", files: "src/components/ui/button.tsx" },
  { id: "D-02", defect: "Two region landmarks with the same accessible name (S0 and S8 both named by the echoed headline).", evidence: "axe landmark-unique moderate ×1, both themes.", fix: "Scene sections are named by the contract's `name` (aria-label) instead of by heading text. Names: Arrival … The Return — unique by construction.", files: "src/components/spine/scene-slot.tsx" },
  { id: "D-03", defect: "S3 open door: aria-label “Mathematics — The Lattice” did not contain the visible label (WCAG 2.5.3 Label in Name).", evidence: "Lighthouse label-content-name-mismatch on `/` (all 4 runs).", fix: "aria-label removed; the accessible name is the door&apos;s own text.", files: "src/components/spine/scenes/choice.tsx" },
  { id: "D-04", defect: "`arrival.status: skeleton` — stale declaration.", evidence: "Contract inspection; ArrivalScene registered in slots.tsx.", fix: "status → authored (value change, enum untouched).", files: "src/lib/spine/scenes.ts" },
  { id: "D-05", defect: "FOOTER_NAV unused since the 4.8 footer; listed anchors the page no longer promises.", evidence: "grep: zero imports outside its own file.", fix: "Removed, with a comment pointing at the 4.8 footer.", files: "src/config/navigation.ts" },
  { id: "D-06", defect: "supportEmail placeholder mailbox in config.", evidence: "grep: zero references.", fix: "Removed.", files: "src/config/site.ts" },
  { id: "D-07", defect: "themeColor #2449eb (blue) — outside the locked hue.", evidence: "src/app/layout.tsx viewport export.", fix: "ink-900 / ivory-50 by prefers-color-scheme.", files: "src/app/layout.tsx" },
  { id: "D-08", defect: "S3 scroll overrun: 1.39 vh actual vs 1.2 declared (1.73 on mobile).", evidence: "Harness extent, every run; G3 WARN. Provenance: 4.4 §12 disclosed 1.39@1280 as an overrun defect at the time — a known consequence, not a discovery.", fix: "SETTLED (decision, not a code fix): stale declaration — 1.2 was unreachable by construction for the 4.4 colonnade (floor ≈982px > 960px). Declaration corrected 1.2 → 1.4 as a recorded CORRECTION EVENT (baseline `corrections`), one-time policy stated, regression detection confirmed to run on measured actuals. Mobile total pinned; per-scene mobile outlier signal added (report-only).", files: "src/lib/spine/scenes.ts (value + provenance comment), audit/page.cjs" },
  { id: "D-09", defect: "/dev/spine copy over-claimed what the reorder control does.", evidence: "Read-through; puppeteer: no section[data-scene] on that route.", fix: "Copy corrected; rendered-reorder proof added here.", files: "src/app/dev/spine/preview.tsx" },
];

const DEFERRED: { from: string; item: string; to: string }[] = [
  { from: "3.5 §14", item: "Ambient lens for the other five subjects (await approval); hero integration", to: "Phase 5 — after five-subject approval" },
  { from: "3.6 §15", item: "Full-ceremony switch at the route boundary (stays with /dev/switch until the chooser owns navigation); Step 3.7 re-skin gate", to: "3.7 gate: superseded by this route (4.9 creates the baseline). Route-boundary switch: Phase 5" },
  { from: "4.1 §15", item: "Sequence-step animation for practice (declared, animated when authored)", to: "Delivered in 4.6 (beats). Closed." },
  { from: "4.2 §16", item: "Chooser design replaces scaffold link cluster in S3", to: "Delivered in 4.4. Closed." },
  { from: "4.3 §18", item: "3.7 harness proper; arrival status flip; premise quietLine wording; primary button dark-theme contrast", to: "Harness: this step. Status flip: D-04. Contrast: D-01. quietLine wording: still open → Phase 5 copy pass" },
  { from: "4.5 §18", item: "Ambient-at-Stage-scale on the homepage (only after 3.5 approval); Scene 3 → 4 `ta:door` dispatch (receiver installed, dispatch needs an S3 edit)", to: "Phase 5. Receiver remains dormant; recorded here so it is not mistaken for dead code" },
  { from: "4.6 §10", item: "Tutor portal, live classroom, recordings, assignments, tests, AI assistant (registry `planned`)", to: "Product phases beyond the homepage; the page derives its labels from the registry" },
  { from: "4.7 §21", item: "Capability-specific done-state wording when modules ship", to: "Phase 5+ (when a registry status flips)" },
  { from: "4.8 §21", item: "Legal pages, contact route, DPDP review (launch blockers); 4.9 length edits", to: "Blockers: Phase 5 entry (see verdict). Length edits: recommended above, not applied (no cuts in 4.9)" },
  { from: "4.9", item: "S3 overrun (D-08); S2 h3 / S6 beat-3 / S1 h3 trims; S5→S6 merge; `/subjects` scaffold replacement; ~594 KB uncompressed JS (359 KB LH byte weight) mostly framework — no page code above 34 KB", to: "Phase 5 entry list" },
];

export default function Gate({ baseline: B, lighthouse: LH, ceiling, contract }: Props) {
  const [tab, setTab] = useState<"second" | "skim" | "spine">("second");
  const frame = useRef<HTMLIFrameElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [spineOrder, setSpineOrder] = useState<"default" | "swap">("default");
  const [spineProof, setSpineProof] = useState<string>("");

  const say = (s: string) => setLog((l) => [...l, s]);
  const win = () => frame.current?.contentWindow ?? null;
  const doc = () => frame.current?.contentDocument ?? null;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function secondPass() {
    const w = win(); const d = doc(); if (!w || !d || busy) return; setBusy(true); setLog([]);
    say("first pass: fling to bottom in 12 steps");
    const H = d.documentElement.scrollHeight;
    for (let y = 0; y <= H; y += H / 12) { w.scrollTo(0, y); await wait(40); }
    await wait(800);
    w.scrollTo(0, 0); await wait(300);
    say("second pass: read each scene at reading speed");
    const rows: string[] = [];
    for (const s of Array.from(d.querySelectorAll<HTMLElement>("section[data-scene]"))) {
      s.scrollIntoView({ block: "start" }); await wait(900);
      const hidden = Array.from(s.querySelectorAll<HTMLElement>(".ta-reveal,.ta-stagger > *")).filter((e) => +getComputedStyle(e).opacity < 1).length;
      const beats = s.querySelectorAll("[data-beat]").length; const markers = s.querySelectorAll("[data-marker]").length;
      const layers = s.querySelectorAll("[data-switch-layer]").length;
      const empty = Array.from(s.querySelectorAll<HTMLElement>("div,ul,section")).filter((e) => e.children.length === 0 && !(e.textContent || "").trim() && e.getBoundingClientRect().height > 40).length;
      rows.push(`${s.dataset.scene}: hidden-after-seen=${hidden} beats=${beats} markers=${markers} switchLayers=${layers} emptyContainers>40px=${empty}`);
    }
    rows.forEach(say);
    say("S4 sticky re-entered from below:");
    const enter = d.querySelector<HTMLElement>("section[data-scene=enter]"); const people = d.querySelector<HTMLElement>("section[data-scene=people]");
    if (enter && people) { people.scrollIntoView(); await wait(400); w.scrollBy(0, -Math.round(w.innerHeight * 0.7)); await wait(700);
      const stage = enter.querySelector<HTMLElement>("[style*='sticky'],[data-enter-stage]") || enter.querySelector<HTMLElement>(":scope > div");
      say(`  stage position=${stage ? getComputedStyle(stage).position : "?"} layers=${enter.querySelectorAll("[data-switch-layer]").length} name=${enter.querySelector("[data-enter-name]")?.textContent?.trim() ?? "?"} cta=${enter.querySelector("[data-enter-cta]")?.textContent?.trim() ?? "?"}`); }
    say("S7 journey device after reveal:");
    const promise = d.querySelector<HTMLElement>("section[data-scene=promise]");
    if (promise) { promise.scrollIntoView(); await wait(900); say(`  markers=${Array.from(promise.querySelectorAll<HTMLElement>("[data-marker]")).map((m) => m.dataset.marker || m.getAttribute("data-state") || "•").join(",")}`); }
    setBusy(false);
  }

  async function skim() {
    const w = win(); const d = doc(); if (!w || !d || busy) return; setBusy(true); setLog([]);
    w.scrollTo(0, 0); await wait(200);
    const frames: number[] = []; let last = -1; let on = true;
    const rec = () => { const n = w.performance.now(); if (last >= 0) frames.push(n - last); last = n; if (on) w.requestAnimationFrame(rec); };
    w.requestAnimationFrame(rec);
    const long: number[] = [];
    let po: PerformanceObserver | null = null;
    try { const PO = (w as unknown as { PerformanceObserver: typeof PerformanceObserver }).PerformanceObserver; po = new PO((l: PerformanceObserverEntryList) => { for (const e of l.getEntries()) long.push(Math.round(e.duration)); }); po.observe({ entryTypes: ["longtask"] }); } catch { /* not supported */ }
    const H = d.documentElement.scrollHeight;
    say(`fling: ${Math.ceil(H / 750)} steps of 750px at 16ms`);
    for (let y = 0; y <= H; y += 750) { w.scrollTo(0, y); await wait(16); }
    await wait(120);
    const mid = Array.from(d.querySelectorAll<HTMLElement>(".ta-reveal,.ta-stagger > *")).filter((e) => { const o = +getComputedStyle(e).opacity; return o > 0 && o < 1; }).length;
    say(`mid-fling: ${mid} elements still transitioning (one-shot reveals in flight, ≤700ms each; 0 queued after settle if the next line is 0)`);
    await wait(800);
    const left = Array.from(d.querySelectorAll<HTMLElement>(".ta-reveal,.ta-stagger > *")).filter((e) => +getComputedStyle(e).opacity < 1).map((e) => e.closest("section")?.getAttribute("data-scene"));
    say(`settled: hidden-left=${left.length} ${left.length ? JSON.stringify(left) : ""}`);
    const enter = d.querySelector<HTMLElement>("section[data-scene=enter]");
    say(`sticky released: ${enter ? enter.getBoundingClientRect().bottom < 0 : "?"} · switch layers=${enter?.querySelectorAll("[data-switch-layer]").length ?? "?"}`);
    on = false; po?.disconnect();
    const avg = frames.reduce((a, b) => a + b, 0) / Math.max(1, frames.length);
    say(`frames: n=${frames.length} avg=${avg.toFixed(1)}ms worst=${Math.max(...frames).toFixed(1)}ms >33ms=${frames.filter((f) => f > 33).length} >50ms=${frames.filter((f) => f > 50).length}`);
    say(`long tasks >50ms: ${long.length ? long.join(", ") + " ms" : "none"}`);
    setBusy(false);
  }

  useEffect(() => {
    if (tab !== "spine") return;
    const f = frame.current; if (!f) return;
    const read = () => { const d = f.contentDocument; if (!d) return; const secs = Array.from(d.querySelectorAll<HTMLElement>("section[data-scene]")).map((s) => s.dataset.scene); const last = d.querySelector<HTMLElement>(`section[data-scene="${secs[secs.length - 1]}"]`); const foot = d.querySelector("footer"); setSpineProof(`order=${spineOrder} · rendered: ${secs.join(" > ")} · footers=${d.querySelectorAll("footer").length} · footer after last scene: ${foot && last ? foot.getBoundingClientRect().top >= last.getBoundingClientRect().bottom - 1 : "?"}`); };
    f.addEventListener("load", read); const t = setInterval(read, 1000); return () => { f.removeEventListener("load", read); clearInterval(t); };
  }, [tab, spineOrder]);

  const scenesDark = (g(B, "scenes.dark") as Record<string, J>) || {};
  const scenesLight = (g(B, "scenes.light") as Record<string, J>) || {};
  const gate = (g(B, "gate") as Record<string, J>) || {};
  const cons = (g(B, "consistency.dark") as J) || {};
  const sizesBy = (g(cons, "sizesBy") as Record<string, string[]>) || {};
  const positions = arr(B, "primaries.perPosition");

  return (
    <div style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 4 · Step 9 — WHOLE-PAGE PASS · PHASE 4 GATE (dev-only)</p>
        <h1 style={H1}>Is <Link href="/" style={{ color: "var(--ta-accent-1)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>/</Link> ready to be the front door?</h1>
        <p style={NOTE}>
          Everything numeric below is read from <code>audit/baseline.json</code> (written by <code>NODE_PATH=./node_modules node audit/page.cjs --write</code> against prod :3100 and dev :3000) and <code>audit/lighthouse-page.json</code>. The players drive a live same-origin iframe of <code>/</code>. This route measures; it changes nothing.
          {!B && <strong style={{ color: "var(--ta-signal)" }}> No baseline found — run the harness first.</strong>}
        </p>

        {/* ── Verdict ─────────────────────────────────────────────── */}
        <div style={{ ...BOX, borderColor: "var(--ta-border-strong)" }}>
          <p style={TAG}>Verdict</p>
          <p style={{ ...NOTE, color: "var(--ta-text-primary)", margin: "var(--ta-space-2) 0" }}>
            <strong>Not yet — certified with defects.</strong> The page passes every mechanical gate it can pass (G1–G8, LH 100/100/100/100 desktop, 97–98 perf mobile, axe 0). What stands between it and “front door”: (1) five of six doors are honestly closed — the page&apos;s promise is kept for Mathematics only; (2) no privacy policy, terms, contact route or DPDP review — nothing that collects a name may sit behind a front door without them; (3) the page is ~25% over the recommended reading length (D-08 settled as a declaration correction, recorded); (4) <code>/subjects</code>, the footer&apos;s second link, is a self-declared scaffold.
          </p>
          <div style={{ display: "flex", gap: "var(--ta-space-4)", flexWrap: "wrap", marginTop: "var(--ta-space-2)" }}>
            {Object.entries(gate).map(([k, v]) => <span key={k} style={PASS(!!g(v, "pass"))}>{k} {g(v, "pass") ? "PASS" : "FAIL"}</span>)}
            {arr(B, "warnings").length === 0 && Array.isArray(g(B, "warnings")) && (g(B, "warnings") as string[]).map((w) => <span key={w} style={{ ...MONO, color: "var(--ta-signal)" }}>WARN {w}</span>)}
          </div>
          <p style={{ ...MONO, marginTop: "var(--ta-space-2) " }}>baseline generated {str(g(B, "generatedAt"))} · page pass={str(g(B, "pass"))}</p>
        </div>

        {/* ── Declaration corrections: diffs, not results ─────────── */}
        <h2 style={H2}>Declaration corrections (the record keeps the red)</h2>
        <Table head={["scene", "field", "from", "to", "step", "measured when corrected", "reason"]} rows={arr(B, "corrections").map((c) => [str(c.scene), str(c.field), str(c.from), str(c.to), str(c.step), str(c.measuredWhenCorrected), str(c.reason)])} />
        <p style={{ ...MONO, marginTop: "var(--ta-space-2)", color: "var(--ta-signal)" }}>Policy: {str(g(B, "correctionPolicy"))}</p>
        <p style={MONO}>Regression detection runs on ACTUALS: `--check` compares every scene&apos;s measured desktop extent (±0.02 vh) and measured mobile extent (±0.02 screens), the pinned mobile page height ({str(g(B, "mobile.pageH"))} px, ±17 px) and total ({str(g(B, "mobile.screens"))} screens), and the corrections list itself. Mobile per-scene ratio to sibling median (report-only): {str(g(B, "mobile.ratioToMedian"))} · outliers ≥2×: {arr(B, "mobile.outliersReportOnly").length ? str(g(B, "mobile.outliersReportOnly")) : "none"}.</p>

        {/* ── Budget readout ─────────────────────────────────────── */}
        <h2 style={H2}>Budget readout</h2>
        <Table head={["scene", "order", "status", "behaviour", "declared vh", "actual vh (1280×800)", "actual vh (390)", "words", "min contrast", "focusables", "touch ok", "type steps", "accent use", "treatment labels"]}
          rows={contract.map((c) => { const s = scenesDark[c.id] || {}; const m = arr(B, "mobile.scenes").find((x) => (x as unknown as [string, number])[0] === c.id) as unknown as [string, number] | undefined; const foc = arr(s, "focusables"); const touch = foc.every((f) => (num(f, "w") ?? 0) >= 44 && (num(f, "h") ?? 0) >= 44); const cont = arr(s, "pairs"); const minC = cont.length ? Math.min(...cont.map((x) => num(x, "ratio") ?? 99)) : null; return [c.id, c.order, c.status, c.scrollBehaviour + (c.pins ? " · pins" : ""), c.scrollBudget, num(s, "extentVh") ?? num(s, "extent"), m ? m[1] : null, num(s, "words"), minC === null ? null : minC.toFixed(2), foc.length, foc.length ? touch : null, Object.keys(sizesBy).filter((k) => sizesBy[k].includes(c.id)).join(" "), c.accentUse, arr(s, "treatment").length]; })} />
        <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>
          total actual {str(g(B, "totals.scrollActual"))} vh · declared {str(g(B, "totals.scrollDeclared"))} vh · ceiling {ceiling} vh · words {str(g(B, "totals.words"))} ({str(g(B, "totals.readingMin"))} min) · motifs {str(g(B, "totals.motifs.surfaces"))} surfaces, max {str(g(B, "totals.motifs.maxCommandsPerSurface"))}/400 commands and {str(g(B, "totals.motifs.maxDomPerSurface"))} descendants per surface (3.3 grouped ceiling 12; descendants count includes defs/mask) · payload {str(g(B, "payload.requests"))} requests, {Math.round((num(B, "payload.bytes") ?? 0) / 1024)} KB uncompressed, JS {Math.round((num(B, "payload.js") ?? 0) / 1024)} KB uncompressed, WebGL chunks {arr(B, "payload.webgl").length}, canvas {str(g(B, "payload.canvas"))}
        </p>
        <Table head={["lighthouse run", "perf", "a11y", "bp", "seo", "LCP", "LCP element", "CLS", "TBT", "FCP", "byte weight KB", "long tasks ms", "a11y audit fails"]}
          rows={Object.entries((LH as Record<string, J>) || {}).map(([k, v]) => [k, num(v, "scores.performance"), num(v, "scores.accessibility"), num(v, "scores.best-practices"), num(v, "scores.seo"), str(g(v, "lcp")), str(g(v, "lcpEl")), str(g(v, "cls")), str(g(v, "tbt")), str(g(v, "fcp")), num(v, "jsKB"), (g(v, "longTasks") as number[] | undefined)?.join(",") || "none", (g(v, "a11yFails") as string[] | undefined)?.join(",") || "none"])} />
        <p style={{ ...MONO, marginTop: "var(--ta-space-1)" }}>Mobile = LH “mobile” preset (390×844, 4× CPU, 1.6 Mbps/150 ms RTT). CLS full scroll (harness): dark {str(g(B, "consistency.dark.cls.total"))}, light {str(g(B, "consistency.light.cls.total"))}. Skim frames: {str(g(B, "skim.frames"))}; long tasks during skim: {arr(B, "skim.long").length ? str(g(B, "skim.long")) : "none"}. LCP (harness, unthrottled): dark {str(g(B, "consistency.dark.lcp"))}, light {str(g(B, "consistency.light.lcp"))}.</p>

        {/* ── Consistency panel ─────────────────────────────────────── */}
        <h2 style={H2}>Cross-scene consistency</h2>
        <div style={{ display: "grid", gap: "var(--ta-space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))" }}>
          <div style={BOX}><p style={TAG}>Heading outline</p><p style={MONO}>h1 count {str(g(cons, "h1"))} · levels in order: {(g(cons, "outline") as number[] | undefined)?.join(" ") ?? "—"}</p><p style={MONO}>landmarks: {(g(cons, "landmarks") as string[] | undefined)?.join(", ") ?? "—"} + 9 regions named by contract (D-02)</p></div>
          <div style={BOX}><p style={TAG}>Type steps by scene</p>{Object.entries(sizesBy).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(([k, v]) => <p key={k} style={MONO}>{k}: {v.join(", ")}</p>)}<p style={{ ...MONO, color: "var(--ta-signal)" }}>single-scene steps: {(g(B, "consistency.singleUseTypeSteps") as string[] | undefined)?.join("; ") || "none"} — 88px is the h1 (S0 only, correct); 12px is S4&apos;s stage meta label (2xs used as 12px there vs 11px elsewhere: recorded, not a defect — same token at a different root).</p></div>
          <div style={BOX}><p style={TAG}>Spacing rhythm (section box)</p>{contract.map((c) => { const sp = g(scenesDark[c.id], "spacing") as J | undefined; return <p key={c.id} style={MONO}>{c.id}: min {str(sp?.minHeight)} · h {str(sp?.height)} · justify {str(sp?.justify)} · pad {str(sp?.paddingTop)}/{str(sp?.paddingBottom)} · rule {str(sp?.borderBottom)}</p>; })}<p style={MONO}>Eight scenes centre in a min-height box with a hairline rule; S4 (sticky) is the exception by contract. Rhythm is uniform.</p></div>
          <div style={BOX}><p style={TAG}>Honesty treatment by scene</p>{contract.map((c) => { const t = arr(scenesDark[c.id], "treatment"); return <p key={c.id} style={MONO}>{c.id}: {t.length ? t.map((x) => `${str(x.text).slice(0, 22)}${String(x.text).length > 22 ? "…" : ""} [${str(x.size)}${x.mono ? " mono" : ""}${x.upper ? " upper" : ""}]`).join(" · ") : "—"}</p>; })}</div>
          <div style={BOX}><p style={TAG}>Accent</p>{contract.map((c) => <p key={c.id} style={MONO}>{c.id}: contract {c.accentUse} · rendered accent elements {str(g(scenesDark[c.id], "accentElements"))} · subject-scoped {str(g(scenesDark[c.id], "subjectScoped"))}</p>)}</div>
          <div style={BOX}><p style={TAG}>Light theme delta</p>{contract.map((c) => { const d = arr(scenesDark[c.id], "pairs"); const l = arr(scenesLight[c.id], "pairs"); const md = d.length ? Math.min(...d.map((x) => num(x, "ratio") ?? 99)) : null; const ml = l.length ? Math.min(...l.map((x) => num(x, "ratio") ?? 99)) : null; return <p key={c.id} style={MONO}>{c.id}: min contrast dark {md?.toFixed(2) ?? "—"} · light {ml?.toFixed(2) ?? "—"}</p>; })}</div>
        </div>

        {/* ── CTA inventory ─────────────────────────────────────── */}
        <h2 style={H2}>CTA set</h2>
        <Table head={["scene", "label", "aria-label", "href", "variant", "tag", "status"]}
          rows={[...arr(B, "ctas"), ...arr(B, "footerLinks")].map((c) => { const l = arr(B, "links").find((x) => x.href === c.href); return [str(c.scene), String(c.label).slice(0, 60), str(c.aria), str(c.href), str(c.variant), str(c.tag), c.href ? (l ? `${str(l.status)}${l.anchor ? " · anchor present" : ""}` : "?") : "button (in-page)"]; })} />
        <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>Hierarchy: primary = brass fill (S0 “Enter a world”, S4 “Enter Mathematics”, S8 “Enter a world”); secondary = outline (S0 “Understand it”); tertiary = text links (cue, doors, footer). Header “Create account” is also primary-styled and is sticky — it is excluded from the body count below and recorded as a standing Phase-2 chrome decision.</p>
        <p style={TAG}>Primary-styled actions visible in the body, per 100px scroll position (max {str(g(B, "primaries.maxBodyPrimaries"))}; violations {arr(B, "primaries.violations").length})</p>
        <p style={{ ...MONO, wordBreak: "break-all" }}>{positions.map((p) => `${str(p.y)}:${str(p.body)}`).join(" ")}</p>
        <p style={MONO}>Label coherence: “Enter …” is the verb for every primary; “Understand it” is the only secondary verb; door labels are noun phrases; footer labels are nouns. Coherent. One note: S0 and S8 share label and destination (intentional loop, see arc).</p>

        {/* ── Players ─────────────────────────────────────────────── */}
        <h2 style={H2}>Players</h2>
        <div style={{ display: "flex", gap: "var(--ta-space-2)", flexWrap: "wrap", marginBottom: "var(--ta-space-3)" }}>
          <button type="button" style={BTN} aria-pressed={tab === "second"} onClick={() => { setTab("second"); setLog([]); }}>second-pass player</button>
          <button type="button" style={BTN} aria-pressed={tab === "skim"} onClick={() => { setTab("skim"); setLog([]); }}>fast-skim player</button>
          <button type="button" style={BTN} aria-pressed={tab === "spine"} onClick={() => { setTab("spine"); setLog([]); }}>spine-is-data proof</button>
          {tab === "second" && <button type="button" style={BTN} disabled={busy} onClick={secondPass}>{busy ? "running…" : "run second pass"}</button>}
          {tab === "skim" && <button type="button" style={BTN} disabled={busy} onClick={skim}>{busy ? "running…" : "run fast skim"}</button>}
          {tab === "spine" && <><button type="button" style={BTN} aria-pressed={spineOrder === "default"} onClick={() => setSpineOrder("default")}>order: default</button><button type="button" style={BTN} aria-pressed={spineOrder === "swap"} onClick={() => setSpineOrder("swap")}>order: swap promise ↔ return</button></>}
        </div>
        <div style={{ display: "grid", gap: "var(--ta-space-3)" }}>
          <iframe ref={frame} title={tab === "spine" ? "spine reorder proof" : "homepage under test"} src={tab === "spine" ? `/dev/page?frame=spine&order=${spineOrder}` : "/"} style={{ width: "100%", minWidth: "48rem", height: 640, border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", background: "var(--ta-surface-base)" }} />
          <div style={{ ...BOX, maxHeight: 360, overflow: "auto" }}>
            <p style={TAG}>{tab === "spine" ? "proof" : "log"}</p>
            {tab === "spine" ? <p style={MONO}>{spineProof || "loading…"}<br /><br />The frame renders the real HomeSpine with the contract&apos;s `order` values permuted and the real SiteFooter after it. If the rendered sequence follows the data and the footer stays last, the spine is data (4.1) and the footer is static (4.8).</p> : log.length ? log.map((l, i) => <p key={i} style={{ ...MONO, whiteSpace: "pre-wrap" }}>{l}</p>) : <p style={MONO}>Baseline record — second pass: {str(g(B, "secondPass"))}<br /><br />Baseline record — skim: {str({ ...(g(B, "skim") as J), frames: g(B, "skim.frames") })}</p>}
          </div>
        </div>

        {/* ── Arc report ─────────────────────────────────────────── */}
        <h2 style={H2}>Arc report (read-through, not measured)</h2>
        {ARC.map(([h, items]) => <div key={h} style={{ marginBottom: "var(--ta-space-4)" }}><p style={TAG}>{h}</p><ul style={{ margin: "var(--ta-space-1) 0 0", paddingLeft: "1.2em" }}>{items.map((t) => <li key={t} style={{ ...NOTE, margin: "0 0 var(--ta-space-1)" }}>{t}</li>)}</ul></div>)}

        {/* ── Honesty ─────────────────────────────────────────────── */}
        <h2 style={H2}>Honesty sweep (11)</h2>
        <Table head={["item", "finding", "action"]} rows={HONESTY.map((h) => [h.item, h.finding, h.action])} />

        <h2 style={H2}>Defects — every change in 4.9, against its defect</h2>
        <Table head={["id", "defect", "evidence", "fix", "files"]} rows={DEFECTS.map((d) => [d.id, d.defect, d.evidence, d.fix, d.files])} />

        {/* ── Deferred register ───────────────────────────────────── */}
        <h2 style={H2}>Consolidated deferred register (3.5 → 4.9)</h2>
        <Table head={["from", "item", "destination"]} rows={DEFERRED.map((d) => [d.from, d.item, d.to])} />

        <h2 style={H2}>Verified vs recommended</h2>
        <p style={NOTE}><strong>Verified</strong> (measured by the harness or Lighthouse, reproducible with the command above): every number in the budget readout, consistency panel, CTA table, gates, players&apos; baseline records, dev-route gating (19 routes 404 in prod / 200 in dev), no-JS render order, reduced-motion order, 200%/400% zoom and text-spacing overflow, slow-3G first paint. <strong>Recommended</strong> (judgement, not applied): the arc report&apos;s cuts and merges, the `/subjects` scaffold replacement, the reading-length target, the S3 budget resolution. Nothing in the recommended column changed the page in this step.</p>
        <p style={MONO}>Dev routes: {arr(B, "devRoutes").map((r) => `${str(r.route)} prod ${str(r.prod)} dev ${str(r.dev)}${arr(r, "axe").length ? ` axe[${(r.axe as string[]).join(" ")}]` : ""}`).join(" · ")}</p>
        <p style={MONO}>/subjects scaffold: status {str(g(B, "subjectsScaffold.status"))} · “{String(g(B, "subjectsScaffold.text") ?? "").slice(0, 160)}…” — recommendation: replace with a route that reuses Scene 3&apos;s door list (same data, same treatment) so the footer&apos;s “Subjects” link and the page&apos;s threshold agree. Not changed here.</p>
      </main>
    </div>
  );
}
