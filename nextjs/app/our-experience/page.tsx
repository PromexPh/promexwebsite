'use client';

import { useState } from 'react';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

type Region = 'Middle East' | 'Europe' | 'Asia';

const regions: Region[] = ['Middle East', 'Europe', 'Asia'];

const allCountries = [
  { flag: '🇸🇦', name: 'Saudi Arabia', deployed: '15,000+', sectors: 'Healthcare, Engineering, Retail', region: 'Middle East' as Region },
  { flag: '🇦🇪', name: 'UAE',           deployed: '12,000+', sectors: 'Hospitality, IT, Construction',  region: 'Middle East' as Region },
  { flag: '🇶🇦', name: 'Qatar',         deployed: '8,000+',  sectors: 'Construction, Healthcare, Hospitality', region: 'Middle East' as Region },
  { flag: '🇰🇼', name: 'Kuwait',        deployed: '5,000+',  sectors: 'Healthcare, Retail, Manufacturing', region: 'Middle East' as Region },
  { flag: '🇧🇭', name: 'Bahrain',       deployed: '3,000+',  sectors: 'Hospitality, Finance, IT',        region: 'Middle East' as Region },
  { flag: '🇴🇲', name: 'Oman',          deployed: '4,000+',  sectors: 'Engineering, Healthcare, Construction', region: 'Middle East' as Region },
  { flag: '🇬🇧', name: 'United Kingdom', deployed: '6,000+', sectors: 'Healthcare, IT, Finance',         region: 'Europe' as Region },
  { flag: '🇩🇪', name: 'Germany',       deployed: '1,800+',  sectors: 'Engineering, Manufacturing, IT', region: 'Europe' as Region },
  { flag: '🇳🇱', name: 'Netherlands',   deployed: '1,200+',  sectors: 'Healthcare, Logistics, IT',      region: 'Europe' as Region },
  { flag: '🇮🇹', name: 'Italy',         deployed: '900+',    sectors: 'Hospitality, Healthcare',        region: 'Europe' as Region },
  { flag: '🇨🇾', name: 'Cyprus',        deployed: '700+',    sectors: 'Hospitality, Construction',      region: 'Europe' as Region },
  { flag: '🇲🇹', name: 'Malta',         deployed: '500+',    sectors: 'Healthcare, Hospitality',        region: 'Europe' as Region },
  { flag: '🇸🇬', name: 'Singapore',   deployed: '2,000+', sectors: 'IT, Finance, Healthcare',          region: 'Asia' as Region },
  { flag: '🇯🇵', name: 'Japan',       deployed: '1,500+', sectors: 'Engineering, Manufacturing, IT',   region: 'Asia' as Region },
  { flag: '🇰🇷', name: 'South Korea', deployed: '1,000+', sectors: 'IT, Manufacturing, Healthcare',    region: 'Asia' as Region },
  { flag: '🇭🇰', name: 'Hong Kong',   deployed: '800+',   sectors: 'Finance, Hospitality, IT',         region: 'Asia' as Region },
  { flag: '🇹🇼', name: 'Taiwan',      deployed: '600+',   sectors: 'Engineering, IT, Manufacturing',   region: 'Asia' as Region },
  { flag: '🇲🇾', name: 'Malaysia',    deployed: '800+',   sectors: 'Hospitality, Construction',         region: 'Asia' as Region },
];

const clientCategories = [
  'Healthcare Institutions',
  'Multinational Corporations',
  'Hotels & Resorts',
  'Retail & Customer Service',
  'Government Agencies',
];

