'use client';

import * as React from 'react';

/**
 * Trả về true khi BỀ RỘNG CONTAINER của ref < breakpoint (mặc định 768px).
 *
 * Khác `window.matchMedia('(max-width:767px)')` (đo viewport thật) — hook này
 * đo chính khung block qua ResizeObserver, nên hoạt động đúng trong preview
 * editor (khung device 390/834/1280) lẫn trên trang `/p` thật. Dùng cho các
 * block port từ template để thay logic isMobile viewport-based.
 */
export function useContainerMobile(
  ref: React.RefObject<HTMLElement | null>,
  breakpoint = 768
): boolean {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setIsMobile(w > 0 && w < breakpoint);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, breakpoint]);
  return isMobile;
}
