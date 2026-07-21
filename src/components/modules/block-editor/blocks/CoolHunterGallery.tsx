'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  CoolHunterGalleryContent,
  CoolHunterGalleryItem,
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
import { useContainerMobile } from './useContainerMobile';

interface CoolHunterGalleryProps {
  content: CoolHunterGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Cool Hunter Gallery — port từ apps/cool-hunter GallerySection.tsx.
 *
 * Dải ngang 3 ảnh+caption: stack lệch → hàng → settle + scroll (mobile dừng
 * từng khối; desktop cuộn liền). Text fade theo nhịp.
 *
 * Khác apps: pin → sticky (outer 620/380dvh), viewport matchMedia →
 * useContainerMobile, mọi vw/vh → % stage (offsetWidth/offsetHeight).
 */

const DISPLAY_FONT = "'Fraunces', 'Playfair Display', 'Times New Roman', serif";

const DEFAULT_ITEMS: CoolHunterGalleryItem[] = [
  {
    imageUrl: '/cool-hunter/gallery-1.webp',
    imageAlt:
      'An arched hallway with steel-framed glass walls and a lantern pendant',
    text: 'The approach allowed maximum square footage without an imposing footprint, while creating multiple exposures to flood the interiors with natural light. Set on a peninsula jutting into the lake, the orientation provides water views on three sides; the entire plan was optimised to frame them. "I thought of the house as a camera and tried to frame and crop as many views of the lake as possible to make the setting as picturesque as it could be."',
  },
  {
    imageUrl: '/cool-hunter/gallery-2.webp',
    imageAlt: 'A breakfast nook with leaded windows and built-in benches',
    text: 'The approach allowed maximum square footage without an imposing footprint, while creating multiple exposures to flood the interiors with natural light. Set on a peninsula jutting into the lake, the orientation provides water views on three sides; the entire plan was optimised to frame them.',
  },
  {
    imageUrl: '/cool-hunter/gallery-3.webp',
    imageAlt:
      'A kitchen with oak cabinetry, marble counters and leaded windows',
    text: "Betsy Brown's interiors are almost monastic in their restraint, ruthlessly edited until every object asked to stay. She started with a Kaare Klint dining table, Danish modern pieces enjoyed by cognoscenti, leather because it wears, and everything else earned its place.",
  },
];

/** Layout numbers as % of stage width (apps used vw). */
const LAYOUT = {
  mobile: { img: 78, text: 78, gap: 8 },
  desktop: { img: 30, text: 26, gap: 4, minTextLeft: 64 },
};

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  backgroundColor: '#ffffff',
  containerType: 'size',
};

const resolveItems = (
  raw: CoolHunterGalleryItem[] | undefined
): CoolHunterGalleryItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_ITEMS;
  return raw.map((item, i) => {
    const fallback = DEFAULT_ITEMS[i] ?? DEFAULT_ITEMS[0];
    return {
      imageUrl: item.imageUrl?.trim() || fallback.imageUrl,
      imageAlt: item.imageAlt?.trim() || fallback.imageAlt || '',
      text: item.text?.trim() || fallback.text || '',
    };
  });
};

