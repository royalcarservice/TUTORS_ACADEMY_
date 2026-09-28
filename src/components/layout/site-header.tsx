"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PUBLIC_NAV, PORTAL_ENTRIES } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/cn";

import { MobileNav } from "./mobile-nav";

/**
 * Public website header.
 * Sticky, responsive: full nav at `lg`, slide-down panel below it.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Prevent background scrolling while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the panel if the viewport grows past `lg`, where the desktop nav
  // takes over — otherwise the scroll lock would stay stuck.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md",
        open && "border-transparent",
      )}
    >
      <Container>
        <div className="flex h-[var(--ta-header-h)] items-center justify-between gap-4">
          <Link
            href={ROUTES.home}
            aria-label={`${"Tutors Academy"} home`}
            className="rounded-md focus-visible:outline-brand-600"
            onClick={() => setOpen(false)}
          >
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PUBLIC_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-ink-100 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href={ROUTES.login} className={buttonClass("ghost", "sm")}>
              Sign in
            </Link>
            <Link href={ROUTES.register} className={buttonClass("primary", "sm")}>
              Create account
            </Link>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border-strong text-foreground transition-colors hover:bg-ink-100 lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </Container>

      <MobileNav open={open} onClose={() => setOpen(false)} links={PUBLIC_NAV} />
    </header>
  );
}

/** Portal shortcuts rendered inside the mobile panel. */
export function MobilePortalShortcuts() {
  return (
    <ul className="flex flex-col gap-1">
      {PORTAL_ENTRIES.map((entry) => (
        <li key={entry.id}>
          <Link
            href={entry.href}
            className="block rounded-lg px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-ink-100 hover:text-foreground"
          >
            {entry.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
