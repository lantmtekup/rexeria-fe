'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

const ACCENT = '#6E7A6F';
const WHITE = '#ffffff';

type ResidenceDetail = {
  bedBath: string;
  intExt: string;
  price: string;
  monthlyCc: string;
  reTax: string;
  status: string;
  exposure: string;
};

type Residence = {
  id: string;
  title: string;
  floorPlan: { src: string; alt: string };
  details: ResidenceDetail;
  listingUrl: string;
  floorPlanUrl: string;
};

const RESIDENCES: readonly Residence[] = [
  {
    id: 'penthouse-b',
    title: 'Penthouse B',
    floorPlan: { src: '/s4-p1.png', alt: 'Penthouse B floor plan' },
    details: {
      bedBath: '4 / 3.5',
      intExt: '3,059 / 1,079',
      price: '$11,500,000',
      monthlyCc: '$4,411',
      reTax: '$7,889',
      status: 'AVAILABLE',
      exposure: 'N,S,E',
    },
    listingUrl: '#',
    floorPlanUrl: '#',
  },
  {
    id: '15a',
    title: '15A',
    floorPlan: { src: '/s4-p2.png', alt: '15A floor plan' },
    details: {
      bedBath: '5 / 4.5',
      intExt: '3,444 / 992',
      price: '$11,995,000',
      monthlyCc: '$4,892',
      reTax: '$8,214',
      status: 'AVAILABLE',
      exposure: 'N,S,W',
    },
    listingUrl: '#',
    floorPlanUrl: '#',
  },
] as const;

const PdfIcon = () => (
  <svg
    width='28'
    height='32'
    viewBox='0 0 28 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <path
      d='M4 0h14l6 6v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z'
      stroke='currentColor'
      strokeWidth='1.25'
    />
    <path d='M18 0v6h6' stroke='currentColor' strokeWidth='1.25' />
    <text
      x='14'
      y='22'
      textAnchor='middle'
      fill='currentColor'
      fontSize='7'
      fontWeight='600'
      letterSpacing='0.04em'
    >
      PDF
    </text>
  </svg>
);

