'use client';

/**
 * Block "Sub-nav - Floating Pill" (thanh `.sticky-menu` của delvaux-clone).
 *
 * Bám JS gốc `stickyMenu()`:
 *  - Trạng thái đầu: 3 anchor link hiện, nút "Book" ẨN (width 0/alpha 0),
 *    nút "BUY NOW" hiện. Entrance trượt từ dưới lên 1s.
 *  - SCROLLSPY: link active có gạch chân (scaleX 0→1) khi section tương ứng
 *    trong viewport (IntersectionObserver — chạy cả window lẫn editor canvas).
 *  - Khi variant sang stage "done" (event `delvaux:variant-done`): 3 link thu
 *    lại (width 0/alpha 0), nút Book hiện ra → pill = BOOK + BUY NOW
 *    (power2.inOut 0.5s như timeline gốc).
 *  - Khi panel/popup mở (event `delvaux:overlay`): pill ẩn (`.hide` gốc).
 *
 * /p: portal fixed bottom 40px; editor: in-flow preview.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useLandingMotion } from '../motion/LandingMotion';
import { DELVAUX_FONT_BODY, DELVAUX_FONT_CSS } from './delvauxTheme';
import type {
  BlockBackground,
  DelvauxSubnavContent,
  ElementPositionsMap,
  ElementStylesMap,
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
  content: DelvauxSubnavContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function DelvauxSubnav({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const pillRef = React.useRef<HTMLDivElement>(null);
  const { scroller, hasRoot } = useLandingMotion();
  // Chỉ portal fixed khi thật sự ở trang render (LandingMotionRoot + window
  // scroller = /p). Mini-preview/thumbnail không có root → render in-flow.
  const isPublic = hasRoot && scroller === null;
  const [mounted, setMounted] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // variant stage "done" → morph pill (Book hiện, links ẩn)
  const [skuMode, setSkuMode] = React.useState(false);
  // panel/popup đang mở → ẩn pill (`.sticky-menu.hide` gốc)
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Entrance gốc: bottom -40px → 40px trong 1s.
  React.useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.from(pill, {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
    });
    return () => {
      tween.kill();
    };
  }, [mounted, isPublic]);

  // Cross-block events từ variant/product (dispatch trên window).
  React.useEffect(() => {
    const onDone = (e: Event) =>
      setSkuMode(Boolean((e as CustomEvent).detail?.done));
    const onOverlay = (e: Event) =>
      setHidden(Boolean((e as CustomEvent).detail?.open));
    window.addEventListener('delvaux:variant-done', onDone);
    window.addEventListener('delvaux:overlay', onOverlay);
    return () => {
      window.removeEventListener('delvaux:variant-done', onDone);
      window.removeEventListener('delvaux:overlay', onOverlay);
    };
  }, []);

  // SCROLLSPY: theo dõi các section đích, set link active.
  const links = content.links ?? [];
  React.useEffect(() => {
    if (!mounted) return;
    const targets = links
      .map(l => document.getElementById(l.targetId))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) setActiveId(en.target.id);
        });
      },
      { rootMargin: '-50% 0px -49.9% 0px' }
    );
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [mounted, links.map(l => l.targetId).join('|')]);

  const scrollToTarget = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const btnStyle: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: '12px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    color: '#ffffff',
    background: '#111111',
    border: '1px solid #111111',
    padding: '12px 24px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
  };

  const pill = (
    <div
      ref={pillRef}
      className='delvaux-subnav-pill flex items-center'
      style={{
        background: '#ffffff',
        padding: '8px 16px',
        maxWidth: 'max-content',
        justifyContent: 'center',
        opacity: hidden ? 0 : 1,
        visibility: hidden ? 'hidden' : 'visible',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
      }}
    >
      {/* 3 anchor link — thu gọn khi skuMode (timeline gốc: width 0/alpha 0) */}
      <div
        data-element-key='links'
        style={composeStyle(
          {
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            maxWidth: skuMode ? '0px' : '640px',
            opacity: skuMode ? 0 : 1,
            transition:
              'max-width 0.5s cubic-bezier(0.45,0,0.55,1), opacity 0.5s cubic-bezier(0.45,0,0.55,1)',
          },
          styleOf('links')
        )}
        className={selectableClass(activeKey === 'links')}
      >
        {links.map((link, i) => {
          const isActive = activeId === link.targetId;
          return (
            <a
              key={`${link.targetId}-${i}`}
              href={`#${link.targetId}`}
              onClick={scrollToTarget(link.targetId)}
              className='delvaux-subnav-link relative'
              style={{
                fontFamily: DELVAUX_FONT_BODY,
                fontSize: '12px',
                lineHeight: '24px',
                padding: '6px 16px',
                color: isActive ? '#111111' : 'rgba(17,17,17,0.4)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#111111';
              }}
              onMouseLeave={e => {
                if (activeId !== link.targetId)
                  e.currentTarget.style.color = 'rgba(17,17,17,0.4)';
              }}
            >
              {link.label}
              {/* gạch chân active (gốc: ::before scaleX 0→1) */}
              <span
                aria-hidden='true'
                style={{
                  position: 'absolute',
                  left: '16px',
                  right: '16px',
                  bottom: '4px',
                  height: '1px',
                  background: '#111111',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: isActive ? 'bottom left' : 'bottom right',
                  transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </a>
          );
        })}
      </div>

      {/* Nút Book — gốc: ẩn (width 0/alpha 0), chỉ hiện ở stage done */}
      {content.bookLabel ? (
        <div
          style={{
            overflow: 'hidden',
            maxWidth: skuMode ? '320px' : '0px',
            opacity: skuMode ? 1 : 0,
            transition:
              'max-width 0.5s cubic-bezier(0.45,0,0.55,1), opacity 0.5s cubic-bezier(0.45,0,0.55,1)',
          }}
        >
          <a
            data-element-key='bookLabel'
            href={content.bookUrl || '#'}
            target={content.bookUrl ? '_blank' : undefined}
            rel='noreferrer'
            style={composeStyle(btnStyle, styleOf('bookLabel'))}
            className={selectableClass(activeKey === 'bookLabel', 'block')}
          >
            {content.bookLabel}
          </a>
        </div>
      ) : null}

      {content.buyLabel ? (
        <a
          data-element-key='buyLabel'
          href={content.buyUrl || '#'}
          target={content.buyUrl ? '_blank' : undefined}
          rel='noreferrer'
          style={composeStyle(
            { ...btnStyle, marginLeft: '14px' },
            styleOf('buyLabel')
          )}
          className={selectableClass(activeKey === 'buyLabel')}
        >
          {content.buyLabel}
        </a>
      ) : null}
    </div>
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='delvaux-subnav @container relative w-full'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      {isPublic && mounted ? (
        createPortal(
          <div
            className='delvaux-subnav-fixed'
            style={{
              position: 'fixed',
              bottom: '40px',
              left: 0,
              right: 0,
              zIndex: 99,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>{pill}</div>
          </div>,
          document.body
        )
      ) : (
        <div
          className='flex w-full justify-center'
          style={{ padding: 'clamp(12px, 1.6cqi, 16px) 8px' }}
        >
          {pill}
        </div>
      )}
    </section>
  );
}
