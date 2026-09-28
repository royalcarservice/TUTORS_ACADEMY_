"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getSubject, type SubjectConfig } from "./subjects";

/* Minimal context exposing the ACTIVE subject identity to components that
   genuinely need it (later: ambient layer, 3D scene, analytics). Components
   consume TOKENS (via [data-subject]) + this context ONLY — never the config
   files directly (enforced by scripts/check-subject-imports.mjs).

   NESTING IS SUPPORTED AND DEFINED: a ROOM INSIDE A STAGE keeps the subject
   accent identity but reduces atmosphere and disables ambience (roomMood).
   The Room reuses the same [data-subject] scope (accents) while the ambient
   layer reads roomMood and switches off — no second colour source.          */

interface Ctx {
  subject: SubjectConfig | null;
  /** DRAFT GUARD: a draft subject can never be applied in production. */
  apply: (id: string) => void;
}

const SubjectContext = createContext<Ctx>({ subject: null, apply: () => {} });

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subject, setSubject] = useState<SubjectConfig | null>(null);

  const apply = useCallback((id: string) => {
    const s = getSubject(id);
    if (!s) return;
    if (s.status === "draft" && process.env.NODE_ENV === "production") {
      // Mechanical draft guard — impossible to ship a draft subject.
      throw new Error(`[subjects] "${id}" is draft and cannot ship to production.`);
    }
    setSubject(s);
  }, []);

  const value = useMemo(() => ({ subject, apply }), [subject, apply]);
  return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>;
}

export const useSubject = () => useContext(SubjectContext);
