'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function ScrollText({ children }: { children: ReactNode }) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return;
    }

    document.documentElement.dataset.scrollReveal = 'enabled';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          window.clearTimeout(fallback);
          observer.unobserve(element);
        }
      },
      { threshold: 0, rootMargin: '160px 0px 160px 0px' },
    );
    const fallback = window.setTimeout(() => {
      element.classList.add('is-visible');
      observer.unobserve(element);
    }, 1200);
    observer.observe(element);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return (
    <span ref={textRef} className="scroll-text-target">
      {children}
    </span>
  );
}
