'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type ViewKey = 'reverse' | 'obverse' | 'packaging';

interface ViewImages {
  reverse: string[];
  obverse: string[];
  packaging: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialView?: ViewKey;
  images: ViewImages;
}

// Side-drawer detail panel with per-view image swiper. Slides in from
// right; locks body scroll while open via Lenis stop/start.
export default function DiscoverPanel({
  open,
  onClose,
  initialView = 'reverse',
  images,
}: Props) {
  const [view, setView] = useState<ViewKey>(initialView);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

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

  const viewList: ViewKey[] = ['reverse', 'obverse', 'packaging'];
  const viewLabel: Record<ViewKey, string> = {
    reverse: 'Reverse',
    obverse: 'Obverse',
    packaging: 'Packaging',
  };

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
        <div className='relative min-h-[40vh] min-w-0 flex-1 overflow-hidden bg-neutral-100 md:min-h-full'>
          <Swiper
            key={view}
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className='h-full w-full'
          >
            {images[view].map((src, i) => (
              <SwiperSlide key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${viewLabel[view]} ${i + 1}`}
                  className='h-full w-full object-contain'
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div
          className='flex w-full flex-col overflow-y-auto bg-white px-8 py-10 md:w-[420px] lg:w-[460px]'
          data-lenis-prevent
        >
          <button
            type='button'
            onClick={onClose}
            data-cta-id='discover-close'
            className='mb-4 self-end p-2 hover:opacity-60'
            aria-label='Close'
          >
            <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
              <line x1='0.65' y1='14.65' x2='14.79' y2='0.5' stroke='black' />
              <line x1='1.35' y1='0.65' x2='15.5' y2='14.79' stroke='black' />
            </svg>
          </button>

          <div className='mb-2 flex items-start justify-between gap-4'>
            <h2 className='text-2xl leading-tight font-light tracking-tight md:text-[26px]'>
              The Jack Pine by Tom Thomson — 1 Kilo Pure Gold Coin
            </h2>
            <span className='mt-1 shrink-0 border border-black/20 px-3 py-1.5 text-[10px] tracking-[0.18em] whitespace-nowrap uppercase'>
              Mintage 75
            </span>
          </div>
          <p className='mb-8 text-sm text-neutral-500 italic'>
            99.99% Pure Gold · Proof
          </p>

          {/* Row: view */}
          <div className='flex items-center justify-between border-t border-black/10 py-5'>
            <span className='text-sm capitalize'>{viewLabel[view]}</span>
            <div className='flex gap-2'>
              {viewList.map(c => (
                <button
                  key={c}
                  type='button'
                  onClick={() => setView(c)}
                  data-cta-id={`discover-view-${c}`}
                  className={`h-6 w-6 overflow-hidden rounded-full border ${
                    view === c
                      ? 'border-black ring-1 ring-black ring-offset-2'
                      : 'border-black/20'
                  }`}
                  style={{
                    backgroundImage: `url(${images[c][0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-label={`Select ${c}`}
                />
              ))}
            </div>
          </div>

          <div className='flex items-start justify-between gap-6 border-t border-black/10 py-5 text-sm'>
            <span className='shrink-0'>Dimensions</span>
            <span className='text-right text-neutral-700'>
              Weight: 1006.1 g / Diameter: 101.6 mm / Edge: Serrated
            </span>
          </div>

          <div className='mb-8 flex items-center justify-between border-t border-b border-black/10 py-5 text-sm'>
            <span>Face Value</span>
            <span className='text-neutral-700'>CAD $2,500</span>
          </div>

          <div className='mb-10 flex flex-col gap-3'>
            <a
              href='https://www.mint.ca/en/contact-us'
              target='_blank'
              rel='noopener noreferrer'
              data-cta-id='discover-contact'
              className='bg-black px-6 py-4 text-center text-xs tracking-[0.18em] text-white uppercase'
            >
              Contact the mint
            </a>
            <a
              href='https://www.mint.ca/en/shop/coins/2026/the-jack-pine-by-tom-thomson-1-kilo-pure-gold-coin'
              target='_blank'
              rel='noopener noreferrer'
              data-cta-id='discover-buy-now'
              className='bg-black px-6 py-4 text-center text-xs tracking-[0.18em] text-white uppercase'
            >
              Buy Now
            </a>
          </div>

          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Details</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <div className='pt-4 text-sm text-neutral-600'>
              <p>REF. 252469</p>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>Composition: 99.99% pure gold</li>
                <li>Weight: 1006.1 g</li>
                <li>Diameter: 101.6 mm · Edge: serrated</li>
                <li>Finish: proof</li>
                <li>Face value: CAD $2,500</li>
                <li>Worldwide mintage: 75</li>
                <li>Obverse effigy: Steven Rosati</li>
                <li>
                  Reverse: Tom Thomson&rsquo;s &ldquo;The Jack Pine&rdquo;
                  (1916–17)
                </li>
              </ul>
            </div>
          </details>
          <details className='border-t border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Packaging</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p className='pt-4 text-sm text-neutral-600'>
              Encapsulated and presented in a Royal Canadian Mint-branded wooden
              case with black beauty box. Includes a serialised certificate of
              authenticity.
            </p>
          </details>
          <details className='border-t border-b border-black/10 py-4'>
            <summary className='flex cursor-pointer list-none justify-between text-sm'>
              <span>Shipping</span>
              <span className='text-lg leading-none'>+</span>
            </summary>
            <p className='pt-4 text-sm text-neutral-600'>
              Shipped fully insured. International availability subject to Royal
              Canadian Mint regional policies.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
