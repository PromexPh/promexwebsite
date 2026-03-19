// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'candidate' | 'employer';
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft';
export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  country: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
}

/** Row from public.candidates */
export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  nationality?: string;
  current_location?: string;
  date_of_birth?: string;
  linkedin_url?: string;
  desired_position?: string;
  years_experience?: number;
  education_level?: string;
  skills?: string[];
  work_experience?: WorkExperience[];
  resume_url?: string;
  resume_filename?: string;
  resume_uploaded_at?: string;
  created_at: string;
}

/** Row from public.employers */
export interface EmployerProfile {
  id: string;
  user_id: string;
  company_name: string;
  contact_person?: string;
  contact_job_title?: string;
  email: string;
  phone?: string;
  country?: string;
  industry?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  is_verified?: boolean;
  created_at: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'converted';

export interface Inquiry {
  id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  country?: string;
  industry?: string;
  positions_needed?: string;
  number_of_workers?: number;
  urgency?: string;
  employment_type?: string;
  salary_range?: string;
  message?: string;
  status: InquiryStatus;
  created_at: string;
}

/** Legacy — keep for existing code references */
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
  urgent?: boolean;
  slots_available?: number;
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
  candidate?: CandidateProfile;
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

// ─── Supabase DB type stub ────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      candidates: { Row: CandidateProfile; Insert: Partial<CandidateProfile>; Update: Partial<CandidateProfile> };
      employers: { Row: EmployerProfile; Insert: Partial<EmployerProfile>; Update: Partial<EmployerProfile> };
      jobs: { Row: Job; Insert: Partial<Job>; Update: Partial<Job> };
      applications: { Row: Application; Insert: Partial<Application>; Update: Partial<Application> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
