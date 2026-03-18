'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './Footer.module.css';

const quickLinks = [
  { label: 'Home',               path: '/'               },
  { label: 'About Us',           path: '/about-us'       },
  { label: 'Why Promex',         path: '/why-promex'     },
  { label: 'Industries We Serve',path: '/industries'     },
  { label: 'Our Experience',     path: '/our-experience' },
  { label: 'Contact Us',         path: '/contact'        },
];

const socialLinks = [
  { icon: 'fa-brands fa-facebook-f',  url: '#', label: 'Facebook'  },
  { icon: 'fa-brands fa-linkedin-in', url: '#', label: 'LinkedIn'  },
  { icon: 'fa-brands fa-instagram',   url: '#', label: 'Instagram' },
  { icon: 'fa-brands fa-x-twitter',   url: '#', label: 'Twitter'   },
];

const contactItems = [
  {
    icon: 'fa-solid fa-location-dot',
    text: 'Suite A, 2/F Vision Building,\n162 Pasig Blvd, Pasig, 1800 Metro Manila',
  },
  { icon: 'fa-solid fa-phone',    text: '+63 2 7746 4689'            },
  { icon: 'fa-solid fa-envelope', text: 'inquiries@promexph.com'     },
  { icon: 'fa-solid fa-id-badge', text: 'License No. 149-LB-051316-R' },
];

const currentYear = new Date().getFullYear();

export default function Footer() {
  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className={styles.footer}>
      {/* ── Main grid ── */}
      <div className={styles.footerMain}>
        <div className={styles.footerContainer}>

          {/* Brand column */}
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <Image
                src="/promex-logo.png"
                alt="Promex logo"
                width={160}
                height={48}
                className={styles.footerLogoImg}
              />
            </Link>
            <p className={styles.footerTagline}>
              Your Trusted Overseas Recruitment Partner Since 1996.
              Connecting world-class Filipino talent with global opportunities.
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  className={styles.socialBtn}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={s.icon} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links column */}
          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Contact Information</h4>
            <ul className={styles.contactList}>
              {contactItems.map((item) => (
                <li key={item.icon} className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <i className={item.icon} aria-hidden="true" />
                  </span>
                  <span className={styles.contactText}>
                    {item.text.split('\n').map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Stay Updated</h4>
            <p className={styles.footerSubText}>
              Subscribe to receive updates on new job opportunities and company news.
            </p>
            {subscribed ? (
              <div className={styles.subscribedMsg}>
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                Thank you for subscribing!
              </div>
            ) : (
              <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  className={styles.subscribeInput}
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button label="Subscribe" type="submit" variant="primary" fullWidth />
              </form>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.footerBottom}>
        <div className={`${styles.footerContainer} ${styles.footerBottomInner}`}>
          <p className={styles.copyright}>
            &copy; {currentYear} Promex Company. All rights reserved.
          </p>
          <p className={styles.footerBadges}>
            Established 1996 &middot; DMW Accredited &middot; Overseas Recruitment Agency
          </p>
        </div>
      </div>
    </footer>
  );
}
