"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

/* The operations console's sub-navigation. Four surfaces, one rail.
   Styled as a scholarly index — a quiet underline marks the open page. */

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/placements", label: "Placements" },
  { href: "/admin/tutors", label: "Tutor Roster" },
  { href: "/admin/subjects", label: "Subject Rooms" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/system", label: "System" },
] as const;

export function AdminSubnav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Operations sections" className="mb-8 border-b border-border">
      <ul className="-mb-px flex flex-wrap gap-x-6 gap-y-1">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-block border-b-2 pb-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-600 text-foreground"
                    : "border-transparent text-foreground-muted hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
