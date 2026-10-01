"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { BrandMark, BrandWordmark } from "@/components/brand/brand";
import { ThemeToggle } from "@/components/layout/theme";
import { buttonClass } from "@/components/ui/button";

/* ════════════════════════════════════════════════════════════════════════
   NAV SHELL — TWO MODES, ONE SHELL (Phase 2 · Step 6 · Part C)
     stage — floats over full-bleed Stage content; transparent at rest,
             materialises a scrim on scroll / when legibility demands.
     room  — solid, compact-density working chrome.
   Same component, configuration only — never two code paths.

   Scroll behaviour: TRANSFORM + OPACITY ONLY (a scrim layer's opacity).
   No height animation, no reflow. One enter/exit pair from the 2.3 grammar.
   Reduced motion: instant, fully functional (global contract zeroes durations).

   THE HONESTY RULE: with no identity we render an honest "Sign in" entry to
   the real /login route — never a fake avatar/menu. Since 5.1 a real cookie
   session exists; a Room-mode consumer that HAS an identity passes `account`
   (name + real sign-out) and it replaces the "Sign in" entry. Structure,
   modes and motion are unchanged (5.3: the shell uses Room mode, it does not
   build a second bar).
   ════════════════════════════════════════════════════════════════════════ */

export function SkipLink() {
  return (
    <a
      href="#main"
      className="ta-skipnav"
      style={{
        position: "fixed",
        left: "var(--ta-space-2)",
        top: "var(--ta-space-2)",
        transform: "translateY(-250%)",
        zIndex: "var(--ta-z-toast)",
        padding: "var(--ta-space-2) var(--ta-space-3)",
        background: "var(--ta-surface-raised)",
        color: "var(--ta-text-primary)",
        borderRadius: "var(--ta-radius-2)",
        outline: "2px solid var(--ta-focus-ring)",
        fontSize: "var(--ta-text-sm)",
      }}
    >
      Skip to content
    </a>
  );
}

export function NavLinkItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href !== "/" && pathname?.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{
        padding: "var(--ta-space-2) var(--ta-space-3)",
        borderRadius: "var(--ta-radius-2)",
        fontSize: "var(--ta-text-sm)",
        fontWeight: 500,
        color: active ? "var(--ta-text-primary)" : "var(--ta-text-muted)",
        background: active ? "var(--ta-surface-raised)" : "transparent",
        minHeight: "var(--ta-target-min)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </Link>
  );
}

/* 5.8 (validation gate): "Sign in" from INSIDE an environment carries `next`,
 * so signing in returns the student to the environment they were looking at —
 * measured before the fix: /student → /subjects → /subjects/<id>, three extra
 * page loads on a slow connection before Begin. Elsewhere the link is unchanged. */
export function loginHref(pathname: string | null): string {
  return pathname && /^\/subjects\/[a-z-]+$/.test(pathname) ? `/login?next=${encodeURIComponent(pathname)}` : "/login";
}

/** Public-mode CTA cluster. */
export function NavActions() {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: "var(--ta-space-2)", alignItems: "center" }}>
      <Link href={loginHref(pathname)} className={buttonClass("ghost", "sm")}>Sign in</Link>
      <Link href="/register" className={buttonClass("primary", "sm")}>Create account</Link>
    </div>
  );
}

/** Honest auth entry — a real route, never a fake account menu. */
export function UserMenu() {
  const pathname = usePathname();
  return <Link href={loginHref(pathname)} className={buttonClass("outline", "sm")}>Sign in</Link>;
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > threshold));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [threshold]);
  return scrolled;
}

export interface NavShellProps {
  mode?: "stage" | "room";
  items?: Array<{ label: string; href: string }>;
  /** unique accessible name when several shells share a page (specimens) */
  navLabel?: string;
  /** Room mode with a REAL identity: replaces the "Sign in" entry (desktop) and the sheet's auth block. */
  account?: React.ReactNode;
  children?: React.ReactNode;
}

