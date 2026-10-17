import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Link } from '../../../../i18n/navigation';
import { notFound } from 'next/navigation';
import { apiGet, type Project } from '../../../lib/api';
import { ViewCounter } from '../../../../components/view-counter';
import { Reveal } from '../../../../components/motion';
import { ProjectReactions } from '../../../../components/feature-widgets';
import { safeGet, type SiteSettings } from '../../../lib/api';

async function getProject(slug: string): Promise<Project | null> {
  try {
    return await apiGet<Project>(`/projects/${encodeURIComponent(slug)}`, 120);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project not found' };
  const settings = await safeGet<SiteSettings>('/settings/public', [], 300);
  const features = settings.find((setting) => setting.key === 'features')?.value;
  const dynamicOg =
    typeof features !== 'object' ||
    features === null ||
    !('dynamicOg' in features) ||
    features.dynamicOg !== false;
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      images: dynamicOg
        ? [`/${locale}/projects/${project.slug}/opengraph-image`]
        : project.thumbnailUrl
          ? [project.thumbnailUrl]
          : [],
    },
  };
}

export default async function ProjectCaseStudy({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const settings = await safeGet<SiteSettings>('/settings/public', [], 300);
  const featureValue = settings.find((setting) => setting.key === 'features')?.value;
  const features =
    typeof featureValue === 'object' && featureValue !== null
      ? (featureValue as Record<string, unknown>)
      : {};
  return (
    <main className="case-page section-shell">
      {features.viewCounter !== false && (
        <ViewCounter projectSlug={project.slug} path={`/${locale}/projects/${project.slug}`} />
      )}
      <Link className="back-link" href="/" locale={locale as 'id' | 'en'}>
        <ArrowLeft size={15} /> Back to selected work
      </Link>
      <header className="case-hero">
        <p className="eyebrow">CASE STUDY / {project.featured ? 'FEATURED' : 'PROJECT'}</p>
        <h1>
          {project.title}
          <span className="heading-dot">.</span>
        </h1>
        <p>{project.summary}</p>
        <div className="project-tags">
          {project.skills.map(({ skill }) => (
            <span key={skill.id}>{skill.name}</span>
          ))}
        </div>
        <div className="case-links">
          {project.demoUrl && (
            <a className="button-primary" href={project.demoUrl} target="_blank" rel="noreferrer">
              View live <ExternalLink size={15} />
            </a>
          )}
          {project.repoUrl && (
            <a className="button-quiet" href={project.repoUrl} target="_blank" rel="noreferrer">
              Source code <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </header>
      {project.thumbnailUrl && (
        <Reveal className="case-cover">
          <img src={project.thumbnailUrl} alt={`${project.title} cover`} fetchPriority="high" />
        </Reveal>
      )}
      {project.images?.map((image) => (
        <figure className="case-gallery" key={image.id}>
          <img
            src={image.media.url}
            alt={image.caption || `${project.title} project image`}
            loading="lazy"
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
      <div className="case-content">
        {(
          [
            ['01', 'The challenge', project.problem],
            ['02', 'The approach', project.solution],
            ['03', 'The outcome', project.result],
          ] as const
        ).map(([number, title, html]) => (
          <Reveal key={number} className="case-chapter">
            <span>{number}</span>
            <div>
              <h2>{title}</h2>
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </Reveal>
        ))}
      </div>
      <div className="case-next">
        <span>MORE SELECTED WORK</span>
        <Link href="/#projects" locale={locale as 'id' | 'en'}>
          Explore all projects <ArrowUpRight size={16} />
        </Link>
      </div>
      {features.projectReactions !== false && (
        <ProjectReactions slug={project.slug} initial={project.reactions} />
      )}
    </main>
  );
}
