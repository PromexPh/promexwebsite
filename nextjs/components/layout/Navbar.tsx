'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Home',           path: '/'               },
  { label: 'About Us',       path: '/about-us'       },
  { label: 'Why Promex',     path: '/why-promex'     },
  { label: 'Industries',     path: '/industries'     },
  { label: 'Our Experience', path: '/our-experience' },
  { label: 'Contact Us',     path: '/contact'        },
];

export default function Navbar() {
  const [scrolled,        setScrolled]        = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>

        {/* Logo */}
        <Link href="/" className={styles.navLogo}>
          <Image
            src="/promex-logo.png"
            alt="Promex logo"
            width={160}
            height={44}
            className={styles.navLogoImg}
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className={`${styles.navLink} ${isActive(link.path) ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA buttons */}
        <div className={styles.navActions}>
          <Button label="Request Talent"    href="/employer-inquiry" variant="primary" size="md" />
          <Button label="View Overseas Jobs" href="/jobs"            variant="accent"  size="md" />
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''}`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        <ul className={styles.mobileNavLinks}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className={`${styles.navLink} ${isActive(link.path) ? styles.active : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.mobileActions}>
          <Button
            label="Request Talent"
            href="/employer-inquiry"
            variant="primary"
            fullWidth
            onClick={() => setMobileMenuOpen(false)}
          />
          <Button
            label="View Overseas Jobs"
            href="/jobs"
            variant="accent"
            fullWidth
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
}
