'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import type { InquiryStatus, ApplicationStatus } from '@/lib/types';
import styles from './page.module.css';

const ADMIN_KEY = 'promex_admin_session';

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Admin ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`,
  };
}

type Tab = 'jobs' | 'employers' | 'candidates' | 'applications' | 'inquiries';

// ─────────────────────────────────────────────────────────────────────────────
// Login screen
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw]         = useState('');
  const [error, setError]   = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, pw);
      onAuth();
    } else {
      setError('Incorrect password');
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}><i className="fa-solid fa-shield-halved" aria-hidden="true" /></div>
        <h1 className={styles.loginTitle}>Promex Admin</h1>
        <p className={styles.loginSub}>Enter the admin password to continue</p>
        <form onSubmit={submit} className={styles.loginForm}>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(''); }}
            placeholder="Admin password"
            className={styles.loginInput}
            autoFocus
          />
          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" className={styles.loginBtn}>
            <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Jobs tab
// ─────────────────────────────────────────────────────────────────────────────
function JobsTab() {
  const [jobs, setJobs]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newJob, setNewJob]   = useState({ title: '', company: '', country: '', industry: '', salary: '', job_type: '', experience: '', description: '' });
  const [posting, setPosting] = useState(false);
  const [filter, setFilter]   = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/jobs', { headers: adminHeaders() });
    const d = await res.json();
    setJobs(d.jobs ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function patchJob(id: string, updates: object) {
    await fetch('/api/admin/jobs', { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ id, ...updates }) });
    load();
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job?')) return;
    await fetch(`/api/admin/jobs?id=${id}`, { method: 'DELETE', headers: adminHeaders() });
    load();
  }

  async function postJob(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    await fetch('/api/admin/jobs', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(newJob) });
    setPosting(false);
    setShowNew(false);
    setNewJob({ title: '', company: '', country: '', industry: '', salary: '', job_type: '', experience: '', description: '' });
    load();
  }

  const filtered = jobs.filter((j) =>
    !filter || j.title?.toLowerCase().includes(filter.toLowerCase()) || j.company?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className={styles.tabHeader}>
        <input className={styles.searchInput} placeholder="Search jobs…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className={styles.addBtn} onClick={() => setShowNew((v) => !v)}>
          <i className="fa-solid fa-plus" /> {showNew ? 'Cancel' : 'Post Job'}
        </button>
      </div>

      {showNew && (
        <form onSubmit={postJob} className={styles.newForm}>
          <div className={styles.newFormGrid}>
            <input placeholder="Job Title *" required value={newJob.title} onChange={(e) => setNewJob((f) => ({ ...f, title: e.target.value }))} />
            <input placeholder="Company *" required value={newJob.company} onChange={(e) => setNewJob((f) => ({ ...f, company: e.target.value }))} />
            <input placeholder="Country" value={newJob.country} onChange={(e) => setNewJob((f) => ({ ...f, country: e.target.value }))} />
            <input placeholder="Industry" value={newJob.industry} onChange={(e) => setNewJob((f) => ({ ...f, industry: e.target.value }))} />
            <input placeholder="Salary" value={newJob.salary} onChange={(e) => setNewJob((f) => ({ ...f, salary: e.target.value }))} />
            <input placeholder="Job Type" value={newJob.job_type} onChange={(e) => setNewJob((f) => ({ ...f, job_type: e.target.value }))} />
            <input placeholder="Experience" value={newJob.experience} onChange={(e) => setNewJob((f) => ({ ...f, experience: e.target.value }))} />
          </div>
          <textarea rows={3} placeholder="Description" value={newJob.description} onChange={(e) => setNewJob((f) => ({ ...f, description: e.target.value }))} />
          <button type="submit" className={styles.addBtn} disabled={posting}>{posting ? 'Posting…' : 'Publish Job'}</button>
        </form>
      )}

      {loading ? <div className={styles.tableLoading}><i className="fa-solid fa-spinner fa-spin" /> Loading…</div> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th><th>Company</th><th>Country</th><th>Status</th><th>Apps</th><th>Posted</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id}>
                <td><strong>{j.title}</strong></td>
                <td>{j.company}</td>
                <td>{j.country}</td>
                <td>
                  <select className={styles.inlineSelect} value={j.status} onChange={(e) => patchJob(j.id, { status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>{j.application_count?.[0]?.count ?? 0}</td>
                <td>{new Date(j.created_at).toLocaleDateString()}</td>
                <td>
                  <button className={styles.dangerBtn} onClick={() => deleteJob(j.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employers tab
// ─────────────────────────────────────────────────────────────────────────────
function EmployersTab() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/employers', { headers: adminHeaders() });
    const d = await res.json();
    setEmployers(d.employers ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function verify(id: string, val: boolean) {
    await fetch('/api/admin/employers', { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ id, is_verified: val }) });
    load();
  }

  async function del(id: string) {
    if (!confirm('Delete this employer account? This cannot be undone.')) return;
    await fetch(`/api/admin/employers?id=${id}`, { method: 'DELETE', headers: adminHeaders() });
    load();
  }

  const filtered = employers.filter((e) =>
    !filter || e.company_name?.toLowerCase().includes(filter.toLowerCase()) || e.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className={styles.tabHeader}>
        <input className={styles.searchInput} placeholder="Search employers…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      {loading ? <div className={styles.tableLoading}><i className="fa-solid fa-spinner fa-spin" /> Loading…</div> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th><th>Contact</th><th>Email</th><th>Industry</th><th>Country</th><th>Verified</th><th>Registered</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.company_name}</strong></td>
                <td>{emp.contact_person}</td>
                <td>{emp.email}</td>
                <td>{emp.industry}</td>
                <td>{emp.country}</td>
                <td>
                  <span className={emp.is_verified ? styles.badgeGreen : styles.badgeYellow}>
                    {emp.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                <td className={styles.actionCell}>
                  {emp.is_verified ? (
                    <button className={styles.warnBtn} onClick={() => verify(emp.id, false)}>Revoke</button>
                  ) : (
                    <button className={styles.successBtn} onClick={() => verify(emp.id, true)}>Verify</button>
                  )}
                  <button className={styles.dangerBtn} onClick={() => del(emp.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Candidates tab
// ─────────────────────────────────────────────────────────────────────────────
function CandidatesTab() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');

  useEffect(() => {
    fetch('/api/admin/candidates', { headers: adminHeaders() })
      .then((r) => r.json())
      .then((d) => { setCandidates(d.candidates ?? []); setLoading(false); });
  }, []);

  const filtered = candidates.filter((c) =>
    !filter || c.full_name?.toLowerCase().includes(filter.toLowerCase()) || c.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className={styles.tabHeader}>
        <input className={styles.searchInput} placeholder="Search candidates…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      {loading ? <div className={styles.tableLoading}><i className="fa-solid fa-spinner fa-spin" /> Loading…</div> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Country</th><th>Position</th><th>Applications</th><th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.full_name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.country}</td>
                <td>{c.desired_position}</td>
                <td>{c.application_count?.[0]?.count ?? 0}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Applications tab
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationsTab() {
  const [apps, setApps]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/applications?status=${statusFilter}` : '/api/admin/applications';
    const res = await fetch(url, { headers: adminHeaders() });
    const d = await res.json();
    setApps(d.applications ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: ApplicationStatus) {
    await fetch('/api/admin/applications', { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ id, status }) });
    load();
  }

  return (
    <div>
      <div className={styles.tabHeader}>
        <select className={styles.searchInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'reviewing', 'shortlisted', 'hired', 'rejected'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      {loading ? <div className={styles.tableLoading}><i className="fa-solid fa-spinner fa-spin" /> Loading…</div> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Candidate</th><th>Email</th><th>Job</th><th>Status</th><th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.candidate?.full_name ?? '—'}</strong></td>
                <td>{a.candidate?.email}</td>
                <td>{a.job?.title ?? '—'}</td>
                <td>
                  <select className={styles.inlineSelect} value={a.status} onChange={(e) => updateStatus(a.id, e.target.value as ApplicationStatus)}>
                    {['pending', 'reviewing', 'shortlisted', 'hired', 'rejected'].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inquiries tab
// ─────────────────────────────────────────────────────────────────────────────
function InquiriesTab() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/inquiries', { headers: adminHeaders() });
    const d = await res.json();
    setInquiries(d.inquiries ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: InquiryStatus) {
    await fetch('/api/admin/inquiries', { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ id, status }) });
    load();
  }

  async function del(id: string) {
    if (!confirm('Delete this inquiry?')) return;
    await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE', headers: adminHeaders() });
    load();
  }

  return (
    <div>
      <div className={styles.tabHeader}>
        <span className={styles.tabCount}>{inquiries.length} inquiries</span>
      </div>
      {loading ? <div className={styles.tableLoading}><i className="fa-solid fa-spinner fa-spin" /> Loading…</div> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th><th>Contact</th><th>Email</th><th>Positions</th><th>Urgency</th><th>Status</th><th>Date</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id}>
                <td><strong>{inq.company_name}</strong></td>
                <td>{inq.contact_person}</td>
                <td><a href={`mailto:${inq.email}`}>{inq.email}</a></td>
                <td>{inq.positions_needed}</td>
                <td>{inq.urgency}</td>
                <td>
                  <select className={styles.inlineSelect} value={inq.status} onChange={(e) => updateStatus(inq.id, e.target.value as InquiryStatus)}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
                <td>{new Date(inq.created_at).toLocaleDateString()}</td>
                <td>
                  <button className={styles.dangerBtn} onClick={() => del(inq.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin panel (post-auth)
// ─────────────────────────────────────────────────────────────────────────────
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('employers');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'employers',    label: 'Employers',    icon: 'fa-building'   },
    { key: 'jobs',         label: 'Jobs',         icon: 'fa-briefcase'  },
    { key: 'candidates',   label: 'Candidates',   icon: 'fa-users'      },
    { key: 'applications', label: 'Applications', icon: 'fa-file-lines' },
    { key: 'inquiries',    label: 'Inquiries',    icon: 'fa-envelope'   },
  ];

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div className={styles.adminHeaderInner}>
          <div className={styles.adminBrand}>
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            <span>Promex Admin</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Sign Out
          </button>
        </div>
      </header>

      <div className={styles.adminBody}>
        {/* Sidebar */}
        <nav className={styles.sidebar}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.sidebarItem} ${activeTab === t.key ? styles.sidebarItemActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className={styles.adminMain}>
          <h1 className={styles.adminPageTitle}>
            {tabs.find((t) => t.key === activeTab)?.label}
          </h1>
          {activeTab === 'jobs'         && <JobsTab />}
          {activeTab === 'employers'    && <EmployersTab />}
          {activeTab === 'candidates'   && <CandidatesTab />}
          {activeTab === 'applications' && <ApplicationsTab />}
          {activeTab === 'inquiries'    && <InquiriesTab />}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthed(true);
    }
    setChecked(true);
  }, []);

  function logout() {
    localStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
  }

  if (!checked) return null;
  if (!authed) return <LoginScreen onAuth={() => setAuthed(true)} />;
  return <AdminPanel onLogout={logout} />;
}
