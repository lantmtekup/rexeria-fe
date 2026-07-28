'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { NAV, TOP_LINKS } from '../app/site';

/**
 * Menu overlay 2 lớp trượt chéo — mirror inline block 2 của gốc.
 * outer: x100%/y-100% -> 0; inner: x-100%/y100% -> 0; duration 1 power1.inOut;
 * outer borderRadius '0 0 0 50%' -> 0 (from) power4.in. Paused timeline,
 * play khi open, reverse khi close.
 */
export function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;

    gsap.set(o, { x: '100%', y: '-100%', opacity: 1, pointerEvents: 'none' });
    gsap.set(i, { x: '-100%', y: '100%', pointerEvents: 'none' });

    tl.current = gsap
      .timeline({ paused: true })
      .to([o, i], {
        x: '0%',
        y: '0%',
        duration: 1,
        pointerEvents: 'all',
        ease: 'power1.inOut',
      })
      .from(
        o,
        { borderRadius: '0 0 0 50%', duration: 1, ease: 'power4.in' },
        '<'
      );

    return () => {
      tl.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    if (open) tl.current.play();
    else tl.current.reverse();
  }, [open]);

  return (
    <div className='pointer-events-none fixed inset-0 z-[60]'>
      <div
        ref={outer}
        className='absolute inset-0 bg-[var(--yellow)]'
        style={{ borderRadius: 0 }}
      />
      <div
        ref={inner}
        className='absolute inset-0 flex flex-col justify-between bg-[#1c2126] px-8 py-10 text-white md:px-20 md:py-16'
      >
        <div className='flex items-center justify-between'>
          <span className='text-sm tracking-[0.3em] text-white/60 uppercase'>
            Menu
          </span>
          <button
            type='button'
            onClick={onClose}
            className='close-menu cursor-pointer text-sm tracking-[0.3em] text-white/80 uppercase hover:text-white'
          >
            Close
          </button>
        </div>

        <nav className='flex flex-col gap-3 md:gap-5'>
          {NAV.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className='dot text-5xl font-semibold lowercase transition-colors hover:text-[var(--yellow)] md:text-7xl'
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className='flex flex-wrap gap-x-8 gap-y-2 text-xs tracking-[0.2em] text-white/50 uppercase'>
          {TOP_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={onClose}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
