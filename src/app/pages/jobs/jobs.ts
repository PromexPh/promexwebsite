import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

interface Job {
  id: number;
  title: string;
  company: string;
  country: string;
  industry: string;
  salary: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted: string;
}

@Component({
  selector: 'app-jobs',
  imports: [CommonModule, FormsModule, ScrollReveal, Button],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs {
  searchQuery = '';
  selectedCountry = '';
  selectedIndustry = '';
  selectedType = '';

  countries = ['All Countries', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Singapore', 'Japan', 'Canada', 'Australia'];
  industries = ['All Industries', 'Hospitality', 'Healthcare', 'Retail', 'Engineering', 'IT & Technology', 'Construction'];
  jobTypes = ['All Types', 'Full-time', 'Contract', 'Part-time'];

  allJobs: Job[] = [
    {
      id: 1,
      title: 'Hotel Manager',
      company: 'Luxury Resort International',
      country: 'UAE',
      industry: 'Hospitality',
      salary: '$3,500 - $4,500',
      type: 'Full-time',
      experience: '5+ years',
      description: 'Seeking experienced hotel manager for luxury resort in Dubai. Must have strong leadership and operational management skills.',
      requirements: ['Bachelor\'s degree in Hospitality Management', '5+ years hotel management experience', 'Strong leadership skills', 'Excellent English communication'],
      benefits: ['Competitive salary', 'Accommodation provided', 'Health insurance', 'Annual bonus'],
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Registered Nurse',
      company: 'National Medical Center',
      country: 'Saudi Arabia',
      industry: 'Healthcare',
      salary: '$2,800 - $3,500',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Looking for dedicated registered nurses to join our growing healthcare team in Riyadh.',
      requirements: ['Valid nursing license', '2+ years clinical experience', 'PROMETRIC or equivalent certification', 'Good English skills'],
      benefits: ['Tax-free income', 'Free accommodation', 'Medical coverage', 'Paid vacation'],
      posted: '3 days ago'
    },
    {
      id: 3,
      title: 'Civil Engineer',
      company: 'Global Construction Corp',
      country: 'Qatar',
      industry: 'Engineering',
      salary: '$4,000 - $5,500',
      type: 'Contract',
      experience: '3+ years',
      description: 'Major infrastructure project requires experienced civil engineers for 2-year contract in Doha.',
      requirements: ['Bachelor\'s degree in Civil Engineering', '3+ years experience', 'AutoCAD proficiency', 'Project management skills'],
      benefits: ['High compensation', 'Project completion bonus', 'Flight tickets', 'Premium accommodation'],
      posted: '1 week ago'
    },
    {
      id: 4,
      title: 'Software Developer',
      company: 'Tech Solutions Asia',
      country: 'Singapore',
      industry: 'IT & Technology',
      salary: '$4,500 - $6,000',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Join our innovative tech team developing cutting-edge solutions for global clients.',
      requirements: ['Bachelor\'s degree in Computer Science', 'Proficiency in JavaScript/React', '3+ years development experience', 'Strong problem-solving skills'],
      benefits: ['Competitive package', 'Career growth opportunities', 'Modern office environment', 'Training programs'],
      posted: '4 days ago'
    },
    {
      id: 5,
      title: 'Restaurant Manager',
      company: 'Global Food Chain',
      country: 'UAE',
      industry: 'Hospitality',
      salary: '$2,500 - $3,200',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Manage daily operations of high-volume restaurant in Abu Dhabi. Experience with international cuisine preferred.',
      requirements: ['3+ years restaurant management', 'Food safety certification', 'Team leadership experience', 'Customer service excellence'],
      benefits: ['Competitive salary', 'Performance bonuses', 'Staff meals', 'Career advancement'],
      posted: '5 days ago'
    },
    {
      id: 6,
      title: 'Physical Therapist',
      company: 'Rehabilitation Center',
      country: 'Canada',
      industry: 'Healthcare',
      salary: '$3,800 - $4,800',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Provide quality rehabilitation services in modern facility in Toronto.',
      requirements: ['Licensed Physical Therapist', '2+ years experience', 'Specialization in sports therapy preferred', 'Excellent communication skills'],
      benefits: ['Competitive Canadian salary', 'Immigration support', 'Health benefits', 'Professional development'],
      posted: '1 week ago'
    },
    {
      id: 7,
      title: 'Retail Store Supervisor',
      company: 'Fashion Retail Group',
      country: 'Qatar',
      industry: 'Retail',
      salary: '$2,200 - $2,800',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Supervise store operations and staff in premium shopping mall location.',
      requirements: ['2+ years retail supervisory experience', 'Sales target achievement record', 'Customer service oriented', 'Inventory management skills'],
      benefits: ['Good salary package', 'Sales commissions', 'Housing allowance', 'Flight tickets'],
      posted: '6 days ago'
    },
    {
      id: 8,
      title: 'Manufacturing Technician',
      company: 'Industrial Manufacturing Inc',
      country: 'Japan',
      industry: 'Engineering',
      salary: '$3,200 - $4,000',
      type: 'Contract',
      experience: '1+ years',
      description: 'Operate and maintain manufacturing equipment in automotive parts facility.',
      requirements: ['Technical diploma or equivalent', 'Experience with manufacturing equipment', 'Quality control knowledge', 'Basic Japanese helpful'],
      benefits: ['Competitive compensation', 'Language training', 'Accommodation support', 'Overtime pay'],
      posted: '3 days ago'
    }
  ];

  selectedJob: Job | null = null;

  get filteredJobs(): Job[] {
    return this.allJobs.filter(job => {
      const matchesSearch = !this.searchQuery ||
        job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCountry = !this.selectedCountry || this.selectedCountry === 'All Countries' || job.country === this.selectedCountry;
      const matchesIndustry = !this.selectedIndustry || this.selectedIndustry === 'All Industries' || job.industry === this.selectedIndustry;
      const matchesType = !this.selectedType || this.selectedType === 'All Types' || job.type === this.selectedType;

      return matchesSearch && matchesCountry && matchesIndustry && matchesType;
    });
  }

  selectJob(job: Job) {
    this.selectedJob = job;
    // Scroll to top of job details
    document.querySelector('.job-details-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  closeJobDetails() {
    this.selectedJob = null;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCountry = '';
    this.selectedIndustry = '';
    this.selectedType = '';
  }
}
