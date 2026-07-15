'use client';

import * as React from 'react';

import { CONTAINER_MOBILE_BREAKPOINT } from '../deviceFrame';

/**
 * Trả về true khi BỀ RỘNG CONTAINER của ref < breakpoint (mặc định 672px =
 * Tailwind `@2xl:` container — khớp docs/canvas-block-responsive-spec.md §R2).
 *
 * Khác `window.matchMedia('(max-width:767px)')` (đo viewport thật) — hook này
 * đo chính khung block qua ResizeObserver, nên hoạt động đúng trong preview
 * editor (khung device 390/834/1280) lẫn trên trang `/p` thật. Dùng cho các
 * block port từ template để thay logic isMobile viewport-based.
 *
 * Sync đo trong useLayoutEffect (trước paint) để tránh frame đầu luôn `false`
 * → load nhầm asset desktop rồi teardown khi RO flip sang mobile.
 */
export function useContainerMobile(
  ref: React.RefObject<HTMLElement | null>,
  breakpoint = CONTAINER_MOBILE_BREAKPOINT
): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = (w: number) => {
      setIsMobile(w > 0 && w < breakpoint);
    };

    sync(el.clientWidth);

    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      sync(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, breakpoint]);

  return isMobile;
}
