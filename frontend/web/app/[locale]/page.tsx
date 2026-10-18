import {
  ArrowDown,
  Award,
  ArrowUpRight,
  Code2,
  Eye,
  Globe,
  Layers3,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Music2,
  PlugZap,
  X as XIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation';
import { ContactForm } from '../../components/public-forms';
import { Reveal } from '../../components/motion';
import { ProjectsBrowser } from '../../components/projects-browser';
import { ExperienceTimeline } from '../../components/experience-timeline';
import { HeroTyping } from '../../components/hero-typing';
import { ScrollText } from '../../components/scroll-text';
import {
  AvailabilityBadge,
  GitHubActivity,
  NewsletterForm,
} from '../../components/feature-widgets';
import {
  queryString,
  safeGet,
  type ApiList,
  type Experience,
  type Post,
  type Profile,
  type Project,
  type Skill,
  type SiteSettings,
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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date))
    : locale === 'id'
      ? 'Baru'
      : 'New';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const localizedText = (value: unknown, locale: string) => {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return '';
  const text = value[locale] ?? value.en ?? value.id;
  return typeof text === 'string' ? text : '';
};

const settingRecords = (value: unknown) => (Array.isArray(value) ? value.filter(isRecord) : []);

const experiencePeriod = (start: string, end: string | null, locale: string) => {
  const startDate = new Date(start);
  const startYear = startDate.getFullYear();
  if (!end) {
    return `${startYear}–${locale === 'id' ? 'Sekarang' : 'Now'} (${locale === 'id' ? 'sampai saat ini' : 'to date'})`;
  }

  const endDate = new Date(end);
  const days = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1);
  if (days < 60) {
    return `${startYear}–${endDate.getFullYear()} (${days} ${locale === 'id' ? 'hari' : days === 1 ? 'day' : 'days'})`;
  }

  let months = (endDate.getFullYear() - startYear) * 12 + endDate.getMonth() - startDate.getMonth();
  if (endDate.getDate() < startDate.getDate()) months -= 1;
  months = Math.max(1, months);
  const duration =
    months >= 12
      ? `${Math.floor(months / 12)} ${locale === 'id' ? 'tahun' : Math.floor(months / 12) === 1 ? 'year' : 'years'}`
      : `${months} ${locale === 'id' ? 'bulan' : months === 1 ? 'month' : 'months'}`;
  return `${startYear}–${endDate.getFullYear()} (${duration})`;
};

const experienceTypeLabel = (type: string, locale: string) => {
  const labels =
    locale === 'id'
      ? { WORK: 'Pekerjaan', ORGANIZATION: 'Organisasi', EDUCATION: 'Pendidikan' }
      : { WORK: 'Work', ORGANIZATION: 'Organization', EDUCATION: 'Education' };
  return labels[type as keyof typeof labels] ?? type;
};

const socialLabel = (name: string) => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const labels: Record<string, string> = {
    whatsapp: 'WA',
    wa: 'WA',
    instagram: 'IG',
    ig: 'IG',
    facebook: 'FB',
    fb: 'FB',
    github: 'GitHub',
    linktree: 'Linktree',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    twitter: 'X',
    x: 'X',
    website: 'Website',
  };
  return labels[key] ?? name;
};

