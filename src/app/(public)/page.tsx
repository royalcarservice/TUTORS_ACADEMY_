import type { Metadata } from "next";
import Link from "next/link";

import { HeroCanvas, HeroDrift } from "@/components/home/hero-canvas";
import SubjectGalleryCards from "@/components/home/subject-gallery-cards";
import SubjectGalleryLayer from "@/components/home/subject-gallery-layer";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Tutors Academy — Where curiosity rises",
  description:
    "Personalised tutoring inside seven living subject environments. Learn, grow, succeed — with a tutor placed in your subject.",
};

/* THE MEADOW OF MINDS (Cinematic Redesign, DEC-046).
   The narrative spine retires by owner mandate; the subjects, portals and
   legal doors it pointed to all keep their routes. HTML first: every word
   below renders without JavaScript; the canvas is enhancement. */

const IVORY = "#FAF7F2";
const MUTED = "#B9B4A9";
const GOLD = "#DFB15B";
const GOLD_DEEP = "#C59A3F";

const goldOutline =
  "inline-flex items-center justify-center rounded-full border px-7 min-h-[3rem] text-sm font-medium " +
  "transition-all duration-200 hover:shadow-[0_0_24px_rgba(223,177,91,0.35)]";

const SERIF: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontWeight: 500 };

