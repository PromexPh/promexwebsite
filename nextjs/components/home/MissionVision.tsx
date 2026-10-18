import Reveal from '@/components/ui/Reveal';
import styles from './MissionVision.module.css';

const cards = [
  {
    icon:   'fa-solid fa-bullseye',
    title:  'Our Mission',
    body:   'To ethically and professionally connect skilled Filipino workers with reputable international employers, creating mutually beneficial partnerships that improve lives and strengthen global industries. We are committed to the highest standards of recruitment integrity, candidate welfare, and client satisfaction.',
    accent: 'primary',
  },
  {
    icon:   'fa-solid fa-eye',
    title:  'Our Vision',
    body:   "To be the Philippines' most trusted and globally recognized overseas recruitment agency — a bridge of opportunity that empowers Filipino professionals to build fulfilling careers abroad while helping global organizations thrive with world-class talent. We envision a world where every Filipino worker is valued, protected, and given the chance to succeed internationally.",
    accent: 'accent',
  },
];

export default function MissionVision() {
  return (
    <section className={styles.mvSection}>
      <div className="container">

        <Reveal animation="fade-up" delay={0}>
          <div className={styles.mvHeader}>
            <span className={styles.sectionBadge}>Our Purpose</span>
            <h2 className={styles.mvHeading}>Mission &amp; Vision</h2>
          </div>
        </Reveal>

        <div className={styles.mvGrid}>
          {cards.map((card, i) => (
            <Reveal key={card.title} animation="fade-up" delay={100 + i * 140}>
              <div className={`${styles.mvCard} ${styles[`mvCard--${card.accent}`]}`}>
                <div className={`${styles.mvIconWrap} ${styles[`mvIconWrap--${card.accent}`]}`}>
                  <i className={card.icon} aria-hidden="true" />
                </div>
                <h3 className={styles.mvCardTitle}>{card.title}</h3>
                <p className={styles.mvCardBody}>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
