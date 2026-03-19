import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromToken } from '@/lib/supabase-admin';
import type { Application, ApplicationStatus } from '@/lib/types';

async function getRole(userId: string): Promise<'candidate' | 'employer' | null> {
  const [{ data: c }, { data: e }] = await Promise.all([
    supabaseAdmin.from('candidates').select('user_id').eq('user_id', userId).single(),
    supabaseAdmin.from('employers').select('user_id').eq('user_id', userId).single(),
  ]);
  if (c) return 'candidate';
  if (e) return 'employer';
  return null;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await getRole(user.id);

  if (role === 'candidate') {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, job:jobs(*)')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: data as Application[] });
  }

  if (role === 'employer') {
    const jobId = req.nextUrl.searchParams.get('job_id');
    let query = supabaseAdmin
      .from('applications')
      .select('*, job:jobs!inner(*), candidate:candidates!candidate_id(user_id,full_name,email,phone)')
      .eq('job.employer_id', user.id)
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: data as Application[] });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await getRole(user.id);
  if (role !== 'candidate') {
    return NextResponse.json({ error: 'Only candidates can apply' }, { status: 403 });
  }

  let body: { job_id: string; cover_letter?: string; resume_url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.job_id) return NextResponse.json({ error: 'job_id is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({
      job_id: body.job_id,
      candidate_id: user.id,
      cover_letter: body.cover_letter ?? null,
      resume_url: body.resume_url ?? null,
      status: 'submitted',
    })
    .select('*, job:jobs(*)')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Send confirmation email via Resend or Supabase Edge Functions
  // Email to candidate: "Application Received - [Job Title] at [Company]"
  // Email to Promex admin: new application notification
  console.log(`APPLICATION SUBMITTED: candidate applied for job`);

  return NextResponse.json({ application: data as Application }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { application_id: string; status: ApplicationStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.application_id || !body.status) {
    return NextResponse.json({ error: 'application_id and status are required' }, { status: 400 });
  }

  const validStatuses: ApplicationStatus[] = ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'offer_extended', 'deployed', 'rejected', 'withdrawn'];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: app } = await supabaseAdmin
    .from('applications')
    .select('job_id, job:jobs(employer_id)')
    .eq('id', body.application_id)
    .single();

  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  const employerId = (app.job as unknown as { employer_id: string })?.employer_id;
  if (employerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status: body.status })
    .eq('id', body.application_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data as Application });
}
