import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'why-promex',
    loadComponent: () => import('./pages/why-promex/why-promex').then(m => m.WhyPromex)
  },
  {
    path: 'industries',
    loadComponent: () => import('./pages/industries-page/industries-page').then(m => m.IndustriesPage)
  },
  {
    path: 'our-experience',
    loadComponent: () => import('./pages/our-experience/our-experience').then(m => m.OurExperience)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
  },
  {
    path: 'apply',
    loadComponent: () => import('./pages/apply/apply').then(m => m.Apply)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs').then(m => m.Jobs)
  },
  {
    path: 'employer-inquiry',
    loadComponent: () => import('./pages/employer-inquiry/employer-inquiry').then(m => m.EmployerInquiry)
  },
  {
    path: 'about-us',
    loadComponent: () => import('./pages/about-us/about-us').then(m => m.AboutUs)
  }
];
