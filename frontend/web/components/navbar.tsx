'use client';

import { Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '../i18n/navigation';
import { useState } from 'react';
import { ThemeControls } from './theme-controls';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/experience', label: t('experience') },
    { href: '/services', label: t('services') },
    { href: '/projects', label: t('work') },
    { href: '/awards', label: t('awards') },
    { href: '/journal', label: t('journal') },
    { href: '/contact', label: t('contact') },
  ];
  const switchLocale = (nextLocale: 'id' | 'en') =>
    router.replace(pathname, { locale: nextLocale });
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Rafi Budiansyah — home">
        <span className="wordmark-icon">r.</span>
        <span>
          rafi<span className="wordmark-light">folio</span>
        </span>
      </Link>
      <nav className={open ? 'primary-nav open' : 'primary-nav'} aria-label="Main navigation">
        {items.map(({ href, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={isActive ? 'active' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <div
          className="language-switch"
          role="group"
          aria-label={locale === 'id' ? 'Pilih bahasa' : 'Choose language'}
        >
          <button
            type="button"
            className={locale === 'id' ? 'active' : ''}
            aria-label="Bahasa Indonesia"
            aria-pressed={locale === 'id'}
            onClick={() => switchLocale('id')}
          >
            ID
          </button>
          <button
            type="button"
            className={locale === 'en' ? 'active' : ''}
            aria-label="English"
            aria-pressed={locale === 'en'}
            onClick={() => switchLocale('en')}
          >
            EN
          </button>
        </div>
        <ThemeControls />
        <button
          className="menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
