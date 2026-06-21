'use client';

/**
 * Data-block "MintV2 · Process" (port từ apps/mintcoin-v2 ProcessSection).
 *
 * Timeline zigzag: 2 cột 50/50, title/body đổi bên xen kẽ; đường dọc giữa vẽ
 * scaleY 0→1 theo scroll. Per-step fade-up + heading char-stagger.
 * Contract nền GSAP (useBlockMotion + scroller). Container-query (@2xl).
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2ProcessContent,
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
  content: MintV2ProcessContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintV2Process({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const steps = content.steps ?? [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;

    const line = root.querySelector<HTMLElement>('.process-line');
    const lastStep = root.querySelector<HTMLElement>(
      '.process-step:last-child'
    );
    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 65%',
            endTrigger: lastStep ?? root,
            end: lastStep ? 'bottom center' : 'bottom 75%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    gsap.utils.toArray<HTMLElement>('.process-step', root).forEach(step => {
      const title = step.querySelector<HTMLElement>('.step-title');
      const body = step.querySelector<HTMLElement>('.step-body');
      const dot = step.querySelector<HTMLElement>('.step-dot');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          scroller,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      if (title)
        tl.fromTo(
          title,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          0
        );
      if (body)
        tl.fromTo(
          body,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          0.15
        );
      if (dot)
        tl.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
          0.3
        );
    });

    const heading = root.querySelector<HTMLElement>('.process-heading');
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
  });

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='process @container relative w-full overflow-hidden bg-[#1a1410] py-24 text-neutral-100 @2xl:py-40'
    >
      <div className='relative mx-auto max-w-[1400px] px-6 @2xl:px-16'>
        <div className='mb-16 @2xl:mb-24'>
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'mb-4 block text-[11px] tracking-[0.32em] text-[#c79119] uppercase'
            )}
          >
            {content.eyebrow}
          </span>
          <h2
            data-element-key='title'
            style={{
              fontSize: 'clamp(56px, 9cqi, 128px)',
              ...styleOf('title'),
            }}
            className={selectableClass(
              activeKey === 'title',
              'process-heading overflow-hidden font-serif leading-[0.95] font-light tracking-tight text-neutral-50'
            )}
          >
            {content.title}
          </h2>
        </div>

        <div className='relative'>
          {/* Đường dọc — mobile sát trái, @2xl ở giữa */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute top-0 bottom-0 left-2 w-px @2xl:left-1/2 @2xl:-translate-x-1/2'
          >
            <div
              className='process-line h-full w-full bg-[#c79119]/60'
              style={{ transform: 'scaleY(0)', transformOrigin: 'top center' }}
            />
          </div>

          <ol data-element-key='steps' className='relative'>
            {steps.map((s, i) => {
              const isTitleLeft = i % 2 === 0;
              return (
                <li
                  key={s.key}
                  className='process-step relative grid grid-cols-1 gap-4 py-12 pl-8 first:pt-0 last:pb-0 @2xl:grid-cols-2 @2xl:gap-16 @2xl:py-24 @2xl:pl-0'
                >
                  <span
                    aria-hidden='true'
                    className='step-dot absolute bottom-0 left-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-[#c79119] @2xl:left-1/2'
                  />
                  <div
                    className={`flex flex-col justify-center ${
                      isTitleLeft
                        ? '@2xl:items-end @2xl:pr-12 @2xl:text-right'
                        : '@2xl:order-2 @2xl:items-start @2xl:pl-12 @2xl:text-left'
                    }`}
                  >
                    <div className='step-title'>
                      <div className='mb-3 text-[11px] tracking-[0.32em] text-[#c79119] uppercase'>
                        Step {s.no}
                      </div>
                      <h3
                        className='font-serif leading-[1.05] font-bold tracking-tight text-neutral-50'
                        style={{ fontSize: 'clamp(32px, 5cqi, 56px)' }}
                      >
                        {s.title}
                      </h3>
                    </div>
                  </div>
                  <div
                    className={`flex flex-col justify-center ${
                      isTitleLeft
                        ? '@2xl:pl-12'
                        : '@2xl:order-1 @2xl:items-end @2xl:pr-12 @2xl:text-right'
                    }`}
                  >
                    <p
                      className={`step-body max-w-md text-base leading-relaxed text-neutral-200 @2xl:text-lg ${
                        !isTitleLeft ? '@2xl:ml-auto' : ''
                      }`}
                    >
                      {s.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
