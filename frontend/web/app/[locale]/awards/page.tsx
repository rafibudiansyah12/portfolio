import { ArrowUpRight, Award } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '../../../components/motion';
import { ScrollText } from '../../../components/scroll-text';
import { safeGet, type SiteSettings } from '../../lib/api';
import { localizedText, settingRecords } from '../../lib/portfolio-helpers';

export default async function AwardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const settings = await safeGet<SiteSettings>('/settings/public', [], 60);
  const awardSetting = settings.find((setting) => setting.key === 'awards')?.value;
  const awards = settingRecords(awardSetting)
    .map((entry, index) => ({
      id: typeof entry.id === 'string' ? entry.id : `award-${index}`,
      title: localizedText(entry.title, locale),
      issuer: localizedText(entry.issuer, locale),
      date: localizedText(entry.date, locale),
      kind: entry.kind === 'certificate' ? 'certificate' : 'award',
      url: typeof entry.url === 'string' ? entry.url : '',
    }))
    .filter((award) => award.title && award.issuer);

  return (
    <main>
      <section className="section-shell section-block awards-section" id="awards">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.awards')}</ScrollText>
            </h2>
          </Reveal>
        </div>
        <div className="award-grid" id="awards-details">
          {awards.length > 0 ? (
            awards.map((item) => (
              <article className="award-card" key={item.id}>
                <div className="award-card-head">
                  <span className="award-card-badge" aria-hidden="true">
                    <Award size={14} strokeWidth={2} />
                  </span>
                  <div className="award-card-meta">
                    <span>
                      {item.kind === 'certificate' ? t('awards.certificate') : t('awards.award')}
                    </span>
                    {item.date && <time>{item.date}</time>}
                  </div>
                </div>
                <div className="award-card-main">
                  <div className="award-card-title">
                    <strong>{item.title}</strong>
                    <span>{item.issuer}</span>
                  </div>
                  {item.url.startsWith('http') && (
                    <a
                      className="award-card-link"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${t('awards.view')}: ${item.title}`}
                    >
                      {locale === 'id' ? 'Dokumen' : 'View'}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className="section-empty">
              {locale === 'id'
                ? 'Sertifikat dan penghargaan akan tampil di sini setelah ditambahkan ke database.'
                : 'Awards and certificates will appear here after they are added to the database.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
