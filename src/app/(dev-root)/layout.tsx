import { notFound } from "next/navigation";

/* DEV-ONLY second root layout (route group). It THROWS on purpose. FINDING
 * (P5-R9): this is caught by app/error.tsx, not global-error.tsx — the root
 * boundary wraps every segment below app/, groups included. Kept as the
 * "layout throws" specimen for the no-JS FLIP ALARM. 404s in production. */
export const dynamic = "force-dynamic";
export default function DevRootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  void children;
  throw new Error("forced ROOT LAYOUT failure (dev) — global-error.tsx should render; this message never should");
}
