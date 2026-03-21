import { resend, FROM, BASE_URL } from './_client';
import { baseTemplate, primaryBtn } from './template';
import { logEmail } from './logEmail';

export async function sendEmployerWelcome(opts: {
  email: string;
  companyName: string;
  contactPerson: string;
  userId?: string;
}): Promise<void> {
  const firstName = opts.contactPerson.split(' ')[0] ?? opts.contactPerson;

  const html = baseTemplate({
    preheader: 'Your recruitment partner is ready.',
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Welcome to Promex, ${opts.companyName}!</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Your recruitment partner is ready.</p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        Hi ${firstName}, thank you for registering with Promex Inc. We are one of the Philippines' leading
        overseas recruitment agencies and we're excited to help you find the right talent for your organisation.
      </p>

      <div style="background:#faf5ff;border-left:4px solid #7C3AED;padding:20px 24px;border-radius:0 8px 8px 0;margin-bottom:28px;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:0.5px;">What Happens Next?</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#7C3AED;font-weight:700;margin-right:8px;">①</span>Our team reviews your account within <strong>1–2 business days</strong></p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#7C3AED;font-weight:700;margin-right:8px;">②</span>You receive a verification approval email</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#4FA3C7;font-weight:700;margin-right:8px;">③</span>Post jobs and start receiving qualified Filipino professionals</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#4FA3C7;font-weight:700;margin-right:8px;">④</span>Manage applications from your employer dashboard</p>
      </div>

      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
        In the meantime, submit a hiring inquiry to get the recruitment process started immediately.
      </p>

      ${primaryBtn('Submit a Hiring Inquiry →', `${BASE_URL}/employer-inquiry`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Questions? Email us at <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.email,
      subject: 'Welcome to Promex — Your Recruitment Partner is Ready',
      html,
    });
    void logEmail({ userId: opts.userId, emailType: 'employer_welcome', recipient: opts.email, status: 'sent' });
  } catch (err) {
    console.error('[email] sendEmployerWelcome failed:', err);
    void logEmail({ userId: opts.userId, emailType: 'employer_welcome', recipient: opts.email, status: 'failed' });
  }
}
