# JobSyte Employee App

Lightweight Next.js app for **employees** of JobSyte construction companies.
Hosted at **employee.jobsyte.co**. Each employee logs in with the unique
**login handle** + **auto-generated password** their employer created in the
main JobSyte app, then sees:

- A dashboard summary of their assigned + company-wide open jobs
- A list of jobs assigned to them (with mark-complete / reopen)
- All open jobs in their company (with claim if unassigned)

This app is intentionally **separate from the main JobSyte project** so it can
deploy independently to its own Vercel project + custom domain.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind v4
- `@supabase/supabase-js` (server-only, **service role** key — RLS bypassed)
- `jose` for signed JWT session cookies (HS256, 30-day expiry, httpOnly)
- `bcryptjs` for password hashing/verification

## Local development

```bash
cd employee-app
cp .env.example .env.local
# Fill in values. Use the SAME Supabase project as the main app.
# Generate a session secret:
#   openssl rand -base64 48
npm install
npm run dev   # http://localhost:3001
```

Required env vars:

| Var | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| `EMPLOYEE_SESSION_SECRET` | `openssl rand -base64 48` |

## Database setup

Run the migration in the main project before deploying:

```
supabase/migration_employee_login.sql
```

This adds `login_handle`, `password_hash`, `password_must_change`, and
`last_login_at` columns to `employees`.

## Deploy to Vercel

1. Create a **new Vercel project** for this directory.
2. Set **Root Directory** to `employee-app`.
3. Add the three environment variables above to the project.
4. Set production domain to `employee.jobsyte.co`.
5. Deploy.

## Security notes

- This app uses the **service role** key. RLS is bypassed.
- **Every** Supabase query MUST include
  `.eq("company_id", employee.company_id)` (where `employee.company_id`
  comes from the signed JWT cookie via `requireEmployee()`).
  Never trust client-supplied company IDs.
- Auth API routes use `runtime = "nodejs"` because `bcryptjs` is not
  edge-compatible. The middleware uses only `jose` so it can run at the edge.
- Session cookie is `httpOnly`, `sameSite=lax`, `secure` in production.
