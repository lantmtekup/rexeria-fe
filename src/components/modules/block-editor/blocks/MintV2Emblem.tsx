'use client';

/**
 * Data-block "MintV2 · Emblem" (port từ apps/mintcoin-v2 EmblemSection).
 *
 * Self-contained, container-query + contract nền GSAP:
 *  - decor 2 bên drift-in scrub (useBlockMotion → scroller);
 *  - coin drop + title/copy word-reveal timeline ON LOAD (emblem là section đầu,
 *    luôn trong view khi mount → chạy ngay, không scroll-gate);
 *  - data-element-key cho title/description/coinUrl/decorUrl (inline-edit).
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2EmblemContent,
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
  content: MintV2EmblemContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintV2Emblem({
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

    // Decor 2 bên drift-in + fade tới mờ khi section vào view (scrub).
    const left = root.querySelector<HTMLElement>('.emblem-decor-left');
    const right = root.querySelector<HTMLElement>('.emblem-decor-right');
    [left, right].forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { xPercent: i === 0 ? -12 : 12, opacity: 0 },
        {
          xPercent: 0,
          opacity: 0.22,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    // Entrance ON LOAD: coin drop → title/copy word-reveal.
    const coin = root.querySelector<HTMLElement>('.emblem-coin');
    const textEls = gsap.utils.toArray<HTMLElement>('.emblem-text', root);
    const splits = textEls.map(el => new SplitType(el, { types: 'words' }));
    const words = splits.flatMap(s => s.words ?? []);
    const tl = gsap.timeline({ delay: 0.2 });
    if (coin) {
      tl.fromTo(
        coin,
        { y: -240, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }
      );
    }
    if (words.length) {
      tl.fromTo(
        words,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.06,
        },
        coin ? '>' : 0
      );
    }
  });

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='emblem @container relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f4f1ea] py-28 text-neutral-900 @2xl:py-44'
    >
      {/* Decor 2 bên — tranh painting mờ, mask về giữa */}
      <div
        aria-hidden='true'
        className='emblem-decor-left pointer-events-none absolute top-0 left-0 h-full w-[34%] opacity-25 @2xl:w-[32%]'
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, transparent 85%)',
          maskImage: 'linear-gradient(to right, black 0%, transparent 85%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.decorUrl}
          alt=''
          className='h-full w-full scale-x-[-1] object-cover blur-[1px]'
          loading='lazy'
          decoding='async'
        />
      </div>
      <div
        aria-hidden='true'
        className='emblem-decor-right pointer-events-none absolute top-0 right-0 h-full w-[34%] opacity-25 @2xl:w-[32%]'
        style={{
          WebkitMaskImage:
            'linear-gradient(to left, black 0%, transparent 85%)',
          maskImage: 'linear-gradient(to left, black 0%, transparent 85%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.decorUrl}
          alt=''
          className='h-full w-full object-cover blur-[1px]'
          loading='lazy'
          decoding='async'
        />
      </div>

      {/* Centre stack */}
      <div className='relative z-10 flex flex-col items-center px-6 text-center'>
        <div className='emblem-coin relative will-change-transform'>
          <div
            aria-hidden='true'
            className='absolute inset-0 -z-10 opacity-60 blur-2xl'
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(199,145,25,0.35) 0%, transparent 70%)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='coinUrl'
            src={content.coinUrl}
            alt={content.title}
            style={styleOf('coinUrl')}
            className={selectableClass(
              activeKey === 'coinUrl',
              'h-40 w-40 object-contain drop-shadow-2xl @2xl:h-56 @2xl:w-56'
            )}
            loading='lazy'
            decoding='async'
          />
        </div>

        <h2
          data-element-key='title'
          style={{ fontSize: 'clamp(48px, 9cqi, 132px)', ...styleOf('title') }}
          className={selectableClass(
            activeKey === 'title',
            'emblem-text mt-10 font-serif leading-[0.95] font-light tracking-tight text-neutral-900'
          )}
        >
          {content.title}
        </h2>

        <p
          data-element-key='description'
          style={styleOf('description')}
          className={selectableClass(
            activeKey === 'description',
            'emblem-text mt-6 max-w-xl text-sm leading-relaxed font-light text-neutral-600 @2xl:text-base'
          )}
        >
          {content.description}
        </p>
      </div>
    </section>
  );
}