export function CoolHunterGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CoolHunterGalleryProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
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
  const L = isMobile ? LAYOUT.mobile : LAYOUT.desktop;

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!root || !stage || !track || isCanvas) return;

      const q = gsap.utils.selector(stage);
      const imgs = q('[data-gallery-img]');
      const texts = q('[data-gallery-text]');
      if (!imgs.length || !texts.length) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) {
        gsap.set(texts, { autoAlpha: 1 });
        return;
      }

      const stageW = () => stage.offsetWidth;
      const px = (pct: number) => (pct / 100) * stageW();

      const slot = (i: number) => i * (L.img + L.text + 2 * L.gap);
      const textSlot = (i: number) => slot(i) + L.img + L.gap;
      const spreadGap = isMobile ? 8 : L.gap;
      const firstLeft = isMobile ? (100 - L.img) / 2 : 3;
      const rowX = (i: number) => firstLeft + i * (L.img + spreadGap) - slot(i);
      const stackX = (i: number) => -L.img + 12 - i * 10 + firstLeft - slot(i);

      const trackStart = firstLeft;
      const lastIndex = items.length - 1;
      const trackEnd = isMobile
        ? firstLeft - textSlot(lastIndex)
        : Math.max(
            -(slot(lastIndex - 1) + L.img),
            LAYOUT.desktop.minTextLeft - textSlot(lastIndex)
          );
      const C_DUR = 2;
      const textBeat = (i: number) =>
        gsap.utils.clamp(
          0,
          1,
          (88 - textSlot(i) - trackStart) / (trackEnd - trackStart)
        ) * C_DUR;

      stage.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      // A: stack → row
      imgs.forEach((img, i) => {
        tl.fromTo(
          img,
          { x: () => px(stackX(i)) },
          { x: () => px(rowX(i)), duration: 1 },
          i === 0 ? 0 : '<'
        );
      });

      // B: settle + track inset
      tl.to(imgs, { x: 0, duration: 0.8 }, '+=0.3');
      tl.to(track, { x: () => px(trackStart), duration: 0.8 }, '<');
      if (!isMobile && texts[0]) {
        tl.to(texts[0], { autoAlpha: 1, duration: 0.4 }, '<');
      }

      const cStart = tl.duration() + 0.4;

      if (isMobile) {
        const stops: Array<{ at: number; text?: number }> = [];
        for (let i = 0; i < items.length; i++) {
          stops.push({ at: textSlot(i), text: i });
          if (i < lastIndex) {
            stops.push({ at: slot(i + 1) });
          }
        }
        stops.forEach((stop, k) => {
          const pos = k === 0 ? cStart : '+=0.5';
          tl.to(
            track,
            { x: () => px(firstLeft - stop.at), duration: 0.9 },
            pos
          );
          if (stop.text !== undefined && texts[stop.text]) {
            tl.to(texts[stop.text], { autoAlpha: 1, duration: 0.35 }, '<-0.3');
          }
        });
        tl.to({}, { duration: 0.7 });
        return;
      }

      // Desktop continuous scroll
      tl.to(track, { x: () => px(trackEnd), duration: C_DUR }, cStart);
      for (let i = 1; i < texts.length; i++) {
        tl.to(
          texts[i],
          { autoAlpha: 1, duration: 0.3 },
          Math.max(cStart, cStart + textBeat(i))
        );
      }
      tl.to({}, { duration: 0.5 }, cStart + C_DUR);
    },
    [isCanvas, isMobile, items.length, L.gap, L.img, L.text]
  );

  const textBase = (mobile: boolean): React.CSSProperties => ({
    flex: 'none',
    width: `${L.text}cqw`,
    margin: 0,
    fontFamily: DISPLAY_FONT,
    fontSize: mobile
      ? 'clamp(0.9375rem, 3.2cqi, 1rem)'
      : 'clamp(1.125rem, 2cqi, 1.25rem)',
    lineHeight: 1.625,
    color: '#171717',
    opacity: 0,
  });

  // ── Editor canvas: stacked cards, mọi field bấm được ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full bg-white', className)}
        style={composeStyle(
          { minHeight: 420 },
          blockBackgroundStyle(background)
        )}
      >
        <div className='flex flex-col gap-8 px-[6cqi] py-[6cqi]'>
          {items.map((item, i) => {
            const imgKey = `items[${i}].imageUrl`;
            const textKey = `items[${i}].text`;
            return (
              <div key={imgKey} className='flex flex-col gap-3'>
                <div
                  className='relative w-full overflow-hidden'
                  style={{ aspectRatio: '4 / 3' }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || ''}
                    data-element-key={imgKey}
                    className={selectableClass(
                      activeKey === imgKey,
                      'h-full w-full object-cover'
                    )}
                    style={styleOf(imgKey)}
                  />
                </div>
                <p
                  data-element-key={textKey}
                  className={selectableClass(activeKey === textKey)}
                  style={composeStyle(
                    {
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(0.9375rem, 2.8cqi, 1.125rem)',
                      lineHeight: 1.625,
                      color: '#171717',
                    },
                    styleOf(textKey)
                  )}
                >
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: sticky stage + horizontal scrub ──
  return (
    <section
      ref={rootRef}
      data-section='lake-wehapa'
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          height: isMobile ? '620dvh' : '380dvh',
          backgroundColor: '#ffffff',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div ref={stageRef} style={STAGE_STYLE}>
        <div
          ref={trackRef}
          className='absolute left-0 flex w-max items-center'
          style={{
            top: isMobile ? '24%' : '21%',
            height: isMobile ? '46%' : '58%',
            gap: `${L.gap}cqw`,
          }}
        >
          {items.map((item, i) => {
            const imgKey = `items[${i}].imageUrl`;
            const textKey = `items[${i}].text`;
            return (
              <React.Fragment key={imgKey}>
                <div
                  data-gallery-img
                  className='h-full flex-none overflow-hidden'
                  style={{
                    position: 'relative',
                    width: `${L.img}cqw`,
                    zIndex: items.length - i,
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || ''}
                    data-element-key={imgKey}
                    className={selectableClass(
                      activeKey === imgKey,
                      'h-full w-full object-cover'
                    )}
                    style={styleOf(imgKey)}
                  />
                </div>
                <div
                  data-gallery-text
                  data-element-key={textKey}
                  className={selectableClass(activeKey === textKey)}
                  style={composeStyle(textBase(isMobile), styleOf(textKey))}
                >
                  {item.text}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
