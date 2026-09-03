'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ProtectionScrollytellingContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ProtectionScrollytellingProps {
  content: ProtectionScrollytellingContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Protection scrollytelling — port 1:1 hero `.mainImg-home` của
 * en.protection.gr. Canvas frame-sequence (240 ảnh cover-draw), pin theo
 * scroll, tagline trượt lên rồi các section title (fabrics/applications/…)
 * cycle vào/ra. Timeline copy từ inline GSAP gốc: scrub 0.5, counter 0→N-1
 * duration 8, mỗi section tại 0.5+1.5*i. Chấm cuối tiêu đề màu vàng brand.
 *
 * Frame URL: `framePattern` chứa `{i}` (thay số 3 chữ số, 1-indexed).
 */
export function ProtectionScrollytelling({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ProtectionScrollytellingProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const wrap = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const titlesRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = React.useState(false);

  const frameCount = content.frameCount || 240;
  const framePattern = content.framePattern || '';
  const sections = Array.isArray(content.sections) ? content.sections : [];
  const yellow = content.accent || '#FCC200';

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    const trigger = wrap.current;
    if (!canvas || !trigger || !framePattern) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let viewW = 0;
    let viewH = 0;
    let dpr = 1;
    let lastFrame = -1;
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = framePattern.replace('{i}', String(i).padStart(3, '0'));
      images.push(img);
    }
    const counter = { frame: 0 };

    function drawFrame(i: number) {
      const img = images[Math.max(0, Math.min(frameCount - 1, i))];
      if (!img || !img.complete || !viewW || !viewH) return;
      ctx!.clearRect(0, 0, viewW, viewH);
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(viewW / iw, viewH / ih);
      const w = iw * scale;
      const h = ih * scale;
      ctx!.drawImage(img, (viewW - w) / 2, (viewH - h) / 2, w, h);
    }
    function render() {
      const f = Math.round(counter.frame);
      if (f === lastFrame) return;
      lastFrame = f;
      drawFrame(f);
    }
    function resizeCanvas() {
      const r = canvas!.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      viewW = r.width;
      viewH = r.height;
      canvas!.width = Math.round(viewW * dpr);
      canvas!.height = Math.round(viewH * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastFrame = -1;
      drawFrame(counter.frame | 0);
    }

    images[0].onload = () => {
      resizeCanvas();
      drawFrame(0);
      setReady(true);
    };
    if (images[0].complete) {
      resizeCanvas();
      drawFrame(0);
      setReady(true);
    }

    const isTouch = ScrollTrigger.isTouch === 1;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: isTouch ? '+=4500px' : '+=6800px',
        pin: true,
        scrub: 0.5,
      },
    });
    tl.to(
      counter,
      { frame: frameCount - 1, duration: 8, ease: 'none', onUpdate: render },
      0
    );
    if (titlesRef.current) {
      tl.to(titlesRef.current, { y: -100, duration: 0.25 }, 0).to(
        titlesRef.current,
        { opacity: 0, duration: 0.35 },
        0.15
      );
    }
    sections.forEach((_, ind) => {
      const el = sectionRefs.current[ind];
      const at = 0.5 + 1.5 * ind;
      if (el) {
        tl.to(el, { y: 0, opacity: 1, duration: 0.5 }, at)
          .to(el, { y: -30, duration: 0.5 }, 1 + 1.5 * ind)
          .to(el, { y: -150, opacity: 0, duration: 0.5 }, 1.5 + 1.5 * ind);
      }
    });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    ScrollTrigger.refresh();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framePattern, frameCount]);

  return (
    <div
      ref={wrap}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative h-screen w-full overflow-hidden bg-[#f2f2f2]',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className='absolute inset-0 h-full w-full transition-opacity duration-500'
        style={{ opacity: ready ? 1 : 0 }}
      />

      <div
        ref={titlesRef}
        data-element-key='tagline'
        style={styleOf('tagline')}
        className={selectableClass(
          activeKey === 'tagline',
          'pointer-events-none absolute inset-x-0 bottom-[14vh] z-10 flex flex-col items-center px-6 text-center'
        )}
      >
        <h2 className='text-3xl leading-[1.05] font-semibold text-[#5b6670] @2xl:text-6xl'>
          <span>
            {content.tagline1}
            <span style={{ color: yellow }}>.</span>
          </span>
          <br />
          <span>
            {content.tagline2}
            <span style={{ color: yellow }}>.</span>
          </span>
        </h2>
        {content.subtitle ? (
          <p className='mt-4 max-w-md text-sm text-[#5b6670]/70 @2xl:text-base'>
            {content.subtitle}
          </p>
        ) : null}
        <span className='mt-8 text-[11px] tracking-[0.3em] text-[#5b6670]/50 uppercase'>
          Scroll
        </span>
      </div>

      {sections.map((s, i) => (
        <div
          key={s.title + i}
          className='pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center'
        >
          <div
            ref={el => {
              sectionRefs.current[i] = el;
            }}
            style={{ opacity: 0, transform: 'translateY(150px)' }}
          >
            <span className='text-5xl font-semibold text-[#5b6670] lowercase @2xl:text-8xl'>
              {s.title}
              <span style={{ color: yellow }}>.</span>
            </span>
            {s.more ? (
              <div className='mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1'>
                {s.more.split(',').map(m => (
                  <span
                    key={m}
                    className='text-xs font-semibold tracking-[0.14em] uppercase'
                    style={{ color: yellow }}
                  >
                    {m.trim()}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
