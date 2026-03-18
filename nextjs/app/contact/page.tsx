'use client';

import { useState, ChangeEvent } from 'react';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import styles from './page.module.css';

const processSteps = [
  {
    icon: 'fa-briefcase',
    title: 'Client Consultation & Job Order Verification',
    description: 'We meet with employers to understand their exact manpower requirements, verify the legitimacy of job orders, and align on terms.',
  },
  {
    icon: 'fa-user-check',
    title: 'Talent Sourcing & Screening',
    description: 'Our recruitment team sources qualified candidates from our extensive database and through active job fairs, partner schools, and referral networks.',
  },
  {
    icon: 'fa-clipboard-check',
    title: 'Skills Assessment & Training',
    description: 'Shortlisted candidates undergo rigorous trade testing, language assessment, and pre-departure orientation to ensure they are fully prepared. Our in-house trade testing and housekeeping training programs are conducted at our certified training facility.',
    link: { text: 'Circle Test Training and Assessment Center', url: 'https://circletesttvi.gnomio.com/my/' },
  },
  {
    icon: 'fa-file-lines',
    title: 'Documentation & Visa Processing',
    description: 'We handle all documentation — employment contracts, medical exams, authentication, visa applications, and OWWA/DMW processing.',
  },
  {
    icon: 'fa-plane-departure',
    title: 'Deployment & Post-Deployment Support',
    description: 'We arrange flights, coordinate with employers on arrival, and provide ongoing post-deployment support to ensure smooth integration.',
  },
];

const vacancies = [
  { category: 'Healthcare',    title: 'Registered Nurse',         location: 'Saudi Arabia', slots: 50,  urgent: true  },
  { category: 'Engineering',   title: 'Civil Engineer',            location: 'UAE',          slots: 20,  urgent: false },
  { category: 'Hospitality',   title: 'Head Chef',                 location: 'Qatar',        slots: 10,  urgent: true  },
  { category: 'Manufacturing', title: 'Machine Operator',          location: 'South Korea',  slots: 30,  urgent: false },
  { category: 'Healthcare',    title: 'Caregiver',                 location: 'Germany',      slots: 40,  urgent: true  },
  { category: 'IT',            title: 'Software Developer',        location: 'Singapore',    slots: 15,  urgent: false },
  { category: 'Engineering',   title: 'Welder (ASME)',             location: 'Kuwait',       slots: 25,  urgent: true  },
  { category: 'Hospitality',   title: 'Housekeeping Supervisor',   location: 'UK',           slots: 12,  urgent: false },
];

const desiredPositions = [
  'Registered Nurse', 'Caregiver', 'Civil Engineer', 'Welder (ASME)',
  'Machine Operator', 'Head Chef', 'Housekeeping Supervisor', 'Software Developer', 'Other',
];

const educationLevels = [
  'High School Diploma', 'Vocational / Technical Certificate', 'Associate Degree',
  "Bachelor's Degree", "Master's Degree", 'Doctorate / PhD',
];

const categoryClassMap: Record<string, string> = {
  Healthcare:    'catHealthcare',
  Engineering:   'catEngineering',
  Hospitality:   'catHospitality',
  Manufacturing: 'catManufacturing',
  IT:            'catIt',
};

