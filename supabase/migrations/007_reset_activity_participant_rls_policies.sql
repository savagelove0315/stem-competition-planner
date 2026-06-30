-- Phase 6B: reset activity participant RLS to the early authenticated-only baseline.
-- This keeps RLS enabled for the activity_participants join table, removes
-- temporary/duplicate policies, and grants no anonymous access.

alter table public.activity_participants enable row level security;

grant select, insert, update, delete on table public.activity_participants to authenticated;

revoke all on table public.activity_participants from anon;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'activity_participants'
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

create policy "Authenticated users can manage activity participants"
on public.activity_participants
for all
to authenticated
using (true)
with check (true);
