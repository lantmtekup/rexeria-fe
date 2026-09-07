'use client';

/**
 * Le Cool Move Header — port từ apps/ecommerce-landing Header.tsx.
 *
 * Thanh cao 72px luôn nằm trên đỉnh. PHẢI portal + `fixed` như PnjHeader /
 * BelgoHeader, dù bản gốc chỉ là `sticky`: trong host mỗi block bị bọc trong
 * một wrapper riêng, mà `position: sticky` chỉ dính được trong hộp CHA — wrapper
 * của header cao đúng 73px nên không có chỗ nào để dính, đo thực tế header trôi
 * mất hẳn (`top = -2000` khi cuộn 2000px). Root ở lại luồng làm THANH CHỪA CHỖ
 * đúng 72px để nội dung dưới không chui lên dưới bar.
 *
 * Khác apps:
 * - `lg:` / `xl:` / `md:` → `isDesktop` (@4xl) / `isWide` (@2xl) đo theo
 *   container. Hai mốc `xl:` của apps (ml 210px, gap 40px) gộp vào `clamp(…cqi)`
 *   vì spec chỉ cho 3 tier.
 * - Nav ngang và nav xổ xuống KHÔNG cùng lúc nằm trong DOM — hai bản cùng
 *   `data-element-key='navItems[i].label'` sẽ làm editor bắt nhầm node đang ẩn.
 * - `<a href>` của logo và từng nav item → tách `*Href` (`fieldType: 'link'`)
 *   khỏi `*Label` cho link picker 4 dạng.
 * - Placeholder ô tìm kiếm KHÔNG gắn `data-element-key` lên `<input>` (tránh
 *   ring chọn dính vào ô nhập thật trên `/p`) — sửa trong panel Lớp.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type { LecoolHeaderContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLecoolAnchorScroll } from './lecoolAnchorScroll';
import { resolveHeaderActions, resolveHeaderNav } from './lecoolHeaderData';
import { LECOOL_BODY_FONT, LECOOL_HEADER_H } from './lecoolTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

/** `@4xl` — mốc hiện nav ngang (thay `lg:` = 1024px của apps). */
const DESKTOP_BREAKPOINT = 896;

const NAV_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 16,
  lineHeight: '26px',
  fontWeight: 500,
  color: '#000000',
  textTransform: 'uppercase',
};

const SEARCH_INPUT_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 14,
  letterSpacing: '0.05em',
  color: '#000000',
};

