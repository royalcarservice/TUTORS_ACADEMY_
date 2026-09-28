import { notFound } from "next/navigation";

import { PLATFORM_MODULES } from "@/config/modules";
import { collectCandidates, explainResolution, judge, nextActionFor, PROVIDERS, resolverStateFor, TIER_1_WINDOW_BEFORE_START_MINUTES, TREATMENT, type Considered } from "@/lib/next-action";

import { danglingProvider, FUTURE, FUTURE_INPUT, malformedDateProvider, MATRIX, NOW, pretendLive, throwingProvider } from "./fixtures";

/* DEV-ONLY SPECIMEN · /dev/next-action — 404s in production.
 * The engine run on fixtures, with every verdict shown, so any answer can be
 * reconstructed by eye. Frames are the production shell component rendering
 * the engine's answer (see ./frame). Nothing here is reachable in prod.     */

export const dynamic = "force-dynamic";

const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const H3: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)", fontWeight: 500, margin: "var(--ta-space-6) 0 var(--ta-space-2)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const CODE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };

function Frame({ q, w = 390, h = 620, title, noJs }: { q: string; w?: number; h?: number; title: string; noJs?: boolean }) {
  return (
    <figure style={{ margin: 0, width: w }}>
      <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{title}</figcaption>
      <div style={{ width: w, height: h, overflow: "hidden", border: "1px solid var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" }}>
        <iframe src={`/dev/next-action/frame?${q}`} title={title} width={w} height={h} loading="lazy" sandbox={noJs ? "" : undefined} style={{ border: 0, width: w, height: h }} />
      </div>
    </figure>
  );
}

