-- STEM Competition Planner initial schema foundation.
-- Phase 2 intentionally defines database structure only:
-- no Supabase client setup, no CRUD UI, and no RLS/Auth policies yet.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  display_name text,
  email text,
  phone text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teachers_status_check check (status in ('active', 'inactive', 'archived')),
  constraint teachers_email_unique unique (email)
);

comment on table public.teachers is
  'Adult coordinators, teachers, mentors, or staff members who may support students, teams, or competitions in later phases.';

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  lead_teacher_id uuid references public.teachers(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competitions_status_check check (status in ('draft', 'planned', 'active', 'completed', 'archived')),
  constraint competitions_time_check check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint competitions_registration_time_check check (
    registration_closes_at is null
    or registration_opens_at is null
    or registration_closes_at > registration_opens_at
  )
);

comment on table public.competitions is
  'Dynamic competition records. Competition names are data, not application logic or schema concepts.';

create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text,
  first_name text not null,
  last_name text not null,
  display_name text,
  grade_level text,
  email text,
  phone text,
  guardian_name text,
  guardian_contact text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_status_check check (status in ('active', 'inactive', 'archived')),
  constraint students_student_code_unique unique (student_code),
  constraint students_email_unique unique (email)
);

comment on table public.students is
  'Student participant records. Competition participation is stored through student_competitions, not columns per competition.';

create table public.student_competitions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  status text not null default 'registered',
  registered_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_competitions_status_check check (status in ('registered', 'waitlisted', 'withdrawn', 'completed')),
  constraint student_competitions_withdrawn_check check (
    withdrawn_at is null or status in ('withdrawn', 'completed')
  ),
  constraint student_competitions_student_competition_unique unique (student_id, competition_id)
);

comment on table public.student_competitions is
  'Join table connecting students to any number of competitions.';

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  activity_type text,
  description text,
  status text not null default 'planned',
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  capacity integer,
  requires_team boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_status_check check (status in ('draft', 'planned', 'active', 'completed', 'cancelled', 'archived')),
  constraint activities_time_check check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint activities_capacity_check check (capacity is null or capacity > 0),
  constraint activities_id_competition_unique unique (id, competition_id)
);

comment on table public.activities is
  'Schedulable units such as briefings, workshops, judging sessions, practice blocks, or presentations for one competition.';

create table public.activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null,
  competition_id uuid not null,
  student_id uuid not null,
  role text,
  status text not null default 'assigned',
  assigned_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_participants_activity_competition_fk foreign key (activity_id, competition_id)
    references public.activities(id, competition_id) on delete cascade,
  constraint activity_participants_student_competition_fk foreign key (student_id, competition_id)
    references public.student_competitions(student_id, competition_id) on delete cascade,
  constraint activity_participants_status_check check (status in ('assigned', 'attended', 'absent', 'cancelled')),
  constraint activity_participants_unique unique (activity_id, student_id)
);

comment on table public.activity_participants is
  'Join table assigning registered students to activities without storing comma-separated participant lists.';

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  team_code text,
  status text not null default 'active',
  coach_teacher_id uuid references public.teachers(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_status_check check (status in ('active', 'inactive', 'disqualified', 'archived')),
  constraint teams_name_per_competition_unique unique (competition_id, name),
  constraint teams_code_per_competition_unique unique (competition_id, team_code),
  constraint teams_id_competition_unique unique (id, competition_id)
);

comment on table public.teams is
  'Team records scoped to exactly one competition.';

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  competition_id uuid not null,
  student_id uuid not null,
  role text,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_members_team_competition_fk foreign key (team_id, competition_id)
    references public.teams(id, competition_id) on delete cascade,
  constraint team_members_student_competition_fk foreign key (student_id, competition_id)
    references public.student_competitions(student_id, competition_id) on delete cascade,
  constraint team_members_status_check check (status in ('active', 'inactive', 'left')),
  constraint team_members_left_check check (left_at is null or status in ('inactive', 'left')),
  constraint team_members_unique unique (team_id, student_id)
);

comment on table public.team_members is
  'Join table assigning registered students to teams inside the same competition.';

