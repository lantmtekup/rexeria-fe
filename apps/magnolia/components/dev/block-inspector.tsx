'use client';
import { useCallback, useEffect, useState } from 'react';

/**
 * Dev overlay that names the block under the viewport.
 *
 * Off by default so it never touches the real page. Open with `?blocks=1`, or press `b` at any
 * time to toggle. Nothing here renders on the server, and it reads the live DOM rather than a
 * hardcoded list of positions, so it stays correct when a track height changes.
 */
type BlockInfo = { order: number; name: string; file: string; note: string };

const BLOCKS: Record<string, BlockInfo> = {
  top: {
    order: 1,
    name: 'Hero',
    file: 'sections/hero.tsx',
    note: '520svh · chuỗi 286 ảnh canvas',
  },
  heritage: {
    order: 2,
    name: 'Heritage',
    file: 'sections/heritage.tsx',
    note: '260vh · chữ quét ngang ±80vw',
  },
  'horizontal-slide': {
    order: 3,
    name: 'Image journey',
    file: 'sections/horizontal-slide.tsx',
    note: '700vh · 5 slide trượt ngang',
  },
  'interactive-tour': {
    order: 4,
    name: 'Interactive tour',
    file: 'sections/interactive-tour.tsx',
    note: '100svh · iframe tour 3D',
  },
  units: {
    order: 5,
    name: 'Units',
    file: 'sections/units.tsx',
    note: 'cao tự nhiên · 3 thẻ + dải ảnh',
  },
  grace: {
    order: 6,
    name: 'Effortless grace',
    file: 'sections/grace.tsx',
    note: '300vh · chuỗi ảnh chồng mờ',
  },
  gallery: {
    order: 7,
    name: 'Day experience',
    file: 'sections/gallery.tsx',
    note: '640vh · video tua + 4 panel',
  },
  consultation: {
    order: 8,
    name: 'Consultation',
    file: 'sections/consultation.tsx',
    note: '100svh · form + chân trang',
  },
};

const ORDER = Object.entries(BLOCKS).sort((a, b) => a[1].order - b[1].order);

export function BlockInspector() {
  const [on, setOn] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get('blocks') === '1');
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
      if (e.key === 'b' || e.key === 'B') setOn(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!on) return;
    // "Current" = the section covering the middle of the screen, which is what the eye reads as
    // the block you are on. Cheaper and steadier than an IntersectionObserver ratio race.
    const pick = () => {
      const mid = window.innerHeight / 2;
      const hit = [
        ...document.querySelectorAll<HTMLElement>('main section[id]'),
      ].find(s => {
        const r = s.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      setActive(hit?.id ?? null);
    };
    pick();
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [on]);

  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback((text: string, what: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(what);
        window.setTimeout(() => setCopied(null), 1400);
      },
      () => setCopied('không chép được')
    );
  }, []);

  if (!on) return null;
  const current = active ? BLOCKS[active] : undefined;

  const allText = ORDER.map(
    ([id, b]) =>
      `${String(b.order).padStart(2, '0')}  ${b.name}\t#${id}\t${b.file}\t${b.note}`
  ).join('\n');
  const currentText = current
    ? `${current.name}\t#${active}\t${current.file}\t${current.note}`
    : '';

  return (
    <div className='pointer-events-none fixed inset-0 z-[300] font-sans'>
      {/* Badge for the block you are looking at. */}
      <div className='border-champagne-300/40 pointer-events-auto absolute top-1/2 left-5 -translate-y-1/2 rounded-sm border bg-black/80 px-4 py-3 backdrop-blur-md select-text'>
        <p className='text-champagne-300 font-mono text-[10px] tracking-[0.22em] uppercase'>
          {current ? `block ${current.order} / 8` : 'ngoài vùng block'}
        </p>
        <p className='font-display text-ivory mt-1 text-[1.35rem] leading-none'>
          {current?.name ?? '—'}
        </p>
        {current && (
          <>
            <p className='text-ivory/55 mt-1.5 font-mono text-[10px]'>
              #{active}
            </p>
            <p className='text-ivory/55 font-mono text-[10px]'>
              {current.file}
            </p>
            <p className='text-champagne-200/70 mt-1 font-mono text-[10px]'>
              {current.note}
            </p>
            <button
              type='button'
              onClick={() => copy(currentText, 'block này')}
              className='border-ivory/25 text-ivory/70 hover:border-champagne-300/60 hover:text-champagne-200 mt-2.5 w-full border px-2 py-1 font-mono text-[9px] tracking-[0.16em] uppercase transition-colors'
            >
              chép block này
            </button>
          </>
        )}
      </div>

      {/* The whole running order, so the structure is visible at a glance. */}
      <div className='border-ivory/15 pointer-events-auto absolute bottom-5 left-5 rounded-sm border bg-black/70 px-3 py-2.5 backdrop-blur-md select-text'>
        <ol className='space-y-0.5'>
          {ORDER.map(([id, b]) => (
            <li
              key={id}
              className={`font-mono text-[10px] leading-[1.5] ${id === active ? 'text-champagne-300' : 'text-ivory/35'}`}
            >
              <span className='tabular-nums'>
                {String(b.order).padStart(2, '0')}
              </span>
              <span className='mx-2'>{id === active ? '▸' : '·'}</span>
              {b.name}
            </li>
          ))}
        </ol>
        <button
          type='button'
          onClick={() => copy(allText, 'cả 8 block')}
          className='border-ivory/25 text-ivory/70 hover:border-champagne-300/60 hover:text-champagne-200 mt-2 w-full border px-2 py-1 font-mono text-[9px] tracking-[0.16em] uppercase transition-colors'
        >
          chép cả 8 block
        </button>
      </div>

      <p className='border-ivory/15 text-ivory/45 absolute right-5 bottom-5 rounded-sm border bg-black/70 px-3 py-2 font-mono text-[10px] backdrop-blur-md'>
        {copied ? (
          <span className='text-champagne-300'>đã chép {copied}</span>
        ) : (
          <>
            bôi đen để copy · bấm <span className='text-champagne-300'>B</span>{' '}
            để tắt
          </>
        )}
      </p>
    </div>
  );
}
