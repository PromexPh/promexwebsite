import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'accent' | 'outline';
export type ButtonSize    = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [RouterLink, CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
  host: { class: 'app-button-host' }
})
export class Button {
  /** Button label text */
  label      = input<string>('');
  /** Visual style */
  variant    = input<ButtonVariant>('primary');
  /** Size preset */
  size       = input<ButtonSize>('md');
  /** RouterLink target — renders an <a> with routerLink */
  routerLink = input<string | null>(null);
  /** Router fragment (anchor) — e.g. 'employers' scrolls to #employers */
  fragment   = input<string | null>(null);
  /** External href — renders an <a> with href */
  href       = input<string | null>(null);
  /** Font Awesome icon class, e.g. "fa-solid fa-arrow-right" */
  icon       = input<string | null>(null);
  /** Place icon before or after label */
  iconPosition = input<'left' | 'right'>('left');
  /** Stretch to full container width */
  fullWidth  = input<boolean>(false);
  /** Disabled state (applies to <button> only) */
  disabled   = input<boolean>(false);
  /** HTML button type (only when no link) */
  type       = input<'button' | 'submit' | 'reset'>('button');

  /** Emitted on click (useful for both link and button modes) */
  clicked = output<MouseEvent>();

  get isLink(): boolean {
    return !!this.routerLink() || !!this.href();
  }

  get cssClasses(): string {
    const classes = [
      'btn',
      `btn-${this.variant()}`,
      `btn--${this.size()}`,
    ];
    if (this.fullWidth()) classes.push('btn--full');
    return classes.join(' ');
  }

  onClick(event: MouseEvent) {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
