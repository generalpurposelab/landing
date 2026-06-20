'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './join.module.css';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function JoinClient() {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, setFormState] = useState<FormState>('idle');
  const [reason, setReason] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTimeout(() => labelRef.current?.classList.add(styles.visible), 50);
      setTimeout(() => headlineRef.current?.classList.add(styles.visible), 130);
      setTimeout(() => ruleRef.current?.classList.add(styles.dotRuleVisible), 260);
      setTimeout(() => formRef.current?.classList.add(styles.visible), 360);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get('name') as string).trim();
    const email = (data.get('email') as string).trim();

    setNameError(!name);
    setEmailError(!email);
    if (!name || !email) return;

    setFormState('submitting');

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company: data.get('company'),
          website: data.get('website'),
          reason: data.get('reason'),
          message: data.get('message'),
          newsletter: data.get('newsletter') === 'yes',
        }),
      });

      if (res.ok) {
        if (newsletter) {
          window.open('https://generalpurpose.beehiiv.com/', '_blank', 'noopener,noreferrer');
        }
        if (formRef.current) {
          formRef.current.style.transition = 'opacity 0.3s';
          formRef.current.style.opacity = '0';
        }
        setTimeout(() => setFormState('success'), 320);
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }

  return (
    <>
      <div className={styles.pageWrap}>
        <p ref={labelRef} className={styles.pageLabel}>
          <span className={styles.labelPip} /> Join Us
        </p>

        <h1 ref={headlineRef} className={styles.pageHeadline}>
          If you&apos;re a like-minded builder or an organization working to shape our collective future, let&apos;s talk.
        </h1>

        <div ref={ruleRef} className={styles.dotRule} />

        {formState !== 'success' ? (
          <form
            ref={formRef}
            className={styles.contactForm}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label
                  htmlFor="f-name"
                  style={nameError ? { color: 'var(--orange)' } : undefined}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="f-name"
                  name="name"
                  autoComplete="name"
                  required
                  onChange={() => setNameError(false)}
                />
              </div>
              <div className={styles.field}>
                <label
                  htmlFor="f-email"
                  style={emailError ? { color: 'var(--orange)' } : undefined}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="f-email"
                  name="email"
                  autoComplete="email"
                  required
                  onChange={() => setEmailError(false)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="f-company">Company</label>
                <input type="text" id="f-company" name="company" autoComplete="organization" />
              </div>
              <div className={styles.field}>
                <label htmlFor="f-website">Website / LinkedIn</label>
                <input type="text" id="f-website" name="website" placeholder="https://" />
              </div>
            </div>

            <div className={styles.reasonGroup}>
              <p className={styles.reasonLabel}>I&apos;m reaching out because</p>
              <div className={styles.reasonOptions}>
                {[
                  { value: 'talent', label: 'I want to join the GP Talent Roster' },
                  { value: 'sponsor', label: 'I want to sponsor a future theme or product build' },
                  { value: 'other', label: 'Something else' },
                ].map(opt => (
                  <label key={opt.value} className={styles.reasonOption}>
                    <input
                      type="radio"
                      name="reason"
                      value={opt.value}
                      checked={reason === opt.value}
                      onChange={() => setReason(opt.value)}
                    />
                    <span className={`${styles.radioDot} ${reason === opt.value ? styles.radioDotChecked : ''}`} />
                    <span className={`${styles.optionText} ${reason === opt.value ? styles.optionTextChecked : ''}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="f-message">Your message</label>
              <textarea id="f-message" name="message" rows={4} />
            </div>

            <div className={styles.formBottom}>
              <label className={styles.newsletterLabel}>
                <input
                  type="checkbox"
                  name="newsletter"
                  value="yes"
                  checked={newsletter}
                  onChange={e => setNewsletter(e.target.checked)}
                />
                <span className={`${styles.checkBox} ${newsletter ? styles.checkBoxChecked : ''}`} />
                <span className={`${styles.newsletterText} ${newsletter ? styles.newsletterTextChecked : ''}`}>
                  Sign up for our monthly newsletter
                </span>
              </label>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={formState === 'submitting'}
              >
                {formState === 'submitting' ? 'Sending…' : 'Send'}
              </button>
            </div>

            {formState === 'error' && (
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--orange)', marginTop: 8 }}>
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        ) : (
          <div className={styles.confirmation}>
            <div className={styles.confirmationMark} />
            <p className={styles.confirmationText}>We&apos;ll be in touch.</p>
            <p className={styles.confirmationSub}>Thanks for reaching out</p>
          </div>
        )}
      </div>

      <footer className={styles.siteFooter}>
        <div className={styles.footerRuleWrap}>
          <div className={styles.footerRule} />
          <div className={styles.footerInner}>
            <span className={styles.footerCopy}>&copy; 2025 General Purpose</span>
            <nav className={styles.footerLinks}>
              <a href="/about">About</a>
              <a href="/join">Join Us</a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
