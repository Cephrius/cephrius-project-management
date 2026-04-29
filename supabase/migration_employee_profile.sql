-- ============================================================
-- Employee Profile Expansion
-- Onboarding: this migration backs `components/employees/*` and
-- `app/(jobsyte-app)/(app)/employees-crews/actions.ts`. Employee login-specific
-- columns are in `supabase/migration_employee_login.sql`.
-- Run this migration in your Supabase SQL editor before
-- deploying the updated employees page code.
-- ============================================================

-- ── employees table ──────────────────────────────────────────────────────────

ALTER TABLE employees
  -- Basic info
  ADD COLUMN IF NOT EXISTS job_title        text,
  ADD COLUMN IF NOT EXISTS employment_type  text
    CHECK (employment_type IN ('full_time', 'part_time', 'contractor')),

  -- Contact (replaces the single contact_info field)
  ADD COLUMN IF NOT EXISTS email            text,
  ADD COLUMN IF NOT EXISTS phone            text,
  ADD COLUMN IF NOT EXISTS address          text,

  -- Work & Pay
  ADD COLUMN IF NOT EXISTS pay_type         text
    CHECK (pay_type IN ('hourly', 'per_job', 'salary')),
  ADD COLUMN IF NOT EXISTS hourly_rate      numeric(12, 2),
  ADD COLUMN IF NOT EXISTS hire_date        date,

  -- Payment
  ADD COLUMN IF NOT EXISTS payment_method   text
    CHECK (payment_method IN ('check', 'wire', 'card', 'epay')),
  ADD COLUMN IF NOT EXISTS payment_details  jsonb;

-- Optional: migrate existing contact_info into email/phone
-- (run manually if needed — pattern depends on your data format)
--
-- UPDATE employees
-- SET email = contact_info
-- WHERE contact_info ILIKE '%@%'
--   AND email IS NULL;
--
-- UPDATE employees
-- SET phone = contact_info
-- WHERE contact_info NOT ILIKE '%@%'
--   AND phone IS NULL;


-- ── crews table ──────────────────────────────────────────────────────────────

ALTER TABLE crews
  ADD COLUMN IF NOT EXISTS description   text,
  ADD COLUMN IF NOT EXISTS crew_lead_id  uuid REFERENCES employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS specialization text;

-- Index for crew lead lookups
CREATE INDEX IF NOT EXISTS crews_crew_lead_id_idx ON crews (crew_lead_id);
