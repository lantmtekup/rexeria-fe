'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateInfoContent } from '../types';
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
  FONT_CSS,
  FONT_HEADING,
  RE_CONTENT_W,
  RE_SECTION_GAP,
  SAND,
} from './realEstateFonts';

const FALLBACK_ICON = '/real-estate/intro-sunburst.svg';
const FALLBACK_IMAGE = '/real-estate/intro-feature.jpg';

export function RealEstateInfo({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateInfoContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const iconUrl = content.iconUrl?.trim() || FALLBACK_ICON;
  const imageUrl = content.imageUrl?.trim() || FALLBACK_IMAGE;

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

    const mask = root.querySelector('.re-info-mask');
    if (mask) {
      gsap.to(mask, {
        width: '82.258%',
        height: '82.379%',
        duration: 0.55,
        delay: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: mask,
          scroller,
          start: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      });
    }

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

      <div className='@container mx-auto' style={{ width: RE_CONTENT_W }}>
        <div
          className='flex flex-col items-center text-center'
          style={{ paddingTop: RE_SECTION_GAP }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-appear
            data-element-key='iconUrl'
            src={iconUrl}
            alt=''
            aria-hidden
            className={selectableClass(activeKey === 'iconUrl')}
            style={composeStyle(
              {
                width: '16.1cqi',
                height: '16.1cqi',
                objectFit: 'contain',
              },
              styleOf('iconUrl')
            )}
          />

          <h2
            data-appear
            data-element-key='title'
            className={selectableClass(activeKey === 'title')}
            style={composeStyle(
              {
                fontFamily: FONT_HEADING,
                fontSize: '6.18cqi',
                lineHeight: 1.372,
                color: BROWN,
                fontWeight: 400,
                marginTop: '10.5cqi',
              },
              styleOf('title')
            )}
          >
            {content.title}
          </h2>

          <p
            data-appear
            data-element-key='description'
            className={cn(
              selectableClass(activeKey === 'description'),
              'w-[86.6cqi]'
            )}
            style={composeStyle(
              {
                fontFamily: FONT_BODY,
                fontSize: '3.76cqi',
                lineHeight: 1.69,
                color: BROWN,
                marginTop: '6.3cqi',
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>

          <div
            data-element-key='imageUrl'
            className={cn(
              selectableClass(activeKey === 'imageUrl'),
              'relative w-[100cqi] overflow-hidden'
            )}
            style={composeStyle(
              { height: '122.04cqi', marginTop: '17.2cqi' },
              styleOf('imageUrl')
            )}
          >
            <div
              className='re-info-mask absolute top-1/2 left-1/2 overflow-hidden'
              style={{
                width: '100%',
                height: '100%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=''
                className='absolute top-1/2 left-1/2 object-cover'
                style={{
                  width: '100cqi',
                  height: '122.04cqi',
                  maxWidth: 'none',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
