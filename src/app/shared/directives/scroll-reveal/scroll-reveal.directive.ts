import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  input,
  inject,
} from '@angular/core';

export type RevealAnimation = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'zoom';

@Directive({
  selector: '[reveal]',
})
export class ScrollReveal implements OnInit, OnDestroy {
  /** Animation type */
  reveal       = input<RevealAnimation>('fade-up');
  /** Delay in ms before the animation plays once visible */
  revealDelay  = input<number>(0);
  /** Duration in ms */
  revealDuration = input<number>(600);
  /** IntersectionObserver threshold (0–1) */
  revealThreshold = input<number>(0.15);
  /** Play once (default) or every time it enters viewport */
  revealOnce   = input<boolean>(true);

  private el    = inject(ElementRef<HTMLElement>);
  private observer!: IntersectionObserver;

  ngOnInit() {
    const el = this.el.nativeElement;

    // Set initial hidden state via CSS custom properties
    el.style.setProperty('--reveal-duration', `${this.revealDuration()}ms`);
    el.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);
    el.classList.add('reveal', `reveal--${this.reveal()}`);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal--visible');
            if (this.revealOnce()) {
              this.observer.unobserve(el);
            }
          } else if (!this.revealOnce()) {
            el.classList.remove('reveal--visible');
          }
        });
      },
      { threshold: this.revealThreshold() }
    );

    this.observer.observe(el);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
