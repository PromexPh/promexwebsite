import { Component, signal, computed } from '@angular/core';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
}

@Component({
  selector: 'app-testimonials',
  imports: [ScrollReveal],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class Testimonials {
  activeIndex = signal(0);

  testimonials: Testimonial[] = [
    {
      quote: '"Promex Company has been our preferred recruitment partner for over 10 years. Their nurses are highly skilled, professionally trained, and perfectly matched to our clinical environment."',
      name: 'Sarah Al-Rashidi',
      title: 'HR Director',
      company: 'Gulf Medical University, UAE',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5
    },
    {
      quote: '"We have partnered with Promex for our engineering workforce needs across three major projects. Their screening process is thorough and their candidates consistently exceed expectations."',
      name: 'Ahmed Al-Mansouri',
      title: 'Operations Manager',
      company: 'Al Futtaim Group, Dubai',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5
    },
    {
      quote: '"Promex delivered exceptional hospitality staff for our hotel chain. The workers arrived well-prepared, culturally aware, and ready to contribute from day one."',
      name: 'Maria Santos',
      title: 'Human Resources VP',
      company: 'Shangri-La Hotels, Singapore',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 5
    }
  ];

  stars = computed(() =>
    Array(this.testimonials[this.activeIndex()].rating).fill(0)
  );

  current = computed(() => this.testimonials[this.activeIndex()]);

  prev() {
    this.activeIndex.update(i =>
      i === 0 ? this.testimonials.length - 1 : i - 1
    );
  }

  next() {
    this.activeIndex.update(i =>
      i === this.testimonials.length - 1 ? 0 : i + 1
    );
  }

  goTo(index: number) {
    this.activeIndex.set(index);
  }
}
