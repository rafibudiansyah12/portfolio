import { Globe, MessageCircle, Music2, X as XIcon } from 'lucide-react';
import type { Profile } from './api';

export const fallbackProfile: Profile = {
  headline: 'Web Developer & Informatics Engineering student',
  bio: '',
  photoUrl: null,
  cvUrl: null,
  location: 'Indonesia',
  availability: false,
  socialLinks: {},
};

export const localeDate = (date: string | null, locale: string) =>
  date
    ? new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date))
    : locale === 'id'
      ? 'Baru'
      : 'New';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const localizedText = (value: unknown, locale: string) => {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return '';
  const text = value[locale] ?? value.en ?? value.id;
  return typeof text === 'string' ? text : '';
};

export const settingRecords = (value: unknown) =>
  Array.isArray(value) ? value.filter(isRecord) : [];

export const experiencePeriod = (start: string, end: string | null, locale: string) => {
  const startDate = new Date(start);
  const startYear = startDate.getFullYear();
  if (!end) {
    return `${startYear}–${locale === 'id' ? 'Sekarang' : 'Now'} (${locale === 'id' ? 'sampai saat ini' : 'to date'})`;
  }

  const endDate = new Date(end);
  const days = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1);
  if (days < 60) {
    return `${startYear}–${endDate.getFullYear()} (${days} ${locale === 'id' ? 'hari' : days === 1 ? 'day' : 'days'})`;
  }

  let months = (endDate.getFullYear() - startYear) * 12 + endDate.getMonth() - startDate.getMonth();
  if (endDate.getDate() < startDate.getDate()) months -= 1;
  months = Math.max(1, months);
  const duration =
    months >= 12
      ? `${Math.floor(months / 12)} ${locale === 'id' ? 'tahun' : Math.floor(months / 12) === 1 ? 'year' : 'years'}`
      : `${months} ${locale === 'id' ? 'bulan' : months === 1 ? 'month' : 'months'}`;
  return `${startYear}–${endDate.getFullYear()} (${duration})`;
};

export const experienceTypeLabel = (type: string, locale: string) => {
  const labels =
    locale === 'id'
      ? { WORK: 'Pekerjaan', ORGANIZATION: 'Organisasi', EDUCATION: 'Pendidikan' }
      : { WORK: 'Work', ORGANIZATION: 'Organization', EDUCATION: 'Education' };
  return labels[type as keyof typeof labels] ?? type;
};

export const socialLabel = (name: string) => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const labels: Record<string, string> = {
    whatsapp: 'WA',
    wa: 'WA',
    instagram: 'IG',
    ig: 'IG',
    facebook: 'FB',
    fb: 'FB',
    github: 'GitHub',
    linktree: 'Linktree',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    twitter: 'X',
    x: 'X',
    website: 'Website',
  };
  return labels[key] ?? name;
};

export const socialIcon = (name: string) => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'instagram' || key === 'ig')
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.6" cy="6.6" r="1" fill="currentColor" />
      </svg>
    );
  if (key === 'facebook' || key === 'fb')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.9H7v3.1h2.8v8h3.7Z" />
      </svg>
    );
  if (key === 'linkedin')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5.2 8.6a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM3.4 10h3.6v10.6H3.4V10Zm5.8 0h3.4v1.5h.1a3.7 3.7 0 0 1 3.3-1.8c3.5 0 4.1 2.3 4.1 5.2v5.7h-3.6v-5c0-1.2 0-2.8-1.8-2.8s-2 1.3-2 2.7v5.1H9.2V10Z" />
      </svg>
    );
  if (key === 'youtube')
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 8.1a2.6 2.6 0 0 0-1.8-1.8C17.6 5.9 12 5.9 12 5.9s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.1 27 27 0 0 0 2.6 12 27 27 0 0 0 3 15.9a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.2.4 7.2.4s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.9 27 27 0 0 0-.4-3.9Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="m10 15 5-3-5-3v6Z" fill="currentColor" />
      </svg>
    );
  if (key === 'github')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .9A11.1 11.1 0 0 0 8.5 22.5c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.1 11.1 0 0 0 12 .9Z" />
      </svg>
    );

  const Icon =
    key === 'whatsapp' || key === 'wa'
      ? MessageCircle
      : key === 'tiktok'
        ? Music2
        : key === 'twitter' || key === 'x'
          ? XIcon
          : Globe;
  return <Icon size={17} strokeWidth={1.8} aria-hidden="true" />;
};
