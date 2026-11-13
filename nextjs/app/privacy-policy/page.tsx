import Link from 'next/link';
import { COMPANY } from '@/lib/company';
import styles from './page.module.css';

export const metadata = { title: `Privacy Policy | ${COMPANY.legalName}` };

const sections = [
  {
    title: '1. Introduction',
    content: (
      <>
        <p>{COMPANY.legalName} ({COMPANY.fullName}), {COMPANY.licence}, is the personal information controller.</p>
        <p>We are committed to protecting your personal information in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.</p>
      </>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <>
        <p>We collect the following categories of personal information:</p>
        <ul>
          <li><strong>Personal identification:</strong> full name, date of birth, nationality</li>
          <li><strong>Contact details:</strong> email address, phone number, postal address</li>
          <li><strong>Professional information:</strong> CV/résumé, work history, skills, certifications</li>
          <li><strong>Company information (for employers):</strong> company name, industry, size, website, and contact person details</li>
          <li><strong>Usage data:</strong> IP address, browser type, pages visited on our website</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. How We Use Your Information',
    content: (
      <>
        <p>Your information is used for the following purposes:</p>
        <ul>
          <li>To match candidates with suitable overseas employment opportunities</li>
          <li>To process employer hiring inquiries and requirements</li>
          <li>To comply with DMW, POEA, and OWWA regulatory requirements</li>
          <li>To send job alerts and company updates (with your consent)</li>
          <li>To improve our website and services</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Messaging on WhatsApp',
    content: (
      <>
        <ul>
          <li>We communicate with candidates and employers through the WhatsApp Business Platform (Cloud API), provided by Meta Platforms, Inc. / WhatsApp LLC.</li>
          <li>When you message us, we receive your WhatsApp profile name, phone number, message content and any files you send.</li>
          <li>Messages are stored in our self-hosted customer inbox (Chatwoot) on servers we control, and are handled by our recruitment staff.</li>
          <li>Meta processes messages under its own terms and privacy policy: the <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener noreferrer">WhatsApp Business Policy</a> and the <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">WhatsApp Privacy Policy</a>.</li>
          <li><strong>Retention:</strong> conversations are kept for the same periods as Section 6 (Data Retention).</li>
          <li><strong>Purpose:</strong> answering enquiries, screening and processing applications, and updates you request.</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Information Sharing',
    content: (
      <>
        <p>We do not sell your personal data. We may share information with:</p>
        <ul>
          <li>Accredited overseas employers for recruitment purposes</li>
          <li>DMW, POEA, OWWA and other government agencies as required by Philippine law</li>
          <li>Third-party service providers under strict data processing agreements:
            <ul>
              <li>Email delivery</li>
              <li>Web hosting</li>
              <li>Meta / WhatsApp (messaging)</li>
              <li>Cloud hosting for our customer inbox</li>
            </ul>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Data Retention',
    content: (
      <>
        <p>Candidate data is retained for <strong>3 years</strong> from the date of last activity. Employer inquiry data is retained for <strong>2 years</strong>. You may request deletion of your data at any time by contacting us. See our <Link href="/data-deletion">Data Deletion Request</Link> page for how to ask and what happens next.</p>
      </>
    ),
  },
  {
    title: '7. Your Rights (under RA 10173)',
    content: (
      <>
        <p>As a data subject, you have the following rights under the Philippine Data Privacy Act:</p>
        <ul>
          <li>Right to be informed of how your data is collected and used</li>
          <li>Right to access your personal data held by us</li>
          <li>Right to correct inaccurate or incomplete data</li>
          <li>Right to erasure or blocking of your data</li>
          <li>Right to data portability</li>
          <li>Right to lodge a complaint with the National Privacy Commission (NPC)</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. GDPR Compliance (for EU/UK Users)',
    content: (
      <>
        <p>For users located in the European Union or United Kingdom, we comply with the General Data Protection Regulation (GDPR). Our lawful basis for processing your personal data is <strong>legitimate interest</strong> and <strong>consent</strong>. You may withdraw consent at any time by contacting our Data Protection Officer.</p>
      </>
    ),
  },
  {
    title: '9. Cookies',
    content: (
      <>
        <p>We use essential cookies required for the website to function correctly. We do not use third-party advertising or tracking cookies. You may disable cookies through your browser settings, though this may affect some site functionality.</p>
      </>
    ),
  },
  {
    title: '10. Contact Our Data Protection Officer',
    content: (
      <>
        <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:</p>
        <ul>
          <li><strong>Controller:</strong> {COMPANY.legalName} ({COMPANY.licence})</li>
          <li><strong>Email:</strong> <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, or WhatsApp <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">{COMPANY.whatsapp}</a></li>
          <li><strong>Phone:</strong> {COMPANY.phone}</li>
          <li><strong>Address:</strong> <a href={COMPANY.mapUrl} target="_blank" rel="noopener noreferrer">{COMPANY.address}</a></li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.legalHero}>
        <div className="container">
          <span className={styles.legalBadge}>Legal</span>
          <h1 className={styles.legalTitle}>Privacy Policy</h1>
          <p className={styles.legalMeta}>
            Effective Date: January 1, 2026 &middot; Last Updated: November 2026
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.legalBody}>
          {sections.map((s) => (
            <section key={s.title} className={styles.legalSection}>
              <h2 className={styles.legalSectionTitle}>{s.title}</h2>
              <div className={styles.legalContent}>{s.content}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
