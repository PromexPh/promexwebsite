import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from '../ui/button/button';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule, Button],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  navLinks: { label: string; path: string; fragment?: string }[] = [
    { label: 'Home',           path: '/'               },
    { label: 'About Us',       path: '/about-us'       },
    { label: 'Why Promex',     path: '/why-promex'     },
    { label: 'Industries',     path: '/industries'     },
    { label: 'Our Experience', path: '/our-experience' },
    { label: 'Contact Us',     path: '/contact'        },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
