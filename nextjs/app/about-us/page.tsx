import Image from 'next/image';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const founder = {
  name: 'Maria Santos Reyes',
  title: 'Founder & CEO',
  foundedYear: '1996',
  bio: 'Maria Santos Reyes founded Promex Company in 1996 with a vision to create ethical and transparent recruitment pathways for Filipino professionals seeking international opportunities. With over 28 years of experience in the overseas employment industry, she has built Promex into one of the most trusted recruitment agencies in the Philippines.',
  quote: '"Our mission has always been simple: to empower Filipino workers with legitimate, dignified overseas employment while maintaining the highest ethical standards in recruitment."',
  image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
  achievements: [
    'DMW Outstanding Recruitment Agency Award 2020',
    '28+ years in overseas recruitment industry',
    'Placed over 50,000 Filipino workers globally',
    'Pioneer in zero-fee ethical recruitment',
  ],
};

const leadership = [
  {
    name: 'Roberto Cruz',
    position: 'Chief Operations Officer',
    bio: 'Roberto brings 15+ years of operational excellence to Promex, overseeing recruitment processes, compliance, and quality assurance.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
  {
    name: 'Jennifer Lim',
    position: 'Vice President - Client Relations',
    bio: 'Jennifer manages our global employer partnerships and ensures seamless coordination between clients and recruitment teams.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  },
  {
    name: 'Carlos Mendoza',
    position: 'Director of Training & Assessment',
    bio: 'Carlos oversees our Circle Test Training and Assessment Center, ensuring candidates receive world-class skills training and certification.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
  },
  {
    name: 'Patricia Tan',
    position: 'Head of Compliance & Legal',
    bio: 'Patricia ensures all Promex operations meet DMW regulations and international labor standards, protecting both workers and employers.',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop',
  },
];

const milestones = [
  { year: '1996', title: 'Promex Company Founded', description: 'Maria Santos Reyes established Promex with a mission to provide ethical overseas recruitment services.' },
  { year: '2005', title: 'First 10,000 Workers Deployed', description: 'Reached milestone of successfully placing 10,000 Filipino professionals in overseas positions.' },
  { year: '2012', title: 'Circle Test Training Center Opened', description: 'Launched in-house training and assessment facility to ensure candidate readiness.' },
  { year: '2018', title: 'ISO 9001:2015 Certification', description: 'Achieved international quality management certification for recruitment processes.' },
  { year: '2020', title: 'DMW Excellence Award', description: 'Recognized as Outstanding Recruitment Agency by the Department of Migrant Workers.' },
  { year: '2024', title: '50+ Countries Partnership', description: 'Expanded our global employer network to over 50 countries across Middle East, Asia, and Europe.' },
];

const certifications = [
  { name: 'DMW Licensed Recruitment Agency', issuer: 'Department of Migrant Workers', year: '1996 - Present', description: 'Official government license to operate as a private recruitment and placement agency in the Philippines.', icon: 'fa-solid fa-certificate', iconImage: '/images/icons/01.svg' },
  { name: 'ISO 9001:2015 Certified', issuer: 'International Organization for Standardization', year: '2018', description: 'International quality management standard certification for consistent and reliable recruitment services.', icon: 'fa-solid fa-award', iconImage: '/images/icons/02.svg' },
  { name: 'POEA Accreditation', issuer: 'Philippine Overseas Employment Administration', year: '1996 - Present', description: 'Accredited to recruit and deploy Filipino workers for overseas employment opportunities.', icon: 'fa-solid fa-shield-halved', iconImage: '/images/icons/03.svg' },
  { name: 'Circle Test Assessment Center', issuer: 'TESDA Registered', year: '2012', description: 'Government-registered training and assessment center for trade testing and skills certification.', icon: 'fa-solid fa-graduation-cap', iconImage: '/images/icons/04.svg' },
  { name: 'OWWA Partner Agency', issuer: 'Overseas Workers Welfare Administration', year: '1996 - Present', description: 'Official partner ensuring overseas Filipino workers receive proper welfare support and protection.', icon: 'fa-solid fa-handshake', iconImage: '/images/icons/05.svg' },
];

const values = [
  { icon: 'fa-solid fa-heart', iconImage: '/images/2nd icons/Integrity.svg', title: 'Integrity', description: 'We maintain the highest ethical standards in all our recruitment processes and business dealings.' },
  { icon: 'fa-solid fa-users', iconImage: '/images/2nd icons/People-centered.svg', title: 'People-Centered', description: 'Every decision we make prioritizes the welfare and dignity of Filipino workers and their families.' },
  { icon: 'fa-solid fa-lightbulb', iconImage: '/images/2nd icons/Excellence.svg', title: 'Excellence', description: 'We continuously improve our services to deliver world-class recruitment solutions.' },
  { icon: 'fa-solid fa-scale-balanced', iconImage: '/images/2nd icons/Transparency.svg', title: 'Transparency', description: 'We believe in clear communication and honest dealings with candidates and employers alike.' },
];

const stats = [
  { number: '28+', label: 'Years of Experience' },
  { number: '50,000+', label: 'Workers Deployed' },
  { number: '50+', label: 'Partner Countries' },
  { number: '1,000+', label: 'Employer Partners' },
];

export default function AboutUsPage() {
  return (
    <>
      <PageHero
        badge="About Promex"
        heading="28+ Years of"
        accentText="Ethical Recruitment"
        subText="Since 1996, Promex Company has been empowering Filipino professionals with dignified overseas employment opportunities while maintaining the highest standards of integrity and compliance."
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
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Founder */}
      <section className={styles.founderSection}>
        <div className="container">
          <div className={styles.founderGrid}>
            <Reveal animation="fade-right">
              <div className={styles.founderImageCol}>
                <div className={styles.founderImageWrapper}>
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    width={400}
                    height={400}
                    className={styles.founderImage}
                  />
                  <div className={styles.founderBadge}>
                    <i className="fa-solid fa-star" aria-hidden="true" />
                    <span>Founder &amp; CEO</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal animation="fade-left">
              <div className={styles.founderInfoCol}>
                <span className={styles.sectionBadge}>OUR FOUNDER</span>
                <h2 className={styles.founderName}>{founder.name}</h2>
                <p className={styles.founderTitle}>{founder.title} · Founded {founder.foundedYear}</p>
                <p className={styles.founderBio}>{founder.bio}</p>
                <div className={styles.founderQuote}>
                  <i className="fa-solid fa-quote-left" aria-hidden="true" />
                  <p>{founder.quote}</p>
                </div>
                <div className={styles.founderAchievements}>
                  <h3 className={styles.achievementsTitle}>Key Achievements</h3>
                  <ul className={styles.achievementsList}>
                    {founder.achievements.map((a) => (
                      <li key={a}>
                        <i className="fa-solid fa-trophy" aria-hidden="true" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
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
              <p className={styles.sectionSub}>Over two decades of growth, innovation, and commitment to Filipino workers</p>
            </div>
          </Reveal>

          <div className={styles.timeline}>
            {milestones.map((m, i) => (
              <Reveal key={m.year} animation="fade-up" delay={i * 80}>
                <div className={`${styles.timelineItem} ${i % 2 !== 0 ? styles.timelineItemRight : ''}`}>
                  <div className={styles.timelineYear}>{m.year}</div>
                  <div className={styles.timelineConnector} />
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineTitle}>{m.title}</h3>
                    <p className={styles.timelineDescription}>{m.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className={styles.leadershipSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>OUR TEAM</span>
              <h2 className={styles.sectionHeading}>Leadership Team</h2>
              <p className={styles.sectionSub}>Meet the experienced professionals driving Promex forward</p>
            </div>
          </Reveal>

          <div className={styles.leadershipGrid}>
            {leadership.map((leader, i) => (
              <Reveal key={leader.name} animation="fade-up" delay={i * 80}>
                <div className={styles.leaderCard}>
                  <div className={styles.leaderImageWrapper}>
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      width={400}
                      height={400}
                      className={styles.leaderImage}
                    />
                  </div>
                  <div className={styles.leaderInfo}>
                    <h3 className={styles.leaderName}>{leader.name}</h3>
                    <p className={styles.leaderPosition}>{leader.position}</p>
                    <p className={styles.leaderBio}>{leader.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
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
                    <Image src={v.iconImage} alt={`${v.title} icon`} width={48} height={48} />
                  </div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDescription}>{v.description}</p>
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
                    <h3 className={styles.certName}>{cert.name}</h3>
                    <p className={styles.certIssuer}>{cert.issuer} · {cert.year}</p>
                    <p className={styles.certDescription}>{cert.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
                Whether you&apos;re an employer seeking skilled talent or a professional looking for overseas opportunities, Promex is here to help you succeed.
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
