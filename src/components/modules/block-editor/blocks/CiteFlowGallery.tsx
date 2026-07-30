'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CiteFlowGalleryContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useMotionAttributes } from '../motion/useMotionAttributes';

interface CiteFlowGalleryProps {
  content: CiteFlowGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const DEFAULT_IMAGE1_URL = '/cite-flow/stats-bg.jpg';
const DEFAULT_IMAGE1_ALT = 'Ecopark Onsen garden walkway';
const DEFAULT_IMAGE2_URL = '/cite-flow/contact-spa.webp';
const DEFAULT_IMAGE2_ALT = 'Ecopark Onsen wellness lounge by the pool';

export function CiteFlowGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowGalleryProps) {
  const rootRef = React.useRef<HTMLElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const image1Url = content.image1Url?.trim() || DEFAULT_IMAGE1_URL;
  const image1Alt = content.image1Alt?.trim() || DEFAULT_IMAGE1_ALT;
  const image2Url = content.image2Url?.trim() || DEFAULT_IMAGE2_URL;
  const image2Alt = content.image2Alt?.trim() || DEFAULT_IMAGE2_ALT;

  useMotionAttributes(rootRef);

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container flex w-full flex-row items-center bg-neutral-100',
        className
      )}
    >
      <div className='w-full border-t border-b border-[#6e6d6d] px-5 py-15 @4xl:border-none @4xl:py-25'>
        <div
          data-motion='fade-in'
          data-motion-once='true'
          data-motion-duration='1.4'
          data-motion-ease='sine.out'
          className='mx-auto flex w-full max-w-[1720px] flex-col items-center gap-5 @4xl:flex-row @4xl:gap-10'
        >
          <div className='relative flex h-95.75 w-full overflow-hidden rounded-2xl @2xl:h-208 @4xl:h-165'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='image1Url'
              src={image1Url}
              alt={image1Alt}
              style={composeStyle({}, styleOf('image1Url'))}
              className={selectableClass(
                activeKey === 'image1Url',
                'absolute inset-0 h-full w-full object-cover'
              )}
              draggable={false}
            />
          </div>
          <div className='relative flex h-95.75 w-full overflow-hidden rounded-2xl @2xl:h-208 @4xl:h-165'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='image2Url'
              src={image2Url}
              alt={image2Alt}
              style={composeStyle({}, styleOf('image2Url'))}
              className={selectableClass(
                activeKey === 'image2Url',
                'absolute inset-0 h-full w-full object-cover'
              )}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
