'use client';

// TODO: Enable Google and LinkedIn providers in Supabase Dashboard → Authentication → Providers
// Then add NEXT_PUBLIC_SITE_URL to .env.local and Vercel env vars

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const INDUSTRIES = ['Hospitality', 'Healthcare', 'Engineering', 'IT & Technology', 'Construction', 'Retail', 'Finance', 'Manufacturing', 'Transportation', 'Other'];
const COUNTRIES  = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'Taiwan', 'Malaysia', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'United States', 'Other'];

type Mode = 'register' | 'login';

function EmployerRegisterInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode]             = useState<Mode>(searchParams.get('mode') === 'login' ? 'login' : 'register');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [registered, setRegistered] = useState(false);
  const [regEmail, setRegEmail]     = useState('');

  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    password: '',
    confirm_password: '',
    industry: '',
    country: '',
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleGoogleLogin() {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/employer/dashboard` },
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
            email:          form.email,
            password:       form.password,
            full_name:      form.contact_person,
            role:           'employer',
            company_name:   form.company_name,
            contact_person: form.contact_person,
            country:        form.country,
            industry:       form.industry,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }

        await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        setRegEmail(form.email);
        setRegistered(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email, password: form.password,
        });
        if (signInError) { setError(signInError.message); setLoading(false); return; }
        router.push('/employer/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authHero}>
          <h1 className={styles.authHeroTitle}>Registration Received!</h1>
          <p className={styles.authHeroSubtitle}>Your account is under review</p>
        </div>
        <div className={`container ${styles.authContainer}`}>
          <div className={`${styles.authCard} ${styles.successCard}`}>
            <div className={styles.successIcon}><i className="fa-solid fa-circle-check" aria-hidden="true" /></div>
            <h2 className={styles.authTitle}>Application Received!</h2>
            <p className={styles.successMsg}>
              Our team will review your account within <strong>1–2 business days</strong> and contact you at <strong>{regEmail}</strong>.
              In the meantime, you can set up your company profile.
            </p>
            <div className={styles.successNext}>
              <p className={styles.successNextTitle}>What happens next?</p>
              <div className={styles.successSteps}>
                <div className={styles.successStep}><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><span>Promex reviews your account</span></div>
                <div className={styles.successStep}><i className="fa-solid fa-envelope" aria-hidden="true" /><span>You receive an approval email</span></div>
                <div className={styles.successStep}><i className="fa-solid fa-rocket" aria-hidden="true" /><span>Your jobs go live immediately</span></div>
              </div>
            </div>
            <a href="/employer/dashboard" className={styles.authSubmitBtn} style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>
              <i className="fa-solid fa-gauge" aria-hidden="true" /> Set Up Your Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authHero}>
        <h1 className={styles.authHeroTitle}>
          {mode === 'register' ? 'Partner Registration' : 'Partner Sign In'}
        </h1>
        <p className={styles.authHeroSubtitle}>
          {mode === 'register'
            ? 'Register your company to hire skilled Filipino professionals'
            : 'Sign in to manage your job postings and applicants'}
        </p>
      </div>

      <div className={`container ${styles.authContainer}`}>
        <div className={styles.authCard}>

          {/* Toggle */}
          <div className={styles.authToggle}>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'register' ? styles.toggleBtnActive : ''}`} onClick={() => { setMode('register'); setError(''); }}>
              Register Company
            </button>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'login' ? styles.toggleBtnActive : ''}`} onClick={() => { setMode('login'); setError(''); }}>
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
          </div>

          <div className={styles.divider}><span>or continue with email</span></div>

          {error && (
            <div className={styles.authError}>
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === 'register' && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Company Name <span className={styles.req}>*</span></label>
                    <input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} placeholder="Acme Corp International" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Contact Person <span className={styles.req}>*</span></label>
                    <input value={form.contact_person} onChange={(e) => update('contact_person', e.target.value)} placeholder="John Smith" required />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Industry <span className={styles.req}>*</span></label>
                    <select value={form.industry} onChange={(e) => update('industry', e.target.value)} required>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Country <span className={styles.req}>*</span></label>
                    <select value={form.country} onChange={(e) => update('country', e.target.value)} required>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label>Email Address <span className={styles.req}>*</span></label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hr@company.com" required />
            </div>

            <div className={styles.formGroup}>
              <label>Password <span className={styles.req}>*</span></label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} required minLength={mode === 'register' ? 8 : 1} />
            </div>

            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label>Confirm Password <span className={styles.req}>*</span></label>
                <input type="password" value={form.confirm_password} onChange={(e) => update('confirm_password', e.target.value)} placeholder="Repeat password" required minLength={8} />
              </div>
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
                  {' '}I consent to Promex Inc. processing my company and contact data for recruitment purposes in accordance with RA 10173.
                </span>
              </label>
            )}

            <button type="submit" className={styles.authSubmitBtn} disabled={loading || (mode === 'register' && !agreed)}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Please wait…</>
                : mode === 'register'
                  ? <><i className="fa-solid fa-building" aria-hidden="true" /> Submit Registration</>
                  : <><i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Sign In</>
              }
            </button>
          </form>

          <p className={styles.authSwitch}>
            {mode === 'register' ? 'Already registered?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>
              {mode === 'register' ? 'Sign in' : 'Register'}
            </button>
          </p>

          <p className={styles.authNote}>
            New client?{' '}<a href="/employer-inquiry">Submit a hiring inquiry →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EmployerRegisterPage() {
  return (
    <Suspense fallback={<div className={styles.authPage} />}>
      <EmployerRegisterInner />
    </Suspense>
  );
}