const socialIcon = (name: string) => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'instagram' || key === 'ig')
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.6" cy="6.6" r="1" fill="currentColor" />
      </svg>
    );
  if (key === 'facebook' || key === 'fb')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.9H7v3.1h2.8v8h3.7Z" />
      </svg>
    );
  if (key === 'linkedin')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5.2 8.6a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM3.4 10h3.6v10.6H3.4V10Zm5.8 0h3.4v1.5h.1a3.7 3.7 0 0 1 3.3-1.8c3.5 0 4.1 2.3 4.1 5.2v5.7h-3.6v-5c0-1.2 0-2.8-1.8-2.8s-2 1.3-2 2.7v5.1H9.2V10Z" />
      </svg>
    );
  if (key === 'youtube')
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 8.1a2.6 2.6 0 0 0-1.8-1.8C17.6 5.9 12 5.9 12 5.9s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.1 27 27 0 0 0 2.6 12 27 27 0 0 0 3 15.9a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.2.4 7.2.4s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.9 27 27 0 0 0-.4-3.9Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="m10 15 5-3-5-3v6Z" fill="currentColor" />
      </svg>
    );
  if (key === 'github')
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .9A11.1 11.1 0 0 0 8.5 22.5c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.1 11.1 0 0 0 12 .9Z" />
      </svg>
    );

  const Icon =
    key === 'whatsapp' || key === 'wa'
      ? MessageCircle
      : key === 'tiktok'
        ? Music2
        : key === 'twitter' || key === 'x'
          ? XIcon
          : Globe;
  return <Icon size={17} strokeWidth={1.8} aria-hidden="true" />;
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const [profile, projects, skills, experiences, posts, settings] = await Promise.all([
    safeGet<Profile>('/profile', fallbackProfile, 120),
    safeGet<ApiList<Project>>(
      `/projects${queryString({ page: 1, limit: 100 })}`,
      emptyList<Project>(),
      60,
    ),
    safeGet<Skill[]>('/skills', [], 300),
    safeGet<Experience[]>('/experiences', [], 300),
    safeGet<ApiList<Post>>(`/posts${queryString({ page: 1, limit: 6 })}`, emptyList<Post>(), 120),
    safeGet<SiteSettings>('/settings/public', [], 60),
  ]);
  const serviceSetting = settings.find((setting) => setting.key === 'services')?.value;
  const awardSetting = settings.find((setting) => setting.key === 'awards')?.value;
  const services = settingRecords(serviceSetting)
    .map((entry, index) => ({
      id: typeof entry.id === 'string' ? entry.id : `service-${index}`,
      title: localizedText(entry.title, locale),
      description: localizedText(entry.description, locale),
    }))
    .filter((service) => service.title && service.description);
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
  const featureSettings = settings.find((setting) => setting.key === 'features')?.value;
  const publicFeatures: Record<string, unknown> = isRecord(featureSettings) ? featureSettings : {};
  const skillGroups = Object.entries(
    skills.reduce<Record<string, Skill[]>>((groups, skill) => {
      (groups[skill.category] ??= []).push(skill);
      return groups;
    }, {}),
  );
  const toolItems = skillGroups.flatMap(([, items]) => items);
  const rawHeadline = profile.headline.trim();
  const profileSummary = profile.bio
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const isHeadlineLongBio = rawHeadline.length > 70 && profileSummary.length < 40;
  const roleSubtitle = isHeadlineLongBio
    ? locale === 'id'
      ? 'Web Developer & Mahasiswa Teknik Informatika'
      : 'Web Developer & Informatics Engineering Student'
    : rawHeadline ||
      (locale === 'id'
        ? 'Web Developer & Mahasiswa Teknik Informatika'
        : 'Web Developer & Informatics Engineering Student');
  const aboutSummary = /(?:pnpm|npm|yarn)\s+--filter/i.test(profileSummary)
    ? locale === 'id'
      ? 'Saya berfokus pada pengembangan web, antarmuka yang intuitif, dan pengalaman digital yang bermanfaat.'
      : 'I focus on web development, intuitive interfaces, and useful digital experiences.'
    : isHeadlineLongBio
      ? rawHeadline
      : profileSummary.length > 25
        ? profileSummary
        : locale === 'id'
          ? 'Saya merancang dan membangun website modern, aplikasi web, dan antarmuka pengguna yang cepat, rapi, serta mudah digunakan.'
          : 'I design and build modern websites, web applications, and user interfaces that are fast, clean, and easy to use.';
  const aboutTopics = services.length
    ? services.slice(0, 3).map((service) => service.title)
    : skillGroups.slice(0, 3).map(([category]) => category);
  const aboutShortcuts = [
    { label: t('sections.services'), href: '/services', icon: PlugZap },
    { label: t('sections.experience'), href: '/experience', icon: Layers3 },
    { label: t('sections.projects'), href: '/projects', icon: Monitor },
    { label: t('sections.awards'), href: '/awards', icon: Award },
    { label: t('sections.blog'), href: '/journal', icon: Code2 },
    { label: t('sections.contact'), href: '/contact', icon: Mail },
  ];
  const socialLinks = Object.entries({
    github: 'https://github.com/rafibudiansyah12',
    ...Object.fromEntries(
      Object.entries(profile.socialLinks ?? {}).filter(
        ([name, url]) => name.toLowerCase() !== 'email' && url.startsWith('http'),
      ),
    ),
  });
  const serviceSkillHighlights = [
    ...services.slice(0, 3).map((item) => ({
      title: item.title,
      detail: item.description,
      href: '#services',
    })),
    ...skills.slice(0, 5).map((item) => ({
      title: item.name,
      detail: item.category,
      href: '#tools',
    })),
  ];
  const heroHighlightGroups = [
    {
      id: 'services',
      heading: locale === 'id' ? 'Keahlian' : 'Skills',
      items: serviceSkillHighlights.length
        ? serviceSkillHighlights
        : [
            {
              title: locale === 'id' ? 'Lihat layanan & tools' : 'View services & tools',
              detail: locale === 'id' ? 'Keahlian yang saya gunakan' : 'Skills I work with',
              href: '#services',
            },
          ],
    },
    {
      id: 'projects',
      heading: locale === 'id' ? 'Proyek' : 'Projects',
      items: projects.items.length
        ? projects.items.slice(0, 5).map((item) => ({
            title: item.title,
            detail: item.summary,
            href: `/${locale}/projects/${item.slug}`,
          }))
        : [
            {
              title: locale === 'id' ? 'Lihat proyek' : 'View projects',
              detail: locale === 'id' ? 'Kumpulan proyek pilihan' : 'A selection of projects',
              href: '#projects',
            },
          ],
    },
  ];
  return (
    <main>
      <section className="hero section-shell" id="top">
        <div className="hero-content">
          <div className="hero-intro-meta">
            <p className="hero-greeting">{t('hero.greeting')}</p>
            {profile.availability && publicFeatures.openForWork !== false && (
              <AvailabilityBadge locale={locale} />
            )}
          </div>
          <h1 className="hero-name">
            {t('hero.name')
              .replace(/\.$/, '')
              .split(' ')
              .map((name, index) => (
                <span className="hero-name-word" key={`${name}-${index}`}>
                  {name}
                </span>
              ))}
          </h1>
          <HeroTyping
            locale={locale}
            roles={
              locale === 'id'
                ? ['Pengembang Web', 'Frontend Developer', 'Desainer UI/UX']
                : ['Web Developer', 'Frontend Developer', 'UI/UX Designer']
            }
          />
          <div className="hero-cta">
            <a href="#projects" className="button-primary">
              {t('hero.projects')} <ArrowDown size={15} />
            </a>
            <a href="#contact" className="button-quiet">
              {t('hero.contact')}
            </a>
          </div>
          {socialLinks.length > 0 && (
            <nav
              className="hero-socials"
              aria-label={locale === 'id' ? 'Media sosial' : 'Social links'}
            >
              {socialLinks.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={socialLabel(name)}
                  title={socialLabel(name)}
                >
                  {socialIcon(name)}
                </a>
              ))}
            </nav>
          )}
        </div>
        <aside className="hero-highlights" aria-label={locale === 'id' ? 'Sorotan' : 'Highlights'}>
          <div className="hero-highlight-grid">
            {heroHighlightGroups.map((group) => (
              <section className="hero-highlight-column" key={group.id}>
                <a className="hero-highlight-heading" href={`#${group.id}`}>
                  {group.heading}
                </a>
                <div className="hero-highlight-window">
                  <div className="hero-highlight-track">
                    {[false, true].map((isClone) => (
                      <div
                        className={`hero-highlight-list${isClone ? ' is-clone' : ''}`}
                        aria-hidden={isClone || undefined}
                        key={isClone ? 'clone' : 'items'}
                      >
                        {group.items.map((item, index) => (
                          <a
                            className="hero-highlight-item"
                            href={item.href}
                            tabIndex={isClone ? -1 : undefined}
                            key={`${item.title}-${index}`}
                          >
                            <span className="hero-highlight-copy">
                              <strong>{item.title}</strong>
                              <span>{item.detail}</span>
                            </span>
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </aside>
      </section>
      <section className="section-shell section-block" id="about">
        <div className="section-heading section-heading-more">
          <Reveal>
            <h2>
              <ScrollText>{t('about.title')}</ScrollText>
            </h2>
          </Reveal>
          <Link className="section-more-link" href="/about" locale={locale}>
            {locale === 'id' ? 'Lihat selengkapnya' : 'See more'}{' '}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="about-bento-grid" id="about-details">
          <Reveal className="about-profile-card">
            <div className="about-profile-top">
              <div className="about-identity">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Rafi Budiansyah" className="about-avatar" />
                ) : (
                  <span className="about-avatar-fallback" aria-hidden="true">
                    R
                  </span>
                )}
                <div className="about-identity-copy">
                  <span className="about-summary-kicker">
                    {locale === 'id' ? 'SIAPA SAYA' : 'WHO I AM'}
                  </span>
                  <h3>Rafi Budiansyah</h3>
                  <small>{roleSubtitle}</small>
                </div>
              </div>
              <p className="about-bio-text">{aboutSummary}</p>
              <div className="about-highlights-grid">
                <div className="about-highlight-box">
                  <span>{locale === 'id' ? 'FOKUS UTAMA' : 'MAIN FOCUS'}</span>
                  <strong>Full-Stack Web & UI/UX</strong>
                </div>
                <div className="about-highlight-box">
                  <span>{locale === 'id' ? 'PENDIDIKAN' : 'EDUCATION'}</span>
                  <strong>
                    {locale === 'id' ? 'S1 Teknik Informatika' : 'Informatics Engineering'}
                  </strong>
                </div>
                <div className="about-highlight-box">
                  <span>{locale === 'id' ? 'DOMISILI' : 'LOCATION'}</span>
                  <strong>{profile.location || 'Jakarta, Indonesia'}</strong>
                </div>
                <div className="about-highlight-box">
                  <span>{locale === 'id' ? 'STATUS' : 'STATUS'}</span>
                  <strong className="about-status-inline">
                    <i aria-hidden="true" />{' '}
                    {locale === 'id' ? 'Siap Kolaborasi' : 'Available for Work'}
                  </strong>
                </div>
              </div>
            </div>
            <div className="about-summary-footer">
              <div className="about-mini-socials">
                {socialLinks.slice(0, 4).map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={socialLabel(name)}
                    title={socialLabel(name)}
                  >
                    {socialIcon(name)}
                  </a>
                ))}
              </div>
              {profile.cvUrl ? (
                <a className="about-cv-btn" href={profile.cvUrl} target="_blank" rel="noreferrer">
                  {locale === 'id' ? 'Lihat CV' : 'View CV'} <ArrowUpRight size={14} />
                </a>
              ) : publicFeatures.cvPdf !== false ? (
                <Link className="about-cv-btn" href="/resume" locale={locale as 'id' | 'en'}>
                  {locale === 'id' ? 'Buka CV' : 'Open CV'} <ArrowUpRight size={14} />
                </Link>
              ) : null}
            </div>
          </Reveal>

          <div className="about-bento-right">
            <div className="about-metrics-grid">
              {[
                {
                  value: `${projects.total || projects.items.length}+`,
                  label: locale === 'id' ? 'Proyek Selesai' : 'Projects Completed',
                  note: locale === 'id' ? 'Web & aplikasi' : 'Web & apps',
                  href: '/projects',
                  icon: Monitor,
                },
                {
                  value: `${skills.length}+`,
                  label: locale === 'id' ? 'Tools & Tech' : 'Tools & Tech',
                  note: `${skillGroups.length || 1} ${locale === 'id' ? 'kategori' : 'categories'}`,
                  href: '/about#tools',
                  icon: Code2,
                },
                {
                  value: `${services.length}+`,
                  label: locale === 'id' ? 'Layanan' : 'Services',
                  note: locale === 'id' ? 'Solusi digital' : 'Digital solutions',
                  href: '/services',
                  icon: PlugZap,
                },
                {
                  value: `${awards.length}+`,
                  label: locale === 'id' ? 'Penghargaan & Sertif' : 'Awards & Certs',
                  note: `${experiences.length} ${locale === 'id' ? 'riwayat' : 'experiences'}`,
                  href: '/awards',
                  icon: Award,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link
                    href={stat.href}
                    locale={locale as 'id' | 'en'}
                    className="about-metric-card"
                    key={stat.label}
                  >
                    <div className="about-metric-top">
                      <span className="about-metric-icon">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <ArrowUpRight size={14} className="about-shortcut-arrow" aria-hidden="true" />
                    </div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                    <small>{stat.note}</small>
                  </Link>
                );
              })}
            </div>

            <div className="about-pillars-grid">
              <div className="about-pillar-card about-tools-pillar">
                <div className="about-pillar-head">
                  <span>{locale === 'id' ? 'TOOLS & KEAHLIAN' : 'TOOLS & SKILLS'}</span>
                  <Link href="/about#tools" locale={locale as 'id' | 'en'}>
                    {locale === 'id' ? 'Semua' : 'All'} ({skills.length}) <ArrowUpRight size={12} />
                  </Link>
                </div>
                <div className="about-service-list">
                  {skills.slice(0, 4).map((skill, index) => {
                    const FallbackIcon = [Code2, Monitor, Layers3, PlugZap][index % 4] ?? Code2;
                    const level =
                      typeof skill.level === 'number'
                        ? Math.min(100, Math.max(15, skill.level))
                        : 90 - index * 4;
                    return (
                      <Link
                        href="/about#tools"
                        locale={locale as 'id' | 'en'}
                        className="about-service-item about-tool-item"
                        key={skill.id}
                      >
                        <span className="about-service-badge about-tool-badge" aria-hidden="true">
                          {skill.icon?.startsWith('http') ? (
                            <img src={skill.icon} alt="" loading="lazy" />
                          ) : (
                            <FallbackIcon size={15} />
                          )}
                        </span>
                        <div className="about-service-copy about-tool-copy">
                          <div className="about-tool-title-row">
                            <strong>{skill.name}</strong>
                            {skill.category && <em>{skill.category}</em>}
                          </div>
                          <div className="about-tool-mini-track" aria-hidden="true">
                            <i style={{ width: `${level}%` }} />
                          </div>
                        </div>
                        <span className="about-service-num about-tool-pct">{level}%</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="about-pillar-card about-services-pillar">
                <div className="about-pillar-head">
                  <span>{locale === 'id' ? 'LAYANAN UNGGULAN' : 'TOP SERVICES'}</span>
                  <Link href="/services" locale={locale as 'id' | 'en'}>
                    {locale === 'id' ? 'Semua' : 'All'} ({services.length}){' '}
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
                <div className="about-service-list">
                  {services.slice(0, 4).map((service, index) => {
                    const ServiceIcon = [Monitor, Layers3, PlugZap, Code2][index % 4] ?? Monitor;
                    return (
                      <Link
                        href="/services"
                        locale={locale as 'id' | 'en'}
                        className="about-service-item"
                        key={service.id}
                      >
                        <span className="about-service-badge" aria-hidden="true">
                          <ServiceIcon size={15} />
                        </span>
                        <div className="about-service-copy">
                          <strong>{service.title}</strong>
                          <small>{service.description}</small>
                        </div>
                        <span className="about-service-num" aria-hidden="true">
                          0{index + 1}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {toolItems.length > 0 && (
              <div className="about-tools-strip" id="tools">
                <div className="about-pillar-head">
                  <span>{locale === 'id' ? 'TECH STACK YANG DIGUNAKAN' : 'TECH STACK IN USE'}</span>
                  <Link href="/about#tools" locale={locale as 'id' | 'en'}>
                    {locale === 'id' ? 'Detail level' : 'Skill levels'} <ArrowUpRight size={12} />
                  </Link>
                </div>
                <div className="tool-marquee tool-marquee-compact" aria-label={t('sections.tools')}>
                  <div className="tool-marquee-track">
                    {[0, 1].map((copy) => (
                      <div className="tool-marquee-group" aria-hidden={copy === 1} key={copy}>
                        {toolItems.map((skill) => (
                          <div className="tool-pill" key={`${copy}-${skill.id}`}>
                            <span className="tool-pill-mark" aria-hidden="true">
                              {skill.icon?.startsWith('http') ? (
                                <img src={skill.icon} alt="" loading="lazy" />
                              ) : (
                                skill.name.slice(0, 1).toUpperCase()
                              )}
                            </span>
                            <span>{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell section-block" id="experience">
        <div className="section-heading section-heading-more">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.experience')}</ScrollText>
            </h2>
          </Reveal>
          <Link className="section-more-link" href="/experience" locale={locale}>
            {locale === 'id' ? 'Lihat selengkapnya' : 'See more'}{' '}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div id="experience-details">
          {experiences.length > 0 ? (
            <ExperienceTimeline
              locale={locale}
              items={experiences.slice(0, 6).map((item) => ({
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

      <section className="section-shell section-block services-section" id="services">
        <div className="section-heading section-heading-more">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.services')}</ScrollText>
            </h2>
          </Reveal>
          <Link className="section-more-link" href="/services" locale={locale}>
            {locale === 'id' ? 'Lihat selengkapnya' : 'See more'}{' '}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="service-grid" id="services-details">
          {services.length > 0 ? (
            services.slice(0, 6).map((service, index) => {
              const Icon = [Monitor, Layers3, PlugZap][index % 3] ?? Monitor;
              return (
                <article
                  className={index === 0 ? 'service-card service-card-lead' : 'service-card'}
                  key={service.id}
                >
                  <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="section-empty">
              {locale === 'id'
                ? 'Layanan akan tampil di sini setelah ditambahkan ke database.'
                : 'Services will appear here after they are added to the database.'}
            </p>
          )}
        </div>
      </section>

      <section className="section-shell section-block projects-section" id="projects">
        <div className="section-heading section-heading-more">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.projects')}</ScrollText>
            </h2>
          </Reveal>
          <Link className="section-more-link" href="/projects" locale={locale}>
            {locale === 'id' ? 'Lihat selengkapnya' : 'See more'}{' '}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div id="projects-details">
          {projects.items.length > 0 ? (
            <ProjectsBrowser projects={projects.items.slice(0, 6)} locale={locale as 'id' | 'en'} />
          ) : (
            <p className="section-empty">
              {locale === 'id'
                ? 'Proyek akan tampil di sini setelah ditambahkan ke database.'
                : 'Projects will appear here after they are added to the database.'}
            </p>
          )}
        </div>
      </section>

      <section className="section-shell section-block awards-section" id="awards">
        <div className="section-heading section-heading-more">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.awards')}</ScrollText>
            </h2>
          </Reveal>
          <Link className="section-more-link" href="/awards" locale={locale}>
            {locale === 'id' ? 'Lihat selengkapnya' : 'See more'}{' '}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="award-grid" id="awards-details">
          {awards.length > 0 ? (
            awards.slice(0, 6).map((item) => (
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

      <section className="section-shell section-block journal-section" id="journal">
        <div className="section-heading section-heading-more">
          <Reveal>
            <h2>
              <ScrollText>{locale === 'id' ? 'Jurnal' : 'Journal'}</ScrollText>
            </h2>
          </Reveal>
          <div className="journal-heading-side">
            <Link className="section-more-link" href="/journal" locale={locale}>
              {locale === 'id' ? 'Lihat selengkapnya' : 'See more'}{' '}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="post-list" id="journal-details">
          {posts.items.length > 0 ? (
            posts.items.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.07}>
                <Link href={`/blog/${post.slug}`} locale={locale} className="blog-card">
                  <span className="blog-cover">
                    {post.coverUrl ? (
                      <img src={post.coverUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="blog-cover-fallback" aria-hidden="true">
                        {post.title.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    {post.tags[0] && <em className="blog-category">{post.tags[0]}</em>}
                  </span>
                  <span className="blog-body">
                    <span className="blog-meta">
                      <span className="blog-author">
                        <i aria-hidden="true">R</i> Rafi Budiansyah
                      </span>
                      <time dateTime={post.publishedAt ?? undefined}>
                        {localeDate(post.publishedAt, locale)}
                      </time>
                    </span>
                    <strong>{post.title}</strong>
                    <small>{post.excerpt}</small>
                    <span className="blog-read">
                      <Eye size={15} aria-hidden="true" />{' '}
                      {locale === 'id' ? 'Baca artikel' : 'Read article'}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))
          ) : (
            <p className="section-empty">
              {locale === 'id'
                ? 'Tulisan blog akan tampil di sini setelah diterbitkan.'
                : 'Blog posts will appear here after they are published.'}
            </p>
          )}
        </div>
      </section>

      <section className="section-shell section-block contact-section" id="contact">
        <div className="contact-copy">
          <Reveal className="contact-copy-inner">
            <div>
              <h2>
                <ScrollText>{locale === 'id' ? 'Kontak Kami' : 'Contact Us'}</ScrollText>
              </h2>
              <h3 className="contact-tagline">
                {locale === 'id'
                  ? 'Mari buat sesuatu yang berarti.'
                  : 'Let’s make something meaningful.'}
              </h3>
              <p>
                {locale === 'id'
                  ? 'Ceritakan rencana, ide produk, atau tantangan teknis Anda. Kita bisa mulai dari diskusi santai untuk membangun solusi web yang cepat dan modern.'
                  : 'Tell me about your project idea or technical challenge. We can start with a simple chat to build a fast, modern web solution.'}
              </p>
            </div>

            <div className="contact-info-grid">
              <a
                className="contact-info-card"
                href={`mailto:${profile.socialLinks?.email || 'rafibudiansyah05@gmail.com'}`}
              >
                <span className="contact-info-icon" aria-hidden="true">
                  <Mail size={16} />
                </span>
                <div className="contact-info-text">
                  <span>{locale === 'id' ? 'EMAIL LANGSUNG' : 'DIRECT EMAIL'}</span>
                  <strong>{profile.socialLinks?.email || 'rafibudiansyah05@gmail.com'}</strong>
                </div>
              </a>

              <div className="contact-info-card">
                <span className="contact-info-icon" aria-hidden="true">
                  <MapPin size={16} />
                </span>
                <div className="contact-info-text">
                  <span>{locale === 'id' ? 'DOMISILI & KERJA' : 'LOCATION & WORK'}</span>
                  <strong>{profile.location || 'Jakarta, Indonesia'} • Remote</strong>
                </div>
              </div>

              <div className="contact-info-card">
                <span className="contact-info-icon" aria-hidden="true">
                  <Globe size={16} />
                </span>
                <div className="contact-info-text">
                  <span>{locale === 'id' ? 'STATUS KOLABORASI' : 'AVAILABILITY'}</span>
                  <strong className="contact-live-status">
                    <i aria-hidden="true" />
                    {locale === 'id' ? 'Freelance & Full-Time' : 'Freelance & Full-Time'}
                  </strong>
                </div>
              </div>

              <div className="contact-info-card">
                <span className="contact-info-icon" aria-hidden="true">
                  <MessageCircle size={16} />
                </span>
                <div className="contact-info-text">
                  <span>{locale === 'id' ? 'WAKTU RESPONS' : 'RESPONSE TIME'}</span>
                  <strong>
                    {locale === 'id' ? '< 24 Jam (Senin – Sabtu)' : '< 24 Hours (Mon – Sat)'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="contact-topics-box">
              <span>{locale === 'id' ? 'TOPIK DISKUSI POPULER' : 'POPULAR TOPICS'}</span>
              <div className="contact-topic-chips">
                {(locale === 'id'
                  ? [
                      'Pengembangan Web',
                      'Desain UI/UX',
                      'Sistem & API Backend',
                      'Optimasi Performa',
                      'Kolaborasi Tim',
                    ]
                  : [
                      'Web Development',
                      'UI/UX Design',
                      'Backend & APIs',
                      'Performance Audit',
                      'Team Collaboration',
                    ]
                ).map((topic) => (
                  <span key={topic} className="contact-topic-chip">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="contact-socials-footer">
              <span>{locale === 'id' ? 'TERHUBUNG DI SOSIAL MEDIA' : 'CONNECT ON SOCIAL'}</span>
              <div className="contact-links">
                {socialLinks.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-social"
                    aria-label={socialLabel(name)}
                    title={socialLabel(name)}
                  >
                    {socialIcon(name)}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <div id="contact-details">
          <Reveal delay={0.1} className="contact-panel">
            <div className="contact-panel-head">
              <h3 className="contact-panel-title">
                {locale === 'id' ? 'Hubungi Saya' : 'Get in Touch'}
              </h3>
              <p className="contact-panel-sub">
                {locale === 'id'
                  ? 'Isi formulir di bawah ini dan pesan Anda akan langsung terkirim.'
                  : 'Fill out the form below and your message will be sent directly.'}
              </p>
            </div>
            <ContactForm />
          </Reveal>
        </div>
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
