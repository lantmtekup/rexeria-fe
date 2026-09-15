'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, MQ, ScrollTrigger } from '../lib/motion';

type LenisWindow = Window & { __lenis?: Lenis };

export const getLenis = () =>
  typeof window === 'undefined'
    ? null
    : ((window as LenisWindow).__lenis ?? null);

/**
 * Wheel native nhảy từng nấc ~100px → scrub zoom đi theo từng nấc, nhìn giật.
 * Lenis nội suy wheel thành chuyển động liên tục; chạy trên gsap.ticker để
 * ScrollTrigger đọc cùng một frame. Touch giữ native (Lenis mặc định không
 * can thiệp touch) nên mobile không đổi cảm giác.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Reload luôn về đầu trang: trang là một chuỗi cảnh ghim + intro chỉ chạy
    // ở scroll 0, khôi phục vị trí cũ sẽ vào giữa chừng. ScrollTrigger cũng tự
    // nhớ vị trí qua refresh → xoá luôn bộ nhớ đó (và đặt 'manual').
    ScrollTrigger.clearScrollMemory('manual');
    window.scrollTo(0, 0);

    if (window.matchMedia(MQ.reduce).matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    (window as LenisWindow).__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready?.then(refresh);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as LenisWindow).__lenis;
    };
  }, []);

  return <>{children}</>;
}
