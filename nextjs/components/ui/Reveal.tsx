'use client';

import { useScrollReveal, RevealAnimation } from '@/lib/useScrollReveal';

interface RevealProps {
  children:   React.ReactNode;
  animation?: RevealAnimation;
  delay?:     number;
  duration?:  number;
  threshold?: number;
  once?:      boolean;
  /** HTML tag to render — defaults to div */
  as?:        keyof React.JSX.IntrinsicElements;
  className?: string;
  style?:     React.CSSProperties;
}

/**
 * Drop-in wrapper that applies scroll-reveal animation to its children.
 * Mirrors the Angular [reveal] directive behaviour exactly.
 *
 * Usage:
 *   <Reveal animation="fade-up" delay={100}>
 *     <p>Hello</p>
 *   </Reveal>
 */
export default function Reveal({
  children,
  animation = 'fade-up',
  delay     = 0,
  duration  = 600,
  threshold = 0.15,
  once      = true,
  as: Tag   = 'div',
  className,
  style,
}: RevealProps) {
  const ref = useScrollReveal({ animation, delay, duration, threshold, once });

  return (
    // @ts-expect-error — polymorphic ref typing; works correctly at runtime
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
