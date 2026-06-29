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

Not implemented in this phase:

- Supabase Auth.
- RLS policies.
- Service role usage.
- CRUD UI.
- Dashboard data logic.
- Competition-specific hardcoded behavior.
