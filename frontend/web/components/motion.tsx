'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      element.classList.add('is-visible');
      return;
    }

    document.documentElement.dataset.motionReveal = 'enabled';
    const reveal = () => element.classList.add('is-visible');
    const fallback = window.setTimeout(() => {
      reveal();
      observer.unobserve(element);
    }, 1400);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.clearTimeout(fallback);
        reveal();
        observer.unobserve(element);
      },
      { threshold: 0.06, rootMargin: '0px 0px 90px 0px' },
    );
    observer.observe(element);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return ref;
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`scroll-reveal${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`scroll-stagger${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`stagger-item${className ? ` ${className}` : ''}`}>{children}</div>;
}
