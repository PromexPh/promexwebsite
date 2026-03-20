import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Promex Recruitment <connect@promexph.com>';
const ADMIN_EMAIL = 'website@promexph.com';

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    offer_extended: 'Offer Extended',
    deployed: 'Deployed',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return map[status] ?? status;
}

// Sent to candidate after successfully applying
export async function sendApplicationConfirmation(opts: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  country: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.candidateEmail,
      subject: `Application Received – ${opts.jobTitle} at ${opts.company}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1a3c5e;padding:24px 32px;border-radius:8px 8px 0 0">
            <img src="https://promexph.com/images/logo-white.png" alt="Promex" height="36" style="display:block" />
          </div>
          <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1a3c5e">Application Received!</h2>
            <p style="margin:0 0 20px;color:#374151">Hi ${opts.candidateName},</p>
            <p style="margin:0 0 20px;color:#374151">
              Your application for <strong>${opts.jobTitle}</strong> at <strong>${opts.company}</strong>
              (${opts.country}) has been successfully submitted.
            </p>
            <div style="background:#f0f4f8;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:4px;margin-bottom:24px">
              <p style="margin:0;font-size:14px;color:#374151">
                <strong>What happens next?</strong><br/>
                The employer will review your application and update its status. You can track progress
                in your <a href="https://promexph.com/candidate/dashboard" style="color:#1a3c5e">candidate dashboard</a>.
              </p>
            </div>
            <p style="margin:0;color:#6b7280;font-size:13px">
              Questions? Email <a href="mailto:inquiries@promexph.com" style="color:#1a3c5e">inquiries@promexph.com</a>
            </p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px">
            © ${new Date().getFullYear()} Promex Manpower & Allied Services Corp.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] sendApplicationConfirmation failed:', err);
  }
}

// Sent to admin when a new application comes in
export async function sendNewApplicationAlert(opts: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  jobId: string;
  applicationId: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Application – ${opts.jobTitle} (${opts.company})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1a3c5e;padding:20px 32px;border-radius:8px 8px 0 0">
            <span style="color:#f59e0b;font-size:18px;font-weight:700">Promex Admin Alert</span>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <h2 style="margin:0 0 16px;color:#1a3c5e">New Job Application</h2>
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px">Candidate</td><td style="padding:8px 0;font-weight:600">${opts.candidateName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">${opts.candidateEmail}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Job</td><td style="padding:8px 0;font-weight:600">${opts.jobTitle}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Company</td><td style="padding:8px 0">${opts.company}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Application ID</td><td style="padding:8px 0;font-size:12px;color:#6b7280">${opts.applicationId}</td></tr>
            </table>
            <div style="margin-top:20px">
              <a href="https://promexph.com/admin" style="background:#1a3c5e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">View in Admin Dashboard →</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] sendNewApplicationAlert failed:', err);
  }
}

// Sent to candidate when employer updates their application status
export async function sendStatusUpdate(opts: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  newStatus: string;
}) {
  const label = statusLabel(opts.newStatus);

  const isPositive = ['shortlisted', 'interview_scheduled', 'offer_extended', 'deployed'].includes(opts.newStatus);
  const isRejected = opts.newStatus === 'rejected';

  const statusColor = isPositive ? '#16a34a' : isRejected ? '#dc2626' : '#d97706';

  const messageMap: Record<string, string> = {
    under_review: 'The employer is currently reviewing your application. We\'ll notify you of any further updates.',
    shortlisted: 'Congratulations — you\'ve been shortlisted! The employer will be in touch to discuss next steps.',
    interview_scheduled: 'Great news — an interview has been scheduled. Please check your dashboard for details and ensure your contact details are up to date.',
    offer_extended: 'Excellent news — an offer has been extended to you! Log in to your dashboard to review the details.',
    deployed: 'Congratulations! You have been successfully deployed. We wish you all the best in your new role.',
    rejected: 'After careful review, the employer has decided not to move forward with your application at this time. Don\'t be discouraged — new opportunities are posted regularly.',
    withdrawn: 'Your application has been marked as withdrawn as requested.',
  };

  const message = messageMap[opts.newStatus] ?? 'Your application status has been updated.';

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.candidateEmail,
      subject: `Application Update – ${opts.jobTitle} at ${opts.company}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1a3c5e;padding:24px 32px;border-radius:8px 8px 0 0">
            <img src="https://promexph.com/images/logo-white.png" alt="Promex" height="36" style="display:block" />
          </div>
          <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1a3c5e">Application Status Update</h2>
            <p style="margin:0 0 20px;color:#374151">Hi ${opts.candidateName},</p>
            <p style="margin:0 0 12px;color:#374151">
              Your application for <strong>${opts.jobTitle}</strong> at <strong>${opts.company}</strong> has been updated.
            </p>
            <div style="display:inline-block;background:${statusColor}1a;border:1px solid ${statusColor};color:${statusColor};padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px;margin-bottom:20px">
              ${label}
            </div>
            <p style="margin:0 0 24px;color:#374151">${message}</p>
            <a href="https://promexph.com/candidate/dashboard" style="background:#1a3c5e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;display:inline-block">
              View My Applications →
            </a>
            <p style="margin:24px 0 0;color:#6b7280;font-size:13px">
              Questions? Email <a href="mailto:inquiries@promexph.com" style="color:#1a3c5e">inquiries@promexph.com</a>
            </p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px">
            © ${new Date().getFullYear()} Promex Manpower & Allied Services Corp.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] sendStatusUpdate failed:', err);
  }
}

