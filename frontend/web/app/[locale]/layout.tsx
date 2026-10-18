import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { routing } from '../../i18n/routing';
import { ThemeProvider } from '../../components/theme-provider';
import { ScrollEffects } from '../../components/scroll-effects';
import { Navbar } from '../../components/navbar';
import { SiteFooter } from '../../components/site-footer';
import { DocumentLocale } from '../../components/document-locale';
import {
  queryString,
  safeGet,
  type ApiList,
  type Experience,
  type Post,
  type Profile,
  type Project,
  type Skill,
  type SiteSettings,
} from '../lib/api';
import { FeatureEffects } from '../../components/feature-effects';
import { FloatingAssistant, type AssistantReference } from '../../components/floating-assistant';

const emptyList = <T,>(): ApiList<T> => ({
  items: [],
  total: 0,
  page: 1,
  limit: 100,
  totalPages: 0,
});
const cleanText = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const getLocalized = (value: unknown, locale: string): string => {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return '';
  const record = value as Record<string, unknown>;
  const text = record[locale] ?? record.en ?? record.id;
  return typeof text === 'string' ? text : '';
};
const getRecords = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      )
    : [];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'hero' }),
    safeGet<SiteSettings>('/settings/public', [], 60),
  ]);
  const siteTitle = settings.find((setting) => setting.key === 'site_title')?.value;
  const seoDescription = settings.find((setting) => setting.key === 'seo_description')?.value;
  const title =
    typeof siteTitle === 'string' && siteTitle ? siteTitle : 'Rafi Budiansyah | Developer';
  const description =
    typeof seoDescription === 'string' && seoDescription ? seoDescription : t('tagline');
  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    alternates: { languages: { id: '/id', en: '/en' } },
    openGraph: {
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      siteName: title,
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();
  const [settings, profile, projects, experiences, skills, posts] = await Promise.all([
    safeGet<SiteSettings>('/settings/public', [], 300),
    safeGet<Profile>(
      '/profile',
      {
        headline: '',
        bio: '',
        photoUrl: null,
        cvUrl: null,
        location: null,
        availability: false,
        socialLinks: {},
      },
      300,
    ),
    safeGet<ApiList<Project>>(
      `/projects${queryString({ page: 1, limit: 100 })}`,
      emptyList<Project>(),
      60,
    ),
    safeGet<Experience[]>('/experiences', [], 300),
    safeGet<Skill[]>('/skills', [], 300),
    safeGet<ApiList<Post>>(`/posts${queryString({ page: 1, limit: 100 })}`, emptyList<Post>(), 120),
  ]);
  const whatsappUrl = Object.entries(profile.socialLinks ?? {}).find(([name]) =>
    ['whatsapp', 'wa'].includes(name.toLowerCase().replace(/[^a-z]/g, '')),
  )?.[1];
  const featureValue = settings.find((setting) => setting.key === 'features')?.value;
  const features: Record<string, unknown> =
    typeof featureValue === 'object' && featureValue !== null && !Array.isArray(featureValue)
      ? (featureValue as Record<string, unknown>)
      : {};
  const services = getRecords(settings.find((setting) => setting.key === 'services')?.value);
  const awards = getRecords(settings.find((setting) => setting.key === 'awards')?.value);
  const references: AssistantReference[] = [
    {
      title: locale === 'id' ? 'Profil Rafi Budiansyah' : 'About Rafi Budiansyah',
      content: cleanText(
        `${locale === 'id' ? 'tentang saya profil' : 'about profile'}; ${locale === 'id' ? 'peran' : 'role'} ${profile.headline}; ${locale === 'id' ? 'bio' : 'bio'}: ${profile.bio}; ${locale === 'id' ? 'lokasi' : 'location'}: ${profile.location ?? ''}`,
      ),
      href: `/${locale}#about`,
    },
    ...experiences.map((item) => ({
      title: `${item.title} — ${item.organization}`,
      content: cleanText(
        `${locale === 'id' ? 'pengalaman kerja' : 'work experience'} ${item.description} ${item.startDate} ${item.endDate ?? ''}`,
      ),
      href: `/${locale}#experience`,
    })),
    ...services.map((item, index) => ({
      title:
        getLocalized(item.title, locale) ||
        (locale === 'id' ? `Layanan ${index + 1}` : `Service ${index + 1}`),
      content: cleanText(
        `${locale === 'id' ? 'layanan' : 'services'} ${getLocalized(item.description, locale)}`,
      ),
      href: `/${locale}#services`,
    })),
    ...projects.items.map((item) => ({
      title: item.title,
      content: cleanText(
        `${locale === 'id' ? 'proyek' : 'projects'}; ${locale === 'id' ? 'deskripsi' : 'description'}: ${item.summary}; ${locale === 'id' ? 'klien' : 'client'}: ${item.client ?? (locale === 'id' ? 'mandiri' : 'independent')}; ${locale === 'id' ? 'dibuat' : 'created'} ${item.createdAt.slice(0, 10)}; ${locale === 'id' ? 'keahlian' : 'skills'}: ${item.skills.map(({ skill }) => skill.name).join(', ')}`,
      ),
      href: `/${locale}#projects`,
    })),
    ...awards.map((item, index) => ({
      title:
        getLocalized(item.title, locale) ||
        (locale === 'id' ? `Sertifikat ${index + 1}` : `Certificate ${index + 1}`),
      content: cleanText(
        `${locale === 'id' ? 'sertifikat penghargaan' : 'certificates awards'} ${getLocalized(item.issuer, locale)} ${getLocalized(item.date, locale)} ${getLocalized(item.kind, locale)}`,
      ),
      href: `/${locale}#awards`,
    })),
    ...skills.map((item) => ({
      title: item.name,
      content: `${locale === 'id' ? 'tools keahlian' : 'tools skills'} ${item.name} ${item.category}`,
      href: `/${locale}#tools`,
    })),
    ...posts.items.map((item) => ({
      title: item.title,
      content: cleanText(
        `${locale === 'id' ? 'artikel blog' : 'blog article'} ${item.excerpt} ${item.tags.join(' ')}`,
      ),
      href: `/${locale}#journal`,
    })),
    {
      title: locale === 'id' ? 'Kontak dan media sosial' : 'Contact and social links',
      content: Object.entries(profile.socialLinks ?? {})
        .map(([name, url]) => `${name} ${url}`)
        .join(' '),
      href: `/${locale}#contact`,
    },
  ].filter((item) => item.content.length > 0);
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DocumentLocale />
        <ScrollEffects />
        <FeatureEffects features={features} />
        <Navbar />
        {children}
        <SiteFooter locale={locale} />
        <FloatingAssistant
          locale={locale as 'id' | 'en'}
          whatsappUrl={whatsappUrl}
          references={references}
        />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
