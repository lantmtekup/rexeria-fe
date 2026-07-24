'use client';

/**
 * Rolex Collection Nav — navigation bar from https://capable-seat-351062.framer.app/
 * Isolated block: 3 nav items in a horizontal row with backdrop-blur glass.
 * KHÔNG gắn với hero. KHÔNG dùng clamp() — dùng @container breakpoints.
 *
 * Width item: mỗi item natural là min-content (theo text riêng) — đo width
 * min-content của cả 3 rồi áp width lớn nhất cho cả nhóm, nên item luôn rộng
 * bằng item dài nhất (hiện tại "EXPLORE OUR COLLECTION") kể cả khi đổi text
 * qua CMS. Container không hardcode px, tự co theo (`width: fit-content`) —
 * với nội dung mặc định ra đúng 697×58 nhưng đó là hệ quả, không phải input.
 *
 * Nền: không tự đặt màu/ảnh cứng — dùng affordance "Nền" chung của canvas
 * (block-level `background`) để đặt ảnh/màu phía sau lớp kính mờ.
 *
 * Contract: useMotionAttributes (data-motion), @container, tuyền inline.
 */
import * as React from 'react';

import gsap from 'gsap';
import { LayoutGrid, X } from 'lucide-react';

import { useBlockMotion } from '../motion/LandingMotion';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexCollectionNavContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS } from './rolexFonts';

interface Props {
  content: RolexCollectionNavContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const NAV_ITEM_TEXT: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '14.4px',
  textTransform: 'uppercase',
  letterSpacing: 'normal',
  margin: 0,
};

const NAV_ROOT_STYLE: React.CSSProperties = {
  backdropFilter: 'blur(54px)',
  backgroundColor: 'rgba(0,0,0,0)',
  borderRadius: 8,
  opacity: 1,
};

/** Nền/blur riêng cho drawer mobile lúc MỞ — đo được từ site gốc (khác
 *  NAV_ROOT_STYLE dùng cho desktop nav + nút icon mobile lúc đóng). */
const MOBILE_DRAWER_OPEN_BACKDROP = {
  backgroundColor: 'rgba(0,0,0,0.09)',
  backdropFilter: 'blur(24px)',
};

const ITEM_BASE: React.CSSProperties = {
  display: 'flex',
  flex: '0 0 auto',
  height: '52px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 16px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.14)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  opacity: 1,
};

const NAV_ITEMS = [
  {
    key: 'navHomeLabel',
    hrefKey: 'navHomeHref',
    fallback: 'HOME',
    fallbackHref: '#',
  },
  {
    key: 'navCollectionLabel',
    hrefKey: 'navCollectionHref',
    fallback: 'EXPLORE OUR COLLECTION',
    fallbackHref: '#',
  },
  {
    key: 'navContactLabel',
    hrefKey: 'navContactHref',
    fallback: 'CONTACT',
    fallbackHref: '#',
  },
] as const;

/** Đo width min-content của mọi item rồi áp width lớn nhất cho cả nhóm —
 *  item luôn rộng bằng item dài nhất, không cần hardcode px. */
