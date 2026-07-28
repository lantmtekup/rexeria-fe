'use client';

/**
 * Aestha Nav — thanh điều hướng dùng chung của cả họ block Aestha (RAMSA),
 * ghim cố định **góc TRÁI DƯỚI**.
 *
 * Trước đây mỗi block (`FramerAesthaEditorial`, `AesthaExplore`, `AesthaStudio`,
 * `AesthaContact`, `AesthaProject`) tự render một bản nav gần như y hệt nhau →
 * 5 nguồn dữ liệu trùng lặp, author phải sửa link ở 5 chỗ, vị trí lệch nhau
 * giữa các trang. Giờ nav là **một block đăng ký thật** (`aestha_nav`), author
 * thả 1 lần cho mỗi trang.
 *
 * Mọi link hiển thị GIỐNG NHAU — không tô mờ mục "trang hiện tại". Bản cũ có
 * `currentLabel` + `FOOTER_CURRENT` (#E0DEDE) nhưng trên nền trắng nó gần như
 * tàng hình, đọc ra như link bị mất chứ không phải link đang active.
 *
 * Ba surface (pattern `PnjStickyMenu` / `DelvauxSubnav` / `RolexCollectionNav`):
 * - `/p`                    → portal ra `document.body`, `position: fixed`
 * - PreviewMode / device    → portal ra `[data-device-frame]`, `position: absolute`
 * - Editor canvas           → in-flow, link vẫn selectable/editable
 * - BlockMiniPreview        → in-flow trong thumbnail (`hasRoot` = false)
 *
 * Bắt buộc portal: block root là `@container`, mà `container-type` tạo
 * containing-block cho `position: fixed` (docs/landing-motion-foundation.md R5)
 * → `fixed` đặt trực tiếp trong block sẽ neo sai + bị `overflow-hidden` của
 * device frame cắt.
 *
 * Xử lý link (3 case) nằm ở `aesthaLink.ts` — dùng chung với CTA của Editorial,
 * email/phone của Contact, next-project của Project.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  AesthaNavContent,
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import { useAesthaLink } from './aesthaLink';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FOOTER_LINK_STYLE } from './aesthaTokens';

interface AesthaNavProps {
  content: AesthaNavContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * z-index 60 — trên `PnjStickyMenu` (49) / `CoolHunterSectionProgress` (50),
 * dưới `DelvauxSubnav` (99). Các panel sticky của họ Aestha chỉ ở z-index 1/20.
 */
const OVERLAY_Z = 60;

/** Khớp padding section Aestha (`p-4` narrow → `p-8` wide) để nav rơi đúng chỗ. */
const NAV_PAD = 'clamp(16px, 2.2cqi, 32px)';

const NAV_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  flexWrap: 'wrap',
};

export function AesthaNav({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: AesthaNavProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();
  const linkProps = useAesthaLink();

  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play (cũng có scroller).
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  // hasRoot: false trong BlockMiniPreview (/admin/blocks) — không portal fixed
  // ra body. Khớp PnjStickyMenu / DelvauxSubnav.
  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const links = Array.isArray(content.navLinks) ? content.navLinks : [];

  /**
   * Entrance stagger — kế thừa nguyên timing nav cũ của `FramerAesthaEditorial`
   * (group C recon: stagger 50ms, spring ≈ `back.out(1.2)`). Không ScrollTrigger:
   * nav luôn nằm trong viewport ngay từ đầu.
   */
  useBlockMotion(rootRef, () => {
    if (!hasRoot || isCanvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Nav đã portal ra ngoài `rootRef` → query từ portalHost, không từ root.
    const scope: ParentNode = portalHost ?? document;
    const items = Array.from(
      scope.querySelectorAll<HTMLElement>('.aestha__nav-item')
    );
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(1.2)',
      }
    );
  }, [hasRoot, isCanvas, portalHost, links.length]);

  /**
   * `containerStyle` khác nhau giữa 2 nhánh: overlay thì `<nav>` tự định vị
   * trong khung phủ toàn màn; canvas thì nằm in-flow.
   *
   * `styleOf(...)` đặt CUỐI trong `composeStyle` để override từ toolbar luôn
   * thắng token mặc định.
   */
  const navEl = (containerStyle: React.CSSProperties) => (
    <nav
      aria-label='Aestha sections'
      data-element-key='navLinks'
      style={composeStyle(NAV_BASE, containerStyle, styleOf('navLinks'))}
      className={selectableClass(activeKey === 'navLinks', className)}
    >
      {links.map((link, i) => {
        const ek = `navLinks[${i}].label`;
        return (
          <a
            key={i}
            {...linkProps(link.href)}
            data-element-key={ek}
            style={composeStyle(FOOTER_LINK_STYLE, styleOf(ek))}
            className={selectableClass(
              activeKey === ek,
              'aestha__nav-item rounded-sm outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'
            )}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );

  // ── Overlay (/p fixed + PreviewMode absolute trong device frame) ──────────
  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        className='aestha-nav relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      >
        {createPortal(
          // `@container` khai lại TRONG portal: nav đã rời khỏi block root nên
          // `cqi` của NAV_PAD cần container mới để resolve (tiền lệ
          // `RolexCollectionNav`).
          <div
            className='@container'
            data-aestha-nav-fixed
            style={{
              position: inFrame ? 'absolute' : 'fixed',
              inset: 0,
              zIndex: OVERLAY_Z,
              pointerEvents: 'none',
            }}
          >
            {navEl({
              position: 'absolute',
              left: 0,
              bottom: 0,
              padding: NAV_PAD,
              pointerEvents: 'auto',
            })}
          </div>,
          portalHost
        )}
      </section>
    );
  }

  // Trước khi mount / chưa resolve host — vẫn h-0 để không tạo sọc giữa section.
  if (hasRoot && !isCanvas) {
    return (
      <section
        ref={rootRef}
        className='aestha-nav relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      />
    );
  }

  // ── Editor canvas / mini-preview: in-flow để chọn & sửa từng link ─────────
  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      style={composeStyle(blockBackgroundStyle(background), { minHeight: 72 })}
      className='aestha-nav @container relative flex w-full items-end bg-white'
    >
      {navEl({ padding: NAV_PAD })}
    </section>
  );
}
