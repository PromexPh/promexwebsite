'use client';

import { useState, useEffect, useCallback } from 'react';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import type { Job, JobsResponse } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/app/components/ui/Toast';

const LIMIT = 12;
const SAVED_KEY = 'promex_saved_jobs';

const INDUSTRY_COLORS: Record<string, string> = {
  'Healthcare':      '#E74C3C',
  'Engineering':     '#3498DB',
  'Hospitality':     '#E67E22',
  'IT & Technology': '#9B59B6',
  'Manufacturing':   '#1ABC9C',
  'Retail':          '#F39C12',
  'Agriculture':     '#27AE60',
  'Construction':    '#95A5A6',
};
function industryColor(ind: string): string { return INDUSTRY_COLORS[ind] ?? '#6C757D'; }

function formatSalary(job: Job): string {
  if (job.salary_min && job.salary_max) return `₱${job.salary_min.toLocaleString()} – ₱${job.salary_max.toLocaleString()}/mo`;
  if (job.salary_min) return `From ₱${job.salary_min.toLocaleString()}/mo`;
  return 'Competitive salary';
}

const COUNTRIES = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Singapore', 'Japan', 'Canada', 'Australia'];
const INDUSTRIES = ['Healthcare', 'Engineering', 'Hospitality', 'IT & Technology', 'Manufacturing', 'Retail', 'Agriculture', 'Construction'];
const JOB_TYPES = ['Full-time', 'Contract', 'Part-time'];
const SALARY_RANGES = [
  { key: 'under_2000',  label: 'Under ₱2,000/mo',        gte: 0,    lte: 1999 },
  { key: '2000_3500',  label: '₱2,000 – ₱3,500/mo',     gte: 2000, lte: 3500 },
  { key: '3500_5000',  label: '₱3,500 – ₱5,000/mo',     gte: 3500, lte: 5000 },
  { key: '5000_plus',  label: '₱5,000+/mo',              gte: 5000, lte: 0    },
];

function getSaved(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonLine} style={{ width: '60%', height: 20 }} />
      <div className={styles.skeletonLine} style={{ width: '40%', height: 14, marginTop: 8 }} />
      <div className={styles.skeletonMeta}>{[1,2,3,4].map(i => <div key={i} className={styles.skeletonPill} />)}</div>
      <div className={styles.skeletonLine} style={{ width: '90%', height: 14 }} />
      <div className={styles.skeletonLine} style={{ width: '75%', height: 14 }} />
    </div>
  );
}

type SectionKey = 'location' | 'industry' | 'jobType' | 'salary' | 'experience';

function FilterSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.filterSection}>
      <button className={styles.filterSectionHead} type="button" onClick={onToggle}>
        <span className={styles.filterSectionTitle}>{title}</span>
        <i className={`fa-solid fa-chevron-down ${styles.filterChevron} ${open ? styles.filterChevronOpen : ''}`} aria-hidden="true" />
      </button>
      <div className={`${styles.filterSectionBody} ${open ? styles.filterSectionBodyOpen : ''}`}>
        {children}
      </div>
    </div>
  );
}

interface SidebarProps {
  selectedCountries: string[];
  selectedIndustries: string[];
  selectedType: string;
  selectedSalaryRange: string;
  urgentOnly: boolean;
  openSections: Record<SectionKey, boolean>;
  onCountryToggle: (c: string) => void;
  onIndustryToggle: (i: string) => void;
  onTypeChange: (t: string) => void;
  onSalaryChange: (r: string) => void;
  onUrgentToggle: () => void;
  onSectionToggle: (s: SectionKey) => void;
  onClearAll: () => void;
  activeCount: number;
  onJobAlert: () => void;
}

