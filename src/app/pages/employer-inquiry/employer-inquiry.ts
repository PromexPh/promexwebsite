import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

interface EmployerInquiryForm {
  // Company Information
  companyName: string;
  industry: string;
  companySize: string;
  contactPerson: string;
  position: string;
  email: string;
  phone: string;
  country: string;
  website: string;

  // Hiring Needs
  positionsNeeded: string;
  numberOfWorkers: string;
  targetIndustry: string;
  requiredSkills: string;
  urgency: string;

  // Employment Details
  employmentType: string;
  salaryRange: string;
  contractDuration: string;
  accommodationProvided: string;

  // Additional Information
  additionalRequirements: string;
  message: string;
}

@Component({
  selector: 'app-employer-inquiry',
  imports: [CommonModule, FormsModule, ScrollReveal, Button],
  templateUrl: './employer-inquiry.html',
  styleUrl: './employer-inquiry.css'
})
export class EmployerInquiry {
  formData: EmployerInquiryForm = {
    companyName: '',
    industry: '',
    companySize: '',
    contactPerson: '',
    position: '',
    email: '',
    phone: '',
    country: '',
    website: '',
    positionsNeeded: '',
    numberOfWorkers: '',
    targetIndustry: '',
    requiredSkills: '',
    urgency: '',
    employmentType: '',
    salaryRange: '',
    contractDuration: '',
    accommodationProvided: '',
    additionalRequirements: '',
    message: ''
  };

  industries = [
    'Hospitality',
    'Healthcare',
    'Retail',
    'Engineering',
    'Construction',
    'IT & Technology',
    'Food Service',
    'Manufacturing',
    'Transportation',
    'Agriculture',
    'Maritime',
    'Security',
    'Education',
    'Other'
  ];

  companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  countries = [
    'Saudi Arabia',
    'UAE',
    'Qatar',
    'Kuwait',
    'Oman',
    'Bahrain',
    'Singapore',
    'Hong Kong',
    'Japan',
    'South Korea',
    'Taiwan',
    'Malaysia',
    'Canada',
    'United Kingdom',
    'Australia',
    'New Zealand',
    'United States',
    'Other'
  ];

  urgencyLevels = [
    'Immediate (within 1 month)',
    'Short-term (1-3 months)',
    'Medium-term (3-6 months)',
    'Long-term planning (6+ months)'
  ];

  employmentTypes = [
    'Full-time Permanent',
    'Contract (Fixed-term)',
    'Part-time',
    'Seasonal',
    'Project-based'
  ];

  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  onSubmit() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      console.log('Employer inquiry submitted:', this.formData);

      // Reset form after successful submission
      setTimeout(() => {
        this.submitSuccess = false;
        this.resetForm();
      }, 3000);
    }, 1500);
  }

  resetForm() {
    this.formData = {
      companyName: '',
      industry: '',
      companySize: '',
      contactPerson: '',
      position: '',
      email: '',
      phone: '',
      country: '',
      website: '',
      positionsNeeded: '',
      numberOfWorkers: '',
      targetIndustry: '',
      requiredSkills: '',
      urgency: '',
      employmentType: '',
      salaryRange: '',
      contractDuration: '',
      accommodationProvided: '',
      additionalRequirements: '',
      message: ''
    };
  }
}
