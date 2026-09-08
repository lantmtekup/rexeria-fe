'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, MQ, ScrollTrigger } from '@/app/lib/motion';

type LenisWindow = Window & { __lenis?: Lenis };

// Bắn sau khi tạo instance để component con (effect chạy trước provider) bắt được.
export const LENIS_READY_EVENT = 'lenis:ready';

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

    gsap.config({ force3D: true });
    gsap.defaults({ overwrite: 'auto' });

    const mobile = window.matchMedia(MQ.mobile);

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const stop = () => {
      if (!lenis) return;
      if (tick) gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as LenisWindow).__lenis;
      lenis = null;
      tick = null;
    };

    const start = () => {
      if (lenis) return;

      const instance = new Lenis({
        duration: 1.0,
        lerp: 0.12,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
      });

      lenis = instance;
      (window as LenisWindow).__lenis = instance;

      instance.on('scroll', ScrollTrigger.update);

      tick = (time: number) => instance.raf(time * 1000);

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      window.dispatchEvent(new Event(LENIS_READY_EVENT));
    };

    const sync = () => (mobile.matches ? stop() : start());

    sync();
    mobile.addEventListener('change', sync);

    return () => {
      window.removeEventListener('load', refresh);
      mobile.removeEventListener('change', sync);
      stop();
    };
  }, []);

  return <>{children}</>;
}
