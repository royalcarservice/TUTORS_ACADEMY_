import type { ShellSubjectInfo } from "@/components/student/student-shell";
import { SUBJECTS } from "@/lib/subjects/subjects";
import type { SubjectId } from "@/lib/student/contract";

/* Resolves the 3.1 config into the DISPLAY facts the shell may state. The
 * environment name is the first clause of the config tagline ("The Field —
 * forces you can feel." → "The Field"); nothing here is authored anew.     */
export function shellSubjectInfo(): Partial<Record<SubjectId, ShellSubjectInfo>> {
  const out: Partial<Record<SubjectId, ShellSubjectInfo>> = {};
  for (const s of SUBJECTS) {
    out[s.id as SubjectId] = {
      id: s.id as SubjectId,
      name: s.name,
      environmentName: s.tagline.split(" — ")[0].trim(),
      motif: s.motif,
      density: s.density,
      status: s.status,
    };
  }
  return out;
}
