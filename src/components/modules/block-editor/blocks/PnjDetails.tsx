'use client';

/**
 * PNJ · Details — sticky-track + scrub word-reveal (title + N paragraphs).
 * Port từ apps/pnj DetailsSection + ScrollReveal word markup.
 *
 * Motion R1–R6:
 * - useLandingMotion (scroller + requestRefresh)
 * - Live (desktop + mobile): CSS sticky track + scrub timeline (no GSAP pin)
 * - Editor canvas (`active-block-preview`): text tĩnh visible (không opacity:0)
 * - Word reveal via opacity only (no filter:blur — paint thrash)
 * - KHÔNG gsap.registerPlugin
 */

import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PnjDetailsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useContainerMobile } from './useContainerMobile';

const RESPONSIVE = {
  titleFont: 'clamp(36px, 8cqi, 96px)',
  titleMb: 'clamp(32px, 4cqi, 56px)',
  paraFont: 'clamp(18px, 2.8cqi, 30px)',
  paraMb: 'clamp(32px, 3.5cqi, 48px)',
  padY: 'clamp(80px, 10cqi, 112px)',
  padX: 'clamp(24px, 4cqi, 32px)',
} as const;

/** Normalize paragraphs + legacy paragraph1/paragraph2 (+ string mishape). */
export const resolvePnjParagraphs = (
  content: PnjDetailsContent & {
    paragraph1?: string;
    paragraph2?: string;
  }
): string[] => {
  const raw = content.paragraphs as unknown;
  // Editor mishape: whole field saved as a string via wrong path.
  if (typeof raw === 'string') {
    return raw.trim().length > 0 ? [raw] : [''];
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(p => (typeof p === 'string' ? p : ''));
  }
  const legacy = [content.paragraph1, content.paragraph2].filter(
    (p): p is string => typeof p === 'string' && p.trim().length > 0
  );
  return legacy.length > 0 ? legacy : [''];
};

/**
 * Ghi 1 đoạn theo index — luôn preserve toàn bộ list (kể cả legacy paragraph1/2).
 * `setContentAt(..., 'paragraphs[i]', …)` sẽ mất các đoạn còn lại khi
 * `content.paragraphs` chưa phải array.
 */
export const setPnjParagraphAt = (
  content: PnjDetailsContent & {
    paragraph1?: string;
    paragraph2?: string;
  },
  index: number,
  value: string
): PnjDetailsContent => {
  const paras = [...resolvePnjParagraphs(content)];
  while (paras.length <= index) paras.push('');
  paras[index] = value;
  const next = { ...content, paragraphs: paras } as Record<string, unknown>;
  delete next.paragraph1;
  delete next.paragraph2;
  return next as unknown as PnjDetailsContent;
};

export const PNJ_PARAGRAPH_KEY_RE = /^paragraphs\[(\d+)\]$/;

