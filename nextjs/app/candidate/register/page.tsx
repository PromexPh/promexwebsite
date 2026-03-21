'use client';

// TODO: Enable Google and LinkedIn providers in Supabase Dashboard → Authentication → Providers
// Then add NEXT_PUBLIC_SITE_URL to .env.local and Vercel env vars

import { useState, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Mode = 'register' | 'login';

function CandidateRegisterInner() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleGoogleLogin() {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/candidate/dashboard` },
    });
    if (oauthError) setError(oauthError.message);
  }

  async function handleLinkedInLogin() {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: `${window.location.origin}/candidate/dashboard` },
    });
    if (oauthError) setError(oauthError.message);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        if (form.password !== form.confirm_password) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            full_name: form.full_name,
            role: 'candidate',
            phone: form.phone || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) { setError(signInError.message); setLoading(false); return; }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) { setError(signInError.message); setLoading(false); return; }
      }

      router.push('/candidate/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authHero}>
        <h1 className={styles.authHeroTitle}>
          {mode === 'register' ? 'Start Your Overseas Career' : 'Welcome Back'}
        </h1>
        <p className={styles.authHeroSubtitle}>
          {mode === 'register'
            ? 'Apply for overseas jobs and track your applications'
            : 'Sign in to manage your applications'}
        </p>
      </div>

      <div className={`container ${styles.authContainer}`}>
        <div className={styles.authCard}>

          {/* Toggle */}
          <div className={styles.authToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mode === 'register' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mode === 'login' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
          </div>

          {/* Social login */}
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
            <button type="button" className={styles.socialBtn} onClick={handleLinkedInLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
              </svg>
              Continue with LinkedIn
            </button>
          </div>

          <div className={styles.divider}><span>or continue with email</span></div>

          {error && (
            <div className={styles.authError}>
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label htmlFor="full_name">Full Name <span className={styles.req}>*</span></label>
                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="Juan dela Cruz"
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="juan@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password <span className={styles.req}>*</span></label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                required
                minLength={mode === 'register' ? 8 : 1}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="confirm_password">Confirm Password <span className={styles.req}>*</span></label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={(e) => update('confirm_password', e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={8}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </>
            )}

            {mode === 'register' && (
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={styles.consentCheck}
                />
                <span>
                  I have read and agree to the{' '}
                  <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                  {' '}I consent to Promex Inc. processing my personal data for overseas employment placement purposes in accordance with RA 10173.
                </span>
              </label>
            )}

            <button type="submit" className={styles.authSubmitBtn} disabled={loading || (mode === 'register' && !agreed)}>
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
            <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>
              {mode === 'register' ? 'Sign in' : 'Register'}
            </button>
          </p>

          <p className={styles.authNote}>
            Are you an employer?{' '}
            <a href="/employer/register">Post jobs here →</a>
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
