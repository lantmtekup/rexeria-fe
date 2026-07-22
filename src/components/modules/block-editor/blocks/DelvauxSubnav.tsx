'use client';

/**
 * Block "Sub-nav - Floating Pill" (thanh `.sticky-menu` của delvaux-clone).
 *
 * Bám JS gốc `stickyMenu()`:
 *  - Trạng thái đầu: 3 anchor link hiện, nút "Book" ẨN (width 0/alpha 0),
 *    nút "BUY NOW" hiện. Entrance trượt từ dưới lên 1s.
 *  - SCROLLSPY: link active có gạch chân khi section tương ứng trong viewport.
 *  - `delvaux:variant-done` → morph pill (Book hiện, links ẩn).
 *  - `delvaux:overlay` → pill ẩn.
 *
 * Ba bề mặt (apps-port-host / PnjStickyMenu):
 *  - Editor canvas: in-flow, hiện cả links + Book (không morph ẩn)
 *  - PreviewMode: portal `absolute` → `[data-device-frame]`
 *  - /p: portal `fixed` → document.body
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
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

  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [skuMode, setSkuMode] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!hasRoot) {
      setIsCanvas(false);
      setPortalHost(resolveDrawerPortalHost(root));
      return;
    }
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);
  // Canvas: luôn hiện links + Book để chọn/sửa; production giữ morph skuMode.
  const showSkuMorph = !isCanvas && skuMode;
  const showHidden = !isCanvas && hidden;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    if (!mounted) return;
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
  }, [mounted, useFixed, isCanvas]);

  React.useEffect(() => {
    if (isCanvas) return;
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
  }, [isCanvas]);

  const links = content.links ?? [];
  const linkTargetsKey = links.map(l => l.targetId).join('|');

  React.useEffect(() => {
    if (!mounted || isCanvas) return;
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
      {
        root: scroller ?? null,
        rootMargin: '-50% 0px -49.9% 0px',
      }
    );
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- linkTargetsKey tracks target ids
  }, [mounted, isCanvas, linkTargetsKey, scroller]);

  const handleScrollToTarget = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCanvas) return;
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const btnStyle: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(11px, 1.1cqi, 12px)',
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
        opacity: showHidden ? 0 : 1,
        visibility: showHidden ? 'hidden' : 'visible',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
      }}
    >
      <div
        data-element-key='links'
        style={composeStyle(
          {
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            maxWidth: showSkuMorph ? '0px' : '640px',
            opacity: showSkuMorph ? 0 : 1,
            transition:
              'max-width 0.5s cubic-bezier(0.45,0,0.55,1), opacity 0.5s cubic-bezier(0.45,0,0.55,1)',
          },
          styleOf('links')
        )}
        className={selectableClass(activeKey === 'links')}
      >
        {links.map((link, i) => {
          const isActive = !isCanvas && activeId === link.targetId;
          const labelKey = `links[${i}].label`;
          return (
            <a
              key={`${link.targetId}-${i}`}
              href={`#${link.targetId}`}
              data-element-key={labelKey}
              onClick={handleScrollToTarget(link.targetId)}
              className={selectableClass(
                activeKey === labelKey,
                'delvaux-subnav-link relative'
              )}
              style={composeStyle(
                {
                  fontFamily: DELVAUX_FONT_BODY,
                  fontSize: 'clamp(11px, 1.1cqi, 12px)',
                  lineHeight: '24px',
                  padding: '6px 16px',
                  color: isActive ? '#111111' : 'rgba(17,17,17,0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  whiteSpace: 'nowrap',
                },
                styleOf(labelKey)
              )}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#111111';
              }}
              onMouseLeave={e => {
                if (activeId !== link.targetId)
                  e.currentTarget.style.color = 'rgba(17,17,17,0.4)';
              }}
            >
              {link.label}
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

      {content.bookLabel ? (
        <div
          style={{
            overflow: 'hidden',
            // Canvas: luôn hiện Book cạnh links để edit.
            maxWidth: isCanvas || showSkuMorph ? '320px' : '0px',
            opacity: isCanvas || showSkuMorph ? 1 : 0,
            transition:
              'max-width 0.5s cubic-bezier(0.45,0,0.55,1), opacity 0.5s cubic-bezier(0.45,0,0.55,1)',
          }}
        >
          <a
            data-element-key='bookLabel'
            href={isCanvas ? undefined : content.bookUrl || '#'}
            target={!isCanvas && content.bookUrl ? '_blank' : undefined}
            rel='noreferrer'
            onClick={isCanvas ? e => e.preventDefault() : undefined}
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
          href={isCanvas ? undefined : content.buyUrl || '#'}
          target={!isCanvas && content.buyUrl ? '_blank' : undefined}
          rel='noreferrer'
          onClick={isCanvas ? e => e.preventDefault() : undefined}
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

  const overlay = (
    <div
      className='delvaux-subnav-fixed'
      style={{
        position: inFrame ? 'absolute' : 'fixed',
        bottom: 'clamp(24px, 4cqi, 40px)',
        left: 0,
        right: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>{pill}</div>
    </div>
  );

  if (useFixed && portalHost) {
    return (
      <section
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className='delvaux-subnav @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      >
        <style>{DELVAUX_FONT_CSS}</style>
        {createPortal(overlay, portalHost)}
      </section>
    );
  }

  if (!mounted || (hasRoot && !isCanvas)) {
    return (
      <section
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className='delvaux-subnav @container relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0'
      >
        <style>{DELVAUX_FONT_CSS}</style>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-canvas-edit='true'
      style={composeStyle({ minHeight: 72 }, blockBackgroundStyle(background))}
      className='delvaux-subnav @container relative w-full'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <div
        className='flex w-full justify-center'
        style={{ padding: 'clamp(12px, 1.6cqi, 16px) 8px' }}
      >
        {pill}
      </div>
    </section>
  );
}
