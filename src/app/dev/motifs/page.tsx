import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";

import { Motif, isRoleAllowed } from "@/components/motif/motif";
import { READING_COLUMN, Room, Stage, type RoomMotifRole } from "@/components/motif/stage";
import { DENSITY_MULTIPLIER, MAX_COMMANDS, MAX_DOM_NODES, MAX_GEN_MS, ROLE_RULES } from "@/lib/motif/budgets";
import { MOTIF_RULES, MOTION_HOOKS } from "@/lib/motif/grammar";
import { DENSITY_LEVELS, MOTIF_KINDS, MOTIF_ROLES, type Density, type MotifKind, type MotifRole } from "@/lib/motif/types";
import { SUBJECTS } from "@/lib/subjects/subjects";

import { SURFACE, TEXT, blend, budget, contrast, determinism } from "./measure";

/* ════════════════════════════════════════════════════════════════════════
   DEV-ONLY MOTIF SPECIMEN · /dev/motifs — 404s in production.

   ZERO CLIENT JS ON PURPOSE. Unlike the earlier /dev routes this page is a
   SERVER component with no "use client" and no dynamic import: the motifs are
   in the HTML on first paint, which is the whole point of the step. Controls
   are links (query params), not state.
   ════════════════════════════════════════════════════════════════════════ */

const TAG: CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "var(--ta-tracking-caps)", textTransform: "uppercase" };
const H1: CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const PROSE: CSSProperties = { fontSize: "var(--ta-text-base)", lineHeight: "var(--ta-leading-body)", color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)", margin: 0 };
const CELL: CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-secondary)", padding: "6px 8px", borderBottom: "1px solid var(--ta-border-subtle)", textAlign: "left", verticalAlign: "top" };
const LINK: CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-min)", padding: "0 14px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", color: "var(--ta-text-primary)", textDecoration: "none", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };

const ROLE_ORDER: MotifRole[] = [...MOTIF_ROLES];
const PARAGRAPH: Record<string, string> = {
  mathematics: "A proof is a chain of small, unavoidable steps. Start from what is given, move only where a rule allows, and the conclusion arrives on its own. Read it slowly: every line earns the next.",
  physics: "Force does not announce itself; it shows up as a change in the path. Measure the bend, and you have measured the interaction. The field is the bookkeeping that makes the bend predictable.",
  chemistry: "A reaction is a rearrangement, not a creation. Bonds break, bonds form, and the atoms are the same ones you started with. What changed is how they are held together.",
  biology: "Growth repeats a rule at a smaller scale. The same branching instruction runs again and again, and the difference between a leaf and a tree is only how many times it ran.",
  english: "Reading is a rhythm before it is a meaning. The measure holds the eye, the baseline carries it, and the argument arrives because the page made room for it.",
  history: "The record is layered and incomplete. What survives is a fragment of what was written, and the gaps are part of the evidence. Read the sequence, then read what is missing.",
};

function Tile({ subject, kind, role, density, purpose, caption }: { subject: string; kind: MotifKind; role: MotifRole; density: Density; purpose: string; caption: string }) {
  const b = budget({ subject, kind, role, density, purpose }, true);
  const rule = ROLE_RULES[role];
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ position: "relative", overflow: "clip", background: "var(--ta-surface-base)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", height: role === "substrate" || role === "transition" ? 180 : role === "edge" ? 180 : role === "focus" ? 160 : 96 }}>
        {role === "edge" ? (
          <div style={{ position: "absolute", inset: 0, right: 0, left: "auto", width: "34%" }}>
            <Motif subject={subject} kind={kind} role={role} density={density} purpose={purpose} exclude={[READING_COLUMN]} />
          </div>
        ) : (
          <Motif subject={subject} kind={kind} role={role} density={density} purpose={purpose} exclude={[READING_COLUMN]} />
        )}
      </div>
      <figcaption style={{ ...TAG, marginTop: 6 }}>
        {caption} · opacity {rule.opacity} · {b.commands} cmds · {b.domNodes} nodes · {b.ms}ms
      </figcaption>
    </figure>
  );
}

