'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Job, Application, EmployerProfile, ApplicationStatus, CandidateProfile } from '@/lib/types';
import styles from './page.module.css';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted:           'Submitted',
  under_review:        'Under Review',
  shortlisted:         'Shortlisted',
  interview_scheduled: 'Interview',
  offer_extended:      'Offer Extended',
  deployed:            'Deployed',
  rejected:            'Rejected',
  withdrawn:           'Withdrawn',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted:           '#f59e0b',
  under_review:        '#3b82f6',
  shortlisted:         '#8b5cf6',
  interview_scheduled: '#6366f1',
  offer_extended:      '#8CC63F',
  deployed:            '#10b981',
  rejected:            '#ef4444',
  withdrawn:           '#9ca3af',
};

const PANEL_STATUSES: { key: ApplicationStatus; label: string }[] = [
  { key: 'under_review',        label: 'Under Review' },
  { key: 'shortlisted',         label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interview' },
  { key: 'offer_extended',      label: 'Offer Extended' },
  { key: 'deployed',            label: 'Hired' },
  { key: 'rejected',            label: 'Not Qualified' },
];

const INDUSTRIES = ['Hospitality', 'Healthcare', 'Engineering', 'IT & Technology', 'Construction', 'Retail', 'Finance', 'Manufacturing', 'Transportation', 'Other'];
const COUNTRIES  = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'Taiwan', 'Malaysia', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'United States', 'Other'];

function PipelineBar({ apps }: { apps: Application[] }) {
  if (apps.length === 0) return <div className={styles.noApps}>No applicants yet</div>;
  const statuses: ApplicationStatus[] = ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'offer_extended', 'deployed', 'rejected'];
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

