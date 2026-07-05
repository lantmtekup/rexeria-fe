'use client';

/**
 * Block "Springs - Header" (section `.header.header--sticky` của
 * springs-estate-clone): thanh nav dán trên cùng trang.
 *
 * Bám gốc (index.html dòng ~260-570):
 *  - `.header__left` : nút "MENU" (icon 2 gạch ngang `icon-menu` + label) —
 *    trigger mở off-canvas menu; overlay thực tế NGOÀI phạm vi block này,
 *    ở đây chỉ render trigger + (tuỳ chọn) panel tối giản liệt kê `navLinks`.
 *  - `.header__center`: logo căn giữa — SVG 2 nửa gốc `icon-logo-left`
 *    (122×55, wordmark "Springs" dạng path) + `icon-logo-right` (29×55,
 *    monogram xoáy) port trực tiếp path data từ `assets/images/icons.svg`.
 *    Không có `logoUrl` trong Content — `logoText` chỉ dùng cho a11y
 *    (aria-label + span sr-only) vì bản thân SVG đã LÀ wordmark.
 *  - `.header__right`: link "Residences" + "Contact us" + nút tim
 *    `icon-heart` (yêu thích — decorative, không có state thật ở block này).
 *
 * Nền: gốc `.header__background` chỉ tối dần khi cuộn (theme ui-dark trên
 * hero xanh đậm). Ở đây cố định 1 lớp kính ink-green translucent + blur để
 * header đứng được độc lập (không phụ thuộc block bên dưới có nền tối hay
 * không) — vẫn đúng tinh thần "wellness residences" tối giản.
 *
 * Sticky bằng CSS `position: sticky` thuần (không GSAP pin, không portal
 * fixed như DelvauxHeader) — header luôn hiện, không cần đồng bộ /p vs
 * editor canvas. Animation: chỉ 1 entrance fade+slide-down khi mount (R1-R6,
 * không scroll-trigger vì header luôn visible).
 *
 * Font nav: TT Commons Pro (400 + 500) — self-host GỐC của springs.estate,
 * nạp qua `@font-face` trỏ thẳng URL live (không copy file font vào rexerai).
 */
import * as React from 'react';
import gsap from 'gsap';
import { Heart } from 'lucide-react';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsHeaderContent,
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
  content: SpringsHeaderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** @font-face TT Commons Pro — trỏ URL live springs.estate (đúng 2 weight
 *  thật sự khai báo trong `assets/stylesheets/global.css`: 400 + 500). */
