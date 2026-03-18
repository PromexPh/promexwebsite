'use client';

import { useState } from 'react';
import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    quote:   '"Promex Company has been our preferred recruitment partner for over 10 years. Their nurses are highly skilled, professionally trained, and perfectly matched to our clinical environment."',
    name:    'Sarah Al-Rashidi',
    title:   'HR Director',
    company: 'Gulf Medical University, UAE',
    avatar:  'https://randomuser.me/api/portraits/women/44.jpg',
    rating:  5,
  },
  {
    quote:   '"We have partnered with Promex for our engineering workforce needs across three major projects. Their screening process is thorough and their candidates consistently exceed expectations."',
    name:    'Ahmed Al-Mansouri',
    title:   'Operations Manager',
    company: 'Al Futtaim Group, Dubai',
    avatar:  'https://randomuser.me/api/portraits/men/32.jpg',
    rating:  5,
  },
  {
    quote:   '"Promex delivered exceptional hospitality staff for our hotel chain. The workers arrived well-prepared, culturally aware, and ready to contribute from day one."',
    name:    'Maria Santos',
    title:   'Human Resources VP',
    company: 'Shangri-La Hotels, Singapore',
    avatar:  'https://randomuser.me/api/portraits/women/68.jpg',
    rating:  5,
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
                <Image
                  src={current.avatar}
                  alt={current.name}
                  width={52}
                  height={52}
                  className={styles.testimonialAvatar}
                />
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
