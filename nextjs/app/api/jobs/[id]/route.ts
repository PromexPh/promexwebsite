import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromToken } from '@/lib/supabase';
import type { Job, JobStatus } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ job: data as Job });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: job } = await supabaseAdmin
    .from('jobs')
    .select('employer_id')
    .eq('id', params.id)
    .single();

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.employer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Partial<Job>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const allowedFields: (keyof Job)[] = [
    'title', 'company', 'country', 'industry', 'salary', 'job_type',
    'experience', 'description', 'requirements', 'benefits', 'status',
  ];

  const updates: Partial<Job> = {};
  for (const field of allowedFields) {
    if (field in body) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  }

  if (updates.status) {
    const validStatuses: JobStatus[] = ['active', 'paused', 'closed'];
    if (!validStatuses.includes(updates.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job: data as Job });
}
