import { Link } from '../i18n/navigation';

export function SiteFooter({ locale }: { locale: 'id' | 'en' }) {
  const id = locale === 'id';
  return (
    <footer className="site-footer section-shell">
      <div className="footer-line">
        <Link className="footer-brand" href="/" locale={locale} aria-label="Home">
          r.
        </Link>
        <p>
          © {new Date().getFullYear()} <strong>Rafi Budiansyah</strong>
          <span aria-hidden="true"> · </span>
          {id ? 'Hak cipta dilindungi.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}
