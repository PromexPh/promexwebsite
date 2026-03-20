'use client';

import { useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import styles from './Hero.module.css';

const stats = [
  { value: '30+',     label: 'Years in Business' },
  { value: '50,000+', label: 'Workers Deployed'  },
  { value: '500+',    label: 'Employer Partners' },
];

export default function Hero() {
  // React 18: muted must be set imperatively via ref
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
  }, []);

  return (
    <section className={styles.hero}>
      {/* Background video */}
      <video
        ref={videoRef}
        className={styles.heroVideo}
        autoPlay
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/website%20video.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className={styles.heroOverlay} />

      {/* Content */}
      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroLayout}>

          {/* Copy block */}
          <div className={styles.heroCopy}>
            <Reveal animation="fade-down" delay={0}>
              <div className={styles.heroBadge}>
                <span className={styles.badgeDot} />
                ESTABLISHED SINCE 1996 &middot; DMW ACCREDITED
              </div>
            </Reveal>

            <Reveal animation="fade-up" delay={120}>
              <h1 className={styles.heroHeading}>
                Your Trusted Overseas<br />
                <span className={styles.accent}>Recruitment Partner</span><br />
                Since 1996
              </h1>
            </Reveal>

            <Reveal animation="fade-up" delay={240}>
              <p className={styles.heroSub}>
                Connecting world-class Filipino talent with global opportunities across
                the Middle East, Europe, and Asia.
              </p>
            </Reveal>
          </div>

          {/* CTA buttons */}
          <Reveal animation="fade-up" delay={360}>
            <div className={styles.heroActions}>
              <Button
                label="Request Talent"
                href="/employer-inquiry"
                variant="primary"
                size="lg"
                icon="fa-solid fa-arrow-right"
                iconPosition="right"
                className={styles.heroBtn}
              />
              <Button
                label="View Overseas Jobs"
                href="/jobs"
                variant="accent"
                size="lg"
                icon="fa-solid fa-arrow-right"
                iconPosition="right"
                className={styles.heroBtn}
              />
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal animation="fade-up" delay={480}>
            <div className={styles.heroStats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.statItem}>
                  <i className={`fa-solid fa-circle-check ${styles.statIcon}`} aria-hidden="true" />
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </div>

      {/* Wave divider */}
      <div className={styles.heroWave}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F7F9FB" />
        </svg>
      </div>
    </section>
  );
}
