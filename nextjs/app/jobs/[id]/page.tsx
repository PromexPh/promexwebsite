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

// ── Apply Panel ───────────────────────────────────────────────────────────────
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

interface ApplyPanelProps {
  job: Job;
  candidate: CandidateProfile;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ApplyPanel({ job, candidate, token, onClose, onSuccess }: ApplyPanelProps) {
  const [method,     setMethod]     = useState<ApplyMethod>('cv');
  const [addons,     setAddons]     = useState<Set<AddonKey>>(new Set());
  const [addonVals,  setAddonVals]  = useState<Record<AddonKey, string>>({ portfolio: '', video: '', certs: '', cover: '' });
  const [cvFile,     setCvFile]     = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState(candidate.linkedin_url ?? '');
  const [formSummary, setFormSummary] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formWhy, setFormWhy]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Strength calculation
  const addonPoints = (Object.keys(addons) as AddonKey[]).reduce((s, k) => s + (addons.has(k) ? ADDON_CONFIG[k].points : 0), 0);
  const strength = Math.min(100, METHOD_BASE[method] + addonPoints);

  // Recalculate correctly using the Set's entries
  const methodBase = METHOD_BASE[method];
  let totalPoints = methodBase;
  let totalMinutes = METHOD_TIME[method];
  (Object.keys(ADDON_CONFIG) as AddonKey[]).forEach((k) => {
    if (addons.has(k)) { totalPoints += ADDON_CONFIG[k].points; totalMinutes += ADDON_CONFIG[k].minutes; }
  });
  const strengthScore = Math.min(100, totalPoints);
  const strengthColor = strengthScore >= 80 ? '#4FA3C7' : strengthScore >= 60 ? '#8CC63F' : '#E67E22';

  // suppress unused warning for strength
  void strength;

