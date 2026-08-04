'use client';

/**
 * Block "Nav - Bottom Section Bar" (port `ProductSectionNav` của
 * apps/gambit-delvaux) — giữ nguyên bố cục + hành vi gốc:
 *
 *  - Thanh dán ĐÁY khung nhìn, nền `#F5F5F5`, viền trên mảnh, các mục canh
 *    giữa và cuộn ngang được (ẩn scrollbar) khi không đủ chỗ.
 *  - Mục đang xem có chấm tròn ở trước; luật active bám bản gốc (`page.tsx`):
 *    mục CUỐI CÙNG có mép trên đã vượt qua vạch 50% khung nhìn.
 *
 * Khác apps (đúng contract host — apps-port-host):
 *  - 4 mục hard-code + `document.getElementById(id)` → mảng CMS `navLinks`,
 *    mỗi mục tách `label` (chữ) + `href` (`fieldType: 'link'` — picker 4 dạng
 *    gồm "Cuộn tới block");
 *  - `scrollToSection` (ScrollToPlugin 0.85s) → cuộn mượt của host: `LinkNav`
 *    bắt click ở capture cho `#blk-…` (Lenis / `scrollIntoView`), block chỉ tự
 *    xử lý anchor `#id` thường mà `LinkNav` bỏ qua ở chế độ public;
 *  - prop `activeId` do trang truyền → scrollspy nội bộ (block phải tự chủ,
 *    landing của host không có `page.tsx` riêng);
 *  - `position: fixed` không sống được trong `@container` → portal qua
 *    `resolveDrawerPortalHost`; trong device frame dùng `absolute`;
 *  - `sm:` / `md:` → `cqi` + `@2xl:` (canvas responsive spec);
 *  - token thiết kế (font, cỡ chữ, màu, khoảng cách) chuyển từ class Tailwind
 *    sang inline base + `styleOf(key)` để toolbar editor override được.
 *
 * Ba bề mặt (như `DelvauxSubnav` / `PnjStickyMenu`):
 *  - Editor canvas + mini-preview: thanh in-flow, chấm active ở mục đầu để
 *    thấy được style của trạng thái active;
 *  - PreviewMode: portal `absolute` vào `[data-device-frame]`;
 *  - `/p`: portal `fixed` vào `document.body`.
 *
 * Font dùng chung cụm Delvaux (`delvauxTheme`).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';

import { isInternalPathLink } from '../links/linkToken';
import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import { DELVAUX_FONT_BODY, DELVAUX_FONT_CSS } from './delvauxTheme';
import { resolveGambitSectionNavLinks } from './_registry/defs/gambitSectionNav';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GambitSectionNavContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: GambitSectionNavContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** Nền gốc của thanh nav (`bg-[#F5F5F5]`). */
const NAV_BG = '#f5f5f5';
/** Mép trên section vượt vạch này (theo % khung nhìn) là mục đó active. */
const MARKER_RATIO = 0.5;
/** Gốc `z-20` — nằm trên nội dung trang, dưới overlay intro/header. */
const NAV_Z = 20;

type LenisLike = { scrollTo: (target: Element, options?: unknown) => void };

const getLenis = (): LenisLike | null =>
  (window as unknown as { __lenis?: LenisLike }).__lenis ?? null;

/** Id của anchor trong `href` (`#blk-abc` → `blk-abc`); khác → null. */
function anchorIdOf(href: string): string | null {
  const value = href.trim();
  if (!value.startsWith('#') || value.length < 2) return null;
  if (isInternalPathLink(value)) return null;
  return value.slice(1);
}

