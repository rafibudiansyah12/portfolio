'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
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
    { href: '/#about', label: t('about') },
    { href: '/#projects', label: t('work') },
    { href: '/#journal', label: t('journal') },
    { href: '/#guestbook', label: t('guestbook') },
    { href: '/#contact', label: t('contact') },
  ];
  const switchLocale = () => router.replace(pathname, { locale: locale === 'id' ? 'en' : 'id' });
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Rafi Budiansyah — home">
        <span className="wordmark-icon">r.</span>
        <span>
          rafi<span className="wordmark-light">folio</span>
        </span>
      </Link>
      <nav className={open ? 'primary-nav open' : 'primary-nav'} aria-label="Main navigation">
        {items.map(({ href, label }) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button className="locale-switch" onClick={switchLocale} aria-label="Change language">
          {locale === 'id' ? 'EN' : 'ID'} <ArrowUpRight size={12} />
        </button>
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
