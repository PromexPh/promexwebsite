'use client';

import { useEffect, useRef } from 'react';

export type RevealAnimation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade'
  | 'zoom';

interface ScrollRevealOptions {
  animation?: RevealAnimation;
  delay?: number;       // ms
  duration?: number;    // ms
  threshold?: number;   // 0–1
  once?: boolean;
}

/**
 * Attaches IntersectionObserver-based scroll-reveal to a DOM element.
 * Adds/removes the global CSS classes defined in globals.css:
 *   .reveal, .reveal--<animation>, .reveal--visible
 *
 * Usage:
 *   const ref = useScrollReveal({ animation: 'fade-up', delay: 100 });
 *   <div ref={ref}>...</div>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
}: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Apply CSS custom properties and base classes
    el.style.setProperty('--reveal-duration', `${duration}ms`);
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.classList.add('reveal', `reveal--${animation}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal--visible');
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove('reveal--visible');
          }
        });
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      // Clean up classes so re-mounts start fresh
      el.classList.remove('reveal', `reveal--${animation}`, 'reveal--visible');
    };
  }, [animation, delay, duration, threshold, once]);

  return ref;
}
