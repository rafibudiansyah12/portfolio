import { Globe, Mail, MapPin, MessageCircle } from 'lucide-react';
import { ContactForm } from '../../../components/public-forms';
import { Reveal } from '../../../components/motion';
import { ScrollText } from '../../../components/scroll-text';
import { safeGet, type Profile } from '../../lib/api';
import { fallbackProfile, socialIcon, socialLabel } from '../../lib/portfolio-helpers';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const profile = await safeGet<Profile>('/profile', fallbackProfile, 120);

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
    </main>
  );
}
