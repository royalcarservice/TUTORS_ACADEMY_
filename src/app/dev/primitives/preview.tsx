"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, Input, Progress, Textarea, taButtonSkin } from "@/components/ui";

const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: 0 };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)" };
const CELL: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--ta-space-2)", alignItems: "flex-start" };
const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" };

const ROLES = ["primary", "secondary", "ghost", "danger"] as const;

export default function PrimitivesSpecimen() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [reduced, setReduced] = useState(false);
  const [touch, setTouch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", theme);
    el.setAttribute("data-reduced-motion", reduced ? "on" : "off");
    return () => { el.removeAttribute("data-theme"); el.removeAttribute("data-reduced-motion"); };
  }, [theme, reduced]);

  const startSave = () => { setSaving(true); window.setTimeout(() => setSaving(false), 1600); };
  const startValidate = () => { setValidating(true); window.setTimeout(() => setValidating(false), 1600); };

  return (
    <>
    <a className="ta-skip" href="#prim-root">Skip to content</a>
    <main id="prim-root" data-density={density === "compact" ? "compact" : undefined} data-touch={touch || undefined}
      style={{ maxWidth: "100%", overflowX: "clip", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <style>{`
        [data-touch] :is(button,a,input,textarea){outline:2px dashed var(--ta-signal);outline-offset:2px;}
        .pm-row{display:flex;flex-wrap:wrap;gap:var(--ta-space-4);align-items:flex-start;}
        .pm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--ta-space-4);}
        .ta-skip{position:fixed;left:8px;top:8px;transform:translateY(-250%);z-index:100;padding:8px 12px;background:var(--ta-surface-raised);color:var(--ta-text-primary);border-radius:8px;outline:2px solid var(--ta-focus-ring);}
        .ta-skip:focus{transform:none;}
      `}</style>

      <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 2 · Step 5 — CORE PRIMITIVES · states matrix (dev-only)</p>
        <h1 style={H1}>Button · Surface · Field · Progress</h1>
        <p style={NOTE}>Behavior and skin are separate layers. Every visual below is token-driven; Phase 3 re-skins per subject through tokens only. Exactly ONE primary per view.</p>

        {/* controls */}
        <div className="pm-row" style={{ marginBottom: "var(--ta-space-6)" }} role="group" aria-label="Specimen controls">
          <Button variant="secondary" size="sm" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>{theme === "dark" ? "Light theme" : "Dark theme"}</Button>
          <Button variant="secondary" size="sm" onClick={() => setDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}>Density: {density}</Button>
          <Button variant="secondary" size="sm" onClick={() => setReduced((r) => !r)}>Reduced motion: {reduced ? "on" : "off"}</Button>
          <Button variant="secondary" size="sm" onClick={() => setTouch((t) => !t)}>Touch guides: {touch ? "on" : "off"}</Button>
        </div>

        {/* BUTTON MATRIX */}
        <h2 style={H2}>Button — roles × states</h2>
        <p style={NOTE}>hover / focus-visible / press are live — tab to them or press. Loading preserves width; disabled vs aria-disabled both shown.</p>
        {ROLES.map((role) => (
          <div key={role} style={{ marginBottom: "var(--ta-space-6)" }}>
            <div style={TAG}>{role}</div>
            <div className="pm-row" style={{ marginTop: "var(--ta-space-2)" }}>
              <div style={CELL}><span style={TAG}>default</span><Button variant={role} onClick={startSave}>Save changes</Button></div>
              <div style={CELL}><span style={TAG}>loading</span><Button variant={role} loading>Saving…</Button></div>
              <div style={CELL}><span style={TAG}>disabled</span><Button variant={role} disabled>Save changes</Button></div>
              <div style={CELL}><span style={TAG}>aria-disabled</span><Button variant={role} aria-disabled="true">Save changes</Button></div>
              <div style={CELL}><span style={TAG}>sm</span><Button variant={role} size="sm">Save</Button></div>
              <div style={CELL}><span style={TAG}>lg</span><Button variant={role} size="lg">Save changes</Button></div>
              <div style={CELL}><span style={TAG}>icon (named)</span><Button variant={role} size="icon" aria-label="Dismiss notification">✕</Button></div>
            </div>
          </div>
        ))}
        <div className="pm-row">
          <div style={CELL}><span style={TAG}>anchor shares ONE skin</span>
            <a className={taButtonSkin("secondary", "md")} data-variant="secondary" data-size="md" href="#field">View syllabus</a>
          </div>
          <div style={CELL}><span style={TAG}>real async (width preserved)</span><Button variant="primary" loading={saving} onClick={startSave}>{saving ? "Saving" : "Publish timetable"}</Button></div>
        </div>

        {/* CARD */}
        <h2 style={H2}>Surface / Card — variants + composition</h2>
        <div className="pm-grid">
          <Card><Card.Header><Card.Title>Flat (default)</Card.Title><Card.Description>Hairline signal, no elevation.</Card.Description></Card.Header><Card.Body><p style={{ ...NOTE, margin: 0 }}>Parents control spacing — cards are margin-free.</p></Card.Body></Card>
          <Card variant="raised"><Card.Header><Card.Title>Raised</Card.Title><Card.Description>Elevation only — no decorative border.</Card.Description></Card.Header></Card>
          <Card variant="inset"><Card.Header><Card.Title>Inset</Card.Title><Card.Description>Sunken well for quiet grouping.</Card.Description></Card.Header></Card>
          <Card variant="interactive" onClick={() => {}} role="link" tabIndex={0}>
            <Card.Media><div style={{ background: "color-mix(in srgb, var(--ta-accent-2) 30%, transparent)" }} /></Card.Media>
            <Card.Header><Card.Title>Interactive — one target</Card.Title><Card.Description>The whole card is a single link; no nested controls.</Card.Description></Card.Header>
          </Card>
          <Card>
            <Card.Header><Card.Title>Needs internal actions?</Card.Title><Card.Description>Then it is NOT interactive — plain card + separate buttons.</Card.Description></Card.Header>
            <Card.Footer style={{ display: "flex", gap: "var(--ta-space-2)" }}>
              <Button variant="secondary" size="sm">Resume</Button>
              <Button variant="ghost" size="sm">Archive</Button>
            </Card.Footer>
          </Card>
        </div>

        {/* FIELD + INPUT */}
        <h2 style={H2}>Field + Input — states with real copy</h2>
        <div className="pm-grid" id="field">
          <Field id="f-default" label="Student email" hint="We only use this for session reminders.">
            <Input placeholder="you@school.example" />
          </Field>
          <Field id="f-filled" label="Full name">
            <Input value="Amara Okafor" onChange={() => {}} />
          </Field>
          <Field id="f-disabled" label="School (locked)" hint="Managed by your administrator.">
            <Input value="Greenfield Secondary" disabled />
          </Field>
          <Field id="f-readonly" label="Student ID">
            <Input value="TA-20419" readOnly />
          </Field>
          <Field id="f-error" label="Parent / guardian email" required
            error={showError ? "That address looks incomplete — add a domain like @gmail.com." : undefined}
            hint="Used for consent and progress summaries.">
            <Input value={email} onChange={(e) => { setEmail(e.target.value); }} placeholder="name@domain.com" />
          </Field>
          <Field id="f-success" label="Promo code" success="Code applied — 10% off your first block.">
            <Input value="WELCOME10" onChange={() => {}} />
          </Field>
          <Field id="f-loading" label="Tutor access code" hint="Checking against your tutor's studio…">
            <Input validating={validating} placeholder="XXXX-XXXX" />
          </Field>
          <Field id="f-area" label="What should your tutor know?">
            <Textarea placeholder="Exams in May; weakest on algebraic fractions." />
          </Field>
        </div>
        <div className="pm-row" style={{ marginTop: "var(--ta-space-4)" }}>
          <Button variant="secondary" size="sm" onClick={() => setShowError((s) => !s)}>{showError ? "Clear error" : "Trigger error"}</Button>
          <Button variant="secondary" size="sm" onClick={startValidate}>Re-validate code</Button>
        </div>

        {/* PROGRESS */}
        <h2 style={H2}>Progress — determinate · near-complete · zero · indeterminate</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-4)", maxWidth: 560 }}>
          <Progress label="Algebra foundations" value={35} showValue />
          <Progress label="Revision checklist" value={92} showValue />
          <Progress label="New enrolment onboarding" value={0} showValue />
          <Progress label="Syncing your session notes" />
        </div>

        <p style={{ ...NOTE, marginTop: "var(--ta-space-section)" }}>Every state above is reachable by keyboard; focus is always visible, including on brass and inside error fields.</p>
      </div>
    </main>
    </>
  );
}
