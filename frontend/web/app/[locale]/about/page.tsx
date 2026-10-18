import { ArrowUpRight, Award, Code2, Layers3, MapPin, Monitor, PlugZap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '../../../i18n/navigation';
import { Reveal } from '../../../components/motion';
import { ScrollText } from '../../../components/scroll-text';
import {
  queryString,
  safeGet,
  type ApiList,
  type Experience,
  type Profile,
  type Project,
  type Skill,
  type SiteSettings,
} from '../../lib/api';
import {
  fallbackProfile,
  isRecord,
  localizedText,
  settingRecords,
  socialIcon,
  socialLabel,
} from '../../lib/portfolio-helpers';

const emptyProjects: ApiList<Project> = { items: [], page: 1, limit: 100, total: 0, totalPages: 0 };

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const [profile, projects, skills, experiences, settings] = await Promise.all([
    safeGet<Profile>('/profile', fallbackProfile, 120),
    safeGet<ApiList<Project>>(
      `/projects${queryString({ page: 1, limit: 100 })}`,
      emptyProjects,
      60,
    ),
    safeGet<Skill[]>('/skills', [], 300),
    safeGet<Experience[]>('/experiences', [], 300),
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
  const aboutSummary = isHeadlineLongBio
    ? rawHeadline
    : profileSummary.length > 25
      ? profileSummary
      : locale === 'id'
        ? 'Saya berfokus pada pengembangan web modern, antarmuka yang intuitif, dan membangun pengalaman digital yang rapi, cepat, serta bermanfaat.'
        : 'I focus on modern web development, intuitive interfaces, and building digital experiences that are clean, fast, and meaningful.';

  const socialLinks = Object.entries({
    github: 'https://github.com/rafibudiansyah12',
    ...Object.fromEntries(
      Object.entries(profile.socialLinks ?? {}).filter(
        ([name, url]) => name.toLowerCase() !== 'email' && url.startsWith('http'),
      ),
    ),
  });

  return (
    <main>
      <section className="section-shell section-block" id="about">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{t('about.title')}</ScrollText>
            </h2>
          </Reveal>
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
              <p className="about-bio-text about-bio-full">{aboutSummary}</p>
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
                  note: locale === 'id' ? 'Lihat semua karya' : 'View all work',
                  href: '/projects',
                  icon: Monitor,
                },
                {
                  value: `${skills.length}+`,
                  label: locale === 'id' ? 'Tools & Tech' : 'Tools & Tech',
                  note: `${skillGroups.length || 1} ${locale === 'id' ? 'kategori keahlian' : 'skill categories'}`,
                  href: '#tools',
                  icon: Code2,
                },
                {
                  value: `${services.length}+`,
                  label: locale === 'id' ? 'Layanan' : 'Services',
                  note: locale === 'id' ? 'Solusi yang ditawarkan' : 'Solutions offered',
                  href: '/services',
                  icon: PlugZap,
                },
                {
                  value: `${awards.length}+`,
                  label: locale === 'id' ? 'Penghargaan & Sertif' : 'Awards & Certs',
                  note: `${experiences.length} ${locale === 'id' ? 'riwayat pengalaman' : 'experiences'}`,
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
                  <a href="#tools">
                    {locale === 'id' ? 'Semua' : 'All'} ({skills.length}) <ArrowUpRight size={12} />
                  </a>
                </div>
                <div className="about-service-list">
                  {skills.slice(0, 4).map((skill, index) => {
                    const FallbackIcon = [Code2, Monitor, Layers3, PlugZap][index % 4] ?? Code2;
                    const level =
                      typeof skill.level === 'number'
                        ? Math.min(100, Math.max(15, skill.level))
                        : 90 - index * 4;
                    return (
                      <a
                        href="#tools"
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
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="about-pillar-card about-services-pillar">
                <div className="about-pillar-head">
                  <span>{locale === 'id' ? 'LAYANAN SAYA' : 'MY SERVICES'}</span>
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
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section-shell section-block" id="about-services">
          <div className="section-heading section-heading-more">
            <Reveal>
              <h2>
                <ScrollText>{locale === 'id' ? 'Layanan Saya' : 'My Services'}</ScrollText>
              </h2>
            </Reveal>
            <Link className="section-more-link" href="/services" locale={locale as 'id' | 'en'}>
              {locale === 'id' ? 'Halaman layanan' : 'Services page'}{' '}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="about-services-showcase">
            {services.slice(0, 6).map((service, index) => {
              const ServiceIcon = [Monitor, Layers3, PlugZap, Code2][index % 4] ?? Monitor;
              return (
                <article
                  className={
                    index === 0
                      ? 'about-showcase-card about-showcase-card-featured'
                      : 'about-showcase-card'
                  }
                  key={service.id}
                >
                  <div className="about-showcase-top">
                    <span className="about-showcase-icon" aria-hidden="true">
                      <ServiceIcon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="about-showcase-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="about-showcase-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <div className="about-showcase-foot">
                    <Link
                      href="/contact"
                      locale={locale as 'id' | 'en'}
                      className="about-showcase-cta"
                    >
                      {locale === 'id' ? 'Diskusikan layanan ini' : 'Discuss this service'}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="section-shell section-block tools-section" id="tools">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.tools')}</ScrollText>
            </h2>
          </Reveal>
        </div>
        {skillGroups.length > 0 ? (
          <div className="service-grid">
            {skillGroups.map(([category, items], index) => {
              const Icon = [Code2, Monitor, Layers3, PlugZap][index % 4] ?? Code2;
              return (
                <article className="service-card" key={category}>
                  <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  <div style={{ width: '100%' }}>
                    <h3>{category}</h3>
                    <div className="about-skill-bars">
                      {items.map((skill) => (
                        <div className="about-skill-row" key={skill.id}>
                          <div className="about-skill-label">
                            <span>{skill.name}</span>
                            {typeof skill.level === 'number' && <b>{skill.level}%</b>}
                          </div>
                          {typeof skill.level === 'number' && (
                            <div className="about-skill-track">
                              <i
                                style={{ width: `${Math.min(100, Math.max(10, skill.level))}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="section-empty">
            {locale === 'id'
              ? 'Daftar tools akan tampil di sini setelah ditambahkan ke database.'
              : 'Your tools will appear here after they are added to the database.'}
          </p>
        )}
      </section>
    </main>
  );
}
