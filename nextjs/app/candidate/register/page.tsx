'use client';

// TODO: Enable Google provider in Supabase Dashboard → Authentication → Providers
// Then add NEXT_PUBLIC_SITE_URL to .env.local and Vercel env vars

import { useState, FormEvent, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Mode = 'register' | 'login';

// ── Validation helpers ─────────────────────────────────────────────────────

const EMAIL_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com',
  'yaho.com': 'yahoo.com',  'yahooo.com': 'yahoo.com',
  'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
};

function validateEmail(email: string): string {
  if (!email.trim()) return 'Please enter a valid email address';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Please enter a valid email address';
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && EMAIL_TYPOS[domain]) return `Did you mean @${EMAIL_TYPOS[domain]}?`;
  return '';
}

function validatePasswordRules(password: string): string[] {
  const errs: string[] = [];
  if (password.length < 8)            errs.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password))        errs.push('Must include at least one uppercase letter');
  if (!/[0-9]/.test(password))        errs.push('Must include at least one number');
  if (!/[!@#$%^&*-]/.test(password)) errs.push('Must include at least one special character (!@#$%^&*-)');
  return errs;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[!@#$%^&*-]/.test(pw))  s++;
  const map = [
    { label: 'Weak',   color: '#ef4444' },
    { label: 'Weak',   color: '#ef4444' },
    { label: 'Fair',   color: '#f97316' },
    { label: 'Good',   color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
  ];
  return { score: s, ...map[s] };
}

function validatePhone(phone: string): string {
  if (!phone.trim()) return 'Please enter a valid phone number';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Please enter a valid phone number';
  return '';
}

function validateName(name: string): string {
  const t = name.trim();
  if (t.length < 2) return 'Please enter your full name (letters only)';
  if (t.length > 100) return 'Name must be less than 100 characters';
  if (!/^[a-zA-Z\s\-']+$/.test(t)) return 'Please enter your full name (letters only)';
  return '';
}

function filterPhone(v: string): string { return v.replace(/[^\d+\s()\-]/g, ''); }

function handlePhoneKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key.length === 1 && !/[\d+\s()\-]/.test(e.key)) e.preventDefault();
}

// ── Component ─────────────────────────────────────────────────────────────

function CandidateRegisterInner() {
  const router  = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [mode,    setMode]    = useState<Mode>('register');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [agreed,  setAgreed]  = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', phone: '' });

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); setError(''); }
  function touch(field: string)                  { setTouched((t) => ({ ...t, [field]: true })); }
  function touchAll() {
    setTouched({ full_name: true, email: true, password: true, confirm_password: true, phone: true });
  }

  // Computed errors (shown only after field is touched)
  const nameError    = touched.full_name        ? validateName(form.full_name)                                                          : '';
  const emailError   = touched.email            ? validateEmail(form.email)                                                              : '';
  const pwErrors     = touched.password && mode === 'register'        ? validatePasswordRules(form.password)                            : [];
  const confirmError = touched.confirm_password && mode === 'register' ? (form.confirm_password !== form.password ? 'Passwords do not match' : '') : '';
  const phoneError   = touched.phone   && mode === 'register' && form.phone.trim() ? validatePhone(form.phone) : '';
  const strength     = getStrength(form.password);

  // Disable submit until all valid
  const regValid =
    !validateName(form.full_name) &&
    !validateEmail(form.email) &&
    validatePasswordRules(form.password).length === 0 &&
    form.confirm_password === form.password &&
    (!form.phone.trim() || !validatePhone(form.phone)) &&
    agreed;

  const loginValid = !!form.email && !!form.password;

  function focusFirst() {
    const el = formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement | null;
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.focus(), 100); }
  }

  async function handleGoogleLogin() {
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?role=candidate` },
    });
    if (e) setError(e.message);
  }

  async function handleLinkedInSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=candidate`,
        scopes: 'openid profile email',
      },
    });
    if (error) console.error('LinkedIn sign-in error:', error);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'register') { touchAll(); if (!regValid) { setTimeout(focusFirst, 50); return; } }
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name, role: 'candidate', phone: form.phone || undefined }) });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        const { error: se } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (se) { setError(se.message); return; }
      } else {
        const { error: se } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (se) { setError(se.message); return; }
        // Block employers from accessing the candidate portal
        const { data: { session: loginSession } } = await supabase.auth.getSession();
        const loginRole = loginSession?.user?.user_metadata?.role as string | undefined;
        if (loginRole === 'employer') {
          await supabase.auth.signOut();
          setError('This email is registered as an employer account. Please use the employer sign-in instead.');
          setLoading(false);
          return;
        }
      }
      router.push('/candidate/dashboard');
    } catch { setError('Something went wrong. Please try again.'); }
    finally   { setLoading(false); }
  }

  function switchMode(m: Mode) { setMode(m); setError(''); setTouched({}); setAgreed(false); }

  return (
    <div className={styles.authPage}>
      <div className={styles.authHero}>
        <h1 className={styles.authHeroTitle}>{mode === 'register' ? 'Start Your Overseas Career' : 'Welcome Back'}</h1>
        <p className={styles.authHeroSubtitle}>{mode === 'register' ? 'Apply for overseas jobs and track your applications' : 'Sign in to manage your applications'}</p>
      </div>

      <div className={`container ${styles.authContainer}`}>
        <div className={styles.authCard}>

          <div className={styles.authToggle}>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'register' ? styles.toggleBtnActive : ''}`} onClick={() => switchMode('register')}>Register</button>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'login'    ? styles.toggleBtnActive : ''}`} onClick={() => switchMode('login')}>Sign In</button>
          </div>

          <div className={styles.socialBtns}>
            <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className={styles.socialBtnLinkedIn} onClick={handleLinkedInSignIn}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="#ffffff">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>
          </div>

          <div className={styles.divider}><span>or continue with email</span></div>

          {error && <div className={styles.authError}><i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}</div>}

          <form ref={formRef} onSubmit={handleSubmit} className={styles.authForm} noValidate>

            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label htmlFor="full_name">Full Name <span className={styles.req}>*</span></label>
                <input
                  id="full_name" type="text" value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))}
                  onBlur={(e) => { touch('full_name'); update('full_name', e.target.value.trim()); }}
                  placeholder="Juan dela Cruz" maxLength={100} required
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? 'err-name' : undefined}
                />
                {nameError && <p id="err-name" className={styles.fieldError}>{nameError}</p>}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
              <input
                id="email" type="email" value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => touch('email')}
                placeholder="juan@email.com" required
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? 'err-email' : undefined}
              />
              {emailError && <p id="err-email" className={styles.fieldError}>{emailError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password <span className={styles.req}>*</span></label>
              <div className={styles.inputWrap}>
                <input
                  id="password" type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  onBlur={() => touch('password')}
                  placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                  required minLength={mode === 'register' ? 8 : 1}
                  aria-invalid={pwErrors.length > 0 ? true : undefined}
                  aria-describedby={pwErrors.length > 0 ? 'err-pw' : undefined}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && form.password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={styles.strengthSegment} style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }} />
                    ))}
                    <span className={styles.strengthLabel} style={{ color: strength.score > 0 ? strength.color : '#9ca3af' }}>{strength.label}</span>
                  </div>
                </div>
              )}
              {pwErrors.length > 0 && (
                <ul id="err-pw" className={styles.fieldErrors}>
                  {pwErrors.map((err) => <li key={err}>{err}</li>)}
                </ul>
              )}
            </div>

            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label htmlFor="confirm_password">Confirm Password <span className={styles.req}>*</span></label>
                <div className={styles.inputWrap}>
                  <input
                    id="confirm_password" type={showCPw ? 'text' : 'password'} value={form.confirm_password}
                    onChange={(e) => update('confirm_password', e.target.value)}
                    onBlur={() => touch('confirm_password')}
                    placeholder="Repeat password" required minLength={8}
                    aria-invalid={confirmError ? true : undefined}
                    aria-describedby={confirmError ? 'err-cpw' : undefined}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowCPw((v) => !v)} aria-label={showCPw ? 'Hide password' : 'Show password'}>
                    {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmError && <p id="err-cpw" className={styles.fieldError}>{confirmError}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone" type="tel" value={form.phone}
                  onChange={(e) => update('phone', filterPhone(e.target.value))}
                  onKeyDown={handlePhoneKey}
                  onBlur={() => touch('phone')}
                  placeholder="+63 912 345 6789"
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby={phoneError ? 'err-phone' : undefined}
                />
                {phoneError && <p id="err-phone" className={styles.fieldError}>{phoneError}</p>}
                {!phoneError && <p className={styles.fieldHint}>Optional — you can add this later in your profile</p>}
              </div>
            )}

            {mode === 'register' && (
              <label className={styles.consentLabel}>
                <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className={styles.consentCheck} />
                <span>
                  I have read and agree to the{' '}
                  <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                  {' '}I consent to Promex Inc. processing my personal data for overseas employment placement purposes in accordance with RA 10173.
                </span>
              </label>
            )}

            <button type="submit" className={styles.authSubmitBtn} disabled={loading || (mode === 'register' ? !regValid : !loginValid)}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Please wait…</>
                : mode === 'register'
                  ? <><i className="fa-solid fa-user-plus" aria-hidden="true" /> Create Account</>
                  : <><i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Sign In</>
              }
            </button>
          </form>

          <p className={styles.authSwitch}>
            {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}>
              {mode === 'register' ? 'Sign in' : 'Register'}
            </button>
          </p>

          <p className={styles.authNote}>
            Are you an employer?{' '}<a href="/employer/register">Post jobs here →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CandidateRegisterPage() {
  return (
    <Suspense fallback={<div className={styles.authPage} />}>
      <CandidateRegisterInner />
    </Suspense>
  );
}
