// Run in Supabase Dashboard → SQL Editor to create the audit table:
//
// CREATE TABLE IF NOT EXISTS public.email_logs (
//   id          uuid        primary key default uuid_generate_v4(),
//   user_id     uuid        references auth.users(id) on delete set null,
//   email_type  text        not null,
//   recipient   text        not null,
//   sent_at     timestamptz not null default now(),
//   status      text        not null default 'sent',
//   metadata    jsonb
// );
// CREATE INDEX IF NOT EXISTS email_logs_user_id_idx    ON public.email_logs(user_id);
// CREATE INDEX IF NOT EXISTS email_logs_email_type_idx ON public.email_logs(email_type);
// CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx    ON public.email_logs(sent_at desc);

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function logEmail(opts: {
  userId?: string;
  emailType: string;
  recipient: string;
  status: 'sent' | 'failed';
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabaseAdmin.from('email_logs').insert({
      user_id:    opts.userId ?? null,
      email_type: opts.emailType,
      recipient:  opts.recipient,
      sent_at:    new Date().toISOString(),
      status:     opts.status,
      metadata:   opts.metadata ?? null,
    });
  } catch {
    // Logging failure must never break the application
  }
}
