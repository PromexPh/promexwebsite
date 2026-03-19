'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Home',           path: '/'               },
  { label: 'About Us',       path: '/about-us'       },
  { label: 'Why Promex',     path: '/why-promex'     },
  { label: 'Industries',     path: '/industries'     },
  { label: 'Our Experience', path: '/our-experience' },
  { label: 'Contact Us',     path: '/contact'        },
];

type UserRole = 'candidate' | 'employer' | null;

export default function Navbar() {
  const [scrolled,        setScrolled]        = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [candidatesOpen,  setCandidatesOpen]  = useState(false);
  const [employersOpen,   setEmployersOpen]   = useState(false);
  const [session,         setSession]         = useState<Session | null>(null);
  const [userRole,        setUserRole]        = useState<UserRole>(null);
  const [displayName,     setDisplayName]     = useState('');
  const [authLoaded,      setAuthLoaded]      = useState(false);

  const pathname      = usePathname();
  const router        = useRouter();
  const candidatesRef = useRef<HTMLDivElement>(null);
  const employersRef  = useRef<HTMLDivElement>(null);

  // ── Scroll ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close on navigation ──────────────────────────────────────────────────────
  useEffect(() => {
    setMobileMenuOpen(false);
    setCandidatesOpen(false);
    setEmployersOpen(false);
  }, [pathname]);

  // ── Click-outside closes dropdowns ───────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (candidatesRef.current && !candidatesRef.current.contains(e.target as Node)) {
        setCandidatesOpen(false);
      }
      if (employersRef.current && !employersRef.current.contains(e.target as Node)) {
        setEmployersOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────────
  async function loadUserRole(userId: string) {
    const [{ data: cand }, { data: emp }] = await Promise.all([
      supabase.from('candidates').select('full_name').eq('user_id', userId).single(),
      supabase.from('employers').select('company_name').eq('user_id', userId).single(),
    ]);
    if (cand) {
      setUserRole('candidate');
      setDisplayName((cand as { full_name?: string }).full_name ?? '');
    } else if (emp) {
      setUserRole('employer');
      setDisplayName((emp as { company_name?: string }).company_name ?? '');
    } else {
      setUserRole(null);
      setDisplayName('');
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user.id) {
        loadUserRole(s.user.id).finally(() => setAuthLoaded(true));
      } else {
        setAuthLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user.id) {
        loadUserRole(s.user.id);
      } else {
        setUserRole(null);
        setDisplayName('');
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setCandidatesOpen(false);
    setEmployersOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  }

  const isLoggedIn = !!session;
  const firstName  = displayName.split(' ')[0] || displayName;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || 'U';

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>

        {/* ── Logo ── */}
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

        {/* ── Desktop nav links ── */}
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

        {/* ── Desktop right actions: 3 items ── */}
        <div className={styles.navActions}>

          {/* 1. Candidates dropdown (hidden when employer is logged in) */}
          {authLoaded && userRole !== 'employer' && (
            <div className={styles.dropWrap} ref={candidatesRef}>
              {isLoggedIn && userRole === 'candidate' ? (
                /* Logged-in candidate: avatar + first name */
                <button
                  type="button"
                  className={styles.avatarDropBtn}
                  onClick={() => setCandidatesOpen(v => !v)}
                  aria-expanded={candidatesOpen}
                >
                  <span className={styles.avatarCircle}>{initials}</span>
                  <span className={styles.avatarName}>Hi, {firstName}</span>
                  <i className={`fa-solid fa-chevron-down ${styles.dropCaret} ${candidatesOpen ? styles.dropCaretOpen : ''}`} aria-hidden="true" />
                </button>
              ) : (
                /* Logged out: "Candidates" button */
                <button
                  type="button"
                  className={styles.candidatesBtn}
                  onClick={() => setCandidatesOpen(v => !v)}
                  aria-expanded={candidatesOpen}
                >
                  Candidates
                  <i className={`fa-solid fa-chevron-down ${styles.dropCaret} ${candidatesOpen ? styles.dropCaretOpen : ''}`} aria-hidden="true" />
                </button>
              )}

              <div className={`${styles.dropdownPanel} ${candidatesOpen ? styles.dropdownPanelOpen : ''}`}>
                {isLoggedIn && userRole === 'candidate' ? (
                  /* Candidate logged-in menu */
                  <>
                    <Link href="/candidate/dashboard" className={styles.dropdownItem} onClick={() => setCandidatesOpen(false)}>
                      <i className="fa-solid fa-gauge" aria-hidden="true" /> My Dashboard
                    </Link>
                    <Link href="/candidate/dashboard?tab=applications" className={styles.dropdownItem} onClick={() => setCandidatesOpen(false)}>
                      <i className="fa-solid fa-file-lines" aria-hidden="true" /> My Applications
                    </Link>
                    <Link href="/candidate/dashboard?tab=profile" className={styles.dropdownItem} onClick={() => setCandidatesOpen(false)}>
                      <i className="fa-solid fa-user-pen" aria-hidden="true" /> My Profile
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button type="button" className={styles.dropdownSignOut} onClick={signOut}>
                      <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign Out
                    </button>
                  </>
                ) : (
                  /* Logged-out candidates menu */
                  <>
                    <Link href="/candidate/register?mode=login" className={`${styles.dropdownItem} ${styles.dropdownItemWithSub}`} onClick={() => setCandidatesOpen(false)}>
                      <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />
                      <span>
                        <span className={styles.dropdownItemLabel}>Sign In</span>
                        <span className={styles.dropdownItemSub}>Access your dashboard</span>
                      </span>
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <Link href="/candidate/register" className={`${styles.dropdownItem} ${styles.dropdownItemWithSub}`} onClick={() => setCandidatesOpen(false)}>
                      <i className="fa-solid fa-user-plus" aria-hidden="true" />
                      <span>
                        <span className={styles.dropdownItemLabel}>Create Account</span>
                        <span className={styles.dropdownItemSub}>New to Promex? Join free</span>
                      </span>
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <div className={styles.dropdownTrustNote}>
                      🛡️ Zero placement fees · DMW accredited
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 2. For Employers dropdown (always visible) */}
          <div className={styles.dropWrap} ref={employersRef}>
            {isLoggedIn && userRole === 'employer' ? (
              /* Employer logged-in: avatar + company name */
              <button
                type="button"
                className={styles.avatarDropBtn}
                onClick={() => setEmployersOpen(v => !v)}
                aria-expanded={employersOpen}
              >
                <span className={styles.avatarCircle}>{initials}</span>
                <span className={styles.avatarName}>Hi, {firstName}</span>
                <i className={`fa-solid fa-chevron-down ${styles.dropCaret} ${employersOpen ? styles.dropCaretOpen : ''}`} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className={styles.employersBtn}
                onClick={() => setEmployersOpen(v => !v)}
                aria-expanded={employersOpen}
              >
                For Employers
                <i className={`fa-solid fa-chevron-down ${styles.dropCaret} ${employersOpen ? styles.dropCaretOpen : ''}`} aria-hidden="true" />
              </button>
            )}

            <div className={`${styles.dropdownPanel} ${employersOpen ? styles.dropdownPanelOpen : ''}`}>
              {isLoggedIn && userRole === 'employer' ? (
                /* Employer logged-in menu */
                <>
                  <Link href="/employer/dashboard" className={styles.dropdownItem} onClick={() => setEmployersOpen(false)}>
                    <i className="fa-solid fa-gauge" aria-hidden="true" /> Dashboard
                  </Link>
                  <Link href="/employer/post-job" className={styles.dropdownItem} onClick={() => setEmployersOpen(false)}>
                    <i className="fa-solid fa-plus-circle" aria-hidden="true" /> Post a Job
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button type="button" className={styles.dropdownSignOut} onClick={signOut}>
                    <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign Out
                  </button>
                </>
              ) : (
                /* Public employers menu */
                <>
                  <Link href="/employer/register" className={`${styles.dropdownItem} ${styles.dropdownItemWithSub}`} onClick={() => setEmployersOpen(false)}>
                    <i className="fa-solid fa-building" aria-hidden="true" />
                    <span>
                      <span className={styles.dropdownItemLabel}>Post Jobs as a Partner</span>
                      <span className={styles.dropdownItemSub}>Register your company</span>
                    </span>
                  </Link>
                  <Link href="/employer-inquiry" className={`${styles.dropdownItem} ${styles.dropdownItemWithSub}`} onClick={() => setEmployersOpen(false)}>
                    <i className="fa-solid fa-handshake" aria-hidden="true" />
                    <span>
                      <span className={styles.dropdownItemLabel}>Submit Hiring Inquiry</span>
                      <span className={styles.dropdownItemSub}>New client enquiry</span>
                    </span>
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <Link href="/employer/register?mode=login" className={styles.dropdownItem} onClick={() => setEmployersOpen(false)}>
                    <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Partner Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 3. View Overseas Jobs — always visible */}
          <Button label="View Overseas Jobs" href="/jobs" variant="accent" size="md" />

        </div>

        {/* ── Hamburger ── */}
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

      {/* ── Mobile menu ── */}
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
          {isLoggedIn ? (
            <>
              {/* User info row */}
              <div className={styles.mobileUserRow}>
                <div className={styles.mobileAvatar}>{initials}</div>
                <span className={styles.mobileUserName}>{displayName}</span>
              </div>

              {/* Candidate links */}
              {userRole === 'candidate' && (
                <>
                  <Link href="/candidate/dashboard" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-gauge" aria-hidden="true" /> My Dashboard
                  </Link>
                  <Link href="/candidate/dashboard?tab=applications" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-file-lines" aria-hidden="true" /> My Applications
                  </Link>
                  <Link href="/jobs" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-briefcase" aria-hidden="true" /> Browse Jobs
                  </Link>
                </>
              )}

              {/* Employer links */}
              {userRole === 'employer' && (
                <>
                  <Link href="/employer/dashboard" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-gauge" aria-hidden="true" /> Dashboard
                  </Link>
                  <Link href="/employer/post-job" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-plus-circle" aria-hidden="true" /> Post a Job
                  </Link>
                  <Link href="/employer-inquiry" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-handshake" aria-hidden="true" /> Request Talent
                  </Link>
                </>
              )}

              <button type="button" className={styles.mobileSignOutBtn} onClick={signOut}>
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Candidates section */}
              <div className={styles.mobileSectionBox}>
                <p className={styles.mobileSectionLabel}>Candidates</p>
                <Link href="/candidate/register?mode=login" className={styles.mobileOutlineBtn} onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/candidate/register" className={styles.mobileSolidBtn} onClick={() => setMobileMenuOpen(false)}>
                  Create Free Account
                </Link>
              </div>

              {/* For Employers section */}
              <div className={styles.mobileSectionBox}>
                <p className={styles.mobileSectionLabel}>For Employers</p>
                <Link href="/employer/register" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-building" aria-hidden="true" /> Post Jobs as a Partner
                </Link>
                <Link href="/employer-inquiry" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-handshake" aria-hidden="true" /> Submit Hiring Inquiry
                </Link>
                <Link href="/employer/register?mode=login" className={styles.mobileDashLink} onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Partner Login
                </Link>
              </div>

              {/* View Jobs CTA */}
              <Button label="View Overseas Jobs" href="/jobs" variant="accent" fullWidth onClick={() => setMobileMenuOpen(false)} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
