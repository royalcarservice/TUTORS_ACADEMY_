"use client";

/* ════════════════════════════════════════════════════════════════════
   GLASS NAV — floating liquid-glass header for the cinematic hero
   (DEC-049). Left: the official lockup, kept modest. Center: rounded
   liquid-glass pill — HOME · SUBJECTS · WHY US · CONTACT. Right: glass
   BOOK A FREE DEMO door into the existing booking flow (/register).
   Mobile collapses to an accessible compact menu; nothing overlaps.
   ════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/home/brand-mark";
import { ROUTES } from "@/config/routes";

const LINKS = [
  { label: "HOME", href: "/" },
  { label: "SUBJECTS", href: "#disciplines" },
  { label: "WHY US", href: "#mentor" },
  { label: "CONTACT", href: "#invitation" },
] as const;

const WHITE = "rgba(255,255,255,0.96)";
const WHITE_SOFT = "rgba(255,255,255,0.82)";
const SHADOW = "0 1px 10px rgba(8,22,40,0.28)";

export function GlassNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="flex items-center justify-between gap-3 px-5 py-5 sm:px-8 md:px-10 md:py-8">
        {/* Left — official lockup, kept modest */}
        <Link href="/" aria-label="Tutors Academy home" className="shrink-0 rounded-md" onClick={() => setOpen(false)}>
          <BrandMark size={34} withWordmark />
        </Link>

        {/* Center — liquid-glass pill */}
        <nav aria-label="Primary" className="liquid-glass hidden items-center gap-1 rounded-full px-2 py-1.5 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-[0.7rem] font-medium tracking-[0.14em] transition-colors hover:bg-white/10"
              style={{ color: WHITE_SOFT, textShadow: SHADOW }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right — glass demo door */}
        <div className="flex items-center gap-2.5">
          <Link
            href={ROUTES.register}
            className="liquid-glass hidden rounded-full px-5 py-2.5 text-[0.7rem] font-semibold tracking-[0.14em] transition-transform hover:scale-[1.03] sm:inline-flex"
            style={{ color: WHITE, textShadow: SHADOW }}
          >
            BOOK A FREE DEMO
          </Link>
          <button
            type="button"
            className="liquid-glass inline-flex size-10 items-center justify-center rounded-full lg:hidden"
            style={{ color: WHITE, textShadow: SHADOW }}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open ? (
        <nav
          aria-label="Primary mobile"
          className="liquid-glass mx-5 mb-4 rounded-3xl p-4 lg:hidden"
          style={{ background: "rgba(10,25,47,0.55)" }}
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-xs font-medium tracking-[0.14em]"
                  style={{ color: WHITE_SOFT }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href={ROUTES.register}
                onClick={() => setOpen(false)}
                className="liquid-glass block rounded-full px-4 py-3 text-center text-xs font-semibold tracking-[0.14em]"
                style={{ color: WHITE }}
              >
                BOOK A FREE DEMO
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
