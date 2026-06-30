-- Phase 5C: reset student table RLS to the early authenticated-only baseline.
-- This keeps RLS enabled, removes temporary/duplicate policies, and grants no
-- anonymous access.

alter table public.students enable row level security;
alter table public.student_competitions enable row level security;

grant select, insert, update, delete on table public.students to authenticated;
grant select, insert, update, delete on table public.student_competitions to authenticated;

revoke all on table public.students from anon;
revoke all on table public.student_competitions from anon;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('students', 'student_competitions')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

create policy "Authenticated users can manage students"
on public.students
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage student competitions"
on public.student_competitions
for all
to authenticated
using (true)
with check (true);
