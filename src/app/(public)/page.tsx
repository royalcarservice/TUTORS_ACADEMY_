import type { Metadata } from "next";
import Link from "next/link";

import { ValleyJourney } from "@/components/home/valley-journey";
import { CarouselJourney } from "@/components/home/carousel-journey";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Tutors Academy — Where curiosity rises",
  description:
    "Personalised tutoring inside seven living subject environments. Learn, grow, succeed — with a tutor placed in your subject.",
};

/* THE MORNING STUDY SANCTUARY (DEC-048, owner pivot 2026-10-09).
   Deliberate pivot: the midnight-navy night meadow is overridden by warm
   morning sunlight — ivory substrates, navy typography, champagne gold.
   Routing, doors, copy and the shared-canvas gallery all stand; only the
   atmosphere changed. HTML first: every word renders without JavaScript. */

const CANVAS = "#FDFBF7"; // warm ivory primary canvas
const CREAM = "#F9F6F0";
const ALABASTER = "#F4EFE6";
const NAVY = "#0A192F"; // deep academic navy
const NAVY_SOFT = "#0F172A";
const SLATE = "#475569"; // refined slate navy secondary text
const SLATE_DEEP = "#334155";
const GOLD = "#C5A059"; // champagne gold
const GOLD_BRIGHT = "#D4AF37";

const CARD_SHADOW =
  "0 12px 36px -8px rgba(15,23,42,0.06), 0 4px 12px -2px rgba(212,175,55,0.08)";

const SERIF: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontWeight: 500 };

