'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus, Profile } from '@/lib/types';
import styles from './page.module.css';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; icon: string; color: string }> = {
  pending:     { label: 'Pending',     icon: 'fa-clock',         color: '#f59e0b' },
  reviewing:   { label: 'Reviewing',   icon: 'fa-magnifying-glass', color: '#3b82f6' },
  shortlisted: { label: 'Shortlisted', icon: 'fa-star',           color: '#8b5cf6' },
  rejected:    { label: 'Rejected',    icon: 'fa-xmark',          color: '#ef4444' },
  hired:       { label: 'Hired',       icon: 'fa-check',          color: '#10b981' },
};

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

      {/* Pipeline */}
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

function CandidateDashboardInner() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', country: '', headline: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/candidate/register'); return; }
      const token = sessionData.session.access_token;
      const userId = sessionData.session.user.id;

      const [profileRes, appsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
        setProfileForm({
          full_name: profileRes.data.full_name ?? '',
          phone: profileRes.data.phone ?? '',
          country: profileRes.data.country ?? '',
          headline: profileRes.data.headline ?? '',
        });
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications ?? []);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase.from('profiles').update(profileForm).eq('id', profile.id);
    setSaving(false);
    setSaveMsg(error ? 'Failed to save.' : 'Profile updated!');
    setTimeout(() => setSaveMsg(''), 3000);
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
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div>
              <h1 className={styles.dashWelcome}>Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}!</h1>
              <p className={styles.dashSubtitle}>{profile?.headline || 'Candidate Dashboard'}</p>
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
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(79,163,199,0.1)', color: 'var(--color-primary)' }}>
              <i className="fa-solid fa-file-lines" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{stats.total}</div>
            <div className={styles.statLabel}>Total Applications</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
              <i className="fa-solid fa-clock" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending Review</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
              <i className="fa-solid fa-star" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{stats.shortlisted}</div>
            <div className={styles.statLabel}>Shortlisted</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <i className="fa-solid fa-check-double" aria-hidden="true" />
            </div>
            <div className={styles.statNum}>{stats.hired}</div>
            <div className={styles.statLabel}>Hired</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${activeTab === 'applications' ? styles.tabActive : ''}`} onClick={() => setActiveTab('applications')}>
            <i className="fa-solid fa-file-lines" aria-hidden="true" /> My Applications
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fa-solid fa-user" aria-hidden="true" /> Edit Profile
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
                {applications.map((app) => (
                  <ApplicationCard key={app.id} app={app} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <h2 className={styles.profileTitle}><i className="fa-solid fa-user" aria-hidden="true" /> Personal Information</h2>
              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input value={profileForm.full_name} onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+63 912 345 6789" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Country</label>
                    <input value={profileForm.country} onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))} placeholder="Philippines" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Professional Headline</label>
                    <input value={profileForm.headline} onChange={(e) => setProfileForm((f) => ({ ...f, headline: e.target.value }))} placeholder="e.g. Registered Nurse, 5 years experience" />
                  </div>
                </div>
                <div className={styles.profileActions}>
                  <button type="button" onClick={saveProfile} disabled={saving} className={styles.saveBtn}>
                    {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
                  </button>
                  {saveMsg && <span className={`${styles.saveMsg} ${saveMsg.includes('Failed') ? styles.saveMsgError : ''}`}>{saveMsg}</span>}
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
    <Suspense fallback={<div className={styles.loadingPage}><i className="fa-solid fa-spinner fa-spin" /></div>}>
      <CandidateDashboardInner />
    </Suspense>
  );
}
