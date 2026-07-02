-- Phase 15A: reset conflict record RLS for authenticated cleanup.
-- Activity deletion clears stale conflict_records after participant cleanup, so
-- authenticated users need the same baseline manage access used by other tables.

alter table public.conflict_records enable row level security;

grant select, insert, update, delete on table public.conflict_records to authenticated;

revoke all on table public.conflict_records from anon;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'conflict_records'
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

create policy "Authenticated users can manage conflict records"
on public.conflict_records
for all
to authenticated
using (true)
with check (true);
