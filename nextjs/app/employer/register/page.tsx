'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Mode = 'register' | 'login';

export default function EmployerRegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
    company_size: '',
    industry: '',
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
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            full_name: form.full_name,
            role: 'employer',
            company_name: form.company_name,
            company_size: form.company_size,
            industry: form.industry,
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

      router.push('/employer/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
              {mode === 'register' ? 'Employer Registration' : 'Employer Sign In'}
            </h1>
            <p className={styles.authSubtitle}>
              {mode === 'register'
                ? 'Post jobs and find the best Filipino talent for overseas positions'
                : 'Sign in to manage your job postings and applicants'}
            </p>
          </div>

          <div className={styles.authToggle}>
            <button type="button" className={`${styles.toggleBtn} ${mode === 'register' ? styles.toggleBtnActive : ''}`} onClick={() => { setMode('register'); setError(''); }}>
              Register
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
                    <label htmlFor="full_name">Contact Person <span className={styles.req}>*</span></label>
                    <input id="full_name" type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Your full name" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="company_name">Company Name <span className={styles.req}>*</span></label>
                    <input id="company_name" type="text" value={form.company_name} onChange={(e) => update('company_name', e.target.value)} placeholder="Acme Corp" required />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="company_size">Company Size</label>
                    <select id="company_size" value={form.company_size} onChange={(e) => update('company_size', e.target.value)}>
                      <option value="">Select size</option>
                      <option>1–10 employees</option>
                      <option>11–50 employees</option>
                      <option>51–200 employees</option>
                      <option>201–500 employees</option>
                      <option>500+ employees</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="industry">Industry</label>
                    <select id="industry" value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                      <option value="">Select industry</option>
                      <option>Hospitality</option>
                      <option>Healthcare</option>
                      <option>Engineering</option>
                      <option>IT & Technology</option>
                      <option>Construction</option>
                      <option>Retail</option>
                      <option>Finance</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
              <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hr@company.com" required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password <span className={styles.req}>*</span></label>
              <input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} required minLength={mode === 'register' ? 8 : 1} />
            </div>

            <button type="submit" className={styles.authSubmitBtn} disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Please wait…</>
                : mode === 'register'
                  ? <><i className="fa-solid fa-building" aria-hidden="true" /> Create Employer Account</>
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
            Looking for work?{' '}
            <a href="/candidate/register">Apply as a candidate →</a>
          </p>
        </div>
      </div>
    </section>
  );
}
