import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

interface LeadershipMember {
  name: string;
  position: string;
  bio: string;
  image: string;
  linkedIn?: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
  description: string;
  icon: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-us',
  imports: [CommonModule, ScrollReveal, Button],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs {
  // Founder Information
  founder = {
    name: 'Maria Santos Reyes',
    title: 'Founder & CEO',
    foundedYear: '1996',
    bio: 'Maria Santos Reyes founded Promex Company in 1996 with a vision to create ethical and transparent recruitment pathways for Filipino professionals seeking international opportunities. With over 28 years of experience in the overseas employment industry, she has built Promex into one of the most trusted recruitment agencies in the Philippines.',
    quote: '"Our mission has always been simple: to empower Filipino workers with legitimate, dignified overseas employment while maintaining the highest ethical standards in recruitment."',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    achievements: [
      'DMW Outstanding Recruitment Agency Award 2020',
      '28+ years in overseas recruitment industry',
      'Placed over 50,000 Filipino workers globally',
      'Pioneer in zero-fee ethical recruitment'
    ]
  };

  // Leadership Team
  leadership: LeadershipMember[] = [
    {
      name: 'Roberto Cruz',
      position: 'Chief Operations Officer',
      bio: 'Roberto brings 15+ years of operational excellence to Promex, overseeing recruitment processes, compliance, and quality assurance.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
    },
    {
      name: 'Jennifer Lim',
      position: 'Vice President - Client Relations',
      bio: 'Jennifer manages our global employer partnerships and ensures seamless coordination between clients and recruitment teams.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
    },
    {
      name: 'Carlos Mendoza',
      position: 'Director of Training & Assessment',
      bio: 'Carlos oversees our Circle Test Training and Assessment Center, ensuring candidates receive world-class skills training and certification.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
    },
    {
      name: 'Patricia Tan',
      position: 'Head of Compliance & Legal',
      bio: 'Patricia ensures all Promex operations meet DMW regulations and international labor standards, protecting both workers and employers.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop'
    }
  ];

  // Company Milestones
  milestones: Milestone[] = [
    {
      year: '1996',
      title: 'Promex Company Founded',
      description: 'Maria Santos Reyes established Promex with a mission to provide ethical overseas recruitment services.'
    },
    {
      year: '2005',
      title: 'First 10,000 Workers Deployed',
      description: 'Reached milestone of successfully placing 10,000 Filipino professionals in overseas positions.'
    },
    {
      year: '2012',
      title: 'Circle Test Training Center Opened',
      description: 'Launched in-house training and assessment facility to ensure candidate readiness.'
    },
    {
      year: '2018',
      title: 'ISO 9001:2015 Certification',
      description: 'Achieved international quality management certification for recruitment processes.'
    },
    {
      year: '2020',
      title: 'DMW Excellence Award',
      description: 'Recognized as Outstanding Recruitment Agency by the Department of Migrant Workers.'
    },
    {
      year: '2024',
      title: '50+ Countries Partnership',
      description: 'Expanded our global employer network to over 50 countries across Middle East, Asia, and Europe.'
    }
  ];

  // Certifications & Accreditations
  certifications: Certification[] = [
    {
      name: 'DMW Licensed Recruitment Agency',
      issuer: 'Department of Migrant Workers',
      year: '1996 - Present',
      description: 'Official government license to operate as a private recruitment and placement agency in the Philippines.',
      icon: 'fa-solid fa-certificate'
    },
    {
      name: 'ISO 9001:2015 Certified',
      issuer: 'International Organization for Standardization',
      year: '2018',
      description: 'International quality management standard certification for consistent and reliable recruitment services.',
      icon: 'fa-solid fa-award'
    },
    {
      name: 'POEA Accreditation',
      issuer: 'Philippine Overseas Employment Administration',
      year: '1996 - Present',
      description: 'Accredited to recruit and deploy Filipino workers for overseas employment opportunities.',
      icon: 'fa-solid fa-shield-halved'
    },
    {
      name: 'Circle Test Assessment Center',
      issuer: 'TESDA Registered',
      year: '2012',
      description: 'Government-registered training and assessment center for trade testing and skills certification.',
      icon: 'fa-solid fa-graduation-cap'
    },
    {
      name: 'OWWA Partner Agency',
      issuer: 'Overseas Workers Welfare Administration',
      year: '1996 - Present',
      description: 'Official partner ensuring overseas Filipino workers receive proper welfare support and protection.',
      icon: 'fa-solid fa-handshake'
    }
  ];

  // Company Values
  values = [
    {
      icon: 'fa-solid fa-heart',
      title: 'Integrity',
      description: 'We maintain the highest ethical standards in all our recruitment processes and business dealings.'
    },
    {
      icon: 'fa-solid fa-users',
      title: 'People-Centered',
      description: 'Every decision we make prioritizes the welfare and dignity of Filipino workers and their families.'
    },
    {
      icon: 'fa-solid fa-lightbulb',
      title: 'Excellence',
      description: 'We continuously improve our services to deliver world-class recruitment solutions.'
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      title: 'Transparency',
      description: 'We believe in clear communication and honest dealings with candidates and employers alike.'
    }
  ];

  // Company Statistics
  stats = [
    { number: '28+', label: 'Years of Experience' },
    { number: '50,000+', label: 'Workers Deployed' },
    { number: '50+', label: 'Partner Countries' },
    { number: '1,000+', label: 'Employer Partners' }
  ];
}
