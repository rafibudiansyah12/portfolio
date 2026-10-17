import { ArrowDown, ArrowUpRight, Code2, MapPin, Sparkles, TerminalSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation';
import { ContactForm, GuestbookForm } from '../../components/public-forms';
import { Reveal, Stagger, StaggerItem } from '../../components/motion';
import { ProjectsBrowser } from '../../components/projects-browser';
import {
  AvailabilityBadge,
  GitHubActivity,
  GuestbookLive,
  NewsletterForm,
} from '../../components/feature-widgets';
import {
  queryString,
  safeGet,
  type ApiList,
  type Experience,
  type GuestbookEntry,
  type Post,
  type Profile,
  type Project,
  type Skill,
  type SiteSettings,
  type Testimonial,
} from '../lib/api';

const emptyList = <T,>(): ApiList<T> => ({
  items: [],
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});
const fallbackProfile: Profile = {
  headline: 'Web Developer & Informatics Engineering student',
  bio: '',
  photoUrl: null,
  cvUrl: null,
  location: 'Indonesia',
  availability: false,
  socialLinks: {},
};
const localeDate = (date: string | null, locale: string) =>
  date
    ? new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        month: 'short',
        year: 'numeric',
      }).format(new Date(date))
    : 'Now';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const [profile, projects, skills, experiences, posts, guestbook, testimonials, settings] =
    await Promise.all([
      safeGet<Profile>('/profile', fallbackProfile, 120),
      safeGet<ApiList<Project>>(
        `/projects${queryString({ page: 1, limit: 100 })}`,
        emptyList<Project>(),
        60,
      ),
      safeGet<Skill[]>('/skills', [], 300),
      safeGet<Experience[]>('/experiences', [], 300),
      safeGet<ApiList<Post>>(`/posts${queryString({ page: 1, limit: 3 })}`, emptyList<Post>(), 120),
      safeGet<ApiList<GuestbookEntry>>(
        `/guestbook${queryString({ page: 1, limit: 4 })}`,
        emptyList<GuestbookEntry>(),
        60,
      ),
      safeGet<ApiList<Testimonial>>(
        `/testimonials${queryString({ page: 1, limit: 3 })}`,
        emptyList<Testimonial>(),
        120,
      ),
      safeGet<SiteSettings>('/settings/public', [], 300),
    ]);
  const featureSettings = settings.find((setting) => setting.key === 'features')?.value;
  const publicFeatures: Record<string, unknown> =
    typeof featureSettings === 'object' &&
    featureSettings !== null &&
    !Array.isArray(featureSettings)
      ? (featureSettings as Record<string, unknown>)
      : {};
  const skillGroups = Object.entries(
    skills.reduce<Record<string, Skill[]>>((groups, skill) => {
      (groups[skill.category] ??= []).push(skill);
      return groups;
    }, {}),
  );
  const featuredProject = projects.items.find((project) => project.featured) ?? projects.items[0];
  const focusSkills = skills
    .slice(0, 3)
    .map((skill) => skill.name)
    .join(' · ');
  return (
    <main>
      <section
        className={featuredProject ? 'hero section-shell' : 'hero section-shell hero-solo'}
        id="top"
      >
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span className="status-dot" />
            {t('hero.eyebrow')}
          </p>
          <p className="hero-greeting">{t('hero.greeting')}</p>
          <h1>
            {t('hero.name')
              .replace(/\.$/, '')
              .split(' ')
              .map((name) => (
                <span key={name}>{name}</span>
              ))}
          </h1>
          <p className="hero-tagline">{profile.headline || t('hero.tagline')}</p>
          {profile.availability && publicFeatures.openForWork !== false && <AvailabilityBadge />}
          <div className="hero-cta">
            <a href="#projects" className="button-primary">
              {t('hero.projects')} <ArrowDown size={15} />
            </a>
            <a href="#contact" className="button-quiet">
              {t('hero.contact')}
            </a>
          </div>
          <div className="hero-bottomline">
            <span>
              <i />
              {profile.availability ? t('hero.available') : profile.location || 'Indonesia'}
            </span>
          </div>
        </div>
        {featuredProject && (
          <Link
            className="hero-project"
            href={`/projects/${featuredProject.slug}`}
            locale={locale}
            aria-label={`${t('projects.read')}: ${featuredProject.title}`}
          >
            <span className="hero-project-label">
              {featuredProject.featured ? t('hero.selectedProject') : t('hero.recentProject')}
            </span>
            {featuredProject.thumbnailUrl ? (
              <img src={featuredProject.thumbnailUrl} alt={`${featuredProject.title} preview`} />
            ) : (
              <div className="hero-project-art">
                <Code2 size={32} aria-hidden="true" />
                <span>
                  {featuredProject.skills
                    .slice(0, 3)
                    .map(({ skill }) => skill.name)
                    .join(' · ')}
                </span>
              </div>
            )}
            <span className="hero-project-caption">
              <span>
                <strong>{featuredProject.title}</strong>
                <small>{featuredProject.summary}</small>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </Link>
        )}
      </section>
      <section className="section-shell section-block" id="about">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">01 / {t('about.eyebrow')}</p>
            <h2>{t('about.title')}</h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="section-intro">{profile.bio || t('about.fallback')}</p>
          </Reveal>
        </div>
        <div className="bento-grid">
          <Reveal className="bento-card bento-about">
            <span className="bento-label">
              <Sparkles size={14} /> THE PERSON
            </span>
            <p>{profile.bio || t('about.fallback')}</p>
            {profile.cvUrl && (
              <a className="about-cv-link" href={profile.cvUrl} target="_blank" rel="noreferrer">
                Download CV <ArrowUpRight size={14} />
              </a>
            )}
            {publicFeatures.cvPdf !== false && (
              <a className="about-cv-link" href={`/${locale}/resume`}>
                Generate CV PDF <ArrowUpRight size={14} />
              </a>
            )}
            <span className="bento-signature">R.</span>
          </Reveal>
          <Reveal delay={0.08} className="bento-card bento-location">
            <span className="bento-label">
              <MapPin size={14} /> BASED IN
            </span>
            <strong>{profile.location || 'Indonesia'}</strong>
          </Reveal>
          <Reveal delay={0.16} className="bento-card bento-focus">
            <span className="bento-label">
              <Code2 size={14} /> CURRENT FOCUS
            </span>
            <strong>{focusSkills || profile.headline}</strong>
          </Reveal>
          {projects.total > 0 && (
            <Reveal delay={0.24} className="bento-card bento-stat">
              <span className="bento-label">SELECTED WORK</span>
              <strong>{String(projects.total).padStart(2, '0')}</strong>
              <span>projects documented</span>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section-shell section-block skills-section" id="skills">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">02 / CAPABILITIES</p>
            <h2>{t('sections.skills')}</h2>
          </Reveal>
          <Reveal>
            <p className="section-intro">
              A flexible toolkit for shaping ideas into polished, dependable products.
            </p>
          </Reveal>
        </div>
        <div className="skill-groups">
          <Stagger className="skill-groups-inner">
            {skillGroups.map(([category, items]) => (
              <StaggerItem key={category} className="skill-group">
                <div className="skill-category">
                  <span>{category}</span>
                  <span>{String(items.length).padStart(2, '0')}</span>
                </div>
                <div className="skill-list">
                  {items.map((skill) => (
                    <div className="skill-row" key={skill.id}>
                      <span>
                        {skill.icon && <span className="skill-icon">{skill.icon}</span>}
                        {skill.name}
                      </span>
                      {skill.level !== null && (
                        <span className="skill-level">
                          <i style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          {!skills.length && <p className="quiet-copy">Skills will appear here soon.</p>}
        </div>
      </section>

      <section className="section-shell section-block" id="experience">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">03 / {t('sections.experience')}</p>
            <h2>
              Learning by
              <br />
              <span>making things.</span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="section-intro">
              The roles, teams, and learning experiences that have shaped how I work.
            </p>
          </Reveal>
        </div>
        <div className="timeline">
          {experiences.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.06} className="timeline-item">
              <span className="timeline-marker">{String(index + 1).padStart(2, '0')}</span>
              <div className="timeline-main">
                <span className="timeline-type">{item.type}</span>
                <h3>{item.title}</h3>
                <strong>{item.organization}</strong>
                <p>{item.description.replace(/<[^>]*>/g, ' ')}</p>
              </div>
              <span className="timeline-date">
                {localeDate(item.startDate, locale)} — {localeDate(item.endDate, locale)}
              </span>
            </Reveal>
          ))}
          {!experiences.length && <p className="quiet-copy">Experience will appear here soon.</p>}
        </div>
      </section>

      <section className="section-shell section-block projects-section" id="projects">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">04 / SELECTED WORK</p>
            <h2>
              {t('sections.projects')}
              <span className="heading-dot">.</span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="section-intro">
              Each project starts with a problem worth solving. Here are a few of those stories.
            </p>
          </Reveal>
        </div>
        <ProjectsBrowser projects={projects.items} locale={locale as 'id' | 'en'} />
      </section>

      {publicFeatures.blog !== false && (
        <section className="section-shell section-block journal-section" id="journal">
          <div className="section-heading">
            <Reveal>
              <p className="eyebrow">05 / IDEAS IN PROGRESS</p>
              <h2>{t('sections.blog')}</h2>
            </Reveal>
            <Reveal>
              <p className="section-intro">
                Notes from the process: engineering, interface design, and lessons learned.
              </p>
            </Reveal>
          </div>
          <div className="post-list">
            {posts.items.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.07}>
                <Link href={`/blog/${post.slug}`} locale={locale} className="post-row">
                  <span className="post-number">0{index + 1}</span>
                  <span className="post-copy">
                    <strong>{post.title}</strong>
                    <small>{post.excerpt}</small>
                    <span className="post-tags">
                      {post.tags.slice(0, 3).map((tag) => (
                        <i key={tag}>{tag}</i>
                      ))}
                    </span>
                  </span>
                  <time>{localeDate(post.publishedAt, locale)}</time>
                  <ArrowUpRight size={19} />
                </Link>
              </Reveal>
            ))}
            {!posts.items.length && <div className="empty-note">The journal is warming up.</div>}
          </div>
        </section>
      )}

      {testimonials.items.length > 0 && (
        <section className="section-shell quote-section">
          <div className="quote-mark">“</div>
          <div className="quote-list">
            {testimonials.items.map((item) => (
              <blockquote key={item.id}>
                <p>{item.message}</p>
                <footer>
                  <strong>{item.authorName}</strong>
                  {item.authorRole && <span> · {item.authorRole}</span>}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {publicFeatures.guestbook !== false && (
        <section className="section-shell section-block community-section" id="guestbook">
          <div className="section-heading">
            <Reveal>
              <p className="eyebrow">06 / LEAVE A TRACE</p>
              <h2>{t('sections.guestbook')}</h2>
            </Reveal>
            <Reveal>
              <p className="section-intro">
                A small corner for kind words, ideas, or just saying hello.
              </p>
            </Reveal>
          </div>
          <div className="community-grid">
            {publicFeatures.guestbookRealtime !== false && (
              <GuestbookLive since={new Date().toISOString()} />
            )}
            <div className="guestbook-list">
              {guestbook.items.map((entry, index) => (
                <Reveal key={entry.id} delay={index * 0.05} className="guestbook-entry">
                  <span className="guestbook-avatar">{entry.name.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{entry.name}</strong>
                    <p>{entry.message}</p>
                    <time>{localeDate(entry.createdAt, locale)}</time>
                  </div>
                </Reveal>
              ))}
              {!guestbook.items.length && (
                <p className="quiet-copy">Be the first to leave a note.</p>
              )}
            </div>
            <Reveal className="guestbook-panel">
              <TerminalSquare size={18} />
              <h3>Say hello.</h3>
              <p>Every note is reviewed before it appears here.</p>
              <GuestbookForm />
            </Reveal>
          </div>
        </section>
      )}

      <section className="section-shell section-block contact-section" id="contact">
        <div className="contact-copy">
          <Reveal>
            <p className="eyebrow">07 / OPEN CHANNEL</p>
            <h2>
              {t('sections.contact')}
              <span className="heading-dot">.</span>
            </h2>
            <p>Have an idea, opportunity, or just want to compare notes? My inbox is open.</p>
            <div className="contact-links">
              {Object.entries(profile.socialLinks ?? {})
                .filter(([name]) => name.toLowerCase() !== 'email')
                .map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer">
                    {name} <ArrowUpRight size={14} />
                  </a>
                ))}
            </div>
            {profile.socialLinks?.email && (
              <a className="email-link" href={`mailto:${profile.socialLinks.email}`}>
                {profile.socialLinks.email}
              </a>
            )}
          </Reveal>
        </div>
        <Reveal delay={0.1} className="contact-panel">
          <span className="panel-index">LET’S MAKE SOMETHING MATTER</span>
          <ContactForm />
        </Reveal>
      </section>

      {publicFeatures.githubActivity === true && <GitHubActivity />}
      {publicFeatures.newsletter === true && (
        <section className="section-shell section-block">
          <NewsletterForm />
        </section>
      )}
    </main>
  );
}
