import Reveal from './Reveal';
import styles from './PageHero.module.css';

interface PageHeroProps {
  /** Small uppercase label shown in the pill badge */
  badge:       string;
  /** Plain portion of the h1 heading */
  heading:     string;
  /** Optional accent-coloured portion appended after heading */
  accentText?: string;
  /** Paragraph below the heading */
  subText:     string;
  /** Background image URL (from /public). Defaults to a gradient overlay only. */
  bgImage?:    string;
  /** Wave fill colour — should match the section below. Defaults to --color-bg */
  waveFill?:   string;
}

/**
 * Reusable hero banner for all inner pages (Why Promex, About Us, etc.).
 * Provides the badge → heading → sub-text layout with scroll-reveal
 * and the wave SVG divider at the bottom.
 */
export default function PageHero({
  badge,
  heading,
  accentText,
  subText,
  bgImage,
  waveFill = 'var(--color-bg)',
}: PageHeroProps) {
  return (
    <section
      className={styles.hero}
      style={bgImage ? { backgroundImage: `url('${bgImage}')` } : undefined}
    >
      <div className={styles.overlay} />

      <div className={`container ${styles.content}`}>
        <Reveal animation="fade-down" delay={0}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {badge}
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={120}>
          <h1 className={styles.heading}>
            {heading}
            {accentText && (
              <> <span className={styles.accent}>{accentText}</span></>
            )}
          </h1>
        </Reveal>

        <Reveal animation="fade-up" delay={240}>
          <p className={styles.sub}>{subText}</p>
        </Reveal>
      </div>

      <div className={styles.wave}>
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill={waveFill}
          />
        </svg>
      </div>
    </section>
  );
}
