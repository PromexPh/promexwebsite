'use client';

import { useState, useEffect, useRef, useCallback, Suspense, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus, CandidateProfile, Job, WorkExperience } from '@/lib/types';
import styles from './page.module.css';

// ─── Status badge (new pill design) ───────────────────────────────────────────
const STATUS_BADGE: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  submitted:           { label: 'Under Review',        bg: '#dbeafe', color: '#1d4ed8' },
  under_review:        { label: 'Being Reviewed',       bg: '#fef9c3', color: '#a16207' },
  shortlisted:         { label: 'Shortlisted ⭐',        bg: '#f3e8ff', color: '#7c3aed' },
  interview_scheduled: { label: 'Interview Scheduled',  bg: '#ffedd5', color: '#c2410c' },
  offer_extended:      { label: 'Offer Extended 🎉',    bg: '#dcfce7', color: '#15803d' },
  deployed:            { label: 'Deployed ✓',           bg: '#d1fae5', color: '#065f46' },
  rejected:            { label: 'Not Shortlisted',      bg: '#fee2e2', color: '#dc2626' },
  withdrawn:           { label: 'Withdrawn',            bg: '#f3f4f6', color: '#6b7280' },
};

// ─── Pipeline ─────────────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: 'submitted',           label: 'Applied'     },
  { key: 'under_review',        label: 'Review'      },
  { key: 'shortlisted',         label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interview'   },
  { key: 'offer',               label: 'Offer'       },
];

const STATUS_STEP_IDX: Partial<Record<string, number>> = {
  submitted: 0, under_review: 1, shortlisted: 2,
  interview_scheduled: 3, offer_extended: 4, deployed: 4,
};

// ─── Documents checklist ───────────────────────────────────────────────────────
const DOC_ITEMS = [
  'Valid passport (6 months validity)',
  'NBI Clearance',
  'Medical Certificate (GAMCA accredited)',
  'Employment contract signed',
  'OWWA membership',
  'Pre-departure orientation (PDOS) certificate',
  'OEC / POEA clearance',
];

