import { Component, signal, computed } from '@angular/core';
import { ScrollReveal } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { Button } from '../../shared/components/ui/button/button';

interface Country {
  flag: string;
  name: string;
  deployed: string;
  sectors: string;
  region: 'Middle East' | 'Europe' | 'Asia';
}

interface Client {
  name: string;
  category: string;
}

interface Testimonial {
  category: string;
  rating: number;
  quote: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
}

@Component({
  selector: 'app-our-experience',
  imports: [ScrollReveal, Button],
  templateUrl: './our-experience.html',
  styleUrl: './our-experience.css',
})
export class OurExperience {
  /* ---- Countries ---- */
  regionFilter = signal<'Middle East' | 'Europe' | 'Asia'>('Middle East');
  regions: Array<'Middle East' | 'Europe' | 'Asia'> = ['Middle East', 'Europe', 'Asia'];

  allCountries: Country[] = [
    { flag: '🇸🇦', name: 'Saudi Arabia', deployed: '15,000+', sectors: 'Healthcare, Engineering, Retail', region: 'Middle East' },
    { flag: '🇦🇪', name: 'UAE',           deployed: '12,000+', sectors: 'Hospitality, IT, Construction',  region: 'Middle East' },
    { flag: '🇶🇦', name: 'Qatar',         deployed: '8,000+',  sectors: 'Construction, Healthcare, Hospitality', region: 'Middle East' },
    { flag: '🇰🇼', name: 'Kuwait',        deployed: '5,000+',  sectors: 'Healthcare, Retail, Manufacturing', region: 'Middle East' },
    { flag: '🇧🇭', name: 'Bahrain',       deployed: '3,000+',  sectors: 'Hospitality, Finance, IT',        region: 'Middle East' },
    { flag: '🇴🇲', name: 'Oman',          deployed: '4,000+',  sectors: 'Engineering, Healthcare, Construction', region: 'Middle East' },
    { flag: '🇬🇧', name: 'United Kingdom', deployed: '2,500+', sectors: 'Healthcare, IT, Finance',         region: 'Europe' },
    { flag: '🇩🇪', name: 'Germany',       deployed: '1,800+',  sectors: 'Engineering, Manufacturing, IT', region: 'Europe' },
    { flag: '🇳🇱', name: 'Netherlands',   deployed: '1,200+',  sectors: 'Healthcare, Logistics, IT',      region: 'Europe' },
    { flag: '🇮🇹', name: 'Italy',         deployed: '900+',    sectors: 'Hospitality, Healthcare',        region: 'Europe' },
    { flag: '🇨🇾', name: 'Cyprus',        deployed: '700+',    sectors: 'Hospitality, Construction',      region: 'Europe' },
    { flag: '🇲🇹', name: 'Malta',         deployed: '500+',    sectors: 'Healthcare, Hospitality',        region: 'Europe' },
    { flag: '🇸🇬', name: 'Singapore',     deployed: '3,500+',  sectors: 'Healthcare, IT, Finance',        region: 'Asia' },
    { flag: '🇭🇰', name: 'Hong Kong',     deployed: '2,200+',  sectors: 'Domestic, Hospitality, Finance', region: 'Asia' },
    { flag: '🇯🇵', name: 'Japan',         deployed: '1,500+',  sectors: 'Manufacturing, Healthcare',      region: 'Asia' },
    { flag: '🇰🇷', name: 'South Korea',   deployed: '1,100+',  sectors: 'Manufacturing, IT',              region: 'Asia' },
    { flag: '🇹🇼', name: 'Taiwan',        deployed: '900+',    sectors: 'Electronics, Manufacturing',     region: 'Asia' },
    { flag: '🇲🇾', name: 'Malaysia',      deployed: '800+',    sectors: 'Hospitality, Construction',      region: 'Asia' },
  ];

  filteredCountries = computed(() =>
    this.allCountries.filter((c) => c.region === this.regionFilter())
  );