const allClients = [
  { name: 'King Fahad Medical City',    category: 'Healthcare Institutions' },
  { name: 'Cleveland Clinic Abu Dhabi', category: 'Healthcare Institutions' },
  { name: 'Gulf Medical University',    category: 'Healthcare Institutions' },
  { name: 'SEHA Health Authority',      category: 'Healthcare Institutions' },
  { name: 'NMC Healthcare',            category: 'Healthcare Institutions' },
  { name: 'Aster DM Healthcare',        category: 'Healthcare Institutions' },
  { name: 'Rashid Hospital Dubai',      category: 'Healthcare Institutions' },
  { name: 'HMC Qatar',                  category: 'Healthcare Institutions' },
  { name: 'National Guard Hospital',    category: 'Healthcare Institutions' },
  { name: 'Samsung C&T',               category: 'Multinational Corporations' },
  { name: 'Aramco',                     category: 'Multinational Corporations' },
  { name: 'Siemens',                    category: 'Multinational Corporations' },
  { name: 'ENEC',                       category: 'Multinational Corporations' },
  { name: 'Fluor Corporation',          category: 'Multinational Corporations' },
  { name: 'Al Futtaim Group',           category: 'Multinational Corporations' },
  { name: 'Shangri-La Hotels',          category: 'Hotels & Resorts' },
  { name: 'Marriott International',     category: 'Hotels & Resorts' },
  { name: 'Hilton Worldwide',           category: 'Hotels & Resorts' },
  { name: 'InterContinental Hotels',    category: 'Hotels & Resorts' },
  { name: 'Rotana Hotels',              category: 'Hotels & Resorts' },
  { name: 'Jumeirah Group',             category: 'Hotels & Resorts' },
  { name: 'LuLu Hypermarket',           category: 'Retail & Customer Service' },
  { name: 'Landmark Group',             category: 'Retail & Customer Service' },
  { name: 'Al Shaya Group',             category: 'Retail & Customer Service' },
  { name: 'Carrefour Middle East',      category: 'Retail & Customer Service' },
  { name: 'Ministry of Health UAE',     category: 'Government Agencies' },
  { name: 'MOI Qatar',                  category: 'Government Agencies' },
  { name: 'Saudi MOH',                  category: 'Government Agencies' },
  { name: 'Kuwait Civil Service',       category: 'Government Agencies' },
];

const testimonials = [
  {
    category: 'Healthcare',
    rating: 5,
    quote: '"We have partnered with Promex for over 8 years to staff our nursing teams. Their candidates consistently meet our clinical standards and arrive fully prepared with the right documentation and certifications. The process is seamless from selection to deployment."',
    name: 'R.A.',
    title: 'HR Director',
    company: 'NHS Trust, United Kingdom',
    initials: 'RA',
    avatarColor: '#4FA3C7',
  },
  {
    category: 'Engineering',
    rating: 5,
    quote: '"Promex delivered 45 skilled engineers and site workers for our project in Saudi Arabia within our tight timeline. Every candidate was trade-tested and DMW-cleared. We have since made them our exclusive recruitment partner in the Philippines."',
    name: 'M.K.',
    title: 'Operations Director',
    company: 'Infrastructure Company, Saudi Arabia',
    initials: 'MK',
    avatarColor: '#7C3AED',
  },
  {
    category: 'Hospitality',
    rating: 5,
    quote: '"The quality of candidates Promex provides is exceptional. Our housekeeping and F&B staff have become some of our most valued team members. What sets them apart is their genuine care for both the employer and the worker throughout the process."',
    name: 'F.M.',
    title: 'General Manager',
    company: '5-Star Hotel Group, UAE',
    initials: 'FM',
    avatarColor: '#059669',
  },
];

