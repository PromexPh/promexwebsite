import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../../shared/components/ui/button/button';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, Button, ScrollReveal],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  stats = [
    { value: '28+', label: 'Years in Business' },
    { value: '500+', label: 'Global Clients' },
    { value: '5,000+', label: 'Deployed' },
  ];
}
