# Phase 5 — Supabase setup

**A RUNBOOK FOR THE USER.** Not a coding-agent prompt. It ends with one block to paste to your agent.

**Why you're reading this:** Phase 5 is blocked on one thing and only one thing — a Supabase project to
point at. Everything else is built: the schema exists as a committed migration, the auth code paths
exist, `/student` is protected, and the RLS permission matrix exists as policies that **have never
been executed against a real database**. The agent stopped correctly, twice. It will keep stopping
until these credentials exist, and it should.

**Time: about 15 minutes.** Free tier is fine. **Test accounts only** — see the last section.

---

## 1. Create the project (~3 minutes)

1. Go to **supabase.com** → sign in.
2. **New project.**
   - **Name:** `tutors-academy-dev`
   - **Database password:** the dashboard generates one. **Copy it into your password manager now** —
     you need it in step 4 and it is not shown again.
   - **Region: Mumbai (ap-south-1).** Closest to you and to your students; lowest latency.
   - **Plan:** Free.
3. Wait ~2 minutes for provisioning.

**If you'd rather not use a hosted project:** local Supabase is possible only if your agent's
environment has Docker. Ask it to run `docker info`. If that succeeds, `npx supabase init &&
npx supabase start` prints a local URL and keys that go in the same variables below. If Docker isn't
available, this is a dead end — provision the hosted project.

---

## 2. Collect four values

Dashboard → **Settings**.

| What | Where | Notes |
|---|---|---|
| **Project URL** | Settings → API (or the **Connect** button) | `https://<ref>.supabase.co` |
| **Publishable key** | Settings → **API Keys** | `sb_publishable_…` |
| **Secret key** | Settings → **API Keys** | `sb_secret_…` — **server-only** |
| **Connection string** | Settings → **Database** → Connection string → **URI** | substitute your DB password for `[YOUR-PASSWORD]` |

**On key formats:** Supabase is retiring the old `anon` / `service_role` keys during 2026. A project
created today may show either the new `publishable` / `secret` pair, the legacy `anon` /
`service_role` pair, or both tabs. **Either works identically, and either goes in the same variable
names below.** Your agent needs no code change. If you see a **"Create new API keys"** button, you may
press it or ignore it.

⚠️ **The secret key (or legacy `service_role`) bypasses Row Level Security entirely.** It is
**`SUPABASE_SERVICE_ROLE_KEY`** and must never carry a `NEXT_PUBLIC_` prefix. If that key ever ships in
a browser bundle, your RLS is decorative.

---

## 3. Write `.env.local`

Create the file **in your agent's workspace root** — the folder holding `package.json`. If
`.env.example` exists, copy it instead and fill it in.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** = the **publishable** key (`sb_publishable_…`) — or the legacy
  `anon` key. Safe in the browser.
- **`SUPABASE_SERVICE_ROLE_KEY`** = the **secret** key (`sb_secret_…`) — or the legacy `service_role`
  key. Server-side only.
- **`DATABASE_URL`** = the connection string from step 2. Your agent's `scripts/test-rls.sh` reads it
  to run the permission-matrix assertions against the real database.

**Before saving:** confirm `.gitignore` contains `.env*.local`. If it doesn't, add it first.

**Do not paste any of these four values into chat.** Not to me, not to your agent's report. The agent
only ever needs to know they exist.

---

## 4. Run the migration

Dashboard → **SQL Editor** → **New query** → paste the entire contents of
`supabase/migrations/20260927000001_identity.sql` from your repository → **Run**.

Expect a clean success. **If it errors, paste the error text to your agent** — don't hand-edit the SQL.
The migration is the source of truth for the schema; a manual edit in the dashboard would leave the
file and the live database disagreeing, which is worse than the error.

---

## 5. Configure Auth URLs — so the email link works

Dashboard → **Authentication** → **URL Configuration**.

- **Site URL:** `http://localhost:3000`
- **Redirect URLs** — add each one you'll actually use:
  - `http://localhost:3000/**`
  - your preview origin's `/auth/callback`, if your agent runs on a hosted preview URL

