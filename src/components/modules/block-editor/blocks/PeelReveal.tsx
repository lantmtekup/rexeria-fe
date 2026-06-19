'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PeelRevealContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(ScrollTrigger);

interface PeelRevealProps {
  content: PeelRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Peel Reveal — port pattern PeelReveal (CodeGrid dec2025). Cuộn qua section pin
 * (sticky): ảnh phóng từ nhỏ ra phủ nền + clip-path "lột" mở dần + tiêu đề hiện.
 * ScrollTrigger scrub trên section cao 200vh, stage sticky (an toàn iOS).
 * reduced-motion → hiện trạng thái cuối.
 */
export function PeelReveal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: PeelRevealProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const img = root.querySelector<HTMLElement>('.pr-img');
    const title = root.querySelector<HTMLElement>('.pr-title');
    if (!img) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(img, { scale: 1, clipPath: 'inset(0% round 0px)' });
      if (title) gsap.set(title, { opacity: 1, y: 0 });
      return;
    }
    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      gsap.set(img, { scale: 0.35, clipPath: 'inset(30% round 24px)' });
      if (title) gsap.set(title, { opacity: 0, y: 40 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      });
      tl.to(img, { scale: 1, clipPath: 'inset(0% round 0px)' }, 0);
      if (title) tl.to(title, { opacity: 1, y: 0 }, 0.4);
      st = tl.scrollTrigger ?? null;
    }, root);
    return () => {
      st?.kill();
      ctx.revert();
    };
  }, [content.imageUrl, content.title]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in relative h-[200vh] w-full rounded-md bg-[#0b0d12] duration-500 ease-out',
        className
      )}
    >
      <div className='sticky top-0 flex h-screen items-center justify-center overflow-hidden'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.imageUrl}
          alt={content.title ?? ''}
          className='pr-img absolute inset-0 h-full w-full object-cover'
        />
        {content.title && (
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'pr-title relative z-10 px-6 text-center text-4xl font-bold tracking-tight text-white drop-shadow-lg @2xl:text-7xl'
            )}
          >
            {content.title}
          </h2>
        )}
      </div>
    </div>
  );
}
