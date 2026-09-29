import { NextResponse } from "next/server";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

/** POST /auth/signout — clears the cookie session. GET is not allowed (no sign-out by link prefetch). */
export async function POST() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  // 5.7: a RELATIVE Location (the absolute form built from the bind address lost the cookie clear behind a proxy — same fix as the entry route).
  return new NextResponse(null, { status: 303, headers: { Location: ROUTES.login } });
}
