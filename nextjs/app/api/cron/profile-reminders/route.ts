// Workflow 12 — Profile Completion Reminder
//
// Configure in vercel.json:
// { "crons": [{ "path": "/api/cron/profile-reminders", "schedule": "0 10 * * *" }] }
//
// Set CRON_SECRET in environment variables and pass it as:
// x-cron-secret header from Vercel Cron or your scheduler.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendProfileCompletionReminder } from '@/lib/email';

type CandidateRow = {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  nationality?: string | null;
  current_location?: string | null;
  desired_position?: string | null;
  education_level?: string | null;
  skills?: string[] | null;
  work_experience?: unknown[] | null;
  resume_url?: string | null;
  created_at: string;
};

function calcCompletion(p: CandidateRow): number {
  let s = 0;
  if (p.full_name)                                          s += 15;
  if (p.phone)                                              s += 10;
  if (p.nationality && p.current_location)                  s += 10;
  if (p.desired_position)                                   s += 10;
  if (p.education_level)                                    s += 10;
  if ((p.skills?.length ?? 0) > 0)                          s += 10;
  if ((p.work_experience?.length ?? 0) > 0)                 s += 15;
  if (p.resume_url)                                         s += 20;
  return Math.min(100, s);
}

function getMissingFields(p: CandidateRow): string[] {
  const m: string[] = [];
  if (!p.phone)                                    m.push('Phone number');
  if (!p.nationality || !p.current_location)       m.push('Nationality & current location');
  if (!p.desired_position)                         m.push('Desired position');
  if (!p.education_level)                          m.push('Education level');
  if (!(p.skills?.length))                         m.push('Skills');
  if (!(p.work_experience?.length))                m.push('Work experience');
  if (!p.resume_url)                               m.push('CV / Resume upload');
  return m;
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Target candidates who signed up between 24h and 48h ago (send once, ~24h after signup)
  const now      = new Date();
  const from48h  = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
  const to24h    = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

  const { data: candidates, error } = await supabaseAdmin
    .from('candidates')
    .select('user_id, full_name, email, phone, nationality, current_location, desired_position, education_level, skills, work_experience, resume_url, created_at')
    .gte('created_at', from48h)
    .lte('created_at', to24h);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!candidates?.length) return NextResponse.json({ sent: 0, total: 0 });

  let sent = 0;
  for (const cand of candidates as CandidateRow[]) {
    const pct = calcCompletion(cand);
    if (pct >= 50) continue; // Only remind incomplete profiles

    // Check if reminder already sent for this user
    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('id')
      .eq('user_id', cand.user_id)
      .eq('email_type', 'profile_completion_reminder')
      .limit(1)
      .maybeSingle();

    if (alreadySent) continue;

    await sendProfileCompletionReminder({
      email:          cand.email,
      fullName:       cand.full_name,
      completionPct:  pct,
      missingFields:  getMissingFields(cand),
      userId:         cand.user_id,
    });
    sent++;
  }

  return NextResponse.json({ sent, total: candidates.length });
}
