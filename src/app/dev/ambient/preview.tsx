"use client";

import { useRef, useState } from "react";

import { AmbientStage, type AmbientApi, type AmbientState, type AmbientSubject } from "@/components/ambient/ambient-stage";

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "var(--ta-tracking-caps)", textTransform: "uppercase" };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 14px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-secondary)" };

const RECOMMENDATIONS: { subject: string; verdict: string; body: string }[] = [
  {
    subject: "Physics — field",
    verdict: "WEBGL WORTHWHILE (moderate)",
    body: "Streamlines genuinely earn depth: field lines at layered z with the emphasised vector nearest reads as force in space. Grammar params driving it: streamline count, strength, centre, direction. Cost: shares the one lattice renderer pattern (~few KB), 2 draw calls, low per-frame. Risk: low. Recommend AFTER Mathematics proves the lifecycle.",
  },
  {
    subject: "Chemistry — bonds",
    verdict: "WEBGL WORTHWHILE (moderate)",
    body: "A bond graph in 3D with open reaction sites catching the eye is spatial and honest. Params: node positions, valence, bond angles, double-bond emphasis. Cost similar to Physics. Risk: moderate (node/bond layout must stay legible; keep parallax tiny). Recommend as a candidate.",
  },
  {
    subject: "Biology — living",
    verdict: "BORDERLINE — prefer vector",
    body: "Branching growth reads beautifully as layered SVG membranes with opacity; 3D adds little beyond cost and risks looking organic-messy. Vector atmosphere: stacked membrane curves with a slow CSS drift (ta-ambient). What is lost: true parallax. Recommend vector first; 3D only if a cheap depth pass proves additive.",
  },
  {
    subject: "English — typographic",
    verdict: "DO NOT USE 3D",
    body: "A page of rules and measures is inherently flat; 3D would decorate, not structure. Token-driven CSS/SVG depth (baseline rules receding via opacity, a rose margin rule) is better and ~free. What is lost: nothing meaningful. Recommend vector only.",
  },
  {
    subject: "History — strata",
    verdict: "DO NOT USE 3D (or trivial depth)",
    body: "Strata are archival layers; a subtle CSS translateZ/opacity stack conveys depth at a fraction of the cost with a better result. 3D buys spectacle, not meaning. What is lost: none. Recommend vector/CSS depth only.",
  },
];

