import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './Industries.module.css';

const industries = [
  { icon: 'fa-solid fa-heart-pulse', title: 'Healthcare',    roles: 'Nurses, Caregivers, Medical Technologists',      color: 'primary', image: '/images/industries_icons/healthcare.png'  },
  { icon: 'fa-solid fa-wrench',      title: 'Engineering',   roles: 'Engineers, Welders, Electricians, Mechanics',   color: 'accent',  image: '/images/industries_icons/Engineering.png'  },
  { icon: 'fa-solid fa-utensils',    title: 'Hospitality',   roles: 'Chefs, Hotel Management, F&B Servers',          color: 'magenta', image: '/images/industries_icons/hospatility.png'  },
  { icon: 'fa-solid fa-chart-bar',   title: 'Manufacturing', roles: 'Factory Workers, Machine Operators',            color: 'purple',  image: '/images/industries_icons/manufactoring.png' },
  { icon: 'fa-solid fa-desktop',     title: 'IT & Telecom',  roles: 'Software Developers, Network Engineers',        color: 'accent',  image: '/images/industries_icons/it.png'           },
  { icon: 'fa-solid fa-leaf',        title: 'Agriculture',   roles: 'Farm Workers, Fisheries, Horticulturists',      color: 'magenta', image: '/images/industries_icons/agriculters.png'  },
  { icon: 'fa-solid fa-bag-shopping',title: 'Retail & Service', roles: 'Sales Associates, Call Center Agents',      color: 'purple',  image: '/images/industries_icons/retail.png'       },
  { icon: 'fa-solid fa-coins',       title: 'Finance & Accounting', roles: 'Accountants, Financial Analysts, Auditors, Tax Specialists', color: 'primary', image: '/images/industries_icons/finance.png' },
];

export default function Industries() {
  return (
    <section className={styles.industriesSection}>
      <div className="container">

        {/* Header */}
        <Reveal animation="fade-up" delay={0}>
          <div className={styles.industriesHeader}>
            <span className={styles.sectionBadge}>Industries</span>
            <h2 className={styles.industriesHeading}>Industries We Serve</h2>
            <p className={styles.industriesSub}>
              We provide skilled professionals for a wide range of sectors globally.
            </p>
          </div>
        </Reveal>

        {/* Grid */}
        <div className={styles.industriesGrid}>
          {industries.map((industry, i) => (
            <Reveal key={industry.title} animation="fade-up" delay={60 * (i % 4)}>
              <div className={styles.industryCard}>
                <div className={`${styles.industryIconWrap} ${styles[`industryIconWrap--${industry.color}`]}`}>
                  <Image
                    src={industry.image}
                    alt={`${industry.title} icon`}
                    width={57}
                    height={57}
                    className={styles.industryImage}
                  />
                </div>
                <h3 className={styles.industryTitle}>{industry.title}</h3>
                <p className={styles.industryRoles}>{industry.roles}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal animation="fade-up" delay={200}>
          <div className={styles.industriesCta}>
            <Button
              label="View All Industries"
              href="/industries"
              variant="primary"
              size="lg"
              icon="fa-solid fa-arrow-right"
              iconPosition="right"
            />
          </div>
        </Reveal>

      </div>
    </section>
  );
}