export default function FinalResidences() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { finePointer, reduce } = ctx.conditions as MotionConditions;

      const bg = section.querySelector<HTMLElement>('[data-layer="bg"]');
      const ui = section.querySelectorAll<HTMLElement>('[data-ui]');
      const cards = section.querySelectorAll<HTMLElement>(
        '[data-residence-card]'
      );

      if (bg && !reduce) {
        // The sticky SceneParallax shows through this section until the
        // background is solid. Ships opaque in the markup (correct without JS)
        // and fades in only *after* that section's veil has finished, i.e.
        // onto an already-flat cream viewport — cream over cream is invisible,
        // so this never draws a hard edge across the scene.
        gsap.fromTo(
          bg,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 30%',
              end: 'top 16%',
              scrub: 0.4,
            },
          }
        );
      }

      gsap
        .timeline({
          defaults: { ease: 'power3.out', duration: reduce ? 0 : 0.9 },
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
        })
        .fromTo(
          cards,
          { autoAlpha: 0, y: reduce ? 0 : 32 },
          { autoAlpha: 1, y: 0, stagger: reduce ? 0 : 0.15 }
        );

      if (reduce) {
        gsap.set(ui, { autoAlpha: 1, y: 0 });
      } else {
        const resetUi = () => {
          gsap.killTweensOf(ui);
          gsap.set(ui, { autoAlpha: 0, y: 24 });
        };
        const playUi = () => {
          gsap.killTweensOf(ui);
          gsap.fromTo(
            ui,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.9,
              ease: 'power3.out',
              overwrite: true,
            }
          );
        };

        resetUi();
        ScrollTrigger.create({
          trigger: section,
          start: 'top 75%',
          onEnter: playUi,
          onEnterBack: playUi,
          onLeaveBack: resetUi,
        });
      }

      if (reduce) return;

      const cleanups: Array<() => void> = [];

      cards.forEach(card => {
        const fill = card.querySelector<HTMLElement>('[data-hover-fill]');
        const labels = card.querySelectorAll<HTMLElement>('[data-hover-label]');
        const values = card.querySelectorAll<HTMLElement>('[data-hover-value]');
        const links = card.querySelectorAll<HTMLElement>('[data-hover-link]');
        const button = card.querySelector<HTMLElement>('[data-hover-button]');
        if (!fill || !button) return;

        gsap.set(fill, {
          scaleY: 0,
          transformOrigin: 'bottom center',
          force3D: true,
        });

        const hoverTl = gsap.timeline({
          paused: true,
          defaults: { overwrite: 'auto' },
        });
        // Fill leads; text/button follow so colors swap as the layer covers them.
        hoverTl
          .to(
            fill,
            {
              scaleY: 1,
              duration: 0.7,
              ease: 'power3.out',
            },
            0
          )
          .to(
            [labels, values, links],
            { color: WHITE, duration: 0.45, ease: 'power2.out' },
            0.18
          )
          .to(
            button,
            {
              backgroundColor: WHITE,
              color: ACCENT,
              duration: 0.5,
              ease: 'power2.out',
            },
            0.12
          );

        const handleEnter = () => {
          hoverTl.timeScale(1).play();
        };
        const handleLeave = () => {
          // Slightly quicker reverse feels snappier on exit without harshness.
          hoverTl.timeScale(1.15).reverse();
        };

        // Touch không có hover — fill chạy khi card vào giữa màn hình,
        // reverse khi cuộn ngược lên trên card.
        if (!finePointer) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 55%',
            onEnter: handleEnter,
            onLeaveBack: handleLeave,
          });
          cleanups.push(() => hoverTl.kill());
          return;
        }

        const handleFocusOut = (e: FocusEvent) => {
          const next = e.relatedTarget as Node | null;
          if (next && card.contains(next)) return;
          handleLeave();
        };

        // Whole card is the hover target — title, image, or details all trigger.
        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);
        card.addEventListener('focusin', handleEnter);
        card.addEventListener('focusout', handleFocusOut);

        cleanups.push(() => {
          card.removeEventListener('mouseenter', handleEnter);
          card.removeEventListener('mouseleave', handleLeave);
          card.removeEventListener('focusin', handleEnter);
          card.removeEventListener('focusout', handleFocusOut);
          hoverTl.kill();
        });
      });

      return () => {
        cleanups.forEach(fn => fn());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='residences'
      className='relative z-10 w-full py-16 sm:py-20 lg:py-24'
    >
      {/* Background as its own layer so it can fade in over the sticky scene. */}
      <div
        data-layer='bg'
        aria-hidden
        className='absolute inset-0 -z-10 bg-[#F3F1EA]'
      />

      <div className='mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10'>
        <header className='mx-auto max-w-2xl text-center'>
          <h2
            data-ui
            className='text-3xl font-medium text-[#6E7A6F] sm:text-4xl lg:text-5xl'
          >
            The Final Residences.
          </h2>
          <p data-ui className='my-6 text-[#6E7A6F] sm:text-base lg:my-10'>
            49 of 52 homes at The Westly have found owners. These are the last
            three.
          </p>
          <a
            data-ui
            href='#'
            aria-label='Download brochure'
            className='inline-block text-[11px] font-semibold tracking-[0.22em] text-[#6E7A6F] uppercase underline underline-offset-4 sm:text-xs'
          >
            Download Brochure
          </a>
        </header>

        <div className='mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:mt-14 lg:mt-16 lg:grid-cols-2 lg:gap-6'>
          {RESIDENCES.map(residence => (
            <article
              key={residence.id}
              data-residence-card
              className='flex flex-col border border-[#6E7A6F]/20 bg-white'
            >
              <div className='px-5 pt-6 sm:px-6 sm:pt-8'>
                <h3 className='text-center text-xl font-medium text-[#6E7A6F] sm:text-2xl'>
                  {residence.title}
                </h3>
                <div
                  className='mt-4 h-px w-full bg-[#6E7A6F]/20 sm:mt-5'
                  aria-hidden
                />
              </div>

              <div className='relative mx-auto aspect-video w-full max-w-[88%]'>
                <Image
                  src={residence.floorPlan.src}
                  alt={residence.floorPlan.alt}
                  fill
                  className='object-contain p-3 sm:p-4'
                  sizes='(max-width: 1023px) 100vw, 36vw'
                />
              </div>

              <div className='relative mt-auto overflow-hidden'>
                <div
                  data-hover-fill
                  className='pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-[#6E7A6F] will-change-transform'
                  aria-hidden
                />

                <div
                  data-hover-content
                  className='relative z-10 px-5 pt-0 pb-5 sm:px-6 sm:pb-6'
                >
                  <div
                    className='mb-5 h-px w-full bg-[#6E7A6F]/20'
                    aria-hidden
                  />

                  <div className='grid grid-cols-2 gap-x-5 gap-y-3.5 text-sm'>
                    <Detail
                      label='Bed/bath'
                      value={residence.details.bedBath}
                    />
                    <Detail
                      label='Int/Ext SF'
                      value={residence.details.intExt}
                    />
                    <Detail label='Price' value={residence.details.price} />
                    <Detail
                      label='Estimated Monthly CC'
                      value={residence.details.monthlyCc}
                    />
                    <Detail
                      label='Estimated Monthly Re Tax'
                      value={residence.details.reTax}
                    />
                    <Detail label='Status' value={residence.details.status} />
                    <Detail
                      label='Exposure'
                      value={residence.details.exposure}
                    />
                    <div>
                      <p
                        data-hover-label
                        className='text-[17px] font-medium text-[#6E7A6F]'
                      >
                        Listing
                      </p>
                      <a
                        data-hover-link
                        href={residence.listingUrl}
                        aria-label={`View listing for ${residence.title}`}
                        className='inline-block text-[14px] font-bold text-[#6E7A6F] underline underline-offset-2'
                      >
                        View Listing
                      </a>
                    </div>
                    <div>
                      <p
                        data-hover-label
                        className='text-[17px] font-medium text-[#6E7A6F]'
                      >
                        Floor plan
                      </p>
                      <a
                        data-hover-link
                        href={residence.floorPlanUrl}
                        aria-label={`Download floor plan PDF for ${residence.title}`}
                        className='mt-1 inline-flex text-[#6E7A6F]'
                      >
                        <PdfIcon />
                      </a>
                    </div>
                  </div>

                  <button
                    data-hover-button
                    type='button'
                    aria-label={`Book ${residence.title}`}
                    className='mt-6 w-full cursor-pointer bg-[#6E7A6F] py-3 text-center text-[11px] font-semibold tracking-[0.22em] text-white uppercase transition-none sm:mt-8 sm:py-3.5 sm:text-[12px]'
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p data-hover-label className='text-[17px] font-medium text-[#6E7A6F]'>
      {label}
    </p>
    <p data-hover-value className='text-[14px] font-bold text-[#6E7A6F]'>
      {value}
    </p>
  </div>
);
