'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { BlockMedia } from '../BlockMedia';
import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateLocationContent } from '../types';
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
  GREEN,
  RE_CONTENT_W,
  RE_SECTION_GAP,
  SAND,
} from './realEstateFonts';

export function RealEstateLocation({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateLocationContent>) {
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

    const video = root.querySelector('video');
    video?.addEventListener('loadeddata', requestRefresh, { once: true });
  });

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: SAND },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full overflow-hidden', className)}
    >
      <style>{FONT_CSS}</style>

      <div className='@container mx-auto' style={{ width: RE_CONTENT_W }}>
        <div
          className='flex flex-col items-center'
          style={{ paddingTop: RE_SECTION_GAP }}
        >
          <div className='flex w-[87.6cqi] flex-col items-center text-center'>
            <p
              data-appear
              data-element-key='eyebrow'
              className={selectableClass(activeKey === 'eyebrow')}
              style={composeStyle(
                {
                  fontFamily: FONT_HEADING,
                  fontSize: '3.76cqi',
                  lineHeight: 1.69,
                  color: GREEN,
                },
                styleOf('eyebrow')
              )}
            >
              {content.eyebrow}
            </p>

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
              className={selectableClass(activeKey === 'description')}
              style={composeStyle(
                {
                  fontFamily: FONT_BODY,
                  fontSize: '3.76cqi',
                  lineHeight: 1.69,
                  color: BROWN,
                  marginTop: '3.2cqi',
                },
                styleOf('description')
              )}
            >
              {content.description}
            </p>
          </div>

          <div
            data-appear
            data-element-key='videoUrl'
            className={cn(
              selectableClass(activeKey === 'videoUrl'),
              'relative aspect-[372/209] w-full overflow-hidden'
            )}
            style={composeStyle({ marginTop: '23.1cqi' }, styleOf('videoUrl'))}
          >
            {/* Field media: mặc định là mp4, nhưng user đổi sang ảnh tĩnh được
                qua picker → render theo đuôi file, không ép <video>. */}
            {content.videoUrl ? (
              <BlockMedia
                key={content.videoUrl}
                src={content.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className='h-full w-full object-cover'
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
