'use client';

/**
 * Le Cool Move Header — port từ apps/ecommerce-landing Header.tsx.
 *
 * Thanh `sticky` cao 72px. KHÔNG portal như PnjHeader/BelgoHeader: bản gốc là
 * `sticky` chứ không `fixed`, mà `@container` chỉ phá `position: fixed` — sticky
 * vẫn neo đúng vào khung cuộn nên để nguyên trong luồng là chạy được cả trên
 * canvas lẫn `/p`.
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

import { cn } from '@/lib/cn';

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

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const navItems = React.useMemo(() => resolveHeaderNav(content), [content]);
  const actions = React.useMemo(() => resolveHeaderActions(content), [content]);

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
        onClick={
          isCanvas
            ? e => e.preventDefault()
            : menuOpen
              ? () => setMenuOpen(false)
              : undefined
        }
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

  return (
    <header
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div
        className='relative flex items-center pr-6 pl-5 @4xl:pl-[29px]'
        style={{ height: LECOOL_HEADER_H }}
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
          onClick={isCanvas ? e => e.preventDefault() : undefined}
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
    </header>
  );
}
