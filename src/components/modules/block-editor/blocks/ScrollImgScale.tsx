'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ScrollImgScaleContent,
  ScrollImgScaleItem,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { SCROLL_IMG_SCALE_DEFAULT_ITEMS } from './_registry/defs/scrollImgScale';
import { useContainerMobile } from './useContainerMobile';

interface ScrollImgScaleProps {
  content: ScrollImgScaleContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Scroll Img Scale — port từ CodeGrid cg-scroll-img-scale (discord 087).
 *
 * Danh sách title + ảnh căn giữa; khi cuộn, mỗi ảnh scale theo khoảng cách
 * tới tâm viewport (gần tâm → 1, xa → 0). Bỏ lerp hijack scroll của bản gốc
 * (Lenis host lo smooth scroll).
 */

const DISPLAY_FONT =
  "'Syne', 'Archivo Black', system-ui, -apple-system, sans-serif";

const DEFAULT_ITEMS = SCROLL_IMG_SCALE_DEFAULT_ITEMS;

const resolveItems = (
  raw: ScrollImgScaleItem[] | undefined
): ScrollImgScaleItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_ITEMS.map(item => ({ ...item }));
  }
  return raw.map((item, i) => {
    const fallback =
      DEFAULT_ITEMS[i % DEFAULT_ITEMS.length] ?? DEFAULT_ITEMS[0];
    return {
      title: item.title?.trim() || fallback.title || `Item ${i + 1}`,
      imageUrl: item.imageUrl?.trim() || fallback.imageUrl || '',
      imageAlt: item.imageAlt?.trim() || fallback.imageAlt || '',
    };
  });
};

export function ScrollImgScale({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ScrollImgScaleProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = React.useMemo(
    () => resolveItems(content.items),
    [content.items]
  );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root || isCanvas) return;

      const imgWraps = gsap.utils.toArray<HTMLElement>('.sis-img', root);
      if (!imgWraps.length) return;

      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) {
        gsap.set(imgWraps, { scale: 1 });
        return;
      }

      gsap.set(imgWraps, { scale: 0 });

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      const setScale = () => {
        const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
        const viewH = scroller ? scroller.clientHeight : window.innerHeight;
        const viewCenter = viewTop + viewH / 2;

        const itemEls = gsap.utils.toArray<HTMLElement>('.sis-item', root);
        itemEls.forEach(item => {
          const img = item.querySelector<HTMLElement>('.sis-img');
          if (!img) return;
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(viewCenter - itemCenter);
          const progress = distanceFromCenter / (viewH / 2);
          const adjustedProgress = Math.pow(progress, 2);
          let scale = 1 - adjustedProgress * 0.5;
          scale = Math.max(0, Math.min(scale, 1));
          gsap.to(img, { scale, duration: 0.1, overwrite: 'auto' });
        });
      };

      ScrollTrigger.create({
        trigger: root,
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: setScale,
        onRefresh: setScale,
      });

      setScale();
    },
    [isCanvas, items.length, isMobile]
  );

  const titleBase = (): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(1.25rem, 7cqi, 1.875rem)'
      : 'clamp(2rem, 8cqi, 5rem)',
    width: '100%',
    textAlign: 'center',
    fontWeight: 600,
    textTransform: 'uppercase',
    margin: 0,
    lineHeight: 1.1,
    zIndex: 2,
    pointerEvents: 'auto',
  });

  /** Outer: center via CSS translate. Inner `.sis-img`: GSAP scale only. */
  const imgAnchorBase = (): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  });

  const imgWrapBase = (): React.CSSProperties => ({
    width: isMobile ? 'min(225px, 56cqi)' : 'min(500px, 48cqi)',
    height: isMobile ? 'min(125px, 31cqi)' : 'min(300px, 28cqi)',
    overflow: 'hidden',
    transformOrigin: 'center center',
  });

  const renderItem = (
    item: ScrollImgScaleItem,
    i: number,
    compact: boolean
  ) => {
    const titleKey = `items[${i}].title`;
    const imgKey = `items[${i}].imageUrl`;
    return (
      <div
        key={`${titleKey}-${imgKey}`}
        className={cn(
          'sis-item relative w-full',
          compact ? 'h-[180px]' : 'h-[300px]'
        )}
        style={compact ? { minHeight: 160 } : undefined}
      >
        <h2
          data-element-key={titleKey}
          className={selectableClass(activeKey === titleKey)}
          style={composeStyle(titleBase(), styleOf(titleKey))}
        >
          {item.title}
        </h2>
        <div style={imgAnchorBase()}>
          <div className='sis-img' style={imgWrapBase()}>
            <img
              src={item.imageUrl}
              alt={item.imageAlt || item.title || ''}
              data-element-key={imgKey}
              className={selectableClass(
                activeKey === imgKey,
                'h-full w-full object-cover'
              )}
              style={styleOf(imgKey)}
              draggable={false}
            />
          </div>
        </div>
      </div>
    );
  };

  // ── Editor canvas: flat list, scale 1, mọi field bấm được ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: '#0f0f0f', minHeight: 320 },
          blockBackgroundStyle(background)
        )}
      >
        <div className='flex flex-col'>
          {items.map((item, i) => renderItem(item, i, true))}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: production list + center-distance scale ──
  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        { backgroundColor: '#0f0f0f' },
        blockBackgroundStyle(background)
      )}
    >
      <div className='sis-list flex flex-col'>
        {items.map((item, i) => renderItem(item, i, false))}
      </div>
    </section>
  );
}
