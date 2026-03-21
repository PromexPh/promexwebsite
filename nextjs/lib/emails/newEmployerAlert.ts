import { resend, FROM, ADMIN_EMAIL, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, infoTable } from './template';
import { logEmail } from './logEmail';

export async function sendNewEmployerAlert(opts: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  country?: string;
  industry?: string;
}): Promise<void> {
  const rows: Array<[string, string]> = [
    ['Company',  opts.companyName],
    ['Contact',  opts.contactPerson],
    ['Email',    opts.email],
    ...(opts.phone    ? [['Phone',    opts.phone]    as [string, string]] : []),
    ...(opts.country  ? [['Country',  opts.country]  as [string, string]] : []),
    ...(opts.industry ? [['Industry', opts.industry] as [string, string]] : []),
  ];

  const html = baseTemplate({
    preheader: `New employer registered: ${opts.companyName} — verification required`,
    body: `
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a2e;">New Employer Registration 🏢</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Action required: review and verify</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        A new employer has registered and is awaiting verification before their jobs go live.
      </p>
      ${infoTable(rows)}
      ${primaryBtn('Review & Verify Employer →', `${BASE_URL}/admin`)}
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Employer Registered — ${opts.companyName}`,
      html,
    });
    void logEmail({ emailType: 'new_employer_alert', recipient: ADMIN_EMAIL, status: 'sent' });
  } catch (err) {
    console.error('[email] sendNewEmployerAlert failed:', err);
  }
}
