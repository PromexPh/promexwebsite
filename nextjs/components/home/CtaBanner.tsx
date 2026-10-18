import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './CtaBanner.module.css';

export default function CtaBanner() {
  return (
    <section className={styles.ctaBannerSection}>
      {/* Decorative blobs */}
      <div className={`${styles.ctaBlob} ${styles.ctaBlobLeft}`} aria-hidden="true" />
      <div className={`${styles.ctaBlob} ${styles.ctaBlobRight}`} aria-hidden="true" />

      <div className={`container ${styles.ctaInner}`}>
        <Reveal animation="fade-up" delay={0}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaHeading}>Ready to Build Your Global Team?</h2>
            <p className={styles.ctaSub}>
              Whether you&apos;re an employer looking for skilled talent or a professional
              seeking international opportunities, Promex Company is your bridge to the world.
            </p>
            <div className={styles.ctaActions}>
              <Button label="Request Talent"    href="/employer-inquiry" variant="primary" size="lg" />
              <Button label="View Overseas Jobs" href="/jobs"            variant="accent"  size="lg" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
