'use client';

import { Eye, GitBranch, Globe, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import { useMemo, useState } from 'react';
import type { Project } from '../app/lib/api';
import { Reveal } from './motion';

function projectCategories(project: Project, locale: string) {
  const skillCategories = [...new Set(project.skills.map(({ skill }) => skill.category))];
  if (skillCategories.length > 0) return skillCategories;

  const text = `${project.title} ${project.summary}`.toLowerCase();
  if (/dashboard|admin|analytics|inventaris|inventory/.test(text)) return ['Dashboard'];
  if (/ui\/?ux|figma|design|desain/.test(text)) {
    return [locale === 'id' ? 'Desain' : 'Design'];
  }
  if (/mobile|aplikasi|application|\bapp\b/.test(text)) {
    return [locale === 'id' ? 'Aplikasi' : 'App'];
  }
  if (/website|\bweb\b|landing|katalog|catalog/.test(text)) return ['Website'];
  return [locale === 'id' ? 'Lainnya' : 'Other'];
}

export function ProjectsBrowser({ projects, locale }: { projects: Project[]; locale: string }) {
  const t = useTranslations('projects');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const categories = useMemo(
    () => [...new Set(projects.flatMap((project) => projectCategories(project, locale)))].sort(),
    [projects, locale],
  );
  const filtered = useMemo(
    () =>
      projects.filter(
        (project) =>
          (category === 'all' || projectCategories(project, locale).includes(category)) &&
          `${project.title} ${project.summary} ${project.client ?? ''} ${project.skills.map(({ skill }) => skill.name).join(' ')}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [projects, category, locale, search],
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
        <div className="project-grid project-grid-simple">
          {filtered.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index % 3, 2) * 0.06}>
              <article className="project-card project-card-simple">
                {project.thumbnailUrl ? (
                  <img
                    className="project-simple-thumbnail"
                    src={project.thumbnailUrl}
                    alt={`${project.title} thumbnail`}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="project-simple-thumbnail project-simple-thumbnail-fallback"
                    aria-hidden="true"
                  >
                    <span>{projectCategories(project, locale)[0]}</span>
                  </div>
                )}
                <div className="project-simple-top">
                  <span className="project-category-pill">
                    {projectCategories(project, locale)[0]}
                  </span>
                  <strong className="project-simple-client">
                    {project.client || (locale === 'id' ? 'Belum dicantumkan' : 'Not specified')}
                  </strong>
                </div>
                <h3>{project.title}</h3>
                <p className="project-simple-summary">{project.summary}</p>
                <nav className="project-simple-actions" aria-label={`${project.title} links`}>
                  <Link
                    href={`/projects/${project.slug}`}
                    locale={locale}
                    aria-label={`${locale === 'id' ? 'Lihat detail' : 'View details'}: ${project.title}`}
                    title={locale === 'id' ? 'Lihat detail' : 'View details'}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </Link>
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${locale === 'id' ? 'Buka website' : 'Open website'}: ${project.title}`}
                      title={locale === 'id' ? 'Buka website' : 'Open website'}
                    >
                      <Globe size={16} aria-hidden="true" />
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`GitHub: ${project.title}`}
                      title="GitHub"
                    >
                      <GitBranch size={16} aria-hidden="true" />
                    </a>
                  )}
                </nav>
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