export default function OurExperiencePage() {
  const [regionFilter, setRegionFilter] = useState<Region>('Middle East');
  const [clientFilter, setClientFilter] = useState('Healthcare Institutions');

  const filteredCountries = allCountries.filter((c) => c.region === regionFilter);
  const filteredClients = allClients.filter((c) => c.category === clientFilter);

  return (
    <>
      <PageHero
        badge="Global Footprint"
        heading="Our"
        accentText="Experience"
        subText="With nearly 30 years of operation, Promex has built a powerful global network spanning the Middle East, Europe, and Asia — deploying over 50,000 Filipino professionals worldwide."
        bgImage="https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      {/* Countries Section */}
      <section className={styles.countriesSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Deployment Countries</span>
              <h2 className={styles.sectionHeading}>Countries We Work With</h2>
              <p className={styles.sectionSub}>
                We have established partnerships with employers in 15+ countries across three major global regions.
              </p>
            </div>
          </Reveal>

          <Reveal animation="fade-up" delay={80}>
            <div className={styles.regionTabs}>
              {regions.map((r) => (
                <button
                  key={r}
                  className={`${styles.regionTab} ${regionFilter === r ? styles.regionTabActive : ''}`}
                  onClick={() => setRegionFilter(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal animation="fade-up" delay={120}>
            <div className={styles.countriesGrid}>
              {filteredCountries.map((country) => (
                <div key={country.name} className={styles.countryCard}>
                  <div className={styles.countryCardTop}>
                    <span className={styles.countryFlag}>{country.flag}</span>
                    <div>
                      <h3 className={styles.countryName}>{country.name}</h3>
                      <span className={styles.countryDeployed}>{country.deployed} Deployed</span>
                    </div>
                  </div>
                  <p className={styles.countrySectors}>
                    <i className="fa-solid fa-location-dot" aria-hidden="true" />
                    {country.sectors}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clients Section */}
      <section className={styles.clientsSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={`${styles.sectionBadge} ${styles.sectionBadgeGreen}`}>Our Clients</span>
              <h2 className={styles.sectionHeading}>Trusted By Leading Organizations</h2>
            </div>
          </Reveal>

          <Reveal animation="fade-up" delay={80}>
            <div className={styles.clientFilters}>
              {clientCategories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.clientFilter} ${clientFilter === cat ? styles.clientFilterActive : ''}`}
                  onClick={() => setClientFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          <div className={styles.marqueeWrapper}>
            <div className={styles.marqueeTrack}>
              {[...filteredClients, ...filteredClients, ...filteredClients].map((client, i) => (
                <div key={i} className={styles.marqueeCard}>
                  <i className="fa-regular fa-building" aria-hidden="true" />
                  <span>{client.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.reviewsSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Client Reviews</span>
              <h2 className={styles.sectionHeading}>What Our Clients Say</h2>
            </div>
          </Reveal>

          <div className={styles.reviewsGrid}>
            {testimonials.map((t, i) => (
              <Reveal key={t.name} animation="fade-up" delay={i * 100}>
                <div className={styles.reviewCard}>
                  <span className={styles.reviewCategory}>{t.category}</span>
                  <div className={styles.reviewStars}>
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <i key={si} className="fas fa-star" aria-hidden="true" />
                    ))}
                  </div>
                  <p className={styles.reviewQuote}>{t.quote}</p>
                  <div className={styles.reviewAuthor}>
                    <div
                      className={styles.reviewAvatar}
                      style={{ background: t.avatarColor }}
                      aria-hidden="true"
                    >
                      {t.initials}
                    </div>
                    <div className={styles.reviewAuthorInfo}>
                      <span className={styles.reviewName}>{t.name}</span>
                      <span className={styles.reviewTitle}>{t.title}</span>
                      <span className={styles.reviewCompany}>{t.company}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.expCta}>
        <div className={styles.ctaBlobL} aria-hidden="true" />
        <div className={styles.ctaBlobR} aria-hidden="true" />
        <div className={`container ${styles.ctaInner}`}>
          <Reveal animation="fade-up">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaHeading}>Join Our Global Network</h2>
              <p className={styles.ctaSub}>
                Partner with Promex and gain access to a proven pipeline of skilled Filipino professionals ready to contribute to your organisation.
              </p>
              <div className={styles.ctaActions}>
                <Button label="Request Talent" href="/employer-inquiry" variant="primary" size="lg" />
                <Button label="View Overseas Jobs" href="/jobs" variant="accent" size="lg" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