interface Props {
  content: PnjDetailsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PnjDetails({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(sectionRef);
  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const paragraphs = React.useMemo(
    () => resolvePnjParagraphs(content),
    [content]
  );

  const isCanvas = useIsCanvasEdit(sectionRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const blocks = gsap.utils.toArray<HTMLElement>(
      '.pnj-details__reveal',
      root
    );
    if (!blocks.length) return;

    const splits: SplitType[] = [];
    const revealCount = blocks.length;
    const triggerEl = trackRef.current ?? root;

    const ctx = gsap.context(() => {
      blocks.forEach((block, index) => {
        const split = new SplitType(block, { types: 'words' });
        splits.push(split);
        const words = split.words ?? [];
        const isTitle = index === 0;
        const paraIdx = Math.max(0, index - 1);
        const baseRotation = isTitle ? 2.5 : 1.75 + Math.min(paraIdx, 5) * 0.2;

        gsap.set(block, {
          transformOrigin: '0% 50%',
          rotate: reduced ? 0 : baseRotation,
        });

        if (words.length) {
          gsap.set(words, { autoAlpha: reduced ? 1 : 0 });
        }
      });

      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      blocks.forEach((block, index) => {
        const words = splits[index]?.words ?? [];
        const at = index === 0 ? 0 : '>';
        const paraIdx = Math.max(0, index - 1);
        const wordStagger = 0.032 + Math.min(paraIdx, 4) * 0.006;
        const wordDur = 0.9 + Math.min(paraIdx, 3) * 0.08;
        const hold = 0.22 + Math.min(paraIdx, 4) * 0.06;

        tl.to(block, { rotate: 0, duration: 1.15, ease: 'power1.out' }, at);

        if (words.length) {
          tl.to(
            words,
            {
              autoAlpha: 1,
              stagger: wordStagger,
              duration: wordDur,
              ease: 'none',
            },
            '<'
          );
          if (index < revealCount - 1) {
            tl.to({}, { duration: hold });
          }
        }
      });
    }, root);

    requestRefresh();

    return () => {
      ctx.revert();
      splits.forEach(s => s.revert());
    };
  }, [
    isCanvas,
    hasRoot,
    isMobile,
    scroller,
    requestRefresh,
    content.title,
    paragraphs,
  ]);

  // Sticky track: đủ chiều cao để scrub hết title + mọi đoạn.
  const revealCount = 1 + Math.max(paragraphs.length, 1);
  const trackVh = Math.round(100 + revealCount * (isMobile ? 52 : 58));

  const titleEl = (
    <h1
      data-element-key='title'
      className={selectableClass(
        activeKey === 'title',
        'pnj-details__reveal pnj-details__title pointer-events-auto'
      )}
      style={composeStyle(
        {
          margin: 0,
          marginBottom: RESPONSIVE.titleMb,
          fontSize: RESPONSIVE.titleFont,
          fontWeight: 300,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          color: '#003468',
          textWrap: 'balance',
        },
        styleOf('title')
      )}
    >
      {content.title}
    </h1>
  );

  const paraEls = paragraphs.map((text, i) => {
    const key = `paragraphs[${i}]`;
    const isLast = i === paragraphs.length - 1;
    return (
      <p
        key={key}
        data-element-key={key}
        className={selectableClass(
          activeKey === key,
          'pnj-details__reveal pnj-details__p pointer-events-auto'
        )}
        style={composeStyle(
          {
            margin: 0,
            marginBottom: isLast ? 0 : RESPONSIVE.paraMb,
            fontSize: RESPONSIVE.paraFont,
            fontWeight: 300,
            lineHeight: 1.7,
            letterSpacing: '-0.01em',
            color: i === 0 ? '#262626' : i === 1 ? '#404040' : '#525252',
          },
          styleOf(key)
        )}
      >
        {text}
      </p>
    );
  });

  const inner = (
    <div
      className='mx-auto w-full max-w-5xl text-center'
      style={{
        paddingLeft: RESPONSIVE.padX,
        paddingRight: RESPONSIVE.padX,
        paddingTop: RESPONSIVE.padY,
        paddingBottom: RESPONSIVE.padY,
      }}
    >
      {titleEl}
      {paraEls}
    </div>
  );

  if (isCanvas) {
    return (
      <section
        ref={sectionRef}
        id='description'
        style={blockBackgroundStyle(background)}
        className={`pnj-details @container relative flex min-h-[60svh] w-full items-center bg-white ${className ?? ''}`}
      >
        {inner}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id='description'
      style={blockBackgroundStyle(background)}
      className={`pnj-details @container relative w-full bg-white ${className ?? ''}`}
    >
      <div
        ref={trackRef}
        className='relative w-full'
        style={{ height: `${trackVh}svh` }}
      >
        <div className='sticky top-0 flex min-h-[100svh] w-full items-center'>
          {inner}
        </div>
      </div>
    </section>
  );
}