export default function HomePage() {
  return (
    <div style={{ background: CANVAS, color: NAVY }}>
      <style>{`
        .ta-cta-primary { transition: box-shadow .25s ease, transform .25s ease; }
        .ta-cta-primary:hover, .ta-cta-primary:focus-visible {
          box-shadow: 0 0 30px rgba(212,175,55,0.4), 0 4px 12px -2px rgba(212,175,55,0.25);
          transform: translateY(-1px);
        }
        .ta-cta-secondary { transition: box-shadow .25s ease, background-color .25s ease; }
        .ta-cta-secondary:hover, .ta-cta-secondary:focus-visible {
          box-shadow: 0 8px 24px -8px rgba(10,25,47,0.35);
          background-color: #16294a;
        }
        .ta-btn { transition: transform .25s ease, box-shadow .25s ease, background-color .25s ease; }
        .ta-btn:hover { transform: translateY(-1px) scale(1.02); }
        .ta-btn-solid { background: #FFF9F0; color: #0A192F; box-shadow: 0 6px 24px -6px rgba(8,22,40,0.35); }
        .ta-btn-solid:hover { box-shadow: 0 0 26px rgba(255,255,255,0.45), 0 8px 28px -8px rgba(8,22,40,0.4); }
        .ta-btn-solid:focus-visible { outline: 2px solid #0A192F; outline-offset: 3px; }
        .ta-btn-glass { color: #FFFFFF; text-shadow: 0 1px 10px rgba(8,22,40,0.4); }
        .ta-btn-glass:hover { background-color: rgba(255,255,255,0.12); }
        .ta-btn-glass:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .ta-btn:hover { transform: none; } }
        .ta-quiet-link { transition: color .2s ease; }
        .ta-quiet-link:hover, .ta-quiet-link:focus-visible { color: ${NAVY} !important; }
        @media (prefers-reduced-motion: reduce) {
          .ta-cta-primary:hover, .ta-cta-secondary:hover { transform: none; }
        }
      `}</style>

      {/* ── HERO → VALLEY JOURNEY (DEC-051): pinned scroll transition into the gallery ── */}
      <ValleyJourney />

      {/* ── SECTION 2 · THE CORE DISCIPLINES — INTERACTIVE 3D GALLERY (DEC-047) ── */}
      <CarouselJourney />

      {/* ── SECTION 3 · HOW WE MENTOR ──────────────────────────────────── */}
      <section id="mentor" className="mx-auto max-w-[96rem] px-4 py-24 sm:px-6 lg:px-8" style={{ background: CREAM }} aria-labelledby="mentor-h">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>The pedagogical difference</p>
        <h2 id="mentor-h" className="mt-4 max-w-2xl text-3xl sm:text-4xl" style={{ ...SERIF, color: NAVY }}>How we mentor.</h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {[
            ["Individual Intellectual Arcs", "Progression tailored to the learner in front of the tutor. No conveyor belts, no one-size-fits-all syllabus march — the arc bends to the student, never the reverse."],
            ["Relational Mentorship", "Real subject masters who guide thinking. The study lens scaffolds with questions and hints and never supplies answers — the understanding is earned, so it holds."],
            ["Record of Mastery", "Milestones co-certified by tutor and student, preserved as a record of real understanding. Achievement substantiated in words, not scores or ranks."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="h-px w-10" style={{ background: GOLD_BRIGHT }} />
              <h3 className="mt-4 text-lg" style={{ ...SERIF, color: NAVY_SOFT }}>{t}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: SLATE }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 · THE STUDENT JOURNEY ────────────────────────────── */}
      <section id="journey" className="mx-auto max-w-5xl px-4 py-24 sm:px-6" style={{ background: ALABASTER }} aria-labelledby="journey-h">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>From curiosity to mastery</p>
        <h2 id="journey-h" className="mt-4 text-3xl sm:text-4xl" style={{ ...SERIF, color: NAVY }}>The student journey.</h2>
        <ol className="mt-12 flex flex-col gap-0">
          {[
            ["Diagnostic Conversation", "A first dialogue about where the learner stands — preparation material for the relationship, never a score."],
            ["Atmosphere Placement", "The student enters the chamber of their subject and settles into its environment."],
            ["Collaborative Discovery", "Sessions inside the chamber: the board, the dialogue, the work — preserved as the board record."],
            ["Certified Milestone", "Tutor and student certify the milestone together; the record holds it."],
          ].map(([t, d], i) => (
            <li key={t} className="relative flex gap-6 pb-10">
              <div className="flex flex-col items-center">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border text-sm tabular-nums"
                  style={{ borderColor: GOLD, color: SLATE_DEEP, background: "rgba(255,255,255,0.7)" }}
                >
                  {i + 1}
                </span>
                {i < 3 ? <span className="mt-2 w-px flex-1" style={{ background: "rgba(197,160,89,0.4)" }} /> : null}
              </div>
              <div className="pt-1.5">
                <h3 className="text-lg" style={{ ...SERIF, color: NAVY_SOFT }}>{t}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: SLATE }}>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── SECTION 5 · VOICES OF THE ACADEMY ──────────────────────────── */}
      <section id="voices" className="mx-auto max-w-[96rem] px-4 py-24 sm:px-6 lg:px-8" style={{ background: CREAM }} aria-labelledby="voices-h">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>Voices of the academy</p>
        <h2 id="voices-h" className="mt-4 max-w-2xl text-3xl sm:text-4xl" style={{ ...SERIF, color: NAVY }}>
          Reflections, held honestly.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: SLATE }}>
          Illustrative specimens in the academy's register: real voices land here when students and
          parents choose to give them. No star ratings, no invented counts.
        </p>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            ["The first session felt like someone turned the lights on in a room I had been memorising in the dark. My tutor asked what I noticed — before telling me anything.", "Specimen voice · student, Mathematics"],
            ["What convinced us was what the platform refuses: no leaderboard, no attention timers, no noise. Just the work, the tutor, and a record we can reread.", "Specimen voice · parent"],
            ["I stopped asking 'is this right' and started asking 'what is this doing'. That change in the question was the whole education.", "Specimen voice · student, Physics"],
          ].map(([q, a]) => (
            <figure
              key={a}
              className="rounded-2xl border p-6 backdrop-blur-md"
              style={{ borderColor: "rgba(212,175,55,0.22)", background: "rgba(255,255,255,0.75)", boxShadow: CARD_SHADOW }}
            >
              <blockquote className="text-sm leading-relaxed" style={{ color: SLATE_DEEP }}>“{q}”</blockquote>
              <figcaption className="mt-4 text-xs tracking-wide" style={{ color: GOLD }}>{a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── SECTION 6 · THE INVITATION ─────────────────────────────────── */}
      <section id="invitation" className="relative overflow-hidden px-4 py-28 text-center sm:px-6" aria-labelledby="invite-h">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #FFF1E6 0%, #FFF8ED 42%, #F9F6F0 78%)",
          }}
        />
        <div className="relative">
          <h2 id="invite-h" className="mx-auto max-w-3xl text-4xl sm:text-5xl" style={{ ...SERIF, color: NAVY, textShadow: "0 2px 26px rgba(245,230,200,0.9)" }}>
            Begin Your Academic Journey Today.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed" style={{ color: SLATE }}>
            Experience a session tailored to your exact learning needs.
          </p>
          <nav aria-label="Footer" className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            <Link href="/subjects" className="ta-quiet-link" style={{ color: SLATE }}>Subjects</Link>
            <Link href={ROUTES.tuition} className="ta-quiet-link" style={{ color: SLATE }}>Tuition</Link>
            <Link href={ROUTES.legalTerms} className="ta-quiet-link" style={{ color: SLATE }}>Terms</Link>
            <Link href={ROUTES.legalPrivacy} className="ta-quiet-link" style={{ color: SLATE }}>Privacy</Link>
            <Link href={ROUTES.admin} className="ta-quiet-link" style={{ color: SLATE }}>Admin</Link>
          </nav>
          <p className="mt-8 text-xs tracking-[0.3em] uppercase" style={{ color: GOLD }}>Learn • Grow • Succeed</p>
        </div>
      </section>
    </div>
  );
}
