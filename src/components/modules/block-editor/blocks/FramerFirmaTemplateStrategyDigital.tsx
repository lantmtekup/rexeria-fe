'use client';

import * as React from 'react';

import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerFirmaTemplateStrategyDigitalContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

const GEIST_FONT = findFont('geist').family;
const PLAYFAIR_FONT = findFont('playfair').family;

interface Props {
  content: FramerFirmaTemplateStrategyDigitalContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function FramerFirmaTemplateStrategyDigital({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <section
      style={composeStyle(undefined, blockBackgroundStyle(background))}
      className='@container relative h-screen w-full max-w-full bg-white'
      data-block-type='framer_firma_template_strategy_digital'
    >
      <div className='relative flex h-full w-full flex-col items-center justify-start gap-10 overflow-hidden @4xl:flex-row @4xl:items-center @4xl:justify-start @4xl:gap-0'>
        <a
          data-element-key='imageUrl'
          href={content.linkHref || '#'}
          aria-label={content.heading || 'Case study'}
          className={selectableClass(
            activeKey === 'imageUrl',
            'firma-image group relative block aspect-auto h-100 w-full min-w-0 flex-none overflow-hidden @3xl:h-140 @3xl:w-190 @3xl:flex-none @3xl:shrink-0 @4xl:aspect-square @4xl:h-full @4xl:flex-1'
          )}
          style={composeStyle(undefined, styleOf('imageUrl'))}
        >
          <div className='relative h-full w-full overflow-hidden bg-white @3xl:h-full'>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.imageUrl}
                alt={content.heading || 'Case study portrait'}
                loading='lazy'
                decoding='async'
                // @ts-expect-error fetchPriority
                fetchpriority='high'
                className='block h-full w-full object-cover @4xl:w-[calc(100%+200px)]'
              />
            }
          </div>
        </a>

        {/* Card */}
        <div
          data-element-key='card'
          className='relative flex w-auto flex-col items-start justify-start gap-8 bg-white px-4 @md:justify-between @md:gap-0 @md:px-0 @3xl:min-h-[unset] @3xl:w-140 @3xl:justify-start @3xl:gap-10 @4xl:h-[50%] @4xl:min-h-75 @4xl:w-auto'
        >
          <div className='absolute -inset-16 z-0 hidden overflow-hidden bg-white @4xl:block'></div>
          <div className='z-10 flex flex-col items-center justify-start gap-6 @4xl:w-120'>
            <p
              data-element-key='eyebrow'
              className={selectableClass(
                activeKey === 'eyebrow',
                'm-0 w-full text-xs leading-[1.8] font-normal tracking-[0.12px] text-[#757575] uppercase'
              )}
              style={composeStyle(
                { fontFamily: GEIST_FONT },
                styleOf('eyebrow')
              )}
            >
              {content.eyebrow || 'STRATEGY / DIGITAL'}
            </p>

            <div className='flex w-auto flex-col items-center gap-4 @3xl:gap-6'>
              <div className='wrap-break-words relative h-auto w-full flex-none whitespace-pre-wrap'>
                <h2
                  data-element-key='heading'
                  className={selectableClass(
                    activeKey === 'heading',
                    'm-0 text-[64px] leading-[0.9] font-medium tracking-tighter text-black'
                  )}
                  style={composeStyle(
                    { fontFamily: PLAYFAIR_FONT },
                    styleOf('heading')
                  )}
                >
                  {content.heading || 'Common Future Co.'}
                </h2>
              </div>

              <p
                data-element-key='body'
                className={selectableClass(
                  activeKey === 'body',
                  'm-0 max-w-full text-base leading-[1.65] font-normal text-[#757575]'
                )}
                style={composeStyle(
                  { fontFamily: GEIST_FONT },
                  styleOf('body')
                )}
              >
                {content.body ||
                  'Common Future Co. came to us with a big mission but little clarity on how to communicate it. We began by rethinking their messaging, positioning them as forward-thinking yet accessible.'}
              </p>
            </div>
          </div>

          <a
            data-element-key='linkLabel'
            href={content.linkHref || '#'}
            aria-label={content.linkLabel || 'Case Study'}
            className={selectableClass(
              activeKey === 'linkLabel',
              'firma-cascade group inline-flex h-10 items-center gap-2.5 text-black no-underline outline-none'
            )}
            style={styleOf('linkLabel')}
          >
            {/* Icon: Dot width fit (6×6) → grows to 40×40 + Arrow slide from left → center. Hover trigger = <a class="group"> */}
            <span
              aria-hidden
              className='relative flex h-1.5 w-1.5 shrink-0 items-center justify-center overflow-visible transition-all duration-200 ease-out group-hover:h-10 group-hover:w-10'
            >
              {/* Black dot - fills container (inset-0), grows theo width/height của container */}
              <span className='absolute inset-0 rounded-full bg-black' />

              {/* Arrow - inside dot, slide từ mép trái (-translate-x-3) → center + fade-in */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 256 256'
                className='h-4 w-4 -translate-x-3 fill-white opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100'
              >
                <path d='M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z' />
              </svg>
            </span>

            {/* Text + Underline */}
            <span className='relative z-10 flex flex-col'>
              <strong className='font-sans text-base leading-[26.4px] font-bold text-black'>
                {content.linkLabel || 'Case Study'}
              </strong>

              {/* Underline - origin-right + scale-x-0: co từ TRÁI qua PHẢI (width giảm dần → 0px tại origin-right) */}
              <section
                aria-hidden
                className='-mt-0.5 block h-px w-full origin-right scale-x-100 bg-black transition-transform duration-200 ease-out group-hover:scale-x-0'
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