function FilterSidebar(p: SidebarProps) {
  return (
    <aside className={styles.filterSidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarHeaderLeft}>
          <span className={styles.sidebarTitle}>Filter Results</span>
          {p.activeCount > 0 && <span className={styles.activeCountBadge}>{p.activeCount}</span>}
        </div>
        {p.activeCount > 0 && (
          <button className={styles.clearAllBtn} type="button" onClick={p.onClearAll}>Clear All</button>
        )}
      </div>

      <FilterSection title="Location" open={p.openSections.location} onToggle={() => p.onSectionToggle('location')}>
        <div className={styles.checkboxList}>
          {COUNTRIES.map(c => (
            <label key={c} className={styles.checkboxItem}>
              <input type="checkbox" className={styles.checkboxInput} checked={p.selectedCountries.includes(c)} onChange={() => p.onCountryToggle(c)} />
              <span className={styles.checkboxLabel}>{c}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Industry" open={p.openSections.industry} onToggle={() => p.onSectionToggle('industry')}>
        <div className={styles.checkboxList}>
          {INDUSTRIES.map(ind => (
            <label key={ind} className={styles.checkboxItem}>
              <input type="checkbox" className={styles.checkboxInput} checked={p.selectedIndustries.includes(ind)} onChange={() => p.onIndustryToggle(ind)} />
              <span className={styles.industryDot} style={{ background: industryColor(ind), width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
              <span className={styles.checkboxLabel}>{ind}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Job Type" open={p.openSections.jobType} onToggle={() => p.onSectionToggle('jobType')}>
        <div className={styles.radioList}>
          {(['', ...JOB_TYPES] as string[]).map(t => (
            <label key={t || 'all'} className={styles.radioItem}>
              <input type="radio" name="jobType" className={styles.radioInput} checked={p.selectedType === t} onChange={() => p.onTypeChange(t)} />
              <span className={styles.checkboxLabel}>{t || 'All Types'}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Salary Range" open={p.openSections.salary} onToggle={() => p.onSectionToggle('salary')}>
        <div className={styles.checkboxList}>
          {SALARY_RANGES.map(r => (
            <label key={r.key} className={styles.checkboxItem}>
              <input type="checkbox" className={styles.checkboxInput}
                checked={p.selectedSalaryRange === r.key}
                onChange={() => p.onSalaryChange(p.selectedSalaryRange === r.key ? '' : r.key)}
              />
              <span className={styles.checkboxLabel}>{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Experience Level" open={p.openSections.experience} onToggle={() => p.onSectionToggle('experience')}>
        <div className={styles.checkboxList}>
          {['Entry level (1–2 years)', 'Mid level (2–5 years)', 'Senior (5+ years)'].map(exp => (
            <label key={exp} className={styles.checkboxItem}>
              <input type="checkbox" className={styles.checkboxInput} />
              <span className={styles.checkboxLabel}>{exp}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className={styles.urgentRow}>
        <span className={styles.urgentRowLabel}>Show urgent jobs only</span>
        <button
          type="button"
          className={`${styles.toggleSwitch} ${p.urgentOnly ? styles.toggleSwitchOn : ''}`}
          onClick={p.onUrgentToggle}
          aria-checked={p.urgentOnly}
          role="switch"
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

      <button type="button" className={styles.jobAlertBtn} onClick={p.onJobAlert}>
        🔔 Create Job Alert
      </button>
    </aside>
  );
}

export default function JobsPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    location: true, industry: true, jobType: true, salary: true, experience: false,
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const { addToast, ToastContainer } = useToast();

  useEffect(() => { setSaved(getSaved()); }, []);

  useEffect(() => {
    async function loadApplied() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cand } = await supabase.from('candidates').select('id').eq('user_id', user.id).single();
      if (!cand) return;
      const { data } = await supabase.from('applications').select('job_id').eq('candidate_id', (cand as { id: string }).id);
      if (data) setAppliedJobIds(new Set(data.map((a: { job_id: string }) => a.job_id)));
    }
    loadApplied();
  }, []);

  function toggleSave(e: React.MouseEvent, jobId: string) {
    e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCountries.length > 0) params.set('countries', selectedCountries.join(','));
      if (selectedIndustries.length > 0) params.set('industries', selectedIndustries.join(','));
      if (selectedType) params.set('job_type', selectedType);
      if (urgentOnly) params.set('urgent', 'true');
      const sr = SALARY_RANGES.find(r => r.key === selectedSalaryRange);
      if (sr) {
        if (sr.gte > 0) params.set('salary_gte', String(sr.gte));
        if (sr.lte > 0) params.set('salary_lte', String(sr.lte));
      }
      if (searchQuery) params.set('q', searchQuery);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data: JobsResponse = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch {
      setJobs([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountries, selectedIndustries, selectedType, selectedSalaryRange, urgentOnly, page]);

  useEffect(() => { setPage(1); }, [searchQuery, selectedCountries, selectedIndustries, selectedType, selectedSalaryRange, urgentOnly]);
  useEffect(() => {
    const t = setTimeout(fetchJobs, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchJobs, searchQuery]);

  function onCountryToggle(c: string) {
    setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function onIndustryToggle(ind: string) {
    setSelectedIndustries(prev => prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind]);
  }
  function onSectionToggle(s: SectionKey) {
    setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));
  }
  function clearAllFilters() {
    setSelectedCountries([]); setSelectedIndustries([]);
    setSelectedType(''); setSelectedSalaryRange('');
    setUrgentOnly(false); setSearchQuery('');
  }

  const activeCount =
    selectedCountries.length + selectedIndustries.length +
    (selectedType ? 1 : 0) + (selectedSalaryRange ? 1 : 0) + (urgentOnly ? 1 : 0);

  const activePills: Array<{ label: string; onRemove: () => void }> = [
    ...selectedCountries.map(c => ({ label: c, onRemove: () => onCountryToggle(c) })),
    ...selectedIndustries.map(ind => ({ label: ind, onRemove: () => onIndustryToggle(ind) })),
    ...(selectedType ? [{ label: selectedType, onRemove: () => setSelectedType('') }] : []),
    ...(selectedSalaryRange ? [{
      label: SALARY_RANGES.find(r => r.key === selectedSalaryRange)?.label ?? '',
      onRemove: () => setSelectedSalaryRange(''),
    }] : []),
    ...(urgentOnly ? [{ label: 'Urgent only', onRemove: () => setUrgentOnly(false) }] : []),
  ];

  const displayJobs = activeTab === 'saved' ? jobs.filter(j => saved.has(j.id)) : jobs;
  const totalPages = Math.ceil(total / LIMIT);

  const sidebarProps: SidebarProps = {
    selectedCountries, selectedIndustries, selectedType, selectedSalaryRange, urgentOnly,
    openSections, onCountryToggle, onIndustryToggle, onTypeChange: setSelectedType,
    onSalaryChange: setSelectedSalaryRange, onUrgentToggle: () => setUrgentOnly(v => !v),
    onSectionToggle, onClearAll: clearAllFilters, activeCount,
    onJobAlert: () => { addToast('Job alert feature coming soon!', 'success'); },
  };

  return (
    <>
      <ToastContainer />

      {/* ── Hero ── */}
      <section className={styles.jobsHero}>
        <div className={styles.jobsHeroOverlay} />
        <div className={`container ${styles.jobsHeroContent}`}>
          <Reveal animation="fade-down">
            <div className={styles.jobsHeroBadge}><span className={styles.badgeDot} />OVERSEAS OPPORTUNITIES</div>
          </Reveal>
          <Reveal animation="fade-up" delay={120}>
            <h1 className={styles.jobsHeroHeading}>Find Your Dream <span className={styles.accent}>Overseas Job</span></h1>
          </Reveal>
          <Reveal animation="fade-up" delay={240}>
            <p className={styles.jobsHeroSub}>Browse verified international job opportunities across multiple industries and countries.</p>
          </Reveal>
        </div>
        <div className={styles.jobsHeroWave}>
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      <section className={styles.jobsSection}>
        <div className="container">

          {/* ── Mobile filter bar ── */}
          <div className={styles.mobileFilterBar}>
            <button className={styles.mobileFilterBtn} type="button" onClick={() => setFilterDrawerOpen(true)}>
              <i className="fa-solid fa-sliders" aria-hidden="true" /> Filters
              {activeCount > 0 && <span className={styles.mobileFilterBadge}>{activeCount}</span>}
            </button>
            <div className={styles.mobileSearch}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className={styles.mobileSearchInput}
              />
            </div>
          </div>

          <div className={styles.pageWrapper}>
            {/* ── Sidebar ── */}
            <FilterSidebar {...sidebarProps} />

            {/* ── Main ── */}
            <div className={styles.jobsMain}>
              {/* Desktop search */}
              <div className={styles.mainSearchBar}>
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search job title, company, or keyword..."
                  className={styles.mainSearchInput}
                />
                {searchQuery && (
                  <button className={styles.searchClearBtn} type="button" onClick={() => setSearchQuery('')}>
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Active filter pills */}
              {activePills.length > 0 && (
                <div className={styles.activePills}>
                  {activePills.map(pill => (
                    <button key={pill.label} type="button" className={styles.filterPill} onClick={pill.onRemove}>
                      {pill.label} <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}

              {/* Tab bar */}
              <div className={styles.tabBar}>
                <button type="button" className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('all')}>
                  <i className="fa-solid fa-briefcase" aria-hidden="true" /> All Jobs
                </button>
                <button type="button" className={`${styles.tabBtn} ${activeTab === 'saved' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('saved')}>
                  <i className="fa-solid fa-bookmark" aria-hidden="true" /> Saved Jobs
                  {saved.size > 0 && <span className={styles.savedCount}>{saved.size}</span>}
                </button>
              </div>

              <div className={styles.jobsCount}>
                {loading ? (
                  <span className={styles.skeletonLine} style={{ width: 120, height: 16, display: 'inline-block' }} />
                ) : (
                  <><strong>{activeTab === 'saved' ? displayJobs.length : total}</strong> {(activeTab === 'saved' ? displayJobs.length : total) === 1 ? 'job' : 'jobs'} {activeTab === 'saved' ? 'saved' : 'found'}</>
                )}
              </div>

              <div className={`${styles.jobsLayout} ${selectedJob ? styles.jobsLayoutWithPanel : ''}`}>
                <div className={styles.jobsList}>
                  {loading && <>{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</>}

                  {!loading && displayJobs.length === 0 && (
                    <div className={styles.noJobsMessage}>
                      <i className={`fa-solid ${activeTab === 'saved' ? 'fa-bookmark' : 'fa-inbox'}`} aria-hidden="true" />
                      <h3>{activeTab === 'saved' ? 'No saved jobs' : 'No jobs found'}</h3>
                      <p>{activeTab === 'saved' ? 'Bookmark jobs by clicking the ♥ icon.' : 'Try adjusting your filters.'}</p>
                    </div>
                  )}

                  {!loading && displayJobs.map((job, i) => {
                    const isApplied = appliedJobIds.has(job.id);
                    return (
                      <Reveal key={job.id} animation="fade-up" delay={i * 60}>
                        <div
                          className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.jobCardSelected : ''} ${isApplied ? styles.jobCardApplied : ''}`}
                          onClick={() => setSelectedJob(job)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && setSelectedJob(job)}
                        >
                          <div className={styles.jobCardTop}>
                            <div className={styles.industryTag}>
                              <span className={styles.industryDot} style={{ background: industryColor(job.industry) }} />
                              {job.industry}
                            </div>
                            <div className={styles.jobCardTopRight}>
                              {isApplied && <span className={styles.appliedBadge}>✓ Applied</span>}
                              {(job as { posted_by_admin?: boolean }).posted_by_admin && <span className={styles.promexBadge}>By Promex</span>}
                              {job.urgent && <span className={styles.urgentBadge}>URGENT</span>}
                            </div>
                          </div>

                          <h3 className={styles.jobTitle}>{job.title}</h3>
                          <div className={styles.jobCompany}><i className="fa-solid fa-building" aria-hidden="true" /> {job.company}</div>
                          {job.job_reference && <div className={styles.jobRef}>Ref: {job.job_reference}</div>}

                          <div className={styles.jobCardMeta}>
                            <span className={styles.jobMetaItem}><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                            <span className={styles.jobMetaItem}><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
                            <span className={styles.jobMetaItem}><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
                          </div>

                          <div className={styles.jobCardFooter}>
                            <div className={styles.jobFooterLeft}>
                              <span className={styles.jobSalary}><i className="fa-solid fa-money-bill-wave" aria-hidden="true" /> {formatSalary(job)}</span>
                              {(job.slots_available ?? 0) > 0 && (
                                <span className={styles.slotsItem}><i className="fa-solid fa-users" aria-hidden="true" /> {job.slots_available} slots</span>
                              )}
                            </div>
                            <div className={styles.jobCardActions}>
                              <button
                                type="button"
                                className={`${styles.saveBtn} ${saved.has(job.id) ? styles.saveBtnActive : ''}`}
                                onClick={e => toggleSave(e, job.id)}
                                aria-label={saved.has(job.id) ? 'Unsave job' : 'Save job'}
                              >
                                <i className={`fa-${saved.has(job.id) ? 'solid' : 'regular'} fa-bookmark`} aria-hidden="true" />
                              </button>
                              <span className={`${styles.jobViewDetails} ${isApplied ? styles.jobViewDetailsApplied : ''}`}>
                                {isApplied ? 'View Application →' : 'View Job →'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}

                  {!loading && activeTab === 'all' && totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} type="button">
                        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)} type="button">{p}</button>
                      ))}
                      <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} type="button">
                        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Details Panel */}
                {selectedJob && (
                  <div className={styles.jobDetailsPanel}>
                    <button className={styles.jobDetailsClose} onClick={() => setSelectedJob(null)} type="button" aria-label="Close">
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                    <div className={styles.jobDetailsHeader}>
                      <div className={styles.jobDetailsTitleRow}>
                        <h2 className={styles.jobDetailsTitle}>{selectedJob.title}</h2>
                        {selectedJob.urgent && <span className={styles.urgentBadge}>URGENT</span>}
                      </div>
                      <div className={styles.jobDetailsCompany}><i className="fa-solid fa-building" aria-hidden="true" /> {selectedJob.company}</div>
                      <div className={styles.jobDetailsSalary}>{formatSalary(selectedJob)}</div>
                    </div>
                    <div className={styles.jobDetailsMeta}>
                      <div className={styles.jobDetailTag}><i className="fa-solid fa-location-dot" aria-hidden="true" /> {selectedJob.country}</div>
                      <div className={styles.jobDetailTag}><i className="fa-solid fa-briefcase" aria-hidden="true" /> {selectedJob.industry}</div>
                      <div className={styles.jobDetailTag}><i className="fa-solid fa-clock" aria-hidden="true" /> {selectedJob.job_type}</div>
                      <div className={styles.jobDetailTag}><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {selectedJob.experience}</div>
                    </div>
                    <div className={styles.jobDetailsSection}>
                      <h3 className={styles.jobDetailsSectionTitle}>Job Description</h3>
                      <p>{selectedJob.description}</p>
                    </div>
                    <div className={styles.jobDetailsSection}>
                      <h3 className={styles.jobDetailsSectionTitle}>Requirements</h3>
                      <ul className={styles.jobDetailsList}>
                        {selectedJob.requirements.map(req => <li key={req}><i className="fa-solid fa-check" aria-hidden="true" /> {req}</li>)}
                      </ul>
                    </div>
                    <div className={styles.jobDetailsSection}>
                      <h3 className={styles.jobDetailsSectionTitle}>Benefits</h3>
                      <ul className={styles.jobDetailsList}>
                        {selectedJob.benefits.map(b => <li key={b}><i className="fa-solid fa-star" aria-hidden="true" /> {b}</li>)}
                      </ul>
                    </div>
                    <div className={styles.jobDetailsActions}>
                      <Button label="Apply for This Job" href={`/jobs/${selectedJob.id}`} variant="primary" size="lg" fullWidth icon="fa-solid fa-paper-plane" iconPosition="right" />
                    </div>
                    <div className={styles.jobDetailsFooter}>
                      <small>Posted {new Date(selectedJob.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile filter drawer ── */}
      {filterDrawerOpen && (
        <>
          <div className={styles.drawerBackdrop} onClick={() => setFilterDrawerOpen(false)} />
          <div className={styles.filterDrawer}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Filters {activeCount > 0 && `(${activeCount})`}</span>
              <button className={styles.drawerCloseBtn} type="button" onClick={() => setFilterDrawerOpen(false)}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <FilterSidebar {...sidebarProps} />
            </div>
            <div className={styles.drawerFooter}>
              <button className={styles.applyFiltersBtn} type="button" onClick={() => setFilterDrawerOpen(false)}>
                Apply Filters{activeCount > 0 ? ` (${activeCount} active)` : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
