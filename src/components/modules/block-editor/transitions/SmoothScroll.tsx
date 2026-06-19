'use client';

import * as React from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth-scroll Lenis cấp trang — tổng quát hoá từ mint-coint SmoothScrollProvider.
 * Desktop-only (mobile dùng native momentum để tránh giật), đồng bộ Lenis với
 * GSAP ticker + ScrollTrigger.update. `enabled=false` → render thẳng (cho preset
 * swipe/tabs vốn không cuộn dọc, hoặc khi tắt smooth-scroll).
 */
export function SmoothScroll({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 767px)').matches) {
      window.addEventListener('load', () => ScrollTrigger.refresh());
      return;
    }

    const lenis = new Lenis({
      duration: 1.0,
      lerp: 0.12,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [enabled]);

  return <>{children}</>;
}