function useEqualizeItemWidth(
  itemRefs: React.RefObject<Array<HTMLAnchorElement | null>>,
  deps: React.DependencyList
) {
  React.useLayoutEffect(() => {
    const items = itemRefs.current.filter(
      (el): el is HTMLAnchorElement => el !== null
    );
    if (items.length === 0) return;

    items.forEach(el => {
      el.style.width = 'auto';
    });
    const max = Math.max(...items.map(el => el.offsetWidth));
    items.forEach(el => {
      el.style.width = `${max}px`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function RolexCollectionNav({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const itemRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const mobileButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = React.useRef<HTMLDivElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useMotionAttributes(rootRef);

  useEqualizeItemWidth(itemRefs, [
    content.navHomeLabel,
    content.navCollectionLabel,
    content.navContactLabel,
    styles,
  ]);

  // Drawer mobile: T3 (drawer logic) — GSAP tay qua useBlockMotion, không
  // phải data-motion (đó là entrance/scroll, đây là toggle 2 chiều theo click).
  // Cơ chế height-grow tại chỗ (không scale/transform-origin) + easing hội tụ
  // không-bounce — khớp recon site gốc (xem plan: halving ~48.5%/~67ms, không
  // overshoot).
  useBlockMotion(rootRef, () => {
    const drawer = mobileDrawerRef.current;
    const button = mobileButtonRef.current;
    if (!drawer || !button) return;
    gsap.set(drawer, {
      height: button.offsetHeight,
      opacity: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    });
  }, []);

  React.useEffect(() => {
    const button = mobileButtonRef.current;
    const drawer = mobileDrawerRef.current;
    if (!button || !drawer) return;

    if (mobileOpen) {
      const openHeight = drawer.scrollHeight;
      gsap.to(button, { opacity: 0, duration: 0.2, pointerEvents: 'none' });
      gsap.to(drawer, {
        height: openHeight,
        opacity: 1,
        ...MOBILE_DRAWER_OPEN_BACKDROP,
        duration: 0.85,
        ease: 'expo.out',
        pointerEvents: 'auto',
      });
    } else {
      gsap.to(drawer, {
        ...NAV_ROOT_STYLE,
        height: button.offsetHeight,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        pointerEvents: 'none',
      });
      gsap.to(button, {
        opacity: 1,
        duration: 0.25,
        delay: 0.15,
        pointerEvents: 'auto',
      });
    }
  }, [mobileOpen]);

  return (
    <div className='@container relative flex h-full w-full items-center justify-center'>
      {/* Ảnh demo CHỈ hiện khi đang sửa trên canvas — giúp thấy ngữ cảnh khi
          chỉnh nav; ẩn ở Preview/`/p` thật vì production sẽ do block phía sau
          (vd RolexCollectionWork) hoặc "Nền" của chính block này quyết định. */}
      {!isCanvas && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src='/rolex-collection/contact-bg.png'
          alt=''
          className='absolute inset-0 h-full w-full object-cover'
        />
      )}
      <nav
        ref={rootRef}
        style={composeStyle(NAV_ROOT_STYLE, blockBackgroundStyle(background))}
        className='rcnav relative z-10 hidden items-center justify-center @3xl:flex @3xl:h-14.5 @3xl:w-174.25'
      >
        <style>{FONT_CSS}</style>
        <div className='flex h-full w-full flex-row items-center justify-center gap-2.5'>
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.key}
              ref={el => {
                itemRefs.current[i] = el;
              }}
              data-element-key={item.key}
              href={content[item.hrefKey] || item.fallbackHref}
              style={composeStyle(ITEM_BASE, styleOf(item.key))}
              className={selectableClass(
                activeKey === item.key,
                'rcnav-item group bg-white/0 transition-colors duration-200 hover:bg-white'
              )}
            >
              <span
                style={NAV_ITEM_TEXT}
                className='text-white transition-colors duration-200 group-hover:text-black'
              >
                {content[item.key] || item.fallback}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile (<@3xl): thu gọn thành 1 nút icon lưới; click mở list dọc
          (trồi lên từ dưới), nút X đóng lại (thu về như nếp gấp, từ trên
          xuống). Cả 2 luôn mount — ẩn/hiện + animate qua GSAP (ref), không
          unmount/remount để tránh giật khi transition. */}
      <div className='relative z-10 flex w-89.5 items-center justify-center @3xl:hidden'>
        <button
          ref={mobileButtonRef}
          type='button'
          onClick={() => setMobileOpen(true)}
          aria-label='Mở menu'
          style={NAV_ROOT_STYLE}
          className='flex h-15 w-full items-center justify-center'
        >
          <span className='flex h-12.5 w-[47%] items-center justify-center rounded-lg bg-white'>
            <LayoutGrid className='h-6 w-6 text-black' />
          </span>
        </button>

        <div
          ref={mobileDrawerRef}
          style={NAV_ROOT_STYLE}
          className='absolute inset-x-0 bottom-0 flex w-89.5 flex-col gap-2 p-2'
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.key}
              href={content[item.hrefKey] || item.fallbackHref}
              onClick={() => setMobileOpen(false)}
              style={NAV_ITEM_TEXT}
              className='flex h-12.5 w-full shrink-0 items-center justify-center rounded-lg bg-white text-black'
            >
              {content[item.key] || item.fallback}
            </a>
          ))}
          <button
            type='button'
            onClick={() => setMobileOpen(false)}
            aria-label='Đóng menu'
            className='flex h-12.5 w-full shrink-0 items-center justify-center rounded-lg bg-white text-black'
          >
            <X className='h-6 w-6' />
          </button>
        </div>
      </div>
    </div>
  );
}
