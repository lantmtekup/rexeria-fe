'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reveal hook — fires once when element enters viewport.
 *
 * Ported từ 360-cms `_shared/use-reveal.ts`. Dùng cho fade-in animation
 * khi block scroll vào view (legacy pattern). Safety timeout 1.2s đảm
 * bảo content show ngay cả khi IO misfire (headless render, prerender,
 * legacy preview modal có scroll container riêng).
 *
 * Respect `prefers-reduced-motion` — return visible=true ngay.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' }
    );
    obs.observe(el);
    const t = setTimeout(() => setVisible(true), 1200);
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, []);
  return { ref, visible };
}
