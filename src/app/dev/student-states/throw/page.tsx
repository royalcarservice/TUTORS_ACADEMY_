import { notFound } from "next/navigation";

/* DEV-ONLY · a server component that THROWS, so the REAL root error boundary
 * (src/app/error.tsx) can be seen and tested. 404s in production. */
export const dynamic = "force-dynamic";
export default function ThrowPage() {
  if (process.env.NODE_ENV === "production") notFound();
  throw new Error("forced page failure (dev) — SELECT * FROM secret_table; stack should never be shown");
}
