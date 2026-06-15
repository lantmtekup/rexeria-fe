'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  WheelGalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface WheelGalleryProps {
  content: WheelGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Wheel Gallery — port từ CodeGrid "scrolltrigger wheel gallery" (014_…). Ảnh
 * xếp thành vòng tròn khổng lồ neo dưới đáy (chỉ lộ cung trên); cuộn trang →
 * bánh xe quay, snap dừng đúng từng ảnh.
 *
 * Khác bản gốc: bỏ Flip/MotionPath thừa; thu về 1 box chứa, dùng CSS sticky cho
 * lớp giữ màn hình. Tính lại lượng giác khi refresh/resize
 * (invalidateOnRefresh). Tôn trọng reduced-motion.
 */
export function WheelGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WheelGalleryProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const images = content.images ?? [];
  const n = images.length;

  useGSAP(
    () => {
      const root = rootRef.current;
      const wheel = wheelRef.current;
      if (!root || !wheel || n === 0) return;
      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const cards = gsap.utils.toArray<HTMLElement>('.wg-card', wheel);
      const place = () => {
        const size = wheel.offsetWidth;
        const radius = size / 2;
        const center = size / 2;
        const slice = (2 * Math.PI) / n;
        cards.forEach((item, i) => {
          const angle = i * slice;
          gsap.set(item, {
            rotation: angle + '_rad',
            xPercent: -50,
            yPercent: -50,
            x: center + radius * Math.sin(angle),
            y: center - radius * Math.cos(angle),
          });
        });
      };
      place();
      window.addEventListener('resize', place);

      if (!reduce) {
        gsap.to(wheel, {
          rotate: -360,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            snap: 1 / n,
            invalidateOnRefresh: true,
          },
        });
      }
      return () => window.removeEventListener('resize', place);
    },
    { scope: rootRef, dependencies: [images] }
  );

  return (
    // Outer = đường ray cuộn để bánh xe quay theo scroll.
    <div
      ref={rootRef}
      style={{
        ...blockBackgroundStyle(background),
        height: `${Math.max(n * 28, 200)}vh`,
      }}
      className={cn('relative w-full', className)}
    >
      <div className='sticky top-0 h-screen overflow-hidden bg-neutral-950'>
        {(content.eyebrow || content.title) && (
          <div className='absolute inset-x-0 top-10 z-[2] flex flex-col items-center gap-1 text-center text-white'>
            {content.eyebrow && (
              <span
                data-element-key='eyebrow'
                style={styleOf('eyebrow')}
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'text-2xs font-semibold tracking-[0.32em] text-white/55 uppercase'
                )}
              >
                {content.eyebrow}
              </span>
            )}
            {content.title && (
              <h2
                data-element-key='title'
                style={styleOf('title')}
                className={selectableClass(
                  activeKey === 'title',
                  'text-2xl font-semibold tracking-tight @2xl:text-4xl'
                )}
              >
                {content.title}
              </h2>
            )}
          </div>
        )}

        <div
          ref={wheelRef}
          className='absolute [top:34vh] left-1/2 [aspect-ratio:1] [width:min(150vh,1500px)] -translate-x-1/2'
        >
          {images.map((src, i) => (
            <div
              key={i}
              className='wg-card absolute top-0 left-0 [aspect-ratio:1] [width:16vh] overflow-hidden rounded-xl shadow-xl'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=''
                className='pointer-events-none h-full w-full object-cover'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
