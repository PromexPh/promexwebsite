'use client';

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
  const [mode, setMode]           = useState<Mode>(searchParams.get('mode') === 'login' ? 'login' : 'register');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [registered, setRegistered] = useState(false);
  const [regEmail, setRegEmail]   = useState('');

  const [form, setForm] = useState({
    company_name: '', industry: '', country: '', contact_person: '',
    contact_job_title: '', email: '', phone: '', website: '', description: '',
    password: '', confirm_password: '',
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
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
            phone:          form.phone,
            country:        form.country,
            industry:       form.industry,
            website:        form.website,
            description:    form.description,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }

        // Auto sign-in then show success screen
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

  // ── Success screen ────────────────────────────────────────────────────────
  if (registered) {
    return (
      <section className={styles.authSection}>
        <div className={`container ${styles.authContainer}`}>
          <div className={`${styles.authCard} ${styles.successCard}`}>
            <div className={styles.successIcon}><i className="fa-solid fa-circle-check" aria-hidden="true" /></div>
            <h1 className={styles.authTitle}>Application Received!</h1>
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
      </section>
    );
  }

  return (
    <section className={styles.authSection}>
      <div className={`container ${styles.authContainer}`}>
        <div className={styles.authCard}>
          <div className={styles.authTop}>
            <div className={styles.authIcon}>
              <i className="fa-solid fa-building" aria-hidden="true" />
            </div>
            <h1 className={styles.authTitle}>
              {mode === 'register' ? 'Partner Registration' : 'Partner Sign In'}
            </h1>
            <p className={styles.authSubtitle}>
              {mode === 'register'
                ? 'Register your company to post jobs and hire skilled Filipino professionals'
                : 'Sign in to manage your job postings and applicants'}
            </p>
          </div>

          <div className={styles.authToggle}>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'register' ? styles.toggleBtnActive : ''}`} onClick={() => { setMode('register'); setError(''); }}>
              Register Company
            </button>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'login' ? styles.toggleBtnActive : ''}`} onClick={() => { setMode('login'); setError(''); }}>
              Sign In
            </button>
          </div>

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
                    <label>Industry <span className={styles.req}>*</span></label>
                    <select value={form.industry} onChange={(e) => update('industry', e.target.value)} required>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Country <span className={styles.req}>*</span></label>
                    <select value={form.country} onChange={(e) => update('country', e.target.value)} required>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Company Website</label>
                    <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://yourcompany.com" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Contact Person <span className={styles.req}>*</span></label>
                    <input value={form.contact_person} onChange={(e) => update('contact_person', e.target.value)} placeholder="John Smith" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Your Job Title <span className={styles.req}>*</span></label>
                    <input value={form.contact_job_title} onChange={(e) => update('contact_job_title', e.target.value)} placeholder="HR Manager" required />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Brief Company Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Tell us about your company, what you do, and the type of staff you typically hire…"
                  />
                </div>
              </>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email Address <span className={styles.req}>*</span></label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hr@company.com" required />
              </div>
              <div className={styles.formGroup}>
                <label>Phone {mode === 'register' && <span className={styles.req}>*</span>}</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+971 50 123 4567" required={mode === 'register'} />
              </div>
            </div>

            <div className={styles.formRow}>
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
            </div>

            <button type="submit" className={styles.authSubmitBtn} disabled={loading}>
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
    </section>
  );
}

export default function EmployerRegisterPage() {
  return (
    <Suspense fallback={<div className={styles.authSection} />}>
      <EmployerRegisterInner />
    </Suspense>
  );
}
