import { Layers3, Monitor, PlugZap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '../../../components/motion';
import { ScrollText } from '../../../components/scroll-text';
import { safeGet, type SiteSettings } from '../../lib/api';
import { localizedText, settingRecords } from '../../lib/portfolio-helpers';

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const settings = await safeGet<SiteSettings>('/settings/public', [], 60);
  const serviceSetting = settings.find((setting) => setting.key === 'services')?.value;
  const services = settingRecords(serviceSetting)
    .map((entry, index) => ({
      id: typeof entry.id === 'string' ? entry.id : `service-${index}`,
      title: localizedText(entry.title, locale),
      description: localizedText(entry.description, locale),
    }))
    .filter((service) => service.title && service.description);

  return (
    <main>
      <section className="section-shell section-block services-section" id="services">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{t('sections.services')}</ScrollText>
            </h2>
          </Reveal>
        </div>
        <div className="service-grid" id="services-details">
          {services.length > 0 ? (
            services.map((service, index) => {
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
    </main>
  );
}
