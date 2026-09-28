import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

/** POST /auth/signout — clears the cookie session. GET is not allowed (no sign-out by link prefetch). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL(ROUTES.login, request.url), { status: 303 });
}
