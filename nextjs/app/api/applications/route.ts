import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromToken } from '@/lib/supabase-admin';
import type { Application, ApplicationStatus } from '@/lib/types';
import { sendApplicationConfirmation, sendNewApplicationAlert, sendStatusUpdate } from '@/lib/email';

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
    // Look up candidate by user_id to get the candidate table PK
    const { data: candidate } = await supabaseAdmin
      .from('candidates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!candidate) return NextResponse.json({ applications: [] });

    const { data, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        job:jobs (
          id, title, company, country, industry,
          salary, job_type, salary_min, salary_max, salary_currency
        )
      `)
      .eq('candidate_id', candidate.id)
      .order('created_at', { ascending: false });

    console.log('GET applications for candidate:', candidate.id, 'found:', data?.length);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: data ?? [] });
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

  console.log('Submitting application for user:', user.id, user.email);

  const { data: candidate, error: lookupError } = await supabaseAdmin
    .from('candidates')
    .select('id')
    .eq('user_id', user.id)
    .single();

  console.log('Candidate lookup:', candidate?.id, lookupError?.message);

  if (!candidate) {
    return NextResponse.json({
      error: 'No candidate profile found for this account. Please complete your profile first.',
    }, { status: 404 });
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
      candidate_id: candidate.id,
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

  console.log(`APPLICATION SUBMITTED: candidate applied for job`);

  // Fire-and-forget email notifications
  const job = (data as unknown as { job: { title: string; company: string; country: string } }).job;
  const { data: candidateProfile } = await supabaseAdmin
    .from('candidates')
    .select('full_name, email')
    .eq('id', candidate.id)
    .single();

  if (candidateProfile && job) {
    const cand = candidateProfile as { full_name: string; email: string };
    void Promise.all([
      sendApplicationConfirmation({
        candidateEmail: cand.email,
        candidateName: cand.full_name,
        jobTitle: job.title,
        company: job.company,
        country: job.country,
      }),
      sendNewApplicationAlert({
        candidateName: cand.full_name,
        candidateEmail: cand.email,
        jobTitle: job.title,
        company: job.company,
        jobId: body.job_id,
        applicationId: (data as unknown as { id: string }).id,
      }),
    ]);
  }

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

  // Candidate withdraw path
  const { data: candidateRow } = await supabaseAdmin
    .from('candidates')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (candidateRow) {
    if (body.status !== 'withdrawn') {
      return NextResponse.json({ error: 'Candidates can only withdraw applications' }, { status: 403 });
    }
    const { data: app } = await supabaseAdmin
      .from('applications')
      .select('id, status')
      .eq('id', body.application_id)
      .eq('candidate_id', candidateRow.id)
      .single();

    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    if (!['submitted', 'under_review'].includes(app.status)) {
      return NextResponse.json({ error: 'Can only withdraw submitted or under-review applications' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', body.application_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ application: data as Application });
  }

  // Employer update path
  const { data: app } = await supabaseAdmin
    .from('applications')
    .select('job_id, candidate_id, job:jobs(employer_id, title, company)')
    .eq('id', body.application_id)
    .single();

  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  const jobData = app.job as unknown as { employer_id: string; title: string; company: string };
  const employerId = jobData?.employer_id;
  if (employerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status: body.status })
    .eq('id', body.application_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire-and-forget status update email
  const { data: candProfile } = await supabaseAdmin
    .from('candidates')
    .select('full_name, email')
    .eq('id', (app as unknown as { candidate_id: string }).candidate_id)
    .single();

  if (candProfile && jobData) {
    const cp = candProfile as { full_name: string; email: string };
    void sendStatusUpdate({
      candidateEmail: cp.email,
      candidateName: cp.full_name,
      jobTitle: jobData.title,
      company: jobData.company,
      newStatus: body.status,
    });
  }

  return NextResponse.json({ application: data as Application });
}
