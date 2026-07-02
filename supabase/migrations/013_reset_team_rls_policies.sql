-- Phase 13A: reset team table RLS to the early authenticated-only baseline.
-- This keeps RLS enabled for team management, removes temporary/duplicate
-- policies, and grants no anonymous access.

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

grant select, insert, update, delete on table public.teams to authenticated;
grant select, insert, update, delete on table public.team_members to authenticated;

revoke all on table public.teams from anon;
revoke all on table public.team_members from anon;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('teams', 'team_members')
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

create policy "Authenticated users can manage teams"
on public.teams
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage team members"
on public.team_members
for all
to authenticated
using (true)
with check (true);
