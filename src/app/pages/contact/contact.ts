import { Component, signal } from '@angular/core';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';

interface ProcessStep {
  icon: string;
  title: string;
  description: string;
  link?: {
    text: string;
    url: string;
  };
}

interface Vacancy {
  category: string;
  title: string;
  location: string;
  slots: number;
  urgent?: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ScrollReveal],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  processSteps: ProcessStep[] = [
    {
      icon: 'fa-briefcase',
      title: 'Client Consultation & Job Order Verification',
      description: 'We meet with employers to understand their exact manpower requirements, verify the legitimacy of job orders, and align on terms.'
    },
    {
      icon: 'fa-user-check',
      title: 'Talent Sourcing & Screening',
      description: 'Our recruitment team sources qualified candidates from our extensive database and through active job fairs, partner schools, and referral networks.'
    },
    {
      icon: 'fa-clipboard-check',
      title: 'Skills Assessment & Training',
      description: 'Shortlisted candidates undergo rigorous trade testing, language assessment, and pre-departure orientation to ensure they are fully prepared. Our in-house trade testing and housekeeping training programs are conducted at our certified training facility.',
      link: {
        text: 'Circle Test Training and Assessment Center',
        url: 'https://circletesttvi.gnomio.com/my/'
      }
    },
    {
      icon: 'fa-file-lines',
      title: 'Documentation & Visa Processing',
      description: 'We handle all documentation — employment contracts, medical exams, authentication, visa applications, and OWWA/DMW processing.'
    },
    {
      icon: 'fa-plane-departure',
      title: 'Deployment & Post-Deployment Support',
      description: 'We arrange flights, coordinate with employers on arrival, and provide ongoing post-deployment support to ensure smooth integration.'
    }
  ];

  vacancies: Vacancy[] = [
    { category: 'Healthcare', title: 'Registered Nurse', location: 'Saudi Arabia', slots: 50, urgent: true },
    { category: 'Engineering', title: 'Civil Engineer', location: 'UAE', slots: 20 },
    { category: 'Hospitality', title: 'Head Chef', location: 'Qatar', slots: 10, urgent: true },
    { category: 'Manufacturing', title: 'Machine Operator', location: 'South Korea', slots: 30 },
    { category: 'Healthcare', title: 'Caregiver', location: 'Germany', slots: 40, urgent: true },
    { category: 'IT', title: 'Software Developer', location: 'Singapore', slots: 15 },
    { category: 'Engineering', title: 'Welder (ASME)', location: 'Kuwait', slots: 25, urgent: true },
    { category: 'Hospitality', title: 'Housekeeping Supervisor', location: 'UK', slots: 12 }
  ];

  desiredPositions = [
    'Registered Nurse', 'Caregiver', 'Civil Engineer', 'Welder (ASME)',
    'Machine Operator', 'Head Chef', 'Housekeeping Supervisor', 'Software Developer',
    'Other'
  ];

  educationLevels = [
    'High School Diploma', 'Vocational / Technical Certificate', 'Associate Degree',
    'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate / PhD'
  ];

  selectedFile = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0].name);
    }
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'Healthcare': 'cat--healthcare',
      'Engineering': 'cat--engineering',
      'Hospitality': 'cat--hospitality',
      'Manufacturing': 'cat--manufacturing',
      'IT': 'cat--it'
    };
    return map[category] ?? '';
  }
}
