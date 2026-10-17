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
import { safeGet, type SiteSettings } from '../lib/api';
import { FeatureEffects, PageTransition } from '../../components/feature-effects';

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
    safeGet<SiteSettings>('/settings/public', [], 300),
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
  const settings = await safeGet<SiteSettings>('/settings/public', [], 300);
  const featureValue = settings.find((setting) => setting.key === 'features')?.value;
  const features: Record<string, unknown> =
    typeof featureValue === 'object' && featureValue !== null && !Array.isArray(featureValue)
      ? (featureValue as Record<string, unknown>)
      : {};
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DocumentLocale />
        <ScrollEffects />
        <FeatureEffects features={features} />
        <Navbar />
        <PageTransition enabled={features.pageTransitions !== false}>{children}</PageTransition>
        <SiteFooter locale={locale} />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
