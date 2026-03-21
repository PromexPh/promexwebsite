'use client';

// TODO: Enable Google provider in Supabase Dashboard → Authentication → Providers
// Then add NEXT_PUBLIC_SITE_URL to .env.local and Vercel env vars

import { useState, useEffect, FormEvent, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const INDUSTRIES = ['Hospitality', 'Healthcare', 'Engineering', 'IT & Technology', 'Construction', 'Retail', 'Finance', 'Manufacturing', 'Transportation', 'Other'];
const COUNTRIES  = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'Taiwan', 'Malaysia', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'United States', 'Other'];

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

function validateCompanyName(name: string): string {
  const t = name.trim();
  if (t.length < 2) return 'Please enter your company name';
  if (t.length > 150) return 'Company name must be less than 150 characters';
  return '';
}

function filterPhone(v: string): string { return v.replace(/[^\d+\s()\-]/g, ''); }

function handlePhoneKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key.length === 1 && !/[\d+\s()\-]/.test(e.key)) e.preventDefault();
}

// ── Component ─────────────────────────────────────────────────────────────

function EmployerRegisterInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const formRef      = useRef<HTMLFormElement>(null);

  const [mode, setMode]             = useState<Mode>(searchParams.get('mode') === 'login' ? 'login' : 'register');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [registered, setRegistered] = useState(false);
  const [regEmail, setRegEmail]     = useState('');
  const [agreed,  setAgreed]        = useState(false);
  const [showPw,  setShowPw]        = useState(false);
  const [showCPw, setShowCPw]       = useState(false);
  const [touched, setTouched]       = useState<Record<string, boolean>>({});
  const [isOAuth, setIsOAuth]       = useState(false);
  const [oauthProvider, setOauthProvider] = useState<string>('');

  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    password: '',
    confirm_password: '',
    industry: '',
    country: '',
    phone: '',
  });

  // Pre-fill form when coming from OAuth (?oauth=true)
  useEffect(() => {
    if (searchParams.get('oauth') !== 'true') return;
    setIsOAuth(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const meta = session.user.user_metadata ?? {};
      const provider = session.user.app_metadata?.provider ?? 'oauth';
      setOauthProvider(provider === 'google' ? 'Google' : provider === 'linkedin_oidc' ? 'LinkedIn' : 'OAuth');
      setForm((f) => ({
        ...f,
        contact_person: (meta.full_name as string | undefined) ?? f.contact_person,
        email: session.user.email ?? f.email,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); setError(''); }
  function touch(field: string)                  { setTouched((t) => ({ ...t, [field]: true })); }
  function touchAll() {
    const base: Record<string, boolean> = { company_name: true, contact_person: true, email: true, industry: true, country: true, phone: true };
    if (!isOAuth) { base.password = true; base.confirm_password = true; }
    setTouched(base);
  }

  // Computed errors (shown only after field is touched)
  const companyError  = touched.company_name    ? validateCompanyName(form.company_name)  : '';
  const contactError  = touched.contact_person  ? validateName(form.contact_person)        : '';
  const emailError    = touched.email           ? validateEmail(form.email)                : '';
  const pwErrors      = touched.password && mode === 'register'         ? validatePasswordRules(form.password)                                        : [];
  const confirmError  = touched.confirm_password && mode === 'register' ? (form.confirm_password !== form.password ? 'Passwords do not match' : '')   : '';
  const phoneError    = touched.phone    && mode === 'register' && form.phone.trim() ? validatePhone(form.phone) : '';
  const industryError = touched.industry && mode === 'register'         ? (!form.industry ? 'Please select an industry' : '')                         : '';
  const countryError  = touched.country  && mode === 'register'         ? (!form.country  ? 'Please select a country'   : '')                         : '';
  const strength      = getStrength(form.password);

  const regValid =
    !validateCompanyName(form.company_name) &&
    !validateName(form.contact_person) &&
    !validateEmail(form.email) &&
    (isOAuth || (validatePasswordRules(form.password).length === 0 && form.confirm_password === form.password)) &&
    (!form.phone.trim() || !validatePhone(form.phone)) &&
    !!form.industry &&
    !!form.country &&
    agreed;

  const loginValid = !!form.email && !!form.password;

  function focusFirst() {
    const el = formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement | null;
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.focus(), 100); }
  }

  async function handleGoogleLogin() {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?role=employer` },
    });
    if (oauthError) setError(oauthError.message);
  }

  async function handleLinkedInSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=employer`,
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
        if (isOAuth) {
          // OAuth user: already authenticated — just create the employers row
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) { setError('Session expired. Please sign in again.'); setLoading(false); return; }
          const { error: dbError } = await supabase.from('employers').upsert(
            {
              user_id:        session.user.id,
              company_name:   form.company_name,
              contact_person: form.contact_person,
              email:          form.email,
              industry:       form.industry,
              country:        form.country,
              phone:          form.phone || null,
            },
            { onConflict: 'user_id' }
          );
          if (dbError) { setError(dbError.message); setLoading(false); return; }
          // Fire-and-forget welcome email for new OAuth employer
          void fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ role: 'employer' }),
          });
          setRegEmail(form.email);
          setRegistered(true);
        } else {
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
            phone:          form.phone || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }

        await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        setRegEmail(form.email);
        setRegistered(true);
        }
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

  function switchMode(m: Mode) { setMode(m); setError(''); setTouched({}); setAgreed(false); }

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
            <button type="button" className={`${styles.toggleBtn} ${mode === 'register' ? styles.toggleBtnActive : ''}`} onClick={() => switchMode('register')}>
              Register Company
            </button>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'login' ? styles.toggleBtnActive : ''}`} onClick={() => switchMode('login')}>
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
            <button type="button" className={styles.socialBtnLinkedIn} onClick={handleLinkedInSignIn}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="#ffffff">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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

          <form ref={formRef} onSubmit={handleSubmit} className={styles.authForm} noValidate>
            {mode === 'register' && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="company_name">Company Name <span className={styles.req}>*</span></label>
                    <input
                      id="company_name" value={form.company_name}
                      onChange={(e) => update('company_name', e.target.value)}
                      onBlur={(e) => { touch('company_name'); update('company_name', e.target.value.trim()); }}
                      placeholder="Acme Corp International" required
                      aria-invalid={companyError ? true : undefined}
                      aria-describedby={companyError ? 'err-company' : undefined}
                    />
                    {companyError && <p id="err-company" className={styles.fieldError}>{companyError}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="contact_person">Contact Person <span className={styles.req}>*</span></label>
                    <input
                      id="contact_person" value={form.contact_person}
                      onChange={(e) => update('contact_person', e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))}
                      onBlur={(e) => { touch('contact_person'); update('contact_person', e.target.value.trim()); }}
                      placeholder="John Smith" required
                      aria-invalid={contactError ? true : undefined}
                      aria-describedby={contactError ? 'err-contact' : undefined}
                    />
                    {contactError && <p id="err-contact" className={styles.fieldError}>{contactError}</p>}
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="industry">Industry <span className={styles.req}>*</span></label>
                    <select
                      id="industry" value={form.industry}
                      onChange={(e) => update('industry', e.target.value)}
                      onBlur={() => touch('industry')}
                      required
                      aria-invalid={industryError ? true : undefined}
                      aria-describedby={industryError ? 'err-industry' : undefined}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                    {industryError && <p id="err-industry" className={styles.fieldError}>{industryError}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Country <span className={styles.req}>*</span></label>
                    <select
                      id="country" value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                      onBlur={() => touch('country')}
                      required
                      aria-invalid={countryError ? true : undefined}
                      aria-describedby={countryError ? 'err-country' : undefined}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    {countryError && <p id="err-country" className={styles.fieldError}>{countryError}</p>}
                  </div>
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
              <div className={isOAuth ? styles.inputWrap : undefined}>
                <input
                  id="email" type="email" value={form.email}
                  onChange={(e) => { if (!isOAuth) update('email', e.target.value); }}
                  onBlur={() => touch('email')}
                  placeholder="hr@company.com" required
                  readOnly={isOAuth}
                  style={isOAuth ? { paddingRight: '2.5rem', background: '#f9fafb', cursor: 'default' } : undefined}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? 'err-email' : undefined}
                />
                {isOAuth && (
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', display: 'flex', alignItems: 'center' }} aria-hidden="true">
                    <Lock size={15} />
                  </span>
                )}
              </div>
              {isOAuth
                ? <p className={styles.fieldHint}>Verified via {oauthProvider} — cannot be changed here</p>
                : emailError && <p id="err-email" className={styles.fieldError}>{emailError}</p>
              }
            </div>

            {!isOAuth && <div className={styles.formGroup}>
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
            </div>}

            {mode === 'register' && !isOAuth && (
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
                  placeholder="+971 50 123 4567"
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby={phoneError ? 'err-phone' : undefined}
                />
                {phoneError && <p id="err-phone" className={styles.fieldError}>{phoneError}</p>}
                {!phoneError && <p className={styles.fieldHint}>Optional — you can add this later in your profile</p>}
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

            <button type="submit" className={styles.authSubmitBtn} disabled={loading || (mode === 'register' ? !regValid : !loginValid)}>
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
            <button type="button" onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}>
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
