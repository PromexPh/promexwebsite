import { resend, FROM, ADMIN_EMAIL, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, infoTable } from './template';
import { logEmail } from './logEmail';

export async function sendApplicationWithdrawal(opts: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  applicationId: string;
}): Promise<void> {
  const refNum = `PMX-APP-${opts.applicationId.slice(-8).toUpperCase()}`;
  const firstName = opts.candidateName.split(' ')[0] ?? opts.candidateName;
  const timestamp = new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' });

  // Admin notification
  const adminHtml = baseTemplate({
    preheader: `Application withdrawn by ${opts.candidateName}`,
    body: `
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a2e;">Application Withdrawn ↩️</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Action: update your records</p>
      ${infoTable([
        ['Candidate',       opts.candidateName],
        ['Email',           opts.candidateEmail],
        ['Position',        opts.jobTitle],
        ['Application Ref', refNum],
        ['Withdrawn At',    timestamp],
      ])}
      <p style="font-size:14px;color:#374151;">Please update your records to reflect this withdrawal.</p>
    `,
  });

  // Candidate confirmation
  const candidateHtml = baseTemplate({
    preheader: `Your application for ${opts.jobTitle} has been withdrawn.`,
    body: `
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#1a1a2e;">Withdrawal Confirmed ✅</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Ref: <strong>${refNum}</strong></p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Hi ${firstName}, your application for <strong>${opts.jobTitle}</strong> has been successfully
        withdrawn. You can reapply for this or other positions at any time from your dashboard.
      </p>

      ${primaryBtn('Browse Other Jobs →', `${BASE_URL}/jobs`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  await Promise.allSettled([
    resend.emails.send({
      from: FROM, to: ADMIN_EMAIL,
      subject: `Application Withdrawn — ${opts.candidateName} | ${opts.jobTitle}`,
      html: adminHtml,
    }).catch(err => console.error('[email] sendApplicationWithdrawal (admin) failed:', err)),

    resend.emails.send({
      from: FROM, to: opts.candidateEmail,
      subject: `Application Withdrawal Confirmed — ${opts.jobTitle}`,
      html: candidateHtml,
    }).catch(err => console.error('[email] sendApplicationWithdrawal (candidate) failed:', err)),
  ]);

  void logEmail({
    emailType: 'application_withdrawal',
    recipient: opts.candidateEmail,
    status: 'sent',
    metadata: { applicationId: opts.applicationId },
  });
}
