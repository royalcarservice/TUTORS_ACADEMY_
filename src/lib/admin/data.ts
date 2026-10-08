"use server";

import { revalidatePath } from "next/cache";

import { getIdentity } from "@/lib/auth/session";
import { LEVER_OPTIONS, type EnvironmentLevers } from "@/lib/environment/levers";
import { DataReadError } from "@/lib/state/read-error";
import { roomNameOf, SUBJECTS } from "@/lib/subjects/subjects";
import { isAuthConfigured } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/service";

/* ════════════════════════════════════════════════════════════════════════
   THE ADMIN OPERATIONS READER (Unfinished Work · Track 1)

   The back-office data layer. Two modes, one shape:

   LIVE — credentials present. Reads and writes run through the
   SERVICE-ROLE client (src/lib/supabase/service.ts): admin tooling is its
   declared purpose. Every mutating action re-verifies the caller's role
   ('admin') before touching a row; the service key bypasses RLS, so the
   check here IS the policy.

   DEMONSTRATION — credentials absent. The console renders and behaves
   against an in-process fixture ledger so the operations layer is
   testable out of the box. Fixtures use the product's established
   specimen register ("Specimen One" …): no real identity anywhere.
   Mutations adjust the in-process ledger only; nothing persists, and
   the console's banner says exactly that. Credentialing writes
   (subject approval) are NOT wired in live mode yet — the action says
   so plainly instead of pretending (the lineage's honesty rule).
   ════════════════════════════════════════════════════════════════════════ */

export interface ActionResult {
  ok: boolean;
  note: string;
}

export interface OverviewRoom {
  id: string;
  name: string;
  room: string;
  status: string;
}

export interface AdminOverview {
  mode: "live" | "demonstration";
  placedStudents: number;
  verifiedTutors: number;
  activeRelationships: number;
  rooms: OverviewRoom[];
  lineage: string;
}

export interface PlacementRow {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subjectName: string;
  startedAt: string;
  state: "active" | "ended";
}

export interface TutorRow {
  id: string;
  name: string;
  status: "verified" | "pending";
  activeSubjects: string[];
  pendingSubjects: string[];
  activeRelationships: number;
}

export interface SubjectRoomRow {
  subjectId: string;
  name: string;
  room: string;
  density: EnvironmentLevers["density"];
  motionChar: EnvironmentLevers["motionChar"];
  shapedNote: string;
}

export interface RosterOptions {
  students: { id: string; name: string }[];
  tutors: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}

/* ── the demonstration ledger ───────────────────────────────────────────── */

interface Ledger {
  students: { id: string; name: string }[];
  tutors: { id: string; name: string; status: "verified" | "pending" }[];
  placements: PlacementRow[];
  approvals: { tutorId: string; subjectId: string; state: "approved" | "pending" }[];
  rooms: Record<string, { density: EnvironmentLevers["density"]; motionChar: EnvironmentLevers["motionChar"] }>;
}

const ledger: Ledger = {
  students: [
    { id: "a0000000-0000-4000-8000-000000000101", name: "Specimen One" },
    { id: "a0000000-0000-4000-8000-000000000102", name: "Specimen Two" },
    { id: "a0000000-0000-4000-8000-000000000103", name: "Specimen Three" },
    { id: "a0000000-0000-4000-8000-000000000104", name: "Specimen Four" },
  ],
  tutors: [
    { id: "b0000000-0000-4000-8000-000000000201", name: "Specimen Tutor One", status: "verified" },
    { id: "b0000000-0000-4000-8000-000000000202", name: "Specimen Tutor Two", status: "verified" },
    { id: "b0000000-0000-4000-8000-000000000203", name: "Specimen Tutor Three", status: "pending" },
  ],
  placements: [
    {
      id: "c0000000-0000-4000-8000-000000000301",
      studentId: "a0000000-0000-4000-8000-000000000101",
      studentName: "Specimen One",
      tutorId: "b0000000-0000-4000-8000-000000000201",
      tutorName: "Specimen Tutor One",
      subjectId: "mathematics",
      subjectName: "Mathematics",
      startedAt: "2026-09-01",
      state: "active",
    },
    {
      id: "c0000000-0000-4000-8000-000000000302",
      studentId: "a0000000-0000-4000-8000-000000000102",
      studentName: "Specimen Two",
      tutorId: "b0000000-0000-4000-8000-000000000201",
      tutorName: "Specimen Tutor One",
      subjectId: "mathematics",
      subjectName: "Mathematics",
      startedAt: "2026-09-03",
      state: "active",
    },
    {
      id: "c0000000-0000-4000-8000-000000000303",
      studentId: "a0000000-0000-4000-8000-000000000103",
      studentName: "Specimen Three",
      tutorId: "b0000000-0000-4000-8000-000000000202",
      tutorName: "Specimen Tutor Two",
      subjectId: "physics",
      subjectName: "Physics",
      startedAt: "2026-09-10",
      state: "active",
    },
    {
      id: "c0000000-0000-4000-8000-000000000304",
      studentId: "a0000000-0000-4000-8000-000000000104",
      studentName: "Specimen Four",
      tutorId: "b0000000-0000-4000-8000-000000000202",
      tutorName: "Specimen Tutor Two",
      subjectId: "english",
      subjectName: "English",
      startedAt: "2026-08-20",
      state: "ended",
    },
  ],
  approvals: [
    { tutorId: "b0000000-0000-4000-8000-000000000201", subjectId: "mathematics", state: "approved" },
    { tutorId: "b0000000-0000-4000-8000-000000000202", subjectId: "physics", state: "approved" },
    { tutorId: "b0000000-0000-4000-8000-000000000202", subjectId: "english", state: "approved" },
    { tutorId: "b0000000-0000-4000-8000-000000000203", subjectId: "history", state: "pending" },
    { tutorId: "b0000000-0000-4000-8000-000000000203", subjectId: "biology", state: "pending" },
  ],
  rooms: {
    mathematics: { density: "balanced", motionChar: "precise" },
    physics: { density: "balanced", motionChar: "energetic" },
    chemistry: { density: "balanced", motionChar: "reactive" },
    biology: { density: "sparse", motionChar: "growing" },
    english: { density: "sparse", motionChar: "editorial" },
    history: { density: "dense", motionChar: "sequential" },
  },
};

