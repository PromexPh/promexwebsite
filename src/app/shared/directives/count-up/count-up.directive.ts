import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  input,
  inject,
} from '@angular/core';

@Directive({
  selector: '[countUp]',
})
export class CountUp implements OnInit, OnDestroy {
  /** The final number to count to */
  countUp       = input.required<number>();
  /** Count-up duration in ms */
  countDuration = input<number>(2000);
  /** Optional suffix appended after the number (e.g. "+" or "%") */
  countSuffix   = input<string>('');
  /** Optional prefix prepended before the number (e.g. "$") */
  countPrefix   = input<string>('');
  /** Separator for thousands (e.g. ",") */
  countSeparator = input<string>(',');

  private el       = inject(ElementRef<HTMLElement>);
  private observer!: IntersectionObserver;
  private rafId    = 0;
  private started  = false;

  ngOnInit() {
    this.el.nativeElement.textContent =
      this.countPrefix() + this.format(0) + this.countSuffix();

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.started) {
          this.started = true;
          this.animate();
          this.observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    cancelAnimationFrame(this.rafId);
  }

  private animate() {
    const target    = this.countUp();
    const duration  = this.countDuration();
    const start     = performance.now();

    const step = (now: number) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(eased * target);

      this.el.nativeElement.textContent =
        this.countPrefix() + this.format(current) + this.countSuffix();

      if (progress < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.el.nativeElement.textContent =
          this.countPrefix() + this.format(target) + this.countSuffix();
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  private format(n: number): string {
    const sep = this.countSeparator();
    if (!sep) return String(n);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }
}
