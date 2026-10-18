import { resend, FROM, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, alertBox } from './template';
import { logEmail } from './logEmail';

export async function sendJobPostingExpiring(opts: {
  employerEmail: string;
  companyName: string;
  contactPerson: string;
  jobTitle: string;
  jobId: string;
  expiryDate: string;
  applicationCount: number;
}): Promise<void> {
  const firstName = opts.contactPerson.split(' ')[0] ?? opts.contactPerson;
  const appStr = `${opts.applicationCount} application${opts.applicationCount !== 1 ? 's' : ''}`;

  const html = baseTemplate({
    preheader: `Your job posting for ${opts.jobTitle} expires in 3 days.`,
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Your Job Posting Expires Soon ⏰</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">${opts.jobTitle} — action needed</p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Hi ${firstName}, your job posting for <strong>${opts.jobTitle}</strong> expires on
        <strong>${opts.expiryDate}</strong>. Renew it now to keep receiving applications from
        qualified Filipino professionals.
      </p>

      ${alertBox(`<strong>${appStr} received</strong> so far for this posting. Renew to continue receiving qualified candidates for ${opts.jobTitle}.`, '#f59e0b')}

      ${primaryBtn('Renew Job Posting →', `${BASE_URL}/employer/dashboard`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.employerEmail,
      subject: `Your Job Posting Expires in 3 Days — ${opts.jobTitle}`,
      html,
    });
    void logEmail({ emailType: 'job_posting_expiring', recipient: opts.employerEmail, status: 'sent', metadata: { jobId: opts.jobId } });
  } catch (err) {
    console.error('[email] sendJobPostingExpiring failed:', err);
    void logEmail({ emailType: 'job_posting_expiring', recipient: opts.employerEmail, status: 'failed' });
  }
}
