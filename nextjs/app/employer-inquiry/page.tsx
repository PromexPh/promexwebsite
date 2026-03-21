'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import styles from './page.module.css';

const industries = ['Hospitality','Healthcare','Retail','Engineering','Construction','IT & Technology','Food Service','Manufacturing','Transportation','Agriculture','Maritime','Security','Education','Other'];
const companySizes = ['1-10 employees','11-50 employees','51-200 employees','201-500 employees','500+ employees'];
const countries = ['Saudi Arabia','UAE','Qatar','Kuwait','Oman','Bahrain','Singapore','Hong Kong','Japan','South Korea','Taiwan','Malaysia','Canada','United Kingdom','Australia','New Zealand','United States','Other'];
const urgencyLevels = ['Immediate (within 1 month)','Short-term (1-3 months)','Medium-term (3-6 months)','Long-term planning (6+ months)'];
const employmentTypes = ['Full-time Permanent','Contract (Fixed-term)','Part-time','Seasonal','Project-based'];

const benefits = [
  { icon: 'fa-solid fa-certificate',   title: 'Licensed & Compliant',      description: 'DMW-licensed and fully compliant with Philippine labor laws and international recruitment standards.' },
  { icon: 'fa-solid fa-network-wired', title: 'Nationwide Network',         description: 'Access to a vast pool of skilled Filipino professionals across all regions and industries.' },
  { icon: 'fa-solid fa-rocket',        title: 'Fast Deployment',            description: 'Streamlined processes ensure qualified candidates are ready for deployment within your required timeline.' },
  { icon: 'fa-solid fa-user-check',    title: 'Pre-screened Candidates',    description: 'Every candidate undergoes rigorous screening, skills verification, and background checks.' },
  { icon: 'fa-solid fa-briefcase',     title: 'Industry Expertise',         description: '30 years of specialized recruitment across healthcare, construction, hospitality, IT, and more.' },
];

const initialForm = {
  companyName: '', industry: '', companySize: '', contactPerson: '', position: '',
  email: '', phone: '', country: '', website: '', positionsNeeded: '', numberOfWorkers: '',
  targetIndustry: '', requiredSkills: '', urgency: '', employmentType: '', salaryRange: '',
  contractDuration: '', accommodationProvided: '', additionalRequirements: '', message: '',
};

interface SuccessData { companyName: string; email: string; ref: string; }

