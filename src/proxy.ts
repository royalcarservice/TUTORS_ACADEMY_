import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy-session";

/* Next 16 network boundary (formerly middleware.ts). Session refresh + the
   visitor → student boundary live in src/lib/supabase/proxy-session.ts. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
