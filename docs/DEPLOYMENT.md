# Deployment

This guide prepares STEM Competition Planner for deployment to Vercel with Supabase. It is a readiness checklist only: do not add application features, change business logic, hardcode environment values, commit secrets, use a service role key, or change database/RLS behavior unless a deployment blocker requires it.

## Overview

Deployment flow:

1. Prepare the Supabase project.
2. Apply migrations in order.
3. Confirm Row Level Security and grants.
4. Configure Supabase Auth URLs.
5. Connect the GitHub repository to Vercel.
6. Add the public Supabase environment variables in Vercel.
7. Deploy and run smoke tests.

Competitions remain data, not code. Deployment setup must not introduce fixed competition names, routes, database columns, policies, or validation branches.

## Required Environment Variables

The app requires these public Supabase values in local development and Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

Use the Supabase project API URL and anon/publishable browser key. Do not use or store a service role key in this project.

Local development values belong in `.env.local`, which is ignored by Git through `.env*.local`. Vercel values belong in the Vercel project environment variables UI.

## Vercel Setup

1. Connect the GitHub repository to a new or existing Vercel project.
2. Confirm the framework preset is Next.js.
3. Keep the build command as `npm run build`.
4. Keep the development command as `npm run dev`.
5. Use the default install command unless Vercel requires an explicit value for the project.
6. Add environment variables for Production, Preview, and Development as needed:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Confirm the deployment domain that users will open.
8. Confirm `.env.local` is not committed and does not appear in the deployment build output.

## Supabase Setup

1. Create or choose the Supabase project for the deployment environment.
2. Copy the project API URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the anon/publishable browser key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Do not copy the service role key into Vercel, `.env.local`, docs, tests, or source files.
5. Apply all migrations in order.
6. Confirm at least one test user exists in Supabase Auth.
7. Confirm Auth URL settings match the local and deployed app URLs.

## Migration Checklist

Apply migrations from `supabase/migrations` in filename order:

```text
001_initial_schema.sql
002_enable_rls_and_basic_policies.sql
003_add_competition_metadata.sql
004_add_student_profile_fields.sql
005_reset_student_rls_policies.sql
006_reset_activity_rls_policies.sql
007_reset_activity_participant_rls_policies.sql
008_add_activity_participants_student_fk.sql
009_enhance_conflict_records_review.sql
010_add_competition_notice_fields.sql
011_reset_app_settings_rls_policies.sql
012_add_team_management_safety.sql
013_reset_team_rls_policies.sql
014_add_competition_participation_mode.sql
015_reset_conflict_records_rls_policies.sql
```

Migrations `011`-`014` must be applied before deploying team management, participation mode, and activity assignment features. Migration `015` must be applied before relying on activity delete cleanup.

After applying migrations:

- Confirm all expected tables exist.
- Confirm RLS is enabled on protected app tables.
- Confirm anonymous access is revoked from protected app tables.
- Confirm authenticated access matches the current intended policy baseline.
- Confirm app settings, team, and conflict record policies are active.
- Confirm no migration introduced competition-specific tables, columns, enum values, or policies.

## Supabase Auth URL Checklist

In Supabase Auth URL configuration:

- Set the Site URL to the deployed Vercel domain.
- Add `http://localhost:3000` to allowed redirect URLs.
- Add `http://localhost:3000/login` to allowed redirect URLs.
- Add the deployed Vercel domain to allowed redirect URLs.
- Add the deployed Vercel domain `/login` redirect URL if the auth flow requires it.
- Confirm preview deployment URLs are either intentionally supported or intentionally excluded.

Use the exact deployed domain, including protocol, for production.

## Pre-Deployment Checks

Run these before deploying:

```bash
npm run lint
npm run build
```

Optional local verification:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/api/health/supabase
```

The health endpoint is public and should return a successful Supabase health result when the public environment variables are configured.

## Auth Smoke Test Checklist

After deployment:

- `/login` loads.
- Signed-out protected pages redirect to `/login?next=...`.
- Login returns to the intended page.
- Logout works.
- Refreshing a protected page keeps the client-side session state.
- `/api/health/supabase` remains public and does not require sign-in.

## App Smoke Test Checklist

After deployment, sign in with a test user and verify:

- Dashboard loads.
- Dashboard expandable competitions work.
- Dashboard expandable activities work.
- Competitions CRUD works.
- Competition Student Roster works.
- Students CRUD works.
- Team management works.
- Activities CRUD works.
- Participation Mode works.
- Activity create with students/teams works.
- Activity Participants works.
- Student Timeline works.
- Timeline Overview works.
- Conflict Detection works.
- Conflict Review Actions work.
- Competition Notice works.
- Bulk Competition Notice works.
- Training Notice works.
- Competition Notice Settings work.
- Training Notice Settings work.
- Notice print layout renders correctly.

## Project Hygiene Checklist

Before and after deployment work:

- `git status --short` shows only intentional changes.
- `.env.local` is ignored by Git.
- No generated files are tracked unintentionally.
- No service role key references exist in source, docs, or committed env files.
- No hardcoded production URLs exist in app logic.
- `.env.example` contains only safe placeholder values.

## Troubleshooting

### Build Fails Because Supabase Env Vars Are Missing

Add both required variables in Vercel and redeploy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The app validates these values when Supabase clients or health checks are used.

### Login Redirects To The Wrong Place

Check Supabase Auth Site URL and redirect URLs. Make sure local URLs and the deployed Vercel domain are listed exactly, including protocol.

### Protected Pages Do Not Redirect

The current app has no middleware or proxy layer. Confirm the protected page uses the app's client-side auth guard, the Supabase public environment variables are configured, and the browser session is signed out before retesting.

### Health Check Returns 503

Open `/api/health/supabase` and inspect the JSON diagnostics. Confirm the URL host is correct, the anon key is present, and the Supabase project is reachable.

### Auth Works Locally But Not On Vercel

Confirm the Vercel environment variables are set for the same environment that was deployed. Production, Preview, and Development values are configured separately. Because the app does not use middleware, also confirm the deployed client can initialize Supabase Auth with the public URL and anon/publishable key.

### Data Is Missing After Login

Confirm all migrations through the latest file were applied in order. Then confirm RLS is enabled and the authenticated policies match the intended deployment baseline.

### Anonymous Users Can Read Protected Tables

Stop deployment rollout and inspect grants/policies before sharing the app. Protected app tables should not expose anonymous access.
