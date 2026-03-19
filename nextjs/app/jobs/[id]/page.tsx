/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/app/components/ui/Toast';
import type { Job, CandidateProfile } from '@/lib/types';
import styles from './page.module.css';

// ── Industry colours ──────────────────────────────────────────────────────────
const INDUSTRY_COLORS: Record<string, string> = {
  'Healthcare':       '#E74C3C',
  'Engineering':      '#3498DB',
  'Hospitality':      '#E67E22',
  'IT & Technology':  '#9B59B6',
  'Manufacturing':    '#1ABC9C',
  'Retail':           '#F39C12',
  'Agriculture':      '#27AE60',
  'Construction':     '#95A5A6',
};

function industryColor(industry: string): string {
  return INDUSTRY_COLORS[industry] ?? '#6C757D';
}

function formatSalary(job: Job): string {
  if (job.salary_min && job.salary_max) return `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}/mo`;
  if (job.salary_min) return `From $${job.salary_min.toLocaleString()}/mo`;
  return 'Competitive salary';
}

// ── Profile completion scoring ────────────────────────────────────────────────
function calcProfileCompletion(p: CandidateProfile): number {
  let score = 0;
  if (p.full_name) score += 15;
  if (p.phone) score += 10;
  if (p.nationality && p.current_location) score += 10;
  if (p.desired_position) score += 10;
  if (p.education_level) score += 10;
  if ((p.skills?.length ?? 0) > 0) score += 10;
  if ((p.work_experience?.length ?? 0) > 0) score += 15;
  if (p.resume_url) score += 20;
  return Math.min(100, score);
}

// ── Constants (kept for reference, unused by new modals) ─────────────────────
type ApplyMethod = 'cv' | 'linkedin' | 'form';
type AddonKey   = 'portfolio' | 'video' | 'certs' | 'cover';

const ADDON_CONFIG: Record<AddonKey, { label: string; icon: string; points: number; minutes: number; placeholder: string }> = {
  portfolio: { label: 'Portfolio / work samples', icon: 'fa-folder-open', points: 15, minutes: 1, placeholder: 'https://your-portfolio.com' },
  video:     { label: '30-sec intro video',       icon: 'fa-video',       points: 20, minutes: 3, placeholder: 'Paste video link…' },
  certs:     { label: 'Certifications / licenses', icon: 'fa-certificate', points: 10, minutes: 1, placeholder: 'List your certifications…' },
  cover:     { label: 'Cover letter',              icon: 'fa-pen-nib',    points:  5, minutes: 1, placeholder: 'Tell the employer why you\'re a great fit…' },
};

const METHOD_BASE: Record<ApplyMethod, number> = { cv: 60, linkedin: 55, form: 65 };
const METHOD_TIME: Record<ApplyMethod, number>  = { cv: 2,  linkedin: 1,  form: 5  };

// Suppress unused variable warnings for constants kept per spec
void ADDON_CONFIG;
void METHOD_BASE;
void METHOD_TIME;

// ── Modal A — Login Prompt ───────────────────────────────────────────────────
function LoginPromptModal({ jobId, job, onClose }: { jobId: string; job: Job; onClose: () => void }) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} type="button">
          <i className="fa-solid fa-xmark" />
        </button>
        <p className={styles.modalJobMeta}>{job.title} · {job.company}</p>
        <h2 className={styles.modalHeading}>Sign in to apply</h2>
        <div className={styles.modalBtnStack}>
          <a href={`/candidate/register?redirect=/jobs/${jobId}`} className={styles.modalPrimaryBtn}>
            Create Free Account
          </a>
          <a href={`/candidate/register?mode=login&redirect=/jobs/${jobId}`} className={styles.modalSecondaryBtn}>
            Sign In
          </a>
        </div>
        <p className={styles.modalTrustNote}>Free to apply · Zero placement fees · DMW accredited</p>
      </div>
    </div>
  );
}

// ── Modal B — Complete Profile ────────────────────────────────────────────────
function CompleteProfileModal({ candidate, onClose, onSkip }: { candidate: CandidateProfile; onClose: () => void; onSkip: () => void }) {
  const pct = calcProfileCompletion(candidate);
  const barColor = pct < 40 ? '#E67E22' : pct < 80 ? '#8CC63F' : '#4FA3C7';
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} type="button">
          <i className="fa-solid fa-xmark" />
        </button>
        <div className={styles.modalIconCircle} style={{ background: 'rgba(230,126,34,0.12)', color: '#E67E22' }}>
          <i className="fa-solid fa-user-pen" />
        </div>
        <h2 className={styles.modalHeading}>Complete your profile first</h2>
        <p className={styles.modalSubtext}>Upload your CV before applying. It only takes a minute.</p>
        <div className={styles.modalProgressWrap}>
          <div className={styles.modalProgressBar}>
            <div style={{ width: `${pct}%`, background: barColor, height: '100%', borderRadius: 9999, transition: 'width 0.4s ease' }} />
          </div>
          <span className={styles.modalProgressPct} style={{ color: barColor }}>{pct}%</span>
        </div>
        <a href="/candidate/dashboard" className={styles.modalPrimaryBtn}>
          Go to My Profile →
        </a>
        <button type="button" className={styles.modalSkipLink} onClick={() => { onSkip(); onClose(); }}>
          Skip — fill a form instead
        </button>
      </div>
    </div>
  );
}

