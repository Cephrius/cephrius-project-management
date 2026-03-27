-- ============================================================
-- Payment Tracking Migration
-- Run this in your Supabase SQL editor or via the CLI
-- ============================================================

-- 1. Add payment + invoiced tracking to the jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS is_invoiced  boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_paid      boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at      timestamptz;

-- Backfill is_invoiced for existing jobs that already have invoice items
UPDATE jobs
SET is_invoiced = true
FROM invoice_items
WHERE invoice_items.job_id = jobs.id;
-- 2. Add paid status to the invoices table
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS is_paid  boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at  timestamptz;

-- 3. Add paid status to individual invoice line items
ALTER TABLE invoice_items
  ADD COLUMN IF NOT EXISTS is_paid  boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at  timestamptz;
