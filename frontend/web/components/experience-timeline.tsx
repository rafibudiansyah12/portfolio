'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

export type ExperienceTimelineItem = {
  id: string;
  title: string;
  organization: string;
  description: string;
  period: string;
  typeLabel: string;
};

export function ExperienceTimeline({
  items,
  locale,
}: {
  items: ExperienceTimelineItem[];
  locale: string;
}) {
  const [activeItem, setActiveItem] = useState<ExperienceTimelineItem | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleId = 'experience-dialog-title';

  useEffect(() => {
    if (!activeItem) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveItem(null);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      triggerButtonRef.current?.focus();
    };
  }, [activeItem]);

  const closeLabel = locale === 'id' ? 'Tutup detail' : 'Close details';

  return (
    <>
      <div className="experience-flow">
        {items.map((item, index) => (
          <article className="experience-card" key={item.id}>
            <span className="experience-card-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="experience-card-main">
              <div className="experience-card-meta">
                <span>{item.typeLabel}</span>
                <span>{item.period}</span>
              </div>
              <button
                className="experience-card-toggle"
                type="button"
                aria-haspopup="dialog"
                onClick={(event) => {
                  triggerButtonRef.current = event.currentTarget;
                  setActiveItem(item);
                }}
              >
                <span className="experience-card-title">
                  <strong>{item.title}</strong>
                  <span>{item.organization}</span>
                </span>
                <span className="experience-card-open-label">
                  {locale === 'id' ? 'Detail' : 'Details'}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {activeItem && (
        <div
          className="experience-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveItem(null);
          }}
        >
          <section
            className="experience-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <button
              className="experience-modal-close"
              type="button"
              aria-label={closeLabel}
              ref={closeButtonRef}
              onClick={() => setActiveItem(null)}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className="experience-modal-meta">
              <span>{activeItem.typeLabel}</span>
              <span>{activeItem.period}</span>
            </div>
            <h2 id={dialogTitleId}>{activeItem.title}</h2>
            <p className="experience-modal-organization">{activeItem.organization}</p>
            <div className="experience-modal-divider" />
            <p className="experience-modal-description">
              {activeItem.description ||
                (locale === 'id'
                  ? 'Rincian pekerjaan belum ditambahkan.'
                  : 'Role details have not been added yet.')}
            </p>
          </section>
        </div>
      )}
    </>
  );
}
