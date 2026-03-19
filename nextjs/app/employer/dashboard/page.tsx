'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Job, Application, EmployerProfile, ApplicationStatus } from '@/lib/types';
import styles from './page.module.css';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: '#f59e0b',
  reviewing: '#3b82f6',
  shortlisted: '#8b5cf6',
  rejected: '#ef4444',
  hired: '#10b981',
};

const INDUSTRIES = ['Hospitality', 'Healthcare', 'Engineering', 'IT & Technology', 'Construction', 'Retail', 'Finance', 'Manufacturing', 'Transportation', 'Other'];
const COUNTRIES  = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'Taiwan', 'Malaysia', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'United States', 'Other'];

function PipelineBar({ apps }: { apps: Application[] }) {
  if (apps.length === 0) return <div className={styles.noApps}>No applicants yet</div>;
  const statuses: ApplicationStatus[] = ['pending', 'reviewing', 'shortlisted', 'hired', 'rejected'];
  return (
    <div className={styles.pipelineBar}>
      {statuses.map((s) => {
        const count = apps.filter((a) => a.status === s).length;
        if (count === 0) return null;
        return (
          <div
            key={s}
            className={styles.pipelineSegment}
            style={{ flex: count, background: STATUS_COLORS[s] }}
            title={`${STATUS_LABELS[s]}: ${count}`}
          >
            <span className={styles.pipelineSegLabel}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function exportCSV(apps: Application[], jobTitle: string) {
  const headers = ['Name', 'Email', 'Phone', 'Position', 'Status', 'Applied Date'];
  const rows = apps.map((a) => [
    a.candidate?.full_name ?? '',
    a.candidate?.email ?? '',
    (a.candidate as unknown as { phone?: string })?.phone ?? '',
    a.job?.title ?? jobTitle,
    STATUS_LABELS[a.status],
    new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applicants_${jobTitle.replace(/\s+/g, '_').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Tab = 'overview' | 'jobs' | 'applicants' | 'profile';

function EmployerDashboardInner() {
  const router = useRouter();
  const [employer, setEmployer]           = useState<EmployerProfile | null>(null);
  const [jobs, setJobs]                   = useState<Job[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob]     = useState<Job | null>(null);
  const [loading, setLoading]             = useState(true);
  const [token, setToken]                 = useState('');
  const [activeTab, setActiveTab]         = useState<Tab>('overview');
  const [updatingApp, setUpdatingApp]     = useState<string | null>(null);

  // Company profile form state
  const [profileForm, setProfileForm] = useState({
    company_name: '', industry: '', country: '', phone: '', website: '', description: '',
    contact_person: '', contact_job_title: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved]   = useState(false);

  const getJobApps = useCallback((jobId: string) => allApplications.filter((a) => a.job_id === jobId), [allApplications]);
  const selectedApps = selectedJob ? getJobApps(selectedJob.id) : [];

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/employer/register'); return; }
      const t = sessionData.session.access_token;
      setToken(t);
      const userId = sessionData.session.user.id;

      const { data: emp } = await supabase.from('employers').select('*').eq('user_id', userId).single();
      if (!emp) { router.push('/employer/register'); return; }
      const e = emp as EmployerProfile;
      setEmployer(e);
      setProfileForm({
        company_name:      e.company_name      ?? '',
        industry:          e.industry          ?? '',
        country:           e.country           ?? '',
        phone:             e.phone             ?? '',
        website:           e.website           ?? '',
        description:       e.description       ?? '',
        contact_person:    e.contact_person    ?? '',
        contact_job_title: e.contact_job_title ?? '',
      });

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', userId)
        .order('created_at', { ascending: false });
      setJobs((jobsData as Job[]) ?? []);

      const appsRes = await fetch('/api/applications', { headers: { Authorization: `Bearer ${t}` } });
      if (appsRes.ok) {
        const d = await appsRes.json();
        setAllApplications(d.applications ?? []);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function updateStatus(appId: string, status: ApplicationStatus) {
    setUpdatingApp(appId);
    const res = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ application_id: appId, status }),
    });
    if (res.ok) {
      setAllApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    }
    setUpdatingApp(null);
  }

  async function toggleJobStatus(job: Job) {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setJobs((prev) => prev.map((j) => j.id === job.id ? data.job : j));
    }
  }

  async function saveProfile() {
    if (!employer) return;
    setProfileSaving(true);
    const { data: updated } = await supabase
      .from('employers')
      .update(profileForm)
      .eq('id', employer.id)
      .select()
      .single();
    if (updated) {
      setEmployer(updated as EmployerProfile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setProfileSaving(false);
  }

  function selectJob(job: Job) {
    setSelectedJob(job);
    setActiveTab('applicants');
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/employer/register');
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const isVerified    = employer?.is_verified === true;
  const activeJobs    = jobs.filter((j) => j.status === 'active').length;
  const draftJobs     = jobs.filter((j) => j.status === 'draft').length;
  const totalApplicants = allApplications.length;
  const hiredCount    = allApplications.filter((a) => a.status === 'hired').length;

  return (
    <div className={styles.dashboardPage}>
      {/* Verification Banner */}
      {!isVerified && (
        <div className={styles.verifyBanner}>
          <i className="fa-solid fa-clock" aria-hidden="true" />
          <div>
            <strong>Account Pending Verification</strong>
            <span>Your account is under review. Jobs you post will be saved as drafts and published once your account is approved (1–2 business days).</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.dashHeader}>
        <div className={`container ${styles.dashHeaderInner}`}>
          <div className={styles.dashHeaderLeft}>
            <div className={styles.dashAvatar}>
              <i className="fa-solid fa-building" aria-hidden="true" />
            </div>
            <div>
              <div className={styles.dashNameRow}>
                <h1 className={styles.dashWelcome}>{employer?.company_name ?? 'Employer Dashboard'}</h1>
                {isVerified && (
                  <span className={styles.verifiedBadge}>
                    <i className="fa-solid fa-circle-check" aria-hidden="true" /> Verified Partner
                  </span>
                )}
              </div>
              <p className={styles.dashSubtitle}>{employer?.industry ?? employer?.email}</p>
            </div>
          </div>
          <div className={styles.dashHeaderRight}>
            <a href="/employer/post-job" className={styles.dashPostJob}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> Post a Job
            </a>
            <button onClick={signOut} className={styles.dashSignOut} type="button">
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            { icon: 'fa-briefcase',    bg: 'rgba(79,163,199,0.1)',  color: 'var(--color-primary)', num: jobs.length,       label: 'Total Jobs Posted' },
            { icon: 'fa-circle-check', bg: 'rgba(16,185,129,0.1)',  color: '#10b981',              num: activeJobs,         label: 'Active Listings' },
            { icon: 'fa-users',        bg: 'rgba(200,168,75,0.1)',  color: '#c8a84b',              num: totalApplicants,    label: 'Total Applicants' },
            { icon: 'fa-handshake',    bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6',              num: hiredCount,         label: 'Hired' },
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
          {(['overview', 'jobs', 'applicants', 'profile'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              <i className={`fa-solid ${t === 'overview' ? 'fa-gauge' : t === 'jobs' ? 'fa-briefcase' : t === 'applicants' ? 'fa-users' : 'fa-building'}`} aria-hidden="true" />
              {t === 'overview' ? 'Overview' : t === 'jobs' ? `My Jobs${draftJobs > 0 ? ` (${draftJobs} draft)` : ''}` : t === 'applicants' ? 'Applicants' : 'Company Profile'}
              {t === 'applicants' && selectedJob && (
                <span className={styles.tabBadge}>{selectedJob.title}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overviewSection}>
            <div className={styles.quickActions}>
              <h2 className={styles.quickActionsTitle}><i className="fa-solid fa-bolt" aria-hidden="true" /> Quick Actions</h2>
              <div className={styles.quickActionBtns}>
                <a href="/employer/post-job" className={styles.qaBtn}>
                  <i className="fa-solid fa-plus-circle" aria-hidden="true" />
                  <span>Post New Job</span>
                </a>
                <button type="button" className={styles.qaBtn} onClick={() => setActiveTab('applicants')}>
                  <i className="fa-solid fa-users" aria-hidden="true" />
                  <span>View Applicants</span>
                </button>
                <button type="button" className={styles.qaBtn} onClick={() => setActiveTab('profile')}>
                  <i className="fa-solid fa-building" aria-hidden="true" />
                  <span>Edit Profile</span>
                </button>
                {selectedJob && selectedApps.length > 0 && (
                  <button type="button" className={`${styles.qaBtn} ${styles.qaBtnGold}`} onClick={() => exportCSV(selectedApps, selectedJob.title)}>
                    <i className="fa-solid fa-file-csv" aria-hidden="true" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recent jobs preview */}
            <h2 className={styles.sectionHeading}>Recent Job Postings</h2>
            {jobs.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-briefcase" aria-hidden="true" />
                <h3>No jobs posted yet</h3>
                <p>Post your first job to start receiving applications.</p>
                <a href="/employer/post-job" className={styles.emptyStateBtn}>Post a Job →</a>
              </div>
            ) : (
              <div className={styles.jobsList}>
                {jobs.slice(0, 3).map((job) => {
                  const jobApps = getJobApps(job.id);
                  return (
                    <div key={job.id} className={styles.jobRow}>
                      <div className={styles.jobRowMain}>
                        <div className={styles.jobRowLeft}>
                          <h3 className={styles.jobRowTitle}>{job.title}</h3>
                          <div className={styles.jobRowMeta}>
                            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                            <span><i className="fa-solid fa-briefcase" aria-hidden="true" /> {job.industry}</span>
                          </div>
                        </div>
                        <div className={styles.jobRowRight}>
                          <span className={`${styles.jobStatusBadge} ${styles[`status_${job.status}`]}`}>
                            {job.status}
                          </span>
                          <button type="button" className={styles.viewAppsBtn} onClick={() => selectJob(job)}>
                            <i className="fa-solid fa-users" aria-hidden="true" /> {jobApps.length}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {jobs.length > 3 && (
                  <button type="button" className={styles.seeAllBtn} onClick={() => setActiveTab('jobs')}>
                    See all {jobs.length} jobs →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className={styles.jobsSection}>
            {jobs.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-briefcase" aria-hidden="true" />
                <h3>No jobs posted yet</h3>
                <p>Post your first job to start receiving applications.</p>
                <a href="/employer/post-job" className={styles.emptyStateBtn}>Post a Job →</a>
              </div>
            ) : (
              <div className={styles.jobsList}>
                {jobs.map((job) => {
                  const jobApps = getJobApps(job.id);
                  return (
                    <div key={job.id} className={styles.jobRow}>
                      <div className={styles.jobRowMain}>
                        <div className={styles.jobRowLeft}>
                          <h3 className={styles.jobRowTitle}>{job.title}</h3>
                          <div className={styles.jobRowMeta}>
                            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                            <span><i className="fa-solid fa-briefcase" aria-hidden="true" /> {job.industry}</span>
                            <span><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
                            <span><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {job.salary}</span>
                          </div>
                        </div>
                        <div className={styles.jobRowRight}>
                          <span className={`${styles.jobStatusBadge} ${styles[`status_${job.status}`]}`}>
                            {job.status === 'draft' ? '⏳ Draft' : job.status}
                          </span>
                          <button type="button" className={styles.viewAppsBtn} onClick={() => selectJob(job)}>
                            <i className="fa-solid fa-users" aria-hidden="true" /> {jobApps.length} Applicant{jobApps.length !== 1 ? 's' : ''}
                          </button>
                          {job.status !== 'draft' && (
                            <button type="button" className={styles.toggleStatusBtn} onClick={() => toggleJobStatus(job)}>
                              {job.status === 'active'
                                ? <><i className="fa-solid fa-pause" aria-hidden="true" /> Pause</>
                                : <><i className="fa-solid fa-play" aria-hidden="true" /> Activate</>}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={styles.jobPipelineRow}>
                        <PipelineBar apps={jobApps} />
                        {jobApps.length > 0 && (
                          <div className={styles.pipelineLegend}>
                            {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => {
                              const c = jobApps.filter((a) => a.status === s).length;
                              if (c === 0) return null;
                              return (
                                <span key={s} className={styles.legendItem} style={{ color: STATUS_COLORS[s] }}>
                                  <span className={styles.legendDot} style={{ background: STATUS_COLORS[s] }} />
                                  {STATUS_LABELS[s]} ({c})
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <div className={styles.applicantsSection}>
            {!selectedJob ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-users" aria-hidden="true" />
                <h3>Select a job to view applicants</h3>
                <p>Go to the My Jobs tab and click the applicants button on a listing.</p>
              </div>
            ) : selectedApps.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-inbox" aria-hidden="true" />
                <h3>No applicants yet</h3>
                <p>No one has applied to <strong>{selectedJob.title}</strong> yet.</p>
              </div>
            ) : (
              <>
                <div className={styles.applicantsHeader}>
                  <h2 className={styles.applicantsTitle}>
                    Applicants for <span>{selectedJob.title}</span>
                    <span className={styles.applicantsCount}>{selectedApps.length}</span>
                  </h2>
                  <button
                    type="button"
                    className={styles.csvBtn}
                    onClick={() => exportCSV(selectedApps, selectedJob.title)}
                  >
                    <i className="fa-solid fa-file-csv" aria-hidden="true" /> Export CSV
                  </button>
                </div>
                <div className={styles.applicantsList}>
                  {selectedApps.map((app) => (
                    <div key={app.id} className={styles.applicantCard}>
                      <div className={styles.applicantTop}>
                        <div className={styles.applicantAvatar}>
                          {app.candidate?.full_name?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div>
                          <h3 className={styles.applicantName}>{app.candidate?.full_name ?? 'Candidate'}</h3>
                          <div className={styles.applicantEmail}>{app.candidate?.email}</div>
                          {(app.candidate as unknown as { phone?: string })?.phone && (
                            <div className={styles.applicantPhone}>
                              <i className="fa-solid fa-phone" aria-hidden="true" /> {(app.candidate as unknown as { phone?: string }).phone}
                            </div>
                          )}
                        </div>
                      </div>
                      {app.cover_letter && (
                        <p className={styles.applicantCover}>
                          <i className="fa-solid fa-quote-left" aria-hidden="true" /> {app.cover_letter.slice(0, 200)}{app.cover_letter.length > 200 ? '…' : ''}
                        </p>
                      )}
                      <div className={styles.applicantActions}>
                        <select
                          value={app.status}
                          disabled={updatingApp === app.id}
                          onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                          className={styles.statusSelect}
                        >
                          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        {updatingApp === app.id && <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />}
                        {app.resume_url && (
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>
                            <i className="fa-solid fa-file-pdf" aria-hidden="true" /> View CV
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Company Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <h2 className={styles.profileCardTitle}><i className="fa-solid fa-building" aria-hidden="true" /> Company Profile</h2>

              {profileSaved && (
                <div className={styles.profileSavedMsg}>
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> Profile saved successfully!
                </div>
              )}

              <div className={styles.profileFormRow}>
                <div className={styles.profileFormGroup}>
                  <label>Company Name</label>
                  <input value={profileForm.company_name} onChange={(e) => setProfileForm((f) => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div className={styles.profileFormGroup}>
                  <label>Industry</label>
                  <select value={profileForm.industry} onChange={(e) => setProfileForm((f) => ({ ...f, industry: e.target.value }))}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.profileFormRow}>
                <div className={styles.profileFormGroup}>
                  <label>Country</label>
                  <select value={profileForm.country} onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.profileFormGroup}>
                  <label>Phone</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className={styles.profileFormRow}>
                <div className={styles.profileFormGroup}>
                  <label>Contact Person</label>
                  <input value={profileForm.contact_person} onChange={(e) => setProfileForm((f) => ({ ...f, contact_person: e.target.value }))} />
                </div>
                <div className={styles.profileFormGroup}>
                  <label>Contact Job Title</label>
                  <input value={profileForm.contact_job_title} onChange={(e) => setProfileForm((f) => ({ ...f, contact_job_title: e.target.value }))} />
                </div>
              </div>
              <div className={styles.profileFormGroup}>
                <label>Company Website</label>
                <input type="url" value={profileForm.website} onChange={(e) => setProfileForm((f) => ({ ...f, website: e.target.value }))} />
              </div>
              <div className={styles.profileFormGroup}>
                <label>Company Description</label>
                <textarea rows={4} value={profileForm.description} onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <button type="button" className={styles.profileSaveBtn} disabled={profileSaving} onClick={saveProfile}>
                {profileSaving
                  ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Saving…</>
                  : <><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Save Changes</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-primary)' }}><i className="fa-solid fa-spinner fa-spin" /></div>}>
      <EmployerDashboardInner />
    </Suspense>
  );
}
