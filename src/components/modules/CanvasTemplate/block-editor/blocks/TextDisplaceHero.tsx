'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TextDisplaceHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface TextDisplaceHeroProps {
  content: TextDisplaceHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Trạng thái animate cho 1 đơn vị (ký tự/từ) — tâm gốc + vị trí lerp hiện tại. */
interface Unit {
  el: HTMLElement;
  ox: number;
  oy: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
}

/**
 * Text Displacement Hero — port từ CodeGrid "Menu XL text displacement"
 * (240_…menuxl, vanilla zero-dep). Chữ bị "thổi" văng ra khỏi con trỏ rồi đàn
 * hồi mượt về chỗ cũ bằng lerp.
 *
 * Khác bản gốc (để hợp ngữ cảnh block):
 *  - Nghe `pointermove` trên ROOT của block (không phải document) → mỗi block
 *    phản ứng theo hover riêng, và BlockMiniPreview (pointer-events:none) đứng
 *    yên thay vì giật.
 *  - Tôn trọng `prefers-reduced-motion` (render tĩnh).
 *  - Re-split + chụp lại tâm khi đổi nội dung / resize; cleanup listener + rAF.
 */
export function TextDisplaceHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: TextDisplaceHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const unitsRef = React.useRef<Unit[]>([]);
  const rafRef = React.useRef<number | null>(null);

  const splitBy = content.splitBy ?? 'char';
  const radius = content.radius ?? 150;
  const strength = content.strength ?? 300;
  const smoothing = content.smoothing ?? 0.1;

  const heading = content.title ?? '';
  const body = content.description ?? '';

  // Chụp tâm (viewport coords) của mỗi đơn vị animate trong root.
  const captureCenters = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>('[data-td-unit]')
    );
    unitsRef.current = els.map(el => {
      const r = el.getBoundingClientRect();
      return {
        el,
        ox: r.left + r.width / 2,
        oy: r.top + r.height / 2,
        cx: 0,
        cy: 0,
        tx: 0,
        ty: 0,
      };
    });
  }, []);

  React.useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = rootRef.current;
    if (!root) return;

    // Chờ layout/fonts ổn định rồi chụp tâm (đổi nội dung/lang remount effect).
    const t = window.setTimeout(captureCenters, 100);

    const onMove = (e: PointerEvent) => {
      const units = unitsRef.current;
      for (const u of units) {
        const dx = u.ox - e.clientX;
        const dy = u.oy - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < radius) {
          const force = (1 - dist / radius) * strength;
          u.tx = (dx / dist) * force;
          u.ty = (dy / dist) * force;
        } else {
          u.tx = 0;
          u.ty = 0;
        }
      }
    };
    const onLeave = () => {
      for (const u of unitsRef.current) {
        u.tx = 0;
        u.ty = 0;
      }
    };

    const tick = () => {
      for (const u of unitsRef.current) {
        u.cx += (u.tx - u.cx) * smoothing;
        u.cy += (u.ty - u.cy) * smoothing;
        u.el.style.transform = `translate(${u.cx.toFixed(2)}px, ${u.cy.toFixed(2)}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', captureCenters);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(t);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', captureCenters);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // Remount khi nội dung/cách tách/tham số đổi → chụp tâm lại từ đầu.
  }, [heading, body, splitBy, radius, strength, smoothing, captureCenters]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-md bg-neutral-950 px-6 py-20 text-center text-white duration-500 ease-out @2xl:py-28',
        className
      )}
    >
      {content.eyebrow && (
        <span
          data-element-key='eyebrow'
          style={styleOf('eyebrow')}
          className={selectableClass(
            activeKey === 'eyebrow',
            'text-2xs font-semibold tracking-[0.32em] text-white/55 uppercase @2xl:text-xs'
          )}
        >
          {content.eyebrow}
        </span>
      )}

      {heading && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'text-4xl leading-[1.05] font-semibold tracking-tight @lg:text-6xl @3xl:text-7xl'
          )}
        >
          <SplitText text={heading} splitBy={splitBy} />
        </h2>
      )}

      {body && (
        <p
          data-element-key='description'
          style={styleOf('description')}
          className={selectableClass(
            activeKey === 'description',
            'max-w-xl text-sm text-white/65 @2xl:text-base'
          )}
        >
          <SplitText text={body} splitBy='word' />
        </p>
      )}
    </div>
  );
}

/**
 * Tách text thành các đơn vị animate (`data-td-unit`). `char` vẫn bọc theo từ
 * (`inline-block` + nowrap) để chữ không gãy giữa từ; khoảng trắng là text-node
 * thật để xuống dòng tự nhiên.
 */
function SplitText({
  text,
  splitBy,
}: {
  text: string;
  splitBy: 'word' | 'char';
}) {
  const words = text.split(/(\s+)/); // giữ cả khoảng trắng làm phần tử lẻ
  return (
    <>
      {words.map((w, i) => {
        if (/^\s+$/.test(w))
          return <React.Fragment key={i}>{w}</React.Fragment>;
        if (splitBy === 'word') {
          return (
            <span
              key={i}
              data-td-unit
              className='inline-block [will-change:transform]'
            >
              {w}
            </span>
          );
        }
        return (
          <span key={i} className='inline-block whitespace-nowrap'>
            {Array.from(w).map((ch, j) => (
              <span
                key={j}
                data-td-unit
                className='inline-block [will-change:transform]'
              >
                {ch}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}
