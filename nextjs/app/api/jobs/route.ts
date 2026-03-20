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
  const countries  = searchParams.get('countries')?.split(',').filter(Boolean) ?? [];
  const industries = searchParams.get('industries')?.split(',').filter(Boolean) ?? [];
  const urgent     = searchParams.get('urgent') === 'true';
  const salary_gte = parseInt(searchParams.get('salary_gte') || '0', 10) || 0;
  const salary_lte = parseInt(searchParams.get('salary_lte') || '0', 10) || 0;

  // Admin: return all statuses
  if (isAdminRequest(req)) {
    const statusFilter = searchParams.get('status') || '';
    let query = supabaseAdmin.from('jobs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (statusFilter) query = query.eq('status', statusFilter);
    if (country)  query = query.eq('country', country);
    if (industry) query = query.eq('industry', industry);
    if (job_type) query = query.eq('job_type', job_type);
    if (countries.length > 0) query = query.in('country', countries);
    if (industries.length > 0) query = query.in('industry', industries);
    if (urgent) query = query.eq('urgent', true);
    if (salary_gte > 0) query = query.gte('salary_min', salary_gte);
    if (salary_lte > 0) query = query.lte('salary_min', salary_lte);
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
  if (countries.length > 0) query = query.in('country', countries);
  if (industries.length > 0) query = query.in('industry', industries);
  if (urgent) query = query.eq('urgent', true);
  if (salary_gte > 0) query = query.gte('salary_min', salary_gte);
  if (salary_lte > 0) query = query.lte('salary_min', salary_lte);
  if (q) query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data as Job[], total: count ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
  let body: Partial<Job> & { posted_by_admin?: boolean; experience_required?: string; salary_min?: number; salary_max?: number; salary_currency?: string; is_urgent?: boolean; posted_at?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const requiredFields = ['title', 'company', 'country', 'industry', 'job_type', 'description'];
  for (const field of requiredFields) {
    if (!(body as Record<string, unknown>)[field]) return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
  }
  const experienceValue = body.experience_required;
  if (!experienceValue) return NextResponse.json({ error: 'Missing required field: experience_required' }, { status: 400 });

  // Admin post: always active
  if (isAdminRequest(req)) {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        employer_id: null,
        title: body.title, company: body.company, country: body.country, industry: body.industry,
        job_type: body.job_type, experience_required: experienceValue,
        salary_min: body.salary_min ?? 0, salary_max: body.salary_max ?? 0, salary_currency: body.salary_currency ?? 'PHP',
        description: body.description, requirements: body.requirements ?? [], benefits: body.benefits ?? [],
        status: 'active', posted_by_admin: true,
        is_urgent: body.is_urgent ?? false, slots_available: body.slots_available ?? 0,
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
    .select('id, is_verified')
    .eq('user_id', user.id)
    .single();

  if (!employer) return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });

  console.log('Posting job for employer:', employer.id, 'user:', user.id, 'verified:', employer.is_verified);

  const jobStatus = employer.is_verified ? 'active' : 'draft';

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert({
      employer_id: employer.id,
      title: body.title, company: body.company, country: body.country, industry: body.industry,
      job_type: body.job_type, experience_required: experienceValue,
      salary_min: body.salary_min ?? 0, salary_max: body.salary_max ?? 0, salary_currency: body.salary_currency ?? 'PHP',
      description: body.description, requirements: body.requirements ?? [], benefits: body.benefits ?? [],
      status: jobStatus,
      is_urgent: body.is_urgent ?? false, slots_available: body.slots_available ?? 0,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data, isDraft: jobStatus === 'draft' }, { status: 201 });
}
