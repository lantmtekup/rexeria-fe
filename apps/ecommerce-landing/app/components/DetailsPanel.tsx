'use client';

import { gsap } from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

import { IconCollapse, IconExpand } from './StoryIcons';
import {
  DETAILS_IMAGE,
  DETAILS_ROWS,
  GOLD,
  PANE_H,
  PANE_W,
} from './story-data';

const ZOOM = 1.4;
const HOTSPOT = 32;
const ACTIVE_SPOT = 1.25;
const DURATION = 0.9;
const EASE = 'power3.inOut';

function stagePlacement(i: number, zoomed: boolean) {
  const k = zoomed ? ZOOM : 1;
  if (!zoomed) return { k, x: 0, y: 0 };

  const row = DETAILS_ROWS[i];
  const clamp = (v: number) => Math.min(0, Math.max(1 - k, v));
  return {
    k,
    x: clamp(0.5 - (k * (row.x + HOTSPOT / 2)) / PANE_W) * 100,
    y: clamp(0.5 - (k * (row.y + HOTSPOT / 2)) / PANE_H) * 100,
  };
}

function useStageBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      const scale = Math.min(w / PANE_W, h / PANE_H);
      setBox({ width: PANE_W * scale, height: PANE_H * scale });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, box };
}

export default function DetailsPanel() {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const { ref, box } = useStageBox();
  const stageRef = useRef<HTMLDivElement>(null);
  const spotsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number) => {
    setZoomed(i === active ? z => !z : true);
    setActive(i);
  };

  useIsomorphicLayoutEffect(() => {
    gsap.set(stageRef.current, { transformOrigin: '0 0' });
  }, []);

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const duration = reduce ? 0 : DURATION;
    const { k, x, y } = stagePlacement(active, zoomed);

    const tweens = [
      gsap.to(stage, {
        xPercent: x,
        yPercent: y,
        scale: k,
        duration,
        ease: EASE,
        overwrite: 'auto',
      }),
    ];

    spotsRef.current.forEach((spot, i) => {
      if (!spot) return;
      tweens.push(
        gsap.to(spot, {
          scale: (zoomed && i === active ? ACTIVE_SPOT : 1) / k,
          duration,
          ease: EASE,
          overwrite: 'auto',
        })
      );
    });

    return () => tweens.forEach(tween => tween.kill());
  }, [active, zoomed]);

  return (
    <div className='relative h-full w-full overflow-hidden bg-[#F5F5F5]'>
      <div
        ref={ref}
        className='relative flex aspect-[1086/840] w-full items-center justify-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full'
      >
        <div
          className='relative overflow-hidden'
          style={{ width: box.width || '100%', height: box.height || '100%' }}
        >
          <div ref={stageRef} className='absolute inset-0'>
            <Image
              src={DETAILS_IMAGE}
              alt='Le Cool Move — chi tiết chế tác'
              fill
              sizes='(min-width: 1024px) 75vw, 100vw'
              className='object-cover'
            />

            {DETAILS_ROWS.map((row, i) => (
              <button
                key={row.label}
                ref={node => {
                  spotsRef.current[i] = node;
                }}
                type='button'
                onClick={() => select(i)}
                aria-label={`${zoomed && i === active ? 'Thu nhỏ' : 'Phóng to'}: ${row.label}`}
                aria-pressed={i === active}
                className='absolute flex h-6 w-6 items-center justify-center bg-white transition-colors lg:h-8 lg:w-8'
                style={{
                  left: `${(row.x / PANE_W) * 100}%`,
                  top: `${(row.y / PANE_H) * 100}%`,
                  // cái đang zoom nổi lên trên 5 cái còn lại khi nở to
                  zIndex: i === active ? 2 : 1,
                  color: i === active ? GOLD : '#000',
                  boxShadow: i === active ? `inset 0 0 0 1px ${GOLD}` : 'none',
                }}
              >
                {zoomed && i === active ? (
                  <IconCollapse className='h-3 w-3 lg:h-4 lg:w-4' />
                ) : (
                  <IconExpand className='h-3 w-3 lg:h-4 lg:w-4' />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className='flex flex-col gap-1 px-[var(--story-gutter)] py-6 lg:absolute lg:top-[39%] lg:left-[var(--story-gutter)] lg:w-[min(354px,33%)] lg:px-0 lg:py-0'>
        {DETAILS_ROWS.map((row, i) => {
          const isActive = i === active;
          return (
            <li key={row.label}>
              <button
                type='button'
                onClick={() => select(i)}
                aria-pressed={isActive}
                className='flex h-[clamp(56px,8.8svh,74px)] w-full items-center justify-end gap-6 pr-[17px] pl-4 text-right backdrop-blur-[2px] transition-colors lg:gap-10'
                style={{
                  backgroundColor: isActive ? GOLD : 'rgba(255,255,255,.4)',
                  color: isActive ? '#fff' : '#000',
                }}
              >
                <span className='font-montserrat text-[clamp(13px,1.15vw,16px)] leading-[26px] font-medium'>
                  {row.label}
                </span>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center'>
                  <Image
                    src={row.thumb}
                    alt=''
                    aria-hidden
                    width={row.w * 2}
                    height={row.h * 2}
                    className='h-auto max-h-8 w-auto max-w-[26px] object-contain'
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
