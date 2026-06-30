-- Phase 6A: reset activity table RLS to the early authenticated-only baseline.
-- This keeps RLS enabled, removes temporary/duplicate activity policies, and
-- grants no anonymous access.

alter table public.activities enable row level security;

grant select, insert, update, delete on table public.activities to authenticated;

revoke all on table public.activities from anon;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'activities'
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

create policy "Authenticated users can manage activities"
on public.activities
for all
to authenticated
using (true)
with check (true);
