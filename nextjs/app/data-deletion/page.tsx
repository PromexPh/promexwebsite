import Link from 'next/link';
import { COMPANY } from '@/lib/company';
import styles from '../privacy-policy/page.module.css';

export const metadata = { title: `Data Deletion Request | ${COMPANY.legalName}` };

const sections = [
  {
    title: '1. Who This Applies To',
    content: (
      <>
        <p>Candidates, employers and anyone who has contacted us through our website, WhatsApp, email or phone.</p>
      </>
    ),
  },
  {
    title: '2. How to Request Deletion',
    content: (
      <>
        <p>Send us a message by either:</p>
        <ul>
          <li><strong>WhatsApp:</strong> <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">{COMPANY.whatsapp}</a></li>
          <li><strong>Email:</strong> <a href={`mailto:${COMPANY.email}?subject=Data%20Deletion%20Request`}>{COMPANY.email}</a></li>
        </ul>
        <p>Start your message (or use the email subject) <strong>&ldquo;Data Deletion Request&rdquo;</strong>, and include your full name and the phone number or email address you used with us.</p>
      </>
    ),
  },
  {
    title: '3. What We Delete',
    content: (
      <>
        <ul>
          <li>Your account and profile data</li>
          <li>CVs and any files you uploaded or sent us</li>
          <li>Message history, both on our website and on WhatsApp (stored in our Chatwoot inbox)</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. What We May Have to Keep',
    content: (
      <>
        <p>Some records must be kept under DMW, POEA, OWWA or other Philippine law, for example records of deployed workers. We keep these only for as long as the law requires, and we will tell you what we retained and why.</p>
      </>
    ),
  },
  {
    title: '5. Timeline',
    content: (
      <>
        <ul>
          <li>We confirm receipt of your request within <strong>5 working days</strong>.</li>
          <li>We complete the deletion within <strong>30 days</strong>.</li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Messages on Your Own Phone',
    content: (
      <>
        <p>Deleting the data we hold does not delete messages stored in your own WhatsApp app. You can delete those from your chat with us.</p>
      </>
    ),
  },
  {
    title: '7. Controller',
    content: (
      <>
        <ul>
          <li><strong>Company:</strong> {COMPANY.legalName} ({COMPANY.fullName})</li>
          <li><strong>Licence:</strong> <a href={COMPANY.licenceUrl} target="_blank" rel="noopener noreferrer">{COMPANY.licence}</a></li>
          <li><strong>Address:</strong> <a href={COMPANY.mapUrl} target="_blank" rel="noopener noreferrer">{COMPANY.address}</a></li>
          <li><strong>Phone:</strong> {COMPANY.phone}</li>
          <li><strong>Email:</strong> <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
        </ul>
        <p>For more on how we handle your data, see our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      </>
    ),
  },
];

export default function DataDeletionPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.legalHero}>
        <div className="container">
          <span className={styles.legalBadge}>Legal</span>
          <h1 className={styles.legalTitle}>Data Deletion Request</h1>
          <p className={styles.legalMeta}>Last Updated: November 2026</p>
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
