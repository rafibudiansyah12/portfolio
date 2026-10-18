'use client';

import { ContactInputSchema, GuestbookInputSchema } from '@portfolio/shared';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { apiPost } from '../app/lib/api';

type SubmissionState = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const t = useTranslations('contact');
  const [state, setState] = useState<SubmissionState>('idle');
  const [values, setValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = ContactInputSchema.safeParse(values);
    if (!input.success) {
      setState('error');
      return;
    }
    setState('sending');
    try {
      await apiPost('/contact', input.data);
      setState('sent');
      setValues({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setState('error');
    }
  }
  return (
    <form className="contact-form" onSubmit={(event) => void submit(event)}>
      <div className="form-two">
        <label>
          {t('name')}
          <input
            required
            minLength={2}
            maxLength={100}
            placeholder="Rafi Budiansyah"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            autoComplete="name"
          />
        </label>
        <label>
          {t('email')}
          <input
            required
            type="email"
            placeholder="nama@email.com"
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        {t('subject')}
        <input
          required
          minLength={3}
          maxLength={160}
          placeholder="Diskusi proyek web / kolaborasi"
          value={values.subject}
          onChange={(event) => setValues({ ...values, subject: event.target.value })}
        />
      </label>
      <label>
        {t('message')}
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder="Ceritakan singkat ide proyek, kebutuhan fitur, atau rencana kolaborasi Anda..."
          value={values.message}
          onChange={(event) => setValues({ ...values, message: event.target.value })}
        />
      </label>
      <label className="honeypot" aria-hidden="true" tabIndex={-1}>
        Website
        <input
          tabIndex={-1}
          name="website"
          value={values.website}
          onChange={(event) => setValues({ ...values, website: event.target.value })}
          autoComplete="off"
        />
      </label>
      <div className="form-submit">
        <button className="button-primary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : t('send')} <span>↗</span>
        </button>
        {state === 'sent' && (
          <span className="form-success" role="status">
            {t('success')}
          </span>
        )}
        {state === 'error' && (
          <span className="form-error" role="alert">
            {t('error')}
          </span>
        )}
      </div>
    </form>
  );
}

export function GuestbookForm() {
  const t = useTranslations('guestbook');
  const [state, setState] = useState<SubmissionState>('idle');
  const [values, setValues] = useState({ name: '', message: '', website: '' });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = GuestbookInputSchema.safeParse(values);
    if (!input.success) {
      setState('error');
      return;
    }
    setState('sending');
    try {
      await apiPost('/guestbook', input.data);
      setState('sent');
      setValues({ name: '', message: '', website: '' });
    } catch {
      setState('error');
    }
  }
  return (
    <form className="guestbook-form" onSubmit={(event) => void submit(event)}>
      <label>
        {t('name')}
        <input
          required
          minLength={2}
          maxLength={100}
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
      </label>
      <label>
        {t('message')}
        <textarea
          required
          minLength={2}
          maxLength={500}
          rows={3}
          value={values.message}
          onChange={(event) => setValues({ ...values, message: event.target.value })}
        />
      </label>
      <label className="honeypot" aria-hidden="true" tabIndex={-1}>
        Website
        <input
          value={values.website}
          onChange={(event) => setValues({ ...values, website: event.target.value })}
          autoComplete="off"
        />
      </label>
      <div className="form-submit">
        <button className="button-secondary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : t('send')} <span>↗</span>
        </button>
        {state === 'sent' && (
          <span className="form-success" role="status">
            {t('success')}
          </span>
        )}
        {state === 'error' && (
          <span className="form-error" role="alert">
            {t('error')}
          </span>
        )}
      </div>
    </form>
  );
}
