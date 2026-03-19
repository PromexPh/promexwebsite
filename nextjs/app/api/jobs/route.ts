import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromToken } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';
import type { Job } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const country  = searchParams.get('country')   || '';
  const industry = searchParams.get('industry')  || '';
  const job_type = searchParams.get('job_type')  || '';
  const q        = searchParams.get('q')         || '';
  const page  = Math.max(1, parseInt(searchParams.get('page')  || '1',  10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '12', 10));
  const from = (page - 1) * limit;
  const to   = from + limit - 1;

  // Admin: return all statuses
  if (isAdminRequest(req)) {
    const statusFilter = searchParams.get('status') || '';
    let query = supabaseAdmin.from('jobs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (statusFilter) query = query.eq('status', statusFilter);
    if (country)  query = query.eq('country', country);
    if (industry) query = query.eq('industry', industry);
    if (job_type) query = query.eq('job_type', job_type);
    if (q) query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ jobs: data as Job[], total: count ?? 0, page, limit });
  }

  // Employer: return their own jobs (all statuses)
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (user) {
    const { data: employer } = await supabaseAdmin.from('employers').select('user_id').eq('user_id', user.id).single();
    if (employer) {
      const { data, error, count } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ jobs: data as Job[], total: count ?? 0, page: 1, limit: 100 });
    }
  }

  // Public: only active jobs
  let query = supabaseAdmin
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (country)  query = query.eq('country', country);
  if (industry) query = query.eq('industry', industry);
  if (job_type) query = query.eq('job_type', job_type);
  if (q) query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data as Job[], total: count ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
  let body: Partial<Job> & { posted_by_admin?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const required: (keyof Job)[] = ['title', 'company', 'country', 'industry', 'salary', 'job_type', 'experience', 'description'];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
  }

  // Admin post: always active
  if (isAdminRequest(req)) {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        employer_id: null,
        title: body.title, company: body.company, country: body.country, industry: body.industry,
        salary: body.salary, job_type: body.job_type, experience: body.experience,
        description: body.description, requirements: body.requirements ?? [], benefits: body.benefits ?? [],
        status: 'active', posted_by_admin: true,
        urgent: body.urgent ?? false, slots_available: body.slots_available ?? 0,
      })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ job: data }, { status: 201 });
  }

  // Employer post: check verification status
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: employer } = await supabaseAdmin
    .from('employers')
    .select('user_id, is_verified')
    .eq('user_id', user.id)
    .single();

  if (!employer) return NextResponse.json({ error: 'Only employers can post jobs' }, { status: 403 });

  const jobStatus = employer.is_verified ? 'active' : 'draft';

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert({
      employer_id: user.id,
      title: body.title, company: body.company, country: body.country, industry: body.industry,
      salary: body.salary, job_type: body.job_type, experience: body.experience,
      description: body.description, requirements: body.requirements ?? [], benefits: body.benefits ?? [],
      status: jobStatus,
      urgent: body.urgent ?? false, slots_available: body.slots_available ?? 0,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data, isDraft: jobStatus === 'draft' }, { status: 201 });
}
