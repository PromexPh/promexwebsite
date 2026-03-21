import styles from '../privacy-policy/page.module.css';

export const metadata = { title: 'Terms & Conditions | Promex Inc.' };

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: (
      <>
        <p>By accessing or using promexph.com, or by submitting any inquiry or application through our website, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website or services.</p>
      </>
    ),
  },
  {
    title: '2. Services',
    content: (
      <>
        <p>Promex Inc. is a DMW-licensed recruitment agency (License No. 149-LB-051316-R) providing overseas employment placement services for Filipino professionals and manpower sourcing services for international employers. Our services are subject to applicable Philippine laws and regulations.</p>
      </>
    ),
  },
  {
    title: '3. No Placement Fee Policy',
    content: (
      <>
        <p>In compliance with the Philippine Overseas Employment Administration (POEA) rules, <strong>Promex does not charge any placement fees to candidates for land-based employment.</strong> Any person or entity collecting fees on behalf of Promex without written authorization is not acting on our behalf. Please report such activities to us or the DMW immediately.</p>
      </>
    ),
  },
  {
    title: '4. Candidate Obligations',
    content: (
      <>
        <p>Candidates using our platform agree to:</p>
        <ul>
          <li>Provide accurate and truthful information in all applications and profile details</li>
          <li>Submit only genuine documents, certifications, and credentials</li>
          <li>Comply with all DMW requirements and destination country entry regulations</li>
          <li>Notify Promex promptly of any changes to your application details or personal circumstances</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Employer Obligations',
    content: (
      <>
        <p>Employers partnering with Promex agree to:</p>
        <ul>
          <li>Provide accurate, complete, and lawful job descriptions and company information</li>
          <li>Comply with Philippine labor export laws and applicable bilateral agreements</li>
          <li>Ensure fair working conditions as agreed in employment contracts submitted to the DMW</li>
          <li>Not engage in any form of worker exploitation, contract substitution, or trafficking</li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Limitation of Liability',
    content: (
      <>
        <p>Promex Inc. acts as an intermediary recruitment agency between candidates and overseas employers. We are not liable for the actions, decisions, or conduct of employers or candidates following successful placement, beyond our specific obligations under Philippine law. We make no guarantees regarding the outcome of any application or hiring process.</p>
      </>
    ),
  },
  {
    title: '7. Intellectual Property',
    content: (
      <>
        <p>All content published on promexph.com — including text, graphics, logos, and design — is owned by or licensed to Promex Inc. and is protected by Philippine and international intellectual property laws. No content may be reproduced, distributed, or used without prior written permission from Promex Inc.</p>
      </>
    ),
  },
  {
    title: '8. Governing Law',
    content: (
      <>
        <p>These Terms &amp; Conditions are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from the use of our services shall be subject to the exclusive jurisdiction of the Philippine courts.</p>
      </>
    ),
  },
  {
    title: '9. Changes to Terms',
    content: (
      <>
        <p>Promex Inc. reserves the right to update or modify these Terms &amp; Conditions at any time. Changes will be posted on this page with a revised effective date. Your continued use of the website following any changes constitutes your acceptance of the updated terms.</p>
      </>
    ),
  },
  {
    title: '10. Contact',
    content: (
      <>
        <p>For questions regarding these Terms &amp; Conditions, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:connect@promexph.com">connect@promexph.com</a></li>
          <li><strong>Address:</strong> Suite A, 2/F Vision Building, 162 Pasig Blvd, Pasig City, Philippines</li>
        </ul>
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.legalHero}>
        <div className="container">
          <span className={styles.legalBadge}>Legal</span>
          <h1 className={styles.legalTitle}>Terms &amp; Conditions</h1>
          <p className={styles.legalMeta}>Effective Date: January 1, 2026</p>
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
