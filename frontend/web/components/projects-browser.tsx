'use client';

import { Search, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import { useMemo, useState } from 'react';
import type { Project } from '../app/lib/api';
import { Reveal } from './motion';

export function ProjectsBrowser({ projects, locale }: { projects: Project[]; locale: string }) {
  const t = useTranslations('projects');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const categories = useMemo(
    () =>
      [
        ...new Set(
          projects.flatMap((project) => project.skills.map(({ skill }) => skill.category)),
        ),
      ].sort(),
    [projects],
  );
  const filtered = useMemo(
    () =>
      projects.filter(
        (project) =>
          (category === 'all' || project.skills.some(({ skill }) => skill.category === category)) &&
          `${project.title} ${project.summary} ${project.skills.map(({ skill }) => skill.name).join(' ')}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [projects, category, search],
  );
  return (
    <>
      <div className="project-controls">
        <div className="filter-row">
          <button
            className={category === 'all' ? 'filter-pill active' : 'filter-pill'}
            onClick={() => setCategory('all')}
          >
            {t('all')}
          </button>
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'filter-pill active' : 'filter-pill'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="project-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
          />
        </label>
      </div>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index % 3, 2) * 0.08}>
              <article className="project-card">
                <Link href={`/projects/${project.slug}`} locale={locale} className="project-visual">
                  {project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt={`${project.title} project preview`}
                      loading="lazy"
                    />
                  ) : (
                    <div className={`project-art art-${index % 4}`}>
                      <span className="art-orbit" />
                      <span className="art-code">
                        {project.skills
                          .slice(0, 3)
                          .map(({ skill }) => skill.name)
                          .join(' / ') || 'SELECTED WORK'}
                      </span>
                      <span className="art-index">0{index + 1}</span>
                    </div>
                  )}
                  <span className="project-open">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
                <div className="project-meta">
                  <div>
                    <span className="project-kicker">
                      {project.featured ? 'FEATURED CASE STUDY' : 'PROJECT'}
                    </span>
                    <h3>
                      <Link href={`/projects/${project.slug}`} locale={locale}>
                        {project.title}
                      </Link>
                    </h3>
                    <p>{project.summary}</p>
                  </div>
                  <Link
                    className="project-arrow"
                    href={`/projects/${project.slug}`}
                    locale={locale}
                    aria-label={`${t('read')}: ${project.title}`}
                  >
                    <ArrowRight size={17} />
                  </Link>
                </div>
                <div className="project-tags">
                  {project.skills.slice(0, 4).map(({ skill }) => (
                    <span key={skill.id}>{skill.name}</span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="empty-note">{t('empty')}</div>
      )}
    </>
  );
}