function Why({ considered, winner }: { considered: Considered[]; winner: string | null }) {
  const rows = [...considered].sort((a, b) => (a.verdict.accepted && b.verdict.accepted ? a.verdict.sortKey.localeCompare(b.verdict.sortKey) : a.verdict.accepted ? -1 : b.verdict.accepted ? 1 : 0));
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead><tr>{["", "candidate", "tier", "kind", "verdict", "sort key / reason"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map(({ candidate: c, verdict: v }) => (
          <tr key={c.id} style={c.id === winner ? { background: "var(--ta-surface-raised)" } : undefined}>
            <td style={{ ...TD, ...CODE }}>{c.id === winner ? "WINNER" : ""}</td>
            <td style={{ ...TD, ...CODE }}>{c.id}</td>
            <td style={TD}>{c.tier}</td>
            <td style={TD}>{c.kind}</td>
            <td style={{ ...TD, ...CODE }}>{v.accepted ? "accepted" : "rejected"}</td>
            <td style={{ ...TD, ...CODE, color: "var(--ta-text-secondary)" }}>{v.accepted ? v.sortKey : v.reason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DevNextActionPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const live = PLATFORM_MODULES.filter((m) => m.status === "live").map((m) => m.id);
  const realState = resolverStateFor(FUTURE_INPUT);
  const pretend = { ...realState, ...pretendLive({}) };
  const breakage = [
    { label: "(a) a provider that throws", r: nextActionFor(MATRIX[2].input, [throwingProvider, ...PROVIDERS]) },
    { label: "(b) a candidate with a 404 href", r: nextActionFor(MATRIX[2].input, [danglingProvider, ...PROVIDERS]) },
    { label: "(c) a candidate with a malformed date", r: nextActionFor(MATRIX[2].input, [malformedDateProvider, ...PROVIDERS]) },
    { label: "(d) ONLY a throwing provider — resolution fails entirely", r: nextActionFor(MATRIX[2].input, [throwingProvider]) },
  ];
  const byId = Object.fromEntries(FUTURE.map((f) => [f.id, f.candidate]));
  const tierProof = explainResolution(pretend, [byId.t3, byId.t2, byId["t1-live"]], NOW);
  const tierProofNoExp = explainResolution(pretend, [byId.t3, byId.t2, byId["t1-no-expiry"]], NOW);

  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <p style={MONO}>Dev specimen · Phase 5 · Step 4</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The next-action engine</h1>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
        <strong>Real today:</strong> the resolver, the provider contract, the enrolment provider (Tier 3 — resume / begin from real enrolment + environment_state rows) and the origin provider (Tier 4 — the choice). The shell&apos;s primary surface renders the engine&apos;s one answer, server-side.{" "}
        <strong>Fixtures only:</strong> every Tier 1 and Tier 2 candidate on this page. No shipped provider can emit them; the capabilities they depend on (live-classroom, recorded-classes, assignments) are <em>planned</em> in src/config/modules, and the resolver rejects them for that reason. Fixture rows on this page never reach production.
      </p>
      <p style={NOTE}>Clock passed to every run: <span style={CODE}>{NOW}</span>. Live capabilities from the registry: <span style={CODE}>{live.join(", ")}</span>. Tier 1 window: <span style={CODE}>{TIER_1_WINDOW_BEFORE_START_MINUTES} min before start → class end</span> (P7&apos;s to tune). Treatments: <span style={CODE}>{Object.entries(TREATMENT).map(([k, v]) => `${k}→${v}`).join(" · ")}</span>.</p>

      <h2 style={H2}>State matrix · WHY THIS ANSWER</h2>
      <p style={NOTE}>The real providers on fixture rows. Every candidate considered, its tier, its sort key (ascending; lowest wins) or the reason it was rejected.</p>
      {MATRIX.map((row) => {
        const r = nextActionFor(row.input);
        return (
          <section key={row.id} style={{ marginTop: "var(--ta-space-8)" }}>
            <h3 style={H3}>{row.label}</h3>
            <p style={{ ...NOTE, ...CODE }}>winner: {r.action.id} · «{r.action.eyebrow} · {r.action.title} · {r.action.detail ?? "(no detail)"} · {r.action.cta} → {r.action.href}» · fellBack={String(r.fellBack)}</p>
            {r.resolution && <Why considered={r.resolution.considered} winner={r.action.id} />}
          </section>
        );
      })}

      <h2 style={H2}>Future fixtures · the resolver&apos;s verdict under the REAL registry</h2>
      <p style={NOTE}>Judged for a student enrolled in physics, entered yesterday. Only the Tier 3 fixture is accepted today; every other is rejected with its reason.</p>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["fixture", "candidate", "tier", "verdict", "sort key / reason"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {FUTURE.map((f) => { const v = judge(f.candidate, realState, NOW); return (
            <tr key={f.id}><td style={TD}>{f.label}</td><td style={{ ...TD, ...CODE }}>{f.candidate.id}</td><td style={TD}>{f.candidate.tier}</td><td style={{ ...TD, ...CODE }}>{v.accepted ? "accepted" : "rejected"}</td><td style={{ ...TD, ...CODE, color: "var(--ta-text-secondary)" }}>{v.accepted ? v.sortKey : v.reason}</td></tr>
          ); })}
        </tbody>
      </table>

      <h2 style={H2}>Tier ordering proof · capabilities PRETENDED live</h2>
      <p style={NOTE}>Same fixtures with live-classroom, recorded-classes and assignments pretended live, so the ORDER itself is visible: a Tier 1 with a live expiry beats a Tier 2 beats a Tier 3.</p>
      <Why considered={tierProof.considered} winner={tierProof.winner?.id ?? null} />
      <h3 style={H3}>…then the Tier 1 candidate loses its expiry: REJECTED, not demoted</h3>
      <Why considered={tierProofNoExp.considered} winner={tierProofNoExp.winner?.id ?? null} />

      <h2 style={H2}>Deliberate breakage (4.9&apos;s method)</h2>
      <p style={NOTE}>Resolution never throws. A broken provider is isolated; a bad candidate is rejected; if nothing survives, the benign action (most recent environment, else the choice) is rendered — never blank, never an error.</p>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["case", "failed providers", "surface renders", "fell back to benign"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {breakage.map((b) => (
            <tr key={b.label}><td style={TD}>{b.label}</td><td style={{ ...TD, ...CODE }}>{b.r.failedProviders.join(", ") || "—"}</td><td style={{ ...TD, ...CODE }}>{b.r.action.id} · «{b.r.action.eyebrow} · {b.r.action.title} · {b.r.action.cta}»</td><td style={{ ...TD, ...CODE }}>{String(b.r.fellBack)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={H2}>The primary surface · each accepted answer · 390</h2>
      <p style={NOTE}>The production shell rendering the engine&apos;s answer. Matrix rows first; then the one future fixture the real registry accepts (Tier 3), and the Tier 1 / Tier 2 fixtures as they would look <em>if</em> their capability were live — a specimen, labelled here and only here.</p>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap" }}>
        {MATRIX.map((row) => <Frame key={row.id} q={`m=${row.id}&theme=dark`} title={row.id} />)}
      </div>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        {FUTURE.filter((f) => judge(f.candidate, pretend, NOW).accepted).map((f) => <Frame key={f.id} q={`f=${f.id}&theme=light`} title={`FIXTURE · ${f.id}${judge(f.candidate, realState, NOW).accepted ? "" : " · capability not built"}`} />)}
      </div>

      <h2 style={H2}>Grayscale · reduced motion · no JavaScript · 390</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap" }}>
        <Frame q="m=one-entered&theme=dark&gray=1" title="grayscale · one-entered" />
        <Frame q="m=one-never&theme=light&gray=1" title="grayscale · one-never" />
        <Frame q="m=four-mixed&theme=dark&rm=1" title="reduced motion · four-mixed" />
        <Frame q="m=four-mixed&theme=light" title="no JavaScript · four-mixed (sandboxed iframe)" noJs />
        <Frame q="m=none&theme=light" title="no JavaScript · none" noJs />
      </div>

      <h2 style={H2}>Provider registry</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr>{["provider", "gated by module", "module status", "phase"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>{PROVIDERS.map((p) => <tr key={p.id}><td style={{ ...TD, ...CODE }}>{p.id}</td><td style={{ ...TD, ...CODE }}>{p.capability}</td><td style={TD}>{PLATFORM_MODULES.find((m) => m.id === p.capability)?.status}</td><td style={TD}>{p.phase}</td></tr>)}</tbody>
      </table>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-4)" }}>Candidates the shipped providers emit for the four-mixed row: <span style={CODE}>{collectCandidates(PROVIDERS, MATRIX[3].input).candidates.map((c) => c.id).join(", ")}</span>. The contract every future provider signs is in <span style={CODE}>src/lib/next-action/providers.ts</span>; the extension map for P6–P9 is <span style={CODE}>docs/NEXT_ACTION_EXTENSION.md</span>.</p>
    </main>
  );
}
