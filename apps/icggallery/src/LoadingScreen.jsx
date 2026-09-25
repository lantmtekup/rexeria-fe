import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { FLOORS, FLOOR_KEYS } from './floors.js';
import MagnoliaLogo from './MagnoliaLogo.jsx';

// Landing chrome — clone of icggallery.irisceramicagroup.com/en: the floor model
// sits behind in an isometric dollhouse view; this overlay draws the UI only.
export default function LoadingScreen({ onEnter, floor, onChangeFloor }) {
  const { progress, active } = useProgress();
  const ready = !active && progress >= 100;
  const [closing, setClosing] = useState(false);
  const [gone, setGone] = useState(false);

  // Lock scroll while the landing is up.
  useEffect(() => {
    if (gone) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [gone]);

  if (gone) return null;

  const idx = FLOOR_KEYS.indexOf(floor);
  const prevKey = FLOOR_KEYS[idx - 1];
  const nextKey = FLOOR_KEYS[idx + 1];
  const leftLabel = prevKey ? FLOORS[prevKey].label : 'Underground';
  const rightLabel = nextKey ? FLOORS[nextKey].label : 'Pop-Up Window';

  const enter = () => {
    if (!ready) return;
    setClosing(true);
    onEnter?.();
    setTimeout(() => setGone(true), 800);
  };

  return (
    <div
      className='fixed inset-0 z-[60] text-[#1b1b1b] transition-opacity duration-700'
      style={{ opacity: closing ? 0 : 1, pointerEvents: 'none' }}
    >
      {/* Header */}
      <header className='pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between px-10 py-7'>
        <a href='#' aria-label='The Magnolia' className='text-[#1b1b1b]'>
          <MagnoliaLogo />
        </a>
      </header>

      {/* Floor carousel arrows + rotated labels (ẩn khi chỉ mở 1 tầng) */}
      {FLOOR_KEYS.length > 1 && (
        <>
          <SideControl
            side='left'
            label={leftLabel}
            disabled={!prevKey}
            onClick={() => prevKey && onChangeFloor(prevKey)}
          />
          <SideControl
            side='right'
            label={rightLabel}
            disabled={!nextKey}
            onClick={() => nextKey && onChangeFloor(nextKey)}
          />
        </>
      )}

      {/* Center bottom: title + Step Inside */}
      <div className='absolute inset-x-0 bottom-[12vh] flex flex-col items-center'>
        <h1
          className='font-serif leading-none font-medium'
          style={{ fontSize: 'clamp(36px,5vw,60px)' }}
        >
          {FLOORS[floor].label}
        </h1>
        <div className='mt-8 flex h-12 items-center'>
          {ready ? (
            <button
              type='button'
              onClick={enter}
              className='enter-cta pointer-events-auto rounded-full bg-[#1b1b1b] px-10 py-3.5 text-[13px] tracking-[0.14em] text-[#d9d9d9] transition-colors duration-300 hover:bg-[#000]'
            >
              Bước vào
            </button>
          ) : (
            <span className='text-[12px] tracking-[0.25em] text-[#2d2d2d]/60 uppercase'>
              Đang tải… {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}

function SideControl({ side, label, disabled, onClick }) {
  const isLeft = side === 'left';
  return (
    <div
      className={`pointer-events-auto absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-6' : 'right-6'} flex flex-col items-center gap-4 ${
        disabled ? 'opacity-35' : 'opacity-80 hover:opacity-100'
      } transition-opacity duration-200`}
    >
      <button
        type='button'
        onClick={onClick}
        disabled={disabled}
        aria-label={`Go to ${label}`}
        className='grid h-7 w-7 place-items-center disabled:cursor-default'
      >
        <svg
          width='14'
          height='18'
          viewBox='0 0 14 18'
          fill='currentColor'
          style={{ transform: isLeft ? 'none' : 'scaleX(-1)' }}
        >
          <path d='M13 1 2 9l11 8z' opacity='0' />
          <path
            d='M11 1 1 9l10 8'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.2'
          />
        </svg>
      </button>
      <span
        className='text-[14px] tracking-[0.04em] text-[#2d2d2d] select-none'
        style={{
          writingMode: 'vertical-rl',
          transform: isLeft ? 'rotate(180deg)' : 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
}
