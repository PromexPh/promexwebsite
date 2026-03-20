'use client';

import { useCountUp } from '@/lib/useCountUp';
import Reveal from '@/components/ui/Reveal';
import styles from './Stats.module.css';

const statsData = [
  { icon: 'fa-solid fa-trophy',    value: 30,    suffix: '+', label: 'Years of Experience', sub: 'Est. 1996'          },
  { icon: 'fa-solid fa-users',     value: 50000, suffix: '+', label: 'Workers Deployed',    sub: 'Globally Placed'    },
  { icon: 'fa-solid fa-handshake', value: 500,   suffix: '+', label: 'Employer Partners',   sub: 'Worldwide'          },
  { icon: 'fa-solid fa-globe',     value: 30,    suffix: '+', label: 'Countries',           sub: 'Global Reach'       },
];

function StatCard({ stat, index }: { stat: typeof statsData[0]; index: number }) {
  const { ref, display } = useCountUp({ target: stat.value, suffix: stat.suffix, duration: 2200 });

  return (
    <Reveal animation="fade-up" delay={index * 120}>
      <div className={styles.statCard}>
        <div className={styles.statIconWrap}>
          <i className={stat.icon} aria-hidden="true" />
        </div>
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          className={styles.statValue}
        >
          {display}
        </span>
        <p className={styles.statLabel}>{stat.label}</p>
        <span className={styles.statSub}>{stat.sub}</span>
      </div>
    </Reveal>
  );
}

export default function Stats() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          {statsData.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
