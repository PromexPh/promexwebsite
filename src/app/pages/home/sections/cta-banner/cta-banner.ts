import { Component } from '@angular/core';
import { Button } from '../../../../shared/components/ui/button/button';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';

@Component({
  selector: 'app-cta-banner',
  standalone: true,
  imports: [Button, ScrollReveal],
  templateUrl: './cta-banner.html',
  styleUrl: './cta-banner.css'
})
export class CtaBanner {}
