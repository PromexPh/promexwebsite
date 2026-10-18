import { resend, FROM, BASE_URL } from './_client';
import { baseTemplate, primaryBtn } from './template';
import { logEmail } from './logEmail';

export async function sendCandidateWelcome(opts: {
  email: string;
  fullName: string;
  userId?: string;
}): Promise<void> {
  const firstName = opts.fullName.split(' ')[0] ?? opts.fullName;

  const html = baseTemplate({
    preheader: 'Your overseas career journey starts here.',
    body: `
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#1a1a2e;">Welcome to Promex, ${firstName}! 🌍</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">Your overseas career journey starts here.</p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
        We're thrilled to have you join the Promex community. Thousands of Filipino professionals have
        launched their overseas careers with our help — and we're here to help you do the same.
      </p>

      <div style="background:#f0f9ff;border-left:4px solid #4FA3C7;padding:20px 24px;border-radius:0 8px 8px 0;margin-bottom:28px;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#1a3c5e;text-transform:uppercase;letter-spacing:0.5px;">Your Next Steps</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#4FA3C7;font-weight:700;margin-right:8px;">①</span>Complete your profile — employers review this first</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#4FA3C7;font-weight:700;margin-right:8px;">②</span>Upload your CV / resume</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#7C3AED;font-weight:700;margin-right:8px;">③</span>Browse available overseas job openings</p>
        <p style="margin:4px 0;font-size:14px;color:#374151;"><span style="color:#7C3AED;font-weight:700;margin-right:8px;">④</span>Apply and track your applications in your dashboard</p>
      </div>

      ${primaryBtn('Complete My Profile →', `${BASE_URL}/candidate/dashboard`)}

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Questions? Email us at <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.email,
      subject: 'Welcome to Promex — Start Your Overseas Career Journey 🌍',
      html,
    });
    void logEmail({ userId: opts.userId, emailType: 'candidate_welcome', recipient: opts.email, status: 'sent' });
  } catch (err) {
    console.error('[email] sendCandidateWelcome failed:', err);
    void logEmail({ userId: opts.userId, emailType: 'candidate_welcome', recipient: opts.email, status: 'failed' });
  }
}
