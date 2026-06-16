'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FlipShowreelContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(Flip, ScrollTrigger);

interface FlipShowreelProps {
  content: FlipShowreelContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

// 2 layout: A = headline lớn giữa + visual nhỏ; B (.end-state) = headline nhỏ
// trên + visual phủ lớn. Flip morph giữa 2 theo scroll scrub.
const SCOPED_CSS = `
.fsr-root{position:relative;height:200vh}
.fsr-stage{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;padding:2rem;overflow:hidden}
.fsr-headline{font-size:clamp(2rem,8vw,6rem);font-weight:800;letter-spacing:-.02em;color:#fff;text-align:center;line-height:.95;z-index:2}
.fsr-visual{width:42vw;max-width:520px;aspect-ratio:16/10;border-radius:1rem;overflow:hidden}
.fsr-visual img{width:100%;height:100%;object-fit:cover}
/* end-state: headline gom lên góc, visual phủ to */
.fsr-root.end-state .fsr-stage{justify-content:flex-start;align-items:flex-start}
.fsr-root.end-state .fsr-headline{font-size:clamp(1.1rem,3vw,2rem);text-align:left}
.fsr-root.end-state .fsr-visual{position:absolute;inset:0;width:100%;max-width:none;border-radius:0;aspect-ratio:auto}
@media(max-width:1000px){.fsr-visual{width:80vw}}
`;

/**
 * Flip Showreel — port pattern Showreel (CodeGrid march2026/oct2025): khối
 * headline + visual MORPH layout theo scroll (visual phóng to phủ nền, headline
 * gom lại) bằng GSAP Flip điều khiển bằng ScrollTrigger scrub. Dùng
 * position:sticky (không pin transform) cho iOS. reduced-motion → giữ layout B.
 */
export function FlipShowreel({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FlipShowreelProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const headline = root.querySelector<HTMLElement>('.fsr-headline');
    const visual = root.querySelector<HTMLElement>('.fsr-visual');
    if (!headline || !visual) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('end-state');
      return;
    }

    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      const state = Flip.getState([headline, visual]);
      root.classList.add('end-state');
      const flip = Flip.from(state, {
        absolute: true,
        ease: 'none',
        paused: true,
      });
      st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: self => flip.progress(self.progress),
      });
    }, root);

    return () => {
      st?.kill();
      ctx.revert();
    };
  }, [content.title, content.imageUrl]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'fsr-root animate-in fade-in w-full overflow-hidden rounded-md bg-[#0b0d12] duration-500 ease-out',
        className
      )}
    >
      <style>{SCOPED_CSS}</style>
      <div className='fsr-stage'>
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(activeKey === 'title', 'fsr-headline')}
        >
          {content.title}
        </h2>
        <div className='fsr-visual'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.imageUrl} alt={content.title ?? ''} />
        </div>
      </div>
    </div>
  );
}
