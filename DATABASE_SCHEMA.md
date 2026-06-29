# DATABASE_SCHEMA.md

## Schema Goal

The database must support unlimited STEM competitions without code or schema changes for each new competition. Scratch and Robotics are examples only and must not appear as fixed schema concepts.

This file describes the planned relational model before implementation. SQL migrations should be created later after decisions are confirmed.

## Modeling Principles

- Competitions are rows in `competitions`.
- Students can register for multiple competitions.
- Teams belong to one competition.
- Students can belong to teams through a join table.
- Activities belong to competitions.
- Schedule items place activities in time and optionally assign teams, students, locations, or people.
- Conflicts can be computed on demand and optionally stored for review.
- Configurable values should use tables or text fields with constraints, not hardcoded competition enums.

## Core Tables

### organizations

Represents a school, club, district, or event organizer.

Suggested columns:

- `id uuid primary key`
- `name text not null`
- `slug text unique`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### event_seasons

Represents a planning cycle, event, academic year, or competition season.

Suggested columns:

- `id uuid primary key`
- `organization_id uuid not null references organizations(id)`
- `name text not null`
- `starts_on date`
- `ends_on date`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### competitions

Represents a configurable competition.

Suggested columns:

- `id uuid primary key`
- `organization_id uuid not null references organizations(id)`
- `event_season_id uuid references event_seasons(id)`
- `name text not null`
- `description text`
- `competition_type_id uuid references competition_types(id)`
- `status text not null default 'draft'`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Notes:

- `name` is data and may be Scratch, Robotics, Drone, EZBOT, LEGO, Coding, Innovation Competition, Science Fair, or anything else.
- `status` can start as text and later move to a configurable status table if needed.

### competition_types

Optional configurable grouping for competitions.

Suggested columns:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `name text not null`
- `description text`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Examples may include programming, robotics, research, design, engineering, or presentation. These are configuration values, not code branches.

### students

Represents a student participant.

Suggested columns:

- `id uuid primary key`
- `organization_id uuid not null references organizations(id)`
- `student_code text`
- `first_name text not null`
- `last_name text not null`
- `display_name text`
- `grade_level text`
- `email text`
- `phone text`
- `notes text`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### competition_registrations

Join table connecting students to competitions.

Suggested columns:

- `id uuid primary key`
- `competition_id uuid not null references competitions(id)`
- `student_id uuid not null references students(id)`
- `status text not null default 'registered'`
- `registered_at timestamptz not null`
- `notes text`

Constraints:

- Unique pair: `competition_id`, `student_id`

### teams

Represents a team inside one competition.

Suggested columns:

- `id uuid primary key`
- `competition_id uuid not null references competitions(id)`
- `name text not null`
- `team_code text`
- `status text not null default 'active'`
- `notes text`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Constraints:

- Unique team name per competition where appropriate.

### team_members

Join table connecting students to teams.

Suggested columns:

- `id uuid primary key`
- `team_id uuid not null references teams(id)`
- `student_id uuid not null references students(id)`
- `role text`
- `joined_at timestamptz not null`

Constraints:

- Unique pair: `team_id`, `student_id`

Business rule to confirm:

- Whether a student may join multiple teams in the same competition.

### locations

Represents rooms, halls, booths, fields, labs, or online spaces.

Suggested columns:

- `id uuid primary key`
- `organization_id uuid not null references organizations(id)`
- `name text not null`
- `description text`
- `capacity integer`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### activities

Represents an activity template or schedulable unit for a competition.

Suggested columns:

- `id uuid primary key`
- `competition_id uuid not null references competitions(id)`
- `name text not null`
- `activity_type text`
- `description text`
- `default_duration_minutes integer`
- `requires_team boolean not null default false`
- `requires_location boolean not null default false`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Examples: briefing, practice, judging, presentation, workshop, setup, awards.

### schedule_items

Places an activity in time.

Suggested columns:

- `id uuid primary key`
- `competition_id uuid not null references competitions(id)`
- `activity_id uuid references activities(id)`
- `title text not null`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `location_id uuid references locations(id)`
- `team_id uuid references teams(id)`
- `notes text`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Constraints:

- `ends_at > starts_at`
- `team_id`, when present, should belong to the same competition.
- `activity_id`, when present, should belong to the same competition.

### schedule_item_students

Optional direct student assignments for schedule items.

Suggested columns:

- `id uuid primary key`
- `schedule_item_id uuid not null references schedule_items(id)`
- `student_id uuid not null references students(id)`
- `role text`

Constraints:

- Unique pair: `schedule_item_id`, `student_id`

### conflict_records

Optional stored record of detected conflicts. The system may also compute conflicts on demand.

Suggested columns:

- `id uuid primary key`
- `organization_id uuid not null references organizations(id)`
- `competition_id uuid references competitions(id)`
- `conflict_type text not null`
- `severity text not null default 'warning'`
- `status text not null default 'open'`
- `summary text not null`
- `details jsonb`
- `detected_at timestamptz not null`
- `resolved_at timestamptz`

Potential `conflict_type` values:

- `student_overlap`
- `team_overlap`
- `location_overlap`
- `judge_overlap`
- `resource_overlap`

These are conflict categories, not competition names.

## Future Tables

- `users`
- `organization_members`
- `competition_staff`
- `judges`
- `judge_assignments`
- `resources`
- `resource_assignments`
- `rubrics`
- `scores`
- `attachments`
- `audit_logs`
- `exports`

## Index Planning

Important indexes for scheduling:

- `competitions(organization_id)`
- `students(organization_id)`
- `competition_registrations(competition_id, student_id)`
- `teams(competition_id)`
- `team_members(team_id, student_id)`
- `activities(competition_id)`
- `schedule_items(competition_id, starts_at, ends_at)`
- `schedule_items(location_id, starts_at, ends_at)`
- `schedule_items(team_id, starts_at, ends_at)`
- `schedule_item_students(student_id, schedule_item_id)`
- `conflict_records(organization_id, status)`

## Row-Level Security Direction

RLS should be enabled before production use.

Access should likely be scoped through organization membership first, then narrowed by role and competition assignment where needed.

Initial policy questions:

- Can teachers see all students in an organization or only assigned competitions?
- Can judges see student details or only assigned schedule items?
- Can students log in eventually?
- Who can resolve conflicts?

## Seed Data Rule

Seed data may include example competitions such as Scratch and Robotics to demonstrate the system. Seed data must be clearly isolated from production logic and must not be required for the app to function.

