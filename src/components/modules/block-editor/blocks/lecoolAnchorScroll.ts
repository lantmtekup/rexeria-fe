'use client';

/**
 * Cuộn tới block cho các link "Cuộn tới block" của bộ Le Cool Move.
 *
 * Vì sao KHÔNG để trình duyệt tự nhảy theo `href="#blk-…"` (đo trên `/p`):
 *
 * 1. Header Le Cool `sticky` cao 72px. Nhảy hash gốc đưa đỉnh section lên sát
 *    mép trên khung nhìn → đúng 72px đầu của section nằm khuất sau header.
 *    Đo thực tế: hash gốc dừng ở 4235, cần 4163.
 * 2. Nhảy hash là tức thời, còn cả trang chạy Lenis smooth — bấm menu mà giật
 *    một phát là lạc nhịp với mọi chuyển động khác.
 * 3. Trong editor, khung cuộn là một PHẦN TỬ chứ không phải window, hash không
 *    đụng tới nó.
 * 4. PreviewMode là overlay nằm trên canvas, cả hai cùng mounted và cùng render
 *    `id="blk-…"` giống nhau → phải tìm trong đúng scroller, không dùng
 *    `document.getElementById`.
 *
 * Link ngoài (`https://…`) và đường dẫn nội bộ (`/p/...`) KHÔNG bị chặn — đó là
 * điều hướng thật, để trình duyệt lo. Cùng cách `PnjStickyMenu` đang làm.
 */
import * as React from 'react';

import { isInternalPathLink } from '../links/linkToken';
import { useLandingMotion } from '../motion/LandingMotion';
import { LECOOL_HEADER_H } from './lecoolTheme';

type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: { duration?: number; immediate?: boolean; offset?: number }
  ) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const isExternalLink = (link: string): boolean =>
  /^(https?:)?\/\//i.test(link.trim()) || /^(mailto|tel):/i.test(link.trim());

/**
 * Tìm target TRONG scroller hiện tại. KHÔNG dùng `document.getElementById`:
 * PreviewMode là overlay nằm trên canvas, cả hai cùng mounted và cùng render
 * block với `id="blk-…"` giống nhau → bản toàn cục trả về node ngoài overlay,
 * offset sai hẳn.
 */
function findTarget(
  id: string,
  scroller: HTMLElement | null
): HTMLElement | null {
  if (!id) return null;
  const root: ParentNode = scroller ?? document;
  try {
    return root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  } catch {
    return null;
  }
}

function offsetTopIn(el: HTMLElement, scroller: HTMLElement | null): number {
  const top = el.getBoundingClientRect().top;
  if (scroller) {
    return top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  }
  return top + window.scrollY;
}

/**
 * Trả về handler cho `onClick` của thẻ `<a>`.
 *
 * - rỗng / `#` → chặn luôn, không nhảy lên đầu trang
 * - `#blk-…` (hoặc bất kỳ fragment nào) → tự cuộn, trừ chiều cao header
 * - còn lại → trả về `false`, caller để trình duyệt xử lý
 */
export function useLecoolAnchorScroll(isCanvas: boolean) {
  const { scroller } = useLandingMotion();

  return React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, rawHref: string): void => {
      // Canvas: click là để CHỌN element, không bao giờ điều hướng.
      if (isCanvas) {
        event.preventDefault();
        return;
      }

      const href = rawHref.trim();
      if (!href || href === '#') {
        event.preventDefault();
        return;
      }
      if (isExternalLink(href) || isInternalPathLink(href)) return;
      if (!href.startsWith('#')) return;

      const el = findTarget(href.slice(1), scroller ?? null);
      if (!el) {
        // Không có target thì cũng đừng để trình duyệt nhảy về đầu trang.
        event.preventDefault();
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(`[lecool] không tìm thấy target cho link "${href}"`);
        }
        return;
      }

      event.preventDefault();
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el, {
          offset: -LECOOL_HEADER_H,
          ...(reduced ? { immediate: true } : { duration: 1.2 }),
        });
        return;
      }
      if (scroller) {
        scroller.scrollTo({
          top: offsetTopIn(el, scroller) - LECOOL_HEADER_H,
          behavior: reduced ? 'auto' : 'smooth',
        });
        return;
      }
      window.scrollTo({
        top: offsetTopIn(el, null) - LECOOL_HEADER_H,
        behavior: reduced ? 'auto' : 'smooth',
      });
    },
    [isCanvas, scroller]
  );
}
