'use client';

import { useCountUp } from '@/lib/useCountUp';
import Reveal from '@/components/ui/Reveal';
import styles from './Stats.module.css';

const statsData = [
  { icon: 'fa-solid fa-trophy',    value: 28,   suffix: '+', label: 'Years of Experience', sub: 'Est. 1996'          },
  { icon: 'fa-solid fa-globe',     value: 500,  suffix: '+', label: 'Clients Worldwide',   sub: 'Global Network'     },
  { icon: 'fa-solid fa-users',     value: 5000, suffix: '+', label: 'Candidates Deployed', sub: 'Successfully Placed' },
  { icon: 'fa-solid fa-briefcase', value: 1000, suffix: '+', label: 'Job Orders Fulfilled', sub: 'Across Industries'  },
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
