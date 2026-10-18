import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromToken } from '@/lib/supabase-admin';
import { sendCandidateWelcome, sendEmployerWelcome } from '@/lib/email';

// Called from client after OAuth registration completes to trigger welcome email.
// Guards against duplicates by checking email_logs before sending.
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { role: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { role } = body;
  if (!['candidate', 'employer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Deduplicate — don't send a second welcome if already sent
  const { data: existing } = await supabaseAdmin
    .from('email_logs')
    .select('id')
    .eq('user_id', user.id)
    .in('email_type', ['candidate_welcome', 'employer_welcome'])
    .limit(1)
    .maybeSingle();

  if (existing) return NextResponse.json({ skipped: true });

  if (role === 'candidate') {
    const { data: cand } = await supabaseAdmin
      .from('candidates')
      .select('full_name, email')
      .eq('user_id', user.id)
      .single();
    if (cand) {
      const c = cand as { full_name: string; email: string };
      await sendCandidateWelcome({ email: c.email, fullName: c.full_name, userId: user.id });
    }
  } else {
    const { data: emp } = await supabaseAdmin
      .from('employers')
      .select('email, company_name, contact_person')
      .eq('user_id', user.id)
      .single();
    if (emp) {
      const e = emp as { email: string; company_name: string; contact_person: string };
      await sendEmployerWelcome({
        email:         e.email,
        companyName:   e.company_name,
        contactPerson: e.contact_person ?? '',
        userId:        user.id,
      });
    }
  }

  return NextResponse.json({ sent: true });
}
