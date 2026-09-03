'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from '../../lib/use-isomorphic-layout-effect';
import {
  DESIGN_BANNER,
  DESIGN_BODY,
  DESIGN_CARDS,
  DESIGN_HEADING,
  GOLD,
} from './story-data';

gsap.registerPlugin(ScrollTrigger);

const HEADER_H = 72;

function Card({ src, caption }: { src: string; caption: string }) {
  return (
    <figure
      className='relative h-full w-auto shrink-0 snap-start overflow-hidden'
      style={{ aspectRatio: '354 / 460' }}
    >
      <Image
        src={src}
        alt={caption}
        fill
        sizes='(min-width: 1024px) 354px, 60vw'
        className='object-cover'
      />
      <figcaption className='font-montserrat absolute bottom-[2.6%] left-[5.6%] text-[clamp(13px,1.1vw,16px)] leading-[26px] font-medium text-white'>
        {caption}
      </figcaption>
    </figure>
  );
}

export default function DesignPanel() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !sticky || !viewport || !track) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          reduce: boolean;
        };
        if (!isDesktop || reduce) return;

        const distance = () => {
          const style = getComputedStyle(viewport);
          const padX =
            parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
          return Math.max(0, track.offsetWidth + padX - viewport.clientWidth);
        };

        const sizeRoot = () => {
          root.style.height = `${sticky.offsetHeight + distance()}px`;
        };
        sizeRoot();
        ScrollTrigger.addEventListener('refreshInit', sizeRoot);

        gsap.set(viewport, { overflowX: 'hidden' });

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: `top top+=${HEADER_H}`,
            end: () => `+=${distance()}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          ScrollTrigger.removeEventListener('refreshInit', sizeRoot);
          tween.scrollTrigger?.kill();
          tween.kill();
          root.style.height = '';
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className='w-full bg-[#F5F5F5]'>
      <div
        ref={stickyRef}
        className='flex w-full items-center py-10 lg:sticky lg:top-[72px] lg:h-[calc(100svh-72px)] lg:py-0'
      >
        <div
          ref={viewportRef}
          className='no-scrollbar w-full snap-x snap-mandatory scroll-pl-[var(--story-gutter)] overflow-x-auto px-[var(--story-gutter)] lg:snap-none'
        >
          <div
            ref={trackRef}
            className='flex h-[clamp(320px,55svh,460px)] w-max gap-6'
          >
            <Card
              src={DESIGN_CARDS.rain.src}
              caption={DESIGN_CARDS.rain.caption}
            />

            <div className='flex h-full w-[clamp(260px,80vw,354px)] shrink-0 snap-start flex-col'>
              <h2 className='font-display text-[clamp(26px,2.6vw,37px)] leading-[1.2] font-normal text-black'>
                <span style={{ color: GOLD }}>{DESIGN_HEADING.gold}</span>
                {DESIGN_HEADING.rest}
              </h2>
              <div className='font-montserrat mt-[clamp(24px,4.5vw,64px)] flex max-w-[346px] flex-col gap-[26px] text-[clamp(13px,1.15vw,16px)] leading-[26px] font-medium text-black'>
                {DESIGN_BODY.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <Card
              src={DESIGN_CARDS.morningDew.src}
              caption={DESIGN_CARDS.morningDew.caption}
            />

            <div
              className='relative h-full w-auto shrink-0 snap-start'
              style={{ aspectRatio: '706 / 460', backgroundColor: GOLD }}
            >
              <div className='absolute top-[7%] right-[4.5%] left-[4.5%]'>
                <h3 className='font-display text-[clamp(22px,2.65vw,38px)] leading-[1.2] font-normal text-white'>
                  {DESIGN_BANNER.heading}
                </h3>
                <p className='font-montserrat mt-[clamp(4px,0.6vw,8px)] text-[clamp(12px,1.15vw,16px)] leading-[26px] font-medium text-white'>
                  {DESIGN_BANNER.sub}
                </p>
              </div>
              <div className='absolute top-[32.2%] right-[2.3%] bottom-[3.5%] left-[2.3%]'>
                <Image
                  src={DESIGN_BANNER.src}
                  alt=''
                  aria-hidden
                  fill
                  sizes='(min-width: 1024px) 674px, 90vw'
                  className='object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
