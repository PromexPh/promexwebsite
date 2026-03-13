import { Component } from '@angular/core';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { CountUp } from '../../../../shared/directives/count-up/count-up.directive';
import { Button } from '../../../../shared/components/ui/button/button';

@Component({
  selector: 'app-about',
  imports: [ScrollReveal, CountUp, Button],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  badges = [
    { icon: 'fa-solid fa-circle-check', label: 'DMW Accredited Agency' },
    { icon: 'fa-solid fa-circle-check', label: 'ISO Certified Processes' },
    { icon: 'fa-solid fa-circle-check', label: 'Ethical Recruitment' },
  ];
}
