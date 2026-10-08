import { SUBJECTS } from "../data/subjects";
import { MotifGlyph } from "./MotifGlyph";

/* ════════════════════════════════════════════════════════════════════════
   STATIC COMPOSITIONS

   The stable stand-in for the live sculpture, drawn in the same palette and
   the same visual grammar. Shown when WebGL is unavailable *and* when the
   visitor has asked for reduced motion — in both cases each window still gets
   the composition that belongs to it, so nothing on the page reads as an
   empty box.

     armature  the hero / feature card — interlocking frames and beads
     motifs    the six subject motifs, opened out
     unified   the elements reconnected into one structure
     emblem    the compact academy seal
   ════════════════════════════════════════════════════════════════════════ */

export type StaticVariant = "armature" | "motifs" | "unified" | "emblem";

const TITLES: Record<StaticVariant, string> = {
  armature: "Interlocking sculpture of six subject frames",
  motifs: "The six subject motifs, opened out",
  unified: "The six subject elements reconnected into one structure",
  emblem: "The Tutors Academy emblem: concentric frames with six subject beads",
};

export function StaticSculpture({
  variant = "armature",
  className,
  title,
}: {
  variant?: StaticVariant;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={title ?? TITLES[variant]}
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx="200" cy="330" rx="120" ry="15" fill="#0b0b0c" opacity="0.07" />
      {variant === "armature" && <Armature />}
      {variant === "motifs" && <Motifs />}
      {variant === "unified" && <Unified />}
      {variant === "emblem" && <Emblem />}
    </svg>
  );
}

/* ── armature ──────────────────────────────────────────────────────────── */

function Armature() {
  const frames = [
    { rx: 118, ry: 118, rot: 0, stroke: "#21a896", w: 3, o: 0.5 },
    { rx: 118, ry: 46, rot: 0, stroke: "#21a896", w: 3, o: 0.42 },
    { rx: 118, ry: 46, rot: 60, stroke: "#21a896", w: 3, o: 0.38 },
    { rx: 118, ry: 46, rot: 120, stroke: "#21a896", w: 3, o: 0.38 },
    { rx: 100, ry: 100, rot: 0, stroke: "#c29a45", w: 2.5, o: 0.85 },
    { rx: 82, ry: 34, rot: 30, stroke: "#c29a45", w: 2.5, o: 0.7 },
    { rx: 82, ry: 34, rot: 90, stroke: "#c29a45", w: 2.5, o: 0.7 },
    { rx: 64, ry: 64, rot: 0, stroke: "#0b0b0c", w: 1.5, o: 0.2 },
  ];
  const beads = Array.from({ length: 18 }, (_, i) => {
    const ring = i % 3;
    const a = (i / 18) * Math.PI * 2 + ring * 0.35;
    const r = 118 - ring * 18;
    return {
      cx: 200 + Math.cos(a) * r,
      cy: 200 + Math.sin(a) * r * (ring === 0 ? 1 : 0.42),
      r: ring === 0 ? 5.5 : 4,
    };
  });

  return (
    <g>
      {frames.map((f, i) => (
        <ellipse
          key={i}
          cx="200"
          cy="200"
          rx={f.rx}
          ry={f.ry}
          transform={`rotate(${f.rot} 200 200)`}
          fill="none"
          stroke={f.stroke}
          strokeWidth={f.w}
          opacity={f.o}
        />
      ))}
      {beads.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill={i % 3 === 0 ? "#c29a45" : "#faf9f5"}
          stroke={i % 3 === 0 ? "#7d5f22" : "#d4d3cd"}
          strokeWidth="1"
        />
      ))}
      <circle cx="200" cy="200" r="7" fill="#c29a45" />
    </g>
  );
}

/* ── motifs ────────────────────────────────────────────────────────────── */

function Motifs() {
  return (
    <g>
      {SUBJECTS.map((s, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = 110 + col * 90;
        const cy = 145 + row * 110;
        return (
          <g key={s.id} transform={`translate(${cx - 32} ${cy - 32}) scale(2.67)`}>
            <circle
              cx="12"
              cy="12"
              r="11.2"
              fill={s.accentSoft}
              stroke={s.accent}
              strokeWidth="0.6"
              opacity="0.85"
            />
            <g style={{ color: s.accent }}>
              <MotifGlyph motif={s.motif} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/* ── unified ───────────────────────────────────────────────────────────── */

function Unified() {
  const chords = Array.from({ length: 12 }, (_, i) => {
    const a1 = (i / 12) * Math.PI * 2;
    const a2 = a1 + 1.7;
    return {
      x1: 200 + Math.cos(a1) * 108,
      y1: 200 + Math.sin(a1) * 108,
      x2: 200 + Math.cos(a2) * 108,
      y2: 200 + Math.sin(a2) * 108,
    };
  });
  const beads = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { cx: 200 + Math.cos(a) * 108, cy: 200 + Math.sin(a) * 108 };
  });

  return (
    <g>
      {SUBJECTS.map((s, i) => (
        <ellipse
          key={s.id}
          cx="200"
          cy="200"
          rx={112 - i * 9}
          ry={112 - i * 9}
          fill="none"
          stroke={s.accent}
          strokeWidth="1.6"
          opacity="0.34"
          transform={`rotate(${i * 30} 200 200)`}
        />
      ))}
      {chords.map((c, i) => (
        <line
          key={i}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke="#d4d3cd"
          strokeWidth="1.6"
        />
      ))}
      {beads.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r="5.5"
          fill={i % 2 ? "#c29a45" : "#faf9f5"}
          stroke={i % 2 ? "#7d5f22" : "#d4d3cd"}
          strokeWidth="1"
        />
      ))}
      <circle cx="200" cy="200" r="34" fill="none" stroke="#21a896" strokeWidth="2.4" opacity="0.6" />
      <circle cx="200" cy="200" r="9" fill="#0b0b0c" opacity="0.85" />
    </g>
  );
}

/* ── emblem ────────────────────────────────────────────────────────────── */

function Emblem() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    return {
      x1: 200 + Math.cos(a) * 62,
      y1: 200 + Math.sin(a) * 62,
      x2: 200 + Math.cos(a) * 84,
      y2: 200 + Math.sin(a) * 84,
    };
  });

  return (
    <g>
      <circle cx="200" cy="200" r="126" fill="none" stroke="#0b0b0c" strokeWidth="3" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="#c29a45" strokeWidth="4" />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#d4d3cd"
          strokeWidth="2.4"
        />
      ))}
      <circle cx="200" cy="200" r="50" fill="none" stroke="#21a896" strokeWidth="2.6" opacity="0.7" />
      {SUBJECTS.map((s, i) => {
        const a = (i / SUBJECTS.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            key={s.id}
            cx={200 + Math.cos(a) * 92}
            cy={200 + Math.sin(a) * 92}
            r="11"
            fill={s.accent}
            stroke="#fbfaf7"
            strokeWidth="2.5"
          />
        );
      })}
      <circle cx="200" cy="200" r="14" fill="#c29a45" />
    </g>
  );
}
