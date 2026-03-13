import { Component } from '@angular/core';
import { Hero } from './sections/hero/hero';
import { Stats } from './sections/stats/stats';
import { About } from './sections/about/about';
import { MissionVision } from './sections/mission-vision/mission-vision';
import { Industries } from './sections/industries/industries';
import { Clients } from './sections/clients/clients';
import { Testimonials } from './sections/testimonials/testimonials';
import { CtaBanner } from './sections/cta-banner/cta-banner';

@Component({
  selector: 'app-home',
  imports: [Hero, Stats, About, MissionVision, Industries, Clients, Testimonials, CtaBanner],
  template: `
    <app-hero />
    <app-stats />
    <app-about />
    <app-mission-vision />
    <app-industries />
    <app-clients />
    <app-testimonials />
    <app-cta-banner />
  `
})
export class Home {}
