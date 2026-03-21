import { Shield, Heart, Star, Eye, ExternalLink } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import styles from './page.module.css';

const milestones = [
  { year: '1996', title: 'Promex Founded', description: 'Promex was established with a mission to provide ethical overseas recruitment services for Filipino professionals.' },
  { year: '2005', title: 'First 10,000 Workers Deployed', description: 'Reached the milestone of successfully placing 10,000 Filipino professionals in overseas positions.' },
  { year: '2012', title: 'Circle Test Training Center Opened', description: 'Launched an in-house training and assessment facility to ensure candidate readiness and quality.' },
  { year: '2018', title: 'ISO 9001:2015 Certification', description: 'Achieved international quality management certification for our recruitment processes.' },
  { year: '2020', title: 'DMW Excellence Award', description: 'Recognized as Outstanding Recruitment Agency by the Department of Migrant Workers.' },
  { year: '2024', title: '30+ Countries Partnership', description: 'Expanded our global employer network to over 30 countries across the Middle East, Asia, and Europe.' },
];

const certifications = [
  { name: 'DMW Licensed Recruitment Agency', issuer: 'Department of Migrant Workers', year: '1996 - Present', description: 'Official government license to operate as a private recruitment and placement agency in the Philippines.', iconImage: '/images/icons/01.svg', badge: null, link: null },
  { name: 'ISO 9001:2015 Certified', issuer: 'International Organization for Standardization', year: '2018', description: 'International quality management standard certification for consistent and reliable recruitment services.', iconImage: '/images/icons/02.svg', badge: null, link: null },
  { name: 'POEA Accreditation', issuer: 'Philippine Overseas Employment Administration', year: '1996 - Present', description: 'Accredited to recruit and deploy Filipino workers for overseas employment opportunities.', iconImage: '/images/icons/03.svg', badge: null, link: null },
  { name: 'Circle Test Assessment Center', issuer: 'TESDA Registered', year: '2012', description: 'Government-registered training and assessment center for trade testing and skills certification.', iconImage: '/images/icons/04.svg', badge: null, link: null },
  { name: 'OWWA Partner Agency', issuer: 'Overseas Workers Welfare Administration', year: '1996 - Present', description: 'Official partner ensuring overseas Filipino workers receive proper welfare support and protection.', iconImage: '/images/icons/05.svg', badge: null, link: null },
  { name: 'DMW Whitelisted Agency', issuer: 'Department of Migrant Workers', year: 'Verified', description: 'Officially whitelisted by the DMW, confirming Promex meets all legal and ethical standards for overseas recruitment. Verifiable at dmw.gov.ph.', iconImage: '/images/icons/01.svg', badge: 'Cleared', link: 'https://dmw.gov.ph' },
];

const values = [
  { Icon: Shield, title: 'Integrity', description: 'We maintain the highest ethical standards in all our recruitment processes and business dealings.' },
  { Icon: Heart, title: 'People-Centered', description: 'Every decision we make prioritizes the welfare and dignity of Filipino workers and their families.' },
  { Icon: Star, title: 'Excellence', description: 'We continuously improve our services to deliver world-class recruitment solutions.' },
  { Icon: Eye, title: 'Transparency', description: 'We believe in clear communication and honest dealings with candidates and employers alike.' },
];

const stats = [
  { number: '30+', label: 'Years of Experience', sub: 'Est. 1996' },
  { number: '50,000+', label: 'Workers Deployed', sub: 'Globally Placed' },
  { number: '500+', label: 'Employer Partners', sub: 'Worldwide' },
  { number: '30+', label: 'Countries', sub: 'Global Reach' },
];

