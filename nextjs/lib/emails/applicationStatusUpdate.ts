import { resend, FROM, BASE_URL } from './_client';
import { baseTemplate, primaryBtn, alertBox } from './template';
import { logEmail } from './logEmail';

type KnownStatus = 'under_review' | 'shortlisted' | 'interview_scheduled' | 'offer_extended' | 'deployed' | 'rejected' | 'withdrawn';

function getSubject(status: string, jobTitle: string): string {
  const map: Record<string, string> = {
    under_review:         'Update: Your Application is Being Reviewed',
    shortlisted:          '🎉 Great News — You\'ve Been Shortlisted!',
    interview_scheduled:  `Interview Invitation — ${jobTitle}`,
    offer_extended:       '🎊 Congratulations — You Have a Job Offer!',
    deployed:             'Welcome Aboard — Your Overseas Journey Begins!',
    rejected:             `Application Update — ${jobTitle}`,
    withdrawn:            `Application Withdrawal Confirmed — ${jobTitle}`,
  };
  return map[status] ?? `Application Update — ${jobTitle}`;
}

interface StatusContent {
  heading: string;
  body: string;
  alertColor: string;
  cta?: { label: string; href: string };
}

function getContent(status: string, jobTitle: string, company: string, country: string): StatusContent {
  switch (status as KnownStatus) {
    case 'under_review':
      return {
        heading:    'Your Application is Under Review',
        body:       `The Promex recruitment team is currently reviewing your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>. We'll notify you of any further updates within 3–5 business days.`,
        alertColor: '#f59e0b',
      };
    case 'shortlisted':
      return {
        heading:    '🎉 Congratulations — You\'ve Been Shortlisted!',
        body:       `Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been shortlisted! Our recruitment team will contact you shortly to discuss the next steps.`,
        alertColor: '#22c55e',
        cta:        { label: 'View My Dashboard →', href: `${BASE_URL}/candidate/dashboard` },
      };
    case 'interview_scheduled':
      return {
        heading:    'Interview Invitation 🗓️',
        body:       `You have been invited for an interview for <strong>${jobTitle}</strong>. Our team will reach out to you within <strong>24 hours</strong> to confirm the schedule and format (in-person or online). Please ensure your contact details are up to date.`,
        alertColor: '#4FA3C7',
        cta:        { label: 'Update My Profile →', href: `${BASE_URL}/candidate/dashboard` },
      };
    case 'offer_extended':
      return {
        heading:    '🎊 Congratulations — You Have a Job Offer!',
        body:       `Excellent news! You have received a job offer for <strong>${jobTitle}</strong> in <strong>${country}</strong>. Please log in to your dashboard to review the offer details and respond.`,
        alertColor: '#22c55e',
        cta:        { label: 'View Job Offer →', href: `${BASE_URL}/candidate/dashboard` },
      };
    case 'deployed':
      return {
        heading:    'Welcome Aboard — Your Overseas Journey Begins! ✈️',
        body:       `Welcome to the Promex family! You have been successfully placed for <strong>${jobTitle}</strong> in <strong>${country}</strong>. Our deployment team will contact you with the next steps for documentation and deployment processing.`,
        alertColor: '#22c55e',
      };
    case 'rejected':
      return {
        heading:    'Application Update',
        body:       `Thank you for your interest in <strong>${jobTitle}</strong>. After careful review, we regret to inform you that your application was not successful at this time. We encourage you to keep your profile updated and apply for other positions that match your skills.`,
        alertColor: '#dc2626',
        cta:        { label: 'Browse Other Jobs →', href: `${BASE_URL}/jobs` },
      };
    default:
      return {
        heading:    'Application Status Updated',
        body:       `Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated.`,
        alertColor: '#4FA3C7',
        cta:        { label: 'View My Applications →', href: `${BASE_URL}/candidate/dashboard` },
      };
  }
}

export async function sendStatusUpdate(opts: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  country?: string;
  newStatus: string;
}): Promise<void> {
  const subject = getSubject(opts.newStatus, opts.jobTitle);
  const content = getContent(opts.newStatus, opts.jobTitle, opts.company, opts.country ?? '');
  const firstName = opts.candidateName.split(' ')[0] ?? opts.candidateName;

  const html = baseTemplate({
    preheader: subject,
    body: `
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#1a1a2e;">${content.heading}</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;">${opts.jobTitle} &middot; ${opts.company}</p>

      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">Hi ${firstName},</p>

      ${alertBox(content.body, content.alertColor)}

      ${content.cta ? primaryBtn(content.cta.label, content.cta.href) : ''}

      <p style="margin:${content.cta ? '28px' : '0'} 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Questions? Email <a href="mailto:connect@promexph.com" style="color:#4FA3C7;">connect@promexph.com</a>
      </p>
    `,
  });

  try {
    await resend.emails.send({ from: FROM, to: opts.candidateEmail, subject, html });
    void logEmail({ emailType: `status_update_${opts.newStatus}`, recipient: opts.candidateEmail, status: 'sent' });
  } catch (err) {
    console.error('[email] sendStatusUpdate failed:', err);
    void logEmail({ emailType: `status_update_${opts.newStatus}`, recipient: opts.candidateEmail, status: 'failed' });
  }
}
