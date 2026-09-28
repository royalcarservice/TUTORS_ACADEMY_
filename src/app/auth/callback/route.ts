import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

/** Email-confirmation / magic-link landing: exchanges the code for a cookie session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.student;
  const supabase = await createClient();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : ROUTES.student}`);
  }
  return NextResponse.redirect(`${origin}${ROUTES.login}?error=confirmation`);
}
