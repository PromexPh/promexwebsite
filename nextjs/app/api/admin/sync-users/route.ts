import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

// TODO: Once signup_method columns are added to the DB, include them in the inserts below:
// ALTER TABLE candidates ADD COLUMN IF NOT EXISTS signup_method TEXT DEFAULT 'email';
// ALTER TABLE employers  ADD COLUMN IF NOT EXISTS signup_method TEXT DEFAULT 'email';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Paginate through all auth users
  const allUsers: { id: string; email?: string; created_at: string; user_metadata: Record<string, unknown>; app_metadata: Record<string, unknown> }[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    allUsers.push(...(data.users as typeof allUsers));
    if (data.users.length < 1000) break;
    page++;
  }

  let synced = 0;
  const errors: string[] = [];

  for (const user of allUsers) {
    const role = (user.user_metadata?.role as string) || 'candidate';

    if (role === 'employer') {
      const { data: existing } = await supabaseAdmin
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin.from('employers').insert({
          user_id:        user.id,
          contact_person: (user.user_metadata?.full_name || user.user_metadata?.name || '') as string,
          email:          user.email,
          created_at:     user.created_at,
        });
        if (error) errors.push(`employer ${user.email}: ${error.message}`);
        else synced++;
      }
    } else {
      const { data: existing } = await supabaseAdmin
        .from('candidates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin.from('candidates').insert({
          user_id:    user.id,
          full_name:  (user.user_metadata?.full_name || user.user_metadata?.name || '') as string,
          email:      user.email,
          created_at: user.created_at,
        });
        if (error) errors.push(`candidate ${user.email}: ${error.message}`);
        else synced++;
      }
    }
  }

  return NextResponse.json({ synced, total: allUsers.length, errors });
}
