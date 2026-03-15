import { Component } from '@angular/core';
import { ScrollReveal} from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

interface Feature {
  icon: string;
  subbadge: string;
  title: string;
  body: string;
  bullets: string[];
  image?: string;
  link?: {
    text: string;
    url: string;
  };
}

interface EmployerReason {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-why-promex',
  imports: [ScrollReveal, Button],
  templateUrl: './why-promex.html',
  styleUrl: './why-promex.css'
})
export class WhyPromex {
  employerReasons: EmployerReason[] = [
    {
      icon: 'fa-solid fa-certificate',
      title: 'Licensed and compliant recruitment agency in the Philippines',
      description: 'Fully accredited by the Department of Migrant Workers (DMW), ensuring all recruitment processes meet government standards and regulations.'
    },
    {
      icon: 'fa-solid fa-network-wired',
      title: 'Extensive nationwide talent sourcing network',
      description: 'Access to a vast pool of qualified Filipino professionals across all regions, enabling us to find the perfect match for your specific needs.'
    },
    {
      icon: 'fa-solid fa-rocket',
      title: 'Fast deployment and documentation processing',
      description: 'Streamlined processes and dedicated support team ensure quick turnaround times from candidate selection to deployment.'
    },
    {
      icon: 'fa-solid fa-user-check',
      title: 'Pre-screened and qualified candidates',
      description: 'Every candidate undergoes rigorous screening, skills assessment, and background verification before being presented to employers. Our in-house trade testing and housekeeping training are conducted at our certified Circle Test Training and Assessment Center.'
    },
    {
      icon: 'fa-solid fa-briefcase',
      title: 'Industry expertise in hospitality, healthcare, retail, engineering',
      description: 'Specialized knowledge and proven track record across multiple industries, delivering candidates who are ready to excel in their roles.'
    }
  ];

  features: Feature[] = [
    {
      icon: 'fa-solid fa-trophy',
      subbadge: '28+ Years of Excellence',
      title: 'Extensive Industry Experience',
      body: 'Since 1996, Promex Company has refined its recruitment processes across countless industries. Our deep institutional knowledge and long-standing relationships with global employers ensure faster placements, better matches, and lasting partnerships.',
      bullets: ['Proven track record since 1996', 'Deep cross-industry expertise', 'Established global partnerships'],
      image: 'images/Why promex/extensive industry.jpg'
    },
    {
      icon: 'fa-solid fa-shield-halved',
      subbadge: 'Zero-Fee Policy',
      title: 'Ethical Recruitment Practices',
      body: 'We uphold the highest standards of fair and transparent recruitment. Promex never charges workers illegal placement fees, ensures full contract transparency, and treats every candidate with dignity and respect throughout the entire process.',
      bullets: ['No illegal worker fees — ever', 'Full contract transparency', 'Candidate dignity guaranteed'],
      image: 'images/Why promex/Ethical recruiment.jpg'
    },
    {
      icon: 'fa-solid fa-globe',
      subbadge: '50+ Countries Reached',
      title: 'Wide Network of Employers',
      body: 'Our extensive global employer network spans healthcare, engineering, hospitality, construction, and more across the Middle East, Asia, and Europe — meaning better opportunities, faster deployment timelines, and more choices for workers.',
      bullets: ['Active partnerships in 50+ countries', 'Top-tier brands & organizations', 'Continuously growing employer base'],
      image: 'images/Why promex/Wide Network .jpg'
    },
    {
      icon: 'fa-solid fa-clipboard-check',
      subbadge: 'End-to-End Process',
      title: 'Comprehensive Screening & Training',
      body: 'Every candidate undergoes a rigorous multi-step process — skills assessment, background checks, trade tests, and pre-deployment orientation — ensuring workers arrive fully prepared and ready to contribute from day one. Our in-house trade testing and housekeeping training programs are conducted at our certified facility.',
      bullets: ['Skills & background verification', 'Certified trade testing', 'Pre-deployment orientation'],
      image: 'images/Why promex/comprehensive screening .jpg',
      link: {
        text: 'Circle Test Training and Assessment Center',
        url: 'https://circletesttvi.gnomio.com/my/'
      }
    },
    {
      icon: 'fa-solid fa-certificate',
      subbadge: 'DMW Licensed',
      title: 'Government Accreditation',
      body: 'Promex is fully licensed by the Department of Migrant Workers (DMW) and complies with all Philippine government regulations — your assurance of a legitimate, legal, and worker-protective recruitment process.',
      bullets: ['Official DMW license holder', 'ISO-aligned quality standards', 'Full government compliance'],
      image: 'images/Why promex/Government .jpg'
    }
  ];
}
