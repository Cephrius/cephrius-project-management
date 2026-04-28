-- ============================================================
-- Employee Login Credentials
-- Adds the columns required for employees to sign into the
-- employee.jobsyte.co web app with a unique handle + password.
-- Run in your Supabase SQL editor before deploying the
-- /employee-app project.
-- ============================================================

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS login_handle         text,
  ADD COLUMN IF NOT EXISTS password_hash        text,
  ADD COLUMN IF NOT EXISTS password_must_change boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at        timestamptz;

-- Login handles are globally unique (case-insensitive), ignoring soft-deleted rows.
CREATE UNIQUE INDEX IF NOT EXISTS employees_login_handle_uniq
  ON employees (lower(login_handle))
  WHERE login_handle IS NOT NULL AND deleted_at IS NULL;
