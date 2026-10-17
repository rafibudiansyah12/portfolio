'use client';

import { useEffect } from 'react';

export function ScrollEffects() {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;
    let cancelled = false;
    let destroy = () => {};
    void Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([lenisModule, gsapModule, triggerModule]) => {
        if (cancelled || motionQuery.matches) return;
        const Lenis = lenisModule.default;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = triggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        const ticker = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);
        destroy = () => {
          gsap.ticker.remove(ticker);
          lenis.destroy();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      },
    );
    return () => {
      cancelled = true;
      destroy();
    };
  }, []);
  return null;
}
