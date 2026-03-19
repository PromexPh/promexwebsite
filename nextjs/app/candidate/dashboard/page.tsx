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

const EDUCATION_OPTIONS = ['', 'High School', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'Doctorate (PhD)', 'Vocational/Technical', 'Other'];

function calcCompletion(p: CandidateProfile): number {
  const checks = [
    !!p.full_name,
    !!p.phone,
    !!p.nationality,
    !!p.current_location,
    !!p.date_of_birth,
    !!p.desired_position,
    p.years_experience != null,
    !!p.education_level,
    (p.skills?.length ?? 0) > 0,
    (p.work_experience?.length ?? 0) > 0,
    !!p.resume_url,
    !!p.linkedin_url,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
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
            <span className={styles.completionPct}>{completion}%</span>
          </div>
          <div className={styles.completionTrack}>
            <div
              className={styles.completionFill}
              style={{ width: `${completion}%`, background: completion >= 80 ? '#10b981' : completion >= 50 ? 'var(--portal-gold)' : '#ef4444' }}
            />
          </div>
          {completion < 100 && (
            <p className={styles.completionHint}>
              {completion < 50 ? 'Complete your profile to start applying.' : 'Almost there! Fill in the remaining sections.'}
            </p>
          )}
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
        {activeTab === 'profile' && (
          <div className={styles.profileSections}>

            {/* ── Section 1: Personal Info ── */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}><i className="fa-solid fa-user" aria-hidden="true" /> Personal Information</h2>
              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name <span className={styles.req}>*</span></label>
                    <input value={personal.full_name} onChange={(e) => setPersonal((f) => ({ ...f, full_name: e.target.value }))} placeholder="Juan dela Cruz" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input value={personal.phone} onChange={(e) => setPersonal((f) => ({ ...f, phone: e.target.value }))} placeholder="+63 912 345 6789" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date of Birth</label>
                    <input type="date" value={personal.date_of_birth} onChange={(e) => setPersonal((f) => ({ ...f, date_of_birth: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nationality</label>
                    <input value={personal.nationality} onChange={(e) => setPersonal((f) => ({ ...f, nationality: e.target.value }))} placeholder="Filipino" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Current Location</label>
                  <input value={personal.current_location} onChange={(e) => setPersonal((f) => ({ ...f, current_location: e.target.value }))} placeholder="Manila, Philippines" />
                </div>
                <div className={styles.sectionActions}>
                  <button type="button" className={styles.saveBtn} onClick={doSavePersonal} disabled={savingPersonal}>
                    {savingPersonal ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Personal Info</>}
                  </button>
                  {personalMsg && <span className={`${styles.saveMsg} ${personalMsg.includes('Failed') ? styles.saveMsgError : ''}`}>{personalMsg}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 2: Professional ── */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}><i className="fa-solid fa-briefcase" aria-hidden="true" /> Professional Details</h2>
              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Desired Position</label>
                    <input value={professional.desired_position} onChange={(e) => setProfessional((f) => ({ ...f, desired_position: e.target.value }))} placeholder="e.g. Registered Nurse" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Years of Experience</label>
                    <input type="number" min="0" max="50" value={professional.years_experience} onChange={(e) => setProfessional((f) => ({ ...f, years_experience: e.target.value }))} placeholder="5" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Education Level</label>
                  <select value={professional.education_level} onChange={(e) => setProfessional((f) => ({ ...f, education_level: e.target.value }))}>
                    {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select education level'}</option>)}
                  </select>
                </div>
                {/* Skills Tags */}
                <div className={styles.formGroup}>
                  <label>Skills</label>
                  <div className={styles.skillsInput}>
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
                      placeholder="Type a skill and press Enter"
                    />
                    <button type="button" onClick={addSkill} className={styles.skillAddBtn}>
                      <i className="fa-solid fa-plus" aria-hidden="true" />
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className={styles.skillTags}>
                      {skills.map((s) => (
                        <span key={s} className={styles.skillTag}>
                          {s}
                          <button type="button" onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                            <i className="fa-solid fa-xmark" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.sectionActions}>
                  <button type="button" className={styles.saveBtn} onClick={doSaveProfessional} disabled={savingProfessional}>
                    {savingProfessional ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Professional Info</>}
                  </button>
                  {professionalMsg && <span className={`${styles.saveMsg} ${professionalMsg.includes('Failed') ? styles.saveMsgError : ''}`}>{professionalMsg}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 3: Work Experience ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitleRow}>
                <h2 className={styles.sectionTitle}><i className="fa-solid fa-building-columns" aria-hidden="true" /> Work Experience</h2>
                <button type="button" className={styles.addExpBtn} onClick={addWorkEntry}>
                  <i className="fa-solid fa-plus" aria-hidden="true" /> Add Entry
                </button>
              </div>
              <div className={styles.profileForm}>
                {workExp.length === 0 && (
                  <p className={styles.noExpMsg}>No work experience added yet. Click &quot;Add Entry&quot; to begin.</p>
                )}
                {workExp.map((w) => (
                  <div key={w.id} className={styles.workCard}>
                    <div className={styles.workCardHeader}>
                      <span className={styles.workCardTitle}>{w.title || 'New Entry'}{w.company ? ` @ ${w.company}` : ''}</span>
                      <button type="button" className={styles.removeExpBtn} onClick={() => setWorkExp((prev) => prev.filter((x) => x.id !== w.id))} aria-label="Remove">
                        <i className="fa-solid fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Job Title</label>
                        <input value={w.title} onChange={(e) => updateWork(w.id, 'title', e.target.value)} placeholder="e.g. Head Chef" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Company</label>
                        <input value={w.company} onChange={(e) => updateWork(w.id, 'company', e.target.value)} placeholder="Company name" />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Country</label>
                        <input value={w.country} onChange={(e) => updateWork(w.id, 'country', e.target.value)} placeholder="Philippines" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Start Date</label>
                        <input type="month" value={w.start_date} onChange={(e) => updateWork(w.id, 'start_date', e.target.value)} />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>End Date {w.current && <span className={styles.optional}>(current job)</span>}</label>
                        <input type="month" value={w.end_date} disabled={w.current} onChange={(e) => updateWork(w.id, 'end_date', e.target.value)} />
                      </div>
                      <div className={`${styles.formGroup} ${styles.currentJobCheck}`}>
                        <label className={styles.checkboxLabel}>
                          <input type="checkbox" checked={w.current} onChange={(e) => updateWork(w.id, 'current', e.target.checked)} />
                          Currently working here
                        </label>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Description</label>
                      <textarea rows={3} value={w.description} onChange={(e) => updateWork(w.id, 'description', e.target.value)} placeholder="Brief description of responsibilities…" />
                    </div>
                  </div>
                ))}
                {workExp.length > 0 && (
                  <div className={styles.sectionActions}>
                    <button type="button" className={styles.saveBtn} onClick={doSaveWork} disabled={savingWork}>
                      {savingWork ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Work Experience</>}
                    </button>
                    {workMsg && <span className={`${styles.saveMsg} ${workMsg.includes('Failed') ? styles.saveMsgError : ''}`}>{workMsg}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 4: CV Upload ── */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}><i className="fa-solid fa-file-pdf" aria-hidden="true" /> CV / Resume</h2>
              <div className={styles.profileForm}>
                {candidate?.resume_url ? (
                  <div className={styles.cvCurrentRow}>
                    <div className={styles.cvCurrentInfo}>
                      <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                      <div>
                        <div className={styles.cvFilename}>{candidate.resume_filename ?? 'resume.pdf'}</div>
                        {candidate.resume_uploaded_at && (
                          <div className={styles.cvUploadedAt}>Uploaded {new Date(candidate.resume_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        )}
                      </div>
                    </div>
                    <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className={styles.cvViewBtn}>
                      <i className="fa-solid fa-eye" aria-hidden="true" /> View
                    </a>
                  </div>
                ) : (
                  <p className={styles.noCvMsg}><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> No CV uploaded yet. Upload your CV to apply for jobs.</p>
                )}

                <div
                  className={styles.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileChange({ target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>); }}
                >
                  {uploading ? (
                    <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Uploading…</>
                  ) : (
                    <><i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> <span>Drop PDF here or <u>click to browse</u></span></>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className={styles.fileInputHidden} onChange={handleFileChange} disabled={uploading} />
                {uploadMsg && (
                  <p className={`${styles.saveMsg} ${uploadMsg.includes('failed') || uploadMsg.includes('Failed') ? styles.saveMsgError : ''}`}>
                    {uploadMsg}
                  </p>
                )}
              </div>
            </div>

            {/* ── Section 5: LinkedIn ── */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}><i className="fa-brands fa-linkedin" aria-hidden="true" /> LinkedIn Profile</h2>
              <div className={styles.profileForm}>
                <div className={styles.formGroup}>
                  <label>LinkedIn URL</label>
                  <input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    type="url"
                  />
                </div>
                <div className={styles.sectionActions}>
                  <button type="button" className={styles.saveBtn} onClick={doSaveLinkedin} disabled={savingLinkedin}>
                    {savingLinkedin ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save LinkedIn</>}
                  </button>
                  {linkedinMsg && <span className={`${styles.saveMsg} ${linkedinMsg.includes('Failed') ? styles.saveMsgError : ''}`}>{linkedinMsg}</span>}
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