const ADMIN_PATHS = ["/admin", "/admin/placements", "/admin/tutors", "/admin/subjects"];

function refresh() {
  for (const p of ADMIN_PATHS) revalidatePath(p);
}

function subjectNameOf(id: string): string {
  return SUBJECTS.find((s) => s.id === id)?.name ?? id;
}

/* ── reads ──────────────────────────────────────────────────────────────── */

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const rooms: OverviewRoom[] = SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    room: roomNameOf(s.id),
    status: s.status,
  }));
  const lineage = "Certified through Phase 10 — READY FOR PRODUCTION (DEC-040)";

  if (!isAuthConfigured()) {
    const active = ledger.placements.filter((p) => p.state === "active");
    return {
      mode: "demonstration",
      placedStudents: new Set(active.map((p) => p.studentId)).size,
      verifiedTutors: ledger.tutors.filter((t) => t.status === "verified").length,
      activeRelationships: active.length,
      rooms,
      lineage,
    };
  }

  const supabase = createServiceClient();
  if (!supabase) throw new DataReadError("admin.overview", new Error("service client unavailable"));
  const { data: rels, error: relErr } = await supabase
    .from("relationships")
    .select("student_id, state")
    .eq("state", "active");
  if (relErr) throw new DataReadError("relationships", relErr);
  const { count: tutorCount, error: tutorErr } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "tutor");
  if (tutorErr) throw new DataReadError("profiles", tutorErr);

  return {
    mode: "live",
    placedStudents: new Set((rels ?? []).map((r) => r.student_id as string)).size,
    verifiedTutors: tutorCount ?? 0,
    activeRelationships: (rels ?? []).length,
    rooms,
    lineage,
  };
}

export async function fetchPlacementsList(): Promise<PlacementRow[]> {
  if (!isAuthConfigured()) {
    return [...ledger.placements].sort(
      (a, b) => a.studentName.localeCompare(b.studentName, undefined, { sensitivity: "base" }) || a.subjectId.localeCompare(b.subjectId),
    );
  }
  const supabase = createServiceClient();
  if (!supabase) throw new DataReadError("admin.placements", new Error("service client unavailable"));
  const { data, error } = await supabase
    .from("relationships")
    .select("id, student_id, tutor_id, subject_id, state, started_at")
    .order("started_at", { ascending: false });
  if (error) throw new DataReadError("relationships", error);
  const ids = Array.from(new Set((data ?? []).flatMap((r) => [r.student_id as string, r.tutor_id as string])));
  const { data: profiles, error: profErr } = await supabase.from("profiles").select("id, display_name").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  if (profErr) throw new DataReadError("profiles", profErr);
  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.display_name as string) || ""]));
  return (data ?? []).map((r) => ({
    id: r.id as string,
    studentId: r.student_id as string,
    studentName: names.get(r.student_id as string) ?? "",
    tutorId: r.tutor_id as string,
    tutorName: names.get(r.tutor_id as string) ?? "",
    subjectId: r.subject_id as string,
    subjectName: subjectNameOf(r.subject_id as string),
    startedAt: String(r.started_at).slice(0, 10),
    state: r.state as "active" | "ended",
  }));
}

