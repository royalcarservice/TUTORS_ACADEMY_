import type { NextConfig } from "next";

/* ════════════════════════════════════════════════════════════════════════
   PRODUCTION SECURITY HEADERS (Phase 10 · Step 3, DEC-039)

   THE CSP, tuned to what this app actually loads — nothing looser:
   · script-src 'self' + 'unsafe-inline': the app's bundles, plus the
     inline bootstrap Next.js streams into every page. The WebGL lattice
     is a BUNDLED module drawing to a canvas (src/lib/ambient) — it needs
     no external script and no eval, so 'unsafe-eval' stays OUT.
   · style-src 'self' + 'unsafe-inline': Tailwind's generated CSS plus the
     inline style attributes the token-driven components use.
   · connect-src: same origin, plus the Supabase REST/Realtime endpoints
     when configured. LiveKit cloud endpoints join this directive the day
     the live module wires credentials (declared owed, DEC-039) — no
     loose wildcard stands in their place today.
   · frame-ancestors 'none' + X-Frame-Options DENY: the platform never
     renders inside another page (anti-clickjacking). DECLARED COST: any
     preview environment that embeds the app in an iframe will be refused
     by design — open the preview's own URL directly. ONE NARROW EXCEPTION
     (DEC-041): when the server starts with TA_PREVIEW_FRAME=open, the
     frame directives relax so the ARENA LIVE-PREVIEW iframe can render
     the app. The production header set ships unchanged — the relaxation
     exists only in that flagged process.
   · object-src / base-uri / form-action: locked to self.

   Every header applies to every route. HSTS is inert over plain HTTP
   (browsers ignore it there) and speaks the moment the deployment is
   served over HTTPS. Zero secrets are read here: the header set is a
   constant, and the audit sweep proves the file stays secret-free.
   ════════════════════════════════════════════════════════════════════════ */

const PREVIEW_FRAME_OPEN = process.env.TA_PREVIEW_FRAME === "open";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  // DEC-049: two DECLARED third-party exceptions, owner-mandated —
  // the cinematic hero video's CDN (media only) and the Google Fonts
  // origins (stylesheet + font files). Nothing else external stands.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' https://d8j0ntlcm91z4.cloudfront.net",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  // The frame posture: DEC-039 locks it; DEC-041 opens ONE narrow door
  // for the Arena live preview when the build is explicitly flagged.
  ...(PREVIEW_FRAME_OPEN ? [] : ["frame-ancestors 'none'"]),
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // X-Frame-Options cannot express "allow this one preview host" broadly,
  // so in preview mode it stands down alongside the CSP frame directive.
  ...(PREVIEW_FRAME_OPEN ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Arena live preview (DEC-041): the preview proxy reaches this server with
  // an *.e2b.app Host header — accept it explicitly so the preview never
  // meets a host refusal.
  allowedDevOrigins: ["*.e2b.app"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
};

export default nextConfig;
