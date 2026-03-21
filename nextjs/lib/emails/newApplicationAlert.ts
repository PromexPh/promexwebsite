import { resend, FROM, ADMIN_EMAIL, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, infoTable } from './template';
import { logEmail } from './logEmail';

export async function sendNewApplicationAlert(opts: {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  company: string;
  jobId: string;
  applicationId: string;
  employerEmail?: string;
}): Promise<void> {
  const refNum = `PMX-APP-${opts.applicationId.slice(-8).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-PH', { dateStyle: 'long' });

  const rows: Array<[string, string]> = [
    ['Candidate',        opts.candidateName],
    ['Email',            opts.candidateEmail],
    ...(opts.candidatePhone ? [['Phone', opts.candidatePhone] as [string, string]] : []),
    ['Position',         opts.jobTitle],
    ['Company',          opts.company],
    ['Application Ref',  refNum],
    ['Date',             dateStr],
  ];

  const adminHtml = baseTemplate({
    preheader: `New application for ${opts.jobTitle} from ${opts.candidateName}`,
    body: `
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a2e;">New Job Application 📋</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Ref: <strong>${refNum}</strong></p>
      ${infoTable(rows)}
      ${primaryBtn('Review Application →', `${BASE_URL}/admin`)}
    `,
  });

  const sends: Promise<unknown>[] = [
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Application — ${opts.jobTitle} | Ref: ${refNum}`,
      html: adminHtml,
    }).catch(err => console.error('[email] sendNewApplicationAlert (admin) failed:', err)),
  ];

  if (opts.employerEmail) {
    const employerRows: Array<[string, string]> = [
      ['Candidate',       opts.candidateName],
      ['Email',           opts.candidateEmail],
      ...(opts.candidatePhone ? [['Phone', opts.candidatePhone] as [string, string]] : []),
      ['Application Ref', refNum],
      ['Date',            dateStr],
    ];
    const employerHtml = baseTemplate({
      preheader: `New application received for ${opts.jobTitle}`,
      body: `
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a2e;">New Application Received 📋</h1>
        <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">For: <strong>${opts.jobTitle}</strong></p>
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
          A candidate has applied for <strong>${opts.jobTitle}</strong> at <strong>${opts.company}</strong>.
        </p>
        ${infoTable(employerRows)}
        ${primaryBtn('Review in Dashboard →', `${BASE_URL}/employer/dashboard`)}
      `,
    });
    sends.push(
      resend.emails.send({
        from: FROM,
        to: opts.employerEmail,
        subject: `New Application Received — ${opts.jobTitle} | Ref: ${refNum}`,
        html: employerHtml,
      }).catch(err => console.error('[email] sendNewApplicationAlert (employer) failed:', err))
    );
  }

  await Promise.allSettled(sends);
  void logEmail({ emailType: 'new_application_alert', recipient: ADMIN_EMAIL, status: 'sent', metadata: { applicationId: opts.applicationId } });
}
