'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import type { Job, JobsResponse } from '@/lib/types';

const COUNTRIES = ['All Countries', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Singapore', 'Japan', 'Canada', 'Australia'];
const INDUSTRIES = ['All Industries', 'Hospitality', 'Healthcare', 'Retail', 'Engineering', 'IT & Technology', 'Construction'];
const JOB_TYPES = ['All Types', 'Full-time', 'Contract', 'Part-time'];
const LIMIT = 12;
const SAVED_KEY = 'promex_saved_jobs';

const INDUSTRY_COLORS: Record<string, string> = {
  'Healthcare':       '#E74C3C',
  'Engineering':      '#3498DB',
  'Hospitality':      '#E67E22',
  'IT & Technology':  '#9B59B6',
  'Manufacturing':    '#1ABC9C',
  'Retail':           '#F39C12',
  'Agriculture':      '#27AE60',
  'Construction':     '#95A5A6',
};
function industryColor(ind: string): string { return INDUSTRY_COLORS[ind] ?? '#6C757D'; }

function formatSalary(job: Job): string {
  if (job.salary_min && job.salary_max) return `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}/mo`;
  if (job.salary_min) return `From $${job.salary_min.toLocaleString()}/mo`;
  return 'Competitive salary';
}

function getSaved(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonLine} style={{ width: '60%', height: 20 }} />
      <div className={styles.skeletonLine} style={{ width: '40%', height: 14, marginTop: 8 }} />
      <div className={styles.skeletonMeta}>{[1, 2, 3, 4].map((i) => <div key={i} className={styles.skeletonPill} />)}</div>
      <div className={styles.skeletonLine} style={{ width: '90%', height: 14 }} />
      <div className={styles.skeletonLine} style={{ width: '75%', height: 14 }} />
    </div>
  );
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => { setSaved(getSaved()); }, []);

  function toggleSave(e: React.MouseEvent, jobId: string) {
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.set('country', selectedCountry);
      if (selectedIndustry) params.set('industry', selectedIndustry);
      if (selectedType) params.set('job_type', selectedType);
      if (searchQuery) params.set('q', searchQuery);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data: JobsResponse = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountry, selectedIndustry, selectedType, page]);

  useEffect(() => { setPage(1); }, [searchQuery, selectedCountry, selectedIndustry, selectedType]);
  useEffect(() => {
    const timer = setTimeout(fetchJobs, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchJobs, searchQuery]);

  function clearFilters() {
    setSearchQuery(''); setSelectedCountry(''); setSelectedIndustry(''); setSelectedType(''); setPage(1);
  }

  const displayJobs = activeTab === 'saved' ? jobs.filter((j) => saved.has(j.id)) : jobs;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {/* Hero */}
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
          <Reveal animation="fade-up" delay={360}>
            <div className={styles.heroSearchBar}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company, or keyword..."
                className={styles.heroSearchInput}
              />
            </div>
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
          {/* Filters */}
          <Reveal animation="fade-up">
            <div className={styles.jobsFilters}>
              <div className={styles.filterGroup}>
                <label htmlFor="country-filter"><i className="fa-solid fa-globe" aria-hidden="true" /> Country</label>
                <select id="country-filter" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className={styles.filterSelect}>
                  {COUNTRIES.map((c) => <option key={c} value={c === 'All Countries' ? '' : c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="industry-filter"><i className="fa-solid fa-briefcase" aria-hidden="true" /> Industry</label>
                <select id="industry-filter" value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className={styles.filterSelect}>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind === 'All Industries' ? '' : ind}>{ind}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label htmlFor="type-filter"><i className="fa-solid fa-clock" aria-hidden="true" /> Job Type</label>
                <select id="type-filter" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={styles.filterSelect}>
                  {JOB_TYPES.map((t) => <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>)}
                </select>
              </div>
              <button className={styles.filterClearBtn} onClick={clearFilters} type="button">
                <i className="fa-solid fa-rotate-left" aria-hidden="true" /> Clear Filters
              </button>
            </div>
          </Reveal>

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

          <div className={styles.jobsLayout}>
            {/* Job Cards */}
            <div className={styles.jobsList}>
              {loading && <>{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</>}

              {!loading && displayJobs.length === 0 && (
                <div className={styles.noJobsMessage}>
                  <i className={`fa-solid ${activeTab === 'saved' ? 'fa-bookmark' : 'fa-inbox'}`} aria-hidden="true" />
                  <h3>{activeTab === 'saved' ? 'No saved jobs' : 'No jobs found'}</h3>
                  <p>{activeTab === 'saved' ? 'Bookmark jobs by clicking the ♥ icon on any listing.' : 'Try adjusting your filters or search terms'}</p>
                </div>
              )}

              {!loading && displayJobs.map((job, i) => (
                <Reveal key={job.id} animation="fade-up" delay={i * 60}>
                  <div
                    className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.jobCardSelected : ''}`}
                    onClick={() => setSelectedJob(job)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedJob(job)}
                  >
                    {/* Top row: industry tag + URGENT */}
                    <div className={styles.jobCardTop}>
                      <div className={styles.industryTag}>
                        <span className={styles.industryDot} style={{ background: industryColor(job.industry) }} />
                        {job.industry}
                      </div>
                      <div className={styles.jobCardTopRight}>
                        {(job as { posted_by_admin?: boolean }).posted_by_admin && (
                          <span className={styles.promexBadge}>By Promex</span>
                        )}
                        {job.urgent && <span className={styles.urgentBadge}>URGENT</span>}
                      </div>
                    </div>

                    {/* Title + company */}
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <div className={styles.jobCompany}><i className="fa-solid fa-building" aria-hidden="true" /> {job.company}</div>

                    {/* Meta row */}
                    <div className={styles.jobCardMeta}>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
                    </div>

                    {/* Divider + salary + slots + button */}
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
                          onClick={(e) => toggleSave(e, job.id)}
                          aria-label={saved.has(job.id) ? 'Unsave job' : 'Save job'}
                        >
                          <i className={`fa-${saved.has(job.id) ? 'solid' : 'regular'} fa-bookmark`} aria-hidden="true" />
                        </button>
                        <span className={styles.jobViewDetails}>View Job →</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Pagination */}
              {!loading && activeTab === 'all' && totalPages > 1 && (
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} type="button">
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)} type="button">{p}</button>
                  ))}
                  <button className={styles.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} type="button">
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
                    {selectedJob.requirements.map((req) => <li key={req}><i className="fa-solid fa-check" aria-hidden="true" /> {req}</li>)}
                  </ul>
                </div>
                <div className={styles.jobDetailsSection}>
                  <h3 className={styles.jobDetailsSectionTitle}>Benefits</h3>
                  <ul className={styles.jobDetailsList}>
                    {selectedJob.benefits.map((b) => <li key={b}><i className="fa-solid fa-star" aria-hidden="true" /> {b}</li>)}
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
      </section>
    </>
  );
}