export function GambitSectionNav({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot, scroller } = useLandingMotion();

  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const links = resolveGambitSectionNavLinks(content);
  const hrefsKey = links.map(link => link.href ?? '').join('|');

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(
      hasRoot ? !!root.closest('[data-testid="active-block-preview"]') : false
    );
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // ── Scrollspy (luật gốc: section cuối cùng đã vượt vạch 50%) ───────────
  React.useEffect(() => {
    if (!mounted || isCanvas) return;

    const ids = hrefsKey.split('|').map(anchorIdOf);
    if (!ids.some(Boolean)) return;

    // Editor preview có thể mount cùng lúc canvas + overlay với id trùng nhau →
    // ưu tiên phần tử nằm trong scroller đang cuộn.
    const scope: ParentNode = scroller ?? document;
    const findTarget = (id: string): Element | null => {
      try {
        const selector = `#${CSS.escape(id)}`;
        return (
          scope.querySelector(selector) ?? document.querySelector(selector)
        );
      } catch {
        return null;
      }
    };

    let frame = 0;

    const sync = () => {
      frame = 0;
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      const marker = viewHeight * MARKER_RATIO;

      let best = 0;
      ids.forEach((id, index) => {
        if (!id) return;
        const target = findTarget(id);
        if (!target) return;
        if (target.getBoundingClientRect().top - viewTop <= marker) {
          best = index;
        }
      });
      setActiveIndex(prev => (prev === best ? prev : best));
    };

    const request = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    const scrollTarget: EventTarget = scroller ?? window;
    scrollTarget.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    sync();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [mounted, isCanvas, hrefsKey, scroller]);

  /**
   * Canvas: click chỉ để chọn element. Production: `LinkNav` đã lo `#blk-…`
   * (capture + Lenis) và link nội bộ/ngoài — block chỉ nhận phần còn lại là
   * anchor `#id` thường để cuộn mượt thay vì nhảy cứng.
   */
  const handleClick =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isCanvas) {
        event.preventDefault();
        return;
      }
      if (event.defaultPrevented) return;
      // Mục chưa gán link: `href='#'` sẽ nhảy về đầu trang — chặn hẳn.
      if (!href || href === '#') {
        event.preventDefault();
        return;
      }
      const id = anchorIdOf(href);
      if (!id) return;
      event.preventDefault();
      let target: Element | null = null;
      try {
        target = document.querySelector(`#${CSS.escape(id)}`);
      } catch {
        target = null;
      }
      if (!target) return;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

  // ── Style token (tuyền inline — toolbar override được) ─────────────────
  const bgStyle = blockBackgroundStyle(background);

  const barBase: React.CSSProperties = {
    backgroundColor: NAV_BG,
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  };

  const labelBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(10px, 1.1cqi, 14px)',
    lineHeight: 1.2,
    letterSpacing: '0.02em',
    color: '#000000',
    whiteSpace: 'nowrap',
  };

  const bar = (
    <nav
      aria-label='Section navigation'
      className='gambit-section-nav @container w-full'
      style={composeStyle(barBase, bgStyle)}
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <ul
        className='flex [scrollbar-width:none] flex-nowrap items-center justify-center overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
        style={{
          columnGap: 'clamp(12px, 3cqi, 48px)',
          padding: 'clamp(12px, 1.4cqi, 16px) clamp(12px, 1.6cqi, 16px)',
        }}
      >
        {links.map((link, index) => {
          const labelKey = `navLinks[${index}].label`;
          const hrefKey = `navLinks[${index}].href`;
          const href = (link.href ?? '').trim();
          // Canvas không có scroll thật → hiện chấm ở mục đầu để chỉnh được
          // style của trạng thái active.
          const isActive = index === activeIndex;
          const labelStyle = composeStyle(labelBase, styleOf(labelKey));

          return (
            <li key={`${labelKey}-${href}`} className='shrink-0'>
              <a
                data-element-key={hrefKey}
                href={isCanvas ? undefined : href || '#'}
                onClick={handleClick(href)}
                aria-label={link.label}
                aria-current={isActive ? 'true' : undefined}
                className={selectableClass(
                  activeKey === hrefKey,
                  'inline-flex cursor-pointer items-center no-underline'
                )}
                style={composeStyle(
                  {
                    columnGap: 'clamp(6px, 0.6cqi, 8px)',
                    textDecoration: 'none',
                  },
                  styleOf(hrefKey)
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className='inline-block shrink-0 rounded-full'
                    style={{
                      width: 'clamp(5px, 0.5cqi, 6px)',
                      height: 'clamp(5px, 0.5cqi, 6px)',
                      // Theo màu chữ (kể cả khi toolbar đổi màu nhãn).
                      backgroundColor: labelStyle?.color ?? '#000000',
                    }}
                  />
                ) : null}
                <span
                  data-element-key={labelKey}
                  className={selectableClass(activeKey === labelKey)}
                  style={labelStyle}
                >
                  {link.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // ── PreviewMode + /p: thanh dán đáy khung nhìn ─────────────────────────
  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        className='gambit-section-nav-root @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      >
        {createPortal(
          <div
            className='gambit-section-nav-fixed'
            // Hợp đồng với các block có nội dung dán đáy khung nhìn (ví dụ
            // `gambit_related_products`): đo phần tử này để tự chừa chỗ.
            data-bottom-nav='true'
            style={{
              position: inFrame ? 'absolute' : 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: NAV_Z,
            }}
          >
            {bar}
          </div>,
          portalHost
        )}
      </section>
    );
  }

  // Đã có LandingMotionRoot nhưng chưa đo xong portal host: giữ chỗ rỗng để
  // không nháy thanh in-flow rồi mới nhảy xuống đáy.
  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <section
        ref={rootRef}
        className='gambit-section-nav-root @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      />
    );
  }

  // ── Editor canvas + mini-preview: thanh in-flow ────────────────────────
  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className='gambit-section-nav-root @container relative w-full'
    >
      {bar}
    </section>
  );
}
