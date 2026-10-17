import {
  safeGet,
  type Experience,
  type Profile,
  type Skill,
  type SiteSettings,
} from '../../lib/api';
import { PrintButton } from '../../../components/print-button';

export default async function ResumePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [profile, skills, experience, settings] = await Promise.all([
    safeGet<Profile>(
      '/profile',
      {
        headline: 'Developer',
        bio: '',
        photoUrl: null,
        cvUrl: null,
        location: null,
        availability: false,
        socialLinks: {},
      },
      60,
    ),
    safeGet<Skill[]>('/skills', [], 60),
    safeGet<Experience[]>('/experiences', [], 60),
    safeGet<SiteSettings>('/settings/public', [], 300),
  ]);
  const setting = settings.find((item) => item.key === 'features')?.value;
  const features =
    typeof setting === 'object' && setting !== null ? (setting as Record<string, unknown>) : {};
  if (features.cvPdf === false)
    return (
      <main className="resume-page">
        <h1>Resume is unavailable</h1>
      </main>
    );
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  return (
    <main className="resume-page">
      <div className="resume-toolbar">
        <a href={`/${locale}`}>← Portfolio</a>
        <PrintButton />
      </div>
      <article className="resume-sheet">
        <header>
          <p className="eyebrow">CURRICULUM VITAE</p>
          <h1>Rafi Budiansyah</h1>
          <h2>{profile.headline}</h2>
          <p>
            {[
              profile.location,
              ...Object.entries(profile.socialLinks ?? {})
                .filter(([key]) => key.toLowerCase() !== 'email')
                .map(([key, value]) => `${key}: ${value}`),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </header>
        {profile.bio && (
          <section>
            <h3>Profile</h3>
            <p>{profile.bio}</p>
          </section>
        )}
        <section>
          <h3>Experience</h3>
          {experience.map((item) => (
            <div className="resume-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.organization}</span>
                <p>{item.description.replace(/<[^>]*>/g, ' ')}</p>
              </div>
              <time>
                {date(item.startDate)} — {item.endDate ? date(item.endDate) : 'Now'}
              </time>
            </div>
          ))}
        </section>
        <section>
          <h3>Skills</h3>
          <p>{skills.map((skill) => skill.name).join(' · ')}</p>
        </section>
        {profile.cvUrl && (
          <a href={profile.cvUrl} target="_blank" rel="noreferrer">
            View uploaded CV
          </a>
        )}
      </article>
    </main>
  );
}
