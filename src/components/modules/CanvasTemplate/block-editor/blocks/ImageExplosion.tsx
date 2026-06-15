'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ImageExplosionContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ImageExplosionProps {
  content: ImageExplosionContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

interface P {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
}

/**
 * Image Explosion — port từ CodeGrid "footer image explosion" (246_…, vanilla
 * physics). Khi block cuộn vào tầm nhìn, các ảnh "nổ" bắn lên rồi rơi xuống
 * theo trọng lực (gravity + friction), sau đó tự reset.
 *
 * Tự viết physics mini bằng rAF. Tôn trọng reduced-motion (ảnh đứng yên).
 */
export function ImageExplosion({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ImageExplosionProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const images = React.useMemo(() => content.images ?? [], [content.images]);

  React.useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || images.length === 0) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) return;

    const gravity = 0.25;
    const friction = 0.99;
    let raf = 0;
    let running = false;
    let armed = true;

    const explode = () => {
      if (running || !armed) return;
      running = true;
      armed = false;
      const h = stage.offsetHeight;
      const els = Array.from(
        stage.querySelectorAll<HTMLElement>('[data-ie-img]')
      );
      const ps: P[] = els.map(el => ({
        el,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 22,
        vy: -16 - Math.random() * 10,
        rot: 0,
        vr: (Math.random() - 0.5) * 18,
      }));
      const tick = () => {
        let alive = false;
        for (const p of ps) {
          p.vy += gravity;
          p.vx *= friction;
          p.vy *= friction;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.rot.toFixed(1)}deg)`;
          if (p.y < h) alive = true;
        }
        if (alive) {
          raf = requestAnimationFrame(tick);
        } else {
          running = false;
          window.setTimeout(() => {
            ps.forEach(p => {
              p.el.style.transform = '';
            });
            armed = true;
          }, 500);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) explode();
        });
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [images]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full flex-col items-center justify-end gap-6 overflow-hidden rounded-md bg-[#0e1a16] px-6 pb-8 duration-500 ease-out',
        className
      )}
    >
      {(content.eyebrow || content.title) && (
        <div className='flex flex-col items-center gap-1 text-center text-white'>
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

      <div ref={stageRef} className='flex flex-wrap justify-center gap-3'>
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            data-ie-img
            src={src}
            alt=''
            className='h-24 w-24 rounded-lg object-cover [will-change:transform] @2xl:h-32 @2xl:w-32'
          />
        ))}
      </div>
    </div>
  );
}
