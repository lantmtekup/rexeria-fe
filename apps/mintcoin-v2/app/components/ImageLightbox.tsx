'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface LightboxItem {
  src: string;
  title: string;
  desc: string;
}

// Accessible image+info popup. Rendered via portal to <body> so it escapes
// the WorksSection cards' transforms/overflow (a `fixed` element inside a
// transformed ancestor would otherwise be clipped/mispositioned).
export default function ImageLightbox({
  item,
  onClose,
}: {
  item: LightboxItem | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={item.title}
      onClick={onClose}
      className='lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm md:p-8'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='lightbox-card relative grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-xl bg-[#0f0f0f] text-neutral-100 shadow-2xl md:grid-cols-2'
      >
        {/* Square image cell — fixed aspect keeps the card balanced */}
        <div className='relative aspect-square bg-neutral-900'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        </div>

        <div className='flex flex-col justify-center p-7 md:p-9'>
          <span className='mb-3 text-[11px] tracking-[0.28em] text-[#c79119] uppercase'>
            The Jack Pine · 1 kilo gold
          </span>
          <h3 className='mb-4 font-serif text-2xl leading-tight text-neutral-50 md:text-3xl'>
            {item.title}
          </h3>
          <p className='text-sm leading-relaxed text-neutral-300'>
            {item.desc}
          </p>
        </div>

        <button
          ref={closeRef}
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100/10 text-neutral-100 transition-colors duration-200 hover:bg-neutral-100/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c79119]'
        >
          <span aria-hidden='true' className='text-base leading-none'>
            ✕
          </span>
        </button>
      </div>
    </div>,
    document.body
  );
}
