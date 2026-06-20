'use client';

/**
 * Data-block "Mint · Details" (P3 + inline-edit).
 *
 * Self-contained renderer theo pattern data-block: mỗi element có
 * `data-element-key` + composeStyle + selectableClass nên editor chọn/sửa
 * style từng phần (ELEMENTS_BY_TYPE['mint_details']). Giữ GSAP char-split
 * fade-up cho title + fade-in cho 2 đoạn (port từ template DetailsSection).
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

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

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const titleEl = root.querySelector<HTMLElement>('.mint-details__title');
      if (titleEl) {
        const split = new SplitType(titleEl, { types: 'chars' });
        gsap.fromTo(
          split.chars,
          { opacity: 0, y: 24, force3D: true },
          {
            opacity: 1,
            y: 0,
            force3D: true,
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: titleEl,
              start: 'top 85%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
      gsap.utils.toArray<HTMLElement>('.mint-details__p', root).forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'sine.out',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 85%' },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='relative w-full px-6 pt-32 pb-24 md:pt-40 md:pb-32'
    >
      <div className='mx-auto max-w-3xl text-center'>
        <h1
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'mint-details__title mb-10 text-6xl font-light tracking-tight md:text-8xl'
          )}
        >
          {content.title}
        </h1>
        <p
          data-element-key='paragraph1'
          style={styleOf('paragraph1')}
          className={selectableClass(
            activeKey === 'paragraph1',
            'mint-details__p mb-5 text-sm leading-relaxed text-neutral-800 md:text-base'
          )}
        >
          {content.paragraph1}
        </p>
        <p
          data-element-key='paragraph2'
          style={styleOf('paragraph2')}
          className={selectableClass(
            activeKey === 'paragraph2',
            'mint-details__p text-sm leading-relaxed text-neutral-800 md:text-base'
          )}
        >
          {content.paragraph2}
        </p>
      </div>
    </section>
  );
}
