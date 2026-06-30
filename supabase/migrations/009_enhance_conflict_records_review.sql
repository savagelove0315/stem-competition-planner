-- Phase 8B: persist review state for live-computed conflict findings.
--
-- This migration is additive. It keeps existing conflict_records rows and adds
-- fields needed to match a computed conflict without saving every conflict just
-- by viewing the page.

alter table public.conflict_records
  add column if not exists conflict_key text,
  add column if not exists conflict_start_date date,
  add column if not exists conflict_end_date date,
  add column if not exists teacher_note text,
  add column if not exists resolution_note text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists last_seen_at timestamptz;

alter table public.conflict_records
  drop constraint if exists conflict_records_severity_check;

alter table public.conflict_records
  add constraint conflict_records_severity_check check (
    severity in ('info', 'warning', 'error', 'critical', 'mild', 'serious')
  );

create unique index if not exists conflict_records_conflict_key_unique_idx
  on public.conflict_records(conflict_key)
  where conflict_key is not null;

create index if not exists conflict_records_student_date_idx
  on public.conflict_records(student_id, conflict_start_date, conflict_end_date);

create index if not exists conflict_records_review_status_idx
  on public.conflict_records(status, resolved_at);

alter table public.conflict_records enable row level security;

grant select, insert, update on table public.conflict_records to authenticated;
revoke all on table public.conflict_records from anon;

drop policy if exists "Authenticated users can select conflict_records" on public.conflict_records;
create policy "Authenticated users can select conflict_records"
on public.conflict_records
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert conflict_records" on public.conflict_records;
create policy "Authenticated users can insert conflict_records"
on public.conflict_records
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update conflict_records" on public.conflict_records;
create policy "Authenticated users can update conflict_records"
on public.conflict_records
for update
to authenticated
using (true)
with check (true);