// Sent to admin when a new employer registers
export async function sendNewEmployerAlert(opts: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  country?: string;
  industry?: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Employer Registered – ${opts.companyName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1a3c5e;padding:20px 32px;border-radius:8px 8px 0 0">
            <span style="color:#f59e0b;font-size:18px;font-weight:700">Promex Admin Alert</span>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <h2 style="margin:0 0 16px;color:#1a3c5e">New Employer Registration</h2>
            <p style="margin:0 0 16px;color:#374151">A new employer has registered and is awaiting verification.</p>
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px">Company</td><td style="padding:8px 0;font-weight:600">${opts.companyName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Contact</td><td style="padding:8px 0">${opts.contactPerson}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">${opts.email}</td></tr>
              ${opts.phone ? `<tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0">${opts.phone}</td></tr>` : ''}
              ${opts.country ? `<tr><td style="padding:8px 0;color:#6b7280">Country</td><td style="padding:8px 0">${opts.country}</td></tr>` : ''}
              ${opts.industry ? `<tr><td style="padding:8px 0;color:#6b7280">Industry</td><td style="padding:8px 0">${opts.industry}</td></tr>` : ''}
            </table>
            <div style="margin-top:20px">
              <a href="https://promexph.com/admin" style="background:#f59e0b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700">Review & Verify →</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] sendNewEmployerAlert failed:', err);
  }
}

// Sent to admin when a hiring inquiry is submitted
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
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Hiring Inquiry – ${opts.companyName} (${opts.positionsNeeded})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1a3c5e;padding:20px 32px;border-radius:8px 8px 0 0">
            <span style="color:#f59e0b;font-size:18px;font-weight:700">Promex Admin Alert</span>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <h2 style="margin:0 0 16px;color:#1a3c5e">New Hiring Inquiry</h2>
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:160px">Company</td><td style="padding:8px 0;font-weight:600">${opts.companyName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Contact Person</td><td style="padding:8px 0">${opts.contactPerson}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">${opts.email}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0">${opts.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Country</td><td style="padding:8px 0">${opts.country}</td></tr>
              ${opts.industry ? `<tr><td style="padding:8px 0;color:#6b7280">Industry</td><td style="padding:8px 0">${opts.industry}</td></tr>` : ''}
              <tr><td style="padding:8px 0;color:#6b7280">Positions Needed</td><td style="padding:8px 0;font-weight:600">${opts.positionsNeeded}</td></tr>
              ${opts.numberOfWorkers ? `<tr><td style="padding:8px 0;color:#6b7280">Number of Workers</td><td style="padding:8px 0">${opts.numberOfWorkers}</td></tr>` : ''}
              <tr><td style="padding:8px 0;color:#6b7280">Urgency</td><td style="padding:8px 0">${opts.urgency}</td></tr>
              ${opts.employmentType ? `<tr><td style="padding:8px 0;color:#6b7280">Employment Type</td><td style="padding:8px 0">${opts.employmentType}</td></tr>` : ''}
              ${opts.salaryRange ? `<tr><td style="padding:8px 0;color:#6b7280">Salary Range</td><td style="padding:8px 0">${opts.salaryRange}</td></tr>` : ''}
            </table>
            ${opts.message ? `
            <div style="margin-top:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6b7280">MESSAGE / ADDITIONAL INFO</p>
              <p style="margin:0;font-size:14px;white-space:pre-wrap;color:#374151">${opts.message}</p>
            </div>` : ''}
            <div style="margin-top:20px">
              <a href="https://promexph.com/admin" style="background:#1a3c5e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">View in Admin →</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] sendInquiryAlert failed:', err);
  }
}
