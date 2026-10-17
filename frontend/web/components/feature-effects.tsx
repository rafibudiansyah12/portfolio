'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname, useRouter } from '../i18n/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { useTheme } from './theme-provider';

type Props = { features: Record<string, unknown> };

export function FeatureEffects({ features }: Props) {
  const [palette, setPalette] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [egg, setEgg] = useState(false);
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Array<{ title: string; slug: string }>>([]);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const { toggleTheme, setAccent } = useTheme();
  const closePalette = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setPalette(false);
  };
  const commands = [
    { label: 'Home', href: '/#top' },
    { label: 'About', href: '/#about' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Blog', href: '/#journal' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Resume / CV', href: '/resume' },
  ];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k' &&
        features.commandPalette !== false
      ) {
        event.preventDefault();
        setPalette((current) => !current);
      }
      if (event.key === 'Escape') setPalette(false);
      if (features.easterEgg !== false) {
        const sequence = [
          'ArrowUp',
          'ArrowUp',
          'ArrowDown',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'ArrowLeft',
          'ArrowRight',
          'b',
          'a',
        ];
        const current = [...(window.__portfolioKeys ?? []), event.key].slice(-sequence.length);
        window.__portfolioKeys = current;
        if (sequence.every((key, index) => key.toLowerCase() === current[index]?.toLowerCase())) {
          setEgg(true);
          window.setTimeout(() => setEgg(false), 3500);
          window.__portfolioKeys = [];
        }
      }
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      setPosition({ x: event.clientX, y: event.clientY });
      const target =
        features.customCursor === true && event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-magnetic], .button-primary, .button-secondary')
          : null;
      if (target && !reduceMotion) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty(
          '--magnetic-x',
          `${(event.clientX - rect.left - rect.width / 2) * 0.12}px`,
        );
        target.style.setProperty(
          '--magnetic-y',
          `${(event.clientY - rect.top - rect.height / 2) * 0.12}px`,
        );
      }
    };
    const onPointerOut = (event: PointerEvent) => {
      const target =
        features.customCursor === true &&
        event.pointerType !== 'touch' &&
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-magnetic], .button-primary, .button-secondary')
          : null;
      target?.style.setProperty('--magnetic-x', '0px');
      target?.style.setProperty('--magnetic-y', '0px');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerout', onPointerOut);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerout', onPointerOut);
    };
  }, [features.commandPalette, features.easterEgg, reduceMotion]);
  useEffect(() => {
    if (!palette) return;
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
    void fetch(`${api}/projects?limit=100`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: Array<{ title: string; slug: string }> } | null) =>
        setProjects(data?.items ?? []),
      )
      .catch(() => setProjects([]));
  }, [palette]);
  const matches = (label: string) =>
    label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  return (
    <>
      {features.scrollProgress !== false && (
        <div
          className="scroll-progress"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden="true"
        />
      )}
      {features.customCursor === true && !reduceMotion && (
        <div
          className="custom-cursor"
          style={{ transform: `translate3d(${position.x}px,${position.y}px,0)` }}
          aria-hidden="true"
        />
      )}
      {egg && (
        <div className="easter-egg" role="status">
          ✨ You found the secret. Thanks for exploring! ✨
        </div>
      )}
      {palette && (
        <div className="command-backdrop" onMouseDown={closePalette}>
          <section
            className="command-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <input
              className="command-search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages and projects…"
              aria-label="Search pages and projects"
            />
            <div className="command-title">
              Quick navigation <kbd>ESC</kbd>
            </div>
            {commands
              .filter((command) => matches(command.label))
              .map((command) => (
                <button
                  key={command.href}
                  onClick={() => {
                    router.push(command.href);
                    setPalette(false);
                  }}
                >
                  {command.label}
                  <span>↵</span>
                </button>
              ))}
            {projects
              .filter((project) => matches(project.title))
              .slice(0, 6)
              .map((project) => (
                <button
                  key={project.slug}
                  onClick={() => {
                    router.push(`/projects/${project.slug}`);
                    setPalette(false);
                  }}
                >
                  {project.title}
                  <span>Project ↵</span>
                </button>
              ))}
            <div className="command-actions">
              <button onClick={toggleTheme}>Toggle theme</button>
              <button
                onClick={() => router.replace(pathname, { locale: locale === 'id' ? 'en' : 'id' })}
              >
                {locale === 'id' ? 'English' : 'Bahasa'}
              </button>
              <button onClick={() => setAccent('#9db5ff')}>Blue accent</button>
              <button onClick={() => setAccent('#a4f0d1')}>Mint accent</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export function PageTransition({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  if (!enabled || reduceMotion) return <>{children}</>;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

declare global {
  interface Window {
    __portfolioKeys?: string[];
  }
}
