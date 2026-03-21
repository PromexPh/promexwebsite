import { Building2, UserCheck, CheckCircle } from 'lucide-react';
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

      {/* Audience Split */}
      <section className={styles.audienceSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.audienceGrid}>

              {/* Employer Card */}
              <div className={`${styles.audienceCard} ${styles.audienceCardBlue}`}>
                <div className={styles.audienceIconWrap} style={{ background: 'rgba(79,163,199,0.12)', color: '#4FA3C7' }}>
                  <Building2 size={28} />
                </div>
                <h3 className={styles.audienceCardTitle}>Looking to Hire?</h3>
                <p className={styles.audienceCardDesc}>
                  Submit a detailed hiring inquiry and our corporate recruitment team will match you with the most qualified Filipino professionals within 24–48 hours.
                </p>
                <ul className={styles.audienceChecklist}>
                  {['Customized recruitment solutions', 'Pre-screened & trade-tested candidates', 'Full documentation support', 'Post-deployment follow-through'].map((item) => (
                    <li key={item}>
                      <CheckCircle size={16} className={styles.checkIcon} />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/employer-inquiry" className={`${styles.audiencePrimaryBtn} ${styles.audiencePrimaryBtnBlue}`}>
                  Submit Hiring Inquiry →
                </a>
                <div className={styles.audienceDivider}><span>or</span></div>
                <div className={styles.audienceSecondaryBtns}>
                  <a href="/employer/register?mode=login" className={`${styles.audienceOutlineBtn} ${styles.audienceOutlineBtnBlue}`}>Sign In as Employer</a>
                  <a href="/employer/register" className={`${styles.audienceOutlineBtn} ${styles.audienceOutlineBtnBlue}`}>Register as Employer</a>
                </div>
                <p className={styles.audienceHelper}>
                  Already registered? Sign in to post jobs and manage applications directly from your dashboard.
                </p>
              </div>

              {/* Candidate Card */}
              <div className={`${styles.audienceCard} ${styles.audienceCardGreen}`}>
                <div className={styles.audienceIconWrap} style={{ background: 'rgba(5,150,105,0.12)', color: '#059669' }}>
                  <UserCheck size={28} />
                </div>
                <h3 className={styles.audienceCardTitle}>Looking for Work Abroad?</h3>
                <p className={styles.audienceCardDesc}>
                  Create your free Promex account to browse overseas job opportunities and apply directly. Joining is free — no placement fees, ever.
                </p>
                <ul className={styles.audienceChecklist}>
                  {['Browse 30+ countries of job opportunities', 'Apply with one profile', 'Track your applications in real time', 'Zero placement fees — guaranteed'].map((item) => (
                    <li key={item}>
                      <CheckCircle size={16} className={styles.checkIcon} />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/candidate/register" className={`${styles.audiencePrimaryBtn} ${styles.audiencePrimaryBtnGreen}`}>
                  Create Free Account →
                </a>
                <div className={styles.audienceDivider}><span>or</span></div>
                <a href="/candidate/register?mode=login" className={`${styles.audienceOutlineBtn} ${styles.audienceOutlineBtnGreen} ${styles.audienceOutlineBtnFull}`}>
                  Sign In to Your Account
                </a>
              </div>

            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
