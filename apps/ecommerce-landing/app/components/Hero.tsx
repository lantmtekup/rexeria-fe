'use client';

import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import Image from 'next/image';
import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from '../../lib/use-isomorphic-layout-effect';

gsap.registerPlugin(SplitText);

const CHAR_BLUR_FROM = { y: 10, opacity: 0, filter: 'blur(10px)' };
const CHAR_BLUR_TO = { y: 0, opacity: 1, filter: 'blur(0px)' };
const CHAR_BLUR_EASE = 'power2.out';

const LINE_REVEAL_FROM = { yPercent: 110, opacity: 0 };
const LINE_REVEAL_TO = { yPercent: 0, opacity: 1 };
const LINE_REVEAL_EASE = 'power3.out';
const LINE_REVEAL_DUR = 0.9;
const LINE_REVEAL_STAGGER = 0.1;

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const introRef = useRef<HTMLParagraphElement | null>(null);
  const bodyRef = useRef<HTMLParagraphElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const heading = headingRef.current;
    const intro = introRef.current;
    const body = bodyRef.current;
    if (!heading || !intro || !body) return;

    const hosts = [heading, intro, body];
    let cancelled = false;
    const splits: SplitText[] = [];

    const mm = gsap.matchMedia();

    mm.add(
      {
        animate: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) return;

        gsap.set(hosts, { autoAlpha: 0 });

        document.fonts.ready.then(() => {
          if (cancelled) return;

          const splitOf = (el: HTMLElement, type: 'chars' | 'lines') => {
            const split = new SplitText(el, { type, mask: type });
            splits.push(split);
            return split;
          };

          const headingSplit = splitOf(heading, 'chars');
          const introSplit = splitOf(intro, 'chars');
          const bodySplit = splitOf(body, 'lines');

          gsap.set(hosts, { autoAlpha: 1 });

          const tl = gsap.timeline({
            onComplete: () => {
              for (const split of splits) split.revert();
              splits.length = 0;
              gsap.set(hosts, { clearProps: 'all' });
            },
          });

          tl.fromTo(
            headingSplit.chars,
            CHAR_BLUR_FROM,
            {
              ...CHAR_BLUR_TO,
              duration: 0.9,
              ease: CHAR_BLUR_EASE,
              stagger: 0.03,
            },
            0.15
          )
            .fromTo(
              introSplit.chars,
              CHAR_BLUR_FROM,
              {
                ...CHAR_BLUR_TO,
                duration: 1.2,
                ease: CHAR_BLUR_EASE,
                stagger: 0.05,
              },
              0.55
            )
            .fromTo(
              bodySplit.lines,
              LINE_REVEAL_FROM,
              {
                ...LINE_REVEAL_TO,
                duration: LINE_REVEAL_DUR,
                ease: LINE_REVEAL_EASE,
                stagger: LINE_REVEAL_STAGGER,
              },
              0.8
            );
        });
      }
    );

    return () => {
      cancelled = true;
      for (const split of splits) split.revert();
      mm.revert();
    };
  }, []);

  return (
    <section
      id='intro'
      aria-label='Introducing Le Cool Move'
      className='relative isolate h-[840px] max-h-[calc(100svh-72px)] min-h-[560px] w-full scroll-mt-[72px] overflow-hidden'
    >
      <Image
        src='/hero/hero-bg.jpg'
        alt=''
        aria-hidden
        fill
        priority
        sizes='100vw'
        className='-z-10 object-cover object-center'
      />

      <div className='flex h-full flex-col items-center justify-center px-6 text-center text-white'>
        <Image
          data-crown-slot='hero'
          src='/hero/hero-emblem.png'
          alt=''
          aria-hidden
          width={159}
          height={118}
          priority
          className='h-auto w-[clamp(96px,11vw,159px)] shrink-0'
        />

        <h1
          ref={headingRef}
          className='font-display mt-0 max-w-[738px] text-[clamp(40px,5.9vw,84px)] leading-none font-normal text-white'
        >
          On the Bright Side
          <br />
          of Movement
        </h1>

        <div className='mt-[clamp(40px,7vh,104px)] flex w-full max-w-[694px] flex-col gap-4'>
          <p
            ref={introRef}
            className='font-montserrat text-[clamp(18px,1.7vw,24px)] leading-normal font-normal'
          >
            Introducing <span className='text-[#FCF5BD]'>LE COOL MOVE</span>
          </p>
          <p
            ref={bodyRef}
            className='font-montserrat text-[clamp(15px,1.25vw,18px)] leading-[24px] font-normal'
          >
            <span className='md:block'>
              You need not wait for summer to begin carrying a brighter
              attitude.
            </span>{' '}
            Belgian surrealism has always understood that a small shift in
            perspective can improve the atmosphere considerably.
          </p>
        </div>
      </div>
    </section>
  );
}
