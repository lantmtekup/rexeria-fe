'use client';

/**
 * Data-block "MintV2 · Process" (port từ apps/mintcoin-v2 ProcessSection).
 *
 * Timeline zigzag: 2 cột 50/50, title/body đổi bên xen kẽ; đường dọc giữa vẽ
 * scaleY 0→1 theo scroll. Per-step fade-up + heading char-stagger.
 * Animation khai báo bằng data-motion-* attributes (Motion Attribute System —
 * pilot block); runtime useMotionAttributes tự skip trên edit-canvas.
 * Container-query (@2xl). eyebrow/title + steps[i].{no,title,body} editable.
 */
import * as React from 'react';

import { useMotionAttributes } from '../motion/useMotionAttributes';
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
  const steps = Array.isArray(content.steps) ? content.steps : EMPTY_STEPS;

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

  // Animation gắn qua data-motion-* attributes trong JSX bên dưới; rebuild
  // khi số step đổi (DOM mới cần bind lại trigger).
  useMotionAttributes(rootRef, [steps.length]);

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
            data-motion='char-reveal'
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
              data-motion='line-draw'
              data-motion-scrub='0.8'
              data-motion-trigger-target='root'
              data-motion-start='top 65%'
              data-motion-end-target='.process-step:last-child'
              data-motion-end='bottom center'
              className={selectableClass(
                activeKey === 'line',
                'process-line h-full w-full'
              )}
              style={fillStyleOf('line', 'rgba(199, 145, 25, 0.6)')}
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
                  key={`${s.key || 'step'}-${i}`}
                  data-motion-group=''
                  data-motion-start='top 80%'
                  className='process-step relative grid grid-cols-1 gap-4 py-12 pl-8 first:pt-0 last:pb-0 @2xl:grid-cols-2 @2xl:gap-16 @2xl:py-24 @2xl:pl-0'
                >
                  <span
                    data-element-key='dot'
                    data-motion='scale-pop'
                    data-motion-delay='0.3'
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
                    <div
                      className='step-title'
                      data-motion='fade-up'
                      data-motion-distance='30'
                      data-motion-duration='0.9'
                      data-motion-ease='power3.out'
                    >
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
                      data-motion='fade-up'
                      data-motion-distance='20'
                      data-motion-duration='0.9'
                      data-motion-delay='0.15'
                      data-motion-ease='power3.out'
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