export default function ContactPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  }

  return (
    <>
      <PageHero
        badge="Get In Touch"
        heading="Contact"
        accentText="Promex Company"
        subText="Whether you're looking to hire skilled Filipino professionals or seeking international employment, we're here to help you every step of the way."
        bgImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      {/* Recruitment Process */}
      <section className={styles.processSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>HOW IT WORKS</span>
              <h2 className={styles.sectionTitle}>Our Recruitment Process</h2>
              <p className={styles.sectionSub}>
                A transparent, end-to-end recruitment process designed for both employers and job seekers.
              </p>
            </div>
          </Reveal>

          <div className={styles.timeline}>
            {processSteps.map((step, i) => (
              <Reveal key={step.title} animation="fade-up" delay={i * 100}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineNumber}>{i + 1}</div>
                  <div className={`${styles.timelineLine} ${i === processSteps.length - 1 ? styles.timelineLineLast : ''}`} />
                  <div className={styles.timelineCard}>
                    <div className={styles.timelineIconWrap}>
                      <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
                    </div>
                    <div className={styles.timelineBody}>
                      <h3 className={styles.timelineCardTitle}>{step.title}</h3>
                      <p className={styles.timelineCardDesc}>{step.description}</p>
                      {step.link && (
                        <div className={styles.timelineLink}>
                          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                          <a href={step.link.url} target="_blank" rel="noopener noreferrer">
                            {step.link.text}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section id="employers" className={styles.employersSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.employersGrid}>
              <div className={styles.employersInfo}>
                <span className={`${styles.sectionBadge} ${styles.sectionBadgeBlue}`}>FOR EMPLOYERS</span>
                <h2 className={styles.employersTitle}>Looking for Skilled Professionals?</h2>
                <p className={styles.employersDesc}>
                  Tell us about your manpower requirements and we&apos;ll match you with the most qualified Filipino professionals. Our team will respond within 24–48 business hours.
                </p>
                <ul className={styles.employersChecklist}>
                  <li><i className="fa-regular fa-circle-check" aria-hidden="true" /> Customized recruitment solutions</li>
                  <li><i className="fa-regular fa-circle-check" aria-hidden="true" /> Pre-screened &amp; trade-tested candidates</li>
                  <li><i className="fa-regular fa-circle-check" aria-hidden="true" /> Full documentation support</li>
                  <li><i className="fa-regular fa-circle-check" aria-hidden="true" /> Post-deployment follow-through</li>
                </ul>
              </div>

              <div className={styles.employersFormCard}>
                <form className={styles.employersForm} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Company Name <span className={styles.req}>*</span></label>
                      <input type="text" placeholder="e.g. Gulf Medical University" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Contact Person <span className={styles.req}>*</span></label>
                      <input type="text" placeholder="Full name" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email Address <span className={styles.req}>*</span></label>
                      <input type="email" placeholder="company@email.com" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number <span className={styles.req}>*</span></label>
                      <input type="tel" placeholder="+971 xx xxx xxxx" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Country <span className={styles.req}>*</span></label>
                      <input type="text" placeholder="e.g. United Arab Emirates" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Industry <span className={styles.req}>*</span></label>
                      <input type="text" placeholder="e.g. Healthcare" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Number of Workers Needed <span className={styles.req}>*</span></label>
                      <input type="number" placeholder="e.g. 20" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Job Title / Position <span className={styles.req}>*</span></label>
                      <input type="text" placeholder="e.g. Registered Nurse" />
                    </div>
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>Job Description</label>
                    <textarea rows={4} placeholder="Describe the roles, responsibilities, and requirements..." />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>Preferred Start Date <span className={styles.req}>*</span></label>
                    <input type="date" />
                  </div>
                  <button type="submit" className={`${styles.submitBtn} ${styles.submitBtnBlue}`}>
                    <i className="fa-regular fa-paper-plane" aria-hidden="true" /> Submit Employer Inquiry
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* For Job Seekers */}
      <section id="apply" className={styles.seekersSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={`${styles.sectionBadge} ${styles.sectionBadgeGreen}`}>FOR JOB SEEKERS</span>
              <h2 className={styles.sectionTitle}>Seeking International Employment?</h2>
              <p className={styles.sectionSub}>
                Browse our open vacancies and apply online. Our recruitment team will review your application and contact you for next steps.
              </p>
            </div>
          </Reveal>

          <Reveal animation="fade-up">
            <h3 className={styles.subsectionTitle}>Open Vacancies</h3>
            <div className={styles.vacanciesGrid}>
              {vacancies.map((job) => (
                <div key={job.title} className={styles.vacancyCard}>
                  <div className={styles.vacancyTop}>
                    <span className={`${styles.vacancyCategory} ${styles[categoryClassMap[job.category]]}`}>
                      {job.category}
                    </span>
                    {job.urgent && <span className={styles.vacancyUrgent}>Urgent</span>}
                  </div>
                  <h4 className={styles.vacancyTitle}>{job.title}</h4>
                  <p className={styles.vacancyLocation}>
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> {job.location}
                  </p>
                  <p className={styles.vacancySlots}>{job.slots} slots available</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal animation="fade-up">
            <div className={styles.appFormCard}>
              <h3 className={styles.appFormTitle}>Job Application Form</h3>
              <form className={styles.appForm} onSubmit={(e) => e.preventDefault()}>
                <div className={`${styles.formRow} ${styles.formRow3}`}>
                  <div className={styles.formGroup}>
                    <label>Full Name <span className={styles.req}>*</span></label>
                    <input type="text" placeholder="Your full name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address <span className={styles.req}>*</span></label>
                    <input type="email" placeholder="your@email.com" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number <span className={styles.req}>*</span></label>
                    <input type="tel" placeholder="+63 9xx xxx xxxx" />
                  </div>
                </div>
                <div className={`${styles.formRow} ${styles.formRow3}`}>
                  <div className={styles.formGroup}>
                    <label>Date of Birth <span className={styles.req}>*</span></label>
                    <input type="date" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nationality <span className={styles.req}>*</span></label>
                    <input type="text" placeholder="e.g. Filipino" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Current Location <span className={styles.req}>*</span></label>
                    <input type="text" placeholder="e.g. Metro Manila" />
                  </div>
                </div>
                <div className={`${styles.formRow} ${styles.formRow3}`}>
                  <div className={styles.formGroup}>
                    <label>Desired Position <span className={styles.req}>*</span></label>
                    <select defaultValue="">
                      <option value="" disabled>Select a position...</option>
                      {desiredPositions.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Years of Experience <span className={styles.req}>*</span></label>
                    <input type="number" placeholder="0" min={0} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Highest Education <span className={styles.req}>*</span></label>
                    <select defaultValue="">
                      <option value="" disabled>Select education level...</option>
                      {educationLevels.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>Resume / CV Upload <span className={styles.req}>*</span></label>
                  <label className={styles.fileUploadArea} htmlFor="resumeUpload">
                    {selectedFile ? (
                      <>
                        <i className="fa-regular fa-file-lines" aria-hidden="true" />
                        <span className={styles.uploadFilename}>{selectedFile}</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true" />
                        <span className={styles.uploadLabel}>Click to upload or drag and drop</span>
                        <span className={styles.uploadHint}>PDF, DOCX, up to 5MB</span>
                      </>
                    )}
                  </label>
                  <input id="resumeUpload" type="file" accept=".pdf,.docx" onChange={onFileSelected} hidden />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>Cover Letter</label>
                  <textarea rows={4} placeholder="Tell us about yourself, your experience, and why you want to work abroad..." />
                </div>
                <button type="submit" className={`${styles.submitBtn} ${styles.submitBtnGreen}`}>
                  <i className="fa-regular fa-paper-plane" aria-hidden="true" /> Submit Application
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact Info */}
      <section className={styles.contactInfoSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.contactInfoGrid}>
              <div className={styles.mapPlaceholder}>
                <div className={styles.mapInner}>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <p className={styles.mapAddress}>
                    Suite A, 2/F Vision Building,<br />
                    162 Pasig Blvd, Pasig, 1800 Metro Manila
                  </p>
                  <a
                    href="https://maps.google.com/?q=Vision+Building+162+Pasig+Blvd+Pasig+Metro+Manila+Philippines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLinkBtn}
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>

              <div className={styles.contactDetails}>
                <span className={`${styles.sectionBadge} ${styles.sectionBadgeBlue}`}>FIND US</span>
                <h2 className={styles.contactDetailsTitle}>Contact Information</h2>
                <ul className={styles.contactDetailsList}>
                  <li>
                    <div className={styles.contactDetailIcon}><i className="fa-solid fa-location-dot" aria-hidden="true" /></div>
                    <div>
                      <p className={styles.contactDetailLabel}>OFFICE ADDRESS</p>
                      <p className={styles.contactDetailValue}>Suite A, Second Floor, Vision Building, 162 Pasig Blvd, Pasig, 1800 Metro Manila, Philippines</p>
                    </div>
                  </li>
                  <li>
                    <div className={`${styles.contactDetailIcon} ${styles.contactDetailIconGreen}`}><i className="fa-solid fa-phone" aria-hidden="true" /></div>
                    <div>
                      <p className={styles.contactDetailLabel}>PHONE NUMBERS</p>
                      <p className={styles.contactDetailValue}>+63 2 7746 4689</p>
                    </div>
                  </li>
                  <li>
                    <div className={styles.contactDetailIcon}><i className="fa-regular fa-envelope" aria-hidden="true" /></div>
                    <div>
                      <p className={styles.contactDetailLabel}>EMAIL ADDRESS</p>
                      <p className={styles.contactDetailValue}>inquiries@promexph.com</p>
                    </div>
                  </li>
                  <li>
                    <div className={`${styles.contactDetailIcon} ${styles.contactDetailIconGreen}`}><i className="fa-regular fa-id-badge" aria-hidden="true" /></div>
                    <div>
                      <p className={styles.contactDetailLabel}>LICENSE NUMBER</p>
                      <p className={styles.contactDetailValue}>149-LB-051316-R</p>
                    </div>
                  </li>
                </ul>
                <p className={styles.followUsLabel}>FOLLOW US</p>
                <div className={styles.socialBtns}>
                  <a href="#" className={styles.socialBtn}><i className="fa-brands fa-facebook-f" aria-hidden="true" /> Facebook</a>
                  <a href="#" className={styles.socialBtn}><i className="fa-brands fa-linkedin-in" aria-hidden="true" /> LinkedIn</a>
                  <a href="#" className={styles.socialBtn}><i className="fa-brands fa-instagram" aria-hidden="true" /> Instagram</a>
                  <a href="#" className={styles.socialBtn}><i className="fa-brands fa-x-twitter" aria-hidden="true" /> Twitter</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
