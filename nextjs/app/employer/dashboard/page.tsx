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

function EmployerDashboardInner() {
  const router = useRouter();
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
  const [updatingApp, setUpdatingApp] = useState<string | null>(null);

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
      setEmployer(emp as EmployerProfile);

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', userId)
        .order('created_at', { ascending: false });
      setJobs((jobsData as Job[]) ?? []);

      // Load all applications for this employer's jobs
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

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalApplicants = allApplications.length;

  return (
    <div className={styles.dashboardPage}>
      {/* Header */}
      <header className={styles.dashHeader}>
        <div className={`container ${styles.dashHeaderInner}`}>
          <div className={styles.dashHeaderLeft}>
            <div className={styles.dashAvatar}>
              <i className="fa-solid fa-building" aria-hidden="true" />
            </div>
            <div>
              <h1 className={styles.dashWelcome}>{employer?.company_name ?? 'Employer Dashboard'}</h1>
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
            { icon: 'fa-briefcase', bg: 'rgba(79,163,199,0.1)', color: 'var(--color-primary)', num: jobs.length, label: 'Total Jobs Posted' },
            { icon: 'fa-circle-check', bg: 'rgba(16,185,129,0.1)', color: '#10b981', num: activeJobs, label: 'Active Listings' },
            { icon: 'fa-users', bg: 'rgba(200,168,75,0.1)', color: '#c8a84b', num: totalApplicants, label: 'Total Applicants' },
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

        {/* Quick Actions */}
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
            {selectedJob && selectedApps.length > 0 && (
              <button type="button" className={`${styles.qaBtn} ${styles.qaBtnGold}`} onClick={() => exportCSV(selectedApps, selectedJob.title)}>
                <i className="fa-solid fa-file-csv" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${activeTab === 'jobs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('jobs')}>
            <i className="fa-solid fa-briefcase" aria-hidden="true" /> My Job Postings
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'applicants' ? styles.tabActive : ''}`} onClick={() => setActiveTab('applicants')}>
            <i className="fa-solid fa-users" aria-hidden="true" /> Applicants
            {selectedJob && <span className={styles.tabBadge}>{selectedJob.title}</span>}
          </button>
        </div>

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
                            {job.status}
                          </span>
                          <button type="button" className={styles.viewAppsBtn} onClick={() => selectJob(job)}>
                            <i className="fa-solid fa-users" aria-hidden="true" /> {jobApps.length} Applicant{jobApps.length !== 1 ? 's' : ''}
                          </button>
                          <button type="button" className={styles.toggleStatusBtn} onClick={() => toggleJobStatus(job)}>
                            {job.status === 'active'
                              ? <><i className="fa-solid fa-pause" aria-hidden="true" /> Pause</>
                              : <><i className="fa-solid fa-play" aria-hidden="true" /> Activate</>}
                          </button>
                        </div>
                      </div>
                      {/* Pipeline Bar */}
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
                <p>Go to the My Job Postings tab and click the applicants button on a listing.</p>
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
