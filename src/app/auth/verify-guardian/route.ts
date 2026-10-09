import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/config/routes";
import { redeemGuardianToken } from "@/lib/auth/guardian-verification";
import { consentAddressSource, hashConsentSource } from "@/lib/legal/consent";
import { logFailure } from "@/lib/state/log";
import { createServiceClient } from "@/lib/supabase/service";

/* THE GUARDIAN VERIFICATION HANDLER (Phase 10 · Step 2, DEC-038).
   GET /auth/verify-guardian?token=…

   The guardian's confirmation link lands here. The token is hashed
   immediately; only the digest meets the ledger. On a redeemable link the
   handler performs the three service-role writes — the ledger marks
   verified, legal_consents gains guardian_consent_v1, the profile's
   guardian_verified stands true (with is_test_account's flip) — and the
   guardian is redirected to the calm confirmation. Every other state
   (unknown, already, expired, unconfigured, failed) lands on the same
   confirmation page with its own honest sentence. The token itself is
   never echoed back anywhere. */

export async function GET(request: NextRequest) {
  const confirmed = (outcome: string) =>
    NextResponse.redirect(new URL(`${ROUTES.verifyGuardian}/confirmed?outcome=${outcome}`, request.url));

  const token = request.nextUrl.searchParams.get("token");
  if (!token) return confirmed("unknown");

  const service = createServiceClient();
  if (!service) return confirmed("unavailable");

  const headerStore = await headers();
  const ipHash = hashConsentSource(
    consentAddressSource(headerStore.get("x-forwarded-for"), headerStore.get("x-real-ip")),
  );

  let outcome: string;
  try {
    outcome = await redeemGuardianToken(service, token, ipHash);
  } catch (error) {
    logFailure({
      scope: "route:verify-guardian",
      errorClass: error instanceof Error ? error.name : "UnknownError",
      what: "guardian verification refused",
    });
    outcome = "failed";
  }
  if (outcome === "failed") return confirmed("unavailable");
  return confirmed(outcome);
}
