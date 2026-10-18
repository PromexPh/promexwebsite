import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';
import type { ApplicationStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const jobId   = req.nextUrl.searchParams.get('job_id')  || '';
  const status  = req.nextUrl.searchParams.get('status')  || '';

  let query = supabaseAdmin
    .from('applications')
    .select('*, job:jobs(*), candidate:candidates!candidate_id(user_id,full_name,email,phone)')
    .order('created_at', { ascending: false });

  if (jobId)  query = query.eq('job_id', jobId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { id: string; status: ApplicationStatus };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { data, error } = await supabaseAdmin
    .from('applications').update({ status: body.status }).eq('id', body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
