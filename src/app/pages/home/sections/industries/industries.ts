import { Component } from '@angular/core';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../../../shared/components/ui/button/button';

@Component({
  selector: 'app-industries',
  imports: [ScrollReveal, Button],
  templateUrl: './industries.html',
  styleUrl: './industries.css',
})
export class Industries {
  industries = [
    {
      icon:   'fa-solid fa-heart-pulse',
      title:  'Healthcare',
      roles:  'Nurses, Caregivers, Medical Technologists',
      color:  'primary',
      image:  'images/industries_icons/healthcare.png'
    },
    {
      icon:   'fa-solid fa-wrench',
      title:  'Engineering',
      roles:  'Engineers, Welders, Electricians, Mechanics',
      color:  'accent',
      image:  'images/industries_icons/Engineering.png'
    },
    {
      icon:   'fa-solid fa-utensils',
      title:  'Hospitality',
      roles:  'Chefs, Hotel Management, F&B Servers',
      color:  'magenta',
      image:  'images/industries_icons/hospatility.png'
    },
    {
      icon:   'fa-solid fa-chart-bar',
      title:  'Manufacturing',
      roles:  'Factory Workers, Machine Operators',
      color:  'purple',
      image:  'images/industries_icons/manufactoring.png'
    },
    {
      icon:   'fa-solid fa-desktop',
      title:  'IT & Telecom',
      roles:  'Software Developers, Network Engineers',
      color:  'accent',
      image:  'images/industries_icons/it.png'
    },
    {
      icon:   'fa-solid fa-leaf',
      title:  'Agriculture',
      roles:  'Farm Workers, Fisheries, Horticulturists',
      color:  'magenta',
      image:  'images/industries_icons/agriculters.png'
    },
    {
      icon:   'fa-solid fa-bag-shopping',
      title:  'Retail & Service',
      roles:  'Sales Associates, Call Center Agents',
      color:  'purple',
      image:  'images/industries_icons/retail.png'
    },
  ];
}
