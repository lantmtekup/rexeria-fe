'use client';

/**
 * Data-block "MintV2 · Manifesto" (port từ apps/mintcoin-v2 ManifestoSection).
 *
 * 2-phase scroll (contract nền GSAP):
 *  - PHASE 1 (enter): 4 guide-line vẽ xuống + copy reveal word-by-word.
 *  - PHASE 2 (scrub): line "chạy" về vị trí ¼ → 4 panel xám mở phủ kín; copy mờ.
 * Pin bằng CSS sticky (không GSAP pin). Tôn trọng prefers-reduced-motion.
 * stripe-x dùng `vw` (line rộng 1px nên % vô nghĩa) → chuẩn trên /p.
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2ManifestoContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

const PANELS = [0, 1, 2, 3];
const CLUSTER_X = [63, 41, 19, -3]; // vw — stripe khởi đầu bunched bên phải

interface Props {
  content: MintV2ManifestoContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintV2Manifesto({
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
    const copy = root.querySelector<HTMLElement>('.manifesto-copy');
    const lines = gsap.utils.toArray<HTMLElement>('.guide-line', root);
    const panels = gsap.utils.toArray<HTMLElement>('.reveal-panel', root);

    let words: HTMLElement[] = [];
    if (copy) {
      const split = new SplitType(copy, { types: 'lines,words' });
      (split.lines ?? []).forEach(l => (l.style.overflow = 'hidden'));
      words = split.words ?? [];
    }

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(words, { opacity: 1 });
      gsap.set(panels, { scaleX: 1 });
      gsap.set(lines, { opacity: 0, x: 0 });
      return;
    }

    // PHASE 1 — entrance
    gsap.set(lines, {
      x: (i: number) => `${CLUSTER_X[i]}vw`,
      scaleY: 0,
      transformOrigin: 'top center',
    });
    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        scroller,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
      },
    });
    intro.to(
      lines,
      { scaleY: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12 },
      0
    );
    if (words.length) {
      gsap.set(words, { yPercent: 110, opacity: 0 });
      intro.to(
        words,
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power4.out',
          stagger: 0.04,
        },
        0.2
      );
    }

    // PHASE 2 — scrub wipe
    gsap.set(panels, { scaleX: 0, transformOrigin: 'right center' });
    const wipe = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    wipe
      .to(
        lines,
        {
          x: 0,
          ease: 'power2.inOut',
          duration: 0.45,
          stagger: { each: 0.05, from: 'end' },
        },
        0
      )
      .to(
        panels,
        {
          scaleX: 1,
          ease: 'power2.inOut',
          duration: 0.55,
          stagger: { each: 0.08, from: 'end' },
        },
        0.45
      )
      .to(lines, { opacity: 0, duration: 0.2 }, 0.5)
      .to(copy, { opacity: 0, duration: 0.3 }, 0.5);
  });

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='manifesto @container relative z-10 h-[230vh] w-full bg-[#c79119]'
    >
      <div className='sticky top-0 h-screen w-full overflow-hidden text-[#dadada]'>
        <div className='absolute bottom-0 left-0 z-10 max-w-[820px] px-6 pb-12 @2xl:px-12 @2xl:pb-16'>
          <p
            data-element-key='text'
            className={selectableClass(
              activeKey === 'text',
              'manifesto-copy leading-[1.45] font-light tracking-[0.01em]'
            )}
            style={{
              fontFamily: "'Yuji Syuku', serif",
              fontSize: 'clamp(16px, 2.4cqi, 34px)',
              ...styleOf('text'),
            }}
          >
            {content.text}
          </p>
        </div>

        {/* Panel xám — 4 cột ¼, mở phủ kín khi scroll */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-20'
        >
          {PANELS.map(i => (
            <div
              key={i}
              className='reveal-panel absolute top-0 bottom-0 bg-[#dadada] will-change-transform'
              style={{ left: `${i * 25}%`, width: 'calc(25% + 1px)' }}
            />
          ))}
        </div>

        {/* Guide stripe — neo ở ¼, khởi đầu lệch phải (GSAP x) rồi chạy về */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-30'
        >
          {PANELS.map(i => (
            <span
              key={i}
              className='guide-line absolute top-0 bottom-0 w-px bg-[#f9f9f8]/60 will-change-transform'
              style={{ left: `calc(${(i + 1) * 25}% - 1px)` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
