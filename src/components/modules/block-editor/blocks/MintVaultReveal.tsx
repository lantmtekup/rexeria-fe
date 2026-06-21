'use client';

/**
 * Data-block "Vault · Reveal" (tách từ apps/mint2026 — cửa hầm mở).
 *
 * Sticky 180vh: Gallery3dDepth (3D card fly) + parallax drift/scale theo scroll.
 * RAF gốc (window scroll) → ScrollTrigger scrub qua useBlockMotion (scroller nền).
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultRevealContent,
} from '../types';
import { blockBackgroundStyle } from './applyStyle';
import { Gallery3dDepth } from './Gallery3dDepth';

interface Props {
  content: MintVaultRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintVaultReveal({ content, background }: Props) {
  const rootRef = React.useRef<HTMLElement>(null);

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    const inner = root.querySelector<HTMLElement>('.vault-reveal-inner');
    if (!inner) return;
    gsap.fromTo(
      inner,
      { y: 70, scale: 1.08 },
      {
        y: -70,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='@container relative h-[180vh] w-full bg-[#08070a]'
    >
      <div className='sticky top-0 h-screen overflow-hidden'>
        <div className='vault-reveal-inner absolute inset-0 will-change-transform'>
          <Gallery3dDepth
            content={{
              eyebrow: content.eyebrow,
              title: content.title,
              images: content.images,
            }}
          />
        </div>
      </div>
    </section>
  );
}
