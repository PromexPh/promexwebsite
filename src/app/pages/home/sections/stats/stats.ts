import { Component } from '@angular/core';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { CountUp } from '../../../../shared/directives/count-up/count-up.directive';

@Component({
  selector: 'app-stats',
  imports: [ScrollReveal, CountUp],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {
  stats = [
    {
      icon:    'fa-solid fa-trophy',
      value:   28,
      suffix:  '+',
      label:   'Years of Experience',
      sub:     'Est. 1996',
    },
    {
      icon:    'fa-solid fa-globe',
      value:   500,
      suffix:  '+',
      label:   'Clients Worldwide',
      sub:     'Global Network',
    },
    {
      icon:    'fa-solid fa-users',
      value:   5000,
      suffix:  '+',
      label:   'Candidates Deployed',
      sub:     'Successfully Placed',
    },
    {
      icon:    'fa-solid fa-briefcase',
      value:   1000,
      suffix:  '+',
      label:   'Job Orders Fulfilled',
      sub:     'Across Industries',
    },
  ];
}
