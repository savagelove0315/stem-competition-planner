# ROADMAP.md

## Roadmap Philosophy

Build the STEM Competition Planner in stable layers. The first priority is a clean, competition-agnostic foundation. Scratch and Robotics are examples only; every milestone must continue to support unlimited competitions.

## Phase 0: Planning Foundation

Status: current

Deliverables:

- `AGENTS.md`
- `PLAN.md`
- `ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- `ROADMAP.md`

Success criteria:

- Architecture rules are explicit.
- Database direction supports unlimited competitions.
- No app code or fake business logic is generated yet.

## Phase 1: Project Scaffold

Goal: Create the technical foundation without product complexity.

Deliverables:

- Next.js App Router project
- TypeScript configuration
- Tailwind CSS
- shadcn/ui setup
- Supabase client setup
- Environment variable template
- Basic app shell
- Linting and formatting

Success criteria:

- App runs locally.
- Styling system works.
- No hardcoded competition-specific flows.

## Phase 2: Database And Auth Foundation

Goal: Add the first real data model and access boundaries.

Deliverables:

- Supabase schema migrations
- Core tables for organizations, seasons, competitions, students, registrations, teams, activities, locations, and schedules
- Updated schema documentation
- Initial RLS plan or policies
- Seed data for local development only

Success criteria:

- New competitions can be created from data.
- Example competitions are optional seed records.
- Database constraints protect core relationships.

## Phase 3: Core CRUD Workflows

Goal: Build operational screens for managing planning data.

Deliverables:

- Competitions table and create/edit form
- Students table and create/edit form
- Competition registrations
- Teams table and team member assignment
- Activities table and create/edit form
- Locations table and create/edit form

Success criteria:

- Forms use React Hook Form and Zod.
- Tables use TanStack Table where dense interaction is needed.
- UI uses shadcn/ui consistently.
- No competition names are hardcoded.

## Phase 4: Scheduling

Goal: Place activities, teams, students, and locations onto timelines.

Deliverables:

- Schedule item create/edit form
- Competition schedule view
- Organization-wide schedule view
- Filters by competition, team, student, location, and date
- Basic timeline or calendar-like view

Success criteria:

- One student can participate across multiple competitions.
- Schedules are filterable without special competition logic.
- Time fields and validation are reliable.

## Phase 5: Conflict Detection

Goal: Surface conflicts before event day.

Deliverables:

- Student overlap detection
- Team overlap detection
- Location overlap detection
- Conflict review table
- Conflict status workflow such as open, acknowledged, resolved

Success criteria:

- Conflict rules are implemented in domain services.
- Rules operate on ids and time ranges, not competition names.
- Tests cover overlap behavior.

## Phase 6: Dashboards And Reporting

Goal: Give organizers a clear planning overview.

Deliverables:

- Dashboard summary cards
- Recharts visualizations for registrations, activities, schedule load, and conflicts
- CSV export for core tables
- Printable schedule export planning

Success criteria:

- Charts use summarized data.
- Reports are filterable by competition and season.
- Export logic stays generic.

## Phase 7: Roles And Collaboration

Goal: Support real event teams safely.

Deliverables:

- Organization member roles
- Competition staff assignment
- Judge or facilitator access model
- Permission-aware navigation
- Audit trail for important changes

Success criteria:

- Users see only what their role permits.
- RLS and server authorization agree.
- Permission checks are tested.

## Phase 8: Advanced Planning Features

Goal: Improve planning depth after the foundation is stable.

Possible deliverables:

- Configurable conflict rules
- Judge assignment
- Equipment or resource scheduling
- Rubrics and scoring
- Student availability windows
- Bulk import from CSV
- Advanced exports
- Notifications

Success criteria:

- New features extend the generic model.
- Competition-specific needs are handled through configuration.

## Technical Debt Policy

Track shortcuts openly. Do not hide temporary decisions inside vague comments or hardcoded exceptions. If a shortcut is taken, document:

- why it exists
- where it lives
- what would replace it
- when it should be revisited

## Release Readiness Checklist

Before any production release:

- No hardcoded competition names outside seed/demo/docs.
- Database migrations are reviewed.
- RLS policies are tested.
- Forms validate on client and server.
- Conflict detection has tests.
- Main workflows work with at least three different competition examples.
- Documentation reflects current architecture.

