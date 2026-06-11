'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ColorImages {
  orange: string[];
  black: string[];
  blue: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialColor?: 'orange' | 'black' | 'blue';
  images: ColorImages;
}

// Side-drawer detail panel with per-color image swiper. Slides in from
// right; locks body scroll while open via Lenis stop/start.
export default function DiscoverPanel({
  open,
  onClose,
  initialColor = 'orange',
  images,
}: Props) {
  const [color, setColor] = useState<'orange' | 'black' | 'blue'>(initialColor);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColor(initialColor);
  }, [initialColor]);

  useEffect(() => {
    const lenis = (
      window as unknown as { __lenis?: { stop: () => void; start: () => void } }
    ).__lenis;
    if (open) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [open]);

  const colorList: Array<'orange' | 'black' | 'blue'> = [
    'orange',
    'black',
    'blue',
  ];
  const colorMap = { orange: '#E37B3A', black: '#111', blue: '#3B5998' };

  return (
    <div
      ref={panelRef}
      className={`content-discover fixed inset-0 z-[1999] bg-black/50 transition-opacity duration-300 ${
        open
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
      data-lenis-prevent
    >
      <div
        className={`absolute top-0 right-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-500 md:w-[80%] md:flex-row lg:w-[75%] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Image swiper.
            CRITICAL: `min-w-0 overflow-hidden` on the flex-1 wrapper —
            without these, Swiper's internal swiper-wrapper measures slide
            content (full-width img) and ends up at 2^24 px (the max int
            ceiling), squashing the detail panel to a sliver. min-w-0 lets
            the flex item actually shrink to share space; overflow-hidden
            prevents Swiper's auto-grown wrapper from blowing up the layout. */}
        <div className='relative min-h-[40vh] min-w-0 flex-1 overflow-hidden bg-neutral-100 md:min-h-full'>
          <Swiper
            key={color}
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className='h-full w-full'
          >
            {images[color].map((src, i) => (
              <SwiperSlide key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Ronconasli ${color} ${i + 1}`}
                  className='h-full w-full object-contain'
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Content panel — matches Astro/Delvaux ref:
            sans-serif title, "IN BOUTIQUE" pill badge top-right,
            row-style spec list (Color/Dimensions/Sizes), full-width
            squared CTAs, plain accordion. */}
        <div
          className='flex w-full flex-col overflow-y-auto bg-white px-8 py-10 md:w-[420px] lg:w-[460px]'
          data-lenis-prevent
        >
          <button
            type='button'
            onClick={onClose}
            className='mb-4 self-end p-2 hover:opacity-60'
            aria-label='Close'
          >
            <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
              <line x1='0.65' y1='14.65' x2='14.79' y2='0.5' stroke='black' />
              <line x1='1.35' y1='0.65' x2='15.5' y2='14.79' stroke='black' />
            </svg>
          </button>

          {/* Title + IN BOUTIQUE badge (badge sits inline-right) */}
          <div className='mb-2 flex items-start justify-between gap-4'>
            <h2 className='text-2xl leading-tight font-light tracking-tight md:text-[26px]'>
              Ronconasli {color.charAt(0).toUpperCase() + color.slice(1)} Satin
              Crystal Slingback
            </h2>
            <span className='mt-1 shrink-0 border border-black/20 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase'>
              In Boutique
            </span>
          </div>
          <p className='mb-8 text-sm text-neutral-500 italic'>Italian Satin</p>

          {/* Row: Color + swatches */}
          <div className='flex items-center justify-between border-t border-black/10 py-5'>
            <span className='text-sm capitalize'>{color}</span>
            <div className='flex gap-2'>
              {colorList.map(c => (
                <button
                  key={c}
                  type='button'
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border ${
                    color === c
                      ? 'border-black ring-1 ring-black ring-offset-2'
                      : 'border-black/20'
                  }`}
                  style={{ background: colorMap[c] }}
                  aria-label={`Select ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Row: Dimensions */}
          <div className='flex items-start justify-between gap-6 border-t border-black/10 py-5 text-sm'>
            <span className='shrink-0'>Dimensions</span>
            <span className='text-right text-neutral-700'>
              Heel: 90mm / Sole: Leather / Closure: Buckle
            </span>
          </div>

          {/* Row: Sizes */}
          <div className='mb-8 flex items-center justify-between border-t border-b border-black/10 py-5 text-sm'>
            <span>Sizes</span>
            <span className='text-neutral-700'>EU 35–42</span>
          </div>

          {/* CTAs — full-width squared (not pill) like the ref */}
          <div className='mb-10 flex flex-col gap-3'>
            <a
              href='https://www.manoloblahnik.com/int/contact/contact/index/'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-black px-6 py-4 text-center text-xs tracking-[0.18em] text-white uppercase'
            >
              Book an appointment
            </a>
            <a
              href='https://www.manoloblahnik.com/int/ronconasli-99920.html'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-black px-6 py-4 text-center text-xs tracking-[0.18em] text-white uppercase'
            >
              Buy Now
            </a>
          </div>

          {/* Accordion */}
          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Details</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <div className='pt-4 text-sm text-neutral-600'>
              <p>REF. 126-3149-0001</p>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>Orange satin upper</li>
                <li>Crystal embellishments, hand-applied</li>
                <li>Leather sole</li>
                <li>90mm covered heel</li>
                <li>Adjustable slingback strap with gold-tone buckle</li>
                <li>Made in Italy</li>
              </ul>
            </div>
          </details>
          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Care</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <a
              href='https://www.manoloblahnik.com/int/care-guide/'
              className='block pt-4 text-sm underline'
            >
              View care guide
            </a>
          </details>
          <details className='border-t border-b border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Shipping and returns</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p className='pt-4 text-sm text-neutral-600'>
              International delivery offered on all products. Returns accepted
              within 30 days of purchase.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
