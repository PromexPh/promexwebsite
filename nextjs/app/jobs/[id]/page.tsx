'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Job, Application } from '@/lib/types';
import styles from './page.module.css';

type ModalStep = 1 | 2 | 3;

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [step, setStep] = useState<ModalStep>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    years_experience: '',
    current_role: '',
    cover_letter: '',
    resume_url: '',
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError('Please sign in to apply. Go to /candidate/register to create an account.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          job_id: job.id,
          cover_letter: form.cover_letter,
          resume_url: form.resume_url || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit application');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} type="button" aria-label="Close">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        {submitted ? (
          <div className={styles.modalSuccess}>
            <div className={styles.modalSuccessIcon}>
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <h2>Application Submitted!</h2>
            <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received. We&apos;ll be in touch soon.</p>
            <button className={styles.modalDoneBtn} onClick={onClose} type="button">Done</button>
          </div>
        ) : (
          <>
            {/* Steps */}
            <div className={styles.modalSteps}>
              {([1, 2, 3] as ModalStep[]).map((s) => (
                <div key={s} className={`${styles.modalStep} ${step >= s ? styles.modalStepActive : ''}`}>
                  <span className={styles.modalStepNum}>{s}</span>
                  <span className={styles.modalStepLabel}>
                    {s === 1 ? 'Personal Info' : s === 2 ? 'Experience' : 'Cover Letter'}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.modalBody}>
              {step === 1 && (
                <>
                  <h3 className={styles.modalSectionTitle}>Personal Information</h3>
                  <div className={styles.modalRow}>
                    <div className={styles.modalField}>
                      <label>Full Name <span className={styles.req}>*</span></label>
                      <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Juan dela Cruz" />
                    </div>
                    <div className={styles.modalField}>
                      <label>Email <span className={styles.req}>*</span></label>
                      <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="juan@email.com" />
                    </div>
                  </div>
                  <div className={styles.modalRow}>
                    <div className={styles.modalField}>
                      <label>Phone Number</label>
                      <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+63 912 345 6789" />
                    </div>
                    <div className={styles.modalField}>
                      <label>Current Country</label>
                      <input value={form.country} onChange={(e) => update('country', e.target.value)} placeholder="Philippines" />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className={styles.modalSectionTitle}>Work Experience</h3>
                  <div className={styles.modalRow}>
                    <div className={styles.modalField}>
                      <label>Current / Last Role</label>
                      <input value={form.current_role} onChange={(e) => update('current_role', e.target.value)} placeholder="e.g. Staff Nurse" />
                    </div>
                    <div className={styles.modalField}>
                      <label>Years of Experience</label>
                      <select value={form.years_experience} onChange={(e) => update('years_experience', e.target.value)}>
                        <option value="">Select</option>
                        <option>Less than 1 year</option>
                        <option>1–2 years</option>
                        <option>3–5 years</option>
                        <option>6–10 years</option>
                        <option>10+ years</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <label>Resume / CV Link (optional)</label>
                    <input value={form.resume_url} onChange={(e) => update('resume_url', e.target.value)} placeholder="https://drive.google.com/..." />
                    <small>Paste a Google Drive, Dropbox, or OneDrive link to your CV</small>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className={styles.modalSectionTitle}>Cover Letter</h3>
                  <div className={styles.modalField}>
                    <label>Why are you a good fit for this role?</label>
                    <textarea
                      rows={6}
                      value={form.cover_letter}
                      onChange={(e) => update('cover_letter', e.target.value)}
                      placeholder={`Tell us why you're interested in ${job.title} at ${job.company}...`}
                    />
                  </div>
                  {error && <p className={styles.modalError}><i className="fa-solid fa-circle-exclamation" /> {error}</p>}
                </>
              )}
            </div>

            <div className={styles.modalActions}>
              {step > 1 && (
                <button className={styles.modalBackBtn} onClick={() => setStep((s) => (s - 1) as ModalStep)} type="button">
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Back
                </button>
              )}
              {step < 3 ? (
                <button
                  className={styles.modalNextBtn}
                  onClick={() => setStep((s) => (s + 1) as ModalStep)}
                  disabled={step === 1 && (!form.full_name || !form.email)}
                  type="button"
                >
                  Next <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              ) : (
                <button
                  className={styles.modalSubmitBtn}
                  onClick={submit}
                  disabled={loading}
                  type="button"
                >
                  {loading ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Submitting…</> : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit Application</>}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) { router.push('/jobs'); return; }
      const data = await res.json();
      setJob(data.job);
      setLoading(false);

      // Check if already applied
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const token = sessionData.session.access_token;
        const appRes = await fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } });
        if (appRes.ok) {
          const appData = await appRes.json();
          const applied = (appData.applications as Application[]).some((a) => a.job_id === id);
          setAlreadyApplied(applied);
        }
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
        <p>Loading job details…</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <>
      {/* Hero */}
      <section className={styles.jobHero}>
        <div className={styles.jobHeroOverlay} />
        <div className={`container ${styles.jobHeroContent}`}>
          <button className={styles.backLink} onClick={() => router.push('/jobs')} type="button">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Jobs
          </button>
          <div className={styles.jobHeroBadge}>{job.industry}</div>
          <h1 className={styles.jobHeroTitle}>{job.title}</h1>
          <div className={styles.jobHeroCompany}>
            <i className="fa-solid fa-building" aria-hidden="true" /> {job.company}
          </div>
          <div className={styles.jobHeroMeta}>
            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
            <span><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
            <span><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
            <span className={styles.jobHeroSalary}><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {job.salary}/month</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className={styles.jobContent}>
        <div className={`container ${styles.jobContentLayout}`}>

          {/* Main */}
          <main className={styles.jobMain}>
            <div className={styles.jobSection}>
              <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-file-lines" aria-hidden="true" /> Job Description</h2>
              <p className={styles.jobDescription}>{job.description}</p>
            </div>

            <div className={styles.jobSection}>
              <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-list-check" aria-hidden="true" /> Requirements</h2>
              <ul className={styles.jobList}>
                {job.requirements.map((req, i) => (
                  <li key={i}><i className="fa-solid fa-check" aria-hidden="true" /> {req}</li>
                ))}
              </ul>
            </div>

            <div className={styles.jobSection}>
              <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-gift" aria-hidden="true" /> Benefits & Perks</h2>
              <ul className={styles.jobList}>
                {job.benefits.map((b, i) => (
                  <li key={i}><i className="fa-solid fa-star" aria-hidden="true" /> {b}</li>
                ))}
              </ul>
            </div>
          </main>

          {/* Sticky Sidebar */}
          <aside className={styles.jobSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarSalary}>{job.salary}<span>/month</span></div>
              <div className={styles.sidebarMeta}>
                <div className={styles.sidebarMetaItem}>
                  <i className="fa-solid fa-building" aria-hidden="true" />
                  <span>{job.company}</span>
                </div>
                <div className={styles.sidebarMetaItem}>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <span>{job.country}</span>
                </div>
                <div className={styles.sidebarMetaItem}>
                  <i className="fa-solid fa-briefcase" aria-hidden="true" />
                  <span>{job.industry}</span>
                </div>
                <div className={styles.sidebarMetaItem}>
                  <i className="fa-solid fa-clock" aria-hidden="true" />
                  <span>{job.job_type}</span>
                </div>
                <div className={styles.sidebarMetaItem}>
                  <i className="fa-solid fa-user-graduate" aria-hidden="true" />
                  <span>{job.experience}</span>
                </div>
              </div>

              {alreadyApplied ? (
                <div className={styles.appliedBadge}>
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> Application Submitted
                </div>
              ) : (
                <button className={styles.applyBtn} onClick={() => setShowModal(true)} type="button">
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Apply Now
                </button>
              )}

              <p className={styles.sidebarNote}>
                <i className="fa-solid fa-shield-halved" aria-hidden="true" /> POEA-licensed agency. Zero placement fee for workers.
              </p>
            </div>

            <div className={styles.sidebarShare}>
              <p>Share this job</p>
              <div className={styles.shareButtons}>
                <button type="button" aria-label="Share on Facebook"><i className="fa-brands fa-facebook" /></button>
                <button type="button" aria-label="Share on LinkedIn"><i className="fa-brands fa-linkedin" /></button>
                <button type="button" aria-label="Copy link" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <i className="fa-solid fa-link" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {showModal && job && <ApplyModal job={job} onClose={() => setShowModal(false)} />}
    </>
  );
}