function Panel({ subject, children, style }: { subject: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div data-subject={subject} style={{ position: "relative", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-pad-card)", overflow: "clip", ...style }}>
      {children}
    </div>
  );
}

export default async function DevMotifsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();

  const sp = await searchParams;
  const rawDensity = typeof sp.density === "string" ? sp.density : "balanced";
  const density: Density = DENSITY_LEVELS.includes(rawDensity as Density) ? (rawDensity as Density) : "balanced";
  const regen = typeof sp.regen === "string" ? sp.regen : "1";

  const subjects = SUBJECTS;
  const kindsMatch = subjects.map((s) => s.motif).join(",") === MOTIF_KINDS.join(",");

  /* Determinism: 100 generations per motif x role, compared byte-for-byte. */
  const detRows = subjects.flatMap((s) =>
    ROLE_ORDER.map((role) => {
      const d = determinism({ subject: s.id, kind: s.motif, role, density, purpose: role });
      return { subject: s.id, role, ...d };
    }),
  );

  /* Budgets: exactly what the renderer emits, measured. */
  const budgetRows = subjects.map((s) => {
    const per = ROLE_ORDER.map((role) => budget({ subject: s.id, kind: s.motif, role, density, purpose: role }, true));
    return {
      subject: s.id,
      commands: Math.max(...per.map((p) => p.commands)),
      domNodes: Math.max(...per.map((p) => p.domNodes)),
      ms: Math.max(...per.map((p) => p.ms)),
      elements: Math.max(...per.map((p) => p.elements)),
    };
  });

  /* Legibility: real text over the DENSEST motif, substrate and edge, both themes. */
  const legRows = subjects.flatMap((s) =>
    (["substrate", "edge"] as MotifRole[]).flatMap((role) => {
      const opacity = ROLE_RULES[role].opacity;
      return (["dark", "light"] as const).map((theme) => {
        const surface = SURFACE.base[theme];
        const accent = s.accent1[theme === "dark" ? "ink" : "ivory"];
        const worstPixel = blend(accent, surface, opacity);
        return {
          subject: s.id,
          role,
          theme,
          excluded: contrast(TEXT.primary[theme], surface),
          worst: contrast(TEXT.primary[theme], worstPixel),
          motifToSurface: contrast(worstPixel, surface),
          ceiling: ROLE_RULES[role].ceilingRatio,
        };
      });
    }),
  );
  const worstText = Math.min(...legRows.map((r) => Math.min(r.excluded, r.worst)));
  const ceilingBreaches = legRows.filter((r) => r.motifToSurface > r.ceiling);

  return (
    <div style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh", overflowX: "clip" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 3 · Step 3 — MOTIF GRAMMAR (dev-only)</p>
        <h1 style={H1}>Structure, not artwork</h1>
        <p style={NOTE}>
          Six rule sets, one primitive vocabulary, deterministic seeds. Static structure only: no animation, no ambient
          layer, no 3D, no transition choreography — those are 3.4 and 3.5. Every surface below is server-rendered with
          zero client JS; the geometry is in the HTML.
        </p>

        {/* ── controls (links, not state) ─────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2)", alignItems: "center" }}>
          <span style={TAG}>Density</span>
          {DENSITY_LEVELS.map((d) => (
            <a
              key={d}
              href={`/dev/motifs?density=${d}&regen=${regen}`}
              style={{ ...LINK, borderColor: d === density ? "var(--ta-accent-1)" : "var(--ta-border-strong)", color: d === density ? "var(--ta-accent-1)" : "var(--ta-text-primary)" }}
              aria-current={d === density ? "true" : undefined}
            >
              {d} · {DENSITY_MULTIPLIER[d]}x
            </a>
          ))}
          <span style={TAG}>Regenerate</span>
          <a href={`/dev/motifs?density=${density}&regen=${Number(regen) + 1}`} style={LINK}>
            Re-render (nonce {regen} → {Number(regen) + 1})
          </a>
          <span style={{ ...TAG, textTransform: "none" }}>
            Nonce {regen} is deliberately NOT part of the seed, so every hash below is unchanged by it.
          </span>
        </div>

        {/* ── 1 · determinism ─────────────────────────────────────────── */}
        <h2 style={H2}>1 · Determinism — 100 generations per motif, compared</h2>
        <p style={NOTE}>
          Seed = <code>subject:purpose:index</code>, hashed with FNV-1a (32-bit), streamed through mulberry32. No
          Math.random, no Date, no clock, no unordered iteration. Identical output means identical path data.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
            <thead>
              <tr>
                {["subject", "role", "seed", "hash", "runs", "identical"].map((h) => (
                  <th key={h} style={{ ...CELL, ...TAG }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detRows.map((r) => (
                <tr key={`${r.subject}-${r.role}`}>
                  <td style={CELL}>{r.subject}</td>
                  <td style={CELL}>{r.role}</td>
                  <td style={CELL}>{r.subject}:{r.role}:0</td>
                  <td style={CELL}>{r.hash}</td>
                  <td style={CELL}>{r.runs}</td>
                  <td style={{ ...CELL, color: r.identical ? "var(--ta-state-success)" : "var(--ta-state-danger)" }}>{r.identical ? "YES" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 2 · all six motifs x all five roles ─────────────────────── */}
        <h2 style={H2}>2 · Six motifs × five roles — current theme</h2>
        <p style={NOTE}>
          Role caps are enforced by the renderer, not by taste: substrate and transition are refused inside a Room, every
          role masks the reading column out, and each carries its own contrast ceiling.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-6)" }}>
          {subjects.map((s) => (
            <section key={s.id} data-subject={s.id} aria-label={`${s.name} motif roles`}>
              <p style={{ ...TAG, color: "var(--ta-accent-1)" }}>
                {s.name} · {s.motif} · density {s.density} → showing {density}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--ta-space-4)" }}>
                {ROLE_ORDER.map((role) => (
                  <Tile key={role} subject={s.id} kind={s.motif} role={role} density={density} purpose={role} caption={role} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── 3 · density scales structure, not weight ────────────────── */}
        <h2 style={H2}>3 · Density scales FEATURE COUNTS — opacity and weight are fixed</h2>
        <p style={NOTE}>
          Same subject, same role, same opacity ({ROLE_RULES.substrate.opacity}), three densities. Sparse is not a faded
          motif; it has fewer features. Multipliers: sparse 0.6×, balanced 1.0×, dense 1.4×.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-6)" }}>
          {subjects.map((s) => (
            <section key={s.id} data-subject={s.id} aria-label={`${s.name} density comparison`}>
              <p style={TAG}>{s.name}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--ta-space-4)" }}>
                {DENSITY_LEVELS.map((d) => (
                  <Tile key={d} subject={s.id} kind={s.motif} role="substrate" density={d} purpose={`density-${d}`} caption={`${d} ${DENSITY_MULTIPLIER[d]}x`} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── 4 · both themes ─────────────────────────────────────────── */}
        <h2 style={H2}>4 · Both themes — token-driven, no conditional JS</h2>
        <p style={NOTE}>
          Theme is app-wide (it follows the OS preference; the headless captures run once per preference). Identical
          markup in both: the accent and surface tokens swap under <code>{"data-theme=light"}</code>, with no conditional
          JS. Below: the current theme, plus an explicitly-scoped light block. Both themes are also proven numerically in
          the legibility table (section 5) and by the paired dark/light captures.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--ta-space-4)" }}>
          {subjects.map((s) => (
            <Tile key={s.id} subject={s.id} kind={s.motif} role="substrate" density={density} purpose="theme-current" caption={`${s.id} · current theme`} />
          ))}
        </div>
        <div data-theme="light" aria-label="light theme motifs">
          <p style={TAG}>light scope (explicit data-theme=light)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--ta-space-4)" }}>
            {subjects.map((s) => (
              <Tile key={s.id} subject={s.id} kind={s.motif} role="substrate" density={density} purpose="theme-light" caption={`${s.id} · light`} />
            ))}
          </div>
        </div>

        {/* ── 5 · legibility, live ────────────────────────────────────── */}
        <h2 style={H2}>5 · Legibility, live — real text over the DENSEST motif</h2>
        <p style={NOTE}>
          The reading column is masked out of every motif, so the pixels under this text are pure surface. The worst case
          (motif at full role opacity, unmasked) is measured too and printed: both must clear WCAG AA. Lowest measured
          ratio on this page: <strong>{worstText}</strong>.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
          {subjects.map((s) => (
            <section key={s.id} aria-label={`${s.name} legibility`}>
              <p style={TAG}>{s.name} — dense, substrate, reading column excluded</p>
              <Panel subject={s.id}>
                <Motif subject={s.id} kind={s.motif} role="substrate" density="dense" purpose="legibility-probe" exclude={[READING_COLUMN]} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <p style={PROSE}>{PARAGRAPH[s.id]}</p>
                </div>
              </Panel>
              <div style={{ overflowX: "auto", marginTop: "var(--ta-space-2)" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
                  <thead>
                    <tr>
                      {["role", "theme", "text on excluded surface", "text if unmasked (worst)", "AA 4.5", "motif:surface", "ceiling", "pass"].map((h) => (
                        <th key={h} style={{ ...CELL, ...TAG }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {legRows
                      .filter((r) => r.subject === s.id)
                      .map((r) => (
                        <tr key={`${r.role}-${r.theme}`}>
                          <td style={CELL}>{r.role}</td>
                          <td style={CELL}>{r.theme}</td>
                          <td style={CELL}>{r.excluded}</td>
                          <td style={CELL}>{r.worst}</td>
                          <td style={CELL}>{Math.min(r.excluded, r.worst) >= 4.5 ? "PASS" : "FAIL"}</td>
                          <td style={CELL}>{r.motifToSurface}</td>
                          <td style={CELL}>{r.ceiling}</td>
                          <td style={{ ...CELL, color: r.motifToSurface <= r.ceiling ? "var(--ta-state-success)" : "var(--ta-state-danger)" }}>
                            {r.motifToSurface <= r.ceiling ? "PASS" : "FAIL"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
        <p style={NOTE}>Ceiling breaches across all subjects, roles and themes: {ceilingBreaches.length}.</p>

        {/* ── 6 · Stage vs Room ───────────────────────────────────────── */}
        <h2 style={H2}>6 · Stage vs Room — substrate is impossible in a Room</h2>
        <p style={NOTE}>
          Enforced twice: <code>RoomMotifRole</code> excludes substrate and transition at the type level, and
          <code>{`isRoleAllowed(room, substrate) === ${String(isRoleAllowed("room", "substrate"))}`}</code> at runtime.
          A Room keeps the accent, drops one density step, and never renders a substrate.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
          {subjects.slice(0, 3).map((s) => (
            <section key={s.id} aria-label={`${s.name} stage and room`}>
              <p style={TAG}>{s.name} · Stage (substrate permitted, density {s.density})</p>
              <Stage subject={s.id} motif={s.motif} density={s.density} purpose="specimen-stage" style={{ padding: "var(--ta-pad-card)", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-subtle)" }}>
                <p style={PROSE}>{PARAGRAPH[s.id]}</p>
                <div style={{ marginTop: "var(--ta-space-4)" }}>
                  <p style={TAG}>{s.name} · Room nested in the Stage (no substrate, density reduced)</p>
                  <Room subject={s.id} motif={s.motif} density={s.density} role="edge" purpose="specimen-room">
                    <p style={{ ...PROSE, fontSize: "var(--ta-text-sm)" }}>Recordings, notes and progress live in Rooms. The accent stays; the field does not follow you in.</p>
                  </Room>
                </div>
              </Stage>
            </section>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-4)" }}>
          {(["edge", "divider", "focus"] as RoomMotifRole[]).map((role) => (
            <div key={role}>
              <p style={TAG}>Room roles that DO exist · {role}</p>
              {subjects.slice(0, 1).map((s) => (
                <Room key={s.id} subject={s.id} motif={s.motif} density={s.density} role={role} purpose={`room-${role}`} style={{ minHeight: 160 }}>
                  <p style={{ ...PROSE, fontSize: "var(--ta-text-sm)" }}>{role} inside a Room — accent retained, substrate refused.</p>
                </Room>
              ))}
            </div>
          ))}
        </div>

        {/* ── 7 · budgets ─────────────────────────────────────────────── */}
        <h2 style={H2}>7 · Budgets — measured against hard ceilings</h2>
        <p style={NOTE}>
          Ceilings: {MAX_COMMANDS} path commands, {MAX_DOM_NODES} SVG child elements, {MAX_GEN_MS}ms generation per
          surface. Worst role per subject, density {density}. Grouping by layer × width × paint is what keeps the DOM
          count single-digit.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
            <thead>
              <tr>
                {["subject", "elements", "commands / cap", "dom nodes / cap", "gen ms / cap", "pass"].map((h) => (
                  <th key={h} style={{ ...CELL, ...TAG }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetRows.map((r) => {
                const pass = r.commands <= MAX_COMMANDS && r.domNodes <= MAX_DOM_NODES && r.ms <= MAX_GEN_MS;
                return (
                  <tr key={r.subject}>
                    <td style={CELL}>{r.subject}</td>
                    <td style={CELL}>{r.elements}</td>
                    <td style={CELL}>
                      {r.commands} / {MAX_COMMANDS}
                    </td>
                    <td style={CELL}>
                      {r.domNodes} / {MAX_DOM_NODES}
                    </td>
                    <td style={CELL}>
                      {r.ms} / {MAX_GEN_MS}
                    </td>
                    <td style={{ ...CELL, color: pass ? "var(--ta-state-success)" : "var(--ta-state-danger)" }}>{pass ? "PASS" : "FAIL"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── 8 · how the grammar works ───────────────────────────────── */}
        <h2 style={H2}>8 · How the grammar works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--ta-space-6)" }}>
          {MOTIF_KINDS.map((k) => (
            <div key={k} style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-pad-card)" }}>
              <p style={{ ...TAG, marginBottom: 6 }}>{k}</p>
              <p style={{ ...PROSE, fontSize: "var(--ta-text-sm)" }}>{MOTIF_RULES[k].idea}</p>
              <dl style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-secondary)" }}>
                <dt style={TAG}>angles / curves</dt>
                <dd style={{ margin: "0 0 8px" }}>{MOTIF_RULES[k].angles}</dd>
                <dt style={TAG}>emphasis</dt>
                <dd style={{ margin: "0 0 8px" }}>
                  {MOTIF_RULES[k].emphasis} — {MOTIF_RULES[k].emphasisRarity}
                </dd>
                <dt style={TAG}>never</dt>
                <dd style={{ margin: "0 0 8px" }}>{MOTIF_RULES[k].never.join(" · ")}</dd>
                <dt style={TAG}>density</dt>
                <dd style={{ margin: "0 0 8px" }}>{MOTIF_RULES[k].densityScaling}</dd>
                <dt style={TAG}>3.5 hooks ({MOTION_HOOKS[k].motionChar})</dt>
                <dd style={{ margin: 0, fontFamily: "var(--ta-font-mono)" }}>{MOTION_HOOKS[k].hooks.join(", ")}</dd>
              </dl>
            </div>
          ))}
        </div>
        <p style={{ ...NOTE, marginTop: "var(--ta-space-4)" }}>
          Primitives: LINE, POLYLINE, CURVE, NODE, EDGE, BAND, FIELD — pure geometry producers returning data, never
          markup, never the viewport. Roles own canonical composition boxes (substrate 1000×600, edge 360×600, divider
          1000×96, focus 360×360) so generation is viewport-independent and server/client geometry is identical by
          construction. Full spec: <code>src/lib/motif/MOTIF_GRAMMAR.md</code>.
        </p>

        {/* ── 9 · closed set + real vs deferred ───────────────────────── */}
        <h2 style={H2}>9 · Closed set, and what is deferred</h2>
        <p style={NOTE}>
          Six motifs, inherited from the 3.1 schema — no seventh exists and there is no registry to extend. Kind order
          matches the schema exactly: <strong>{kindsMatch ? "YES" : "NO"}</strong>.
        </p>
        <ul style={{ ...PROSE, fontSize: "var(--ta-text-sm)", paddingLeft: 20 }}>
          <li>REAL here: primitives, six rule sets, seeds and determinism, roles and caps, density scaling, the SSR renderer, content exclusion, Stage/Room enforcement, budgets.</li>
          <li>DEFERRED: ambient motion (3.4), 3D / WebGL (3.4), the subject switch transition (3.5). The parameters those steps animate already exist on every element (see the 3.5 hooks above); nothing is stubbed.</li>
          <li>NOT BUILT: no homepage, no subject routes, no raster assets, no new dependencies.</li>
        </ul>
      </main>
    </div>
  );
}
