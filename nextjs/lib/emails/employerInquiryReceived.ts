import { resend, FROM, ADMIN_EMAIL, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, outlineBtn, infoTable } from './template';
import { logEmail } from './logEmail';

// Workflow 9a — admin alert
export async function sendInquiryAlert(opts: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  positionsNeeded: string;
  numberOfWorkers?: number | null;
  urgency: string;
  industry?: string;
  employmentType?: string;
  salaryRange?: string;
  message?: string;
}): Promise<void> {
  const rows: Array<[string, string]> = [
    ['Company',        opts.companyName],
    ['Contact Person', opts.contactPerson],
    ['Email',          opts.email],
    ['Phone',          opts.phone],
    ['Country',        opts.country],
    ...(opts.industry        ? [['Industry',         opts.industry]        as [string, string]] : []),
    ['Positions',      opts.positionsNeeded],
    ...(opts.numberOfWorkers ? [['No. of Workers',   String(opts.numberOfWorkers)] as [string, string]] : []),
    ['Urgency',        opts.urgency],
    ...(opts.employmentType  ? [['Employment Type',  opts.employmentType]  as [string, string]] : []),
    ...(opts.salaryRange     ? [['Salary Range',     opts.salaryRange]     as [string, string]] : []),
  ];

  const html = baseTemplate({
    preheader: `New inquiry from ${opts.companyName} — ${opts.positionsNeeded}`,
    body: `
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a2e;">New Employer Inquiry 📩</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">${opts.companyName} &middot; ${opts.positionsNeeded}</p>
      ${infoTable(rows)}
      ${opts.message ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Additional Info</p>
        <p style="margin:0;font-size:14px;color:#374151;white-space:pre-wrap;line-height:1.7;">${opts.message}</p>
      </div>` : ''}
      ${primaryBtn('View in Admin →', `${BASE_URL}/admin`)}
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Employer Inquiry — ${opts.companyName} | ${opts.positionsNeeded}`,
      html,
    });
    void logEmail({ emailType: 'inquiry_alert_admin', recipient: ADMIN_EMAIL, status: 'sent' });
  } catch (err) {
    console.error('[email] sendInquiryAlert failed:', err);
  }
}

// Workflow 9b — employer confirmation
export async function sendInquiryConfirmation(opts: {
  email: string;
  companyName: string;
  contactPerson: string;
  positionsNeeded: string;
  numberOfWorkers?: number | null;
  urgency: string;
  country: string;
}): Promise<void> {
  const firstName = opts.contactPerson.split(' ')[0] ?? opts.contactPerson;

  const html = baseTemplate({
    preheader: 'We received your hiring inquiry and will be in touch within 24–48 hours.',
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Inquiry Received! 📬</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">We'll contact you within 24–48 business hours.</p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Hi ${firstName}, thank you for reaching out to Promex Inc. We have received your hiring inquiry
        and our corporate recruitment team will contact you within <strong>24–48 business hours</strong>.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:28px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Your Inquiry Summary</p>
        ${infoTable([
          ['Company',         opts.companyName],
          ['Positions Needed', opts.positionsNeeded],
          ...(opts.numberOfWorkers ? [['No. of Workers', String(opts.numberOfWorkers)] as [string, string]] : []),
          ['Country',         opts.country],
          ['Urgency',         opts.urgency],
        ])}
      </div>

      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:12px;">
          ${primaryBtn('Submit Another Inquiry →', `${BASE_URL}/employer-inquiry`)}
        </td>
        <td>
          ${outlineBtn('Create Employer Account', `${BASE_URL}/employer/register`)}
        </td>
      </tr></table>

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.email,
      subject: 'We Received Your Inquiry — Promex Will Contact You Shortly',
      html,
    });
    void logEmail({ emailType: 'inquiry_confirmation', recipient: opts.email, status: 'sent' });
  } catch (err) {
    console.error('[email] sendInquiryConfirmation failed:', err);
    void logEmail({ emailType: 'inquiry_confirmation', recipient: opts.email, status: 'failed' });
  }
}
