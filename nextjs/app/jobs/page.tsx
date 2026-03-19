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

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonLine} style={{ width: '60%', height: 20 }} />
      <div className={styles.skeletonLine} style={{ width: '40%', height: 14, marginTop: 8 }} />
      <div className={styles.skeletonMeta}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonPill} />
        ))}
      </div>
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCountry, selectedIndustry, selectedType]);

  useEffect(() => {
    const timer = setTimeout(fetchJobs, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchJobs, searchQuery]);

  function clearFilters() {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedIndustry('');
    setSelectedType('');
    setPage(1);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {/* Hero */}
      <section className={styles.jobsHero}>
        <div className={styles.jobsHeroOverlay} />
        <div className={`container ${styles.jobsHeroContent}`}>
          <Reveal animation="fade-down">
            <div className={styles.jobsHeroBadge}>
              <span className={styles.badgeDot} />
              OVERSEAS OPPORTUNITIES
            </div>
          </Reveal>
          <Reveal animation="fade-up" delay={120}>
            <h1 className={styles.jobsHeroHeading}>
              Find Your Dream <span className={styles.accent}>Overseas Job</span>
            </h1>
          </Reveal>
          <Reveal animation="fade-up" delay={240}>
            <p className={styles.jobsHeroSub}>
              Browse verified international job opportunities across multiple industries and countries.
            </p>
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

      {/* Jobs Section */}
      <section className={styles.jobsSection}>
        <div className="container">

          {/* Filters */}
          <Reveal animation="fade-up">
            <div className={styles.jobsFilters}>
              <div className={styles.filterGroup}>
                <label htmlFor="country-filter">
                  <i className="fa-solid fa-globe" aria-hidden="true" /> Country
                </label>
                <select
                  id="country-filter"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className={styles.filterSelect}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c === 'All Countries' ? '' : c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="industry-filter">
                  <i className="fa-solid fa-briefcase" aria-hidden="true" /> Industry
                </label>
                <select
                  id="industry-filter"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className={styles.filterSelect}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind === 'All Industries' ? '' : ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="type-filter">
                  <i className="fa-solid fa-clock" aria-hidden="true" /> Job Type
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.filterSelect}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>
                  ))}
                </select>
              </div>

              <button className={styles.filterClearBtn} onClick={clearFilters} type="button">
                <i className="fa-solid fa-rotate-left" aria-hidden="true" /> Clear Filters
              </button>
            </div>
          </Reveal>

          <div className={styles.jobsCount}>
            {loading ? (
              <span className={styles.skeletonLine} style={{ width: 120, height: 16, display: 'inline-block' }} />
            ) : (
              <><strong>{total}</strong> {total === 1 ? 'job' : 'jobs'} found</>
            )}
          </div>

          <div className={styles.jobsLayout}>

            {/* Job Cards */}
            <div className={styles.jobsList}>
              {loading && (
                <>
                  {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                </>
              )}

              {!loading && jobs.length === 0 && (
                <div className={styles.noJobsMessage}>
                  <i className="fa-solid fa-inbox" aria-hidden="true" />
                  <h3>No jobs found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              )}

              {!loading && jobs.map((job, i) => (
                <Reveal key={job.id} animation="fade-up" delay={i * 60}>
                  <div
                    className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.jobCardSelected : ''}`}
                    onClick={() => setSelectedJob(job)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedJob(job)}
                  >
                    <div className={styles.jobCardHeader}>
                      <div className={styles.jobCardLeft}>
                        <h3 className={styles.jobTitle}>{job.title}</h3>
                        <div className={styles.jobCompany}>
                          <i className="fa-solid fa-building" aria-hidden="true" /> {job.company}
                        </div>
                      </div>
                      <span className={styles.jobSalary}>{job.salary}</span>
                    </div>

                    <div className={styles.jobCardMeta}>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.country}</span>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-briefcase" aria-hidden="true" /> {job.industry}</span>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-clock" aria-hidden="true" /> {job.job_type}</span>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
                    </div>

                    <p className={styles.jobDescription}>{job.description}</p>

                    <div className={styles.jobCardFooter}>
                      <span className={styles.jobPosted}>
                        {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={styles.jobViewDetails}>View Details →</span>
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    type="button"
                  >
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(p)}
                      type="button"
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    type="button"
                  >
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
                  <h2 className={styles.jobDetailsTitle}>{selectedJob.title}</h2>
                  <div className={styles.jobDetailsCompany}>
                    <i className="fa-solid fa-building" aria-hidden="true" /> {selectedJob.company}
                  </div>
                  <div className={styles.jobDetailsSalary}>{selectedJob.salary}/month</div>
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
                    {selectedJob.requirements.map((req) => (
                      <li key={req}><i className="fa-solid fa-check" aria-hidden="true" /> {req}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.jobDetailsSection}>
                  <h3 className={styles.jobDetailsSectionTitle}>Benefits</h3>
                  <ul className={styles.jobDetailsList}>
                    {selectedJob.benefits.map((b) => (
                      <li key={b}><i className="fa-solid fa-star" aria-hidden="true" /> {b}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.jobDetailsActions}>
                  <Button
                    label="Apply for This Job"
                    href={`/jobs/${selectedJob.id}`}
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon="fa-solid fa-paper-plane"
                    iconPosition="right"
                  />
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
