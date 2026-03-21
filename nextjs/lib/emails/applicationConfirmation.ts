import { resend, FROM, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, infoTable, alertBox } from './template';
import { logEmail } from './logEmail';

export async function sendApplicationConfirmation(opts: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  country: string;
  applicationId: string;
}): Promise<void> {
  const refNum = `PMX-APP-${opts.applicationId.slice(-8).toUpperCase()}`;
  const firstName = opts.candidateName.split(' ')[0] ?? opts.candidateName;

  const html = baseTemplate({
    preheader: `Application received for ${opts.jobTitle} at ${opts.company}.`,
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Application Received! ✅</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Reference: <strong>${refNum}</strong></p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Hi ${firstName}, we've successfully received your application. Here are the details:
      </p>

      ${infoTable([
        ['Position',        opts.jobTitle],
        ['Company',         opts.company],
        ['Location',        opts.country],
        ['Reference No.',   refNum],
        ['Status',          'Submitted — Awaiting Review'],
      ])}

      ${alertBox(`<strong>What happens next?</strong><br/>Our recruitment team will review your application and update you within <strong>3–5 business days</strong>. You'll receive an email notification whenever your status changes.`)}

      <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
        💡 <strong>Tip:</strong> Candidates with complete profiles are <strong>3× more likely</strong> to be shortlisted.
        Make sure your profile is fully filled out and your CV is uploaded.
      </p>

      ${primaryBtn('View My Application →', `${BASE_URL}/candidate/dashboard`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.candidateEmail,
      subject: `Application Received — ${opts.jobTitle} at ${opts.company}`,
      html,
    });
    void logEmail({ emailType: 'application_confirmation', recipient: opts.candidateEmail, status: 'sent', metadata: { applicationId: opts.applicationId } });
  } catch (err) {
    console.error('[email] sendApplicationConfirmation failed:', err);
    void logEmail({ emailType: 'application_confirmation', recipient: opts.candidateEmail, status: 'failed' });
  }
}
