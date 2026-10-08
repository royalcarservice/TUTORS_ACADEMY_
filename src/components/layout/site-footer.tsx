import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/config/routes";
import { siteConfig } from "@/config/site";

/* ════════════════════════════════════════════════════════════════════════
   PUBLIC FOOTER — PAGE CHROME (Phase 4 · Step 8).

   Rendered ONCE by `src/app/(public)/layout.tsx`, after <main>, outside the
   scene sequence — the same place the nav shell lives. Reordering the spine
   cannot move it. It is brand frame: brass mark, no subject accent.

   STRUCTURALLY HONEST, therefore sparse: the lockup, one closing line, one
   group of links to routes that resolve today, a copyright line. Nothing
   else exists, so nothing else is shown — no capture, no social, no badges,
   no accreditations, no statistics, no address. The legal links stand since
   Phase 10 · Step 1 (DEC-037, resolves E-07): the three routes resolve, so
   the footer's own rule admits them.
   The previous foundation-era footer (three link columns, a description
   claiming unbuilt features, an `.example` support address) is retired by
   this step; see PHASE4_STEP8_RETURN_REPORT.md for the blocker list.
   ════════════════════════════════════════════════════════════════════════ */

export const FOOTER_COPY = {
  closing: "Built in the open. What is not built yet says so.",
  navLabel: "Footer",
  copyright: `© ${new Date().getFullYear()} ${siteConfig.name}.`,
} as const;

/** Only routes that resolve today. Verified by audit/scene-return.cjs. */
export const FOOTER_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Subjects", href: "/subjects" },
  { label: "Terms of Practice", href: ROUTES.legalTerms },
  { label: "Privacy Notice", href: ROUTES.legalPrivacy },
  { label: "Guardian Consent", href: ROUTES.legalGuardianConsent },
  { label: "Sign in", href: ROUTES.login },
] as const;

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" data-site-footer style={{ borderTop: "1px solid var(--ta-border-subtle)", background: "var(--ta-surface-base)", color: "var(--ta-text-secondary)" }}>
      <div className="ta-container ta-container--content" style={{ padding: "var(--ta-space-8) 0 var(--ta-space-6)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--ta-space-4) var(--ta-space-8)" }}>
          <Link href={ROUTES.home} aria-label={`${siteConfig.name} home`} style={{ display: "inline-flex", minHeight: 44, alignItems: "center" }}>
            <Logo />
          </Link>
          <nav aria-label={FOOTER_COPY.navLabel}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2) var(--ta-space-6)" }}>
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", textDecoration: "underline", textUnderlineOffset: "0.2em", textDecorationColor: "var(--ta-border-strong)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div style={{ marginTop: "var(--ta-space-6)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "var(--ta-space-2) var(--ta-space-8)", fontSize: "var(--ta-text-sm)" }}>
          <p style={{ margin: 0, color: "var(--ta-text-secondary)" }}>{FOOTER_COPY.closing}</p>
          <p style={{ margin: 0, color: "var(--ta-text-muted)" }}>{FOOTER_COPY.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