function DocumentsChecklist({ appId }: { appId: string }) {
  const key = `docs_${appId}`;
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => {
    if (typeof window === 'undefined') return new Array(DOC_ITEMS.length).fill(false);
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : new Array(DOC_ITEMS.length).fill(false);
    } catch { return new Array(DOC_ITEMS.length).fill(false); }
  });

  function toggle(i: number) {
    setChecked(prev => {
      const next = [...prev];
      next[i] = !next[i];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }

  const count = checked.filter(Boolean).length;
  const allDone = count === DOC_ITEMS.length;

  return (
    <div className={styles.docsChecklist}>
      <button type="button" className={styles.docsToggle} onClick={() => setOpen(o => !o)}>
        <span className={allDone ? styles.docsAllDone : ''}>
          {allDone ? '✓ All documents ready' : `Documents Checklist — ${count}/${DOC_ITEMS.length} ready`}
        </span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.7rem' }} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.docsBody}>
          {DOC_ITEMS.map((item, i) => (
            <label key={item} className={styles.docsItem}>
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
              <span style={{ textDecoration: checked[i] ? 'line-through' : 'none', color: checked[i] ? '#9ca3af' : 'inherit' }}>
                {item}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Application Card ──────────────────────────────────────────────────────────
function ApplicationCard({ app, onWithdraw }: { app: Application; onWithdraw: (id: string) => void }) {
  const badge = STATUS_BADGE[app.status];
  const job = app.job;
  const stepIdx = STATUS_STEP_IDX[app.status] ?? -1;
  const isRejected = app.status === 'rejected';
  const isWithdrawable = app.status === 'submitted' || app.status === 'under_review';
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  function formatSalary(): string | null {
    if (!job) return null;
    if (job.salary_min && job.salary_max) {
      const cur = job.salary_currency || '$';
      return `${cur}${job.salary_min.toLocaleString()} – ${cur}${job.salary_max.toLocaleString()}/mo`;
    }
    return job.salary ? `${job.salary}/mo` : null;
  }

  const salaryDisplay = formatSalary();
  const interviewDate = (app as Application & { interview_date?: string }).interview_date;

  return (
    <div className={styles.appCard}>
      {/* Top row: job info + status badge */}
      <div className={styles.appCardTop}>
        <div className={styles.appCardInfo}>
          <h3 className={styles.appJobTitle}>{job?.title ?? 'Job removed'}</h3>
          <div className={styles.appJobMeta}>
            <span>{job?.company ?? '—'}</span>
            {job?.country && (
              <>
                <span className={styles.appMetaDot}>·</span>
                <span>{job.country}</span>
              </>
            )}
          </div>
          {salaryDisplay && (
            <div className={styles.appSalary}>
              <i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {salaryDisplay}
            </div>
          )}
        </div>
        <span className={styles.statusBadge} style={{ background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>

      {/* Applied date */}
      <div className={styles.appCardDateRow}>
        <i className="fa-solid fa-calendar-days" aria-hidden="true" />
        Applied {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      {/* Interview date card */}
      {app.status === 'interview_scheduled' && interviewDate && (
        <div className={styles.interviewCard}>
          <i className="fa-solid fa-calendar-check" aria-hidden="true" /> Interview scheduled:{' '}
          {new Date(interviewDate).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}

      {/* Pipeline */}
      {isRejected ? (
        <div className={styles.pipelineRejected}>
          <i className="fa-solid fa-xmark" aria-hidden="true" /> Application not shortlisted
        </div>
      ) : app.status !== 'withdrawn' && (
        <div className={styles.pipelineNew}>
          {PIPELINE_STEPS.map((step, i) => {
            const active = i <= stepIdx;
            const lineActive = i > 0 && i <= stepIdx;
            return (
              <Fragment key={step.key}>
                {i > 0 && (
                  <div className={`${styles.pipelineNewLine} ${lineActive ? styles.pipelineNewLineActive : ''}`} />
                )}
                <div className={styles.pipelineNewStep}>
                  <div className={`${styles.pipelineNewDot} ${active ? styles.pipelineNewDotActive : ''}`} />
                  <span className={`${styles.pipelineNewLabel} ${active ? styles.pipelineNewLabelActive : ''}`}>
                    {step.label}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}

      {/* Documents checklist */}
      <DocumentsChecklist appId={app.id} />

      {/* Withdraw */}
      {isWithdrawable && (
        <div className={styles.withdrawWrap}>
          {confirmWithdraw ? (
            <div className={styles.withdrawConfirm}>
              <span>Are you sure?</span>
              <button
                type="button"
                className={styles.withdrawConfirmBtn}
                onClick={() => { onWithdraw(app.id); setConfirmWithdraw(false); }}
              >
                Yes, withdraw
              </button>
              <button type="button" className={styles.withdrawCancelBtn} onClick={() => setConfirmWithdraw(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className={styles.withdrawLink} onClick={() => setConfirmWithdraw(true)}>
              Withdraw Application
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Job Match Suggestions ─────────────────────────────────────────────────────
function JobMatchSuggestions({ desiredPosition }: { desiredPosition?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!desiredPosition) return;
    setLoading(true);
    fetch(`/api/jobs?limit=3&q=${encodeURIComponent(desiredPosition)}`)
      .then(r => r.ok ? r.json() : { jobs: [] })
      .then(d => { setJobs((d.jobs ?? []).slice(0, 3)); setLoading(false); });
  }, [desiredPosition]);

  return (
    <div className={styles.matchSection}>
      <h3 className={styles.matchHeading}>Jobs You Might Like</h3>
      {!desiredPosition ? (
        <p className={styles.matchNoPosition}>Complete your profile to get job recommendations</p>
      ) : loading ? (
        <p className={styles.matchLoading}><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Finding matches…</p>
      ) : jobs.length === 0 ? (
        <p className={styles.matchNoPosition}>No matching jobs found right now. <a href="/jobs" style={{ color: '#4FA3C7' }}>Browse all jobs →</a></p>
      ) : (
        <>
          <p className={styles.matchSubtext}>Based on your desired position: <strong>{desiredPosition}</strong></p>
          <div className={styles.matchGrid}>
            {jobs.map(job => (
              <div key={job.id} className={styles.matchCard}>
                <div className={styles.matchCardTitle}>{job.title}</div>
                <div className={styles.matchCardMeta}>{job.company} · {job.country}</div>
                {job.salary && <div className={styles.matchCardSalary}>{job.salary}/mo</div>}
                <a href={`/jobs/${job.id}`} className={styles.matchCardBtn}>View Job →</a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Empty state with featured jobs ───────────────────────────────────────────
function EmptyStateWithJobs() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetch('/api/jobs?limit=3')
      .then(r => r.ok ? r.json() : { jobs: [] })
      .then(d => setFeaturedJobs((d.jobs ?? []).slice(0, 3)));
  }, []);

  return (
    <div className={styles.emptyStateNew}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className={styles.emptyStateSvg} aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="rgba(79,163,199,0.08)" stroke="rgba(79,163,199,0.2)" strokeWidth="2" />
        {/* Person head */}
        <circle cx="52" cy="38" r="11" fill="#4FA3C7" opacity="0.9" />
        {/* Person body */}
        <path d="M33 76c0-11 8.5-18 19-18s19 7 19 18" fill="#4FA3C7" opacity="0.7" />
        {/* Briefcase body */}
        <rect x="68" y="58" width="26" height="22" rx="3" fill="#8CC63F" opacity="0.9" />
        {/* Briefcase handle */}
        <path d="M74 58v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" fill="none" stroke="#8CC63F" strokeWidth="2.5" />
        {/* Briefcase clasp */}
        <line x1="68" y1="69" x2="94" y2="69" stroke="white" strokeWidth="1.5" />
        <line x1="81" y1="58" x2="81" y2="80" stroke="white" strokeWidth="1.5" />
      </svg>
      <h3 className={styles.emptyStateHeading}>Start your overseas journey</h3>
      <p className={styles.emptyStateSubtextNew}>Browse verified job opportunities and apply in minutes. Zero placement fees.</p>
      <a href="/jobs" className={styles.emptyStateBtnNew}>Browse Jobs →</a>
      {featuredJobs.length > 0 && (
        <>
          <p className={styles.emptyFeaturedLabel}>Featured opportunities</p>
          <div className={styles.emptyFeaturedGrid}>
            {featuredJobs.map(job => (
              <a key={job.id} href={`/jobs/${job.id}`} className={styles.emptyFeaturedCard}>
                <div className={styles.emptyFeaturedTitle}>{job.title}</div>
                <div className={styles.emptyFeaturedMeta}>{job.company} · {job.country}</div>
                {job.salary && <div className={styles.emptyFeaturedSalary}>{job.salary}/mo</div>}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Profile strength tips ─────────────────────────────────────────────────────
function ProfileStrengthTips({ candidate, onGoTo }: { candidate: CandidateProfile; onGoTo: (id: string) => void }) {
  const tips: { text: string; targetId: string }[] = [];
  if (!candidate.resume_url)
    tips.push({ text: 'Upload your CV — candidates with CVs get 3x more callbacks', targetId: 'section-cv' });
  if (!(candidate.work_experience?.length))
    tips.push({ text: 'Add work experience to stand out from other applicants', targetId: 'section-work' });
  if (!(candidate.skills?.length))
    tips.push({ text: 'Add your skills — recruiters search by skill keywords', targetId: 'section-professional' });
  if (!candidate.desired_position)
    tips.push({ text: 'Set your desired position to get job recommendations', targetId: 'section-professional' });
  if (!candidate.linkedin_url)
    tips.push({ text: 'Add your LinkedIn URL for faster profile verification', targetId: 'section-linkedin' });

  const shown = tips.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <div className={styles.tipsCard}>
      <h3 className={styles.tipsHeading}>
        <i className="fa-solid fa-lightbulb" style={{ color: '#f59e0b' }} aria-hidden="true" /> Strengthen Your Profile
      </h3>
      <div className={styles.tipsList}>
        {shown.map((tip, i) => (
          <div key={i} className={styles.tip}>
            <span className={styles.tipText}>{tip.text}</span>
            <button type="button" className={styles.tipBtn} onClick={() => onGoTo(tip.targetId)}>
              Complete →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EDUCATION_OPTIONS = ['', 'High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Vocational/Technical'];

function calcCompletion(p: CandidateProfile): number {
  let s = 0;
  if (p.full_name) s += 15;
  if (p.phone) s += 10;
  if (p.nationality && p.current_location) s += 10;
  if (p.desired_position) s += 10;
  if (p.education_level) s += 10;
  if ((p.skills?.length ?? 0) > 0) s += 10;
  if ((p.work_experience?.length ?? 0) > 0) s += 15;
  if (p.resume_url) s += 20;
  return Math.min(100, s);
}

function completionColor(pct: number): string {
  return pct < 40 ? '#E67E22' : pct < 80 ? '#8CC63F' : '#4FA3C7';
}

function completionMsg(pct: number): string {
  if (pct <= 30) return 'Complete your profile to start applying';
  if (pct <= 60) return 'Good start! Add more details to strengthen your profile';
  if (pct <= 80) return 'Almost there! Upload your CV to apply to jobs';
  return "Great profile! You're ready to apply to jobs";
}

function saveMsg(msg: string, setter: (m: string) => void) {
  setter(msg);
  setTimeout(() => setter(''), 3000);
}

// ─── Main dashboard component ─────────────────────────────────────────────────
function CandidateDashboardInner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');

  // Personal Info form
  const [personal, setPersonal] = useState({ full_name: '', phone: '', date_of_birth: '', nationality: '', current_location: '' });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalMsg, setPersonalMsg] = useState('');

  // Professional form
  const [professional, setProfessional] = useState({ desired_position: '', years_experience: '', education_level: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [savingProfessional, setSavingProfessional] = useState(false);
  const [professionalMsg, setProfessionalMsg] = useState('');

  // Work Experience
  const [workExp, setWorkExp] = useState<WorkExperience[]>([]);
  const [savingWork, setSavingWork] = useState(false);
  const [workMsg, setWorkMsg] = useState('');

  // CV Upload
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // LinkedIn
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [savingLinkedin, setSavingLinkedin] = useState(false);
  const [linkedinMsg, setLinkedinMsg] = useState('');

  // ── Fetch applications (standalone, callable anytime) ──
  const fetchApplications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/applications', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const d = await res.json();
      console.log('Applications fetched:', d.applications?.length);
      setApplications(d.applications ?? []);
    }
  }, []);

  // ── Withdraw application ──
  const withdrawApplication = useCallback(async (appId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/applications', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ application_id: appId, status: 'withdrawn' }),
    });
    if (res.ok) await fetchApplications();
  }, [fetchApplications]);

  // ── Initial load ──
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/candidate/register'); return; }
      const userId = session.user.id;

      const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', userId).single();
      if (cand) {
        const c = cand as CandidateProfile;
        setCandidate(c);
        setPersonal({
          full_name: c.full_name ?? '',
          phone: c.phone ?? '',
          date_of_birth: c.date_of_birth ?? '',
          nationality: c.nationality ?? '',
          current_location: c.current_location ?? '',
        });
        setProfessional({
          desired_position: c.desired_position ?? '',
          years_experience: c.years_experience != null ? String(c.years_experience) : '',
          education_level: c.education_level ?? '',
        });
        setSkills(c.skills ?? []);
        setWorkExp(c.work_experience ?? []);
        setLinkedinUrl(c.linkedin_url ?? '');
      }

      await fetchApplications();
      setLoading(false);
    }
    load();
  }, [router, fetchApplications]);

  // ── Profile section scroll ──
  function handleGoTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Save handlers ──
  async function doSavePersonal() {
    if (!candidate) return;
    setSavingPersonal(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingPersonal(false); saveMsg('Session expired. Please sign in again.', setPersonalMsg); return; }
    const { error } = await supabase.from('candidates').update({
      full_name: personal.full_name,
      phone: personal.phone || null,
      date_of_birth: personal.date_of_birth || null,
      nationality: personal.nationality || null,
      current_location: personal.current_location || null,
    }).eq('user_id', user.id);
    if (error) console.error('doSavePersonal error:', error.message, error.details, error.hint);
    setSavingPersonal(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setPersonalMsg);
    if (!error) setCandidate((c) => c ? { ...c, ...personal } : c);
  }

  async function doSaveProfessional() {
    if (!candidate) return;
    setSavingProfessional(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingProfessional(false); saveMsg('Session expired. Please sign in again.', setProfessionalMsg); return; }
    const { error } = await supabase.from('candidates').update({
      desired_position: professional.desired_position || null,
      years_experience: professional.years_experience ? parseInt(professional.years_experience, 10) : null,
      education_level: professional.education_level || null,
      skills,
    }).eq('user_id', user.id);
    if (error) console.error('doSaveProfessional error:', error.message, error.details, error.hint);
    setSavingProfessional(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setProfessionalMsg);
    if (!error) setCandidate((c) => c ? {
      ...c,
      desired_position: professional.desired_position,
      years_experience: professional.years_experience ? parseInt(professional.years_experience, 10) : undefined,
      education_level: professional.education_level,
      skills,
    } : c);
  }

  async function doSaveWork() {
    if (!candidate) return;
    setSavingWork(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingWork(false); saveMsg('Session expired. Please sign in again.', setWorkMsg); return; }
    const { error } = await supabase.from('candidates').update({ work_experience: workExp }).eq('user_id', user.id);
    if (error) console.error('doSaveWork error:', error.message, error.details, error.hint);
    setSavingWork(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setWorkMsg);
    if (!error) setCandidate((c) => c ? { ...c, work_experience: workExp } : c);
  }

  async function doSaveLinkedin() {
    if (!candidate) return;
    setSavingLinkedin(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingLinkedin(false); saveMsg('Session expired. Please sign in again.', setLinkedinMsg); return; }
    const { error } = await supabase.from('candidates').update({ linkedin_url: linkedinUrl || null }).eq('user_id', user.id);
    if (error) console.error('doSaveLinkedin error:', error.message, error.details, error.hint);
    setSavingLinkedin(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setLinkedinMsg);
    if (!error) setCandidate((c) => c ? { ...c, linkedin_url: linkedinUrl } : c);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidate) return;
    setUploading(true);
    setUploadMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      setUploadMsg('Session expired. Please sign in again.');
      return;
    }
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      setUploading(false);
      setUploadMsg('Upload failed: ' + uploadError.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(path);
    const { error: updateError } = await supabase.from('candidates').update({
      resume_url: publicUrl,
      resume_filename: file.name,
      resume_uploaded_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    setUploading(false);
    if (updateError) {
      console.error('Profile update error:', updateError.message, updateError.details, updateError.hint);
      setUploadMsg('CV uploaded but profile update failed: ' + updateError.message);
      return;
    }
    setCandidate((c) => c ? { ...c, resume_url: publicUrl, resume_filename: file.name, resume_uploaded_at: new Date().toISOString() } : c);
    saveMsg('CV uploaded successfully!', setUploadMsg);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput('');
  }

  function addWorkEntry() {
    setWorkExp((prev) => [{
      id: Math.random().toString(36).slice(2, 9),
      company: '', title: '', country: '', start_date: '', end_date: '', current: false, description: '',
    }, ...prev]);
  }

  function updateWork(id: string, field: keyof WorkExperience, value: string | boolean) {
    setWorkExp((prev) => prev.map((w) => w.id === id ? { ...w, [field]: value } : w));
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/candidate/register');
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const completion = candidate ? calcCompletion(candidate) : 0;
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted' || a.status === 'interview_scheduled').length,
    hired: applications.filter((a) => a.status === 'deployed' || a.status === 'offer_extended').length,
  };

  const profileChips = candidate ? [
    { label: 'Full name',  done: !!candidate.full_name },
    { label: 'Phone',      done: !!candidate.phone },
    { label: 'Location',   done: !!(candidate.nationality && candidate.current_location) },
    { label: 'Position',   done: !!candidate.desired_position },
    { label: 'Education',  done: !!candidate.education_level },
    { label: 'Skills',     done: (candidate.skills?.length ?? 0) > 0 },
    { label: 'Experience', done: (candidate.work_experience?.length ?? 0) > 0 },
    { label: 'CV upload',  done: !!candidate.resume_url },
  ] : [];

  const personalComplete = !!(personal.full_name && personal.phone && personal.nationality && personal.current_location);
  const professionalComplete = !!(professional.desired_position && professional.education_level && skills.length > 0);
  const cvComplete = !!candidate?.resume_url;
  const linkedinComplete = !!linkedinUrl;
  const workComplete = workExp.length > 0;

  return (
    <div className={styles.dashboardPage}>
      {/* Header */}
      <header className={styles.dashHeader}>
        <div className={`container ${styles.dashHeaderInner}`}>
          <div className={styles.dashHeaderLeft}>
            <div className={styles.dashAvatar}>
              {candidate?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div>
              <h1 className={styles.dashWelcome}>Welcome back, {candidate?.full_name?.split(' ')[0] ?? 'there'}!</h1>
              <p className={styles.dashSubtitle}>{candidate?.desired_position || 'Candidate Dashboard'}</p>
            </div>
          </div>
          <div className={styles.dashHeaderRight}>
            <a href="/jobs" className={styles.dashFindJobs}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Browse Jobs
            </a>
            <button onClick={signOut} className={styles.dashSignOut} type="button">
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Profile Completion */}
        <div className={styles.completionWrap}>
          <div className={styles.completionHeader}>
            <span className={styles.completionLabel}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" /> Profile Completion
            </span>
            <span className={styles.completionPct} style={{ color: completionColor(completion) }}>{completion}%</span>
          </div>
          <div className={styles.completionTrack}>
            <div className={styles.completionFill} style={{ width: `${completion}%`, background: completionColor(completion) }} />
          </div>
          <p className={styles.completionHint}>{completionMsg(completion)}</p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            { icon: 'fa-file-lines', bg: 'rgba(79,163,199,0.1)', color: 'var(--color-primary)', num: stats.total, label: 'Total Applications' },
            { icon: 'fa-clock', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', num: stats.pending, label: 'Pending Review' },
            { icon: 'fa-star', bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', num: stats.shortlisted, label: 'Shortlisted' },
            { icon: 'fa-check-double', bg: 'rgba(16,185,129,0.1)', color: '#10b981', num: stats.hired, label: 'Hired' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
                <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
              </div>
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${activeTab === 'applications' ? styles.tabActive : ''}`} onClick={() => setActiveTab('applications')}>
            <i className="fa-solid fa-file-lines" aria-hidden="true" /> My Applications
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fa-solid fa-user-pen" aria-hidden="true" /> Edit Profile
          </button>
        </div>

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div className={styles.appsSection}>
            {applications.length === 0 ? (
              <EmptyStateWithJobs />
            ) : (
              <div className={styles.appsList}>
                {applications.map((app) => (
                  <ApplicationCard key={app.id} app={app} onWithdraw={withdrawApplication} />
                ))}
              </div>
            )}

            {/* Job match suggestions — shown when candidate has a desired position */}
            {applications.length > 0 && candidate && (
              <JobMatchSuggestions desiredPosition={candidate.desired_position} />
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && candidate && (
          <div className={styles.profileTabWrap}>

            {/* Profile completion card */}
            <div className={styles.profileCompletionCard}>
              <div className={styles.profileCompletionHeader}>
                <span className={styles.profileCompletionLabel}>PROFILE COMPLETION</span>
                <span className={styles.profileCompletionPct} style={{ color: completionColor(completion) }}>
                  {completion}%
                </span>
              </div>
              <div className={styles.profileCompletionTrack}>
                <div className={styles.profileCompletionFill} style={{ width: `${completion}%`, background: completionColor(completion) }} />
              </div>
              <div className={styles.profileChips}>
                {profileChips.map(chip => (
                  <span key={chip.label} className={chip.done ? styles.profileChipDone : styles.profileChipTodo}>
                    {chip.label}{chip.done ? ' ✓' : ''}
                  </span>
                ))}
              </div>
              <p className={styles.profileCompletionMsg}>{completionMsg(completion)}</p>
            </div>

            {/* Two-column grid */}
            <div className={styles.profileGrid}>
              {/* Left column */}
              <div className={styles.profileGridLeft}>

                {/* Section 1 — Personal Info */}
                <div className={`${styles.profileSectionCard} ${personalComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(79,163,199,0.12)' }}>
                      <i className="fa-solid fa-user" style={{ color: '#4FA3C7' }} aria-hidden="true" />
                    </div>
                    <span className={styles.profileSectionTitle}>Personal Information</span>
                    {personalComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} aria-hidden="true" />}
                  </div>
                  <div className={styles.profileInputGrid}>
                    <div className={styles.profileInputGroup}>
                      <label>Full Name *</label>
                      <input type="text" value={personal.full_name} onChange={(e) => setPersonal((f) => ({ ...f, full_name: e.target.value }))} className={styles.profileInput} placeholder="Juan dela Cruz" />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Phone</label>
                      <input type="tel" value={personal.phone} onChange={(e) => setPersonal((f) => ({ ...f, phone: e.target.value }))} className={styles.profileInput} placeholder="+63 912 345 6789" />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Date of Birth</label>
                      <input type="date" value={personal.date_of_birth} onChange={(e) => setPersonal((f) => ({ ...f, date_of_birth: e.target.value }))} className={styles.profileInput} />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Nationality</label>
                      <input type="text" value={personal.nationality} onChange={(e) => setPersonal((f) => ({ ...f, nationality: e.target.value }))} className={styles.profileInput} placeholder="Filipino" />
                    </div>
                    <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                      <label>Current Location</label>
                      <input type="text" value={personal.current_location} onChange={(e) => setPersonal((f) => ({ ...f, current_location: e.target.value }))} className={styles.profileInput} placeholder="Manila, Philippines" />
                    </div>
                  </div>
                  <div className={styles.profileCardFooter}>
                    {personalMsg && <span className={styles.savedMsg}>{personalMsg}</span>}
                    <button type="button" className={styles.profileSaveBtn} onClick={doSavePersonal} disabled={savingPersonal}>
                      {savingPersonal ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Saving…</> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Section 2 — Professional Details */}
                <div id="section-professional" className={`${styles.profileSectionCard} ${professionalComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(140,198,63,0.12)' }}>
                      <i className="fa-solid fa-briefcase" style={{ color: '#8CC63F' }} aria-hidden="true" />
                    </div>
                    <span className={styles.profileSectionTitle}>Professional Details</span>
                    {professionalComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} aria-hidden="true" />}
                  </div>
                  <div className={styles.profileInputGrid}>
                    <div className={styles.profileInputGroup}>
                      <label>Desired Position</label>
                      <input type="text" value={professional.desired_position} onChange={(e) => setProfessional((f) => ({ ...f, desired_position: e.target.value }))} className={styles.profileInput} placeholder="e.g. Registered Nurse" />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Years of Experience</label>
                      <input type="number" min="0" max="50" value={professional.years_experience} onChange={(e) => setProfessional((f) => ({ ...f, years_experience: e.target.value }))} className={styles.profileInput} placeholder="5" />
                    </div>
                    <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                      <label>Education Level</label>
                      <select value={professional.education_level} onChange={(e) => setProfessional((f) => ({ ...f, education_level: e.target.value }))} className={styles.profileInput}>
                        {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select education level'}</option>)}
                      </select>
                    </div>
                    <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                      <label>Skills</label>
                      <div className={styles.profileSkillsRow}>
                        <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }} placeholder="Type a skill and press Enter" className={styles.profileInput} />
                        <button type="button" onClick={addSkill} className={styles.profileSkillAddBtn}>
                          <i className="fa-solid fa-plus" aria-hidden="true" />
                        </button>
                      </div>
                      {skills.length > 0 && (
                        <div className={styles.profileSkillTagsWrap}>
                          {skills.map((s) => (
                            <span key={s} className={styles.profileSkillTag}>
                              {s}
                              <button type="button" onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} aria-label={`Remove ${s}`} className={styles.profileSkillRemove}>
                                <i className="fa-solid fa-xmark" aria-hidden="true" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.profileCardFooter}>
                    {professionalMsg && <span className={styles.savedMsg}>{professionalMsg}</span>}
                    <button type="button" className={styles.profileSaveBtn} onClick={doSaveProfessional} disabled={savingProfessional}>
                      {savingProfessional ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Saving…</> : 'Save'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Right column */}
              <div className={styles.profileGridRight}>

                {/* Section 3 — CV Upload */}
                <div id="section-cv" className={`${styles.profileSectionCard} ${cvComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(231,76,60,0.12)' }}>
                      <i className="fa-solid fa-file-pdf" style={{ color: '#E74C3C' }} aria-hidden="true" />
                    </div>
                    <span className={styles.profileSectionTitle}>CV / Resume</span>
                    {cvComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} aria-hidden="true" />}
                  </div>

                  {candidate.resume_url ? (
                    <div className={styles.profileCvExisting}>
                      <i className="fa-solid fa-file-pdf" style={{ color: '#E74C3C', fontSize: '1.4rem' }} aria-hidden="true" />
                      <div className={styles.profileCvInfo}>
                        <span className={styles.profileCvFilename}>{candidate.resume_filename ?? 'resume.pdf'}</span>
                        {candidate.resume_uploaded_at && (
                          <span className={styles.profileCvDate}>
                            Uploaded {new Date(candidate.resume_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className={styles.profileCvViewBtn}>
                        <i className="fa-solid fa-eye" aria-hidden="true" /> View
                      </a>
                    </div>
                  ) : (
                    <p className={styles.profileCvMissing}>
                      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> No CV uploaded yet. Upload to apply for jobs.
                    </p>
                  )}

                  <div
                    className={styles.profileCvZone}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleFileChange({ target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                  >
                    {uploading ? (
                      <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Uploading…</>
                    ) : (
                      <><i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> <span>Drop PDF here or <u>click to browse</u></span></>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />
                  {uploadMsg && (
                    <p className={`${styles.savedMsg} ${uploadMsg.includes('failed') || uploadMsg.includes('Failed') ? styles.savedMsgError : ''}`}>
                      {uploadMsg}
                    </p>
                  )}
                </div>

                {/* Section 4 — LinkedIn */}
                <div id="section-linkedin" className={`${styles.profileSectionCard} ${linkedinComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(0,119,181,0.12)' }}>
                      <i className="fa-brands fa-linkedin" style={{ color: '#0077B5' }} aria-hidden="true" />
                    </div>
                    <span className={styles.profileSectionTitle}>LinkedIn Profile</span>
                    {linkedinComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} aria-hidden="true" />}
                  </div>
                  <div className={styles.profileInputGroup}>
                    <label>LinkedIn URL</label>
                    <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/your-profile" className={styles.profileInput} />
                  </div>
                  <div className={styles.profileCardFooter}>
                    {linkedinMsg && <span className={styles.savedMsg}>{linkedinMsg}</span>}
                    <button type="button" className={styles.profileSaveBtn} onClick={doSaveLinkedin} disabled={savingLinkedin}>
                      {savingLinkedin ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Saving…</> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Section 5 — Work Experience */}
                <div id="section-work" className={`${styles.profileSectionCard} ${workComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(155,89,182,0.12)' }}>
                      <i className="fa-solid fa-building-columns" style={{ color: '#9B59B6' }} aria-hidden="true" />
                    </div>
                    <span className={styles.profileSectionTitle}>Work Experience</span>
                    {workComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} aria-hidden="true" />}
                    <button type="button" className={styles.profileAddExpBtn} onClick={addWorkEntry}>
                      <i className="fa-solid fa-plus" aria-hidden="true" /> Add
                    </button>
                  </div>

                  {workExp.length === 0 && (
                    <p className={styles.profileNoExpMsg}>No work experience added yet. Click &quot;Add&quot; to begin.</p>
                  )}

                  {workExp.map((w) => (
                    <div key={w.id} className={styles.profileWorkCard}>
                      <div className={styles.profileWorkCardHeader}>
                        <span className={styles.profileWorkCardTitle}>{w.title || 'New Entry'}{w.company ? ` @ ${w.company}` : ''}</span>
                        <button type="button" className={styles.profileRemoveExpBtn} onClick={() => setWorkExp((prev) => prev.filter((x) => x.id !== w.id))} aria-label="Remove">
                          <i className="fa-solid fa-trash" aria-hidden="true" />
                        </button>
                      </div>
                      <div className={styles.profileInputGrid}>
                        <div className={styles.profileInputGroup}>
                          <label>Job Title</label>
                          <input value={w.title} onChange={(e) => updateWork(w.id, 'title', e.target.value)} placeholder="e.g. Head Chef" className={styles.profileInput} />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>Company</label>
                          <input value={w.company} onChange={(e) => updateWork(w.id, 'company', e.target.value)} placeholder="Company name" className={styles.profileInput} />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>Country</label>
                          <input value={w.country} onChange={(e) => updateWork(w.id, 'country', e.target.value)} placeholder="Philippines" className={styles.profileInput} />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>Start Date</label>
                          <input type="month" value={w.start_date} onChange={(e) => updateWork(w.id, 'start_date', e.target.value)} className={styles.profileInput} />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>End Date {w.current && <span style={{ fontWeight: 400, fontSize: '0.73rem', color: '#9ca3af' }}>(current job)</span>}</label>
                          <input type="month" value={w.end_date} disabled={w.current} onChange={(e) => updateWork(w.id, 'end_date', e.target.value)} className={styles.profileInput} />
                        </div>
                        <div className={`${styles.profileInputGroup} ${styles.profileCurrentJobCheck}`}>
                          <label className={styles.profileCheckboxLabel}>
                            <input type="checkbox" checked={w.current} onChange={(e) => updateWork(w.id, 'current', e.target.checked)} />
                            Currently working here
                          </label>
                        </div>
                        <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                          <label>Description</label>
                          <textarea rows={3} value={w.description} onChange={(e) => updateWork(w.id, 'description', e.target.value)} placeholder="Brief description of responsibilities…" className={styles.profileInput} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {workExp.length > 0 && (
                    <div className={styles.profileCardFooter}>
                      {workMsg && <span className={styles.savedMsg}>{workMsg}</span>}
                      <button type="button" className={styles.profileSaveBtn} onClick={doSaveWork} disabled={savingWork}>
                        {savingWork ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Saving…</> : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Profile Strength Tips */}
            <ProfileStrengthTips candidate={candidate} onGoTo={handleGoTo} />

          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-primary)' }}><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /></div>}>
      <CandidateDashboardInner />
    </Suspense>
  );
}