export default function AboutUsPage() {
  return (
    <>
      <PageHero
        badge="About Promex"
        heading="30+ Years of"
        accentText="Ethical Recruitment"
        subText="Since 1996, Promex has been empowering Filipino professionals with dignified overseas employment opportunities while maintaining the highest standards of integrity and compliance."
        bgImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      {/* Stats Strip */}
      <section className={styles.statsSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.statItem}>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                  <div className={styles.statSub}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Who We Are */}
      <section className={styles.whoWeAreSection}>
        <div className="container">
          <div className={styles.whoWeAreGrid}>
            <Reveal animation="fade-right">
              <h2 className={styles.whoWeAreHeading}>Who We Are</h2>
            </Reveal>
            <Reveal animation="fade-left">
              <p className={styles.whoWeAreBody}>
                Promex Inc. is a Philippine-based international recruitment agency and professional manpower
                service provider, duly licensed by the Department of Migrant Workers (DMW). Established in
                1996, we have developed extensive expertise in sourcing, screening, and deploying skilled
                Filipino professionals to employers across various industries worldwide. We operate in strict
                compliance with Philippine labor laws and international recruitment standards, ensuring
                ethical, transparent, and professional recruitment practices.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className={styles.visionMissionSection}>
        <div className="container">
          <div className={styles.visionMissionGrid}>
            <Reveal animation="fade-right">
              <div className={styles.vmCard}>
                <div className={styles.vmIconWrap}>
                  <i className="fa-solid fa-eye" aria-hidden="true" />
                </div>
                <h3 className={styles.vmTitle}>Our Vision</h3>
                <p className={styles.vmBody}>
                  To be a leading global recruitment partner recognized for delivering world-class Filipino
                  talent and building lasting partnerships with employers across industries and borders.
                </p>
              </div>
            </Reveal>
            <Reveal animation="fade-left">
              <div className={styles.vmCard}>
                <div className={styles.vmIconWrap}>
                  <i className="fa-solid fa-rocket" aria-hidden="true" />
                </div>
                <h3 className={styles.vmTitle}>Our Mission</h3>
                <p className={styles.vmBody}>
                  To provide reliable and ethical recruitment solutions that help global organizations build
                  strong teams while creating meaningful career opportunities for Filipino professionals.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>OUR VALUES</span>
              <h2 className={styles.sectionHeading}>What We Stand For</h2>
              <p className={styles.sectionSub}>The principles that guide everything we do</p>
            </div>
          </Reveal>

          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <Reveal key={v.title} animation="fade-up" delay={i * 80}>
                <div className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <v.Icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDescription}>{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={styles.storySection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>OUR JOURNEY</span>
              <h2 className={styles.sectionHeading}>Company Story &amp; Milestones</h2>
              <p className={styles.sectionSub}>Nearly 30 years of growth, innovation, and commitment to Filipino workers</p>
            </div>
          </Reveal>

          <div className={styles.timeline}>
            {milestones.map((m, i) => (
              <Reveal key={m.year} animation="fade-up" delay={i * 80}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineYear}>{m.year}</span>
                    <h3 className={styles.timelineTitle}>{m.title}</h3>
                    <p className={styles.timelineDescription}>{m.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className={styles.certificationsSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>CREDENTIALS</span>
              <h2 className={styles.sectionHeading}>Certifications &amp; Accreditations</h2>
              <p className={styles.sectionSub}>Recognized by government agencies and international standards bodies</p>
            </div>
          </Reveal>

          <div className={styles.certificationsGrid}>
            {certifications.map((cert, i) => (
              <Reveal key={cert.name} animation="fade-up" delay={i * 80}>
                <div className={styles.certCard}>
                  <div className={styles.certIconWrapper}>
                    <Image src={cert.iconImage} alt={`${cert.name} icon`} width={48} height={48} />
                  </div>
                  <div className={styles.certContent}>
                    <div className={styles.certNameRow}>
                      <h3 className={styles.certName}>{cert.name}</h3>
                      {cert.badge && (
                        <span className={styles.certBadgeCleared}>{cert.badge}</span>
                      )}
                    </div>
                    <p className={styles.certIssuer}>{cert.issuer} · {cert.year}</p>
                    <p className={styles.certDescription}>{cert.description}</p>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener noreferrer" className={styles.certLink}>
                        <ExternalLink size={14} /> Verify on dmw.gov.ph
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* In the News */}
      <section className={styles.newsSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>IN THE NEWS</span>
              <h2 className={styles.sectionHeading}>Promex in the Press</h2>
              <p className={styles.sectionSub}>
                Our work connecting Filipino professionals with global opportunities has been recognised internationally.
              </p>
            </div>
          </Reveal>

          <Reveal animation="fade-up" delay={80}>
            <div className={styles.newsCard}>
              <div className={styles.newsCardMeta}>
                <i className="fa-regular fa-newspaper" aria-hidden="true" />
                <span className={styles.newsOutlet}>[News Outlet]</span>
              </div>
              <h3 className={styles.newsHeadline}>
                Promex NHS UK Partnership — Filipino Nurses Deployed to National Health Service
              </h3>
              <p className={styles.newsExcerpt}>
                Promex&apos;s partnership with the UK&apos;s National Health Service has helped place hundreds of
                skilled Filipino healthcare professionals in NHS hospitals across the United Kingdom.
              </p>
              {/* TODO: replace href="#" with real article URL */}
              <a href="#" className={styles.newsReadBtn}>
                Read Article <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.aboutCta}>
        <div className={styles.ctaBlobs} aria-hidden="true">
          <div className={styles.ctaBlobL} />
          <div className={styles.ctaBlobR} />
        </div>
        <div className={`container ${styles.ctaInner}`}>
          <Reveal animation="fade-up">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaHeading}>Ready to Work With Us?</h2>
              <p className={styles.ctaSub}>
                Whether you&apos;re an employer seeking skilled talent or a professional looking for overseas
                opportunities, Promex is here to help you succeed.
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
