'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

interface Job {
  id: number;
  title: string;
  company: string;
  country: string;
  industry: string;
  salary: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted: string;
}

const allJobs: Job[] = [
  { id: 1, title: 'Hotel Manager', company: 'Luxury Resort International', country: 'UAE', industry: 'Hospitality', salary: '$3,500 - $4,500', type: 'Full-time', experience: '5+ years', description: 'Seeking experienced hotel manager for luxury resort in Dubai. Must have strong leadership and operational management skills.', requirements: ["Bachelor's degree in Hospitality Management", '5+ years hotel management experience', 'Strong leadership skills', 'Excellent English communication'], benefits: ['Competitive salary', 'Accommodation provided', 'Health insurance', 'Annual bonus'], posted: '2 days ago' },
  { id: 2, title: 'Registered Nurse', company: 'National Medical Center', country: 'Saudi Arabia', industry: 'Healthcare', salary: '$2,800 - $3,500', type: 'Full-time', experience: '2+ years', description: 'Looking for dedicated registered nurses to join our growing healthcare team in Riyadh.', requirements: ['Valid nursing license', '2+ years clinical experience', 'PROMETRIC or equivalent certification', 'Good English skills'], benefits: ['Tax-free income', 'Free accommodation', 'Medical coverage', 'Paid vacation'], posted: '3 days ago' },
  { id: 3, title: 'Civil Engineer', company: 'Global Construction Corp', country: 'Qatar', industry: 'Engineering', salary: '$4,000 - $5,500', type: 'Contract', experience: '3+ years', description: 'Major infrastructure project requires experienced civil engineers for 2-year contract in Doha.', requirements: ["Bachelor's degree in Civil Engineering", '3+ years experience', 'AutoCAD proficiency', 'Project management skills'], benefits: ['High compensation', 'Project completion bonus', 'Flight tickets', 'Premium accommodation'], posted: '1 week ago' },
  { id: 4, title: 'Software Developer', company: 'Tech Solutions Asia', country: 'Singapore', industry: 'IT & Technology', salary: '$4,500 - $6,000', type: 'Full-time', experience: '3+ years', description: 'Join our innovative tech team developing cutting-edge solutions for global clients.', requirements: ["Bachelor's degree in Computer Science", 'Proficiency in JavaScript/React', '3+ years development experience', 'Strong problem-solving skills'], benefits: ['Competitive package', 'Career growth opportunities', 'Modern office environment', 'Training programs'], posted: '4 days ago' },
  { id: 5, title: 'Restaurant Manager', company: 'Global Food Chain', country: 'UAE', industry: 'Hospitality', salary: '$2,500 - $3,200', type: 'Full-time', experience: '3+ years', description: 'Manage daily operations of high-volume restaurant in Abu Dhabi. Experience with international cuisine preferred.', requirements: ['3+ years restaurant management', 'Food safety certification', 'Team leadership experience', 'Customer service excellence'], benefits: ['Competitive salary', 'Performance bonuses', 'Staff meals', 'Career advancement'], posted: '5 days ago' },
  { id: 6, title: 'Physical Therapist', company: 'Rehabilitation Center', country: 'Canada', industry: 'Healthcare', salary: '$3,800 - $4,800', type: 'Full-time', experience: '2+ years', description: 'Provide quality rehabilitation services in modern facility in Toronto.', requirements: ['Licensed Physical Therapist', '2+ years experience', 'Specialization in sports therapy preferred', 'Excellent communication skills'], benefits: ['Competitive Canadian salary', 'Immigration support', 'Health benefits', 'Professional development'], posted: '1 week ago' },
  { id: 7, title: 'Retail Store Supervisor', company: 'Fashion Retail Group', country: 'Qatar', industry: 'Retail', salary: '$2,200 - $2,800', type: 'Full-time', experience: '2+ years', description: 'Supervise store operations and staff in premium shopping mall location.', requirements: ['2+ years retail supervisory experience', 'Sales target achievement record', 'Customer service oriented', 'Inventory management skills'], benefits: ['Good salary package', 'Sales commissions', 'Housing allowance', 'Flight tickets'], posted: '6 days ago' },
  { id: 8, title: 'Manufacturing Technician', company: 'Industrial Manufacturing Inc', country: 'Japan', industry: 'Engineering', salary: '$3,200 - $4,000', type: 'Contract', experience: '1+ years', description: 'Operate and maintain manufacturing equipment in automotive parts facility.', requirements: ['Technical diploma or equivalent', 'Experience with manufacturing equipment', 'Quality control knowledge', 'Basic Japanese helpful'], benefits: ['Competitive compensation', 'Language training', 'Accommodation support', 'Overtime pay'], posted: '3 days ago' },
];

const countries = ['All Countries', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Singapore', 'Japan', 'Canada', 'Australia'];
const industries = ['All Industries', 'Hospitality', 'Healthcare', 'Retail', 'Engineering', 'IT & Technology', 'Construction'];
const jobTypes = ['All Types', 'Full-time', 'Contract', 'Part-time'];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.description.toLowerCase().includes(q);
      const matchesCountry = !selectedCountry || selectedCountry === 'All Countries' || job.country === selectedCountry;
      const matchesIndustry = !selectedIndustry || selectedIndustry === 'All Industries' || job.industry === selectedIndustry;
      const matchesType = !selectedType || selectedType === 'All Types' || job.type === selectedType;
      return matchesSearch && matchesCountry && matchesIndustry && matchesType;
    });
  }, [searchQuery, selectedCountry, selectedIndustry, selectedType]);

  function clearFilters() {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedIndustry('');
    setSelectedType('');
  }

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
              Browse hundreds of verified international job opportunities across multiple industries and countries.
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
                  {countries.map((c) => (
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
                  {industries.map((ind) => (
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
                  {jobTypes.map((t) => (
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
            <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </div>

          <div className={styles.jobsLayout}>

            {/* Job Cards */}
            <div className={styles.jobsList}>
              {filteredJobs.length === 0 && (
                <div className={styles.noJobsMessage}>
                  <i className="fa-solid fa-inbox" aria-hidden="true" />
                  <h3>No jobs found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              )}
              {filteredJobs.map((job, i) => (
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
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-clock" aria-hidden="true" /> {job.type}</span>
                      <span className={styles.jobMetaItem}><i className="fa-solid fa-user-graduate" aria-hidden="true" /> {job.experience}</span>
                    </div>

                    <p className={styles.jobDescription}>{job.description}</p>

                    <div className={styles.jobCardFooter}>
                      <span className={styles.jobPosted}>{job.posted}</span>
                      <span className={styles.jobViewDetails}>View Details →</span>
                    </div>
                  </div>
                </Reveal>
              ))}
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
                  <div className={styles.jobDetailTag}><i className="fa-solid fa-clock" aria-hidden="true" /> {selectedJob.type}</div>
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
                  <Button label="Apply for This Job" href="/apply" variant="primary" size="lg" fullWidth icon="fa-solid fa-paper-plane" iconPosition="right" />
                </div>

                <div className={styles.jobDetailsFooter}>
                  <small>Posted {selectedJob.posted}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
