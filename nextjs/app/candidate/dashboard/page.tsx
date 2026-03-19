'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus, CandidateProfile, WorkExperience } from '@/lib/types';
import styles from './page.module.css';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; icon: string; color: string }> = {
  pending:     { label: 'Pending',     icon: 'fa-clock',            color: '#f59e0b' },
  reviewing:   { label: 'Reviewing',   icon: 'fa-magnifying-glass', color: '#3b82f6' },
  shortlisted: { label: 'Shortlisted', icon: 'fa-star',             color: '#8b5cf6' },
  rejected:    { label: 'Rejected',    icon: 'fa-xmark',            color: '#ef4444' },
  hired:       { label: 'Hired',       icon: 'fa-check',            color: '#10b981' },
};

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

function ApplicationCard({ app }: { app: Application }) {
  const status = STATUS_CONFIG[app.status];
  const job = app.job;
  return (
    <div className={styles.appCard}>
      <div className={styles.appCardTop}>
        <div>
          <h3 className={styles.appJobTitle}>{job?.title ?? 'Job removed'}</h3>
          <div className={styles.appJobCompany}>
            <i className="fa-solid fa-building" aria-hidden="true" /> {job?.company ?? '—'}
          </div>
        </div>
        <div className={styles.appStatus} style={{ '--status-color': status.color } as React.CSSProperties}>
          <i className={`fa-solid ${status.icon}`} aria-hidden="true" />
          {status.label}
        </div>
      </div>
      <div className={styles.appCardMeta}>
        {job?.country && <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>}
        {job?.salary && <span><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {job.salary}/mo</span>}
        {job?.job_type && <span><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>}
        <span><i className="fa-solid fa-calendar" aria-hidden="true" /> Applied {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      {app.cover_letter && (
        <p className={styles.appCoverLetter}>
          <i className="fa-solid fa-quote-left" aria-hidden="true" /> {app.cover_letter.slice(0, 140)}{app.cover_letter.length > 140 ? '…' : ''}
        </p>
      )}
      <div className={styles.pipeline}>
        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).slice(0, 4).map((s) => (
          <div key={s} className={`${styles.pipelineStep} ${app.status === s || (s === 'shortlisted' && app.status === 'hired') ? styles.pipelineStepActive : ''}`}>
            <div className={styles.pipelineDot} />
            <span>{STATUS_CONFIG[s].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function saveMsg(msg: string, setter: (m: string) => void) {
  setter(msg);
  setTimeout(() => setter(''), 3000);
}

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

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/candidate/register'); return; }
      const t = sessionData.session.access_token;
      const userId = sessionData.session.user.id;

      const [{ data: cand }, appsRes] = await Promise.all([
        supabase.from('candidates').select('*').eq('user_id', userId).single(),
        fetch('/api/applications', { headers: { Authorization: `Bearer ${t}` } }),
      ]);

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

      if (appsRes.ok) {
        const d = await appsRes.json();
        setApplications(d.applications ?? []);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function doSavePersonal() {
    if (!candidate) return;
    setSavingPersonal(true);
    const { error } = await supabase.from('candidates').update({
      full_name: personal.full_name,
      phone: personal.phone || null,
      date_of_birth: personal.date_of_birth || null,
      nationality: personal.nationality || null,
      current_location: personal.current_location || null,
    }).eq('user_id', candidate.user_id);
    setSavingPersonal(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setPersonalMsg);
    if (!error) setCandidate((c) => c ? { ...c, ...personal } : c);
  }

  async function doSaveProfessional() {
    if (!candidate) return;
    setSavingProfessional(true);
    const { error } = await supabase.from('candidates').update({
      desired_position: professional.desired_position || null,
      years_experience: professional.years_experience ? parseInt(professional.years_experience, 10) : null,
      education_level: professional.education_level || null,
      skills,
    }).eq('user_id', candidate.user_id);
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
    const { error } = await supabase.from('candidates').update({ work_experience: workExp }).eq('user_id', candidate.user_id);
    setSavingWork(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setWorkMsg);
    if (!error) setCandidate((c) => c ? { ...c, work_experience: workExp } : c);
  }

  async function doSaveLinkedin() {
    if (!candidate) return;
    setSavingLinkedin(true);
    const { error } = await supabase.from('candidates').update({ linkedin_url: linkedinUrl || null }).eq('user_id', candidate.user_id);
    setSavingLinkedin(false);
    saveMsg(error ? 'Failed to save.' : 'Saved!', setLinkedinMsg);
    if (!error) setCandidate((c) => c ? { ...c, linkedin_url: linkedinUrl } : c);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidate) return;
    setUploading(true);
    setUploadMsg('');
    const path = `${candidate.user_id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
    if (uploadError) {
      setUploading(false);
      setUploadMsg('Upload failed: ' + uploadError.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(path);
    const { error: updateError } = await supabase.from('candidates').update({
      resume_url: publicUrl,
      resume_filename: file.name,
      resume_uploaded_at: new Date().toISOString(),
    }).eq('user_id', candidate.user_id);
    setUploading(false);
    if (updateError) { setUploadMsg('CV uploaded but profile update failed.'); return; }
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
    pending: applications.filter((a) => a.status === 'pending').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    hired: applications.filter((a) => a.status === 'hired').length,
  };

  // Profile chips
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

  // Section complete flags
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
            <div
              className={styles.completionFill}
              style={{ width: `${completion}%`, background: completionColor(completion) }}
            />
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

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className={styles.appsSection}>
            {applications.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-inbox" aria-hidden="true" />
                <h3>No applications yet</h3>
                <p>Browse open jobs and apply to get started.</p>
                <a href="/jobs" className={styles.emptyStateBtn}>Browse Jobs →</a>
              </div>
            ) : (
              <div className={styles.appsList}>
                {applications.map((app) => <ApplicationCard key={app.id} app={app} />)}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
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
                      <i className="fa-solid fa-user" style={{ color: '#4FA3C7' }} />
                    </div>
                    <span className={styles.profileSectionTitle}>Personal Information</span>
                    {personalComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} />}
                  </div>
                  <div className={styles.profileInputGrid}>
                    <div className={styles.profileInputGroup}>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={personal.full_name}
                        onChange={(e) => setPersonal((f) => ({ ...f, full_name: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="Juan dela Cruz"
                      />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={personal.phone}
                        onChange={(e) => setPersonal((f) => ({ ...f, phone: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={personal.date_of_birth}
                        onChange={(e) => setPersonal((f) => ({ ...f, date_of_birth: e.target.value }))}
                        className={styles.profileInput}
                      />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Nationality</label>
                      <input
                        type="text"
                        value={personal.nationality}
                        onChange={(e) => setPersonal((f) => ({ ...f, nationality: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="Filipino"
                      />
                    </div>
                    <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                      <label>Current Location</label>
                      <input
                        type="text"
                        value={personal.current_location}
                        onChange={(e) => setPersonal((f) => ({ ...f, current_location: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="Manila, Philippines"
                      />
                    </div>
                  </div>
                  <div className={styles.profileCardFooter}>
                    {personalMsg && <span className={styles.savedMsg}>{personalMsg}</span>}
                    <button
                      type="button"
                      className={styles.profileSaveBtn}
                      onClick={doSavePersonal}
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Section 2 — Professional Details */}
                <div className={`${styles.profileSectionCard} ${professionalComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(140,198,63,0.12)' }}>
                      <i className="fa-solid fa-briefcase" style={{ color: '#8CC63F' }} />
                    </div>
                    <span className={styles.profileSectionTitle}>Professional Details</span>
                    {professionalComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} />}
                  </div>
                  <div className={styles.profileInputGrid}>
                    <div className={styles.profileInputGroup}>
                      <label>Desired Position</label>
                      <input
                        type="text"
                        value={professional.desired_position}
                        onChange={(e) => setProfessional((f) => ({ ...f, desired_position: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="e.g. Registered Nurse"
                      />
                    </div>
                    <div className={styles.profileInputGroup}>
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={professional.years_experience}
                        onChange={(e) => setProfessional((f) => ({ ...f, years_experience: e.target.value }))}
                        className={styles.profileInput}
                        placeholder="5"
                      />
                    </div>
                    <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                      <label>Education Level</label>
                      <select
                        value={professional.education_level}
                        onChange={(e) => setProfessional((f) => ({ ...f, education_level: e.target.value }))}
                        className={styles.profileInput}
                      >
                        {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select education level'}</option>)}
                      </select>
                    </div>
                    <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                      <label>Skills</label>
                      <div className={styles.profileSkillsRow}>
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
                          placeholder="Type a skill and press Enter"
                          className={styles.profileInput}
                        />
                        <button type="button" onClick={addSkill} className={styles.profileSkillAddBtn}>
                          <i className="fa-solid fa-plus" aria-hidden="true" />
                        </button>
                      </div>
                      {skills.length > 0 && (
                        <div className={styles.profileSkillTagsWrap}>
                          {skills.map((s) => (
                            <span key={s} className={styles.profileSkillTag}>
                              {s}
                              <button
                                type="button"
                                onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                                aria-label={`Remove ${s}`}
                                className={styles.profileSkillRemove}
                              >
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
                    <button
                      type="button"
                      className={styles.profileSaveBtn}
                      onClick={doSaveProfessional}
                      disabled={savingProfessional}
                    >
                      {savingProfessional ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Right column */}
              <div className={styles.profileGridRight}>

                {/* Section 3 — CV Upload */}
                <div className={`${styles.profileSectionCard} ${cvComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(231,76,60,0.12)' }}>
                      <i className="fa-solid fa-file-pdf" style={{ color: '#E74C3C' }} />
                    </div>
                    <span className={styles.profileSectionTitle}>CV / Resume</span>
                    {cvComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} />}
                  </div>

                  {candidate.resume_url ? (
                    <div className={styles.profileCvExisting}>
                      <i className="fa-solid fa-file-pdf" style={{ color: '#E74C3C', fontSize: '1.4rem' }} />
                      <div className={styles.profileCvInfo}>
                        <span className={styles.profileCvFilename}>{candidate.resume_filename ?? 'resume.pdf'}</span>
                        {candidate.resume_uploaded_at && (
                          <span className={styles.profileCvDate}>
                            Uploaded {new Date(candidate.resume_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className={styles.profileCvViewBtn}>
                        <i className="fa-solid fa-eye" /> View
                      </a>
                    </div>
                  ) : (
                    <p className={styles.profileCvMissing}>
                      <i className="fa-solid fa-triangle-exclamation" /> No CV uploaded yet. Upload to apply for jobs.
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
                      <><i className="fa-solid fa-spinner fa-spin" /> Uploading…</>
                    ) : (
                      <><i className="fa-solid fa-cloud-arrow-up" /> <span>Drop PDF here or <u>click to browse</u></span></>
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
                <div className={`${styles.profileSectionCard} ${linkedinComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(0,119,181,0.12)' }}>
                      <i className="fa-brands fa-linkedin" style={{ color: '#0077B5' }} />
                    </div>
                    <span className={styles.profileSectionTitle}>LinkedIn Profile</span>
                    {linkedinComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} />}
                  </div>
                  <div className={styles.profileInputGroup}>
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                      className={styles.profileInput}
                    />
                  </div>
                  <div className={styles.profileCardFooter}>
                    {linkedinMsg && <span className={styles.savedMsg}>{linkedinMsg}</span>}
                    <button
                      type="button"
                      className={styles.profileSaveBtn}
                      onClick={doSaveLinkedin}
                      disabled={savingLinkedin}
                    >
                      {savingLinkedin ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Section 5 — Work Experience */}
                <div className={`${styles.profileSectionCard} ${workComplete ? styles.profileSectionCardComplete : ''}`}>
                  <div className={styles.profileSectionHeader}>
                    <div className={styles.profileSectionIconWrap} style={{ background: 'rgba(155,89,182,0.12)' }}>
                      <i className="fa-solid fa-building-columns" style={{ color: '#9B59B6' }} />
                    </div>
                    <span className={styles.profileSectionTitle}>Work Experience</span>
                    {workComplete && <i className="fa-solid fa-circle-check" style={{ color: '#8CC63F', marginLeft: 'auto' }} />}
                    <button type="button" className={styles.profileAddExpBtn} onClick={addWorkEntry}>
                      <i className="fa-solid fa-plus" /> Add
                    </button>
                  </div>

                  {workExp.length === 0 && (
                    <p className={styles.profileNoExpMsg}>No work experience added yet. Click &quot;Add&quot; to begin.</p>
                  )}

                  {workExp.map((w) => (
                    <div key={w.id} className={styles.profileWorkCard}>
                      <div className={styles.profileWorkCardHeader}>
                        <span className={styles.profileWorkCardTitle}>{w.title || 'New Entry'}{w.company ? ` @ ${w.company}` : ''}</span>
                        <button
                          type="button"
                          className={styles.profileRemoveExpBtn}
                          onClick={() => setWorkExp((prev) => prev.filter((x) => x.id !== w.id))}
                          aria-label="Remove"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                      <div className={styles.profileInputGrid}>
                        <div className={styles.profileInputGroup}>
                          <label>Job Title</label>
                          <input
                            value={w.title}
                            onChange={(e) => updateWork(w.id, 'title', e.target.value)}
                            placeholder="e.g. Head Chef"
                            className={styles.profileInput}
                          />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>Company</label>
                          <input
                            value={w.company}
                            onChange={(e) => updateWork(w.id, 'company', e.target.value)}
                            placeholder="Company name"
                            className={styles.profileInput}
                          />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>Country</label>
                          <input
                            value={w.country}
                            onChange={(e) => updateWork(w.id, 'country', e.target.value)}
                            placeholder="Philippines"
                            className={styles.profileInput}
                          />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>Start Date</label>
                          <input
                            type="month"
                            value={w.start_date}
                            onChange={(e) => updateWork(w.id, 'start_date', e.target.value)}
                            className={styles.profileInput}
                          />
                        </div>
                        <div className={styles.profileInputGroup}>
                          <label>End Date {w.current && <span style={{ fontWeight: 400, fontSize: '0.73rem', color: '#9ca3af' }}>(current job)</span>}</label>
                          <input
                            type="month"
                            value={w.end_date}
                            disabled={w.current}
                            onChange={(e) => updateWork(w.id, 'end_date', e.target.value)}
                            className={styles.profileInput}
                          />
                        </div>
                        <div className={`${styles.profileInputGroup} ${styles.profileCurrentJobCheck}`}>
                          <label className={styles.profileCheckboxLabel}>
                            <input
                              type="checkbox"
                              checked={w.current}
                              onChange={(e) => updateWork(w.id, 'current', e.target.checked)}
                            />
                            Currently working here
                          </label>
                        </div>
                        <div className={`${styles.profileInputGroup} ${styles.profileInputFull}`}>
                          <label>Description</label>
                          <textarea
                            rows={3}
                            value={w.description}
                            onChange={(e) => updateWork(w.id, 'description', e.target.value)}
                            placeholder="Brief description of responsibilities…"
                            className={styles.profileInput}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {workExp.length > 0 && (
                    <div className={styles.profileCardFooter}>
                      {workMsg && <span className={styles.savedMsg}>{workMsg}</span>}
                      <button
                        type="button"
                        className={styles.profileSaveBtn}
                        onClick={doSaveWork}
                        disabled={savingWork}
                      >
                        {savingWork ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-primary)' }}><i className="fa-solid fa-spinner fa-spin" /></div>}>
      <CandidateDashboardInner />
    </Suspense>
  );
}
