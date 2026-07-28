'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateHeroContent } from '../types';
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
  FONT_BODY,
  FONT_CSS,
  FONT_HEADING,
  RE_CONTENT_W,
  SAND,
} from './realEstateFonts';

const SCRIM = 'linear-gradient(0deg, #000000e6 7.5%, #0000 84%)';

const PARALLAX_FACTOR = 0.4;

export function RealEstateHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateHeroContent>) {
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

    const img = root.querySelector<HTMLImageElement>('.re-hero-image');
    if (!img) return;

    gsap.fromTo(
      img,
      { y: 0 },
      {
        y: () => PARALLAX_FACTOR * root.offsetHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    if (!img.complete)
      img.addEventListener('load', requestRefresh, { once: true });
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
        className='@container relative mx-auto aspect-[372/454] overflow-hidden'
        style={{ width: RE_CONTENT_W }}
      >
        <div
          data-element-key='imageUrl'
          className={cn(
            selectableClass(activeKey === 'imageUrl'),
            'absolute inset-0 overflow-hidden'
          )}
          style={styleOf('imageUrl')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.imageUrl}
            alt=''
            className='re-hero-image absolute inset-0 h-full w-full object-cover'
            style={{ willChange: 'transform' }}
          />
        </div>

        <div
          aria-hidden
          className='pointer-events-none absolute right-0 bottom-px left-0 h-[86.8%]'
          style={{ background: SCRIM }}
        />

        <div className='absolute bottom-[8.3cqi] left-1/2 flex w-min -translate-x-1/2 flex-row flex-nowrap items-start gap-[10.6cqi]'>
          {(content.stats ?? []).map((stat, i) => {
            const labelKey = `stats[${i}].label`;
            const valueKey = `stats[${i}].value`;
            return (
              <div
                key={i}
                className='flex flex-col items-center whitespace-pre'
              >
                <span
                  data-element-key={labelKey}
                  className={selectableClass(activeKey === labelKey)}
                  style={composeStyle(
                    {
                      fontFamily: FONT_BODY,
                      fontSize: '2.15cqi',
                      lineHeight: 2.218,
                      letterSpacing: '0.03em',
                      color: 'rgb(255, 255, 255)',
                    },
                    styleOf(labelKey)
                  )}
                >
                  {stat.label}
                </span>
                <span
                  data-element-key={valueKey}
                  className={selectableClass(activeKey === valueKey)}
                  style={composeStyle(
                    {
                      fontFamily: FONT_HEADING,
                      fontSize: '3.76cqi',
                      lineHeight: 1.2675,
                      letterSpacing: '0.03em',
                      color: 'rgb(255, 255, 255)',
                      fontWeight: 400,
                    },
                    styleOf(valueKey)
                  )}
                >
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
