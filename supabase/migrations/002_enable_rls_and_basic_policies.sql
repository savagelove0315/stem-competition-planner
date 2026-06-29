-- Phase 3C: temporary authenticated-only RLS baseline.
--
-- These policies are intentionally broad for early authenticated development:
-- any authenticated user can select, insert, update, and delete app data.
-- Anonymous users receive no policies.
--
-- A later phase must replace this baseline with organization, role, and ownership
-- rules before production use or before exposing sensitive workflows broadly.

alter table public.competitions enable row level security;
alter table public.students enable row level security;
alter table public.student_competitions enable row level security;
alter table public.activities enable row level security;
alter table public.activity_participants enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.teachers enable row level security;
alter table public.conflict_records enable row level security;
alter table public.app_settings enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.competitions to authenticated;
grant select, insert, update, delete on table public.students to authenticated;
grant select, insert, update, delete on table public.student_competitions to authenticated;
grant select, insert, update, delete on table public.activities to authenticated;
grant select, insert, update, delete on table public.activity_participants to authenticated;
grant select, insert, update, delete on table public.teams to authenticated;
grant select, insert, update, delete on table public.team_members to authenticated;
grant select, insert, update, delete on table public.teachers to authenticated;
grant select, insert, update, delete on table public.conflict_records to authenticated;
grant select, insert, update, delete on table public.app_settings to authenticated;

revoke all on table public.competitions from anon;
revoke all on table public.students from anon;
revoke all on table public.student_competitions from anon;
revoke all on table public.activities from anon;
revoke all on table public.activity_participants from anon;
revoke all on table public.teams from anon;
revoke all on table public.team_members from anon;
revoke all on table public.teachers from anon;
revoke all on table public.conflict_records from anon;
revoke all on table public.app_settings from anon;

drop policy if exists "Authenticated users can select competitions" on public.competitions;
create policy "Authenticated users can select competitions"
on public.competitions
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert competitions" on public.competitions;
create policy "Authenticated users can insert competitions"
on public.competitions
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update competitions" on public.competitions;
create policy "Authenticated users can update competitions"
on public.competitions
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete competitions" on public.competitions;
create policy "Authenticated users can delete competitions"
on public.competitions
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select students" on public.students;
create policy "Authenticated users can select students"
on public.students
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert students" on public.students;
create policy "Authenticated users can insert students"
on public.students
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update students" on public.students;
create policy "Authenticated users can update students"
on public.students
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete students" on public.students;
create policy "Authenticated users can delete students"
on public.students
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select student_competitions" on public.student_competitions;
create policy "Authenticated users can select student_competitions"
on public.student_competitions
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert student_competitions" on public.student_competitions;
create policy "Authenticated users can insert student_competitions"
on public.student_competitions
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update student_competitions" on public.student_competitions;
create policy "Authenticated users can update student_competitions"
on public.student_competitions
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete student_competitions" on public.student_competitions;
create policy "Authenticated users can delete student_competitions"
on public.student_competitions
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select activities" on public.activities;
create policy "Authenticated users can select activities"
on public.activities
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert activities" on public.activities;
create policy "Authenticated users can insert activities"
on public.activities
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update activities" on public.activities;
create policy "Authenticated users can update activities"
on public.activities
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete activities" on public.activities;
create policy "Authenticated users can delete activities"
on public.activities
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select activity_participants" on public.activity_participants;
create policy "Authenticated users can select activity_participants"
on public.activity_participants
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert activity_participants" on public.activity_participants;
create policy "Authenticated users can insert activity_participants"
on public.activity_participants
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update activity_participants" on public.activity_participants;
create policy "Authenticated users can update activity_participants"
on public.activity_participants
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete activity_participants" on public.activity_participants;
create policy "Authenticated users can delete activity_participants"
on public.activity_participants
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select teams" on public.teams;
create policy "Authenticated users can select teams"
on public.teams
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert teams" on public.teams;
create policy "Authenticated users can insert teams"
on public.teams
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update teams" on public.teams;
create policy "Authenticated users can update teams"
on public.teams
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete teams" on public.teams;
create policy "Authenticated users can delete teams"
on public.teams
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select team_members" on public.team_members;
create policy "Authenticated users can select team_members"
on public.team_members
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert team_members" on public.team_members;
create policy "Authenticated users can insert team_members"
on public.team_members
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update team_members" on public.team_members;
create policy "Authenticated users can update team_members"
on public.team_members
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete team_members" on public.team_members;
create policy "Authenticated users can delete team_members"
on public.team_members
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select teachers" on public.teachers;
create policy "Authenticated users can select teachers"
on public.teachers
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert teachers" on public.teachers;
create policy "Authenticated users can insert teachers"
on public.teachers
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update teachers" on public.teachers;
create policy "Authenticated users can update teachers"
on public.teachers
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete teachers" on public.teachers;
create policy "Authenticated users can delete teachers"
on public.teachers
for delete
to authenticated
using (true);

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

drop policy if exists "Authenticated users can delete conflict_records" on public.conflict_records;
create policy "Authenticated users can delete conflict_records"
on public.conflict_records
for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select app_settings" on public.app_settings;
create policy "Authenticated users can select app_settings"
on public.app_settings
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert app_settings" on public.app_settings;
create policy "Authenticated users can insert app_settings"
on public.app_settings
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update app_settings" on public.app_settings;
create policy "Authenticated users can update app_settings"
on public.app_settings
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete app_settings" on public.app_settings;
create policy "Authenticated users can delete app_settings"
on public.app_settings
for delete
to authenticated
using (true);