**Email confirmation** is **on** by default, which is what your agent's verification plan expects
(register → email link → `/auth/callback`). Two things to know:

- Free-tier built-in email is **rate-limited** (a handful per hour). If you're iterating and hit the
  limit, Authentication → Sign In / Providers → Email → turn **Confirm email** off. Your agent's
  verification still works; only the callback path goes unexercised.
- Check spam.

---

## 6. Two things that will otherwise waste an hour

**Connection trouble.** If the RLS script can't reach the database, it's usually IPv4-only
networking in the sandbox. Use the **Session pooler** string from the same Database page (`aws-0-<region>.pooler.supabase.com`, user `postgres.<ref>`, port 5432) as `DATABASE_URL` instead of the
direct host.

**Free projects pause** after about a week of inactivity. If your agent suddenly reports "project
paused" or connection refused after a break, restore the project in the dashboard — nothing is broken.

---

## Then paste this to your agent

```
TUTORS ACADEMY — PHASE 5, TIER 1 ACTIVATED. RUN THE 5.3 PRECONDITION (TEST 1) NOW.

Supabase credentials now exist in .env.local (Tier 1). The migration has been run. Auth URLs are
configured. Nothing else is blocking.

DO, IN ORDER, AND PASTE THE EVIDENCE VERBATIM:
1. Confirm .env.local is present, .env*.local is in .gitignore, and nothing secret is staged:
   paste `git status --porcelain`.
2. Confirm the three client/server env vars load — REPORT THE VARIABLE NAMES ONLY, NEVER THE VALUES.
3. Run `scripts/test-rls.sh` exactly as its header documents, and PASTE ALL 20 ASSERTIONS AND THE
   SUMMARY VERBATIM. This is the permission-matrix proof: the student-cannot-read-another-student
   test must pass AGAINST THE REAL DATABASE, not a mock. If any assertion fails, STOP AND REPORT —
   do not fix it by weakening a policy.
4. Sign up ONE TEST ACCOUNT at /register, clearly labelled as a test identity, and confirm the email
   link → /auth/callback. Report whether a session cookie appeared and what /student rendered.
   If the email doesn't arrive within a minute (free-tier SMTP is rate-limited, and it may be in
   spam), REPORT THAT — do not switch to a mocked or bypassed confirmation path.
5. Restart the server and confirm the session survives. Paste the cookie name and its expiry.
6. POST /auth/signout. Confirm the cookie clears and /student redirects to /login. Paste both.
7. THEN state: AUTH STATUS = VERIFIED or UNVERIFIED, with the evidence for each of the four checks —
   sign-in, session persistence, sign-out, protected-route redirect.
8. If VERIFIED: proceed to STEP 5.3 (prompts/phase-5-step-03-student-shell.md), route root /student
   per P5-R1 Part 4. If UNVERIFIED: stop and report exactly which check failed and why.

REDACTION: if any line of output contains a URL with a password, a key or a token, REDACT IT before
pasting. Secrets never appear in a report.

HOUSEKEEPING FIRST — one small commit, no new scope:
- The sandbox reset keeps clearing the exec bit on scripts. Make it survive in version control:
  `git update-index --chmod=+x scripts/test-rls.sh`, then commit with a one-line message.
- In one sentence: is `node_modules` reinstallation frequent enough now to justify a
  `scripts/dev-recover.sh` (install deps + restore file modes)? Report your judgment; do not build it
  unless you think it is worth it.

REPORT BACK: the tier confirmed · the RLS test output · the four auth checks with evidence ·
AUTH STATUS · and anything the real database revealed that the Tier 3 schema could not.
```

---

## What you are deliberately NOT doing

**Not opening this to students.** Real auth means real accounts, and the obligations begin the moment a
real person's data — including a minor's — lands in that database. **Phase 5 onboards test accounts
only.** The privacy policy, terms, a contact route, and the DPDP Act 2023 position (children's data
especially) are still open launch blockers, and they remain yours: they have never been stubbed in
code and must not be invented there.

**Not configuring production.** This is a dev project. Keys live in `.env.local` and nowhere else.
