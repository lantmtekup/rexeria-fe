'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';
import { RevealWords, revealText } from '../molecules';

interface AmenityHighlightProps {
  heading: string;
  listItems: string[];
  videoSrc: string;
  paddingTop: string;
  paddingBottomMobile: string;
  paddingBottomDesktop: string;
}

export default function AmenityHighlight({
  heading,
  listItems,
  videoSrc,
  paddingTop,
  paddingBottomMobile,
  paddingBottomDesktop,
}: AmenityHighlightProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(
      MOTION_CONDITIONS,
      context => {
        const { reduce } = context.conditions as MotionConditions;

        if (reduce) {
          gsap.set(headingRef.current?.querySelectorAll('.reveal-word') ?? [], {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
          });
          gsap.set(listRef.current?.children ?? [], { opacity: 1, y: 0 });
          return;
        }

        revealText(headingRef, {
          duration: 0.8,
          stagger: 0.05,
          ease: 'sine.out',
        });

        gsap.set(listRef.current?.children ?? [], { opacity: 0, y: 20 });
        gsap.to(listRef.current?.children ?? [], {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top bottom',
          },
        });
      },
      sectionRef
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative flex w-full flex-col items-center bg-[#f5f5f5] ${paddingTop} ${paddingBottomMobile} ${paddingBottomDesktop}`}
    >
      {/* Headline sticks in place (CSS position:sticky) while Media scrolls
          over it — real source behavior, no scroll-scale JS involved. The
          sticky range is bounded by this wrapper's own height (Headline +
          Media), so it releases right as Media finishes scrolling past. */}
      <div className='relative flex w-full flex-col items-center'>
        <div className='sticky top-57.5 w-full overflow-hidden px-5'>
          <div className='relative h-auto w-full flex-none'>
            <h2
              ref={headingRef}
              className='font-aboreto w-full text-center text-[45px] leading-[0.82em] tracking-[-0.035em] text-[#00940c] uppercase md:text-[70px]'
            >
              <RevealWords text={heading} />
            </h2>
          </div>
        </div>

        <div className='relative z-10 flex w-full flex-col overflow-hidden pt-12.5 pb-38.75 lg:w-195 lg:pb-77.5'>
          <video
            src={videoSrc}
            loop
            autoPlay
            muted
            playsInline
            className='h-130 w-full object-cover'
          />
        </div>
      </div>

      <div className='flex w-full max-w-225 flex-col place-content-center items-center gap-2.5 overflow-hidden px-5 pt-15'>
        <div className='relative z-2 flex h-auto w-full flex-none flex-col justify-start wrap-break-word whitespace-pre-wrap'>
          <ul
            ref={listRef}
            className='font-aboreto list-disc space-y-2 pl-6 text-[30px] leading-[1.17em] tracking-[-0.01em] text-black uppercase'
          >
            {listItems.map((item, i) => (
              <li key={i} className='mb-0 leading-[1.2em] font-normal'>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
