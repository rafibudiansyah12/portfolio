import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '../i18n/navigation';

export async function SiteFooter({ locale }: { locale: 'id' | 'en' }) {
  const t = await getTranslations('footer');
  return (
    <footer className="site-footer section-shell">
      <span>
        <Link className="footer-brand" href="/" locale={locale}>
          R.
        </Link>{' '}
        <span>© {new Date().getFullYear()} Rafi Budiansyah</span>
      </span>
      <span>{t('made')}</span>
      <a href="#top">
        {t('top')} <ArrowUpRight size={13} />
      </a>
    </footer>
  );
}
