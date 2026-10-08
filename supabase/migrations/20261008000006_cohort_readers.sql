-- ============================================================================
-- TUTORS ACADEMY · Phase 7 · Step 2 — THE FIRST READER'S POLICIES (migration 0006)
--
-- Migration 0005 created public.cohorts / public.cohort_tutors with RLS
-- ENABLED AND FORCED and ZERO policies, and named its own successor: "the
-- policies are written by the step that builds the first reader, using the
-- standing predicates (enrolment for students, is_related_tutor for
-- tutors)." THIS STEP IS THAT READER (the cohort surface under
-- /subjects/[subject]/live and the next-action class provider).
--
-- WHAT THIS GRANTS (SELECT, and nothing else)
--   students  a cohort in a subject the student is ACTIVELY enrolled in.
--             The enrolment boundary is the student's standing predicate —
--             the same relationship that opens the environment (5.3).
--   tutors    a cohort the tutor is ASSIGNED to (public.cohort_tutors).
--             ONE REFINEMENT of 0005's header, recorded here and in DEC-023:
--             is_related_tutor is the predicate for reading STUDENT ROWS
--             (enrolments, environment_state, progress_record). Cohorts are
--             not student rows; the brief's reader is the ASSIGNED tutor,
--             and assignment is the junction. is_related_tutor keeps
--             governing student-row reads, unchanged.
--   tutors also read their OWN assignment rows in public.cohort_tutors.
--
-- WHAT THIS DELIBERATELY DOES NOT GRANT
--   No student read of public.cohort_tutors: which tutor is assigned to a
--   cohort is tutor presence, and tutor presence is a ruled surface (the P6
--   extension doc: a row slot, resolved by its own phase) — never
--   pre-solved here.
--   No INSERT / UPDATE / DELETE for authenticated: service role manages
--   cohorts (the 6.1 §6 posture, carried forward by 0005). The recording of
--   attendance writes progress_record through the service role on a real
--   occurrence (0004); nothing about that changes here.
--   Zero surveillance by construction: no presence, dwell-time or heartbeat
--   column exists anywhere in this model, and no policy can create one.
-- ============================================================================

-- ── cohorts: the student's boundary is active enrolment in the cohort's subject ──
create policy cohorts_select_enrolled_student on public.cohorts
  for select to authenticated using (
    exists (
      select 1 from public.enrolments e
      where e.student_id = auth.uid()
        and e.subject_id = cohorts.subject_id
        and e.status = 'active'
    )
  );

-- ── cohorts: the tutor's boundary is assignment ───────────────────────────────
create policy cohorts_select_assigned_tutor on public.cohorts
  for select to authenticated using (
    exists (
      select 1 from public.cohort_tutors ct
      where ct.cohort_id = cohorts.id
        and ct.tutor_id = auth.uid()
    )
  );

-- ── cohort_tutors: a tutor reads their own assignment rows ────────────────────
create policy cohort_tutors_select_own on public.cohort_tutors
  for select to authenticated using (tutor_id = auth.uid());

-- The 6.1 pattern: RLS already refuses writes; the grant stays minimal.
-- (RLS on both tables was enabled AND forced by 0005; service_role already
-- holds ALL on both — neither is repeated here.)
grant select on public.cohorts to authenticated;        -- rows still gated by RLS
grant select on public.cohort_tutors to authenticated;  -- rows still gated by RLS
