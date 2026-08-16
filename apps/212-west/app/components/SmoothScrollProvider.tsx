'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, MQ, ScrollTrigger } from '@/app/lib/motion';

type LenisWindow = Window & { __lenis?: Lenis };

export const getLenis = () =>
  typeof window === 'undefined'
    ? null
    : ((window as LenisWindow).__lenis ?? null);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (window.matchMedia(MQ.reduce).matches) return;

    const refresh = () => ScrollTrigger.refresh();

    document.fonts?.ready?.then(refresh);
    window.addEventListener('load', refresh);

    if (window.matchMedia(MQ.mobile).matches) {
      return () => window.removeEventListener('load', refresh);
    }

    gsap.config({ force3D: true });
    gsap.defaults({ overwrite: 'auto' });

    const lenis = new Lenis({
      duration: 1.0,
      lerp: 0.12,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    (window as LenisWindow).__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as LenisWindow).__lenis;
    };
  }, []);

  return <>{children}</>;
}
