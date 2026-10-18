import { resend, FROM, ADMIN_EMAIL, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, infoTable, alertBox } from './template';
import { logEmail } from './logEmail';

function jobRef(jobId: string): string {
  const year = new Date().getFullYear();
  return `PMX-${year}-${jobId.slice(-6).toUpperCase()}`;
}

export async function sendJobPostingLive(opts: {
  employerEmail: string;
  companyName: string;
  contactPerson: string;
  jobTitle: string;
  jobId: string;
  country: string;
  industry: string;
}): Promise<void> {
  const ref = jobRef(opts.jobId);
  const firstName = opts.contactPerson.split(' ')[0] ?? opts.contactPerson;

  const employerHtml = baseTemplate({
    preheader: `Your job posting for ${opts.jobTitle} is now live on promexph.com!`,
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Your Job Posting is Live! 🚀</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Reference: <strong>${ref}</strong></p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Hi ${firstName}, your job posting is now live on
        <a href="${BASE_URL}/jobs" style="color:#4FA3C7;">promexph.com</a>
        and visible to thousands of qualified Filipino professionals.
      </p>

      ${infoTable([
        ['Job Title',  opts.jobTitle],
        ['Company',    opts.companyName],
        ['Location',   opts.country],
        ['Industry',   opts.industry],
        ['Reference',  ref],
        ['Status',     'Active — Accepting Applications'],
      ])}

      ${alertBox('Applications will appear in your employer dashboard as candidates apply. You can review, manage, and update application statuses from there.')}

      ${primaryBtn('View My Job Posting →', `${BASE_URL}/employer/dashboard`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  const adminHtml = baseTemplate({
    preheader: `New job posted: ${opts.jobTitle} by ${opts.companyName}`,
    body: `
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a2e;">New Job Posted 📌</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Ref: <strong>${ref}</strong></p>

      ${infoTable([
        ['Job Title',  opts.jobTitle],
        ['Company',    opts.companyName],
        ['Contact',    opts.contactPerson],
        ['Email',      opts.employerEmail],
        ['Location',   opts.country],
        ['Industry',   opts.industry],
        ['Reference',  ref],
        ['Status',     'Active'],
        ['Posted',     new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })],
      ])}

      ${primaryBtn('Review in Admin →', `${BASE_URL}/admin`)}
    `,
  });

  await Promise.allSettled([
    resend.emails.send({
      from: FROM, to: opts.employerEmail,
      subject: `Your Job Posting is Live — ${opts.jobTitle}`,
      html: employerHtml,
    }).catch(err => console.error('[email] sendJobPostingLive (employer) failed:', err)),

    resend.emails.send({
      from: FROM, to: ADMIN_EMAIL,
      subject: `New Job Posted — ${opts.jobTitle} by ${opts.companyName}`,
      html: adminHtml,
    }).catch(err => console.error('[email] sendJobPostingLive (admin) failed:', err)),
  ]);

  void logEmail({ emailType: 'job_posting_live', recipient: opts.employerEmail, status: 'sent', metadata: { jobId: opts.jobId } });
}
