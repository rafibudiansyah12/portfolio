'use client';

import { useEffect, useState } from 'react';

export function HeroTyping({ roles, locale }: { roles: string[]; locale: string }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setText(roles[0] ?? 'Web Developer');
      return;
    }

    const role = roles[roleIndex] ?? roles[0] ?? 'Web Developer';
    let delay: number;
    if (!deleting && text.length < role.length) {
      delay = 78;
    } else if (!deleting) {
      delay = 1350;
    } else {
      delay = 38;
    }

    const timer = window.setTimeout(() => {
      if (!deleting && text.length < role.length) {
        setText(role.slice(0, text.length + 1));
      } else if (!deleting) {
        setDeleting(true);
      } else if (text.length > 0) {
        setText(role.slice(0, text.length - 1));
      } else {
        setDeleting(false);
        setRoleIndex((current) => (current + 1) % Math.max(roles.length, 1));
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, roleIndex, roles, text]);

  return (
    <p className="hero-role-line">
      <span className="hero-role-value" aria-hidden="true">
        {text}
        <i />
      </span>
      <span className="hero-role-accessible">
        {locale === 'id' ? 'Keahlian utama: ' : 'Core skills: '}
        {roles.join(', ')}
      </span>
    </p>
  );
}
