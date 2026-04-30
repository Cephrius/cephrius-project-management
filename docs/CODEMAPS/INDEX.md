# JobSyte Codemap

**Last Updated:** 2026-04-29
**Entry Points:** `app/layout.tsx`, `app/(jobsyte-app)/(app)/layout.tsx`, `app/(landing)/*`, `employee-app/app/layout.tsx`

## Architecture

JobSyte is a Next.js workspace with two related apps:

- Main JobSyte app: authenticated contractor product plus public marketing routes.
- Employee app: separate mobile-first app under `employee-app/` for field employees.

The main app uses Supabase Auth for contractors, company membership for tenant scoping, and Supabase tables for projects, jobs, employees, crews, invoices, payments, accounting, and settings. The employee app uses custom employee credentials stored on the shared `employees` table and signs its own HTTP-only JWT session cookie.

## Route Map

| Area | Main Files | Purpose |
| --- | --- | --- |
| Root shell | `app/layout.tsx`, `app/page.tsx` | Global metadata, fonts, theme provider, toaster, and public home page routing. |
| Product shell | `app/(jobsyte-app)/(app)/layout.tsx`, `components/app-shell/*` | Auth guard, company context, sidebar, header, search, breadcrumbs, and changelog access. |
| Auth | `app/(jobsyte-app)/(auth)/*`, `app/auth/callback/route.ts` | Contractor login/signup/verify screens and Supabase auth callback handling. |
| Landing pages | `app/(landing)/*`, `components/landing/*` | SEO-focused public pages and demo request funnel. |
| Landing app | `landing-page/app/*`, `landing-page/components/landing/*` | Standalone SEO-focused public pages and demo request funnel. |
| Projects | `app/(jobsyte-app)/(app)/projects/*`, `components/projects/*`, `components/jobs/*` | Project CRUD, grouped project list, job CRUD, quick completion, job assignment, and import workflows. |
| Employees and crews | `app/(jobsyte-app)/(app)/employees-crews/*`, `components/employees/*` | Workforce roster, crew management, employee profiles, employee login credential issuing, and workforce analytics. |
| Invoices | `app/(jobsyte-app)/(app)/invoices/*`, `components/invoices/*` | Invoice creation, editing, payment status, printing, and builder-based invoice flow. |
| Payroll | `app/(jobsyte-app)/(app)/payroll/*`, `components/payroll/payroll-page.tsx` | Ready-to-pay job list, payment recording, refunds, and payee filtering. |
| Accounting | `app/(jobsyte-app)/(app)/accounting/*`, `components/accounting/*` | Project expenses, profitability views, and accounting overview. |
| Search | `app/(jobsyte-app)/(app)/search/*`, `app/api/search/suggest/route.ts`, `components/search/*` | Full-page search, global header search, suggestions, and recent searches. |
| Settings | `app/(jobsyte-app)/(app)/settings/*`, `components/settings/*`, `lib/settings/preferences.ts` | Account/company settings, preferences, release notes, and data export. |
| Employee app | `employee-app/app/*`, `employee-app/lib/*`, `employee-app/proxy.ts` | Field employee sign-in, password change, job list, job details, and mark-complete actions. |

## Data Flow

1. Contractor auth starts in `app/(jobsyte-app)/(auth)/login/page.tsx` and Supabase session cookies are read through `lib/supabase/server.ts`.
2. Product routes pass through `app/(jobsyte-app)/(app)/layout.tsx`, which loads company memberships and provides them through `lib/company-context.ts`.
3. Server routes and server actions use `lib/active-company.ts` to scope writes and reads to the selected company.
4. Feature pages fetch Supabase data in server components, then hand typed rows to client components in `components/*`.
5. Client dialogs collect form data and call route-specific server actions, especially under `app/(jobsyte-app)/(app)/**/actions.ts`.
6. Server actions mutate Supabase, revalidate affected paths, and return small `{ ok, message }` result objects for client toasts.
7. The employee app uses `employee-app/app/api/auth/login/route.ts` and `employee-app/lib/auth/session.ts` instead of Supabase Auth, but queries the same company-scoped business tables.

## Tenant Scoping

Most business data is scoped by `company_id`. For contractor routes, the active company comes from `jobsyte:active-company-id`, set by `lib/company-context.ts` and read by `lib/active-company.ts`. Server actions should always use that value instead of trusting client-submitted company IDs.

Employee app routes derive `company_id` from the signed employee session. See `employee-app/lib/auth/employee.ts` and `employee-app/lib/supabase/server.ts` for the guardrails.

## Database And Migrations

Important schema helpers live in:

- `scripts/add-employees-crews-payroll.sql`
- `scripts/add-payment-tracking.sql`
- `scripts/add-accounting.sql`
- `supabase/migration_employee_profile.sql`
- `supabase/migration_employee_login.sql`

These scripts document the app-level assumptions made by the feature code. When a query references a nullable or recently-added column, check the matching migration before changing behavior.

## Where To Start

For a new reader:

1. Read `app/(jobsyte-app)/(app)/layout.tsx` to understand authentication and company membership loading.
2. Read `lib/company-context.ts` and `lib/active-company.ts` to understand tenant selection.
3. Read one vertical slice, such as `app/(jobsyte-app)/(app)/projects/[id]/page.tsx`, `components/jobs/add-job-dialog.tsx`, and `app/(jobsyte-app)/(app)/projects/[id]/actions.ts`.
4. Read `employee-app/README.md` and `employee-app/app/api/auth/login/route.ts` to understand the separate employee login flow.
