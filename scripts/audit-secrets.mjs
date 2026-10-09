#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   THE ZERO-LEAK SWEEP (Phase 10 · Step 3, DEC-039)

   Scans every GIT-TRACKED file for secrets and credentials:
     1. bearer-shaped JWTs (Supabase anon/service keys are JWTs),
     2. cloud key shapes (AWS access keys),
     3. private key blocks,
     4. connection strings with embedded credentials (a postgres URL
        carrying a password between the scheme and the host),
     5. secret-looking literal assignments,
     6. real email addresses (allowlist: RFC-2606 reserved TLDs, fixture
        domains and declared placeholders — reasons below, not waivers),
     7. phone-number shapes,
     8. stale .env files tracked by git,
     9. NEXT_PUBLIC_ variables beyond the declared three.

   Run: node scripts/audit-secrets.mjs   (exit 0 = zero unexplained hits)
   ════════════════════════════════════════════════════════════════════════ */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const BINARY_EXT = /\.(woff2?|ttf|otf|png|jpe?g|gif|webp|ico|svg|pdf|mp3|wav|zip)$/i;
const files = tracked.filter((f) => !BINARY_EXT.test(f));

/* RFC 2606 reserved TLDs (example.*, *.example, *.invalid) can never be
   real mailboxes; test.local is the RLS fixture domain (rls_test.sql);
   domain.com / b.com / c.com are validator test cases and placeholders. */
const EMAIL_DOMAIN_ALLOWLIST = [
  "example.com", "example.org", "example.co.in", "example", "invalid",
  "test.local", "domain.com", "b.com", "c.com",
];
/* File-level allowances with declared reasons (hand-read, DEC-039): */
const EMAIL_FILE_ALLOWLIST = {
  // quotes the P5-R2 verification where a real-looking address was REFUSED
  // by test-account.mjs's domain guard; the address is the refusal's example
  "PHASE5_R2_CORRECTION_REPORT.md": "someone@gmail.com",
  // this file's own allowlist must name the address it allows (self-clean)
  "scripts/audit-secrets.mjs": "someone@gmail.com",
};

const detectors = [
  {
    id: "jwt",
    name: "bearer-shaped JWT (Supabase keys are JWTs)",
    re: /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
  },
  {
    id: "aws-key",
    name: "AWS access key shape",
    re: /AKIA[0-9A-Z]{16}/g,
  },
  {
    id: "private-key",
    name: "private key block",
    re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: "conn-string",
    name: "credentialed connection string",
    re: /\b(?:postgres(?:ql)?|mysql|redis|amqp):\/\/[^\s:@/]+:[^\s@/]+@[^\s]+/gi,
  },
  {
    id: "secret-literal",
    name: "secret-looking literal assignment",
    re: /\b(?:api[_-]?key|secret[_-]?key|service[_-]?role[_-]?key|access[_-]?token|auth[_-]?token|password)\b[^\n=]{0,24}[:=]\s*['"]((?=[A-Za-z0-9+/=_\-.]*[a-z])(?=[A-Za-z0-9+/=_\-.]*[0-9])[A-Za-z0-9+/=_\-.]{20,})['"]/gi,
  },
  {
    id: "phone",
    name: "phone-number shape",
    re: /\+91[ -]?\d{10}\b/g,
  },
];

const findings = [];

for (const file of files) {
  let text;
  try {
    text = readFileSync(path.resolve(file), "utf8");
  } catch {
    continue; // unreadable = not text; the binary filter already skipped shapes
  }

  for (const d of detectors) {
    for (const match of text.matchAll(d.re)) {
      findings.push({ file, kind: d.name, sample: match[0].slice(0, 40) });
    }
  }

  // Emails, with the allowlist applied (package-lock's registry metadata
  // carries package-author addresses — not academy data; declared skipped).
  if (file !== "package-lock.json") {
    for (const match of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      const address = match[0];
      const domain = address.slice(address.indexOf("@") + 1).toLowerCase();
      const allowed = EMAIL_DOMAIN_ALLOWLIST.some(
        (a) => domain === a || domain.endsWith(`.${a}`),
      );
      const fileAllowed = EMAIL_FILE_ALLOWLIST[file] === address;
      if (!allowed && !fileAllowed) {
        findings.push({ file, kind: "real-looking email address", sample: address });
      }
    }
  }

  // NEXT_PUBLIC_ surface: only the declared three may appear.
  const declared = new Set(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]);
  for (const match of text.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) {
    if (!declared.has(match[0])) {
      findings.push({ file, kind: "undeclared NEXT_PUBLIC_ variable", sample: match[0] });
    }
  }
}

// Stale .env files tracked by git (.env.example is the declared template).
for (const file of tracked) {
  if (/(^|\/)\.env(\..+)?$/.test(file) && !/(^|\/)\.env\.example$/.test(file)) {
    findings.push({ file, kind: "tracked .env file", sample: file });
  }
}

if (findings.length > 0) {
  console.log(`✗ ZERO-LEAK SWEEP: ${findings.length} unexplained finding(s)`);
  for (const f of findings) console.log(`  · ${f.kind} — ${f.file} (${f.sample})`);
  process.exit(1);
}
console.log(`✓ zero-leak sweep clean — ${files.length} tracked text files scanned, ${tracked.length} tracked files total`);
