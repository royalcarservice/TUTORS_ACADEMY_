"use client";

import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/config/navigation";

/**
 * Slide-down navigation panel for the public site on small screens.
 * Rendered (but hidden) at all sizes so focus never lands in a hidden panel
 * that can be opened without a transition.
 */
export function MobileNav({
  open,
  onClose,
  links,
  children,
}: {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  children?: React.ReactNode;
}) {
  return (
    <div
      id="mobile-nav"
      className={cn(
        "fixed inset-x-0 top-[var(--ta-header-h)] bottom-0 z-40 overflow-y-auto",
        "bg-surface px-4 pb-8 pt-2 transition-[opacity,visibility] duration-200 sm:px-6 lg:hidden",
        // `invisible` keeps closed links out of the a11y tree and tab order.
        // Not the `hidden` attribute: preflight's `!important` would beat `lg:hidden`.
        open ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
      )}
    >
      <Container className="px-0">
        <nav aria-label="Mobile" className="flex flex-col gap-6">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-ink-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {children}

          <div className="flex flex-col gap-2 border-t border-border pt-6">
            <Link
              href={ROUTES.register}
              onClick={onClose}
              className={buttonClass("primary", "md", "w-full")}
            >
              Create account
            </Link>
            <Link
              href={ROUTES.login}
              onClick={onClose}
              className={buttonClass("outline", "md", "w-full")}
            >
              Sign in
            </Link>
          </div>
        </nav>
      </Container>
    </div>
  );
}
