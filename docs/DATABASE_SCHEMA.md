# Database Schema

This document describes the Phase 2 database foundation for the STEM Competition Planner. The schema is competition-agnostic: every competition is stored as data in `competitions`, and related records reference `competition_id`.

Scratch, Robotics, or any other competition names may appear later as seed/demo data only. They are not represented as tables, enum values, routes, or logic branches.

## Migration

The initial schema lives in:

```text
supabase/migrations/001_initial_schema.sql
```

This phase does not connect Supabase, install a client library, or enable real CRUD workflows.

## Tables

### `competitions`

Stores dynamic competition records.

Key columns:

- `id uuid primary key`
- `name text`
- `description text`
- `status text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `registration_opens_at timestamptz`
- `registration_closes_at timestamptz`
- `lead_teacher_id uuid`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Status values:

- `draft`
- `planned`
- `active`
- `completed`
- `archived`

### `students`

Stores individual student participants. Competition participation is modeled through `student_competitions`.

Key columns:

- `id uuid primary key`
- `student_code text`
- `first_name text`
- `last_name text`
- `display_name text`
- `grade_level text`
- `email text`
- `phone text`
- `guardian_name text`
- `guardian_contact text`
- `status text`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `student_competitions`

Join table connecting students to competitions.

Key columns:

- `id uuid primary key`
- `student_id uuid`
- `competition_id uuid`
- `status text`
- `registered_at timestamptz`
- `withdrawn_at timestamptz`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Important constraints:

- A student can join many competitions.
- A student can appear only once per competition.
- This table replaces any competition-specific participation columns.

### `activities`

Stores scheduled or schedulable units belonging to one competition.

Key columns:

- `id uuid primary key`
- `competition_id uuid`
- `name text`
- `activity_type text`
- `description text`
- `status text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `location text`
- `capacity integer`
- `requires_team boolean`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Activities can represent workshops, judging sessions, briefings, practice blocks, presentations, setup blocks, ceremonies, or other competition-specific units.

### `activity_participants`

Join table assigning students to activities.

Key columns:

- `id uuid primary key`
- `activity_id uuid`
- `competition_id uuid`
- `student_id uuid`
- `role text`
- `status text`
- `assigned_at timestamptz`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Important constraints:

- A participant must be registered for the same competition as the activity.
- A student can appear only once per activity.
- Participants are not stored as comma-separated text.

### `teams`

Stores team records scoped to one competition.

Key columns:

- `id uuid primary key`
- `competition_id uuid`
- `name text`
- `team_code text`
- `status text`
- `coach_teacher_id uuid`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Important constraints:

- Team names are unique within a competition.
- Team codes are unique within a competition when present.

### `team_members`

Join table assigning students to teams.

Key columns:

- `id uuid primary key`
- `team_id uuid`
- `competition_id uuid`
- `student_id uuid`
- `role text`
- `status text`
- `joined_at timestamptz`
- `left_at timestamptz`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Important constraints:

- A team member must be registered for the same competition as the team.
- A student can appear only once per team.

### `teachers`

Stores adult coordinators, teachers, mentors, or staff contacts.

Key columns:

- `id uuid primary key`
- `first_name text`
- `last_name text`
- `display_name text`
- `email text`
- `phone text`
- `status text`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

Current relationships:

- `competitions.lead_teacher_id`
- `teams.coach_teacher_id`

### `conflict_records`

Stores detected conflict findings comparing two activities and two competition references.

Key columns:

- `id uuid primary key`
- `conflict_type text`
- `severity text`
- `status text`
- `primary_competition_id uuid`
- `primary_activity_id uuid`
- `conflicting_competition_id uuid`
- `conflicting_activity_id uuid`
- `student_id uuid`
- `team_id uuid`
- `summary text`
- `details jsonb`
- `detected_at timestamptz`
- `resolved_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Conflict categories are generic:

- `student_overlap`
- `team_overlap`
- `location_overlap`
- `capacity`
- `other`

### `app_settings`

Stores application-level configuration values.

Key columns:

- `id uuid primary key`
- `setting_key text`
- `setting_value jsonb`
- `description text`
- `is_public boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Competition-specific configuration should stay tied to competition data when added later.

## Indexes

The migration adds indexes for common filters and conflict checks:

- Competition status, teacher, and date range lookups.
- Student status, name, and grade lookups.
- Student-to-competition lookups in both directions.
- Activity competition and schedule-time lookups.
- Activity participant lookups by activity, student, and competition.
- Team and team member lookups by competition, student, and teacher.
- Conflict record lookups by status, severity, competitions, student, team, and detection time.

## Updated Timestamps

The migration defines a shared `public.set_updated_at()` trigger function and attaches it to every core table so `updated_at` changes automatically on updates.

## RLS/Auth

The initial schema migration creates the tables only. The follow-up migration:

```text
supabase/migrations/002_enable_rls_and_basic_policies.sql
```

enables row-level security on all current app tables and adds a temporary authenticated-only CRUD policy baseline.

Current behavior:

- Authenticated users can select, insert, update, and delete app table rows.
- Anonymous users do not receive public access policies.
- No organization scoping, ownership checks, or role-based permissions are implemented yet.

This is intentionally broad for early development. Before production use, a later phase should define:

- User and role model.
- Organization or school scoping if needed.
- Row ownership or membership checks.
- Permission rules for conflict resolution and settings updates.
