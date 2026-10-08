import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  addressSourceOf,
  attemptRateLimited,
  bucketFor,
  SECURITY_COPY,
} from "@/lib/security/rate-limit";
import { updateSession } from "@/lib/supabase/proxy-session";

/* Next 16 network boundary (formerly middleware.ts). Session refresh + the
   visitor → student boundary live in src/lib/supabase/proxy-session.ts;
   the sensitive-route rate limit (Phase 10 · Step 3, DEC-039) stands in
   FRONT of it: a limited attempt is refused before anything else runs,
   with one calm sentence and an honest Retry-After. The key is a one-way
   hash of the connecting address — the raw address is never a map key. */
export async function proxy(request: NextRequest) {
  const bucket = bucketFor(request.method, request.nextUrl.pathname);
  if (bucket) {
    const judgement = attemptRateLimited(bucket, addressSourceOf(request.headers));
    if (!judgement.allowed) {
      return new NextResponse(SECURITY_COPY.rateLimited, {
        status: 429,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": String(Math.max(1, Math.ceil(judgement.retryAfterMs / 1000))),
        },
      });
    }
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
