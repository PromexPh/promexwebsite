// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'candidate' | 'employer';
export type JobStatus = 'active' | 'paused' | 'closed';
export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
  country?: string;
  headline?: string;
  resume_url?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  created_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  country: string;
  industry: string;
  salary: string;
  job_type: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cover_letter?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  candidate?: Profile;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

export interface JobFilters {
  country?: string;
  industry?: string;
  job_type?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

// ─── Supabase DB type stub (used for generic client typing) ───────────────────

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      jobs: { Row: Job; Insert: Partial<Job>; Update: Partial<Job> };
      applications: { Row: Application; Insert: Partial<Application>; Update: Partial<Application> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
