"use client";

import { useState } from "react";

import { COMPOSER_CHAR_LIMIT, type SocraticPrompt } from "@/lib/socratic/contract";
import type { ExchangeGuidanceItem } from "@/lib/socratic/data";
import { resolveGuidance } from "@/lib/socratic/resolver";
import { ARTIFACT_WORD, type ArtifactRecord } from "@/lib/archive/artifact";

import { reflectOnInquiry } from "@/lib/socratic/actions";

/* INQUIRY COMPOSER (Phase 9 · Step 2, DEC-034)
 *
 * The one input of the Socratic lens — restrained by construction:
 *   · a milestone select (the scaffold options the lens names);
 *   · ONE text field, capped at COMPOSER_CHAR_LIMIT (300) with a quiet
 *     counter — conciseness is the discipline;
 *   · ONE primary action: Reflect.
 *
 * No chat affordances: no avatar, no bubble, no typing indicator, no
 * greeting, no exclamation. A failure renders ONE calm sentence from the
 * closed vocabulary below (STATE_LANGUAGE 9.2) — never an alarm, never a
 * retry carousel. Zero animation: the lens is architecture, not theatre.
 *
 * THE REHEARSAL POSTURE (the DEC-031 precedent): with an explicit
 * `rehearsal` prop the composer resolves through the PURE engine locally
 * and hands the exchange upward — production never sets the prop; the dev
 * rehearsal route does, and says so.
 */

export const COMPOSER_COPY = {
  milestoneLabel: "Milestone",
  inquiryLabel: "Your inquiry",
  submit: "Reflect",
  counterOf: (n: number) => `${n} / ${COMPOSER_CHAR_LIMIT}`,
  placeholderOf: (concept: string) => `Formulate a question about ${concept}...`,
  errorEmpty: "Write the question first; the lens reflects on what you ask.",
  errorOverlong: "A shorter question serves reflection best. The limit is three hundred characters.",
  errorRefused: "The reflection could not be recorded. The lens stays as it was; try again when you are ready.",
} as const;

/** The rehearsal's artifact citations use the archive's own word and date. */
function enrichRehearsalGuidance(
  resolved: ReturnType<typeof resolveGuidance>,
  artifacts: readonly ArtifactRecord[],
): ExchangeGuidanceItem[] {
  return resolved.map((g) => {
    const item: ExchangeGuidanceItem = { type: g.guidanceType, text: g.responseText };
    if (g.referencedArtifactId) {
      const record = artifacts.find((a) => a.id === g.referencedArtifactId);
      if (record) {
        item.referencedArtifactId = record.id;
        item.artifactWord = ARTIFACT_WORD[record.type];
        item.artifactDate = record.createdAt.slice(0, 10);
      }
    }
    return item;
  });
}

export interface ComposerOption {
  key: string;
  path: string;
}

export interface InquiryComposerProps {
  subjectId: string;
  options: readonly ComposerOption[];
  initialMilestoneKey: string;
  /** DEV rehearsal only — production never sets it (DEC-031 precedent). */
  rehearsal?: {
    artifacts: readonly ArtifactRecord[];
    onReflect: (entry: { milestoneKey: string; queryText: string; guidance: ExchangeGuidanceItem[] }) => void;
  };
}

export function InquiryComposer({ subjectId, options, initialMilestoneKey, rehearsal }: InquiryComposerProps) {
  const [milestoneKey, setMilestoneKey] = useState(
    initialMilestoneKey && options.some((o) => o.key === initialMilestoneKey) ? initialMilestoneKey : (options[0]?.key ?? ""),
  );
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = options.find((o) => o.key === milestoneKey);
  const concept = selected ? (selected.path.split("→")[1]?.trim() || selected.path) : "this stage";

  const MONO: React.CSSProperties = {
    fontFamily: "var(--ta-font-mono)",
    fontSize: "var(--ta-text-2xs)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--ta-text-muted)",
    margin: 0,
  };

  async function submit() {
    const trimmed = text.trim();
    if (trimmed.length === 0) { setNotice(COMPOSER_COPY.errorEmpty); return; }
    if (trimmed.length > COMPOSER_CHAR_LIMIT) { setNotice(COMPOSER_COPY.errorOverlong); return; }
    setNotice(null);
    setBusy(true);
    try {
      if (rehearsal) {
        const prompt: SocraticPrompt = {
          subjectId: subjectId as SocraticPrompt["subjectId"],
          currentMilestone: milestoneKey,
          studentInquiry: trimmed,
          previousArtifacts: rehearsal.artifacts,
        };
        rehearsal.onReflect({
          milestoneKey,
          queryText: trimmed,
          guidance: enrichRehearsalGuidance(resolveGuidance(prompt), rehearsal.artifacts),
        });
        setText("");
        return;
      }
      const result = await reflectOnInquiry({ subjectId, milestoneKey, inquiry: trimmed });
      if (result.ok) {
        setText("");
      } else {
        setNotice(result.reason === "empty" ? COMPOSER_COPY.errorEmpty
          : result.reason === "overlong" ? COMPOSER_COPY.errorOverlong
          : COMPOSER_COPY.errorRefused);
      }
    } catch {
      setNotice(COMPOSER_COPY.errorRefused);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-inquiry-composer style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-1)" }}>
        <label htmlFor="socratic-milestone" style={MONO}>{COMPOSER_COPY.milestoneLabel}</label>
        <select
          id="socratic-milestone"
          value={milestoneKey}
          onChange={(e) => setMilestoneKey(e.target.value)}
          disabled={busy || options.length === 0}
          style={{ background: "transparent", border: "1px solid var(--ta-border-subtle)", color: "var(--ta-text-primary)", font: "inherit", fontSize: "var(--ta-text-sm)", padding: "var(--ta-space-2) var(--ta-space-3)", maxWidth: "100%" }}
        >
          {options.map((o) => (
            <option key={o.key} value={o.key}>{o.path}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-1)" }}>
        <label htmlFor="socratic-inquiry" style={MONO}>{COMPOSER_COPY.inquiryLabel}</label>
        <input
          id="socratic-inquiry"
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value.slice(0, COMPOSER_CHAR_LIMIT)); setNotice(null); }}
          placeholder={COMPOSER_COPY.placeholderOf(concept)}
          maxLength={COMPOSER_CHAR_LIMIT}
          disabled={busy || options.length === 0}
          style={{ background: "transparent", border: "1px solid var(--ta-border-subtle)", color: "var(--ta-text-primary)", font: "inherit", fontSize: "var(--ta-text-md)", padding: "var(--ta-space-2) var(--ta-space-3)", maxWidth: "100%" }}
        />
        <p data-inquiry-counter aria-hidden style={{ ...MONO, textAlign: "right" }}>{COMPOSER_COPY.counterOf(text.length)}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ta-space-3)" }}>
        <button
          type="button"
          className="ta-btn"
          data-variant="primary"
          onClick={submit}
          disabled={busy || options.length === 0}
          aria-busy={busy || undefined}
        >
          {COMPOSER_COPY.submit}
        </button>
        <p role="status" style={{ ...MONO, color: "var(--ta-text-secondary)" }}>{notice ?? ""}</p>
      </div>
    </div>
  );
}
