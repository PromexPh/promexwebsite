import { resend, FROM, BASE_URL } from './_client';
import { baseTemplate, primaryBtn } from './template';
import { logEmail } from './logEmail';

export async function sendProfileCompletionReminder(opts: {
  email: string;
  fullName: string;
  completionPct: number;
  missingFields: string[];
  userId?: string;
}): Promise<void> {
  const firstName = opts.fullName.split(' ')[0] ?? opts.fullName;
  const pct = Math.round(opts.completionPct);

  const missingListHtml = opts.missingFields.length > 0
    ? `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Still missing:</p>
        <ul style="margin:0;padding-left:20px;">
          ${opts.missingFields.map(f => `<li style="padding:3px 0;font-size:14px;color:#374151;">${f}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const html = baseTemplate({
    preheader: 'Complete your profile to get noticed by employers.',
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Complete Your Profile, ${firstName}! 👋</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;">You're ${pct}% there</p>

      <!-- Progress bar -->
      <div style="background:#e5e7eb;border-radius:8px;height:12px;margin-bottom:6px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#4FA3C7,#7C3AED);height:100%;width:${pct}%;border-radius:8px;"></div>
      </div>
      <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;text-align:right;">${pct}% complete</p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Complete your Promex profile to improve your chances of being shortlisted for overseas jobs.
        Candidates with complete profiles are <strong>3× more likely</strong> to be shortlisted.
      </p>

      ${missingListHtml}

      ${primaryBtn('Complete My Profile →', `${BASE_URL}/candidate/dashboard`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.email,
      subject: 'Complete Your Profile to Get Noticed by Employers 👋',
      html,
    });
    void logEmail({ userId: opts.userId, emailType: 'profile_completion_reminder', recipient: opts.email, status: 'sent' });
  } catch (err) {
    console.error('[email] sendProfileCompletionReminder failed:', err);
    void logEmail({ userId: opts.userId, emailType: 'profile_completion_reminder', recipient: opts.email, status: 'failed' });
  }
}