create table public.conflict_records (
  id uuid primary key default gen_random_uuid(),
  conflict_type text not null,
  severity text not null default 'warning',
  status text not null default 'open',
  primary_competition_id uuid not null references public.competitions(id) on delete cascade,
  primary_activity_id uuid not null,
  conflicting_competition_id uuid not null references public.competitions(id) on delete cascade,
  conflicting_activity_id uuid not null,
  student_id uuid references public.students(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conflict_records_primary_activity_fk foreign key (primary_activity_id, primary_competition_id)
    references public.activities(id, competition_id) on delete cascade,
  constraint conflict_records_conflicting_activity_fk foreign key (conflicting_activity_id, conflicting_competition_id)
    references public.activities(id, competition_id) on delete cascade,
  constraint conflict_records_type_check check (
    conflict_type in ('student_overlap', 'team_overlap', 'location_overlap', 'capacity', 'other')
  ),
  constraint conflict_records_severity_check check (severity in ('info', 'warning', 'error', 'critical')),
  constraint conflict_records_status_check check (status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  constraint conflict_records_distinct_activities_check check (primary_activity_id <> conflicting_activity_id),
  constraint conflict_records_resolved_check check (
    resolved_at is null or status in ('resolved', 'dismissed')
  )
);

comment on table public.conflict_records is
  'Stored conflict findings comparing two activities and their competitions. Conflicts may also be recomputed later.';

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_key_unique unique (setting_key),
  constraint app_settings_key_format_check check (setting_key ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.app_settings is
  'Application-level configuration values. Competition-specific configuration should stay tied to competition data when added later.';

create index teachers_status_idx on public.teachers(status);
create index teachers_name_idx on public.teachers(last_name, first_name);

create index competitions_status_idx on public.competitions(status);
create index competitions_lead_teacher_idx on public.competitions(lead_teacher_id);
create index competitions_dates_idx on public.competitions(starts_at, ends_at);

create index students_status_idx on public.students(status);
create index students_name_idx on public.students(last_name, first_name);
create index students_grade_level_idx on public.students(grade_level);

create index student_competitions_competition_idx on public.student_competitions(competition_id);
create index student_competitions_student_idx on public.student_competitions(student_id);
create index student_competitions_status_idx on public.student_competitions(status);

create index activities_competition_idx on public.activities(competition_id);
create index activities_competition_time_idx on public.activities(competition_id, starts_at, ends_at);
create index activities_status_idx on public.activities(status);
create index activities_type_idx on public.activities(activity_type);

create index activity_participants_activity_idx on public.activity_participants(activity_id);
create index activity_participants_student_idx on public.activity_participants(student_id);
create index activity_participants_competition_student_idx on public.activity_participants(competition_id, student_id);

create index teams_competition_idx on public.teams(competition_id);
create index teams_coach_teacher_idx on public.teams(coach_teacher_id);
create index teams_status_idx on public.teams(status);

create index team_members_team_idx on public.team_members(team_id);
create index team_members_student_idx on public.team_members(student_id);
create index team_members_competition_student_idx on public.team_members(competition_id, student_id);

create index conflict_records_status_idx on public.conflict_records(status);
create index conflict_records_severity_idx on public.conflict_records(severity);
create index conflict_records_primary_competition_idx on public.conflict_records(primary_competition_id);
create index conflict_records_conflicting_competition_idx on public.conflict_records(conflicting_competition_id);
create index conflict_records_student_idx on public.conflict_records(student_id);
create index conflict_records_team_idx on public.conflict_records(team_id);
create index conflict_records_detected_at_idx on public.conflict_records(detected_at);

create trigger set_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

create trigger set_competitions_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();

create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

create trigger set_student_competitions_updated_at
before update on public.student_competitions
for each row execute function public.set_updated_at();

create trigger set_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger set_activity_participants_updated_at
before update on public.activity_participants
for each row execute function public.set_updated_at();

create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger set_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

create trigger set_conflict_records_updated_at
before update on public.conflict_records
for each row execute function public.set_updated_at();

create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- RLS/Auth note:
-- Row-level security policies are intentionally not enabled in this phase.
-- Auth, roles, organization scoping, and RLS policy design will be handled in a later phase
-- before exposing these tables to application users.
