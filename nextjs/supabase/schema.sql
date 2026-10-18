-- ─────────────────────────────────────────────
-- PROMEX JOB PORTAL — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),
  phone         TEXT,
  country       TEXT,
  headline      TEXT,
  resume_url    TEXT,
  company_name  TEXT,
  company_size  TEXT,
  industry      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── Jobs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  company       TEXT NOT NULL,
  country       TEXT NOT NULL,
  industry      TEXT NOT NULL,
  salary        TEXT NOT NULL,
  job_type      TEXT NOT NULL,
  experience    TEXT NOT NULL,
  description   TEXT NOT NULL,
  requirements  TEXT[] NOT NULL DEFAULT '{}',
  benefits      TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Employers can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = employer_id);

-- ─── Applications ─────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id         UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  cover_letter   TEXT,
  resume_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can see own applications" ON applications
  FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Employers can see applications for own jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can insert own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Employers can update application status" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = auth.uid()
    )
  );

-- ─── Storage: resumes bucket ──────────────────
-- Run via Supabase Dashboard → Storage → New bucket:
--   Name: resumes
--   Public: false
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated users can upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Users can read own resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Trigger: updated_at ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
