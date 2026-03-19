'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Mode = 'register' | 'login';

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
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
            role: 'candidate',
            phone: form.phone,
            country: form.country,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }

        // Sign in immediately after registration
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
    <section className={styles.authSection}>
      <div className={`container ${styles.authContainer}`}>
        <div className={styles.authCard}>

          {/* Logo area */}
          <div className={styles.authTop}>
            <div className={styles.authIcon}>
              <i className="fa-solid fa-user-tie" aria-hidden="true" />
            </div>
            <h1 className={styles.authTitle}>
              {mode === 'register' ? 'Create Candidate Account' : 'Welcome Back'}
            </h1>
            <p className={styles.authSubtitle}>
              {mode === 'register'
                ? 'Apply for overseas jobs and track your applications'
                : 'Sign in to manage your applications'}
            </p>
          </div>

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

          {error && (
            <div className={styles.authError}>
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === 'register' && (
              <>
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
                <div className={styles.formRow}>
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
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      type="text"
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                      placeholder="Philippines"
                    />
                  </div>
                </div>
              </>
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

            <button type="submit" className={styles.authSubmitBtn} disabled={loading}>
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
    </section>
  );
}
