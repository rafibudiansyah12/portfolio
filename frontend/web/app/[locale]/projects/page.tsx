import { getTranslations } from 'next-intl/server';
import { Reveal } from '../../../components/motion';
import { ProjectsBrowser } from '../../../components/projects-browser';
import { ScrollText } from '../../../components/scroll-text';
import { queryString, safeGet, type ApiList, type Project } from '../../lib/api';

const emptyList: ApiList<Project> = { items: [], page: 1, limit: 100, total: 0, totalPages: 0 };

export default async function ProjectsListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const projects = await safeGet<ApiList<Project>>(
    `/projects${queryString({ page: 1, limit: 100 })}`,
    emptyList,
    60,
  );

  return (
    <main>
      <section className="section-shell section-block projects-section" id="projects">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.projects')}</ScrollText>
            </h2>
          </Reveal>
        </div>
        <div id="projects-details">
          {projects.items.length > 0 ? (
            <ProjectsBrowser projects={projects.items} locale={locale as 'id' | 'en'} />
          ) : (
            <p className="section-empty">
              {locale === 'id'
                ? 'Proyek akan tampil di sini setelah ditambahkan ke database.'
                : 'Projects will appear here after they are added to the database.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