// ── Modal C — Apply Modal ─────────────────────────────────────────────────────
function ApplyModal({ job, candidate, token, onClose, onSuccess }: { job: Job; candidate: CandidateProfile; token: string; onClose: () => void; onSuccess: () => void }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firstName = candidate.full_name?.split(' ')[0] ?? 'there';
  const displayFilename = cvFile ? cvFile.name : (candidate.resume_filename ?? 'Your saved CV');

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      let resumeUrl = candidate.resume_url ?? null;
      if (cvFile) {
        const ext = cvFile.name.split('.').pop() ?? 'pdf';
        const path = `${candidate.user_id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('resumes').upload(path, cvFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);
          resumeUrl = urlData.publicUrl;
          await supabase.from('candidates').update({ resume_url: resumeUrl, resume_filename: cvFile.name }).eq('user_id', candidate.user_id);
        }
      }
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: job.id, resume_url: resumeUrl, cover_letter: coverLetter || null }),
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

  if (submitted) {
    return (
      <div className={styles.modalBackdrop} onClick={onClose}>
        <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
          <div className={styles.successCheckmark}>
            <i className="fa-solid fa-circle-check" />
          </div>
          <h2 className={styles.modalHeading}>Application Submitted!</h2>
          <p className={styles.modalSubtext}>
            Thank you {firstName}. We&apos;ve received your application for <strong>{job.title}</strong> at <strong>{job.company}</strong>.
          </p>
          <div className={styles.modalDivider} />
          <p className={styles.successStepsLabel}>What happens next</p>
          <ol className={styles.successStepsList}>
            <li>Our team reviews your application (1–3 business days)</li>
            <li>Shortlisted candidates are contacted for screening</li>
            <li>Selected candidates proceed to employer interview</li>
            <li>Job offer and deployment processing</li>
          </ol>
          <p className={styles.successEmailNote}>
            <i className="fa-solid fa-envelope" /> Check your email at <strong>{candidate.email}</strong> for a confirmation.
          </p>
          <div className={styles.modalBtnStack}>
            <a href="/candidate/dashboard" className={styles.modalPrimaryBtn}>View My Applications</a>
            <a href="/jobs" className={styles.modalSecondaryBtn}>Browse More Jobs</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modalBox} ${styles.modalBoxWide}`} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} type="button">
          <i className="fa-solid fa-xmark" />
        </button>
        {/* Job header */}
        <p className={styles.modalJobTitle}>{job.title}</p>
        <p className={styles.modalJobCompany}>{job.company}</p>
        <p className={styles.modalJobSalary}>{formatSalary(job)}</p>
        <div className={styles.modalDivider} />
        {/* CV section */}
        <p className={styles.modalSectionLabel}>APPLYING WITH</p>
        <div className={styles.modalCvRow}>
          <i className="fa-solid fa-file-pdf" style={{ color: '#E74C3C' }} />
          <span className={styles.modalCvName}>{displayFilename}</span>
          <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F' }} />
          <button type="button" className={styles.modalChangeCv} onClick={() => fileInputRef.current?.click()}>
            Change CV
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setCvFile(e.target.files?.[0] ?? null)} />
        </div>
        {/* Cover letter */}
        <textarea
          className={styles.modalCoverInput}
          rows={3}
          placeholder="Add a brief note to the recruiter... (optional)"
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
        />
        {error && <p className={styles.modalError}>{error}</p>}
        <div className={styles.modalDivider} />
        {/* Actions */}
        <div className={styles.modalActionsRow}>
          <button type="button" className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.modalSubmitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Submitting…</> : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