export function NavShell({ mode = "stage", items = [], navLabel, account, children }: NavShellProps) {
  const baseLabel = navLabel ?? (mode === "stage" ? "Primary" : "Portal");
  const pathname = usePathname();
  const scrolled = useScrolled();
  const solid = mode === "room" || scrolled;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // scroll lock WITHOUT layout shift (compensate scrollbar width)
  useEffect(() => {
    if (!open) return;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
    };
  }, [open]);

  // focus into panel on open; trap; Esc closes + returns focus
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); return; }
      if (e.key !== "Tab" || !panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>("a,button")).filter((el) => !el.hasAttribute("disabled"));
      if (els.length === 0) return;
      const firstEl = els[0], lastEl = els[els.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      data-mode={mode}
      data-scrolled={scrolled || undefined}
      style={{ position: "sticky", top: 0, zIndex: "var(--ta-z-sticky)" }}
    >
      {/* scrim — opacity only (compositor). solid for room/after scroll. */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: "var(--ta-surface-overlay)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--ta-border-subtle)",
          opacity: solid ? 1 : 0,
          transition: "opacity var(--ta-dur-base) var(--ta-ease-enter)",
        }}
      />
      <div className="ta-container ta-container--wide" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--ta-space-4)", paddingBlock: "var(--ta-space-3)" }}>
        {/* P5-R2 FIX 2: hit area ≥ 44×44 (2.4/2.5) — padding + compensating negative
            margin, so the mark's visual size and position are unchanged. */}
        <Link href="/" aria-label="Tutors Academy home" style={{ borderRadius: "var(--ta-radius-2)", display: "inline-flex", alignItems: "center", gap: "calc(28px * 0.5)", minHeight: "var(--ta-target-min)", minWidth: "var(--ta-target-min)", paddingInline: "var(--ta-space-2)", marginInline: "calc(-1 * var(--ta-space-2))" }}>
          <BrandMark size={28} variant="brass" title="Tutors Academy" />
          <BrandWordmark className="ta-brand-word" />
        </Link>

        <nav aria-label={baseLabel} style={{ display: "none" }} className="ta-nav-desktop">
          <style>{`@media (min-width:1024px){ .ta-nav-desktop{display:flex !important;} .ta-nav-trigger{display:none !important;} } @media (max-height:30rem){ header[data-mode]{position:static !important;} } @media (max-width:479px){ .ta-brand-word{display:none;} }`}</style>
          <ul style={{ display: "flex", gap: "var(--ta-space-1)", listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((i) => <li key={i.label}><NavLinkItem href={i.href}>{i.label}</NavLinkItem></li>)}
          </ul>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-2)" }}>
          <ThemeToggle />
          {/* 5.8 gate fix: a REAL identity wins in either mode — a signed-in student on /subjects/<id> was shown
              "Sign in · Create account" while /student showed "Student C · Sign out" (back-to-back disagreement). */}
          <div className="ta-nav-desktop" style={{ display: "none" }}>{account ?? (mode === "stage" ? <NavActions /> : <UserMenu />)}</div>
          <button
            ref={triggerRef}
            type="button"
            className="ta-nav-trigger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-shell-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            style={{ minHeight: "var(--ta-target-min)", minWidth: "var(--ta-target-min)", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-subtle)", background: "transparent", color: "var(--ta-text-primary)", cursor: "pointer" }}
          >
            {open ? <X aria-hidden size={20} strokeWidth={1.5} /> : <Menu aria-hidden size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div
        id="nav-shell-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${baseLabel} menu`}
        style={{
          position: "fixed", inset: 0, zIndex: "var(--ta-z-overlay)",
          background: "var(--ta-surface-base)",
          transform: open ? "none" : "translateY(-8px)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transition: "opacity var(--ta-dur-base) var(--ta-ease-enter), transform var(--ta-dur-base) var(--ta-ease-enter)",
          padding: "var(--ta-space-6)",
          overflowY: "auto",
        }}
      >
        <nav aria-label={`${baseLabel} links`}>
          <ul style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)", listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((i) => (
              <li key={i.label}>
                <Link href={i.href} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-3)", borderRadius: "var(--ta-radius-2)", fontSize: "var(--ta-text-lg)", color: "var(--ta-text-primary)" }}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "var(--ta-space-6)", display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
            {account ?? (mode === "stage" ? (
              <>
                <Link href="/register" onClick={() => setOpen(false)} className={buttonClass("primary", "md", "w-full")}>Create account</Link>
                <Link href={loginHref(pathname)} onClick={() => setOpen(false)} className={buttonClass("outline", "md", "w-full")}>Sign in</Link>
              </>
            ) : (
              <Link href={loginHref(pathname)} onClick={() => setOpen(false)} className={buttonClass("outline", "md", "w-full")}>Sign in</Link>
            ))}
          </div>
        </nav>
      </div>
      {children}
    </header>
  );
}
