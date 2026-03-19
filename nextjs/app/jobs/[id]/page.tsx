'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/app/components/ui/Toast';
import type { Job, CandidateProfile } from '@/lib/types';
import styles from './page.module.css';

// ── Simple Apply Modal ──────────────────────────────────────────────────────
interface ApplyModalProps {
  job: Job;
  candidate: CandidateProfile;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ApplyModal({ job, candidate, token, onClose, onSuccess }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          job_id: job.id,
          cover_letter: coverLetter || null,
          resume_url: candidate.resume_url ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit'); return; }
      setSubmitted(true);
      onSuccess();
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
            <div className={styles.modalSuccessIcon}><i className="fa-solid fa-check" aria-hidden="true" /></div>
            <h2>Application Submitted!</h2>
            <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received.</p>
            <button className={styles.modalDoneBtn} onClick={onClose} type="button">Done</button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Apply for this Job</h2>
              <div className={styles.modalJobInfo}>
                <strong>{job.title}</strong> · {job.company} · {job.country}
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* Candidate summary */}
              <div className={styles.candidateSummary}>
                <div className={styles.candidateAvatar}>{candidate.full_name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={styles.candidateName}>{candidate.full_name}</div>
                  <div className={styles.candidateEmail}>{candidate.email}</div>
                </div>
                {candidate.resume_filename && (
                  <div className={styles.cvChip}>
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" /> {candidate.resume_filename}
                  </div>
                )}
              </div>

              <div className={styles.modalField}>
                <label>Cover Letter <span className={styles.optional}>(optional, max 500 chars)</span></label>
                <textarea
                  rows={5}
                  maxLength={500}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Tell ${job.company} why you're a great fit for this role…`}
                />
                <small>{coverLetter.length}/500</small>
              </div>

              {error && <p className={styles.modalError}><i className="fa-solid fa-circle-exclamation" /> {error}</p>}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalSubmitBtn} onClick={submit} disabled={loading} type="button">
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Submitting…</>
                  : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit Application</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Profile required modal ──────────────────────────────────────────────────
function CompleteProfileModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} type="button" aria-label="Close">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <div className={styles.modalSuccess}>
          <div className={styles.modalSuccessIcon} style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}>
            <i className="fa-solid fa-user-pen" aria-hidden="true" />
          </div>
          <h2>Complete Your Profile First</h2>
          <p>Please upload your CV in your candidate dashboard before applying. It only takes a minute!</p>
          <a href="/candidate/dashboard" className={styles.modalDoneBtn}>Go to Dashboard →</a>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
function JobDetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast, ToastContainer } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) { router.push('/jobs'); return; }
      const data = await res.json();
      const loadedJob: Job = data.job;
      setJob(loadedJob);
      setLoading(false);

      // Similar jobs
      const simRes = await fetch(`/api/jobs?industry=${encodeURIComponent(loadedJob.industry)}&limit=4`);
      if (simRes.ok) {
        const simData = await simRes.json();
        setSimilarJobs((simData.jobs as Job[]).filter((j) => j.id !== id).slice(0, 3));
      }

      // Auth check
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const t = sessionData.session.access_token;
        setToken(t);
        const userId = sessionData.session.user.id;

        const { data: cand } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (cand) setCandidate(cand as CandidateProfile);

        const appRes = await fetch('/api/applications', { headers: { Authorization: `Bearer ${t}` } });
        if (appRes.ok) {
          const appData = await appRes.json();
          setAlreadyApplied(appData.applications.some((a: { job_id: string }) => a.job_id === id));
        }
      }
    }
    load();
  }, [id, router]);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  }

  function handleApplyClick() {
    if (!candidate) { router.push(`/candidate/register?redirect=/jobs/${id}`); return; }
    if (!candidate.resume_url) { setShowProfileModal(true); return; }
    setShowModal(true);
  }

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
      <ToastContainer />

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="container">
          <Link href="/">Home</Link>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          <Link href="/jobs">Jobs</Link>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          <span>{job.title}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.jobHero}>
        <div className={styles.jobHeroOverlay} />
        <div className={`container ${styles.jobHeroContent}`}>
          <div className={styles.jobHeroBadge}>{job.industry}{job.urgent && <span className={styles.urgentInline}>URGENT</span>}</div>
          <h1 className={styles.jobHeroTitle}>{job.title}</h1>
          <div className={styles.jobHeroCompany}><i className="fa-solid fa-building" aria-hidden="true" /> {job.company}</div>
          <div className={styles.jobHeroMeta}>
            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
            <span><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
            <span><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
            <span className={styles.jobHeroSalary}><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {job.salary}/month</span>
          </div>
          {(job.slots_available ?? 0) > 0 && (
            <div className={styles.slotsHint}>
              <i className="fa-solid fa-users" aria-hidden="true" /> {job.slots_available} slots available
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className={styles.jobContent}>
        <div className={`container ${styles.jobContentLayout}`}>
          <main className={styles.jobMain}>
            <div className={styles.jobSection}>
              <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-file-lines" aria-hidden="true" /> Job Description</h2>
              <p className={styles.jobDescription}>{job.description}</p>
            </div>
            <div className={styles.jobSection}>
              <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-list-check" aria-hidden="true" /> Requirements</h2>
              <ul className={styles.jobList}>
                {job.requirements.map((req, i) => <li key={i}><i className="fa-solid fa-check" aria-hidden="true" /> {req}</li>)}
              </ul>
            </div>
            <div className={styles.jobSection}>
              <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-gift" aria-hidden="true" /> Benefits & Perks</h2>
              <ul className={styles.jobList}>
                {job.benefits.map((b, i) => <li key={i}><i className="fa-solid fa-star" aria-hidden="true" /> {b}</li>)}
              </ul>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className={styles.similarSection}>
                <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-layer-group" aria-hidden="true" /> Similar Jobs</h2>
                <div className={styles.similarGrid}>
                  {similarJobs.map((sj) => (
                    <a key={sj.id} href={`/jobs/${sj.id}`} className={styles.similarCard}>
                      <div className={styles.similarTitle}>{sj.title}</div>
                      <div className={styles.similarCompany}>{sj.company}</div>
                      <div className={styles.similarMeta}>
                        <span>{sj.country}</span>
                        <span className={styles.similarSalary}>{sj.salary}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sticky Sidebar */}
          <aside className={styles.jobSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarSalary}>{job.salary}<span>/month</span></div>
              <div className={styles.sidebarMeta}>
                {[
                  ['fa-building', job.company],
                  ['fa-location-dot', job.country],
                  ['fa-briefcase', job.industry],
                  ['fa-clock', job.job_type],
                  ['fa-user-graduate', job.experience],
                ].map(([icon, val]) => (
                  <div key={icon} className={styles.sidebarMetaItem}>
                    <i className={`fa-solid ${icon}`} aria-hidden="true" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>

              {alreadyApplied ? (
                <div className={styles.appliedBadge}>
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> Application Submitted
                </div>
              ) : (
                <button className={styles.applyBtn} onClick={handleApplyClick} type="button">
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Apply Now
                </button>
              )}

              <button className={styles.shareBtn} onClick={handleShare} type="button">
                <i className="fa-solid fa-link" aria-hidden="true" /> Share Job
              </button>

              <p className={styles.sidebarNote}>
                <i className="fa-solid fa-shield-halved" aria-hidden="true" /> POEA-licensed agency. Zero placement fee for workers.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {showModal && job && candidate && (
        <ApplyModal
          job={job}
          candidate={candidate}
          token={token}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setAlreadyApplied(true); addToast('Application submitted!', 'success'); }}
        />
      )}
      {showProfileModal && <CompleteProfileModal onClose={() => setShowProfileModal(false)} />}
    </>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-primary)' }}><i className="fa-solid fa-spinner fa-spin" /></div>}>
      <JobDetailInner />
    </Suspense>
  );
}
