import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Role } from '@/lib/types';
import { sendNewEmployerAlert, sendCandidateWelcome, sendEmployerWelcome } from '@/lib/email';

// Run in Supabase Dashboard → SQL Editor:
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS linkedin_url text;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS date_of_birth date;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS desired_position text;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS years_experience integer;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS education_level text;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]';
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_url text;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_filename text;
// ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_uploaded_at timestamptz;
//
// ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS website text;
// ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS description text;
// ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS logo_url text;
// ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
// ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS posted_by_admin boolean DEFAULT false;
//
// CREATE TABLE IF NOT EXISTS public.inquiries (
//   id uuid primary key default uuid_generate_v4(),
//   company_name text, contact_person text, email text,
//   phone text, country text, industry text,
//   positions_needed text, number_of_workers integer,
//   urgency text, employment_type text, salary_range text,
//   message text, status text default 'new',
//   created_at timestamptz default now()
// );

interface RegisterBody {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  phone?: string;
  nationality?: string;
  current_location?: string;
  company_name?: string;
  contact_person?: string;
  country?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, full_name, role } = body;

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'email, password, full_name, and role are required' }, { status: 400 });
  }

  if (!['candidate', 'employer'].includes(role)) {
    return NextResponse.json({ error: 'role must be candidate or employer' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name },
  });

  if (authError) {
    if (
      authError.message.includes('already registered') ||
      authError.message.includes('already been registered') ||
      authError.message.includes('already exists')
    ) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;
  let insertError: { message: string } | null = null;

  if (role === 'candidate') {
    const row: Record<string, unknown> = { user_id: userId, full_name, email };
    if (body.phone) row.phone = body.phone;
    if (body.nationality) row.nationality = body.nationality;
    if (body.current_location) row.current_location = body.current_location;
    const { error } = await supabaseAdmin.from('candidates').insert(row);
    insertError = error;
  } else {
    const row: Record<string, unknown> = {
      user_id: userId,
      company_name: body.company_name ?? full_name,
      contact_person: body.contact_person ?? full_name,
      email,
      is_verified: false,
    };
    if (body.phone) row.phone = body.phone;
    if (body.country) row.country = body.country;
    if (body.industry) row.industry = body.industry;
    if (body.website) row.website = body.website;
    if (body.description) row.description = body.description;
    const { error } = await supabaseAdmin.from('employers').insert(row);
    insertError = error;
  }

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (role === 'candidate') {
    void sendCandidateWelcome({ email, fullName: full_name, userId });
  } else {
    void sendNewEmployerAlert({
      companyName:   body.company_name ?? full_name,
      contactPerson: body.contact_person ?? full_name,
      email,
      phone:         body.phone,
      country:       body.country,
      industry:      body.industry,
    });
    void sendEmployerWelcome({
      email,
      companyName:   body.company_name ?? full_name,
      contactPerson: body.contact_person ?? full_name,
      userId,
    });
  }

  return NextResponse.json(
    { message: 'Account created successfully', user: { id: userId, email, full_name, role } },
    { status: 201 }
  );
}
