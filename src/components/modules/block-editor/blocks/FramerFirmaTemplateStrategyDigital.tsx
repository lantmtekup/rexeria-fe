'use client';

import * as React from 'react';
import { motion, type Transition } from 'framer-motion';

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

const linkTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeOut',
};

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

  const [hovered, setHovered] = React.useState(false);

  const heading = (content.heading || 'Common Future Co.').replace(
    / (\S+)$/,
    ' $1'
  );

  return (
    <section
      style={composeStyle(undefined, blockBackgroundStyle(background))}
      className='@container relative h-screen w-full max-w-full bg-white'
      data-block-type='framer_firma_template_strategy_digital'
    >
      <div className='relative flex h-full w-full flex-col items-center justify-start gap-10 overflow-hidden @4xl:flex-row @4xl:items-center @4xl:justify-center @4xl:gap-0'>
        <a
          data-element-key='imageUrl'
          href={content.linkHref || '#'}
          aria-label={content.heading || 'Case study'}
          className={selectableClass(
            activeKey === 'imageUrl',
            'firma-image group relative block aspect-auto h-100 w-full min-w-0 flex-none overflow-hidden @3xl:h-140 @3xl:w-190 @3xl:flex-none @3xl:shrink-0 @4xl:aspect-square @4xl:h-full @4xl:w-auto'
          )}
          style={composeStyle(undefined, styleOf('imageUrl'))}
        >
          <div className='absolute inset-0 overflow-hidden bg-white'>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.imageUrl}
                alt={content.heading || 'Case study portrait'}
                loading='lazy'
                decoding='async'
                fetchPriority='high'
                className='block h-full w-full max-w-none object-cover @4xl:w-[calc(100%+200px)]'
              />
            }
          </div>
        </a>

        {/* Card */}
        <div
          data-element-key='card'
          className='relative flex w-auto flex-col items-start justify-start gap-8 bg-white px-4 @3xl:min-h-[unset] @3xl:w-140 @3xl:justify-start @3xl:gap-10 @4xl:h-[50%] @4xl:min-h-75 @4xl:w-auto @4xl:justify-between @4xl:gap-0 @4xl:px-0'
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
                  {heading}
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

          <motion.a
            data-element-key='linkLabel'
            href={content.linkHref || '#'}
            aria-label={content.linkLabel || 'Case Study'}
            className={selectableClass(
              activeKey === 'linkLabel',
              'firma-cascade group relative inline-flex h-10 items-center gap-2.5 text-black no-underline outline-none'
            )}
            style={styleOf('linkLabel')}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
          >
            <motion.span
              aria-hidden
              layout
              transition={linkTransition}
              className={
                hovered
                  ? 'h-10 w-10 shrink-0 rounded-full bg-black'
                  : 'h-1 w-1 shrink-0 rounded-full bg-black'
              }
            />

            <motion.span
              aria-hidden
              className='pointer-events-none absolute top-1/2 left-5 z-10 -translate-x-1/2 -translate-y-1/2'
              animate={{ x: hovered ? 0 : -32, opacity: hovered ? 1 : 0 }}
              transition={linkTransition}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 256 256'
                className='h-4.5 w-4.5 fill-white'
              >
                <path d='M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z' />
              </svg>
            </motion.span>

            <motion.span
              layout
              transition={linkTransition}
              className='relative z-10 flex flex-col'
            >
              <strong className='font-sans text-base leading-[26.4px] font-bold text-black'>
                {content.linkLabel || 'Case Study'}
              </strong>

              {/* Underline — origin right, scaleX 1→0 (co từ trái sang phải) */}
              <motion.span
                aria-hidden
                className='-mt-0.5 block h-px w-full bg-black'
                style={{ transformOrigin: 'right' }}
                animate={{ scaleX: hovered ? 0 : 1 }}
                transition={linkTransition}
              />
            </motion.span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
