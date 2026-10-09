/* ════════════════════════════════════════════════════════════════════════
   LIVE-HEALTH PROBE (Unfinished Work · Track 4, DEC-045)

   Non-destructive readiness checks for the three production services.
   Reads env NAMES, never prints a value. A missing credential is a
   calm DEMONSTRATION row, never an error; exit 0. A CONFIGURED service
   that answers with a failure is an ERROR row; exit 1. All services
   absent or all live-and-healthy: exit 0.

   Checks:
     D1  DATABASE_URL            the pooler accepts a TCP connection
     D2  Supabase REST + RLS     anon read of profiles yields zero rows
                                 (RLS active) and no error
     A1  Supabase Auth endpoint  /auth/v1/health answers
     S1  Stripe                  balance retrieve with the secret key
     L1  LiveKit                 RoomService/ListRooms with a signed token
   ════════════════════════════════════════════════════════════════════════ */

import { createHmac } from "node:crypto";
import { connect } from "node:net";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const G = "\x1b[32m"; // live
const Y = "\x1b[33m"; // demonstration
const R = "\x1b[31m"; // configured but failing
const B = "\x1b[0m";

const rows = [];
let configuredFailure = false;

function row(service, state, detail) {
  rows.push({ service, state, detail });
  if (state === "ERROR") configuredFailure = true;
}

const sleepFail = (ms) => new Promise((resolve) => setTimeout(() => resolve(false), ms));

/* D1 — pooler TCP probe */
async function probeDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) return row("Database pooler", "DEMONSTRATION", "DATABASE_URL absent — schema push owed at launch");
  try {
    const u = new URL(url);
    const host = u.hostname;
    const port = Number(u.port || 5432);
    const ok = await Promise.race([
      new Promise((resolve) => {
        const socket = connect({ host, port }, () => {
          socket.destroy();
          resolve(true);
        });
        socket.on("error", () => resolve(false));
      }),
      sleepFail(5000),
    ]);
    if (ok) row("Database pooler", "LIVE", `${host}:${port} accepted the connection`);
    else row("Database pooler", "ERROR", "configured, but the pooler did not answer");
  } catch {
    row("Database pooler", "ERROR", "DATABASE_URL could not be parsed");
  }
}

/* D2 + A1 — Supabase REST and Auth */
async function probeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return row("Supabase (DB + Auth)", "DEMONSTRATION", "credentials absent — specimen ledger in force");
  try {
    const rest = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    if (!rest.ok) return row("Supabase (DB + Auth)", "ERROR", `REST answered ${rest.status}`);
    const body = await rest.json();
    if (Array.isArray(body) && body.length > 0) {
      return row("Supabase (DB + Auth)", "ERROR", "anon read returned rows — RLS is NOT hiding profiles");
    }
    const auth = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anon } });
    if (!auth.ok) return row("Supabase (DB + Auth)", "ERROR", `Auth health answered ${auth.status}`);
    row("Supabase (DB + Auth)", "LIVE", "REST bounded by RLS (zero rows anon); Auth endpoint healthy");
  } catch (e) {
    row("Supabase (DB + Auth)", "ERROR", `configured, but unreachable (${e?.cause?.code ?? "network"})`);
  }
}

/* S1 — Stripe */
async function probeStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return row("Stripe commerce", "DEMONSTRATION", "keys absent — settlement simulated");
  try {
    const Stripe = require("stripe");
    const stripe = new Stripe(key);
    await stripe.balance.retrieve();
    row("Stripe commerce", "LIVE", "secret key verified against the balance endpoint");
  } catch (e) {
    row("Stripe commerce", "ERROR", `configured, but the key was refused (${e?.code ?? e?.statusCode ?? "refused"})`);
  }
}

/* L1 — LiveKit (hand-rolled HS256 video-grant token; no SDK needed) */
function livekitToken(apiKey, apiSecret) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: "HS256", typ: "JWT" });
  const payload = b64({ iss: apiKey, iat: now - 10, nbf: now - 10, exp: now + 600, video: { roomList: true } });
  const sig = createHmac("sha256", apiSecret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

async function probeLiveKit() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) return row("LiveKit chambers", "DEMONSTRATION", "keys absent — chambers in standby");
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/twirp/room.RoomService/ListRooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${livekitToken(apiKey, apiSecret)}` },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) row("LiveKit chambers", "LIVE", "RoomService answered a signed ListRooms");
    else row("LiveKit chambers", "ERROR", `configured, but the token was refused (${res.status})`);
  } catch {
    row("LiveKit chambers", "ERROR", "configured, but the service did not answer");
  }
}

await probeDatabase();
await probeSupabase();
await probeStripe();
await probeLiveKit();

console.log("");
console.log("  TUTORS ACADEMY — LIVE HEALTH PROBE");
console.log("  ─────────────────────────────────────────────────────────────");
for (const r of rows) {
  const tint = r.state === "LIVE" ? G : r.state === "DEMONSTRATION" ? Y : R;
  console.log(`  ${tint}● ${r.state.padEnd(13)}${B} ${r.service.padEnd(22)} ${r.detail}`);
}
console.log("  ─────────────────────────────────────────────────────────────");
console.log(configuredFailure
  ? "  A configured service failed. Nothing was changed; investigate before launch."
  : "  All configured services healthy; absent services degrade to demonstration.");
console.log("");

process.exit(configuredFailure ? 1 : 0);
