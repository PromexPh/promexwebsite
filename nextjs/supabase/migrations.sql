-- All changes already applied to production DB. This file is for reference only.
-- DO NOT re-run — these statements are idempotent where possible but the DB is already up to date.

-- ============================================================
-- Migration 001: Add candidate profile columns
-- ============================================================
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_filename text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_uploaded_at timestamptz;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS skills text[] default '{}';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS languages text[] default '{}';

-- ============================================================
-- Migration 002: Add employer profile columns
-- ============================================================
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS description text;

-- ============================================================
-- Migration 003: Add job columns
-- ============================================================
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS posted_by_admin boolean default false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_reference text UNIQUE;

-- ============================================================
-- Migration 004: Job reference sequence and trigger
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS job_reference_seq START 1;

CREATE OR REPLACE FUNCTION assign_job_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_reference IS NULL THEN
    NEW.job_reference := 'PMX-' || EXTRACT(YEAR FROM NOW())::text || '-' ||
      LPAD(nextval('job_reference_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_reference
  BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION assign_job_reference();

-- ============================================================
-- Migration 005: Inquiries table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id               uuid        primary key default uuid_generate_v4(),
  company_name     text,
  contact_person   text,
  email            text,
  phone            text,
  country          text,
  industry         text,
  positions_needed text,
  number_of_workers integer,
  urgency          text,
  employment_type  text,
  salary_range     text,
  message          text,
  status           text        default 'new',
  created_at       timestamptz default now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read inquiries"
  ON public.inquiries FOR SELECT USING (true);

CREATE POLICY "Admin can update inquiries"
  ON public.inquiries FOR UPDATE USING (true);

-- ============================================================
-- Migration 006: Fix candidates RLS policies
-- ============================================================
DROP POLICY IF EXISTS "Candidates manage own profile" ON public.candidates;

CREATE POLICY "Candidates select own profile"
  ON candidates FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Candidates insert own profile"
  ON candidates FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Candidates update own profile"
  ON candidates FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Candidates delete own profile"
  ON candidates FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- Migration 007: Update salary currency to PHP
-- ============================================================
UPDATE public.jobs SET salary_currency = 'PHP';
