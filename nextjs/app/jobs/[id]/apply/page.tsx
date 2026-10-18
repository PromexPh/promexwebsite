'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

const benefits = [
  'Track all your applications in one place',
  'Get notified about new matching jobs',
  'Save jobs and apply anytime',
  'Your profile works for every job — apply once, apply anywhere',
  'Free to join — no placement fees, ever',
];

function ApplyPageInner() {
  const { id } = useParams<{ id: string }>();
  const [jobTitle, setJobTitle] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJobTitle(data.job?.title ?? null);
        }
      } catch {
        // ignore — job title is optional
      }
    }
    fetchJob();
  }, [id]);

  return (
    <div className={styles.applyPage}>
      <div className={styles.applyCard}>

        {jobTitle && (
          <span className={styles.jobBadge}>You&apos;re applying for: {jobTitle}</span>
        )}

        <div className={styles.iconCircle}>
          <UserPlus size={40} color="#ffffff" />
        </div>

        <h1 className={styles.heading}>Apply for This Job</h1>
        <p className={styles.subheading}>Create your free Promex account to apply in minutes</p>

        <ul className={styles.benefits}>
          {benefits.map((b) => (
            <li key={b} className={styles.benefitItem}>
              <CheckCircle size={18} color="#059669" className={styles.benefitIcon} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/candidate/register?redirect=/jobs/${id}`}
          className={styles.ctaBtn}
        >
          Create Free Account →
        </Link>

        <p className={styles.signinLink}>
          Already have an account?{' '}
          <Link href={`/candidate/login?redirect=/jobs/${id}`}>Sign in</Link>
        </p>

        <hr className={styles.divider} />

        <p className={styles.privacyNote}>
          🔒 Your data is protected under the Philippine Data Privacy Act (RA 10173). We never share your information without your consent.
        </p>

      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <ApplyPageInner />
    </Suspense>
  );
}
