'use client';

/**
 * Logic link dùng chung của họ block Aestha (RAMSA): `AesthaNav`,
 * `FramerAesthaEditorial` (CTA), `AesthaContact` (email/phone/social),
 * `AesthaProject` (next-project).
 *
 * Tách khỏi `AesthaNav.tsx` khi file đó lên block đăng ký: nếu để chung, 4 block
 * anh em import `useAesthaLink` sẽ kéo luôn cả module block vào bundle của mình
 * → `dynamic()` của registry mất tác dụng.
 *
 * Ba case link (đối chiếu `PnjStickyMenu`):
 *   A. cuộn tới section trong trang  → `section`
 *   B. mở tab mới                    → `external`
 *   C. chuyển trang                  → `path` (và `scheme` cho mailto:/tel:)
 */

import * as React from 'react';

import { isInternalPathLink } from '../links/linkToken';
import { useLandingMotion } from '../motion/LandingMotion';

/**
 * Phân loại một giá trị link Aestha.
 *
 * ⚠️ Thứ tự các nhánh là **hợp đồng**, không phải tình cờ: `mailto:`/`tel:` phải
 * bị bắt TRƯỚC nhánh `section`, nếu không `mailto:hi@x.com` sẽ bị coi là section
 * id và render thành `href="#mailto:hi@x.com"` — click chết câm.
 *
 * - `external` → URL ngoài (kể cả protocol-relative `//host`) → tab mới.
 * - `path`     → path nội bộ đã resolve (`/p/{slug}/sub`) → `LinkNav` public lo
 *                full-document navigation; block KHÔNG được `preventDefault`.
 * - `scheme`   → `mailto:` / `tel:` / scheme khác → để trình duyệt xử lý, cùng tab.
 * - `section`  → id trong trang (`hero`, `#hero`) → cuộn mượt trong đúng scroller.
 */
export type AesthaLinkKind =
  'none' | 'external' | 'path' | 'scheme' | 'section';

export function classifyAesthaLink(raw?: string): AesthaLinkKind {
  const v = (raw ?? '').trim();
  if (!v || v === '#') return 'none';
  if (/^(https?:)?\/\//i.test(v)) return 'external';
  if (isInternalPathLink(v)) return 'path';
  // Bất kỳ scheme nào còn lại (`mailto:`, `tel:`, `sms:`…). Không match `#hero`
  // vì `#` không hợp lệ ở đầu scheme.
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return 'scheme';
  return 'section';
}

/** Bỏ `#` đầu để dùng làm DOM id. */
const sectionIdOf = (raw: string): string => raw.trim().replace(/^#/, '');

type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: { duration?: number; immediate?: boolean }
  ) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const elementOffsetTop = (
  el: HTMLElement,
  scroller: HTMLElement | null
): number => {
  if (scroller) {
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.top - scrollerRect.top + scroller.scrollTop;
  }
  return el.getBoundingClientRect().top + window.scrollY;
};

/**
 * Tìm section TRONG scroller hiện tại — KHÔNG `document.getElementById` toàn
 * cục: id trùng nhau giữa các bản render (PreviewMode là overlay, editor canvas
 * bên dưới vẫn mounted và cũng render section cùng id) → bản NGOÀI overlay
 * thắng, offset sai → cuộn "nhích 1 xíu". Cùng lý do với `PnjStickyMenu`.
 */
const findSection = (
  id: string,
  scroller: HTMLElement | null
): HTMLElement | null => {
  if (!id) return null;
  const root: ParentNode = scroller ?? document;
  try {
    return root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  } catch {
    return null;
  }
};

/** Cuộn tới section. `false` = không tìm thấy id (caller có thể fallback). */
export function scrollToAesthaSection(
  raw: string,
  scroller: HTMLElement | null
): boolean {
  const id = sectionIdOf(raw);
  const el = findSection(id, scroller);
  if (!el) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`[aesthaLink] không tìm thấy section id="${id}"`);
    }
    return false;
  }

  const reduced = prefersReducedMotion();
  const lenis = getLenis();
  if (lenis) {
    // Truyền thẳng element: Lenis tự tính offset trong hệ toạ độ của nó.
    lenis.scrollTo(el, reduced ? { immediate: true } : { duration: 1.2 });
  } else if (scroller) {
    // Scroller là element lồng nhau → offset tương đối.
    scroller.scrollTo({
      top: elementOffsetTop(el, scroller),
      behavior: reduced ? 'auto' : 'smooth',
    });
  } else {
    el.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
  }
  return true;
}

/**
 * Bản mệnh lệnh cho surface KHÔNG phải `<a>` (vd slider kéo-thả của
 * `AesthaExplore` — container giữ pointer-capture nên không đổi thành anchor
 * được). Trả `false` khi link rỗng → caller giữ hành vi cũ.
 */
export function followAesthaLink(
  raw: string | undefined,
  scroller: HTMLElement | null
): boolean {
  const v = (raw ?? '').trim();
  switch (classifyAesthaLink(v)) {
    case 'external':
      window.open(v, '_blank', 'noopener,noreferrer');
      return true;
    case 'path':
    case 'scheme':
      window.location.assign(v);
      return true;
    case 'section':
      return scrollToAesthaSection(v, scroller);
    default:
      return false;
  }
}

export interface AesthaLinkProps {
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Trả về hàm sinh prop cho `<a>` từ một giá trị link thô.
 *
 * Chỉ `section` / `none` mới có `onClick`; `path` và `scheme` cố ý KHÔNG
 * `preventDefault` để trình duyệt (và `LinkNav` ở public mode) chuyển trang thật.
 */
export function useAesthaLink(): (raw?: string) => AesthaLinkProps {
  const { scroller } = useLandingMotion();

  return React.useCallback(
    (raw?: string): AesthaLinkProps => {
      const v = (raw ?? '').trim();
      const kind = classifyAesthaLink(v);

      // Canvas mode: `LinkNav` đã `preventDefault()` ở capture phase — không
      // guard thì handler bubble này vẫn cuộn canvas của editor.
      // Ctrl/⌘/Shift/Alt/middle-click: để trình duyệt mở tab mới như bình thường.
      // Điều kiện khớp đúng `LinkNav` — lệch một cái là ctrl-click vừa mở tab
      // vừa cuộn.
      const guarded =
        (fn: () => void) => (e: React.MouseEvent<HTMLElement>) => {
          if (e.defaultPrevented) return;
          if (
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
          ) {
            return;
          }
          e.preventDefault();
          fn();
        };

      switch (kind) {
        case 'external':
          return { href: v, target: '_blank', rel: 'noreferrer noopener' };
        case 'path':
        case 'scheme':
          return { href: v };
        case 'section':
          return {
            href: `#${sectionIdOf(v)}`,
            onClick: guarded(() => scrollToAesthaSection(v, scroller)),
          };
        default:
          // Link rỗng: giữ `href='#'` cho a11y nhưng không nhảy lên đầu trang.
          return { href: '#', onClick: guarded(() => {}) };
      }
    },
    [scroller]
  );
}

/** Mọi mảng link Aestha (navLinks / footerLinks) đều cùng shape này. */
export interface AesthaNavItem {
  label: string;
  href: string;
}
