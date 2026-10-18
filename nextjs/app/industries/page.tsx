import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const industries = [
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    tagline: 'Caring professionals for the world',
    description: 'We provide highly qualified healthcare professionals trained to international clinical standards. Our nurses, caregivers, and allied health workers are placed in top hospitals and care facilities across the Middle East, Europe, and Asia.',
    image: '/images/industries_images/healthcare.jpg',
    badge: 'High Demand',
    applyUrl: '/jobs?industry=Healthcare',
    roles: ['Registered Nurses (RN)', 'Caregivers & Home Health Aides', 'Radiographers & Radiologic Technologists', 'Medical Technologists', 'Physical & Occupational Therapists', 'Dental Technicians & Assistants'],
  },
  {
    id: 'engineering',
    name: 'Engineering & Construction',
    tagline: 'Building the world\'s infrastructure',
    description: 'Promex supplies seasoned engineering and construction professionals for large-scale infrastructure, oil & gas, and industrial projects. Our workers are trade-tested, safety-certified, and ready for demanding site conditions.',
    image: '/images/industries_images/engineering.jpg',
    badge: 'High Demand',
    applyUrl: '/jobs?industry=Engineering',
    roles: ['Civil & Structural Engineers', 'Welders & Pipefitters', 'Electrical Engineers & Technicians', 'Heavy Equipment Operators', 'Safety Officers (HSE)', 'Project Managers & Supervisors'],
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    tagline: 'Delivering world-class guest experiences',
    description: 'From five-star hotels to cruise lines, Promex connects hospitality employers with skilled Filipino service professionals known globally for warmth, diligence, and high service standards.',
    image: '/images/industries_images/hospitality.jpg',
    badge: undefined,
    applyUrl: '/jobs?industry=Hospitality',
    roles: ['Hotel Front Desk & Concierge', 'F&B Servers & Bartenders', 'Executive & Sous Chefs', 'Housekeeping Supervisors', 'Cruise Ship Crew', 'Resort & Spa Attendants'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Production',
    tagline: 'Powering global production lines',
    description: 'We supply production-ready workers for factories, assembly lines, and processing plants. Our candidates are vetted for technical aptitude, quality awareness, and adherence to international safety standards.',
    image: '/images/industries_images/manufacturing.jpg',
    badge: undefined,
    applyUrl: '/jobs?industry=Manufacturing',
    roles: ['Production Line Operators', 'Quality Control Inspectors', 'CNC Machine Operators', 'Warehouse & Logistics Staff', 'Forklift & Material Handling', 'Factory Supervisors'],
  },
  {
    id: 'it-telecom',
    name: 'IT & Telecommunications',
    tagline: 'Connecting the digital economy',
    description: 'Promex bridges the gap between global tech employers and highly skilled Filipino IT professionals. From software development to network infrastructure, our candidates are technically sharp and globally competitive.',
    image: '/images/industries_images/it.jpg',
    badge: 'Growing Sector',
    applyUrl: '/jobs?industry=IT+%26+Technology',
    roles: ['Software Developers & Engineers', 'Network & Systems Administrators', 'IT Support & Help Desk', 'Cybersecurity Analysts', 'Data Analysts & BI Specialists', 'Telecom Field Technicians'],
  },
  {
    id: 'domestic',
    name: 'Domestic & Household Services',
    tagline: 'Trusted help for every household',
    description: 'Filipino household workers are among the most trusted in the world. Promex places trained, background-checked domestic helpers, nannies, and household managers for families across the Middle East and beyond.',
    image: '/images/industries_images/domestic.jpg',
    badge: 'High Demand',
    applyUrl: '/jobs',
    roles: ['Household Service Workers (HSW)', 'Nannies & Childcare Workers', 'Elderly & Companion Caregivers', 'Private Cooks & Kitchen Help', 'Personal Drivers', 'Household Managers'],
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    tagline: 'Trusted numbers behind global business',
    description: 'Promex connects international employers with highly trained Filipino finance professionals who bring precision, integrity, and global accounting standards to their roles. Our candidates are proficient in international financial reporting and compliance frameworks.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    imageAlt: 'Finance and accounting professionals',
    badge: undefined,
    applyUrl: '/jobs?industry=Finance',
    roles: ['Certified Public Accountants (CPA)', 'Financial Analysts & Controllers', 'Internal & External Auditors', 'Tax Specialists & Compliance Officers', 'Bookkeepers & Accounting Clerks', 'Treasury & Investment Analysts'],
  },
];

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        badge="Sectors We Cover"
        heading="Industries We"
        accentText="Serve"
        subText="We provide skilled Filipino professionals for a wide range of industries worldwide. Explore the sectors where we have the deepest expertise and the strongest global networks."
        bgImage="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      {/* Industry Cards */}
      <section className={styles.indList}>
        <div className="container">
          {industries.map((ind, i) => (
            <Reveal key={ind.id} animation="fade-up" delay={60}>
              <div className={`${styles.indCard} ${i % 2 !== 0 ? styles.indCardReverse : ''}`}>
                <div className={styles.indImagePanel}>
                  <Image
                    src={ind.image}
                    alt={'imageAlt' in ind ? (ind as { imageAlt: string }).imageAlt : ind.name}
                    fill
                    className={styles.indImage}
                    sizes="(max-width: 900px) 100vw, 45vw"
                  />
                </div>

                <div className={styles.indContentPanel}>
                  <div className={styles.indContentTop}>
                    <div>
                      <h2 className={styles.indName}>{ind.name}</h2>
                      <p className={styles.indTagline}>{ind.tagline}</p>
                    </div>
                    {ind.badge && <span className={styles.indBadge}>{ind.badge}</span>}
                  </div>

                  <p className={styles.indDesc}>{ind.description}</p>

                  <div className={styles.indRoles}>
                    <span className={styles.rolesLabel}>ROLES WE PLACE</span>
                    <ul className={styles.rolesGrid}>
                      {ind.roles.map((role) => (
                        <li key={role}>
                          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                          {role}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={ind.applyUrl} className={styles.indApplyLink}>
                    Apply for {ind.name} positions
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.indCta}>
        <div className={styles.ctaBlobL} aria-hidden="true" />
        <div className={styles.ctaBlobR} aria-hidden="true" />
        <div className={`container ${styles.ctaInner}`}>
          <Reveal animation="fade-up">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaHeading}>Don&apos;t See Your Industry?</h2>
              <p className={styles.ctaSub}>
                Promex has experience across many other sectors. Contact us to discuss your specific workforce needs and we&apos;ll find the right solution.
              </p>
              <div className={styles.ctaActions}>
                <Button label="Request Talent" href="/employer-inquiry" variant="primary" size="lg" />
                <Button label="Contact Us" href="/contact" variant="accent" size="lg" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
