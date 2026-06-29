# ARCHITECTURE.md

## Overview

STEM Competition Planner will use a modular Next.js App Router architecture backed by Supabase Postgres. The core design goal is to keep competitions configurable and data-driven while preventing domain logic from leaking into UI components.

## System Shape

```text
Browser
  |
  | Next.js App Router pages and components
  v
Server actions / route handlers
  |
  | validation, authorization, orchestration
  v
Domain services
  |
  | queries, mutations, conflict detection
  v
Supabase Postgres
```

## Stack Responsibilities

### Next.js App Router

- Routing and layouts
- Server components for data-heavy views
- Server actions for mutations where appropriate
- Route handlers for API-style endpoints when needed

### TypeScript

- Domain types
- Function contracts
- Component props
- Safer query and mutation boundaries

### Tailwind CSS

- Layout and styling
- Design tokens through configuration
- Utility-first styling for predictable UI

### shadcn/ui

- Buttons, dialogs, forms, tables, menus, tabs, sheets, and common primitives
- Accessible component foundations

### Supabase Postgres

- Source of truth for domain data
- Relational constraints
- Row-level security
- Auth integration when authentication is added

### Recharts

- Dashboard and reporting charts
- Competition, student, team, and conflict summaries

### TanStack Table

- Operational data grids
- Sorting, filtering, pagination, selection, and column visibility

### React Hook Form + Zod

- Form state
- Input validation
- Shared create/edit schemas

## Competition-Agnostic Design

The application must never assume a fixed list of competitions.

Competition-specific behavior should come from:

- database records
- configuration fields
- rule tables
- user-selected filters
- seed data used only for demos or local development

Competition-specific behavior should not come from:

- hardcoded names
- hardcoded routes
- hardcoded TypeScript union values containing competition names
- separate modules named after example competitions
- schema columns named after example competitions

## Recommended Folder Structure

```text
src/
  app/
    (dashboard)/
    api/
  components/
    ui/
    layout/
    shared/
  features/
    competitions/
      components/
      server/
      validators/
      types.ts
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
    auth/
    db/
    queries/
    mutations/
    services/
  types/
```

This structure is a starting point, not a cage. Prefer local feature ownership until code is clearly shared.

## Layering Rules

### UI Components

- Render data and collect input.
- Do not contain database queries.
- Do not contain conflict-detection algorithms.
- Do not hardcode competition names.
- Use props and feature-level hooks/actions.

### Server Actions And Route Handlers

- Validate input.
- Check authorization.
- Call domain services or query/mutation modules.
- Return typed results or redirect.

### Domain Services

- Own business rules.
- Coordinate multiple queries or mutations.
- Implement conflict detection.
- Stay independent of React components.

### Query And Mutation Modules

- Encapsulate database reads and writes.
- Use explicit function names.
- Keep SQL or Supabase query logic out of components.
- Return typed results.

### Validators

- Use Zod schemas for all create/edit operations.
- Keep schemas close to the feature that owns the form.
- Share only truly common validators.

## Data Flow For Mutations

```text
Form
  -> React Hook Form
  -> Zod client validation
  -> server action
  -> Zod server validation
  -> authorization check
  -> mutation/service
  -> database constraint
  -> revalidate affected routes
```

Client validation improves UX. Server validation protects the system.

## Conflict Detection Architecture

Conflict detection should be implemented as domain services, not UI code.

Initial conflict categories:

- Student overlap
- Team overlap
- Location overlap

Possible later categories:

- Judge overlap
- Equipment overlap
- Minimum break time
- Maximum daily load
- Competition-specific constraints

Conflict rules should accept competition ids, schedule item ids, time ranges, and assigned entities. They should not branch on competition names.

## Permissions And Auth Direction

Plan for role-based access even if authentication is added after the first schema draft.

Potential roles:

- owner
- admin
- organizer
- teacher
- judge
- viewer

Permissions should be scoped by organization, event, or competition depending on final product decisions.

## Error Handling

- Use user-safe messages in UI.
- Log technical details server-side.
- Return structured action results for recoverable validation errors.
- Let database constraints catch impossible relationships.

## Performance Direction

- Use server components for data-heavy pages.
- Paginate large tables.
- Add indexes for schedule overlap checks.
- Avoid fetching all students, teams, or schedule items when filtered views can query directly.
- Use Recharts only for summarized data, not raw large datasets.

## Code Quality Standards

- Keep functions small and named by intent.
- Avoid boolean-heavy APIs when a typed object is clearer.
- Prefer domain names over generic names such as `data`, `item`, or `thing`.
- Avoid hidden side effects in helpers.
- Add tests around business rules before expanding scheduling logic.

