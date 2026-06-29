# Supabase Setup

Phase 3A adds only the connection foundation for Supabase. It does not add Auth, RLS policies, CRUD UI, dashboard logic, or competition-specific behavior.

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

Not implemented in this phase:

- RLS policies.
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

RLS policies are intentionally deferred to the next phase after Auth has been verified.
