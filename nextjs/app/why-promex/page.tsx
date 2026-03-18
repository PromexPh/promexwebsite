import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const employerReasons = [
  {
    icon: 'fa-solid fa-certificate',
    title: 'Licensed and compliant recruitment agency in the Philippines',
    description:
      'Fully accredited by the Department of Migrant Workers (DMW), ensuring all recruitment processes meet government standards and regulations.',
  },
  {
    icon: 'fa-solid fa-network-wired',
    title: 'Extensive nationwide talent sourcing network',
    description:
      'Access to a vast pool of qualified Filipino professionals across all regions, enabling us to find the perfect match for your specific needs.',
  },
  {
    icon: 'fa-solid fa-rocket',
    title: 'Fast deployment and documentation processing',
    description:
      'Streamlined processes and dedicated support team ensure quick turnaround times from candidate selection to deployment.',
  },
  {
    icon: 'fa-solid fa-user-check',
    title: 'Pre-screened and qualified candidates',
    description:
      'Every candidate undergoes rigorous screening, skills assessment, and background verification before being presented to employers. Our in-house trade testing and housekeeping training are conducted at our certified Circle Test Training and Assessment Center.',
  },
  {
    icon: 'fa-solid fa-briefcase',
    title: 'Industry expertise in hospitality, healthcare, retail, engineering',
    description:
      'Specialized knowledge and proven track record across multiple industries, delivering candidates who are ready to excel in their roles.',
  },
];

const features = [
  {
    icon: 'fa-solid fa-trophy',
    subbadge: '28+ Years of Excellence',
    title: 'Extensive Industry Experience',
    body: 'Since 1996, Promex Company has refined its recruitment processes across countless industries. Our deep institutional knowledge and long-standing relationships with global employers ensure faster placements, better matches, and lasting partnerships.',
    bullets: ['Proven track record since 1996', 'Deep cross-industry expertise', 'Established global partnerships'],
    image: '/images/Why promex/extensive industry.jpg',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    subbadge: 'Zero-Fee Policy',
    title: 'Ethical Recruitment Practices',
    body: 'We uphold the highest standards of fair and transparent recruitment. Promex never charges workers illegal placement fees, ensures full contract transparency, and treats every candidate with dignity and respect throughout the entire process.',
    bullets: ['No illegal worker fees — ever', 'Full contract transparency', 'Candidate dignity guaranteed'],
    image: '/images/Why promex/Ethical recruiment.jpg',
  },
  {
    icon: 'fa-solid fa-globe',
    subbadge: '50+ Countries Reached',
    title: 'Wide Network of Employers',
    body: 'Our extensive global employer network spans healthcare, engineering, hospitality, construction, and more across the Middle East, Asia, and Europe — meaning better opportunities, faster deployment timelines, and more choices for workers.',
    bullets: ['Active partnerships in 50+ countries', 'Top-tier brands & organizations', 'Continuously growing employer base'],
    image: '/images/Why promex/Wide Network .jpg',
  },
  {
    icon: 'fa-solid fa-clipboard-check',
    subbadge: 'End-to-End Process',
    title: 'Comprehensive Screening & Training',
    body: 'Every candidate undergoes a rigorous multi-step process — skills assessment, background checks, trade tests, and pre-deployment orientation — ensuring workers arrive fully prepared and ready to contribute from day one.',
    bullets: ['Skills & background verification', 'Certified trade testing', 'Pre-deployment orientation'],
    image: '/images/Why promex/comprehensive screening .jpg',
    link: { text: 'Circle Test Training and Assessment Center', url: 'https://circletesttvi.gnomio.com/my/' },
  },
  {
    icon: 'fa-solid fa-certificate',
    subbadge: 'DMW Licensed',
    title: 'Government Accreditation',
    body: 'Promex is fully licensed by the Department of Migrant Workers (DMW) and complies with all Philippine government regulations — your assurance of a legitimate, legal, and worker-protective recruitment process.',
    bullets: ['Official DMW license holder', 'ISO-aligned quality standards', 'Full government compliance'],
    image: '/images/Why promex/Government .jpg',
  },
];

export default function WhyPromexPage() {
  return (
    <>
      <PageHero
        badge="Why Choose Us"
        heading="Why Choose"
        accentText="Promex Company?"
        subText="We combine 28+ years of expertise with unwavering ethical standards and a global network — making us the recruitment partner of choice for employers and job seekers alike."
        bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      {/* Why Employers Choose Promex */}
      <section className={styles.whyEmployers}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>For Employers</span>
              <h2 className={styles.sectionHeading}>
                Why Employers Choose <span className={styles.accent}>Promex</span>
              </h2>
              <p className={styles.sectionSub}>
                Trusted by global companies for our commitment to excellence, compliance, and delivering top-tier Filipino talent.
              </p>
            </div>
          </Reveal>

          <div className={styles.reasonsGrid}>
            {employerReasons.map((reason, i) => (
              <Reveal key={reason.title} animation="fade-up" delay={i * 80}>
                <div className={styles.reasonCard}>
                  <div className={styles.reasonIconWrapper}>
                    <i className={`${reason.icon} ${styles.reasonIcon}`} aria-hidden="true" />
                  </div>
                  <h3 className={styles.reasonTitle}>{reason.title}</h3>
                  <p className={styles.reasonDescription}>{reason.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Reasons Features */}
      <section className={styles.whyFeatures}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Our Advantages</span>
              <h2 className={styles.sectionHeading}>5 Reasons Employers &amp; Workers Trust Promex</h2>
              <p className={styles.sectionSub}>
                Every detail of our process is designed to deliver the best outcome for both employers and overseas Filipino workers.
              </p>
            </div>
          </Reveal>

          <div className={styles.featuresList}>
            {features.map((feat, i) => (
              <Reveal key={feat.title} animation="fade-up" delay={80}>
                <div className={`${styles.featureRow} ${i % 2 !== 0 ? styles.featureRowReverse : ''}`}>
                  <div className={styles.featureTextPanel}>
                    <div className={styles.featureIconSm}>
                      <i className={feat.icon} aria-hidden="true" />
                    </div>
                    <span className={styles.featureSubbadge}>{feat.subbadge}</span>
                    <h3 className={styles.featureTitle}>{feat.title}</h3>
                    <p className={styles.featureBody}>{feat.body}</p>
                    <ul className={styles.featureBullets}>
                      {feat.bullets.map((b) => (
                        <li key={b}>
                          <i className="fa-solid fa-circle-check" aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    {feat.link && (
                      <div className={styles.featureLink}>
                        <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                        <a href={feat.link.url} target="_blank" rel="noopener noreferrer">
                          {feat.link.text}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className={styles.featureVisualPanel}>
                    <div className={styles.featureVisualInner}>
                      <Image
                        src={feat.image}
                        alt={feat.title}
                        fill
                        className={styles.featureImage}
                        sizes="(max-width: 900px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.whyCta}>
        <div className={styles.ctaBlobs} aria-hidden="true">
          <div className={styles.ctaBlobL} />
          <div className={styles.ctaBlobR} />
        </div>
        <div className={`container ${styles.ctaInner}`}>
          <Reveal animation="fade-up">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaHeading}>Ready to Experience the Promex Difference?</h2>
              <p className={styles.ctaSub}>
                Join hundreds of global employers and thousands of Filipino professionals who have already made Promex their recruitment partner of choice.
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
