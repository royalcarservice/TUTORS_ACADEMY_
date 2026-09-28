import Link from "next/link";

import { ROUTES } from "@/config/routes";

/* NAV ACCOUNT ENTRY (Phase 5 · Step 3)
 * The student's name, SMALL and never a headline (composition rule), linking
 * to the real Account route; plus a real sign-out (POST /auth/signout, works
 * without JavaScript). No avatar, no menu, no notification affordance.     */
export function AccountEntry({ displayName, stacked = false }: { displayName: string; stacked?: boolean }) {
  const name = displayName.trim() || "Account";
  return (
    <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", alignItems: stacked ? "stretch" : "center", gap: "var(--ta-space-2)" }}>
      <Link href={`${ROUTES.student}/account`} className={stacked ? "ta-btn w-full" : "ta-btn"} data-variant="ghost" data-size={stacked ? "md" : "sm"} data-account-link>
        <span style={{ fontSize: "var(--ta-text-sm)", fontWeight: 500, maxWidth: "12rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      </Link>
      <form action="/auth/signout" method="post" style={{ display: "contents" }}>
        <button type="submit" className={stacked ? "ta-btn w-full" : "ta-btn"} data-variant="secondary" data-size={stacked ? "md" : "sm"}>Sign out</button>
      </form>
    </div>
  );
}