  function toggleAddon(key: AddonKey) {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function setAddonVal(key: AddonKey, val: string) {
    setAddonVals((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      let resumeUrl: string | null = candidate.resume_url ?? null;

      // Upload new CV file
      if (method === 'cv' && cvFile) {
        const ext  = cvFile.name.split('.').pop() ?? 'pdf';
        const path = `${candidate.user_id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('resumes').upload(path, cvFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);
          resumeUrl = urlData.publicUrl;
          // Update candidate profile
          await supabase.from('candidates').update({ resume_url: resumeUrl, resume_filename: cvFile.name }).eq('user_id', candidate.user_id);
        }
      }

      // Build cover letter from form method or addon
      let coverLetter: string | null = null;
      if (method === 'form') {
        const parts = [];
        if (formSummary)  parts.push(`Background: ${formSummary}`);
        if (formPosition) parts.push(`Current/last role: ${formPosition}`);
        if (formWhy)      parts.push(`Why I\'m applying: ${formWhy}`);
        coverLetter = parts.join('\n\n') || null;
      } else if (addons.has('cover') && addonVals.cover) {
        coverLetter = addonVals.cover;
      }

      // Build linkedin url
      const linkedinFinal = method === 'linkedin' ? linkedinUrl : (candidate.linkedin_url ?? null);

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          job_id: job.id,
          resume_url: resumeUrl,
          cover_letter: coverLetter,
          linkedin_url: linkedinFinal,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit application'); return; }
      setSubmitted(true);
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <>
        <div className={styles.panelBackdrop} onClick={onClose} />
        <div className={styles.applyPanel}>
          <div className={styles.panelSuccess}>
            <div className={styles.panelSuccessIcon}><i className="fa-solid fa-circle-check" aria-hidden="true" /></div>
            <h2 className={styles.panelSuccessTitle}>Application Submitted!</h2>
            <p className={styles.panelSuccessMsg}>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received.</p>
            <div className={styles.panelSuccessSteps}>
              <p className={styles.panelSuccessStepsTitle}>What happens next?</p>
              <div className={styles.panelSuccessStep}><i className="fa-solid fa-magnifying-glass" /> Promex reviews your application</div>
              <div className={styles.panelSuccessStep}><i className="fa-solid fa-envelope" /> Employer notified within 48 hrs</div>
              <div className={styles.panelSuccessStep}><i className="fa-solid fa-phone" /> Recruiter may call for screening</div>
            </div>
            <button className={styles.panelDoneBtn} onClick={onClose} type="button">Done</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.panelBackdrop} onClick={onClose} />
      <div className={styles.applyPanel}>
        {/* Close */}
        <button className={styles.panelClose} onClick={onClose} type="button" aria-label="Close">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className={styles.panelScroll}>
          {/* Section 1 — Job summary bar */}
          <div className={styles.panelJobBar}>
            <div className={styles.panelJobDot} style={{ background: industryColor(job.industry) }} />
            <div className={styles.panelJobInfo}>
              <span className={styles.panelJobTitle}>{job.title}</span>
              <span className={styles.panelJobCompany}>{job.company} · {job.country}</span>
            </div>
            <span className={styles.panelJobSalary}>{job.salary}</span>
          </div>

          {/* Section 2 — Method */}
          <div className={styles.panelSection}>
            <p className={styles.panelSectionLabel}>Choose your primary method</p>
            <div className={styles.methodGrid}>
              {/* CV Card */}
              <button
                type="button"
                className={`${styles.methodCard} ${method === 'cv' ? styles.methodCardActive : ''}`}
                onClick={() => setMethod('cv')}
                style={method === 'cv' ? { borderColor: '#4FA3C7', background: 'rgba(79,163,199,0.06)' } : {}}
              >
                <div className={styles.methodIcon} style={{ background: 'rgba(79,163,199,0.12)', color: '#4FA3C7' }}>
                  <i className="fa-solid fa-file-arrow-up" aria-hidden="true" />
                </div>
                <span className={styles.methodTitle}>Upload CV</span>
                <span className={styles.methodSub}>PDF or DOCX, up to 5MB</span>
              </button>

              {/* LinkedIn Card */}
              <button
                type="button"
                className={`${styles.methodCard} ${method === 'linkedin' ? styles.methodCardActive : ''}`}
                onClick={() => setMethod('linkedin')}
                style={method === 'linkedin' ? { borderColor: '#0077B5', background: 'rgba(0,119,181,0.06)' } : {}}
              >
                <div className={styles.methodIcon} style={{ background: 'rgba(0,119,181,0.12)', color: '#0077B5' }}>
                  <i className="fa-brands fa-linkedin" aria-hidden="true" />
                </div>
                <span className={styles.methodTitle}>LinkedIn</span>
                <span className={styles.methodSub}>Paste your profile URL</span>
              </button>

              {/* Form Card */}
              <button
                type="button"
                className={`${styles.methodCard} ${method === 'form' ? styles.methodCardActive : ''}`}
                onClick={() => setMethod('form')}
                style={method === 'form' ? { borderColor: '#6A2C91', background: 'rgba(106,44,145,0.06)' } : {}}
              >
                <div className={styles.methodIcon} style={{ background: 'rgba(106,44,145,0.12)', color: '#6A2C91' }}>
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                </div>
                <span className={styles.methodTitle}>Fill Form</span>
                <span className={styles.methodSub}>No CV? We guide you</span>
              </button>
            </div>

            {/* CV detail */}
            {method === 'cv' && (
              <div className={styles.methodDetail}>
                {candidate.resume_url && !cvFile ? (
                  <div className={styles.savedCv}>
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                    <span>{candidate.resume_filename ?? 'Saved CV'}</span>
                    <button type="button" className={styles.replaceCvBtn} onClick={() => fileInputRef.current?.click()}>Replace</button>
                  </div>
                ) : cvFile ? (
                  <div className={styles.savedCv}>
                    <i className="fa-solid fa-file-check" aria-hidden="true" />
                    <span>{cvFile.name}</span>
                    <button type="button" className={styles.replaceCvBtn} onClick={() => setCvFile(null)}>Remove</button>
                  </div>
                ) : (
                  <div className={styles.cvUploadZone} onClick={() => fileInputRef.current?.click()}>
                    <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />
                    <span>Click to upload CV</span>
                    <small>PDF or DOCX · max 5MB</small>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className={styles.hiddenInput}
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            {/* LinkedIn detail */}
            {method === 'linkedin' && (
              <div className={styles.methodDetail}>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={styles.methodInput}
                />
              </div>
            )}

            {/* Form detail */}
            {method === 'form' && (
              <div className={styles.methodDetail}>
                <div className={styles.formMethodFields}>
                  <div className={styles.formMethodField}>
                    <label>Brief background / experience summary</label>
                    <textarea rows={3} value={formSummary} onChange={(e) => setFormSummary(e.target.value)} placeholder="e.g. 5 years in healthcare as a registered nurse…" className={styles.methodTextarea} />
                  </div>
                  <div className={styles.formMethodField}>
                    <label>Current / last position</label>
                    <input type="text" value={formPosition} onChange={(e) => setFormPosition(e.target.value)} placeholder="Registered Nurse at St. Luke's Hospital" className={styles.methodInput} />
                  </div>
                  <div className={styles.formMethodField}>
                    <label>Why are you applying?</label>
                    <textarea rows={2} value={formWhy} onChange={(e) => setFormWhy(e.target.value)} placeholder="I'm excited about this opportunity because…" className={styles.methodTextarea} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3 — Optional add-ons */}
          <div className={styles.panelSection}>
            <p className={styles.panelSectionLabel}>Also add <span className={styles.panelLabelMuted}>(optional)</span></p>
            <div className={styles.addonChips}>
              {(Object.keys(ADDON_CONFIG) as AddonKey[]).map((key) => {
                const on = addons.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.addonChip} ${on ? styles.addonChipOn : ''}`}
                    onClick={() => toggleAddon(key)}
                  >
                    <i className={`fa-solid ${ADDON_CONFIG[key].icon}`} aria-hidden="true" />
                    {ADDON_CONFIG[key].label}
                    {on && <i className="fa-solid fa-check" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {/* Inline inputs for toggled add-ons */}
            {(Object.keys(ADDON_CONFIG) as AddonKey[]).filter((k) => addons.has(k)).map((key) => (
              <div key={key} className={styles.addonInput}>
                {key === 'certs' || key === 'cover' ? (
                  <textarea
                    rows={key === 'cover' ? 4 : 2}
                    value={addonVals[key]}
                    onChange={(e) => setAddonVal(key, e.target.value)}
                    placeholder={ADDON_CONFIG[key].placeholder}
                    className={styles.methodTextarea}
                  />
                ) : (
                  <input
                    type="url"
                    value={addonVals[key]}
                    onChange={(e) => setAddonVal(key, e.target.value)}
                    placeholder={ADDON_CONFIG[key].placeholder}
                    className={styles.methodInput}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Section 4 — Strength bar */}
          <div className={styles.panelSection}>
            <div className={styles.strengthHeader}>
              <span className={styles.panelSectionLabel}>Application strength</span>
              <span className={styles.strengthPct} style={{ color: strengthColor }}>{strengthScore}%</span>
            </div>
            <div className={styles.strengthTrack}>
              <div className={styles.strengthFill} style={{ width: `${strengthScore}%`, background: strengthColor }} />
            </div>
            <div className={styles.strengthPills}>
              {[
                { label: method === 'cv' ? (cvFile ? 'CV uploaded ✓' : candidate.resume_url ? 'Saved CV ✓' : 'No CV') : method === 'linkedin' ? 'LinkedIn ✓' : 'Form ✓', done: true },
                ...(Object.keys(ADDON_CONFIG) as AddonKey[]).map((k) => ({ label: ADDON_CONFIG[k].label, done: addons.has(k) })),
              ].map((pill) => (
                <span key={pill.label} className={`${styles.strengthPill} ${pill.done ? styles.strengthPillDone : ''}`}>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          {/* Section 5 — Time + Submit */}
          <div className={styles.panelSection}>
            <div className={styles.timeEstimate}>
              <i className="fa-solid fa-clock" aria-hidden="true" />
              <span>Estimated time: <strong>{totalMinutes} minute{totalMinutes !== 1 ? 's' : ''}</strong></span>
            </div>

            {error && <p className={styles.panelError}><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

            <div className={styles.panelActions}>
              <button type="button" className={styles.saveLaterBtn} onClick={onClose}>
                <i className="fa-solid fa-bookmark" aria-hidden="true" /> Save for later
              </button>
              <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Submitting…</>
                  : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit application</>
                }
              </button>
            </div>
            <p className={styles.panelTrust}>
              <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Zero placement fees · DMW accredited · Reviewed within 48 hrs
            </p>
          </div>
        </div>
      </div>
    </>
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
  const router  = useRouter();
  const { addToast, ToastContainer } = useToast();

  const [job,              setJob]              = useState<Job | null>(null);
  const [similarJobs,      setSimilarJobs]      = useState<Job[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [showPanel,        setShowPanel]        = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const t = sessionData.session.access_token;
        setToken(t);
        const userId = sessionData.session.user.id;
        const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', userId).single();
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

      {showPanel && job && candidate && (
        <ApplyPanel
          job={job}
          candidate={candidate}
          token={token}
          onClose={() => setShowPanel(false)}
          onSuccess={() => { setAlreadyApplied(true); setShowPanel(false); addToast('Application submitted! 🎉', 'success'); }}
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
