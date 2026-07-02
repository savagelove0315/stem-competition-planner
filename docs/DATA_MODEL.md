# Data Model

The STEM Competition Planner data model is built around one product rule:

```text
Competitions are data, not code.
```

A future competition should be creatable by inserting a row in `competitions`, then linking students, activities, teams, and conflicts to that row. The database should not need new tables or columns for each competition type.

## Core Relationships

```text
teachers
  -> competitions.lead_teacher_id
  -> teams.coach_teacher_id

competitions
  -> activities
  -> teams
  -> student_competitions
  -> conflict_records as primary_competition_id
  -> conflict_records as conflicting_competition_id

students
  -> student_competitions
  -> activity_participants
  -> team_members
  -> conflict_records

activities
  -> activity_participants
  -> conflict_records as primary_activity_id
  -> conflict_records as conflicting_activity_id

teams
  -> team_members
  -> conflict_records
```

## Competition Metadata

Competitions include generic metadata for display and organization:

- `short_name` for compact labels in badges, filters, timeline bars, and reports.
- `color` for visual treatment in schedule and dashboard surfaces.
- `icon` for a future UI icon token or label.
- `category` for grouping, filtering, and reporting.
- `notice_mode` for the parent-facing competition format shown in generated notices.
- `notice_period` for flexible parent-facing timing text shown in generated notices.
- `participation_mode` for whether participants are managed individually, in teams, or both.

These values are stored on `competitions` because they describe a competition record. They must remain configurable data and must not become route names, enum values, permissions, or branching logic.

Parent notices are generated from `students -> student_competitions -> competitions`.
They reuse `competitions.category` as the notice category and use
`competitions.notice_mode` and `competitions.notice_period` when present.
Generated notices are not stored in the database in Phase 11A.

## Competition Participation

Students do not have competition-specific columns.

Correct model:

```text
students.id
student_competitions.student_id
student_competitions.competition_id
competitions.id
```

This supports any number of competitions and keeps participation queryable without string parsing.

`competitions.participation_mode` describes how a competition organizes those
registered students:

- `individual` means registered students participate directly without team grouping.
- `team` means registered students are expected to be grouped into teams.
- `mixed` means both team-based and individual/no-team participation are valid.

Participation mode changes planner UI behavior, such as showing team management
only for team or mixed competitions. It must remain generic metadata and must
not encode any named competition as a special case.

## Student Profile

Student school profile fields live on `students` because they describe the student independently of any competition.

- `student_code` stores an optional stable student identifier or school-issued code.
- `class_name` stores an optional class, homeroom, section, or cohort label.
- `grade_level` stores an optional grade, year, or level.
- `parent_contact` stores optional parent or guardian contact details for coordinator follow-up.
- `notes` stores internal notes or remarks.

Class, grade/year, and parent contact should not be squeezed into `student_code`. Competition membership still belongs in `student_competitions`, not in profile columns.

## Activity Participation

Activities belong to one competition. Students join activities through `activity_participants`.

`activity_participants` includes `competition_id` so the database can enforce that:

- The activity belongs to that competition.
- The student is registered for that competition.

This avoids assigning a student to an activity in a competition they have not joined.
It also has a direct `student_id` foreign key to `students.id` for participant
display and Supabase relationship discovery. That direct FK does not replace the
composite `student_id, competition_id` relationship to `student_competitions`,
which remains the same-competition registration enforcement rule.

## Teams

Teams belong to one competition. Students join teams through `team_members`.

`team_members` includes `competition_id` so the database can enforce that:

- The team belongs to that competition.
- The student is registered for that competition.

Team assignment is optional. A registered student may have no team, but a
student can be active in only one team within the same competition. Removing a
student from a team marks the membership as left so the student can be assigned
elsewhere without storing a team name on the student record.

## Conflicts

`conflict_records` stores findings involving two activities:

- `primary_competition_id`
- `primary_activity_id`
- `conflicting_competition_id`
- `conflicting_activity_id`

Each activity reference is tied to its competition with a composite foreign key. This supports conflicts within a single competition and conflicts across competitions.

Optional `student_id` and `team_id` fields identify the participant or team involved when the conflict is about a specific person or team.

## Status Fields

Status fields are plain text with check constraints. They are intentionally generic and do not encode competition names.

Examples:

- Competition: `draft`, `planned`, `active`, `completed`, `archived`
- Student: `active`, `inactive`, `archived`
- Student competition: `registered`, `waitlisted`, `withdrawn`, `completed`
- Activity: `draft`, `planned`, `active`, `completed`, `cancelled`, `archived`
- Conflict: `open`, `acknowledged`, `resolved`, `dismissed`

If the product later needs configurable status workflows, these can move to lookup/configuration tables.

## App Settings

`app_settings` stores application-level configuration as JSON. It is not intended for competition-specific business data.

Competition-specific settings should be modeled through competition-related tables when those needs are known.

Notice settings are split by notice purpose:

- `competition_notice_defaults` stores default Competition Notice Generator wording and teacher information.
- `training_notice_defaults` stores default Training Notice Generator wording, teacher information, and default what-to-bring text.
- `parent_notice_defaults` is retained as a legacy fallback key for existing settings.

These settings affect preview, copy, and browser print output, but they do not store generated notice records.

## Deliberate Omissions

This phase does not include:

- Supabase project connection.
- Supabase client code.
- Authentication or RLS policies.
- User accounts or organization membership.
- CRUD UI.
- Seed data.
- Competition-specific tables or columns.
- Schedule resource tables beyond the activity time/location fields.
- Rubrics, judging, scoring, results, file attachments, audit logs, or exports.