const SPRINGS_HEADER_FONT_CSS = `
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

const SPRINGS_HEADER_FONT =
  "'TT Commons Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Palette ink-green "wellness residences" — khớp accent BLOCK_TYPE_META. */
const SPRINGS_INK = '#173620';
const SPRINGS_INK_DEEP = '#0f2517';
const SPRINGS_CREAM = '#f4ede1';

export function SpringsHeader({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Header luôn hiện (không phải reveal theo scroll) — chỉ 1 entrance nhẹ
  // trượt từ trên xuống khi block vào trang, đúng khuyến nghị R1-R6.
  useBlockMotion(rootRef, () => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    gsap.from(root, {
      y: -24,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  }, []);

  const navLinks = Array.isArray(content.navLinks) ? content.navLinks : [];

  return (
    <header
      ref={rootRef}
      style={composeStyle(
        {
          background: `linear-gradient(180deg, ${SPRINGS_INK} 0%, rgba(23,54,32,0.86) 100%)`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(244,237,225,0.12)',
        },
        blockBackgroundStyle(background)
      )}
      className='springs-header @container sticky top-0 z-40 w-full'
    >
      <style>{SPRINGS_HEADER_FONT_CSS}</style>

      <div
        className='relative flex w-full items-center justify-between'
        style={{
          padding: 'clamp(10px, 2.4cqi, 20px) clamp(16px, 4.4cqi, 48px)',
        }}
      >
        {/* Left — MENU trigger (mở off-canvas; overlay ngoài phạm vi block) */}
        <button
          type='button'
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-label={content.menuLabel || 'Menu'}
          className='springs-header-menu flex min-h-11 items-center'
          style={{
            background: 'transparent',
            border: 0,
            padding: 'clamp(6px, 1cqi, 10px)',
            margin: 'clamp(-6px, -1cqi, -10px)',
            cursor: 'pointer',
            color: SPRINGS_CREAM,
            gap: 'clamp(8px, 1.2cqi, 14px)',
          }}
        >
          <svg
            aria-hidden='true'
            viewBox='0 0 40 10'
            style={{ width: 'clamp(20px, 2.6cqi, 28px)', height: 'auto' }}
          >
            <path d='M40 2H0m40 7H0' stroke='currentColor' strokeWidth='1.5' />
          </svg>
          <span
            data-element-key='menuLabel'
            style={composeStyle(
              {
                fontFamily: SPRINGS_HEADER_FONT,
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.15cqi, 14px)',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: SPRINGS_CREAM,
              },
              styleOf('menuLabel')
            )}
            className={selectableClass(
              activeKey === 'menuLabel',
              'springs-header-menu-label hidden @xs:inline'
            )}
          >
            {content.menuLabel}
          </span>
        </button>

        {/* Center — logo: 2 nửa SVG gốc (wordmark trái + monogram phải) */}
        <a
          href='#top'
          aria-label={content.logoText || 'Springs'}
          className='absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center'
          style={{
            gap: 'clamp(2px, 0.4cqi, 6px)',
            color: SPRINGS_CREAM,
            height: 'clamp(24px, 3.6cqi, 40px)',
          }}
        >
          <span
            data-element-key='logoText'
            className={selectableClass(activeKey === 'logoText', 'sr-only')}
          >
            {content.logoText}
          </span>
          <svg
            aria-hidden='true'
            viewBox='0 0 122 55'
            style={{ height: '100%', width: 'auto' }}
          >
            <g fill='none'>
              <path
                fill='currentColor'
                d='M86.081 50.213c0-1.785.72-2.998 2.233-4.163h7.338c2.998 0 4.14 1.463 4.14 3.125 0 2.255-2.553 4.91-7.661 4.91-3.126-.003-6.05-1.292-6.05-3.872Zm6.446-10.164c-2.902 0-5.157-2.48-5.157-5.877 0-2.976 1.908-5.206 4.686-5.206 2.875 0 5.183 2.454 5.183 5.877 0 2.95-1.934 5.206-4.712 5.206Zm-62.95 6.718c-2.132 0-3.397-.893-4.66-2.256v-11.75c1.24-1.737 2.505-3.149 4.712-3.149 3.42 0 5.777 3.57 5.777 8.63-.003 4.955-2.456 8.525-5.828 8.525ZM55.563 22.89c0 1.09.844 1.909 1.935 1.909 1.067 0 1.885-.818 1.885-1.909 0-1.09-.818-1.885-1.885-1.885-1.094.003-1.934.795-1.934 1.885Zm49.115 22.737c1.687 1.067 3.768 1.934 6.075 1.934 3.57 0 6.371-2.009 6.371-4.959 0-2.032-1.289-3.72-3.745-4.985l-3.992-2.031c-1.785-.919-2.677-2.058-2.677-3.473 0-1.759 1.34-2.95 3.744-2.95 3.694 0 5.131 2.282 5.852 5.654h.571l-.471-4.66a9.55 9.55 0 0 0-5.653-1.886c-3.148 0-6.075 1.636-6.075 4.66 0 1.983 1.239 3.544 3.446 4.686l3.992 2.058c2.058 1.067 2.999 2.304 2.999 3.745 0 1.834-1.711 3.2-4.041 3.2-3.991 0-5.553-2.431-6.224-5.852h-.646l.474 4.859Zm-33.222 1.437v-.62c-2.305-.048-2.778-.197-2.778-.992V34.915l.866-1.613c1.24-2.304 2.603-3.297 4.265-3.297 2.379 0 3.693 1.785 3.693 4.884v10.56c0 .793-.273.942-2.726.994v.62h7.464v-.62c-2.158-.05-2.43-.198-2.43-.993V34.542c0-3.966-1.811-6.224-4.96-6.224-2.553 0-4.413 1.56-5.825 4.712l-.448.993h-.123l.224-5.479h-.47l-4.44.646v.52l1.759.149c.769.074.818.198.818.743v14.85c0 .793-.273.942-2.58.994v.62h7.69ZM.594 44.784c1.986 1.762 5.231 2.852 8.33 2.852 5.258 0 9.049-2.852 9.049-6.792 0-2.554-1.538-4.712-4.836-6.62l-7.013-4.092c-2.158-1.266-3.174-2.976-3.174-4.81 0-2.703 2.233-4.537 5.404-4.537 4.858 0 7.438 3.917 8.207 7.487h.57l-.593-5.653c-2.43-1.736-5.206-2.678-7.786-2.678-4.686 0-7.983 2.652-7.983 6.348 0 2.528 1.438 4.637 4.264 6.296L12.05 36.7c2.232 1.314 3.472 3.05 3.472 5.082 0 2.853-2.405 4.91-6.098 4.91-5.43 0-8.032-3.2-8.827-7.957H0l.594 6.049Zm83.381 5.828c0 2.901 3.495 4.388 7.364 4.388 7.016 0 10.586-3.794 10.586-6.893 0-2.18-1.438-4.017-5.332-4.017h-7.935c-.272-.52-.396-1.14-.396-1.785 0-.72.172-1.464.47-2.133.968.396 2.107.62 3.373.62 4.339 0 7.412-2.651 7.412-6.47 0-2.282-1.14-4.116-3.024-5.158h4.932v-1.96h-.272c-1.886.173-3.82.919-5.183 1.685a8.924 8.924 0 0 0-3.472-.695c-4.365 0-7.464 2.652-7.464 6.497 0 2.282 1.19 4.141 3.248 5.258-.792 1.067-1.661 2.554-1.661 3.842 0 .792.321 1.487 1.19 1.96-1.804 1.042-3.836 2.505-3.836 4.861Zm-27.448-20.01v14.85c0 .793-.273.942-2.58.994v.62h7.487v-.62c-2.106-.05-2.58-.198-2.58-.993V28.544h-.47l-4.434.646v.52l1.759.149c.769.074.818.198.818.743Zm-14.478 0v14.85c0 .793-.272.942-2.379.994v.62h9.123v-.62c-3.943-.05-4.414-.198-4.414-.993v-9.87l.993-2.105c.941-1.983 2.33-2.506 4.414-2.506h1.885v-2.405h-1.214c-2.404 0-4.14 1.166-5.355 4.018l-.791 1.885h-.224l.298-5.925h-.47l-4.44.645v.52l1.76.149c.765.074.814.198.814.743Zm-19.413 0v22.24c0 .792-.273.941-2.379.993v.62h9.123v-.62c-3.943-.049-4.463-.198-4.463-.993v-6.348c1.513.818 3 1.016 4.511 1.016 4.836 0 8.429-4.238 8.429-10.067 0-5.403-2.925-9.249-7.215-9.249-2.356 0-3.943 1.315-5.38 3.223l-.224.298h-.124v-3.17h-.47l-4.44.645v.52l1.76.149c.771.074.872.198.872.743Z'
              />
            </g>
          </svg>
          <svg
            aria-hidden='true'
            viewBox='0 0 29 55'
            style={{ height: '100%', width: 'auto' }}
          >
            <g fill='none'>
              <path
                fill='currentColor'
                d='M14.215 9.045h-2.258l5.329-3.498v-.496H15.57l-4.623 4.29 4.623 5.116h1.716v-.496l-5.292-4.259h2.256c6.7 0 10.431 5.02 10.431 9.904 0 4.654-3.366 9.211-10.63 9.211-7.064 0-12.973-4.324-12.973-13.04h-.66c0 9.872 6.207 14.593 13.634 14.593 7.923 0 11.983-5.415 11.983-10.796-.002-5.28-3.931-10.529-11.82-10.529Z'
              />
              <path
                fill='currentColor'
                d='M14.413 0C6.49 0 2.43 5.415 2.43 10.796c0 5.283 3.928 10.531 11.817 10.531h2.258l-5.329 3.498v.497h1.716l4.623-4.29-4.623-5.117h-1.716v.497l5.292 4.258h-2.255c-6.701 0-10.432-5.019-10.432-9.903 0-4.655 3.366-9.212 10.63-9.212 7.065 0 12.973 4.325 12.973 13.04h.66C28.047 4.721 21.84 0 14.414 0Z'
              />
            </g>
          </svg>
        </a>

        {/* Right — Residences + Contact us + tim yêu thích */}
        <div
          className='flex items-center'
          style={{ gap: 'clamp(10px, 2cqi, 28px)' }}
        >
          <a
            data-element-key='residencesLabel'
            href='#'
            style={composeStyle(
              {
                fontFamily: SPRINGS_HEADER_FONT,
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.15cqi, 14px)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: SPRINGS_CREAM,
              },
              styleOf('residencesLabel')
            )}
            className={selectableClass(
              activeKey === 'residencesLabel',
              'springs-header-link flex min-h-11 items-center transition-opacity hover:opacity-70'
            )}
          >
            {content.residencesLabel}
          </a>

          <a
            data-element-key='contactLabel'
            href='#'
            style={composeStyle(
              {
                fontFamily: SPRINGS_HEADER_FONT,
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.15cqi, 14px)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: SPRINGS_CREAM,
              },
              styleOf('contactLabel')
            )}
            className={selectableClass(
              activeKey === 'contactLabel',
              'springs-header-link hidden min-h-11 items-center transition-opacity hover:opacity-70 @2xl:flex'
            )}
          >
            {content.contactLabel}
          </a>

          <button
            type='button'
            aria-label='Favourites'
            className='flex min-h-11 min-w-11 items-center justify-center hover:opacity-70'
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: SPRINGS_CREAM,
              transition: 'opacity 150ms ease',
            }}
          >
            <Heart
              aria-hidden='true'
              strokeWidth={1.5}
              style={{ width: 'clamp(15px, 1.6cqi, 18px)', height: 'auto' }}
            />
          </button>
        </div>
      </div>

      {/* Panel tối giản cho `navLinks` (đóng vai trò placeholder off-canvas
          menu — overlay đầy đủ ngoài phạm vi block này). */}
      {menuOpen && navLinks.length > 0 ? (
        <div
          data-element-key='navLinks'
          className='springs-header-nav-panel absolute inset-x-0 top-full'
          style={{
            background: SPRINGS_INK_DEEP,
            borderTop: '1px solid rgba(244,237,225,0.14)',
          }}
        >
          <ul
            className='flex flex-col'
            style={{
              padding:
                'clamp(8px, 1.6cqi, 16px) clamp(16px, 4.4cqi, 48px) clamp(12px, 2.2cqi, 20px)',
            }}
          >
            {navLinks.map((link, i) => (
              <li key={`${link.label}-${i}`}>
                <a
                  href={link.href || '#'}
                  className='flex min-h-11 items-center'
                  style={{
                    fontFamily: SPRINGS_HEADER_FONT,
                    fontWeight: 400,
                    fontSize: 'clamp(13px, 1.6cqi, 17px)',
                    letterSpacing: '0.06em',
                    color: SPRINGS_CREAM,
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
