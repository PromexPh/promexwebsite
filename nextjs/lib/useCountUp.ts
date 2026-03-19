'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpOptions {
  target: number;
  duration?: number;   // ms, default 2000
  suffix?: string;     // e.g. "+"
  prefix?: string;     // e.g. "$"
  separator?: string;  // thousands separator, default ","
  threshold?: number;  // IntersectionObserver threshold, default 0.3
}

interface CountUpResult {
  ref: React.RefObject<HTMLElement | null>;
  display: string;
}

/**
 * Counts from 0 to `target` with an ease-out cubic animation once the
 * element enters the viewport (fires once, then disconnects observer).
 *
 * Usage:
 *   const { ref, display } = useCountUp({ target: 5000, suffix: '+' });
 *   <span ref={ref}>{display}</span>
 */
export function useCountUp({
  target,
  duration = 2000,
  suffix = '',
  prefix = '',
  separator = ',',
}: CountUpOptions): CountUpResult {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(() => prefix + format(0, separator) + suffix);
  const started = useRef(false);
  const rafId = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();

          const startTime = performance.now();

          const step = (now: number) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic — matches the Angular directive exactly
            const eased   = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            setDisplay(prefix + format(current, separator) + suffix);

            if (progress < 1) {
              rafId.current = requestAnimationFrame(step);
            } else {
              setDisplay(prefix + format(target, separator) + suffix);
            }
          };

          rafId.current = requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
      started.current = false; // allow re-trigger if effect re-runs (React StrictMode)
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, suffix, prefix, separator]);

  return { ref, display };
}

function format(n: number, separator: string): string {
  if (!separator) return String(n);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
