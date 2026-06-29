# Supabase Setup

The Supabase foundation covers connection setup, email/password Auth, protected routes, and a temporary RLS baseline for authenticated users. It does not add CRUD UI, dashboard logic, sample data, role-based permissions, or competition-specific behavior.

## Environment Variables

Create a local environment file:

```text
.env.local
```

Add the public Supabase project values:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

`NEXT_PUBLIC_SUPABASE_URL` is the project API URL from Supabase.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public anon/publishable browser key. Do not put a service role key in this variable.

`.env.local` is intentionally ignored by Git through `.env*.local`.

## Health Check

Start the app:

```bash
npm run dev
```

Then visit:

```text
http://localhost:3000/api/health/supabase
```

A successful response means the app can reach a Supabase health endpoint with the configured public URL and key. This health check does not query application tables, create data, or enable authentication flows.

## Current Scope

Implemented in this phase:

- Supabase JavaScript client package.
- Public environment variable template.
- Typed environment validation helper.
- Browser and server Supabase client factories.
- Table-free connection health check.
- Email/password login foundation.
- Protected app routes with `/login` left public.
- Logout from the app shell.
- Temporary authenticated-only RLS policies for app tables.

Not implemented in this phase:

- Role-based RLS permissions.
- Service role usage.
- CRUD UI.
- Dashboard data logic.
- Competition-specific hardcoded behavior.

## Creating The First Auth User

Use the Supabase dashboard to create the first user:

1. Open the Supabase project dashboard.
2. Go to **Authentication**.
3. Open **Users**.
4. Choose **Add user**.
5. Enter an email address and password.
6. Confirm the user if your project requires email confirmation.

Then start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/login
```

Sign in with the user email and password. App routes redirect unauthenticated users to `/login`; `/login` redirects signed-in users to `/dashboard`.

## RLS Baseline

The migration `supabase/migrations/002_enable_rls_and_basic_policies.sql` enables RLS on all current app tables:

- `competitions`
- `students`
- `student_competitions`
- `activities`
- `activity_participants`
- `teams`
- `team_members`
- `teachers`
- `conflict_records`
- `app_settings`

For early development, every authenticated user can select, insert, update, and delete rows in these tables. Anonymous users receive no policies and no table grants.

This is a temporary baseline so upcoming CRUD work is not publicly exposed. A later phase must replace it with organization, role, and ownership rules before production use.
