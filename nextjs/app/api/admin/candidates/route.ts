import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('candidates')
    .select('*, application_count:applications(count)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data });
}
