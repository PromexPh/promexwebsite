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
  salary_min: string;
  salary_max: string;
  job_type: string;
  experience_required: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  slots_available: string;
  is_urgent: boolean;
}

function PostJobInner() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<JobForm>({
    title: '', company: '', country: '', industry: '',
    salary_min: '', salary_max: '', job_type: '', experience_required: '', description: '',
    requirements: '', responsibilities: '', benefits: '',
    slots_available: '', is_urgent: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/employer/register'); return; }
      setToken(data.session.access_token);
      setUserEmail(data.session.user.email ?? '');
      supabase.from('employers').select('company_name, is_verified').eq('user_id', data.session.user.id).single().then(({ data: emp }) => {
        if (!emp) { router.push('/employer/register'); return; }
        const e = emp as { company_name?: string; is_verified?: boolean };
        if (e.company_name) setForm((f) => ({ ...f, company: e.company_name! }));
        setIsVerified(e.is_verified === true);
        setAuthLoading(false);
      });
    });
  }, [router]);

  function update(field: keyof JobForm, value: string | boolean) {
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
        job_type: form.job_type,
        salary_min: Number(form.salary_min),
        salary_max: Number(form.salary_max),
        salary_currency: 'PHP',
        experience_required: form.experience_required,
        description: form.description,
        requirements: [...parseLines(form.requirements), ...parseLines(form.responsibilities)],
        benefits: parseLines(form.benefits),
        slots_available: Number(form.slots_available) || 0,
        is_urgent: form.is_urgent,
        posted_at: new Date().toISOString(),
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

  if (isVerified === false) {
    return (
      <div className={styles.pendingContainer}>
        <div className={styles.pendingIcon}>⏳</div>
        <h1 className={styles.pendingTitle}>Account Pending Verification</h1>
        <p className={styles.pendingText}>
          Your employer account is currently being reviewed by the Promex team.
          This usually takes 1–2 business days.
        </p>
        {userEmail && (
          <p className={styles.pendingText}>
            Once approved, you&apos;ll receive a confirmation email at <strong>{userEmail}</strong> and
            can start posting jobs immediately.
          </p>
        )}
        <div className={styles.pendingSteps}>
          <div className={styles.pendingStep}>
            <span className={styles.stepDone}>✓</span>
            <span>Account registered</span>
          </div>
          <div className={styles.pendingStep}>
            <span className={styles.stepPending}>⏳</span>
            <span>Promex verification (1–2 business days)</span>
          </div>
          <div className={styles.pendingStep}>
            <span className={styles.stepLocked}>○</span>
            <span>Post jobs &amp; receive applications</span>
          </div>
        </div>
        <div className={styles.pendingActions}>
          <a href="/employer/dashboard" className={styles.pendingBtnPrimary}>
            Go to Dashboard
          </a>
          <a href="/employer-inquiry" className={styles.pendingBtnSecondary}>
            Submit a Hiring Inquiry instead
          </a>
        </div>
        <p className={styles.pendingNote}>
          Questions? Email us at{' '}
          <a href="mailto:inquiries@promexph.com">inquiries@promexph.com</a>
        </p>
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
            <button type="button" className={styles.successBtnOutline} onClick={() => { setSubmitted(false); setStep(1); setForm({ title: '', company: form.company, country: '', industry: '', salary_min: '', salary_max: '', job_type: '', experience_required: '', description: '', requirements: '', responsibilities: '', benefits: '', slots_available: '', is_urgent: false }); }}>
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  const step1Valid = form.title && form.company && form.country && form.industry && form.salary_min && form.salary_max && form.job_type && form.experience_required;
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
                <div className={styles.formGroup}>
                  <label>Salary Range (₱/mo) <span className={styles.req}>*</span></label>
                  <div className={styles.salaryWidget}>
                    <div className={styles.salaryInputRow}>
                      <div className={styles.salaryInputWrap}>
                        <span className={styles.salaryPrefix}>₱</span>
                        <input
                          className={styles.salaryInput}
                          type="number" min="0" step="1000"
                          value={form.salary_min}
                          onChange={(e) => update('salary_min', e.target.value)}
                          placeholder="25,000"
                          required
                        />
                      </div>
                      <span className={styles.salaryDash}>—</span>
                      <div className={styles.salaryInputWrap}>
                        <span className={styles.salaryPrefix}>₱</span>
                        <input
                          className={styles.salaryInput}
                          type="number" min="0" step="1000"
                          value={form.salary_max}
                          onChange={(e) => update('salary_max', e.target.value)}
                          placeholder="35,000"
                          required
                        />
                      </div>
                    </div>
                    {(form.salary_min || form.salary_max) && (
                      <div className={styles.salaryPreview}>
                        <span className={styles.salaryPreviewLabel}>Preview:</span>
                        <span className={styles.salaryPreviewValue}>
                          ₱{form.salary_min ? Number(form.salary_min).toLocaleString() : '—'} – ₱{form.salary_max ? Number(form.salary_max).toLocaleString() : '—'}/mo
                        </span>
                      </div>
                    )}
                    <div className={styles.salaryPresets}>
                      {([
                        { label: '₱15k–20k', min: '15000', max: '20000' },
                        { label: '₱20k–30k', min: '20000', max: '30000' },
                        { label: '₱30k–45k', min: '30000', max: '45000' },
                        { label: '₱45k–60k', min: '45000', max: '60000' },
                        { label: '₱60k–80k', min: '60000', max: '80000' },
                        { label: '₱80k–120k', min: '80000', max: '120000' },
                      ] as { label: string; min: string; max: string }[]).map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className={`${styles.salaryPresetBtn} ${form.salary_min === p.min && form.salary_max === p.max ? styles.salaryPresetBtnActive : ''}`}
                          onClick={() => { setForm((f) => ({ ...f, salary_min: p.min, salary_max: p.max })); setError(''); }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.formRow}>
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
                  <div className={styles.formGroup}>
                    <label>Experience Required <span className={styles.req}>*</span></label>
                    <select value={form.experience_required} onChange={(e) => update('experience_required', e.target.value)} required>
                      <option value="">Select experience</option>
                      <option>No experience required</option>
                      <option>1+ years</option>
                      <option>2+ years</option>
                      <option>3+ years</option>
                      <option>5+ years</option>
                      <option>10+ years</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Slots Available</label>
                    <input type="number" min="0" value={form.slots_available} onChange={(e) => update('slots_available', e.target.value)} placeholder="e.g. 5" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Urgent Hiring?</label>
                    <select value={form.is_urgent ? 'yes' : 'no'} onChange={(e) => update('is_urgent', e.target.value === 'yes')}>
                      <option value="no">No</option>
                      <option value="yes">Yes — Urgent</option>
                    </select>
                  </div>
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
                    <div className={styles.previewSalary}>
                      ₱{Number(form.salary_min).toLocaleString()} – ₱{Number(form.salary_max).toLocaleString()}<span>/mo</span>
                    </div>
                  </div>
                  <div className={styles.previewMeta}>
                    <span><i className="fa-solid fa-location-dot" /> {form.country}</span>
                    <span><i className="fa-solid fa-briefcase" /> {form.industry}</span>
                    <span><i className="fa-solid fa-clock" /> {form.job_type}</span>
                    <span><i className="fa-solid fa-user-graduate" /> {form.experience_required}</span>
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
