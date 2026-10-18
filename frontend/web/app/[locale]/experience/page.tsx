import { getTranslations } from 'next-intl/server';
import { Reveal } from '../../../components/motion';
import { ExperienceTimeline } from '../../../components/experience-timeline';
import { ScrollText } from '../../../components/scroll-text';
import { safeGet, type Experience } from '../../lib/api';
import { experiencePeriod, experienceTypeLabel } from '../../lib/portfolio-helpers';

export default async function ExperiencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const experiences = await safeGet<Experience[]>('/experiences', [], 120);

  return (
    <main>
      <section className="section-shell section-block" id="experience">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.experience')}</ScrollText>
            </h2>
          </Reveal>
        </div>
        <div id="experience-details">
          {experiences.length > 0 ? (
            <ExperienceTimeline
              locale={locale}
              items={experiences.map((item) => ({
                id: item.id,
                title: item.title,
                organization: item.organization,
                description: item.description
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim(),
                period: experiencePeriod(item.startDate, item.endDate, locale),
                typeLabel: experienceTypeLabel(item.type, locale),
              }))}
            />
          ) : (
            <div className="experience-flow experience-flow-empty">
              <p className="section-empty">
                {locale === 'id'
                  ? 'Pengalaman kerja akan tampil di sini setelah ditambahkan ke database.'
                  : 'Work experience will appear here after it is added to the database.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
