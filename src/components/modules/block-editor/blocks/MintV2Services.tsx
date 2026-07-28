'use client';

/**
 * Data-block "MintV2 · Services" (port từ apps/mintcoin-v2 ServicesSection).
 *
 * Heading lớn (char-stagger) + danh sách chọn (trái) + ảnh preview đổi theo mục
 * (phải). Self-contained, container-query + contract nền GSAP.
 *  - eyebrow/title + items[i].{label,preview,caption} canvas-editable.
 *  - Motion skipped on editor canvas (SplitType mutates heading DOM).
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2ServicesContent,
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
  content: MintV2ServicesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const ITEM_KEY_RE = /^items\[(\d+)\]/;
const EMPTY_ITEMS: MintV2ServicesContent['items'] = [];

export function MintV2Services({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const items = Array.isArray(content.items) ? content.items : EMPTY_ITEMS;
  const [activeId, setActiveId] = React.useState(items[0]?.key ?? '');
  const isCanvas = useIsCanvasEdit(rootRef);

  // Sync preview panel when Layers/canvas selects an item field.
  React.useEffect(() => {
    if (!activeKey) return;
    const match = activeKey.match(ITEM_KEY_RE);
    if (!match) return;
    const idx = Number(match[1]);
    const item = items[idx];
    if (item?.key) setActiveId(item.key);
  }, [activeKey, items]);

  const active = items.find(i => i.key === activeId) ?? items[0];
  const activeIndex = active ? items.findIndex(i => i.key === active.key) : -1;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;
      const heading = root.querySelector<HTMLElement>('.svc-heading');
      if (heading) {
        const split = new SplitType(heading, { types: 'chars' });
        gsap.fromTo(
          split.chars,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.6,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: heading,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
      gsap.utils.toArray<HTMLElement>('.svc-reveal', root).forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      });
    },
    [isCanvas]
  );

  const previewKey =
    activeIndex >= 0 ? `items[${activeIndex}].preview` : undefined;
  const captionKey =
    activeIndex >= 0 ? `items[${activeIndex}].caption` : undefined;

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='services @container relative w-full bg-neutral-50 py-24 text-neutral-900 @2xl:py-40'
    >
      <div className='mx-auto max-w-[1400px] px-6 @2xl:px-16'>
        <div className='mb-16 @2xl:mb-20'>
          <span
            data-element-key='eyebrow'
            style={composeStyle(
              {
                display: 'block',
                marginBottom: 16,
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#737373',
              },
              styleOf('eyebrow')
            )}
            className={selectableClass(activeKey === 'eyebrow', '')}
          >
            {content.eyebrow}
          </span>
          <h2
            data-element-key='title'
            style={composeStyle(
              {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(28px, 8cqi, 116px)',
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                color: '#c79119',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              },
              styleOf('title')
            )}
            className={selectableClass(activeKey === 'title', 'svc-heading')}
          >
            {content.title}
          </h2>
        </div>

        <div className='grid gap-8 @2xl:grid-cols-[1fr_1.4fr] @2xl:gap-12'>
          <ul
            data-element-key='items'
            style={styleOf('items')}
            className={selectableClass(
              activeKey === 'items',
              'svc-reveal flex flex-col border-y border-[#c79119]/30'
            )}
          >
            {items.map((item, i) => {
              const isActive = item.key === activeId;
              const labelKey = `items[${i}].label`;
              return (
                <li
                  key={item.key}
                  className='border-b border-[#c79119]/20 last:border-b-0'
                >
                  <button
                    type='button'
                    onClick={() => setActiveId(item.key)}
                    onMouseEnter={() => setActiveId(item.key)}
                    className={cn(
                      'group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300 @2xl:px-6 @2xl:py-5',
                      isActive && 'bg-[#c79119]'
                    )}
                  >
                    <span
                      data-element-key={labelKey}
                      style={composeStyle(
                        {
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          fontSize: 'clamp(18px, 2.2cqi, 24px)',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          color: isActive ? '#f5f5f5' : '#404040',
                        },
                        styleOf(labelKey)
                      )}
                      className={selectableClass(activeKey === labelKey, '')}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className='svc-reveal relative aspect-4/3 overflow-hidden border border-[#c79119]/30 bg-neutral-900 @2xl:aspect-auto @2xl:h-full @2xl:min-h-[400px]'>
            {active && previewKey && (
              <div key={active.key} className='absolute inset-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key={previewKey}
                  src={active.preview}
                  alt={active.label}
                  loading='lazy'
                  decoding='async'
                  style={composeStyle({}, styleOf(previewKey))}
                  className={selectableClass(
                    activeKey === previewKey,
                    'h-full w-full object-cover'
                  )}
                />
                {active.caption && captionKey && (
                  <div
                    data-element-key={captionKey}
                    style={composeStyle(
                      {
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        backgroundColor: '#f5f5f5',
                        padding: '8px 16px',
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#171717',
                      },
                      styleOf(captionKey)
                    )}
                    className={selectableClass(activeKey === captionKey, '')}
                  >
                    {active.caption}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
