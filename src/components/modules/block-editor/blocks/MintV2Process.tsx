'use client';

/**
 * Data-block "MintV2 · Process" (port từ apps/mintcoin-v2 ProcessSection).
 *
 * Timeline zigzag: 2 cột 50/50, title/body đổi bên xen kẽ; đường dọc giữa vẽ
 * scaleY 0→1 theo scroll. Per-step fade-up + heading char-stagger.
 * Contract nền GSAP (useBlockMotion + scroller). Container-query (@2xl).
 *  - eyebrow/title + steps[i].{no,title,body} canvas-editable.
 *  - Motion skipped on editor canvas (SplitType mutates heading DOM).
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
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

const EMPTY_STEPS: MintV2ProcessContent['steps'] = [];

export function MintV2Process({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();
  const steps = Array.isArray(content.steps) ? content.steps : EMPTY_STEPS;
  const [isCanvas, setIsCanvas] = React.useState(true);

  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  /** Decorative fills: toolbar "Màu" writes `color` — map onto backgroundColor. */
  const fillStyleOf = (key: string, fallback: string) => {
    const override = styleOf(key);
    const fromToolbar =
      override && typeof override.color === 'string'
        ? { backgroundColor: override.color }
        : undefined;
    return composeStyle({ backgroundColor: fallback }, override, fromToolbar);
  };

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
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
    },
    [isCanvas]
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: '#1a1410' },
        blockBackgroundStyle(background)
      )}
      className='process @container relative w-full overflow-hidden py-24 @2xl:py-40'
    >
      <div className='relative mx-auto max-w-[1400px] px-6 @2xl:px-16'>
        <div className='mb-16 @2xl:mb-24'>
          <span
            data-element-key='eyebrow'
            style={composeStyle(
              {
                display: 'block',
                marginBottom: 16,
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#c79119',
              },
              styleOf('eyebrow')
            )}
            className={selectableClass(activeKey === 'eyebrow', '')}
          >
            {content.eyebrow}
          </span>
          <h2
            data-element-key='title'
            style={composeStyle(
              {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(56px, 9cqi, 128px)',
                fontWeight: 300,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                color: '#fafafa',
                overflow: 'hidden',
              },
              styleOf('title')
            )}
            className={selectableClass(
              activeKey === 'title',
              'process-heading'
            )}
          >
            {content.title}
          </h2>
        </div>

        <div className='relative'>
          {/* Đường dọc — mobile sát trái, @2xl ở giữa */}
          <div className='absolute top-0 bottom-0 left-2 w-px @2xl:left-1/2 @2xl:-translate-x-1/2'>
            <div
              data-element-key='line'
              className={selectableClass(
                activeKey === 'line',
                'process-line h-full w-full'
              )}
              style={{
                ...fillStyleOf('line', 'rgba(199, 145, 25, 0.6)'),
                transform: isCanvas ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top center',
              }}
            />
          </div>

          <ol data-element-key='steps' className='relative'>
            {steps.map((s, i) => {
              const isTitleLeft = i % 2 === 0;
              const noKey = `steps[${i}].no`;
              const titleKey = `steps[${i}].title`;
              const bodyKey = `steps[${i}].body`;
              return (
                <li
                  key={s.key || i}
                  className='process-step relative grid grid-cols-1 gap-4 py-12 pl-8 first:pt-0 last:pb-0 @2xl:grid-cols-2 @2xl:gap-16 @2xl:py-24 @2xl:pl-0'
                >
                  <span
                    data-element-key='dot'
                    aria-hidden='true'
                    style={fillStyleOf('dot', '#c79119')}
                    className={selectableClass(
                      activeKey === 'dot',
                      'step-dot absolute bottom-0 left-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full @2xl:left-1/2'
                    )}
                  />
                  <div
                    className={`flex flex-col justify-center ${
                      isTitleLeft
                        ? '@2xl:items-end @2xl:pr-12 @2xl:text-right'
                        : '@2xl:order-2 @2xl:items-start @2xl:pl-12 @2xl:text-left'
                    }`}
                  >
                    <div className='step-title'>
                      <div
                        data-element-key={noKey}
                        style={composeStyle(
                          {
                            marginBottom: 12,
                            fontSize: 11,
                            letterSpacing: '0.32em',
                            textTransform: 'uppercase',
                            color: '#c79119',
                          },
                          styleOf(noKey)
                        )}
                        className={selectableClass(activeKey === noKey, '')}
                      >
                        Step {s.no}
                      </div>
                      <h3
                        data-element-key={titleKey}
                        style={composeStyle(
                          {
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: 'clamp(32px, 5cqi, 56px)',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            color: '#fafafa',
                          },
                          styleOf(titleKey)
                        )}
                        className={selectableClass(activeKey === titleKey, '')}
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
                      data-element-key={bodyKey}
                      style={composeStyle(
                        {
                          maxWidth: '28rem',
                          fontSize: 'clamp(16px, 1.4cqi, 18px)',
                          lineHeight: 1.625,
                          color: '#e5e5e5',
                        },
                        styleOf(bodyKey)
                      )}
                      className={selectableClass(
                        activeKey === bodyKey,
                        `step-body${!isTitleLeft ? '@2xl:ml-auto' : ''}`
                      )}
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
