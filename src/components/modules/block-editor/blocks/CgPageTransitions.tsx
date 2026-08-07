'use client';

/**
 * Block "Page Transitions" (port Codegrid `cg-js-page-transitions`) —
 * giữ timing / stagger gốc:
 *
 *  - ease: power4.inOut, duration 1, stagger each 0.1 axis x
 *  - Mount: blocks scaleY 1 → 0 (reveal), rồi visibility hidden
 *  - Nav click: scaleY 0 → 1 (cover) → đổi trang → scaleY 1 → 0 (reveal)
 *
 * Host: canvas = flat edit (mọi page title + nav); PreviewMode + /p =
 * composition thật + GSAP. Overlay absolute trong block (không portal).
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CgPageTransitionsContent,
  CgPageTransitionsPage,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  CG_PAGE_TRANSITIONS_DEFAULTS,
  resolveCgPageTransitionsPages,
} from './_registry/defs/cgPageTransitions';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: CgPageTransitionsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const EASE = 'power4.inOut';
const TRANSITION_COLOR = '#746df8';
const PAGE_BG = '#f3f3f0';
const FONT_BODY =
  '"Bagoss Standard TRIAL", "Helvetica Neue", Helvetica, Arial, sans-serif';
const FONT_DISPLAY = '"VTC Carrie", "Times New Roman", Georgia, serif';

const ROWS = 2;
const COLS = 5;

const staggerCover = {
  each: 0.1,
  from: 'start' as const,
  grid: [ROWS, COLS] as [number, number],
  axis: 'x' as const,
};

const staggerReveal = {
  each: 0.1,
  from: 'start' as const,
  grid: 'auto' as const,
  axis: 'x' as const,
};

export function CgPageTransitions({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const blocksRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const transitioning = React.useRef(false);
  const isCanvas = useIsCanvasEdit(rootRef);

  const [pageIndex, setPageIndex] = React.useState(0);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const pages = resolveCgPageTransitionsPages(content);
  const logoText =
    content.logoText?.trim() || CG_PAGE_TRANSITIONS_DEFAULTS.logoText;

  const safeIndex = Math.min(
    Math.max(0, pageIndex),
    Math.max(0, pages.length - 1)
  );
  const activePage: CgPageTransitionsPage =
    pages[safeIndex] ?? CG_PAGE_TRANSITIONS_DEFAULTS.pages[0];

  const getBlocks = () => blocksRef.current.filter(Boolean) as HTMLDivElement[];

  const revealTransition = React.useCallback(() => {
    const blocks = getBlocks();
    if (blocks.length === 0) return Promise.resolve();
    return new Promise<void>(resolve => {
      gsap.set(blocks, { visibility: 'visible', scaleY: 1 });
      gsap.to(blocks, {
        scaleY: 0,
        duration: 1,
        stagger: staggerReveal,
        ease: EASE,
        onComplete: () => {
          gsap.set(blocks, { visibility: 'hidden' });
          resolve();
        },
      });
    });
  }, []);

  const coverTransition = React.useCallback(() => {
    const blocks = getBlocks();
    if (blocks.length === 0) return Promise.resolve();
    return new Promise<void>(resolve => {
      gsap.set(blocks, { visibility: 'visible', scaleY: 0 });
      gsap.to(blocks, {
        scaleY: 1,
        duration: 1,
        stagger: staggerCover,
        ease: EASE,
        onComplete: resolve,
      });
    });
  }, []);

  // Entrance reveal — PreviewMode + /p only
  React.useEffect(() => {
    if (isCanvas) return;
    const blocks = getBlocks();
    if (blocks.length === 0) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(blocks, { scaleY: 0, visibility: 'hidden' });
        return;
      }
      void revealTransition();
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, [isCanvas, revealTransition]);

  const handleGoToPage = async (nextIndex: number) => {
    if (isCanvas) return;
    if (transitioning.current) return;
    if (nextIndex === safeIndex) return;
    if (nextIndex < 0 || nextIndex >= pages.length) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    transitioning.current = true;
    try {
      if (reduce) {
        setPageIndex(nextIndex);
        return;
      }
      await coverTransition();
      setPageIndex(nextIndex);
      await revealTransition();
    } finally {
      transitioning.current = false;
    }
  };

  const bgStyle = blockBackgroundStyle(background);

  const navLinkBase: React.CSSProperties = {
    textDecoration: 'none',
    color: '#000000',
    fontSize: 16,
    fontWeight: 500,
    fontFamily: FONT_BODY,
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  };

  const heroTitleBase: React.CSSProperties = {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: 'clamp(64px, 15cqi, 15vw)',
    lineHeight: '90%',
    fontWeight: 400,
    color: '#000000',
    textAlign: 'center',
  };

  const setBlockRef = (i: number) => (el: HTMLDivElement | null) => {
    blocksRef.current[i] = el;
  };

  // ── Canvas: flat edit — mọi field chọn được ──────────────────────────
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          {
            backgroundColor: PAGE_BG,
            minHeight: 360,
            padding: 'clamp(24px, 4cqi, 48px)',
            fontFamily: FONT_BODY,
            ...bgStyle,
          },
          {}
        )}
      >
        <div className='flex flex-col gap-8'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <span
              data-element-key='logoText'
              className={selectableClass(activeKey === 'logoText')}
              style={composeStyle(navLinkBase, styleOf('logoText'))}
            >
              {logoText}
            </span>
            <div className='flex flex-wrap items-center gap-6'>
              {pages.map((page, i) => {
                const key = `pages[${i}].navLabel`;
                return (
                  <span
                    key={key}
                    data-element-key={key}
                    className={selectableClass(activeKey === key)}
                    style={composeStyle(navLinkBase, styleOf(key))}
                  >
                    {page.navLabel?.trim() || `Nav ${i + 1}`}
                  </span>
                );
              })}
            </div>
          </div>

          <div className='grid gap-6 @2xl:grid-cols-3'>
            {pages.map((page, i) => {
              const key = `pages[${i}].title`;
              return (
                <div
                  key={key}
                  className='flex min-h-30 items-center justify-center'
                  style={{
                    border: '1px dashed rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    padding: 16,
                  }}
                >
                  <h2
                    data-element-key={key}
                    className={selectableClass(activeKey === key)}
                    style={composeStyle(
                      {
                        ...heroTitleBase,
                        fontSize: 'clamp(32px, 8cqi, 64px)',
                      },
                      styleOf(key)
                    )}
                  >
                    {page.title?.trim() || `Page ${i + 1}`}
                  </h2>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ── Preview + /p ─────────────────────────────────────────────────────
  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full overflow-hidden', className)}
      style={composeStyle(
        {
          backgroundColor: PAGE_BG,
          minHeight: 'clamp(480px, 100cqi, 100svh)',
          fontFamily: FONT_BODY,
          ...bgStyle,
        },
        {}
      )}
    >
      {/* Transition curtain — 2 rows × 5 cols */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 z-2 flex flex-col'
      >
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={`row-${row}`} className='flex min-h-0 flex-1'>
            {Array.from({ length: COLS }, (_, col) => {
              const i = row * COLS + col;
              return (
                <div
                  key={`block-${i}`}
                  ref={setBlockRef(i)}
                  className='min-w-0 flex-1'
                  style={{
                    backgroundColor: TRANSITION_COLOR,
                    transform: 'scaleY(1)',
                    transformOrigin: row === 0 ? 'top' : 'bottom',
                    willChange: 'transform',
                    visibility: 'visible',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <nav
        className='absolute inset-x-0 top-0 z-1 flex items-center justify-between'
        style={{ padding: 'clamp(16px, 2cqi, 32px)' }}
        aria-label='Page navigation'
      >
        <button
          type='button'
          data-element-key='logoText'
          className={selectableClass(activeKey === 'logoText')}
          style={composeStyle(navLinkBase, styleOf('logoText'))}
          onClick={() => void handleGoToPage(0)}
          aria-label={logoText}
        >
          {logoText}
        </button>
        <div
          className='flex flex-wrap items-center justify-center'
          style={{ gap: 'clamp(16px, 2cqi, 32px)' }}
        >
          {pages.map((page, i) => {
            const key = `pages[${i}].navLabel`;
            const label = page.navLabel?.trim() || `Nav ${i + 1}`;
            return (
              <button
                type='button'
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(navLinkBase, styleOf(key))}
                onClick={() => void handleGoToPage(i)}
                aria-label={label}
                aria-current={i === safeIndex ? 'page' : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <div
        className='absolute left-1/2 z-1'
        style={{
          top: '47.5%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
        }}
      >
        <h1
          data-element-key={`pages[${safeIndex}].title`}
          className={selectableClass(activeKey === `pages[${safeIndex}].title`)}
          style={composeStyle(
            heroTitleBase,
            styleOf(`pages[${safeIndex}].title`)
          )}
        >
          {activePage.title?.trim() || 'Index'}
        </h1>
      </div>
    </section>
  );
}
