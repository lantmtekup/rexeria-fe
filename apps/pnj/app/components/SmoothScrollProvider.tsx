'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Single global Lenis instance for the entire app. Mounted at the root layout
// so route navigation never re-creates it (re-creation would stack scroll
// listeners and double-process wheel events). On route change we ScrollTrigger.refresh()
// because page heights differ between routes — stale start/end positions
// produce phantom triggers and visible jank.
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    (window as unknown as { ScrollTrigger?: unknown }).ScrollTrigger =
      ScrollTrigger;
    gsap.config({ force3D: true });
    gsap.defaults({ overwrite: 'auto' });

    // ── MOBILE MODE ───────────────────────────────────────────────
    // On real mobile devices, Lenis's JS lerp competes with the OS's
    // native momentum scroll (which is GPU-accelerated and tuned per
    // platform). The result is "giật giật" that doesn't appear in
    // desktop dev tools. Solution: skip Lenis on mobile entirely. The
    // native scroll handles touch with platform-grade smoothness;
    // ScrollTrigger still fires from native scroll events. Mobile users
    // also miss the pinned-canvas frame scrub but gain a fluid scroll.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      // Still register ScrollTrigger so scroll-triggered tweens fire,
      // but no Lenis instance is created.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      window.addEventListener('load', () => ScrollTrigger.refresh());
      return;
    }

    // Lerp 0.12 (was 0.1) — slightly snappier settle to kill the tail
    // oscillation that fed back through ScrollTrigger as scrub jitter on
    // mid-page sections. 0.1 feels luxurious but takes 30+ frames to stop;
    // those last frames of ±1px wobble were what users perceived as "khựng".
    const lenis = new Lenis({
      duration: 1.0,
      lerp: 0.12,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;
    // Expose for child components that need lenis.scrollTo (anchor links, etc.)
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // Sync Lenis with GSAP's ticker — single rAF loop, no jitter from two
    // independent animation engines competing.
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    // Refresh after fonts + initial images settle so triggers map to final
    // layout, not the FOUC layout.
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Refresh ScrollTrigger after every route change. New page mounts, layout
  // shifts — stale offsets would mis-fire pin/scrub.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