export default function AmbientSpecimen({ subject }: { subject: AmbientSubject }) {
  const api = useRef<AmbientApi | null>(null);
  const [state, setState] = useState<AmbientState | null>(null);
  const [roomState, setRoomState] = useState<AmbientState | null>(null);
  const [forced, setForced] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [override, setOverride] = useState<Record<string, unknown> | null>(null);
  const [stressMounted, setStressMounted] = useState(false);
  const [stress, setStress] = useState<string>("");
  const [running, setRunning] = useState(false);

  const loseContext = () => api.current?.loseContext();
  const suspend = () => api.current?.suspend("manual kill switch");

  const runStress = async () => {
    setRunning(true);
    const { GLOBAL_RESOURCES } = await import("@/lib/ambient/webgl-lattice");
    const before = { ...GLOBAL_RESOURCES.created };
    for (let i = 0; i < 30; i++) {
      setStressMounted(true);
      await new Promise((r) => setTimeout(r, 90));
      setStressMounted(false);
      await new Promise((r) => setTimeout(r, 50));
    }
    await new Promise((r) => setTimeout(r, 200));
    const after = { ...GLOBAL_RESOURCES.created, disposed: { ...GLOBAL_RESOURCES.disposed } };
    setStress(
      `30x mount/unmount\ncreated before: ${JSON.stringify(before)}\ncreated after : buffers=${after.buffers} programs=${after.programs}\ndisposed after : buffers=${after.disposed.buffers} programs=${after.disposed.programs}\nleak: ${after.disposed.buffers >= after.buffers && after.disposed.programs >= after.programs ? "NONE (disposed ≥ created)" : "CHECK"}`,
    );
    setRunning(false);
  };

  return (
    <div style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh", overflowX: "clip" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 3 · Step 5 — THE AMBIENT LAYER (dev-only)</p>
        <h1 style={H1}>The Lattice, in air</h1>
        <p style={NOTE}>
          One canvas, one role, Stage only. The SVG substrate is the baseline and renders first; the WebGL lens is
          lazy-loaded on top and never required. Reduced-motion, no-JS, no-WebGL, low-power and small screens all get the
          complete vector environment. Raw WebGL — NO 3D library added.
        </p>

        {/* kill switches */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2)", marginBottom: "var(--ta-space-3)" }}>
          <button type="button" onClick={() => setForced(forced === true ? null : true)} style={{ ...BTN, color: forced === true ? "var(--ta-accent-1)" : undefined }}>force on</button>
          <button type="button" onClick={() => setReduced(!reduced)} style={{ ...BTN, color: reduced ? "var(--ta-accent-1)" : undefined }} aria-pressed={reduced}>reduced motion</button>
          <button type="button" onClick={() => setOverride(override?.smallScreen ? null : { smallScreen: true })} style={{ ...BTN, color: override?.smallScreen ? "var(--ta-accent-1)" : undefined }}>small screen</button>
          <button type="button" onClick={() => setOverride(override?.lowPower ? null : { lowPower: true })} style={{ ...BTN, color: override?.lowPower ? "var(--ta-accent-1)" : undefined }}>low power</button>
          <button type="button" onClick={() => setOverride(override?.webgl === false ? null : { webgl: false })} style={{ ...BTN, color: override?.webgl === false ? "var(--ta-accent-1)" : undefined }}>no webgl</button>
          <button type="button" onClick={suspend} style={BTN}>frame-budget exceeded</button>
          <button type="button" onClick={loseContext} style={BTN}>force context loss</button>
        </div>

        {/* THE STAGE */}
        <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", overflow: "clip" }}>
          <AmbientStage subject={subject} scope="stage" forced={forced} reduced={reduced} devOverride={override as never} apiRef={api} onState={setState}>
            <div style={{ padding: "var(--ta-space-6)", maxWidth: "var(--ta-measure)" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", color: "var(--ta-accent-1)" }}>{subject.name}</h2>
              <p style={{ color: "var(--ta-text-secondary)", lineHeight: 1.6 }}>
                A proof is a chain of small, unavoidable steps. The lattice breathes behind this text on a tens-of-seconds
                cycle — atmosphere, not animation. Scroll away or blur the tab and it stops entirely.
              </p>
            </div>
          </AmbientStage>
        </div>

        {stressMounted && (
          <div style={{ height: 0, overflow: "hidden" }} aria-hidden="true">
            <AmbientStage subject={subject} scope="stage" forced={true} />
          </div>
        )}

        {/* readout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-4)" }}>
          <div>
            <p style={TAG}>Load state + frame readout</p>
            <pre data-ambient-readout style={{ ...MONO, margin: 0, whiteSpace: "pre-wrap" }}>
              {state
                ? `load: ${state.loadState}\nwhy: ${state.reasons.join("; ")}\nframe: ${state.stats?.frameMs ?? "—"}ms\ndraw calls: ${state.stats?.drawCalls ?? "—"}\nvertices: ${state.stats?.vertices ?? "—"}\ndpr: ${state.stats?.dpr ?? "—"}\nrunning: ${state.stats?.running ?? false}`
                : "—"}
            </pre>
          </div>
          <div>
            <p style={TAG}>Stress / disposal</p>
            <button type="button" onClick={runStress} disabled={running} style={BTN}>
              {running ? "running…" : "30x mount/unmount"}
            </button>
            <pre data-ambient-stress style={{ ...MONO, margin: "var(--ta-space-2) 0 0", whiteSpace: "pre-wrap" }}>{stress || "—"}</pre>
          </div>
        </div>

        {/* room forbids */}
        <h2 style={H2}>Room forbids the canvas</h2>
        <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-pad-card)", background: "var(--ta-surface-raised)" }}>
          <AmbientStage subject={subject} scope="room" onState={setRoomState}>
            <p style={{ ...NOTE, margin: 0 }}>This Room attempted an ambient canvas. It is refused in code.</p>
          </AmbientStage>
          <p data-room-refused style={MONO}>room refused: {String(roomState?.refused)} · load: {roomState?.loadState} · canvas elements in room: n/a (not rendered)</p>
        </div>

        {/* recommendations */}
        <h2 style={H2}>The other five subjects — recommendation, not implementation</h2>
        <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
          {RECOMMENDATIONS.map((r) => (
            <div key={r.subject} style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-pad-card)" }}>
              <p style={{ ...TAG, color: "var(--ta-accent-1)", marginBottom: 4 }}>{r.subject} — {r.verdict}</p>
              <p style={{ ...NOTE, margin: 0 }}>{r.body}</p>
            </div>
          ))}
        </div>

        <h2 style={H2}>Real vs deferred</h2>
        <ul style={{ ...NOTE, paddingLeft: 20 }}>
          <li>REAL: the Mathematics ambient lens (raw WebGL), lifecycle enforcement, budgets, disposal, context-loss fallback, eligibility/battery logic, the renderer contract.</li>
          <li>DEFERRED: the other five subjects (await approval of the recommendation above), hero integration (Phase 4), environment shell (Step 3.6).</li>
        </ul>
      </main>
    </div>
  );
}
