'use client';

import { useState, ChangeEvent } from 'react';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

type Method = 'choose' | 'linkedin' | 'cv' | 'manual';

const industries = ['Hospitality','Healthcare','Retail','Engineering','Construction','IT & Technology','Food Service','Manufacturing','Transportation','Other'];
const countries = ['Saudi Arabia','UAE','Qatar','Kuwait','Oman','Bahrain','Singapore','Hong Kong','Japan','South Korea','Taiwan','Canada','United Kingdom','Australia','New Zealand','Other'];
const educationLevels = ['High School','Vocational/Technical','Associate Degree',"Bachelor's Degree","Master's Degree",'Doctorate'];

const initialForm = {
  firstName: '', lastName: '', middleName: '', email: '', phone: '', dateOfBirth: '',
  gender: '', civilStatus: '', address: '', city: '', province: '', zipCode: '',
  preferredIndustry: '', preferredPosition: '', preferredCountry: '', expectedSalary: '',
  highestEducation: '', yearsOfExperience: '', currentEmployer: '', skills: '',
  passportNumber: '', passportExpiry: '', availability: '', message: '',
};

export default function ApplyPage() {
  const [method, setMethod] = useState<Method>('choose');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  function set(field: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function backToChoose() {
    setMethod('choose');
    setCvFile(null);
  }

  function onCVSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.type)) {
      setCvFile(file);
    } else {
      alert('Please upload a PDF or Word document');
      e.target.value = '';
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setMethod('choose');
        setCvFile(null);
        setForm(initialForm);
      }, 3000);
    }, 1500);
  }

  return (
    <>
      <PageHero
        badge="Start Your Journey"
        heading="Apply for"
        accentText="Overseas Employment"
        subText="Take the first step towards your international career. Fill out the form below and our recruitment team will match you with the best opportunities."
        bgImage="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=1600&q=80&auto=format&fit=crop"
        waveFill="var(--color-bg)"
      />

      <section className={styles.applySection}>
        <div className="container">

          {submitSuccess && (
            <Reveal animation="fade-up">
              <div className={styles.alertSuccess}>
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                <div>
                  <h3>Application Submitted Successfully!</h3>
                  <p>Thank you for your interest. Our team will review your application and contact you within 2-3 business days.</p>
                </div>
              </div>
            </Reveal>
          )}

          {/* Method Chooser */}
          {method === 'choose' && (
            <Reveal animation="fade-up">
              <div className={styles.methodChooser}>
                <h2 className={styles.methodChooserTitle}>Choose Your Application Method</h2>
                <p className={styles.methodChooserSubtitle}>Select the most convenient way to apply for overseas employment</p>

                <div className={styles.methodCards}>
                  <button className={styles.methodCard} onClick={() => setMethod('linkedin')}>
                    <div className={`${styles.methodCardIcon} ${styles.linkedinIcon}`}>
                      <i className="fa-brands fa-linkedin" aria-hidden="true" />
                    </div>
                    <h3 className={styles.methodCardTitle}>Apply via LinkedIn</h3>
                    <p className={styles.methodCardDescription}>Quick application using your LinkedIn profile. Perfect if you have an active LinkedIn account.</p>
                    <div className={styles.methodCardAction}>
                      <span>Continue with LinkedIn</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </div>
                  </button>

                  <button className={styles.methodCard} onClick={() => setMethod('cv')}>
                    <div className={`${styles.methodCardIcon} ${styles.cvIcon}`}>
                      <i className="fa-solid fa-file-arrow-up" aria-hidden="true" />
                    </div>
                    <h3 className={styles.methodCardTitle}>Upload Your CV</h3>
                    <p className={styles.methodCardDescription}>Upload your resume and provide basic contact information. Fast and convenient.</p>
                    <div className={styles.methodCardAction}>
                      <span>Upload CV</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </div>
                  </button>

                  <button className={styles.methodCard} onClick={() => setMethod('manual')}>
                    <div className={`${styles.methodCardIcon} ${styles.manualIcon}`}>
                      <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                    </div>
                    <h3 className={styles.methodCardTitle}>Fill Manual Form</h3>
                    <p className={styles.methodCardDescription}>Complete our detailed application form. Best if you don&apos;t have a CV ready.</p>
                    <div className={styles.methodCardAction}>
                      <span>Fill Form</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </div>
                  </button>
                </div>
              </div>
            </Reveal>
          )}

          {/* LinkedIn */}
          {method === 'linkedin' && (
            <Reveal animation="fade-up">
              <div className={`${styles.formWrapper} ${styles.linkedinWrapper}`}>
                <button className={styles.backButton} onClick={backToChoose} type="button">
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to options
                </button>
                <div className={styles.linkedinContent}>
                  <div className={styles.linkedinIconLarge}>
                    <i className="fa-brands fa-linkedin" aria-hidden="true" />
                  </div>
                  <h2 className={styles.linkedinTitle}>Apply via LinkedIn</h2>
                  <p className={styles.linkedinDescription}>
                    You will be redirected to our LinkedIn page where you can apply directly through the platform. Make sure your LinkedIn profile is up to date before applying.
                  </p>
                  <div className={styles.linkedinBenefits}>
                    {['Quick & Easy Application', 'Use Your Existing Profile', 'Track Application Status'].map((b) => (
                      <div key={b} className={styles.linkedinBenefit}>
                        <i className="fa-solid fa-check-circle" aria-hidden="true" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    label="Continue to LinkedIn"
                    externalHref="https://www.linkedin.com/company/promex-company"
                    variant="primary"
                    size="lg"
                    icon="fa-brands fa-linkedin"
                    fullWidth
                  />
                </div>
              </div>
            </Reveal>
          )}

          {/* CV Upload */}
          {method === 'cv' && (
            <Reveal animation="fade-up">
              <div className={styles.formWrapper}>
                <button className={styles.backButton} onClick={backToChoose} type="button">
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to options
                </button>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}>
                      <i className="fa-solid fa-file-arrow-up" aria-hidden="true" /> Upload Your CV/Resume
                    </h2>
                    <div className={styles.cvUploadArea}>
                      {!cvFile ? (
                        <label htmlFor="cvFile" className={styles.cvUploadLabel}>
                          <div className={styles.cvUploadIcon}>
                            <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />
                          </div>
                          <h3>Click to upload or drag and drop</h3>
                          <p>PDF, DOC, or DOCX (Max 5MB)</p>
                          <input type="file" id="cvFile" accept=".pdf,.doc,.docx" onChange={onCVSelected} className={styles.cvFileInput} required />
                        </label>
                      ) : (
                        <div className={styles.cvUploaded}>
                          <div className={styles.cvFileInfo}>
                            <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                            <div className={styles.cvFileDetails}>
                              <strong>{cvFile.name}</strong>
                              <small>Ready to upload</small>
                            </div>
                          </div>
                          <button type="button" className={styles.cvRemoveBtn} onClick={() => setCvFile(null)}>
                            <i className="fa-solid fa-trash" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}>
                      <i className="fa-solid fa-user" aria-hidden="true" /> Contact Information
                    </h2>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>First Name <span className={styles.req}>*</span></label><input type="text" required placeholder="Juan" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Last Name <span className={styles.req}>*</span></label><input type="text" required placeholder="Dela Cruz" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Email Address <span className={styles.req}>*</span></label><input type="email" required placeholder="juan.delacruz@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Phone Number <span className={styles.req}>*</span></label><input type="tel" required placeholder="+63 912 345 6789" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Preferred Industry <span className={styles.req}>*</span></label><select required value={form.preferredIndustry} onChange={(e) => set('preferredIndustry', e.target.value)}><option value="">Select Industry</option>{industries.map((i) => <option key={i}>{i}</option>)}</select></div>
                      <div className={styles.formGroup}><label>Preferred Country <span className={styles.req}>*</span></label><select required value={form.preferredCountry} onChange={(e) => set('preferredCountry', e.target.value)}><option value="">Select Country</option>{countries.map((c) => <option key={c}>{c}</option>)}</select></div>
                    </div>
                    <div className={styles.formGroup}><label>Additional Message</label><textarea rows={4} placeholder="Tell us more about your career goals and preferences..." value={form.message} onChange={(e) => set('message', e.target.value)} /></div>
                  </div>

                  <div className={styles.formActions}>
                    <Button label={isSubmitting ? 'Processing...' : 'Submit Application'} variant="primary" size="lg" type="submit" disabled={isSubmitting || !cvFile} icon="fa-solid fa-paper-plane" iconPosition="right" />
                    {isSubmitting && <span className={styles.formLoading}><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Processing your application...</span>}
                  </div>
                </form>
              </div>
            </Reveal>
          )}

          {/* Manual Form */}
          {method === 'manual' && (
            <Reveal animation="fade-up">
              <div className={styles.formWrapper}>
                <button className={styles.backButton} onClick={backToChoose} type="button">
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to options
                </button>
                <form onSubmit={handleSubmit}>

                  {/* Personal Information */}
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}><i className="fa-solid fa-user" aria-hidden="true" /> Personal Information</h2>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>First Name <span className={styles.req}>*</span></label><input type="text" required placeholder="Juan" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Middle Name</label><input type="text" placeholder="Santos" value={form.middleName} onChange={(e) => set('middleName', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Last Name <span className={styles.req}>*</span></label><input type="text" required placeholder="Dela Cruz" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Email Address <span className={styles.req}>*</span></label><input type="email" required placeholder="juan.delacruz@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Phone Number <span className={styles.req}>*</span></label><input type="tel" required placeholder="+63 912 345 6789" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Date of Birth <span className={styles.req}>*</span></label><input type="date" required value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} /></div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Gender <span className={styles.req}>*</span></label><select required value={form.gender} onChange={(e) => set('gender', e.target.value)}><option value="">Select Gender</option><option>Male</option><option>Female</option></select></div>
                      <div className={styles.formGroup}><label>Civil Status <span className={styles.req}>*</span></label><select required value={form.civilStatus} onChange={(e) => set('civilStatus', e.target.value)}><option value="">Select Status</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option></select></div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}><i className="fa-solid fa-location-dot" aria-hidden="true" /> Address Information</h2>
                    <div className={styles.formGroup}><label>Street Address <span className={styles.req}>*</span></label><input type="text" required placeholder="123 Rizal Street, Barangay San Jose" value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>City/Municipality <span className={styles.req}>*</span></label><input type="text" required placeholder="Manila" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Province <span className={styles.req}>*</span></label><input type="text" required placeholder="Metro Manila" value={form.province} onChange={(e) => set('province', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Zip Code</label><input type="text" placeholder="1000" value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} /></div>
                    </div>
                  </div>

                  {/* Job Preferences */}
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}><i className="fa-solid fa-briefcase" aria-hidden="true" /> Job Preferences</h2>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Preferred Industry <span className={styles.req}>*</span></label><select required value={form.preferredIndustry} onChange={(e) => set('preferredIndustry', e.target.value)}><option value="">Select Industry</option>{industries.map((i) => <option key={i}>{i}</option>)}</select></div>
                      <div className={styles.formGroup}><label>Preferred Position <span className={styles.req}>*</span></label><input type="text" required placeholder="e.g., Hotel Staff, Nurse, Engineer" value={form.preferredPosition} onChange={(e) => set('preferredPosition', e.target.value)} /></div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Preferred Country <span className={styles.req}>*</span></label><select required value={form.preferredCountry} onChange={(e) => set('preferredCountry', e.target.value)}><option value="">Select Country</option>{countries.map((c) => <option key={c}>{c}</option>)}</select></div>
                      <div className={styles.formGroup}><label>Expected Monthly Salary (USD)</label><input type="text" placeholder="e.g., $1,500" value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} /></div>
                    </div>
                  </div>

                  {/* Education & Experience */}
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}><i className="fa-solid fa-graduation-cap" aria-hidden="true" /> Education &amp; Experience</h2>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Highest Educational Attainment <span className={styles.req}>*</span></label><select required value={form.highestEducation} onChange={(e) => set('highestEducation', e.target.value)}><option value="">Select Education Level</option>{educationLevels.map((l) => <option key={l}>{l}</option>)}</select></div>
                      <div className={styles.formGroup}><label>Years of Experience <span className={styles.req}>*</span></label><select required value={form.yearsOfExperience} onChange={(e) => set('yearsOfExperience', e.target.value)}><option value="">Select Experience</option><option>0-1 years</option><option>1-3 years</option><option>3-5 years</option><option>5-10 years</option><option>10+ years</option></select></div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Current/Most Recent Employer</label><input type="text" placeholder="Company Name" value={form.currentEmployer} onChange={(e) => set('currentEmployer', e.target.value)} /></div>
                    </div>
                    <div className={styles.formGroup}><label>Skills &amp; Qualifications <span className={styles.req}>*</span></label><textarea required rows={4} placeholder="List your relevant skills, certifications, and qualifications..." value={form.skills} onChange={(e) => set('skills', e.target.value)} /></div>
                  </div>

                  {/* Passport & Availability */}
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}><i className="fa-solid fa-passport" aria-hidden="true" /> Passport &amp; Availability</h2>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Passport Number</label><input type="text" placeholder="P1234567" value={form.passportNumber} onChange={(e) => set('passportNumber', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Passport Expiry Date</label><input type="date" value={form.passportExpiry} onChange={(e) => set('passportExpiry', e.target.value)} /></div>
                      <div className={styles.formGroup}><label>Availability to Start <span className={styles.req}>*</span></label><select required value={form.availability} onChange={(e) => set('availability', e.target.value)}><option value="">Select</option><option>Immediately</option><option>2 weeks</option><option>1 month</option><option>2-3 months</option></select></div>
                    </div>
                  </div>

                  {/* Additional */}
                  <div className={styles.formSectionBlock}>
                    <h2 className={styles.formSectionTitle}><i className="fa-solid fa-message" aria-hidden="true" /> Additional Information</h2>
                    <div className={styles.formGroup}><label>Tell us more about yourself</label><textarea rows={4} placeholder="Share any additional information that would help us match you with the right opportunity..." value={form.message} onChange={(e) => set('message', e.target.value)} /></div>
                  </div>

                  <div className={styles.formActions}>
                    <Button label={isSubmitting ? 'Processing...' : 'Submit Application'} variant="primary" size="lg" type="submit" disabled={isSubmitting} icon="fa-solid fa-paper-plane" iconPosition="right" />
                    {isSubmitting && <span className={styles.formLoading}><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Processing your application...</span>}
                  </div>
                </form>
              </div>
            </Reveal>
          )}

        </div>
      </section>
    </>
  );
}
