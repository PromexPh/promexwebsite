'use client';

import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import styles from './page.module.css';

export default function ContactPage() {
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

      {/* Contact Info */}
      <section className={styles.contactInfoSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.contactInfoGrid}>
              <div className={styles.mapPlaceholder}>
                <iframe
                  src="https://www.google.com/maps?q=Vision+Building,+162+Pasig+Blvd,+Pasig,+Metro+Manila&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Promex Company office location"
                />
              </div>

              <div className={styles.contactDetails}>
                <span className={`${styles.sectionBadge} ${styles.sectionBadgeBlue}`}>FIND US</span>
                <h2 className={styles.contactDetailsTitle}>Contact Information</h2>
                <ul className={styles.contactDetailsList}>
                  <li>
                    <div className={styles.contactDetailIcon}><i className="fa-solid fa-location-dot" aria-hidden="true" /></div>
                    <div>
                      <p className={styles.contactDetailLabel}>OFFICE ADDRESS</p>
                      <p className={styles.contactDetailValue}>
                        <a href="https://maps.google.com/maps?cid=0x3397c93a2fbaed95:0x6b0c659848c94dde" target="_blank" rel="noopener noreferrer" className={styles.addressLink}>
                          Suite A, Second Floor, Vision Building, 162 Pasig Blvd, Pasig, 1800 Metro Manila, Philippines
                        </a>
                      </p>
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
                      <p className={styles.contactDetailValue}><a href="mailto:connect@promexph.com" className={styles.emailLink}>connect@promexph.com</a></p>
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
                  <a href="/facebook" className={styles.socialBtn}><i className="fa-brands fa-facebook-f" aria-hidden="true" /> Facebook</a>
                  <a href="/linkedin" className={styles.socialBtn}><i className="fa-brands fa-linkedin-in" aria-hidden="true" /> LinkedIn</a>
                  <a href="/instagram" className={styles.socialBtn}><i className="fa-brands fa-instagram" aria-hidden="true" /> Instagram</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
