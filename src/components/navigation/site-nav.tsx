"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { BrandMark } from "@/components/home/brand-mark";
import { ROUTES } from "@/config/routes";

/* The refined public navigation: brand lockup at the left, quiet links,
   and the gold-bordered invitation at the right. Transparent over the
   meadow, settling to midnight with a hairline gold rule once scrolled. */

const LINKS = [
  { href: "/#disciplines", label: "Disciplines" },
  { href: "/#mentor", label: "How we mentor" },
  { href: "/#journey", label: "The journey" },
  { href: ROUTES.tuition, label: "Tuition" },
] as const;

const goldCta =
  "inline-flex items-center justify-center rounded-full border px-5 min-h-[2.75rem] text-sm font-medium " +
  "transition-colors duration-200";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  /* Transparent only over the meadow hero; every other public page gets the
     solid midnight band so the ivory type always stands on dark. */
  const isHome = pathname === "/";
  const solid = !isHome || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
      style={{
        background: solid ? "rgba(253,251,247,0.92)" : "transparent",
        borderBottom: solid ? "1px solid rgba(212,175,55,0.35)" : "1px solid transparent",
        backdropFilter: solid ? "blur(8px)" : undefined,
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} aria-label="Tutors Academy home" className="rounded-md" onClick={() => setOpen(false)}>
          <BrandMark size={38} withWordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors"
              style={{ color: "#334155" }}
            >
              {l.label}
            </Link>
          ))}
          <Link href={ROUTES.login} className="text-sm font-medium" style={{ color: "#334155" }}>
            Sign in
          </Link>
          <Link
            href={ROUTES.register}
            className={goldCta}
            style={{
              borderColor: "#D4AF37",
              color: "#0A192F",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 4px 12px -2px rgba(212,175,55,0.25)",
            }}
          >
            Apply Now
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg lg:hidden"
          style={{ color: "#334155" }}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav aria-label="Primary mobile" className="border-t px-4 pb-6 pt-3 lg:hidden" style={{ borderColor: "rgba(212,175,55,0.25)", background: "rgba(253,251,247,0.98)" }}>
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium" style={{ color: "#334155" }}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={ROUTES.login} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium" style={{ color: "#334155" }}>
                Sign in
              </Link>
            </li>
            <li className="mt-2">
              <Link
                href={ROUTES.register}
                onClick={() => setOpen(false)}
                className={goldCta + " w-full"}
                style={{ borderColor: "#D4AF37", color: "#0A192F", background: "rgba(255,255,255,0.92)", boxShadow: "0 4px 12px -2px rgba(212,175,55,0.25)" }}
              >
                Apply Now
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
