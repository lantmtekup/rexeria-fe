'use client';

/**
 * Data-block "Mint · Details" (P3 + inline-edit).
 *
 * Self-contained renderer theo pattern data-block: mỗi element có
 * `data-element-key` + composeStyle + selectableClass nên editor chọn/sửa
 * style từng phần (ELEMENTS_BY_TYPE['mint_details']). Motion: char-reveal
 * title + fade-up paragraphs qua attribute system.
 */

import * as React from 'react';

import { useMotionAttributes } from '../motion/useMotionAttributes';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintDetailsContent,
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
  content: MintDetailsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintDetails({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useMotionAttributes(rootRef);

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='@container relative w-full px-6 pt-32 pb-24 @2xl:pt-40 @2xl:pb-32'
    >
      <div className='mx-auto max-w-3xl text-center'>
        <h1
          data-element-key='title'
          data-motion='char-reveal'
          data-motion-stagger='0.04'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'mb-10 text-5xl font-light tracking-tight @2xl:text-8xl'
          )}
        >
          {content.title}
        </h1>
        <p
          data-element-key='paragraph1'
          data-motion='fade-up'
          data-motion-distance='20'
          data-motion-duration='1'
          data-motion-ease='sine.out'
          style={styleOf('paragraph1')}
          className={selectableClass(
            activeKey === 'paragraph1',
            'mb-5 text-sm leading-relaxed text-neutral-800 @2xl:text-base'
          )}
        >
          {content.paragraph1}
        </p>
        <p
          data-element-key='paragraph2'
          data-motion='fade-up'
          data-motion-distance='20'
          data-motion-duration='1'
          data-motion-ease='sine.out'
          style={styleOf('paragraph2')}
          className={selectableClass(
            activeKey === 'paragraph2',
            'text-sm leading-relaxed text-neutral-800 @2xl:text-base'
          )}
        >
          {content.paragraph2}
        </p>
      </div>
    </section>
  );
}
