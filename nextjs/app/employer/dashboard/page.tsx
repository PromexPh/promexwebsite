'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Job, Application, Profile, ApplicationStatus } from '@/lib/types';
import styles from './page.module.css';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
};

export default function EmployerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
  const [updatingApp, setUpdatingApp] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/employer/register'); return; }
      const t = sessionData.session.access_token;
      setToken(t);
      const userId = sessionData.session.user.id;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profileData?.role !== 'employer') { router.push('/employer/register'); return; }
      setProfile(profileData as Profile);

      // Fetch employer's jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', userId)
        .order('created_at', { ascending: false });
      setJobs((jobsData as Job[]) ?? []);

      setLoading(false);
    }
    load();
  }, [router]);

  async function loadApplications(job: Job) {
    setSelectedJob(job);
    setActiveTab('applicants');
    const res = await fetch(`/api/applications?job_id=${job.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications ?? []);
    }
  }

  async function updateStatus(appId: string, status: ApplicationStatus) {
    setUpdatingApp(appId);
    const res = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ application_id: appId, status }),
    });
    if (res.ok) {
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
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
              <h1 className={styles.dashWelcome}>{profile?.company_name ?? 'Employer Dashboard'}</h1>
              <p className={styles.dashSubtitle}>{profile?.industry ?? profile?.email}</p>
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
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(79,163,199,0.1)', color: 'var(--color-primary)' }}>
              <i className="fa-solid fa-briefcase" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{jobs.length}</div>
            <div className={styles.statLabel}>Total Jobs Posted</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{activeJobs}</div>
            <div className={styles.statLabel}>Active Listings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(200,168,75,0.1)', color: '#c8a84b' }}>
              <i className="fa-solid fa-users" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{applications.length}</div>
            <div className={styles.statLabel}>Applicants Loaded</div>
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
                {jobs.map((job) => (
                  <div key={job.id} className={styles.jobRow}>
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
                      <button type="button" className={styles.viewAppsBtn} onClick={() => loadApplications(job)}>
                        <i className="fa-solid fa-users" aria-hidden="true" /> View Applicants
                      </button>
                      <button type="button" className={styles.toggleStatusBtn} onClick={() => toggleJobStatus(job)}>
                        {job.status === 'active' ? <><i className="fa-solid fa-pause" /> Pause</> : <><i className="fa-solid fa-play" /> Activate</>}
                      </button>
                    </div>
                  </div>
                ))}
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
                <p>Go to the My Job Postings tab and click &quot;View Applicants&quot; on a listing.</p>
              </div>
            ) : applications.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-inbox" aria-hidden="true" />
                <h3>No applicants yet</h3>
                <p>No one has applied to <strong>{selectedJob.title}</strong> yet.</p>
              </div>
            ) : (
              <>
                <h2 className={styles.applicantsTitle}>
                  Applicants for <span>{selectedJob.title}</span>
                  <span className={styles.applicantsCount}>{applications.length}</span>
                </h2>
                <div className={styles.applicantsList}>
                  {applications.map((app) => (
                    <div key={app.id} className={styles.applicantCard}>
                      <div className={styles.applicantTop}>
                        <div className={styles.applicantAvatar}>
                          {app.candidate?.full_name?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div>
                          <h3 className={styles.applicantName}>{app.candidate?.full_name ?? 'Candidate'}</h3>
                          <div className={styles.applicantEmail}>{app.candidate?.email}</div>
                          {app.candidate?.phone && <div className={styles.applicantPhone}><i className="fa-solid fa-phone" /> {app.candidate.phone}</div>}
                        </div>
                      </div>
                      {app.cover_letter && (
                        <p className={styles.applicantCover}>
                          <i className="fa-solid fa-quote-left" /> {app.cover_letter.slice(0, 200)}{app.cover_letter.length > 200 ? '…' : ''}
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
