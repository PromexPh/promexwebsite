import { Component } from '@angular/core';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';

@Component({
  selector: 'app-mission-vision',
  imports: [ScrollReveal],
  templateUrl: './mission-vision.html',
  styleUrl: './mission-vision.css',
})
export class MissionVision {
  cards = [
    {
      icon:    'fa-solid fa-bullseye',
      title:   'Our Mission',
      body:    `To ethically and professionally connect skilled Filipino workers with reputable international employers, creating mutually beneficial partnerships that improve lives and strengthen global industries. We are committed to the highest standards of recruitment integrity, candidate welfare, and client satisfaction.`,
      accent:  'primary',
    },
    {
      icon:    'fa-solid fa-eye',
      title:   'Our Vision',
      body:    `To be the Philippines' most trusted and globally recognized overseas recruitment agency — a bridge of opportunity that empowers Filipino professionals to build fulfilling careers abroad while helping global organizations thrive with world-class talent. We envision a world where every Filipino worker is valued, protected, and given the chance to succeed internationally.`,
      accent:  'accent',
    },
  ];
}
