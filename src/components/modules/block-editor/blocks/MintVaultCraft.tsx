'use client';

/**
 * Data-block "Vault · Craft" (tách từ apps/mint2026 Hồi III — The Craft).
 *
 * Heading + AccordionMedia (proof points). Heading fade-up qua useBlockMotion.
 * @container + data-element-key cho inline-edit; mảng `items` edit qua panel.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultCraftContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { AccordionMedia } from './AccordionMedia';

interface Props {
  content: MintVaultCraftContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintVaultCraft({
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

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    const head = root.querySelector<HTMLElement>('.vault-craft-head');
    if (head) {
      gsap.fromTo(
        head,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: head,
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
      className='@container mx-auto w-full bg-[#08070a] px-6 py-24 text-white @2xl:py-32'
    >
      <div className='vault-craft-head mx-auto mb-12 max-w-6xl text-center'>
        <p
          data-element-key='eyebrow'
          style={styleOf('eyebrow')}
          className={selectableClass(
            activeKey === 'eyebrow',
            'text-[11px] tracking-[0.3em] text-[#c9a96e] uppercase'
          )}
        >
          {content.eyebrow}
        </p>
        <h2
          data-element-key='title'
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(28px, 4.5cqi, 44px)',
            ...styleOf('title'),
          }}
          className={selectableClass(
            activeKey === 'title',
            'mt-3 leading-tight font-light'
          )}
        >
          {content.title}
        </h2>
      </div>
      <div
        data-element-key='items'
        className={selectableClass(
          activeKey === 'items',
          'mx-auto w-full max-w-6xl'
        )}
      >
        <AccordionMedia content={{ items: content.items }} />
      </div>
    </section>
  );
}
