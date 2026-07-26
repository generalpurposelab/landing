'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './JoinModal.module.css';

type JoinModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function JoinModal({ open, onClose }: JoinModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const handleClose = useCallback(() => {
    setSubmitted(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 180);

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [open, handleClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.open : ''}`}
      aria-hidden={!open}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        <button className={styles.closeButton} type="button" onClick={handleClose} aria-label="Close join form">
          <span />
          <span />
        </button>

        {!submitted ? (
          <>
            <p className={styles.eyebrow}>
              <span />
              Join us
            </p>
            <h2 className={styles.title} id="join-modal-title">
              Stay close to what we&apos;re building.
            </h2>
            <p className={styles.intro}>
              Tell us a little about yourself and we&apos;ll keep you in the loop.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Email</span>
                <input ref={emailRef} type="email" name="email" autoComplete="email" required />
              </label>

              <label className={styles.field}>
                <span>Name</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>

              <label className={styles.field}>
                <span>I&apos;m interested in</span>
                <select name="interest" defaultValue="">
                  <option value="" disabled>
                    Select one
                  </option>
                  <option value="talent">Joining the talent roster</option>
                  <option value="partner">Partnering with General Purpose</option>
                  <option value="updates">News and future projects</option>
                  <option value="other">Something else</option>
                </select>
              </label>

              <button className={styles.submitButton} type="submit">
                Join the list
                <span aria-hidden="true">↗</span>
              </button>
            </form>
          </>
        ) : (
          <div className={styles.success} aria-live="polite">
            <div className={styles.successMark}>
              {Array.from({ length: 9 }).map((_, index) => <span key={index} />)}
            </div>
            <p className={styles.eyebrow}>You&apos;re in</p>
            <h2 className={styles.title} id="join-modal-title">
              Thanks for raising your hand.
            </h2>
            <p className={styles.intro}>We&apos;ll be in touch as General Purpose grows.</p>
            <button className={styles.doneButton} type="button" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