  /* ---- Clients ---- */
  clientFilter = signal('Healthcare Institutions');
  clientCategories = [
    'Healthcare Institutions',
    'Multinational Corporations',
    'Hotels & Resorts',
    'Retail & Customer Service',
    'Government Agencies',
  ];

  allClients: Client[] = [
    { name: 'King Fahad Medical City',    category: 'Healthcare Institutions' },
    { name: 'Cleveland Clinic Abu Dhabi', category: 'Healthcare Institutions' },
    { name: 'Gulf Medical University',    category: 'Healthcare Institutions' },
    { name: 'SEHA Health Authority',      category: 'Healthcare Institutions' },
    { name: 'NMC Healthcare',            category: 'Healthcare Institutions' },
    { name: 'Aster DM Healthcare',        category: 'Healthcare Institutions' },
    { name: 'Rashid Hospital Dubai',      category: 'Healthcare Institutions' },
    { name: 'HMC Qatar',                  category: 'Healthcare Institutions' },
    { name: 'National Guard Hospital',    category: 'Healthcare Institutions' },
    { name: 'Samsung C&T',               category: 'Multinational Corporations' },
    { name: 'Aramco',                     category: 'Multinational Corporations' },
    { name: 'Siemens',                    category: 'Multinational Corporations' },
    { name: 'ENEC',                       category: 'Multinational Corporations' },
    { name: 'Fluor Corporation',          category: 'Multinational Corporations' },
    { name: 'Al Futtaim Group',           category: 'Multinational Corporations' },
    { name: 'Shangri-La Hotels',          category: 'Hotels & Resorts' },
    { name: 'Marriott International',     category: 'Hotels & Resorts' },
    { name: 'Hilton Worldwide',           category: 'Hotels & Resorts' },
    { name: 'InterContinental Hotels',    category: 'Hotels & Resorts' },
    { name: 'Rotana Hotels',              category: 'Hotels & Resorts' },
    { name: 'Jumeirah Group',             category: 'Hotels & Resorts' },
    { name: 'LuLu Hypermarket',           category: 'Retail & Customer Service' },
    { name: 'Landmark Group',             category: 'Retail & Customer Service' },
    { name: 'Al Shaya Group',             category: 'Retail & Customer Service' },
    { name: 'Carrefour Middle East',      category: 'Retail & Customer Service' },
    { name: 'Ministry of Health UAE',     category: 'Government Agencies' },
    { name: 'MOI Qatar',                  category: 'Government Agencies' },
    { name: 'Saudi MOH',                  category: 'Government Agencies' },
    { name: 'Kuwait Civil Service',       category: 'Government Agencies' },
  ];

  filteredClients = computed(() =>
    this.allClients.filter((c) => c.category === this.clientFilter())
  );

  /* ---- Testimonials ---- */
  testimonials: Testimonial[] = [
    {
      category: 'Healthcare',
      rating: 5,
      quote: '"Promex Company has been our preferred recruitment partner for over 10 years. Their nurses are highly skilled, professionally trained, and perfectly matched to our clinical environment."',
      name: 'Sarah Al-Rashidi',
      title: 'HR Director',
      company: 'Gulf Medical University, UAE',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      category: 'Manufacturing',
      rating: 5,
      quote: '"The technical workers sourced through Promex have consistently exceeded our expectations. Their screening process ensures only the most qualified candidates reach our facilities."',
      name: 'David Chen',
      title: 'Operations Manager',
      company: 'Samsung C&T, South Korea',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      category: 'Hospitality',
      rating: 5,
      quote: '"Our hospitality team would not be the same without the talented professionals Promex has placed with us. Genuine care for both employer and employee makes them stand out."',
      name: 'Fatima Al-Mansoori',
      title: 'General Manager',
      company: 'InterContinental Hotels, Qatar',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  stars(n: number) {
    return Array(n).fill(0);
  }
}
