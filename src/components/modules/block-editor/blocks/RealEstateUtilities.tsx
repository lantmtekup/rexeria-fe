'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateUtilitiesContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BROWN,
  FONT_BODY,
  FONT_HEADING,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';

const CONTENT_W = 'min(100cqw, 372px)';

export function RealEstateUtilities({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateUtilitiesContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller, requestRefresh }) => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(
      root.querySelectorAll('[data-appear]'),
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.075,
        delay: 0.1,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          once: true,
        },
      }
    );

    root.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }
    });
  });

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: SAND },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full', className)}
    >
      <style>{FONT_CSS}</style>

      <div
        style={{ paddingTop: RE_SECTION_GAP, paddingBottom: RE_SECTION_GAP }}
      >
        <div className='@container mx-auto' style={{ width: CONTENT_W }}>
          <div className='mx-auto w-[87.1cqi]'>
            <h2
              data-appear
              data-element-key='title'
              className={cn(
                selectableClass(activeKey === 'title'),
                'text-center'
              )}
              style={composeStyle(
                {
                  fontFamily: FONT_BODY,
                  fontSize: '6.18cqi',
                  lineHeight: 1.372,
                  color: BROWN,
                  fontWeight: 400,
                },
                styleOf('title')
              )}
            >
              {content.title}
            </h2>

            <div
              className='grid grid-cols-2 gap-x-[3.18cqi] gap-y-[15.9cqi]'
              style={{
                marginTop: '10.6cqi',
              }}
            >
              {content.items.map((item, i) => {
                const iconKey = `items[${i}].iconUrl`;
                const labelKey = `items[${i}].label`;
                return (
                  <div
                    key={i}
                    data-appear
                    className='flex flex-col items-center'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-element-key={iconKey}
                      src={item.iconUrl}
                      alt=''
                      aria-hidden
                      className={selectableClass(activeKey === iconKey)}
                      style={composeStyle(
                        {
                          width: '26.6cqi',
                          height: 'auto',
                          objectFit: 'contain',
                        },
                        styleOf(iconKey)
                      )}
                    />

                    <p
                      data-element-key={labelKey}
                      className={cn(
                        selectableClass(activeKey === labelKey),
                        'w-full text-center whitespace-pre-line'
                      )}
                      style={composeStyle(
                        {
                          fontFamily: FONT_HEADING,
                          fontSize: '3.23cqi',
                          lineHeight: 1.479,
                          color: BROWN,
                          fontWeight: 400,
                          marginTop: '6.18cqi',
                        },
                        styleOf(labelKey)
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
