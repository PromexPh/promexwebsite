import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../ui/button/button';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule, FormsModule, Button],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  emailInput = '';
  subscribed = false;

  quickLinks = [
    { label: 'Home',              path: '/'               },
    { label: 'About Us',          path: '/about'          },
    { label: 'Why Promex',        path: '/why-promex'     },
    { label: 'Industries We Serve', path: '/industries'   },
    { label: 'Our Experience',    path: '/our-experience' },
    { label: 'Contact Us',        path: '/contact'        },
  ];

  socialLinks = [
    { icon: 'fa-brands fa-facebook-f',  url: '#', label: 'Facebook'  },
    { icon: 'fa-brands fa-linkedin-in', url: '#', label: 'LinkedIn'  },
    { icon: 'fa-brands fa-instagram',   url: '#', label: 'Instagram' },
    { icon: 'fa-brands fa-x-twitter',   url: '#', label: 'Twitter'   },
  ];

  contactItems = [
    { icon: 'fa-solid fa-location-dot', text: 'Suite A, 2/F Vision Building,\n162 Pasig Blvd, Pasig, 1800 Metro Manila' },
    { icon: 'fa-solid fa-phone',        text: '+63 2 7746 4689'           },
    { icon: 'fa-solid fa-envelope',     text: 'inquiries@promexph.com'    },
    { icon: 'fa-solid fa-id-badge',     text: 'License No. 149-LB-051316-R' },
  ];

  onSubscribe() {
    if (this.emailInput.trim()) {
      this.subscribed = true;
      this.emailInput = '';
    }
  }
}
