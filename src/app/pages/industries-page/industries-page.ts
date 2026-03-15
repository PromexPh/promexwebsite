import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

export interface Industry {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  badge?: string;
  roles: string[];
}

@Component({
  selector: 'app-industries-page',
  imports: [RouterLink, ScrollReveal, Button],
  templateUrl: './industries-page.html',
  styleUrl: './industries-page.css'
})
export class IndustriesPage {
  industries: Industry[] = [
    {
      id: 'healthcare',
      name: 'Healthcare & Medical',
      tagline: 'Caring professionals for the world',
      description:
        'We provide highly qualified healthcare professionals trained to international clinical standards. Our nurses, caregivers, and allied health workers are placed in top hospitals and care facilities across the Middle East, Europe, and Asia.',
      image: 'images/industries_images/healthcare.jpg',
      badge: 'High Demand',
      roles: [
        'Registered Nurses (RN)',
        'Caregivers & Home Health Aides',
        'Radiographers & Radiologic Technologists',
        'Medical Technologists',
        'Physical & Occupational Therapists',
        'Dental Technicians & Assistants',
      ],
    },
    {
      id: 'engineering',
      name: 'Engineering & Construction',
      tagline: 'Building the worlds infrastructure',
      description:
        'Promex supplies seasoned engineering and construction professionals for large-scale infrastructure, oil & gas, and industrial projects. Our workers are trade-tested, safety-certified, and ready for demanding site conditions.',
      image: 'images/industries_images/engineering.jpg',
      badge: 'High Demand',
      roles: [
        'Civil & Structural Engineers',
        'Welders & Pipefitters',
        'Electrical Engineers & Technicians',
        'Heavy Equipment Operators',
        'Safety Officers (HSE)',
        'Project Managers & Supervisors',
      ],
    },
    {
      id: 'hospitality',
      name: 'Hospitality & Tourism',
      tagline: 'Delivering world-class guest experiences',
      description:
        'From five-star hotels to cruise lines, Promex connects hospitality employers with skilled Filipino service professionals known globally for warmth, diligence, and high service standards.',
      image: 'images/industries_images/hospitality.jpg',
      roles: [
        'Hotel Front Desk & Concierge',
        'F&B Servers & Bartenders',
        'Executive & Sous Chefs',
        'Housekeeping Supervisors',
        'Cruise Ship Crew',
        'Resort & Spa Attendants',
      ],
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Production',
      tagline: 'Powering global production lines',
      description:
        'We supply production-ready workers for factories, assembly lines, and processing plants. Our candidates are vetted for technical aptitude, quality awareness, and adherence to international safety standards.',
      image: 'images/industries_images/manufacturing.jpg',
      roles: [
        'Production Line Operators',
        'Quality Control Inspectors',
        'CNC Machine Operators',
        'Warehouse & Logistics Staff',
        'Forklift & Material Handling',
        'Factory Supervisors',
      ],
    },
    {
      id: 'it-telecom',
      name: 'IT & Telecommunications',
      tagline: 'Connecting the digital economy',
      description:
        'Promex bridges the gap between global tech employers and highly skilled Filipino IT professionals. From software development to network infrastructure, our candidates are technically sharp and globally competitive.',
      image: 'images/industries_images/it.jpg',
      badge: 'Growing Sector',
      roles: [
        'Software Developers & Engineers',
        'Network & Systems Administrators',
        'IT Support & Help Desk',
        'Cybersecurity Analysts',
        'Data Analysts & BI Specialists',
        'Telecom Field Technicians',
      ],
    },
    {
      id: 'domestic',
      name: 'Domestic & Household Services',
      tagline: 'Trusted help for every household',
      description:
        'Filipino household workers are among the most trusted in the world. Promex places trained, background-checked domestic helpers, nannies, and household managers for families across the Middle East and beyond.',
      image:
        'images/industries_images/domestic.jpg',
      badge: 'High Demand',
      roles: [
        'Household Service Workers (HSW)',
        'Nannies & Childcare Workers',
        'Elderly & Companion Caregivers',
        'Private Cooks & Kitchen Help',
        'Personal Drivers',
        'Household Managers',
      ],
    },
  ];
}
