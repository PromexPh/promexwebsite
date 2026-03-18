'use client';

import Image from 'next/image';
import { useCountUp } from '@/lib/useCountUp';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './About.module.css';

const badges = [
  { icon: 'fa-solid fa-circle-check', label: 'DMW Accredited Agency' },
  { icon: 'fa-solid fa-circle-check', label: 'ISO Certified Processes' },
  { icon: 'fa-solid fa-circle-check', label: 'Ethical Recruitment'    },
];

function FloatStat() {
  const { ref, display } = useCountUp({ target: 28, suffix: '+', duration: 2000 });
  return (
    <div className={styles.floatStat}>
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={styles.floatStatValue}
      >
        {display}
      </span>
      <span className={styles.floatStatLabel}>Years of Trust</span>
    </div>
  );
}

export default function About() {
  return (
    <section className={styles.aboutSection} id="about">
      <div className={`container ${styles.aboutGrid}`}>

        {/* Left: text */}
        <div className={styles.aboutText}>
          <Reveal animation="fade-right" delay={0}>
            <span className={styles.sectionBadge}>About Us</span>
          </Reveal>

          <Reveal animation="fade-up" delay={100}>
            <h2 className={styles.aboutHeading}>About Promex Company</h2>
          </Reveal>

          <Reveal animation="fade-up" delay={180}>
            <p className={styles.aboutLead}>
              A legacy of excellence in overseas recruitment, trusted by hundreds of companies worldwide.
            </p>
          </Reveal>

          <Reveal animation="fade-up" delay={260}>
            <p className={styles.aboutBody}>
              Founded in 1996, Promex Company has been at the forefront of overseas recruitment in the
              Philippines for over 28 years. As a Department of Migrant Workers (DMW) accredited agency,
              we specialize in connecting highly skilled Filipino professionals with reputable employers
              across the Middle East, Europe, and Asia.
            </p>
          </Reveal>

          <Reveal animation="fade-up" delay={320}>
            <p className={styles.aboutBody}>
              Our commitment to ethical recruitment, comprehensive candidate screening, and dedicated
              post-deployment support has earned us the trust of both workers and employers across continents.
            </p>
          </Reveal>

          <Reveal animation="fade-up" delay={400}>
            <div className={styles.aboutBadges}>
              {badges.map((b) => (
                <span key={b.label} className={styles.aboutBadge}>
                  <i className={b.icon} aria-hidden="true" />
                  {b.label}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal animation="fade-up" delay={480}>
            <Button
              label="Learn More About Us"
              href="/about-us"
              variant="outline"
              size="md"
              icon="fa-solid fa-arrow-right"
              iconPosition="right"
            />
          </Reveal>
        </div>

        {/* Right: image */}
        <Reveal animation="fade-left" delay={200} className={styles.aboutVisual}>
          <div className={styles.aboutImgWrap}>
            <Image
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&q=80&auto=format&fit=crop"
              alt="Promex recruitment consultation"
              width={700}
              height={440}
              className={styles.aboutImg}
            />

            {/* Floating green badge — top right */}
            <div className={`${styles.floatBadge} ${styles.floatBadgeGreen}`}>
              <i className="fa-solid fa-globe" aria-hidden="true" />
              <span>Global Reach</span>
            </div>

            {/* Floating stat — bottom left */}
            <FloatStat />
          </div>
        </Reveal>

      </div>
    </section>
  );
}