export function LecoolHeader({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolHeaderContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isDesktop = !useContainerMobile(rootRef, DESKTOP_BREAKPOINT);
  const isWide = !useContainerMobile(rootRef);

  const { hasRoot } = useLandingMotion();
  const [mounted, setMounted] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
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

  const navItems = React.useMemo(() => resolveHeaderNav(content), [content]);
  const actions = React.useMemo(() => resolveHeaderActions(content), [content]);
  const onAnchorClick = useLecoolAnchorScroll(isCanvas);

  /**
   * Canvas: luôn bày nav ra (cho wrap) và luôn hiện ô tìm kiếm, để mọi field
   * đều bấm chọn được kể cả trong khung máy hẹp.
   */
  const inlineNav = isCanvas || isDesktop;
  const showSearch = isCanvas || isWide;
  const showBurger = !isCanvas && !isDesktop;

  const renderNavLink = (index: number, extraClass?: string) => {
    const item = navItems[index];
    const labelKey = `navItems[${index}].label`;
    const hrefKey = `navItems[${index}].href`;
    const href = item.href ?? '';
    return (
      <a
        key={hrefKey}
        data-element-key={hrefKey}
        href={isCanvas ? undefined : href || '#'}
        onClick={e => {
          onAnchorClick(e, href);
          // Nav xổ xuống: đóng lại sau khi đã bắt đầu cuộn.
          if (menuOpen) setMenuOpen(false);
        }}
        aria-label={item.label}
        className={selectableClass(activeKey === hrefKey, extraClass)}
        style={styleOf(hrefKey)}
      >
        <span
          data-element-key={labelKey}
          className={selectableClass(activeKey === labelKey)}
          style={composeStyle(NAV_LABEL_STYLE, styleOf(labelKey))}
        >
          {item.label}
        </span>
      </a>
    );
  };

  const chrome = (
    <div
      className='w-full'
      style={composeStyle(
        { fontFamily: LECOOL_BODY_FONT, backgroundColor: '#FFFFFF' },
        blockBackgroundStyle(background)
      )}
    >
      <div
        className='relative flex items-center pr-6'
        style={{
          height: LECOOL_HEADER_H,
          // `@4xl:pl-[29px]` không dùng được: bar đã portal ra ngoài root nên
          // không còn @container nào để container query bám vào.
          paddingLeft: isDesktop ? 29 : 20,
        }}
      >
        {showBurger ? (
          <button
            type='button'
            aria-label='Menu'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
            className='mr-4 flex h-6 w-6 flex-col justify-center gap-[5px]'
          >
            <span className='block h-px w-full bg-black' />
            <span className='block h-px w-full bg-black' />
            <span className='block h-px w-full bg-black' />
          </button>
        ) : null}

        <a
          data-element-key='logoHref'
          href={isCanvas ? undefined : content.logoHref || '#'}
          onClick={e => onAnchorClick(e, content.logoHref ?? '')}
          aria-label={content.logoAlt}
          className={selectableClass(activeKey === 'logoHref', 'shrink-0')}
          style={styleOf('logoHref')}
        >
          <img
            src={content.logoUrl ?? ''}
            alt={content.logoAlt ?? ''}
            data-element-key='logoUrl'
            className={selectableClass(activeKey === 'logoUrl', 'block')}
            style={composeStyle(
              { width: 110, height: 'auto' },
              styleOf('logoUrl')
            )}
          />
        </a>

        {inlineNav ? (
          <nav
            aria-label='Chính'
            className={cn('flex items-center', isCanvas && 'flex-wrap')}
            style={{
              // apps: `ml-[60px] xl:ml-[210px]`, `gap-6 xl:gap-10` — spec chỉ
              // cho 3 tier nên trượt liên tục theo bề ngang container.
              marginLeft: isCanvas ? 24 : 'clamp(60px, 14cqi, 210px)',
              gap: 'clamp(24px, 2.8cqi, 40px)',
            }}
          >
            {navItems.map((_, i) =>
              renderNavLink(i, 'transition-opacity hover:opacity-60')
            )}
          </nav>
        ) : null}

        <div className='ml-auto flex items-center gap-6'>
          {showSearch ? (
            <label
              className='flex h-[29px] w-[170px] items-center gap-3 border-b pl-[7px]'
              style={{ borderColor: 'rgba(0,0,0,0.2)' }}
            >
              <img
                src={content.searchIconUrl ?? ''}
                alt=''
                aria-hidden
                data-element-key='searchIconUrl'
                className={selectableClass(
                  activeKey === 'searchIconUrl',
                  'h-6 w-6 shrink-0'
                )}
                style={styleOf('searchIconUrl')}
              />
              {/* Không gắn data-element-key lên input: ring chọn sẽ theo lên
                  `/p`. Placeholder sửa trong panel Lớp. */}
              <input
                type='search'
                placeholder={content.searchPlaceholder ?? ''}
                aria-label={content.searchPlaceholder ?? 'Search'}
                readOnly={isCanvas}
                className='w-full border-0 bg-transparent pb-1 outline-none placeholder:text-black/20'
                style={SEARCH_INPUT_STYLE}
              />
            </label>
          ) : null}

          <div className='flex items-center gap-3'>
            {actions.map((action, i) => {
              const key = `actions[${i}].iconUrl`;
              return (
                <button
                  key={key}
                  type='button'
                  aria-label={action.label}
                  className='flex items-center transition-opacity hover:opacity-60'
                >
                  <img
                    src={action.iconUrl ?? ''}
                    alt=''
                    aria-hidden
                    data-element-key={key}
                    className={selectableClass(activeKey === key, 'block')}
                    style={composeStyle({ height: 24 }, styleOf(key))}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className='h-px w-full'
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      />

      {showBurger && menuOpen ? (
        <nav
          aria-label='Chính (mobile)'
          className='flex flex-col gap-4 border-b bg-white px-5 py-6'
          style={{ borderColor: 'rgba(0,0,0,0.4)' }}
        >
          {navItems.map((_, i) => renderNavLink(i))}
        </nav>
      ) : null}
    </div>
  );

  // Canvas: để bar nằm ngay trong luồng cho author bấm chọn từng field.
  if (!useFixed) {
    return (
      <header
        ref={rootRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        className={cn('@container relative w-full', className)}
      >
        {chrome}
      </header>
    );
  }

  return (
    <header
      ref={rootRef}
      className={cn('@container relative w-full', className)}
      // Thanh chừa chỗ: bar thật đã ra khỏi luồng nên root phải giữ đúng 72px,
      // nếu không nội dung ngay dưới sẽ chui lên nằm khuất sau bar.
      style={{ height: LECOOL_HEADER_H }}
    >
      {portalHost
        ? createPortal(
            <div
              style={{
                position: inFrame ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
              }}
            >
              {chrome}
            </div>,
            portalHost
          )
        : null}
    </header>
  );
}
