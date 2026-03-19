'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Step = 1 | 2 | 3;

interface JobForm {
  title: string;
  company: string;
  country: string;
  industry: string;
  salary: string;
  job_type: string;
  experience: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
}

function PostJobInner() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<JobForm>({
    title: '', company: '', country: '', industry: '',
    salary: '', job_type: '', experience: '', description: '',
    requirements: '', responsibilities: '', benefits: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/employer/register'); return; }
      setToken(data.session.access_token);
      // Pre-fill company from profile
      supabase.from('profiles').select('company_name, role').eq('id', data.session.user.id).single().then(({ data: p }) => {
        if (p?.role !== 'employer') { router.push('/employer/register'); return; }
        if (p?.company_name) setForm((f) => ({ ...f, company: p.company_name! }));
        setAuthLoading(false);
      });
    });
  }, [router]);

  function update(field: keyof JobForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  }

  function parseLines(text: string): string[] {
    return text.split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title,
        company: form.company,
        country: form.country,
        industry: form.industry,
        salary: form.salary,
        job_type: form.job_type,
        experience: form.experience,
        description: form.description,
        requirements: [...parseLines(form.requirements), ...parseLines(form.responsibilities)],
        benefits: parseLines(form.benefits),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || 'Failed to post job'); return; }
    setSubmitted(true);
  }

  if (authLoading) {
    return (
      <div className={styles.loadingPage}>
        <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}><i className="fa-solid fa-check" aria-hidden="true" /></div>
          <h2>Job Posted Successfully!</h2>
          <p>Your job listing is now live. Candidates can start applying immediately.</p>
          <div className={styles.successActions}>
            <a href="/employer/dashboard" className={styles.successBtn}>Go to Dashboard</a>
            <button type="button" className={styles.successBtnOutline} onClick={() => { setSubmitted(false); setStep(1); setForm({ title: '', company: form.company, country: '', industry: '', salary: '', job_type: '', experience: '', description: '', requirements: '', responsibilities: '', benefits: '' }); }}>
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  const step1Valid = form.title && form.company && form.country && form.industry && form.salary && form.job_type && form.experience;
  const step2Valid = form.description.length >= 50;

  return (
    <section className={styles.postJobSection}>
      <div className="container">
        <div className={styles.postJobHeader}>
          <a href="/employer/dashboard" className={styles.backLink}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Dashboard
          </a>
          <h1 className={styles.postJobTitle}>Post a New Job</h1>
          <p className={styles.postJobSubtitle}>Fill in the details below to publish your job listing</p>
        </div>

        {/* Step Indicator */}
        <div className={styles.steps}>
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className={`${styles.stepItem} ${step >= s ? styles.stepItemActive : ''}`}>
              <div className={styles.stepNum}>{s}</div>
              <span className={styles.stepLabel}>
                {s === 1 ? 'Job Details' : s === 2 ? 'Description' : 'Preview & Post'}
              </span>
              {s < 3 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formCard}>

            {/* Step 1 */}
            {step === 1 && (
              <>
                <h2 className={styles.formCardTitle}><i className="fa-solid fa-briefcase" aria-hidden="true" /> Job Details</h2>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Job Title <span className={styles.req}>*</span></label>
                    <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Registered Nurse" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Company Name <span className={styles.req}>*</span></label>
                    <input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Your company" required />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Country <span className={styles.req}>*</span></label>
                    <select value={form.country} onChange={(e) => update('country', e.target.value)} required>
                      <option value="">Select country</option>
                      {['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'Canada', 'Australia', 'UK', 'Other'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Industry <span className={styles.req}>*</span></label>
                    <select value={form.industry} onChange={(e) => update('industry', e.target.value)} required>
                      <option value="">Select industry</option>
                      {['Hospitality', 'Healthcare', 'Engineering', 'IT & Technology', 'Construction', 'Retail', 'Finance', 'Manufacturing', 'Other'].map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Salary Range <span className={styles.req}>*</span></label>
                    <input value={form.salary} onChange={(e) => update('salary', e.target.value)} placeholder="e.g. $2,500 - $3,200" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Job Type <span className={styles.req}>*</span></label>
                    <select value={form.job_type} onChange={(e) => update('job_type', e.target.value)} required>
                      <option value="">Select type</option>
                      <option>Full-time</option>
                      <option>Contract</option>
                      <option>Part-time</option>
                      <option>Seasonal</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Experience Required <span className={styles.req}>*</span></label>
                  <select value={form.experience} onChange={(e) => update('experience', e.target.value)} required>
                    <option value="">Select experience</option>
                    <option>No experience required</option>
                    <option>1+ years</option>
                    <option>2+ years</option>
                    <option>3+ years</option>
                    <option>5+ years</option>
                    <option>10+ years</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <h2 className={styles.formCardTitle}><i className="fa-solid fa-file-lines" aria-hidden="true" /> Job Description</h2>
                <div className={styles.formGroup}>
                  <label>Job Description <span className={styles.req}>*</span></label>
                  <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the role, the team, and what a successful candidate looks like..." required minLength={50} />
                  <small>{form.description.length} characters (minimum 50)</small>
                </div>
                <div className={styles.formGroup}>
                  <label>Requirements</label>
                  <textarea rows={5} value={form.requirements} onChange={(e) => update('requirements', e.target.value)} placeholder={"- Valid nursing license\n- 2+ years clinical experience\n- PROMETRIC certification"} />
                  <small>One requirement per line. Dashes are optional.</small>
                </div>
                <div className={styles.formGroup}>
                  <label>Key Responsibilities</label>
                  <textarea rows={4} value={form.responsibilities} onChange={(e) => update('responsibilities', e.target.value)} placeholder={"- Provide patient care\n- Document medical records"} />
                </div>
                <div className={styles.formGroup}>
                  <label>Benefits & Perks</label>
                  <textarea rows={4} value={form.benefits} onChange={(e) => update('benefits', e.target.value)} placeholder={"- Tax-free income\n- Free accommodation\n- Annual flight tickets"} />
                </div>
              </>
            )}

            {/* Step 3 — Preview */}
            {step === 3 && (
              <>
                <h2 className={styles.formCardTitle}><i className="fa-solid fa-eye" aria-hidden="true" /> Preview & Confirm</h2>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>
                    <div>
                      <h3 className={styles.previewTitle}>{form.title}</h3>
                      <div className={styles.previewCompany}><i className="fa-solid fa-building" /> {form.company}</div>
                    </div>
                    <div className={styles.previewSalary}>{form.salary}<span>/mo</span></div>
                  </div>
                  <div className={styles.previewMeta}>
                    <span><i className="fa-solid fa-location-dot" /> {form.country}</span>
                    <span><i className="fa-solid fa-briefcase" /> {form.industry}</span>
                    <span><i className="fa-solid fa-clock" /> {form.job_type}</span>
                    <span><i className="fa-solid fa-user-graduate" /> {form.experience}</span>
                  </div>
                  <p className={styles.previewDescription}>{form.description}</p>
                  {form.requirements && (
                    <div className={styles.previewSection}>
                      <strong>Requirements</strong>
                      <ul>{parseLines(form.requirements).map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  )}
                  {form.benefits && (
                    <div className={styles.previewSection}>
                      <strong>Benefits</strong>
                      <ul>{parseLines(form.benefits).map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                  )}
                </div>

                {error && <p className={styles.formError}><i className="fa-solid fa-circle-exclamation" /> {error}</p>}
              </>
            )}
          </div>

          {/* Navigation */}
          <div className={styles.formNav}>
            {step > 1 && (
              <button type="button" className={styles.navBackBtn} onClick={() => setStep((s) => (s - 1) as Step)}>
                <i className="fa-solid fa-chevron-left" /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className={styles.navNextBtn}
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
              >
                Next <i className="fa-solid fa-chevron-right" />
              </button>
            ) : (
              <button type="submit" className={styles.navSubmitBtn} disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Publishing…</>
                  : <><i className="fa-solid fa-rocket" /> Publish Job</>
                }
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className={styles.loadingPage}><i className="fa-solid fa-spinner fa-spin" /></div>}>
      <PostJobInner />
    </Suspense>
  );
}