export default function HomePage() {
  return (
    <div style={{ background: "#030712", color: IVORY }}>
      {/* ── HERO · THE MEADOW OF MINDS ─────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-label="Tutors Academy">
        <HeroCanvas />
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1, background: "radial-gradient(ellipse at 50% 118%, rgba(11,25,44,0.9), transparent 60%)" }} />
        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-24 text-center" style={{ zIndex: 10 }}>
          <HeroDrift>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>
              Learn • Grow • Succeed
            </p>
            <h1
              className="mt-6 text-5xl leading-[1.05] tracking-tight sm:text-7xl"
              style={{ ...SERIF, color: IVORY, textShadow: "0 0 42px rgba(223,177,91,0.25)" }}
            >
              Where curiosity rises.
              <br />
              And futures begin.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: MUTED }}>
              Discover personalised tutoring that builds confidence, deepens understanding, and helps
              every learner move forward.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={ROUTES.register}
                className={goldOutline}
                style={{ borderColor: GOLD_DEEP, color: GOLD, boxShadow: "inset 0 0 16px rgba(223,177,91,0.2)" }}
              >
                Apply as a Student or Parent
              </Link>
              <Link
                href={ROUTES.tutorApply}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full px-7 text-sm font-medium transition-colors hover:text-white"
                style={{ color: MUTED }}
              >
                Become a Tutor
              </Link>
            </div>
          </HeroDrift>
        </div>
      </section>

      {/* ── SECTION 2 · THE CORE DISCIPLINES — INTERACTIVE 3D GALLERY (DEC-047) ── */}
      <SubjectGalleryCards />
      <SubjectGalleryLayer />

      {/* ── SECTION 3 · HOW WE MENTOR ──────────────────────────────────── */}
      <section id="mentor" className="mx-auto max-w-[96rem] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="mentor-h">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>The pedagogical difference</p>
        <h2 id="mentor-h" className="mt-4 max-w-2xl text-3xl sm:text-4xl" style={{ ...SERIF, color: IVORY }}>How we mentor.</h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {[
            ["Individual Intellectual Arcs", "Progression tailored to the learner in front of the tutor. No conveyor belts, no one-size-fits-all syllabus march — the arc bends to the student, never the reverse."],
            ["Relational Mentorship", "Real subject masters who guide thinking. The study lens scaffolds with questions and hints and never supplies answers — the understanding is earned, so it holds."],
            ["Record of Mastery", "Milestones co-certified by tutor and student, preserved as a record of real understanding. Achievement substantiated in words, not scores or ranks."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="h-px w-10" style={{ background: GOLD_DEEP }} />
              <h3 className="mt-4 text-lg" style={{ ...SERIF, color: IVORY }}>{t}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 · THE STUDENT JOURNEY ────────────────────────────── */}
      <section id="journey" className="mx-auto max-w-5xl px-4 py-24 sm:px-6" aria-labelledby="journey-h">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>From curiosity to mastery</p>
        <h2 id="journey-h" className="mt-4 text-3xl sm:text-4xl" style={{ ...SERIF, color: IVORY }}>The student journey.</h2>
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
                  style={{ borderColor: GOLD_DEEP, color: GOLD }}
                >
                  {i + 1}
                </span>
                {i < 3 ? <span className="mt-2 w-px flex-1" style={{ background: "rgba(197,154,63,0.3)" }} /> : null}
              </div>
              <div className="pt-1.5">
                <h3 className="text-lg" style={{ ...SERIF, color: IVORY }}>{t}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: MUTED }}>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── SECTION 5 · VOICES OF THE ACADEMY ──────────────────────────── */}
      <section id="voices" className="mx-auto max-w-[96rem] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="voices-h">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>Voices of the academy</p>
        <h2 id="voices-h" className="mt-4 max-w-2xl text-3xl sm:text-4xl" style={{ ...SERIF, color: IVORY }}>
          Reflections, held honestly.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: MUTED }}>
          Illustrative specimens in the academy's register: real voices land here when students and
          parents choose to give them. No star ratings, no invented counts.
        </p>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            ["The first session felt like someone turned the lights on in a room I had been memorising in the dark. My tutor asked what I noticed — before telling me anything.", "Specimen voice · student, Mathematics"],
            ["What convinced us was what the platform refuses: no leaderboard, no attention timers, no noise. Just the work, the tutor, and a record we can reread.", "Specimen voice · parent"],
            ["I stopped asking 'is this right' and started asking 'what is this doing'. That change in the question was the whole education.", "Specimen voice · student, Physics"],
          ].map(([q, a]) => (
            <figure key={a} className="rounded-xl border p-6 backdrop-blur-md" style={{ borderColor: "rgba(197,154,63,0.3)", background: "rgba(7,15,43,0.55)" }}>
              <blockquote className="text-sm leading-relaxed" style={{ color: IVORY }}>“{q}”</blockquote>
              <figcaption className="mt-4 text-xs tracking-wide" style={{ color: GOLD }}>{a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── SECTION 6 · THE INVITATION ─────────────────────────────────── */}
      <section id="invitation" className="relative overflow-hidden px-4 py-28 text-center sm:px-6" aria-labelledby="invite-h">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(7,15,43,0.9), #030712 70%)" }} />
        <div className="relative">
          <h2 id="invite-h" className="mx-auto max-w-3xl text-4xl sm:text-5xl" style={{ ...SERIF, color: IVORY, textShadow: "0 0 36px rgba(223,177,91,0.2)" }}>
            Begin Your Academic Journey Today.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed" style={{ color: MUTED }}>
            Experience a session tailored to your exact learning needs.
          </p>
          <div className="mt-9">
            <Link
              href={ROUTES.register}
              className={goldOutline}
              style={{ borderColor: GOLD_DEEP, color: GOLD, boxShadow: "inset 0 0 16px rgba(223,177,91,0.2)" }}
            >
              Apply as a Student or Parent
            </Link>
          </div>
          <nav aria-label="Footer" className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm" >
            <Link href="/subjects" className="transition-colors hover:text-white" style={{ color: MUTED }}>Subjects</Link>
            <Link href={ROUTES.tuition} className="transition-colors hover:text-white" style={{ color: MUTED }}>Tuition</Link>
            <Link href={ROUTES.legalTerms} className="transition-colors hover:text-white" style={{ color: MUTED }}>Terms</Link>
            <Link href={ROUTES.legalPrivacy} className="transition-colors hover:text-white" style={{ color: MUTED }}>Privacy</Link>
            <Link href={ROUTES.admin} className="transition-colors hover:text-white" style={{ color: MUTED }}>Admin</Link>
          </nav>
          <p className="mt-8 text-xs tracking-[0.3em] uppercase" style={{ color: GOLD_DEEP }}>Learn • Grow • Succeed</p>
        </div>
      </section>
    </div>
  );
}
