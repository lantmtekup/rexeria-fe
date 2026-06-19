'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ProcessStepsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ProcessStepsProps {
  content: ProcessStepsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Process Steps — quy trình đánh số, mỗi bước reveal fade-up lần lượt khi cuộn
 * tới (IntersectionObserver, stagger theo index). Port HowWeWork/services
 * (CodeGrid aug2025/may2025). reduced-motion → hiện ngay.
 */
export function ProcessSteps({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ProcessStepsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const steps = content.steps ?? [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>('[data-step]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.3 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container w-full rounded-md bg-[#0e0f13] px-6 py-14 duration-500 ease-out @2xl:px-10',
        className
      )}
    >
      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'mb-10 text-3xl font-bold tracking-tight text-white @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      )}
      <div className='flex flex-col'>
        {steps.map((s, i) => (
          <div
            key={i}
            data-step
            style={{ transitionDelay: `${i * 0.1}s` }}
            className='flex translate-y-8 gap-5 border-t border-white/10 py-6 opacity-0 transition-[opacity,transform] duration-700 ease-out [&[data-in]]:translate-y-0 [&[data-in]]:opacity-100'
          >
            <span className='text-2xl font-bold text-white/30 tabular-nums'>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className='min-w-0'>
              <h3 className='text-lg font-semibold text-white'>{s.title}</h3>
              {s.description && (
                <p className='mt-1 max-w-xl text-sm leading-relaxed text-white/60'>
                  {s.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
