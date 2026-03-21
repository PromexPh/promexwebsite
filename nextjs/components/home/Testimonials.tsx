'use client';

import { useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    quote:       '"We have partnered with Promex for over 8 years to staff our nursing teams. Their candidates consistently meet our clinical standards and arrive fully prepared with the right documentation and certifications. The process is seamless from selection to deployment."',
    name:        'R.A.',
    title:       'HR Director',
    company:     'NHS Trust, United Kingdom',
    initials:    'RA',
    avatarColor: '#4FA3C7',
    rating:      5,
  },
  {
    quote:       '"Promex delivered 45 skilled engineers and site workers for our project in Saudi Arabia within our tight timeline. Every candidate was trade-tested and DMW-cleared. We have since made them our exclusive recruitment partner in the Philippines."',
    name:        'M.K.',
    title:       'Operations Director',
    company:     'Infrastructure Company, Saudi Arabia',
    initials:    'MK',
    avatarColor: '#7C3AED',
    rating:      5,
  },
  {
    quote:       '"The quality of candidates Promex provides is exceptional. Our housekeeping and F&B staff have become some of our most valued team members. What sets them apart is their genuine care for both the employer and the worker throughout the process."',
    name:        'F.M.',
    title:       'General Manager',
    company:     '5-Star Hotel Group, UAE',
    initials:    'FM',
    avatarColor: '#059669',
    rating:      5,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = testimonials[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <section className={styles.testimonialsSection}>
      <div className="container">

        <Reveal animation="fade-up" delay={0}>
          <div className={styles.testimonialsHeader}>
            <span className={styles.sectionBadge}>Testimonials</span>
            <h2 className={styles.testimonialsHeading}>What Our Clients Say</h2>
            <p className={styles.testimonialsSub}>
              Hear directly from the employers and organizations who trust Promex.
            </p>
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={120}>
          <div className={styles.testimonialsCarousel}>

            {/* Card */}
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>
                {Array.from({ length: current.rating }).map((_, i) => (
                  <i key={i} className="fas fa-star" aria-hidden="true" />
                ))}
              </div>

              <p className={styles.testimonialQuote}>{current.quote}</p>

              <div className={styles.testimonialAuthor}>
                <div
                  className={styles.testimonialAvatar}
                  style={{ background: current.avatarColor }}
                  aria-hidden="true"
                >
                  {current.initials}
                </div>
                <div className={styles.testimonialAuthorInfo}>
                  <span className={styles.testimonialName}>{current.name}</span>
                  <span className={styles.testimonialTitle}>{current.title}</span>
                  <span className={styles.testimonialCompany}>{current.company}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className={styles.testimonialNav}>
              <button className={styles.navArrow} onClick={prev} aria-label="Previous testimonial">
                <i className="fas fa-chevron-left" aria-hidden="true" />
              </button>

              <div className={styles.testimonialDots}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${activeIndex === i ? styles.dotActive : ''}`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button className={styles.navArrow} onClick={next} aria-label="Next testimonial">
                <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
