-- DEC-047 (2026-10-09): Computer Science joins the governed subject set by
-- explicit owner mandate (Interactive 3D Subject Gallery brief). Fresh
-- installs get this via the amended 0001; databases that already applied the
-- six-slug 0001 converge here. Mirrors src/lib/subjects/subjects.ts.
create or replace function public.is_subject_id(p text) returns boolean
language sql immutable as $$
  select p in ('mathematics','physics','chemistry','biology','english','history','computer-science')
$$;
