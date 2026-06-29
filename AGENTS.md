# AGENTS.md

## Project

STEM Competition Planner is a multi-competition scheduling and management system for students, teams, activities, timelines, and conflict detection.

The app must support any number of competitions. Scratch and Robotics may appear only as seed examples, demo data, or documentation examples. They must never be modeled as fixed product concepts in code, routes, database columns, permissions, validation rules, or UI logic.

## Role Of This File

This file defines working rules for human and AI contributors. Follow it before changing architecture, schema, app code, tests, or documentation.

## Non-Negotiable Product Rule

Competitions are data, not code.

Correct:

- Store competitions in a `competitions` table.
- Link activities, teams, registrations, schedules, rubrics, and results to a competition id.
- Let users create future competition types without code changes.
- Use generic labels such as competition, activity, team, participant, event, schedule item, and conflict.

Incorrect:

- Creating `scratch_*` or `robotics_*` tables.
- Adding enum values that hardcode competition names.
- Branching logic such as `if competition.name === "Scratch"`.
- Creating routes like `/scratch` or `/robotics` for core workflows.
- Designing forms that assume only two competitions exist.

## Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui
- Database: Supabase Postgres
- Hosting: Vercel
- Charts: Recharts
- Tables: TanStack Table
- Forms: React Hook Form + Zod

## Architectural Principles

- Keep domain logic separate from UI components.
- Keep database access behind server-side data functions or service modules.
- Prefer explicit types over loosely shaped objects.
- Validate all form input with Zod before persistence.
- Model relationships in the database instead of encoding them in names or strings.
- Keep components small, focused, and named after their purpose.
- Avoid premature abstractions, but remove meaningful duplication once patterns are clear.
- Do not add business rules without a product reason documented in `PLAN.md` or an issue.

## Suggested Source Organization

When app code is created later, use a predictable structure similar to:

```text
src/
  app/
  components/
    ui/
    layout/
    features/
  features/
    competitions/
    students/
    teams/
    activities/
    schedules/
    conflicts/
  lib/
    supabase/
    validators/
    utils/
  server/
    queries/
    mutations/
    services/
  types/
```

Feature folders should contain feature-specific components, validators, server actions, and helpers. Shared utilities belong in `lib` only when they are truly reusable.

## Naming Rules

- Use `competition` as the generic domain term.
- Use `student` for individual learners.
- Use `team` for grouped participants inside a competition.
- Use `activity` for workshops, judging sessions, briefings, practice blocks, presentations, or other scheduled units.
- Use `schedule_item` or `event` only when referring to calendar placement.
- Use `conflict` for detected overlaps or constraint violations.

Avoid names that imply one competition type is special.

## Database Rules

- Use UUID primary keys unless there is a strong reason not to.
- Include `created_at` and `updated_at` on core tables.
- Use foreign keys for ownership and relationships.
- Add indexes for common filters and conflict checks.
- Use join tables for many-to-many relationships.
- Avoid storing duplicated derived data unless there is a clear performance reason.
- Plan row-level security before exposing data to users.

## UI Rules

- Build actual workflows, not decorative landing pages, when implementation begins.
- Use shadcn/ui primitives consistently.
- Use TanStack Table for dense operational tables.
- Use React Hook Form + Zod for create/edit forms.
- Keep competition selection dynamic.
- Do not render competition-specific screens unless they are driven by database configuration.

## Testing Expectations

When code is added later:

- Test schema validation for forms.
- Test conflict-detection rules with competition-agnostic fixtures.
- Test server data functions around permissions and filtering.
- Test UI flows where a new competition can be created and used without code changes.

## Definition Of Done For Future Work

A change is not done until:

- It preserves competition agnosticism.
- It has no hardcoded competition names outside seed/demo/docs.
- It respects the planned architecture.
- It includes relevant validation and tests for its risk level.
- Documentation is updated when architecture or schema changes.

