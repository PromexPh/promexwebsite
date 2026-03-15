import { Component } from '@angular/core';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal.directive';
import { CommonModule } from '@angular/common';

interface Client {
  name:     string;
  category: string;
  logo?:    string;
}

@Component({
  selector: 'app-clients',
  imports: [ScrollReveal, CommonModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  allClients: Client[] = [
    { name: 'Marriott International', category: 'Hotels',        logo: 'images/Ads/Marriott-Logo.png' },
    { name: 'Hilton Worldwide',       category: 'Hotels',        logo: 'images/Ads/hilton-international.svg' },
    { name: 'Sheraton Hotels',        category: 'Hotels',        logo: 'images/Ads/sheraton-hotels-resorts-logo.svg' },
    { name: 'Kempinski Hotels',       category: 'Hotels',        logo: 'images/Ads/kempinski-hotels-logo.png' },
    { name: 'Grand Millennium Hotels',category: 'Hotels',        logo: 'images/Ads/grand-millennium-hotels-logo.png' },
    { name: 'Fairmont Hotels',        category: 'Hotels',        logo: 'images/Ads/fairmont-logo.png' },
    { name: 'Le Méridien',            category: 'Hotels',        logo: 'images/Ads/meridien-oran-logo.png' },
    { name: 'Emirates Palace',        category: 'Hotels',        logo: 'images/Ads/emirates-palace-logo.png' },
    { name: 'Fauchon Paris',          category: 'Retail',        logo: 'images/Ads/fauchon-paris-logo.png' },
    { name: 'Best Food',              category: 'Retail',        logo: 'images/Ads/best-food-logo.jpeg' },
    { name: 'Hyundai',                category: 'Corporations',  logo: 'images/Ads/hyundai-logo.png' },
    { name: 'Camacho Group',          category: 'Corporations',  logo: 'images/Ads/camacho-logo.png' },
  ];

  // Duplicate for seamless marquee loop
  marqueeItems = [...this.allClients, ...this.allClients];
}