function JobDetailInner() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { addToast, ToastContainer } = useToast();

  const [job,              setJob]              = useState<Job | null>(null);
  const [similarJobs,      setSimilarJobs]      = useState<Job[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [showPanel,        setShowPanel]        = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal,   setShowLoginModal]   = useState(false);
  // forceFormMethod kept for legacy skip flow (CompleteProfileModal onSkip)
  const [, setForceFormMethod]  = useState(false);
  const [alreadyApplied,   setAlreadyApplied]   = useState(false);
  const [candidate,        setCandidate]        = useState<CandidateProfile | null>(null);
  const [token,            setToken]            = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) { router.push('/jobs'); return; }
      const data = await res.json();
      const loadedJob: Job = data.job;
      setJob(loadedJob);
      setLoading(false);

      const simRes = await fetch(`/api/jobs?industry=${encodeURIComponent(loadedJob.industry)}&limit=4`);
      if (simRes.ok) {
        const simData = await simRes.json();
        setSimilarJobs((simData.jobs as Job[]).filter((j) => j.id !== id).slice(0, 3));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) setToken(sessionData.session.access_token);
        const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
        if (cand) {
          setCandidate(cand as CandidateProfile);
          const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('candidate_id', (cand as CandidateProfile & { id: string }).id)
            .eq('job_id', id)
            .maybeSingle();
          setAlreadyApplied(!!existing);
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
    if (!candidate) { setShowLoginModal(true); return; }
    if (!candidate.resume_url) { setShowProfileModal(true); return; }
    setShowPanel(true);
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

  const indColor = industryColor(job.industry);

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
          <div className={styles.jobHeroBadge} style={{ background: indColor }}>
            {job.industry}
            {job.urgent && <span className={styles.urgentInline}>URGENT</span>}
          </div>
          <h1 className={styles.jobHeroTitle}>{job.title}</h1>
          <div className={styles.jobHeroCompany}><i className="fa-solid fa-building" aria-hidden="true" /> {job.company}</div>
          <div className={styles.jobHeroMeta}>
            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
            <span><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
            <span><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
            <span className={styles.jobHeroSalary}><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {formatSalary(job)}</span>
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
            {job.requirements.length > 0 && (
              <div className={styles.jobSection}>
                <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-list-check" aria-hidden="true" /> Requirements</h2>
                <ul className={styles.jobList}>
                  {job.requirements.map((req, i) => <li key={i}><i className="fa-solid fa-check" aria-hidden="true" /> {req}</li>)}
                </ul>
              </div>
            )}
            {job.benefits.length > 0 && (
              <div className={styles.jobSection}>
                <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-gift" aria-hidden="true" /> Benefits & Perks</h2>
                <ul className={styles.jobList}>
                  {job.benefits.map((b, i) => <li key={i}><i className="fa-solid fa-star" aria-hidden="true" /> {b}</li>)}
                </ul>
              </div>
            )}

            {similarJobs.length > 0 && (
              <div className={styles.similarSection}>
                <h2 className={styles.jobSectionTitle}><i className="fa-solid fa-layer-group" aria-hidden="true" /> More {job.industry} Jobs</h2>
                <div className={styles.similarGrid}>
                  {similarJobs.map((sj) => (
                    <a key={sj.id} href={`/jobs/${sj.id}`} className={styles.similarCard}>
                      <div className={styles.similarTitle}>{sj.title}</div>
                      <div className={styles.similarCompany}>{sj.company} · {sj.country}</div>
                      <div className={styles.similarSalary}>{formatSalary(sj)}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sticky Sidebar */}
          <aside className={styles.jobSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarSalary}>{formatSalary(job)}</div>
              <div className={styles.sidebarMeta}>
                {[
                  ['fa-building',      job.company  ],
                  ['fa-location-dot',  job.country  ],
                  ['fa-briefcase',     job.industry ],
                  ['fa-clock',         job.job_type ],
                  ['fa-user-graduate', job.experience],
                ].map(([icon, val]) => (
                  <div key={icon} className={styles.sidebarMetaItem}>
                    <i className={`fa-solid ${icon}`} aria-hidden="true" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>

              {alreadyApplied ? (
                <>
                  <div className={styles.appliedBadge}>
                    <i className="fa-solid fa-circle-check" aria-hidden="true" /> Already Applied
                  </div>
                  <Link href="/candidate/dashboard" className={styles.viewApplicationLink}>
                    View your application →
                  </Link>
                </>
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

      {showPanel && job && candidate && (
        <ApplyModal
          job={job}
          candidate={candidate}
          token={token}
          onClose={() => { setShowPanel(false); setForceFormMethod(false); }}
          onSuccess={() => { setAlreadyApplied(true); addToast('Application submitted!', 'success'); }}
        />
      )}
      {showProfileModal && candidate && (
        <CompleteProfileModal
          onClose={() => setShowProfileModal(false)}
          candidate={candidate}
          onSkip={() => { setForceFormMethod(true); setShowPanel(true); }}
        />
      )}
      {showLoginModal && job && (
        <LoginPromptModal jobId={id} job={job} onClose={() => setShowLoginModal(false)} />
      )}
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
