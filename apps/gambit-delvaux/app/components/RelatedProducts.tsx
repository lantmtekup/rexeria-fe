'use client';

import { useEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  createBlockEntrySnap,
  scrollToSection,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

const BAG_Y = 100;
const BAG_DURATION = 0.85;
const BAG_STAGGER = 0.1;
const LABEL_Y = 24;
const LABEL_DURATION = 0.55;
const BAR_DURATION = 0.5;
const INTRO_HOLD = 0.12;
const BACK_SCROLL_DURATION = 0.8;

const PRODUCTS = [
  {
    src: '/p8.png',
    name: 'Cool Box Mini',
    material: 'Taurillon Soft',
  },
  {
    src: '/p9.png',
    name: 'Lingot',
    material: 'Alpina Calf',
  },
  {
    src: '/p10.png',
    name: 'Pin D Multifonctions',
    material: 'Taurillon Soft',
  },
  {
    src: '/p11.png',
    name: 'Pin Swing',
    material: 'Taurillon Soft',
  },
] as const;

export default function RelatedProducts() {
  const rootRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const backBarRef = useRef<HTMLButtonElement>(null);

  const handleBackToBuy = () => {
    const buy = document.getElementById('buy');
    if (!buy) return;

    scrollToSection(buy, { duration: BACK_SCROLL_DURATION });
  };

  useEffect(() => {
    const root = rootRef.current;
    const grid = gridRef.current;
    const backBar = backBarRef.current;

    if (!root || !grid || !backBar) return;

    const bagEls = grid.querySelectorAll<HTMLElement>('[data-related-bag]');
    const labelEls = grid.querySelectorAll<HTMLElement>('[data-related-label]');

    if (bagEls.length === 0 || labelEls.length === 0) return;

    const mm = gsap.matchMedia();
    let cancelled = false;

    const setupMotion = () => {
      if (cancelled) return;

      mm.add(MOTION_CONDITIONS, context => {
        const { reduce } = context.conditions as MotionConditions;

        const ctx = gsap.context(() => {
          const setInitialState = () => {
            gsap.set(bagEls, { y: BAG_Y, autoAlpha: 0 });
            gsap.set(labelEls, { y: LABEL_Y, autoAlpha: 0 });
            gsap.set(backBar, { y: 12, autoAlpha: 0 });
          };

          const setFinalState = () => {
            gsap.set(bagEls, { y: 0, autoAlpha: 1 });
            gsap.set(labelEls, { y: 0, autoAlpha: 1 });
            gsap.set(backBar, { y: 0, autoAlpha: 1 });
          };

          if (reduce) {
            setFinalState();
            return;
          }

          createBlockEntrySnap(root);
          setInitialState();

          ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: '+=40%',
            pin: true,
            anticipatePin: 1,
          });

          const tl = gsap.timeline({
            paused: true,
            defaults: { ease: 'power3.out' },
            scrollTrigger: {
              trigger: root,
              start: 'top 98%',
              toggleActions: 'restart none restart reset',
              onLeaveBack: () => {
                setInitialState();
              },
              onLeave: () => {
                setInitialState();
              },
            },
          });

          tl.call(setInitialState)
            .to({}, { duration: INTRO_HOLD })
            .to(bagEls, {
              y: 0,
              autoAlpha: 1,
              duration: BAG_DURATION,
              stagger: BAG_STAGGER,
            })
            .to(
              labelEls,
              {
                y: 0,
                autoAlpha: 1,
                duration: LABEL_DURATION,
                stagger: 0.06,
              },
              '-=0.35'
            )
            .to(
              backBar,
              {
                y: 0,
                autoAlpha: 1,
                duration: BAR_DURATION,
              },
              '-=0.3'
            );
        }, root);

        ScrollTrigger.refresh();

        return () => {
          ctx.revert();
        };
      });
    };

    void document.fonts.ready.then(setupMotion);

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className='relative h-svh overflow-hidden bg-[#F5F5F5]'
      aria-label='You Might Also Like'
    >
      <div className='flex h-full flex-col pt-20 md:pt-24'>
        <div className='flex min-h-0 flex-1 flex-col justify-center px-3 pb-6 sm:px-4 md:px-6 md:pb-8 lg:px-8'>
          <div
            ref={gridRef}
            className='mx-auto grid w-full max-w-[92rem] grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5 lg:gap-x-8'
          >
            {PRODUCTS.map(product => (
              <article key={product.src} className='flex flex-col items-center'>
                <div
                  data-related-bag
                  className='flex w-full items-end justify-center will-change-transform'
                >
                  <img
                    src={product.src}
                    alt={product.name}
                    className='h-auto max-h-[28svh] w-full object-contain md:max-h-[36svh]'
                    draggable={false}
                  />
                </div>
                <div
                  data-related-label
                  className='mt-3 flex w-full items-baseline justify-between gap-2 will-change-transform md:mt-4'
                >
                  <span className='font-(family-name:--font-atlas) text-[10px] leading-tight tracking-[0.02em] text-black sm:text-[11px] md:text-xs'>
                    {product.name}
                  </span>
                  <span className='shrink-0 font-(family-name:--font-atlas) text-[9px] leading-tight tracking-[0.02em] text-black/45 sm:text-[10px] md:text-[11px]'>
                    {product.material}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button
          ref={backBarRef}
          type='button'
          onClick={handleBackToBuy}
          onKeyDown={event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            handleBackToBuy();
          }}
          aria-label='Back to Buy Brillant Mini'
          className='flex w-full shrink-0 cursor-pointer items-center justify-between bg-black px-4 py-3.5 text-left text-white will-change-transform sm:px-5 sm:py-4 md:px-6'
        >
          <span className='font-(family-name:--font-atlas) text-[11px] tracking-[0.04em] sm:text-xs md:text-sm'>
            Back To Buy Brillant Mini
          </span>
          <span aria-hidden className='text-sm leading-none sm:text-base'>
            →
          </span>
        </button>

        {/* Spacer khớp chiều cao ProductSectionNav (fixed) — không tạo khoảng hở */}
        <div
          className='h-[calc(2.5rem+env(safe-area-inset-bottom))] shrink-0 sm:h-[calc(3rem+env(safe-area-inset-bottom))] md:h-[calc(3.25rem+env(safe-area-inset-bottom))]'
          aria-hidden
        />
      </div>
    </section>
  );
}
