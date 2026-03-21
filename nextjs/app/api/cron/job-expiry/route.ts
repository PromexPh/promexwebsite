// Workflow 8 — Job Posting Expiry Reminder (3 days before expiry)
//
// Requires an expires_at column on the jobs table:
// ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS expires_at timestamptz;
//
// Configure in vercel.json:
// { "crons": [{ "path": "/api/cron/job-expiry", "schedule": "0 9 * * *" }] }

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendJobPostingExpiring } from '@/lib/email';

type JobRow = {
  id: string;
  title: string;
  expires_at: string;
  employers: {
    email: string;
    company_name: string;
    contact_person: string;
  } | null;
};

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Jobs expiring in the next 2.5–3.5 days (send once per ~24h window)
  const now    = new Date();
  const in25d  = new Date(now.getTime() + 2.5 * 24 * 3600 * 1000).toISOString();
  const in35d  = new Date(now.getTime() + 3.5 * 24 * 3600 * 1000).toISOString();

  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select('id, title, expires_at, employers!inner(email, company_name, contact_person)')
    .eq('status', 'active')
    .gte('expires_at', in25d)
    .lte('expires_at', in35d);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs?.length) return NextResponse.json({ sent: 0, total: 0 });

  let sent = 0;
  for (const job of jobs as unknown as JobRow[]) {
    if (!job.employers?.email) continue;

    const { count: appCount } = await supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', job.id);

    const expiryDate = new Date(job.expires_at).toLocaleDateString('en-PH', { dateStyle: 'long' });

    await sendJobPostingExpiring({
      employerEmail:    job.employers.email,
      companyName:      job.employers.company_name,
      contactPerson:    job.employers.contact_person,
      jobTitle:         job.title,
      jobId:            job.id,
      expiryDate,
      applicationCount: appCount ?? 0,
    });
    sent++;
  }

  return NextResponse.json({ sent, total: jobs.length });
}
