'use client';

/**
 * Data-block "MintV2 · Services" (port từ apps/mintcoin-v2 ServicesSection).
 *
 * Heading lớn (char-stagger) + danh sách chọn (trái) + ảnh preview đổi theo mục
 * (phải). Self-contained, container-query + contract nền GSAP.
 *  - eyebrow/title inline-edit; mảng `items` edit qua ElementToolbar.
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useBlockMotion } from '../motion/LandingMotion';
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

export function MintV2Services({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const items = content.items ?? [];
  const [activeId, setActiveId] = React.useState(items[0]?.key ?? '');
  const active = items.find(i => i.key === activeId) ?? items[0];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller }) => {
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
  });

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
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'mb-4 block text-[11px] tracking-[0.32em] text-neutral-500 uppercase'
            )}
          >
            {content.eyebrow}
          </span>
          <h2
            data-element-key='title'
            style={{
              fontSize: 'clamp(28px, 8cqi, 116px)',
              ...styleOf('title'),
            }}
            className={selectableClass(
              activeKey === 'title',
              'svc-heading overflow-hidden font-serif leading-[0.9] font-extrabold tracking-tight whitespace-nowrap text-[#c79119]'
            )}
          >
            {content.title}
          </h2>
        </div>

        <div className='grid gap-8 @2xl:grid-cols-[1fr_1.4fr] @2xl:gap-12'>
          {/* LEFT — selector list */}
          <ul
            data-element-key='items'
            className={selectableClass(
              activeKey === 'items',
              'svc-reveal flex flex-col border-y border-[#c79119]/30'
            )}
          >
            {items.map(item => {
              const isActive = item.key === activeId;
              return (
                <li
                  key={item.key}
                  className='border-b border-[#c79119]/20 last:border-b-0'
                >
                  <button
                    type='button'
                    onClick={() => setActiveId(item.key)}
                    onMouseEnter={() => setActiveId(item.key)}
                    className={`group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300 @2xl:px-6 @2xl:py-5 ${
                      isActive
                        ? 'bg-[#c79119] text-neutral-100'
                        : 'text-neutral-700 hover:text-[#c79119]'
                    }`}
                  >
                    <span className='font-serif text-lg font-medium tracking-tight @2xl:text-2xl'>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* RIGHT — preview */}
          <div className='svc-reveal relative aspect-[4/3] overflow-hidden border border-[#c79119]/30 bg-neutral-900 @2xl:aspect-auto @2xl:h-full @2xl:min-h-[400px]'>
            {active && (
              <div key={active.key} className='absolute inset-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.preview}
                  alt={active.label}
                  loading='lazy'
                  decoding='async'
                  className='h-full w-full object-cover'
                />
                {active.caption && (
                  <div className='absolute bottom-4 left-4 bg-neutral-100 px-4 py-2 text-[11px] tracking-[0.18em] text-neutral-900 uppercase'>
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
