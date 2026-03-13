import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

interface ApplicationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;

  // Address
  address: string;
  city: string;
  province: string;
  zipCode: string;

  // Job Preferences
  preferredIndustry: string;
  preferredPosition: string;
  preferredCountry: string;
  expectedSalary: string;

  // Education & Experience
  highestEducation: string;
  yearsOfExperience: string;
  currentEmployer: string;
  skills: string;

  // Additional Information
  passportNumber: string;
  passportExpiry: string;
  availability: string;
  message: string;
}

@Component({
  selector: 'app-apply',
  imports: [CommonModule, FormsModule, ScrollReveal, Button],
  templateUrl: './apply.html',
  styleUrl: './apply.css'
})
export class Apply {
  // Application method: 'choose' | 'linkedin' | 'cv' | 'manual'
  applicationMethod: 'choose' | 'linkedin' | 'cv' | 'manual' = 'choose';

  // CV Upload
  uploadedCV: File | null = null;
  cvFileName: string = '';

  formData: ApplicationForm = {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    civilStatus: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    preferredIndustry: '',
    preferredPosition: '',
    preferredCountry: '',
    expectedSalary: '',
    highestEducation: '',
    yearsOfExperience: '',
    currentEmployer: '',
    skills: '',
    passportNumber: '',
    passportExpiry: '',
    availability: '',
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
    'Other'
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
    'Canada',
    'United Kingdom',
    'Australia',
    'New Zealand',
    'Other'
  ];

  educationLevels = [
    'High School',
    'Vocational/Technical',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate'
  ];

  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  selectApplicationMethod(method: 'linkedin' | 'cv' | 'manual') {
    this.applicationMethod = method;
  }

  backToChoose() {
    this.applicationMethod = 'choose';
    this.uploadedCV = null;
    this.cvFileName = '';
  }

  applyViaLinkedIn() {
    // Redirect to LinkedIn job posting or company page
    // Replace with your actual LinkedIn URL
    window.open('https://www.linkedin.com/company/promex-company', '_blank');
  }

  onCVFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Check file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        this.uploadedCV = file;
        this.cvFileName = file.name;
      } else {
        alert('Please upload a PDF or Word document');
        input.value = '';
      }
    }
  }

  removeCV() {
    this.uploadedCV = null;
    this.cvFileName = '';
  }

  onSubmit() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;

      if (this.applicationMethod === 'cv') {
        console.log('CV Application submitted:', this.uploadedCV, this.formData);
      } else {
        console.log('Manual Application submitted:', this.formData);
      }

      // Reset form after successful submission
      setTimeout(() => {
        this.submitSuccess = false;
        this.resetForm();
      }, 3000);
    }, 1500);
  }

  resetForm() {
    this.applicationMethod = 'choose';
    this.uploadedCV = null;
    this.cvFileName = '';
    this.formData = {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      civilStatus: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
      preferredIndustry: '',
      preferredPosition: '',
      preferredCountry: '',
      expectedSalary: '',
      highestEducation: '',
      yearsOfExperience: '',
      currentEmployer: '',
      skills: '',
      passportNumber: '',
      passportExpiry: '',
      availability: '',
      message: ''
    };
  }
}