export async function fetchTutorRoster(): Promise<TutorRow[]> {
  if (!isAuthConfigured()) {
    return ledger.tutors.map((t) => {
      const active = ledger.placements.filter((p) => p.tutorId === t.id && p.state === "active");
      return {
        id: t.id,
        name: t.name,
        status: t.status,
        activeSubjects: Array.from(new Set(active.map((p) => p.subjectName))),
        pendingSubjects: ledger.approvals
          .filter((a) => a.tutorId === t.id && a.state === "pending")
          .map((a) => subjectNameOf(a.subjectId)),
        activeRelationships: active.length,
      };
    });
  }
  const supabase = createServiceClient();
  if (!supabase) throw new DataReadError("admin.roster", new Error("service client unavailable"));
  const { data: tutors, error: tutorErr } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("role", "tutor")
    .order("display_name");
  if (tutorErr) throw new DataReadError("profiles", tutorErr);
  const { data: rels, error: relErr } = await supabase
    .from("relationships")
    .select("tutor_id, subject_id, state")
    .eq("state", "active");
  if (relErr) throw new DataReadError("relationships", relErr);
  const byTutor = new Map<string, string[]>();
  for (const r of rels ?? []) {
    const list = byTutor.get(r.tutor_id as string) ?? [];
    list.push(subjectNameOf(r.subject_id as string));
    byTutor.set(r.tutor_id as string, list);
  }
  return (tutors ?? []).map((t) => {
    const subjects = Array.from(new Set(byTutor.get(t.id as string) ?? []));
    return {
      id: t.id as string,
      name: (t.display_name as string) || "",
      status: (subjects.length > 0 ? "verified" : "pending") as TutorRow["status"],
      activeSubjects: subjects,
      pendingSubjects: [],
      activeRelationships: (rels ?? []).filter((r) => r.tutor_id === t.id).length,
    };
  });
}

export async function fetchSubjectRooms(): Promise<SubjectRoomRow[]> {
  if (!isAuthConfigured()) {
    return SUBJECTS.map((s) => {
      const r = ledger.rooms[s.id] ?? { density: "balanced" as const, motionChar: s.motionChar };
      return { subjectId: s.id, name: s.name, room: roomNameOf(s.id), density: r.density, motionChar: r.motionChar, shapedNote: "authored default" };
    });
  }
  const supabase = createServiceClient();
  if (!supabase) throw new DataReadError("admin.rooms", new Error("service client unavailable"));
  const { data, error } = await supabase.from("environment_settings").select("subject_id, density, motion_char, updated_at");
  if (error) throw new DataReadError("environment_settings", error);
  const shaped = new Map((data ?? []).map((d) => [d.subject_id as string, d]));
  return SUBJECTS.map((s) => {
    const row = shaped.get(s.id);
    return {
      subjectId: s.id,
      name: s.name,
      room: roomNameOf(s.id),
      density: (row?.density as EnvironmentLevers["density"]) ?? s.density,
      motionChar: (row?.motion_char as EnvironmentLevers["motionChar"]) ?? s.motionChar,
      shapedNote: row ? `shaped ${String(row.updated_at).slice(0, 10)}` : "authored default",
    };
  });
}

export async function fetchRosterOptions(): Promise<RosterOptions> {
  const subjects = SUBJECTS.map((s) => ({ id: s.id, name: s.name }));
  if (!isAuthConfigured()) {
    return { students: [...ledger.students], tutors: [...ledger.tutors], subjects };
  }
  const supabase = createServiceClient();
  if (!supabase) throw new DataReadError("admin.options", new Error("service client unavailable"));
  const { data, error } = await supabase.from("profiles").select("id, display_name, role").in("role", ["student", "tutor"]).order("display_name");
  if (error) throw new DataReadError("profiles", error);
  return {
    students: (data ?? []).filter((p) => p.role === "student").map((p) => ({ id: p.id as string, name: (p.display_name as string) || "" })),
    tutors: (data ?? []).filter((p) => p.role === "tutor").map((p) => ({ id: p.id as string, name: (p.display_name as string) || "" })),
    subjects,
  };
}

/* ── actions ────────────────────────────────────────────────────────────── */

async function requireAdminInLiveMode(): Promise<ActionResult | null> {
  if (!isAuthConfigured()) return null; // demonstration ledger is open by design; the banner says so
  const identity = await getIdentity();
  if (!identity || identity.role !== "admin") {
    return { ok: false, note: "This console requires an administrator identity. Nothing was changed." };
  }
  return null;
}