function fmtSalary(job: Job): string {
  if (job.salary_min && job.salary_max) {
    return `₱${job.salary_min.toLocaleString()} – ₱${job.salary_max.toLocaleString()}/mo`;
  }
  if (job.salary) return job.salary;
  return '—';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EmployerDashboardInner() {
  const router = useRouter();
  const [employer, setEmployer]               = useState<EmployerProfile | null>(null);
  const [jobs, setJobs]                       = useState<Job[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob]         = useState<Job | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [token, setToken]                     = useState('');
  const [activeTab, setActiveTab]             = useState<Tab>('overview');
  const [updatingApp, setUpdatingApp]         = useState<string | null>(null);
  const [confirmCloseJobId, setConfirmCloseJobId] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [notesMap, setNotesMap]               = useState<Record<string, string>>({});

  const [profileForm, setProfileForm] = useState({
    company_name: '', industry: '', country: '', phone: '', website: '', description: '',
    contact_person: '', contact_job_title: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved]   = useState(false);

  const getJobApps = useCallback((jobId: string) => allApplications.filter((a) => a.job_id === jobId), [allApplications]);
  const selectedApps = selectedJob ? getJobApps(selectedJob.id) : allApplications;

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
        .eq('employer_id', e.id)
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
      if (selectedApplicant?.id === appId) {
        setSelectedApplicant((prev) => prev ? { ...prev, status } : prev);
      }
    }
    setUpdatingApp(null);
  }

  async function setJobStatus(job: Job, newStatus: string) {
    setConfirmCloseJobId(null);
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

  const isVerified      = employer?.is_verified === true;
  const activeJobs      = jobs.filter((j) => j.status === 'active').length;
  const draftJobs       = jobs.filter((j) => j.status === 'draft').length;
  const totalApplicants = allApplications.length;
  const hiredCount      = allApplications.filter((a) => a.status === 'deployed' || a.status === 'offer_extended').length;

  const statsConfig = [
    { icon: 'fa-briefcase',    bg: 'rgba(79,163,199,0.1)',  color: 'var(--color-primary)', num: jobs.length,     label: 'Total Jobs Posted',  tab: 'jobs' as Tab },
    { icon: 'fa-circle-check', bg: 'rgba(16,185,129,0.1)',  color: '#10b981',              num: activeJobs,       label: 'Active Listings',    tab: 'jobs' as Tab },
    { icon: 'fa-users',        bg: 'rgba(200,168,75,0.1)',  color: '#c8a84b',              num: totalApplicants,  label: 'Total Applicants',   tab: 'applicants' as Tab },
    { icon: 'fa-handshake',    bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6',              num: hiredCount,       label: 'Hired',              tab: 'applicants' as Tab },
  ];

  return (
    <div className={styles.dashboardPage}>
      {/* Verification Banner */}
      {!isVerified && (
        <div className={styles.verifyBanner}>
          <i className="fa-solid fa-clock" aria-hidden="true" />
          <div>
            <strong>Account Pending Verification</strong>
            <span>Your account is under review. Jobs you post will be saved as drafts and published once approved (1–2 business days).</span>
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
        {/* Stats — clickable */}
        <div className={styles.statsGrid}>
          {statsConfig.map((s) => (
            <button
              key={s.label}
              type="button"
              className={styles.statCard}
              onClick={() => setActiveTab(s.tab)}
            >
              <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
                <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
              </div>
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </button>
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

        {/* ── OVERVIEW TAB ── */}
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
              </div>
            </div>

            {/* Recent Job Postings */}
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
                          <div className={styles.jobTitleRow}>
                            <h3 className={styles.jobRowTitle}>{job.title}</h3>
                            {job.job_reference && <span className={styles.jobRefBadge}>{job.job_reference}</span>}
                          </div>
                          <div className={styles.jobRowMeta}>
                            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                            <span><i className="fa-solid fa-briefcase" aria-hidden="true" /> {job.industry}</span>
                          </div>
                        </div>
                        <div className={styles.jobRowRight}>
                          <span className={`${styles.jobStatusBadge} ${styles[`status_${job.status}`]}`}>{job.status}</span>
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

            {/* Recent Applications */}
            {allApplications.length > 0 && (
              <>
                <h2 className={styles.sectionHeading}>Recent Applications</h2>
                <div className={styles.recentAppsList}>
                  {allApplications.slice(0, 5).map((app) => (
                    <div key={app.id} className={styles.recentAppRow} onClick={() => { setSelectedApplicant(app); }}>
                      <div className={styles.recentAppAvatar}>
                        {app.candidate?.full_name?.charAt(0).toUpperCase() ?? 'A'}
                      </div>
                      <div className={styles.recentAppInfo}>
                        <span className={styles.recentAppName}>{app.candidate?.full_name ?? 'Candidate'}</span>
                        <span className={styles.recentAppJob}>{app.job?.title ?? '—'}</span>
                      </div>
                      <div className={styles.recentAppMeta}>
                        <span className={styles.recentAppDate}>{fmtDate(app.created_at)}</span>
                        <span
                          className={styles.recentAppStatus}
                          style={{ color: STATUS_COLORS[app.status] }}
                        >
                          {STATUS_LABELS[app.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── JOBS TAB ── */}
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
                          <div className={styles.jobTitleRow}>
                            <h3 className={styles.jobRowTitle}>{job.title}</h3>
                            {job.job_reference && <span className={styles.jobRefBadge}>{job.job_reference}</span>}
                          </div>
                          <div className={styles.jobRowMeta}>
                            <span><i className="fa-solid fa-building" aria-hidden="true" /> {job.company}</span>
                            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                            <span><i className="fa-solid fa-briefcase" aria-hidden="true" /> {job.industry}</span>
                            <span><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
                          </div>
                          <div className={styles.jobRowMeta} style={{ marginTop: 4 }}>
                            <span><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {fmtSalary(job)}</span>
                            {(job.slots_available ?? 0) > 0 && (
                              <span><i className="fa-solid fa-user-plus" aria-hidden="true" /> {job.slots_available} slot{job.slots_available !== 1 ? 's' : ''}</span>
                            )}
                            <span><i className="fa-solid fa-calendar" aria-hidden="true" /> {fmtDate(job.created_at)}</span>
                          </div>
                        </div>
                        <div className={styles.jobRowRight}>
                          <span className={`${styles.jobStatusBadge} ${styles[`status_${job.status}`]}`}>
                            {job.status === 'draft' ? '⏳ Draft' : job.status}
                          </span>
                          <button type="button" className={styles.viewAppsBtn} onClick={() => selectJob(job)}>
                            <i className="fa-solid fa-users" aria-hidden="true" /> {jobApps.length} Applicant{jobApps.length !== 1 ? 's' : ''}
                          </button>
                          <a href={`/employer/post-job?edit=${job.id}`} className={styles.editJobBtn}>
                            <i className="fa-solid fa-pen" aria-hidden="true" /> Edit
                          </a>
                          {job.status === 'active' && confirmCloseJobId === job.id ? (
                            <div className={styles.closeConfirm}>
                              <span>Close this job?</span>
                              <div className={styles.closeConfirmBtns}>
                                <button type="button" className={styles.closeConfirmYes} onClick={() => setJobStatus(job, 'closed')}>Close</button>
                                <button type="button" className={styles.closeConfirmNo} onClick={() => setConfirmCloseJobId(null)}>Cancel</button>
                              </div>
                            </div>
                          ) : job.status === 'active' ? (
                            <button type="button" className={styles.toggleStatusBtnDanger} onClick={() => setConfirmCloseJobId(job.id)}>
                              <i className="fa-solid fa-xmark" aria-hidden="true" /> Close Job
                            </button>
                          ) : job.status === 'closed' ? (
                            <button type="button" className={styles.toggleStatusBtnGreen} onClick={() => setJobStatus(job, 'active')}>
                              <i className="fa-solid fa-rotate-left" aria-hidden="true" /> Reopen
                            </button>
                          ) : job.status === 'draft' ? (
                            <button type="button" className={styles.toggleStatusBtn} onClick={() => setJobStatus(job, 'active')}>
                              <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit for Review
                            </button>
                          ) : null}
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

        {/* ── APPLICANTS TAB ── */}
        {activeTab === 'applicants' && (
          <div className={styles.applicantsSection}>
            {!selectedJob ? (
              allApplications.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fa-solid fa-users" aria-hidden="true" />
                  <h3>No applications yet</h3>
                  <p>Applications will appear here once candidates apply to your jobs.</p>
                </div>
              ) : (
                <>
                  <div className={styles.applicantsHeader}>
                    <h2 className={styles.applicantsTitle}>
                      All Applicants
                      <span className={styles.applicantsCount}>{allApplications.length}</span>
                    </h2>
                    <button type="button" className={styles.csvBtn} onClick={() => exportCSV(allApplications, 'all_jobs')}>
                      <i className="fa-solid fa-file-csv" aria-hidden="true" /> Export CSV
                    </button>
                  </div>
                  <div className={styles.applicantsList}>
                    {allApplications.map((app) => (
                      <div key={app.id} className={styles.applicantCard} onClick={() => setSelectedApplicant(app)} style={{ cursor: 'pointer' }}>
                        <div className={styles.applicantTop}>
                          <div className={styles.applicantAvatar}>
                            {app.candidate?.full_name?.charAt(0).toUpperCase() ?? 'A'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 className={styles.applicantName}>{app.candidate?.full_name ?? 'Candidate'}</h3>
                            <div className={styles.applicantEmail}>{app.candidate?.email}</div>
                            <div className={styles.applicantEmail}><i className="fa-solid fa-briefcase" aria-hidden="true" /> {app.job?.title ?? '—'}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                            <span
                              className={styles.jobStatusBadge}
                              style={{
                                background: `${STATUS_COLORS[app.status]}18`,
                                color: STATUS_COLORS[app.status],
                                border: `1px solid ${STATUS_COLORS[app.status]}44`,
                                padding: '3px 10px',
                                borderRadius: 20,
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 600,
                              }}
                            >
                              {STATUS_LABELS[app.status]}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)', fontFamily: 'var(--font-body)' }}>
                              {fmtDate(app.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            ) : selectedApps.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-inbox" aria-hidden="true" />
                <h3>No applicants yet</h3>
                <p>No one has applied to <strong>{selectedJob.title}</strong> yet.</p>
                <button type="button" className={styles.emptyStateBtn} onClick={() => setSelectedJob(null)}>View all applicants</button>
              </div>
            ) : (
              <>
                <div className={styles.applicantsHeader}>
                  <h2 className={styles.applicantsTitle}>
                    <button type="button" onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '1rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                    </button>
                    Applicants for <span>{selectedJob.title}</span>
                    <span className={styles.applicantsCount}>{selectedApps.length}</span>
                  </h2>
                  <button type="button" className={styles.csvBtn} onClick={() => exportCSV(selectedApps, selectedJob.title)}>
                    <i className="fa-solid fa-file-csv" aria-hidden="true" /> Export CSV
                  </button>
                </div>
                <div className={styles.applicantsList}>
                  {selectedApps.map((app) => (
                    <div key={app.id} className={styles.applicantCard} onClick={() => setSelectedApplicant(app)} style={{ cursor: 'pointer' }}>
                      <div className={styles.applicantTop}>
                        <div className={styles.applicantAvatar}>
                          {app.candidate?.full_name?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 className={styles.applicantName}>{app.candidate?.full_name ?? 'Candidate'}</h3>
                          <div className={styles.applicantEmail}>{app.candidate?.email}</div>
                          {(app.candidate as unknown as { phone?: string })?.phone && (
                            <div className={styles.applicantPhone}>
                              <i className="fa-solid fa-phone" aria-hidden="true" /> {(app.candidate as unknown as { phone?: string }).phone}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <span
                            style={{
                              background: `${STATUS_COLORS[app.status]}18`,
                              color: STATUS_COLORS[app.status],
                              border: `1px solid ${STATUS_COLORS[app.status]}44`,
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 600,
                            }}
                          >
                            {STATUS_LABELS[app.status]}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)', fontFamily: 'var(--font-body)' }}>
                            {fmtDate(app.created_at)}
                          </span>
                        </div>
                      </div>
                      {app.cover_letter && (
                        <p className={styles.applicantCover}>
                          <i className="fa-solid fa-quote-left" aria-hidden="true" /> {app.cover_letter.slice(0, 160)}{app.cover_letter.length > 160 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── COMPANY PROFILE TAB ── */}
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
              <div className={styles.profileFormGroup}>
                <label>Company Website</label>
                <input type="url" value={profileForm.website} onChange={(e) => setProfileForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://" />
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
                <label>Company Description <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>({profileForm.description.length}/500)</span></label>
                <textarea rows={4} maxLength={500} value={profileForm.description} onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
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

      {/* ── APPLICANT SIDE PANEL ── */}
      {selectedApplicant && (
        <>
          <div className={styles.panelOverlay} onClick={() => setSelectedApplicant(null)} />
          <div className={styles.applicantPanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelAvatar}>
                {selectedApplicant.candidate?.full_name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className={styles.panelHeaderInfo}>
                <h3 className={styles.panelName}>{selectedApplicant.candidate?.full_name ?? 'Candidate'}</h3>
                <div className={styles.panelMeta}>
                  {selectedApplicant.candidate?.email && (
                    <span><i className="fa-solid fa-envelope" aria-hidden="true" /> {selectedApplicant.candidate.email}</span>
                  )}
                  {(selectedApplicant.candidate as unknown as { phone?: string })?.phone && (
                    <span><i className="fa-solid fa-phone" aria-hidden="true" /> {(selectedApplicant.candidate as unknown as { phone?: string }).phone}</span>
                  )}
                  {(selectedApplicant.candidate as unknown as CandidateProfile)?.nationality && (
                    <span><i className="fa-solid fa-flag" aria-hidden="true" /> {(selectedApplicant.candidate as unknown as CandidateProfile).nationality}</span>
                  )}
                  {(selectedApplicant.candidate as unknown as CandidateProfile)?.current_location && (
                    <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {(selectedApplicant.candidate as unknown as CandidateProfile).current_location}</span>
                  )}
                </div>
              </div>
              <button type="button" className={styles.panelClose} onClick={() => setSelectedApplicant(null)}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <div className={styles.panelBody}>
              {/* Candidate details */}
              {(() => {
                const c = selectedApplicant.candidate as unknown as CandidateProfile;
                return (
                  <div className={styles.panelDetails}>
                    {c?.years_experience !== undefined && (
                      <div className={styles.panelDetailItem}>
                        <span className={styles.panelDetailLabel}>Experience</span>
                        <span>{c.years_experience} yr{c.years_experience !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {c?.education_level && (
                      <div className={styles.panelDetailItem}>
                        <span className={styles.panelDetailLabel}>Education</span>
                        <span>{c.education_level}</span>
                      </div>
                    )}
                    {selectedApplicant.job?.title && (
                      <div className={styles.panelDetailItem}>
                        <span className={styles.panelDetailLabel}>Applied for</span>
                        <span>{selectedApplicant.job.title}</span>
                      </div>
                    )}
                    <div className={styles.panelDetailItem}>
                      <span className={styles.panelDetailLabel}>Applied on</span>
                      <span>{fmtDate(selectedApplicant.created_at)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Skills */}
              {(() => {
                const skills = (selectedApplicant.candidate as unknown as CandidateProfile)?.skills;
                if (!skills?.length) return null;
                return (
                  <div className={styles.panelSection}>
                    <h4 className={styles.panelSectionTitle}>Skills</h4>
                    <div className={styles.skillTags}>
                      {skills.map((s) => <span key={s} className={styles.skillTag}>{s}</span>)}
                    </div>
                  </div>
                );
              })()}

              {/* Cover letter */}
              {selectedApplicant.cover_letter && (
                <div className={styles.panelSection}>
                  <h4 className={styles.panelSectionTitle}>Cover Letter</h4>
                  <div className={styles.coverLetterBox}>{selectedApplicant.cover_letter}</div>
                </div>
              )}

              {/* CV download */}
              {selectedApplicant.resume_url && (
                <div className={styles.panelSection}>
                  <a href={selectedApplicant.resume_url} target="_blank" rel="noopener noreferrer" className={styles.downloadCvBtn}>
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" /> Download CV
                  </a>
                </div>
              )}

              {/* Status update */}
              <div className={styles.panelSection}>
                <h4 className={styles.panelSectionTitle}>Update Status</h4>
                <div className={styles.statusBtnGrid}>
                  {PANEL_STATUSES.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      disabled={updatingApp === selectedApplicant.id}
                      className={`${styles.statusBtn} ${selectedApplicant.status === key ? styles.statusBtnActive : ''}`}
                      onClick={() => updateStatus(selectedApplicant.id, key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {updatingApp === selectedApplicant.id && (
                  <div className={styles.panelUpdating}><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Updating…</div>
                )}
              </div>

              {/* Internal notes */}
              <div className={styles.panelSection}>
                <h4 className={styles.panelSectionTitle}>Internal Notes</h4>
                <textarea
                  className={styles.notesArea}
                  rows={3}
                  placeholder="Add private notes about this candidate…"
                  value={notesMap[selectedApplicant.id] ?? ''}
                  onChange={(e) => setNotesMap((prev) => ({ ...prev, [selectedApplicant.id]: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </>
      )}
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