export default function EmployerInquiryPage() {
  const [form, setForm] = useState(initialForm);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [submitError, setSubmitError] = useState('');

  function set(field: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccessData({
          companyName: form.companyName,
          email: form.email,
          ref: `INQ-${String(Date.now()).slice(-6)}`,
        });
        setForm(initialForm);
      } else {
        const d = await res.json();
        setSubmitError(d.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successData) {
    return (
      <>
        <PageHero
          badge="For Employers"
          heading="Request"
          accentText="Top Talent Today"
          subText="Connect with skilled Filipino professionals ready to join your team."
          bgImage="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&auto=format&fit=crop"
          waveFill="var(--color-bg)"
        />
        <section className={styles.pageSection}>
          <div className="container">
            <div className={styles.successScreen}>
              <div className={styles.successCheck}>
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
              </div>
              <h2 className={styles.successTitle}>Inquiry Received!</h2>
              <p className={styles.successMsg}>
                Thank you, <strong>{successData.companyName}</strong>. Our team will contact you at{' '}
                <strong>{successData.email}</strong> within 24 hours.
              </p>
              <div className={styles.successRef}>
                <i className="fa-solid fa-hashtag" aria-hidden="true" />
                Reference: <strong>{successData.ref}</strong>
              </div>
              <a href="/jobs" className={styles.successBtn}>
                <i className="fa-solid fa-briefcase" aria-hidden="true" /> Browse our available talent
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        badge="For Employers"
        heading="Request"
        accentText="Top Talent Today"
        subText="Connect with skilled Filipino professionals ready to join your team. Fill out the form below and our corporate recruitment team will contact you within 24 hours."
        bgImage="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      <section className={styles.pageSection}>
        <div className="container">

          {submitError && (
            <Reveal animation="fade-up">
              <div className={styles.alertError}>
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
                <p>{submitError}</p>
              </div>
            </Reveal>
          )}

          <Reveal animation="fade-up">
            <div className={styles.formWrapper}>
              <form onSubmit={handleSubmit}>

                {/* Company Information */}
                <div className={styles.formCard}>
                  <h2 className={styles.formSectionTitle}>
                    <i className="fa-solid fa-building" aria-hidden="true" /> Company Information
                  </h2>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="companyName">Company Name <span className={styles.req}>*</span></label>
                      <input id="companyName" type="text" required placeholder="Your Company Ltd." value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="industry">Industry <span className={styles.req}>*</span></label>
                      <select id="industry" required value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                        <option value="">Select Industry</option>
                        {industries.map((i) => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="companySize">Company Size <span className={styles.req}>*</span></label>
                      <select id="companySize" required value={form.companySize} onChange={(e) => set('companySize', e.target.value)}>
                        <option value="">Select Company Size</option>
                        {companySizes.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="country">Company Location <span className={styles.req}>*</span></label>
                      <select id="country" required value={form.country} onChange={(e) => set('country', e.target.value)}>
                        <option value="">Select Country</option>
                        {countries.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="website">Company Website</label>
                      <input id="website" type="url" placeholder="https://www.yourcompany.com" value={form.website} onChange={(e) => set('website', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className={styles.formCard}>
                  <h2 className={styles.formSectionTitle}>
                    <i className="fa-solid fa-user-tie" aria-hidden="true" /> Contact Person
                  </h2>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="contactPerson">Full Name <span className={styles.req}>*</span></label>
                      <input id="contactPerson" type="text" required placeholder="John Smith" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="position">Position/Title <span className={styles.req}>*</span></label>
                      <input id="position" type="text" required placeholder="HR Manager" value={form.position} onChange={(e) => set('position', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
                      <input id="email" type="email" required placeholder="john.smith@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number <span className={styles.req}>*</span></label>
                      <input id="phone" type="tel" required placeholder="+971 50 123 4567" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Hiring Requirements */}
                <div className={styles.formCard}>
                  <h2 className={styles.formSectionTitle}>
                    <i className="fa-solid fa-users" aria-hidden="true" /> Hiring Requirements
                  </h2>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="positionsNeeded">Position(s) Needed <span className={styles.req}>*</span></label>
                      <input id="positionsNeeded" type="text" required placeholder="e.g., Hotel Staff, Engineers, Nurses" value={form.positionsNeeded} onChange={(e) => set('positionsNeeded', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="numberOfWorkers">Number of Workers <span className={styles.req}>*</span></label>
                      <input id="numberOfWorkers" type="text" required placeholder="e.g., 5-10" value={form.numberOfWorkers} onChange={(e) => set('numberOfWorkers', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="targetIndustry">Target Industry <span className={styles.req}>*</span></label>
                      <select id="targetIndustry" required value={form.targetIndustry} onChange={(e) => set('targetIndustry', e.target.value)}>
                        <option value="">Select Industry</option>
                        {industries.map((i) => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="urgency">Urgency <span className={styles.req}>*</span></label>
                      <select id="urgency" required value={form.urgency} onChange={(e) => set('urgency', e.target.value)}>
                        <option value="">Select Urgency</option>
                        {urgencyLevels.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="requiredSkills">Required Skills &amp; Qualifications <span className={styles.req}>*</span></label>
                    <textarea id="requiredSkills" required rows={4} placeholder="List the skills, experience, and qualifications you're looking for..." value={form.requiredSkills} onChange={(e) => set('requiredSkills', e.target.value)} />
                  </div>
                </div>

                {/* Employment Details */}
                <div className={styles.formCard}>
                  <h2 className={styles.formSectionTitle}>
                    <i className="fa-solid fa-file-contract" aria-hidden="true" /> Employment Details
                  </h2>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="employmentType">Employment Type <span className={styles.req}>*</span></label>
                      <select id="employmentType" required value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
                        <option value="">Select Type</option>
                        {employmentTypes.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="contractDuration">Contract Duration</label>
                      <input id="contractDuration" type="text" placeholder="e.g., 2 years" value={form.contractDuration} onChange={(e) => set('contractDuration', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="salaryRange">Salary Range (Monthly PHP) <span className={styles.req}>*</span></label>
                      <input id="salaryRange" type="text" required placeholder="e.g., ₱20,000 - ₱35,000" value={form.salaryRange} onChange={(e) => set('salaryRange', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="accommodationProvided">Accommodation Provided? <span className={styles.req}>*</span></label>
                      <select id="accommodationProvided" required value={form.accommodationProvided} onChange={(e) => set('accommodationProvided', e.target.value)}>
                        <option value="">Select</option>
                        <option value="Yes">Yes - Fully provided</option>
                        <option value="Partial">Yes - With allowance</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className={styles.formCard}>
                  <h2 className={styles.formSectionTitle}>
                    <i className="fa-solid fa-circle-info" aria-hidden="true" /> Additional Information
                  </h2>
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Tell us more about your hiring needs</label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Include any specific requirements, certifications, preferred experience, languages, or anything else that will help us find the right candidates for you..."
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                    />
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className={styles.formCard}>
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
                </div>

                {/* Submit */}
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !agreed}>
                    {isSubmitting
                      ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Processing...</>
                      : <>Submit Inquiry <Send size={18} /></>
                    }
                  </button>
                </div>

              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why Employers Choose Promex */}
      <section className={styles.benefitsSection}>
        <div className="container">
          <Reveal animation="fade-up">
            <h3 className={styles.benefitsHeading}>Why Employers Choose Promex</h3>
          </Reveal>
          <div className={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <Reveal key={b.title} animation="fade-up" delay={i * 80}>
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrap}>
                    <i className={b.icon} aria-hidden="true" />
                  </div>
                  <h4 className={styles.benefitCardTitle}>{b.title}</h4>
                  <p className={styles.benefitCardDesc}>{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
