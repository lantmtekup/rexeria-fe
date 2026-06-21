'use client';

/**
 * Data-block "Vault · Hero" (tách từ apps/mint2026 Hồi I — The Reveal).
 *
 * Compose ImageTrail (coin hiện theo vệt chuột, tự animate) + overlay text.
 * Overlay fade-in on-load qua useBlockMotion (hero là section đầu, trong view
 * khi mount). @container + data-element-key cho inline-edit.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { ImageTrail } from './ImageTrail';

interface Props {
  content: MintVaultHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintVaultHero({
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

  useBlockMotion(rootRef, () => {
    const root = rootRef.current;
    if (!root) return;
    const els = gsap.utils.toArray<HTMLElement>('.vault-hero-reveal', root);
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
      }
    );
  });

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='@container relative h-screen w-full overflow-hidden bg-[#08070a] text-white'
    >
      <div data-element-key='images' className='absolute inset-0'>
        <ImageTrail
          content={{ images: content.images, autoDemo: true }}
          background={{ color: '#08070a' }}
          className='!h-full !min-h-screen !rounded-none'
        />
      </div>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(60cqw_60cqh_at_50%_42%,rgba(201,169,110,0.12),transparent_70%)]' />

      <div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center'>
        <p
          data-element-key='eyebrow'
          style={styleOf('eyebrow')}
          className={selectableClass(
            activeKey === 'eyebrow',
            'vault-hero-reveal pointer-events-auto mb-4 text-[11px] font-semibold tracking-[0.4em] text-[#c9a96e] uppercase'
          )}
        >
          {content.eyebrow}
        </p>
        <h1
          data-element-key='title'
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(40px, 9cqi, 128px)',
            ...styleOf('title'),
          }}
          className={selectableClass(
            activeKey === 'title',
            'vault-hero-reveal pointer-events-auto leading-[0.95] font-light tracking-[-0.01em]'
          )}
        >
          {content.title}
        </h1>
        <p
          data-element-key='description'
          style={styleOf('description')}
          className={selectableClass(
            activeKey === 'description',
            'vault-hero-reveal pointer-events-auto mt-6 max-w-md text-sm leading-relaxed text-white/60'
          )}
        >
          {content.description}
        </p>
        <div className='vault-hero-reveal mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-2.5 pr-5 pl-2.5 backdrop-blur-sm'>
          <span className='relative flex size-9 items-center justify-center rounded-full border border-[#c9a96e]/50 bg-[#08070a]/40'>
            <svg
              viewBox='0 0 24 24'
              className='size-4 fill-[#c9a96e]'
              aria-hidden
            >
              <path d='M5 3l15 9-6 1.5L11 20 5 3z' />
            </svg>
          </span>
          <span
            data-element-key='hintText'
            style={styleOf('hintText')}
            className={selectableClass(
              activeKey === 'hintText',
              'pointer-events-auto text-[11px] font-semibold tracking-[0.2em] text-[#c9a96e] uppercase'
            )}
          >
            {content.hintText}
          </span>
        </div>
      </div>
    </section>
  );
}