export async function createPlacement(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const blocked = await requireAdminInLiveMode();
  if (blocked) return blocked;
  const studentId = String(formData.get("studentId") ?? "");
  const tutorId = String(formData.get("tutorId") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!studentId || !tutorId || !subjectId) {
    return { ok: false, note: "A placement needs a student, a tutor and a subject. Nothing was changed." };
  }

  if (!isAuthConfigured()) {
    const student = ledger.students.find((s) => s.id === studentId);
    const tutor = ledger.tutors.find((t) => t.id === tutorId);
    if (!student || !tutor || !SUBJECTS.some((s) => s.id === subjectId)) {
      return { ok: false, note: "One of the named accounts is not in the ledger. Nothing was changed." };
    }
    ledger.placements.unshift({
      id: `c0000000-0000-4000-8000-${String(Date.now()).slice(-12)}`,
      studentId,
      studentName: student.name,
      tutorId,
      tutorName: tutor.name,
      subjectId,
      subjectName: subjectNameOf(subjectId),
      startedAt: new Date().toISOString().slice(0, 10),
      state: "active",
    });
    refresh();
    return { ok: true, note: `${student.name} is placed with ${tutor.name} in ${subjectNameOf(subjectId)}.` };
  }

  const supabase = createServiceClient();
  if (!supabase) return { ok: false, note: "The service client is unavailable in this deployment. Nothing was changed." };
  const { error } = await supabase.from("relationships").insert({ student_id: studentId, tutor_id: tutorId, subject_id: subjectId, state: "active" });
  if (error) return { ok: false, note: "The database refused the placement. Nothing was changed." };
  refresh();
  return { ok: true, note: "The placement is established." };
}

export async function revokePlacement(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const blocked = await requireAdminInLiveMode();
  if (blocked) return blocked;
  const id = String(formData.get("relationshipId") ?? "");
  if (!id) return { ok: false, note: "No placement was named. Nothing was changed." };

  if (!isAuthConfigured()) {
    const row = ledger.placements.find((p) => p.id === id);
    if (!row) return { ok: false, note: "That placement is not in the ledger. Nothing was changed." };
    row.state = "ended";
    refresh();
    return { ok: true, note: `The placement of ${row.studentName} with ${row.tutorName} is ended.` };
  }

  const supabase = createServiceClient();
  if (!supabase) return { ok: false, note: "The service client is unavailable in this deployment. Nothing was changed." };
  const { error } = await supabase.from("relationships").update({ state: "ended", ended_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, note: "The database refused the change. Nothing was changed." };
  refresh();
  return { ok: true, note: "The placement is ended." };
}

export async function approveTutorSubject(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const blocked = await requireAdminInLiveMode();
  if (blocked) return blocked;
  const tutorId = String(formData.get("tutorId") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!tutorId || !subjectId) return { ok: false, note: "No tutor and subject were named. Nothing was changed." };

  if (!isAuthConfigured()) {
    const entry = ledger.approvals.find((a) => a.tutorId === tutorId && a.subjectId === subjectId && a.state === "pending");
    if (!entry) return { ok: false, note: "No pending request matches. Nothing was changed." };
    entry.state = "approved";
    const tutor = ledger.tutors.find((t) => t.id === tutorId);
    if (tutor && tutor.status === "pending") tutor.status = "verified";
    refresh();
    return { ok: true, note: `${subjectNameOf(subjectId)} is approved for ${tutor?.name ?? "the tutor"}.` };
  }

  // Credentialing writes ship with the credentialed track; honesty over theatre.
  return { ok: false, note: "Credentialing writes are not wired to a live database yet. Nothing was changed." };
}

export async function updateSubjectLevers(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const blocked = await requireAdminInLiveMode();
  if (blocked) return blocked;
  const subjectId = String(formData.get("subjectId") ?? "");
  const density = String(formData.get("density") ?? "");
  const motionChar = String(formData.get("motionChar") ?? "");
  if (!LEVER_OPTIONS.density.includes(density as EnvironmentLevers["density"]) || !LEVER_OPTIONS.motionChar.includes(motionChar as EnvironmentLevers["motionChar"])) {
    return { ok: false, note: "A lever value outside the authored set was submitted. Nothing was changed." };
  }

  if (!isAuthConfigured()) {
    ledger.rooms[subjectId] = { density: density as EnvironmentLevers["density"], motionChar: motionChar as EnvironmentLevers["motionChar"] };
    refresh();
    return { ok: true, note: `${roomNameOf(subjectId)} now runs ${density} density with a ${motionChar} motion character.` };
  }

  const identity = await getIdentity();
  if (!identity) return { ok: false, note: "No identity for the shaped_by record. Nothing was changed." };
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, note: "The service client is unavailable in this deployment. Nothing was changed." };
  const { error } = await supabase
    .from("environment_settings")
    .upsert({ subject_id: subjectId, density, motion_char: motionChar, shaped_by: identity.id }, { onConflict: "subject_id" });
  if (error) return { ok: false, note: "The database refused the shaping. Nothing was changed." };
  refresh();
  return { ok: true, note: `${roomNameOf(subjectId)} is shaped.` };
}
