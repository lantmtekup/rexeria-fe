'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, type CSSProperties } from 'react';

import { useIsomorphicLayoutEffect } from '../../lib/use-isomorphic-layout-effect';
import { PAPER } from './story-data';

const HEADER_H = 72;

const HOLD = 0.15;
const TRAVEL = 1;
const SWAP = 0.1;

const SCROLL_PER_STEP = 160;

function seamAt(step: number, steps: number) {
  return HOLD + (TRAVEL * (step + 0.5)) / steps;
}

const COL_IMAGE = '32%';
const COL_CENTER = '36%';

type ShowcaseImage = {
  src: string;
  alt: string;
  title?: string;
};

type ShowcaseCard = {
  id: string;
  emblem: { src: string; width: number; height: number; className: string };
  caption?: readonly string[];
  images: readonly [ShowcaseImage, ShowcaseImage];
};

const SHOWCASE_CARDS: readonly ShowcaseCard[] = [
  {
    id: 'silhouette',
    emblem: {
      src: '/product/crown.png',
      width: 318,
      height: 236,
      className: 'h-auto w-[clamp(170px,20vw,300px)]',
    },
    images: [
      {
        src: '/showcase/image-1.png',
        alt: 'Le Cool Move — three-quarter view',
        title:
          'Some bags carry essentials. Others improve the atmosphere slighty.',
      },
      { src: '/showcase/image-2.png', alt: 'Le Cool Move — front view' },
    ],
  },
  {
    id: 'movement',
    emblem: {
      src: '/showcase/logo.svg',
      width: 315,
      height: 215,
      className: 'h-auto w-[clamp(150px,15vw,232px)]',
    },
    caption: ['With love,', 'From the Kingdom', 'of Belgium'],
    images: [
      {
        src: '/showcase/image-3.png',
        alt: 'Le Cool Move — strap detail from above',
      },
      {
        src: '/showcase/image-4.jpg',
        alt: 'Le Cool Move — carried cross-body',
      },
    ],
  },
];

const COUNT = SHOWCASE_CARDS.length;
const STEPS = COUNT - 1;

const LAYOUT_VARS = {
  '--section-h': `calc(100svh - ${HEADER_H}px + ${STEPS * SCROLL_PER_STEP}svh)`,
  '--track-w': `${COUNT * 100}%`,
  '--group-w': `calc(100% / ${COUNT})`,
} as CSSProperties;

gsap.registerPlugin(ScrollTrigger);

function CardImage({ image }: { image: ShowcaseImage }) {
  return (
    <div className='relative aspect-[4/5] w-full shrink-0 overflow-hidden lg:aspect-auto lg:h-full lg:w-[32%]'>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes='(min-width: 1024px) 32vw, 100vw'
        className='object-cover'
      />

      {image.title ? (
        <>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/30 to-transparent'
          />
          <h3 className='font-display absolute top-0 left-0 max-w-[20ch] p-[clamp(20px,2.4vw,44px)] text-[clamp(20px,2.1vw,40px)] leading-[1.3] font-normal text-white'>
            {image.title}
          </h3>
        </>
      ) : null}
    </div>
  );
}

function CardCenter({
  card,
  className = '',
  startHidden = false,
}: {
  card: ShowcaseCard;
  className?: string;
  startHidden?: boolean;
}) {
  const initial = startHidden ? 'opacity-0' : '';

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center lg:px-[clamp(24px,3vw,56px)] ${className}`}
    >
      <Image
        data-fade
        src={card.emblem.src}
        alt=''
        aria-hidden
        width={card.emblem.width}
        height={card.emblem.height}
        className={`${card.emblem.className} ${initial}`}
      />

      {card.caption ? (
        <p className='font-display mt-[clamp(24px,3vw,44px)] text-[clamp(20px,1.9vw,26px)] leading-normal font-normal text-black'>
          {card.caption.map((line, index) => (
            <span key={index} data-fade className={`block ${initial}`}>
              {line}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

function CardFace({ card }: { card: ShowcaseCard }) {
  return (
    <article className='flex w-full flex-col items-stretch gap-8 lg:h-full lg:flex-row lg:gap-0'>
      <CardImage image={card.images[0]} />
      <CardCenter card={card} className='flex-1 lg:invisible' />
      <CardImage image={card.images[1]} />
    </article>
  );
}

export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    const groups = groupRefs.current.slice(0, COUNT);
    const faces = faceRefs.current.slice(0, COUNT);

    if (!section || !sticky || !track) return;
    // 1 card thì không có mép nào để đi qua → để yên, không pin, không animate.
    if (STEPS < 1) return;
    if (groups.some(el => !el) || faces.some(el => !el)) return;

    const groupEls = groups as HTMLDivElement[];
    const fades = (faces as HTMLDivElement[]).map(face =>
      face.querySelectorAll('[data-fade]')
    );

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
        if (!isDesktop) return;

        if (reduce) {
          gsap.set([track, ...groupEls], { width: '100%' });
          gsap.set(groupEls.slice(1), {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            autoAlpha: 0,
          });
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: `top top+=${HEADER_H}`,
            end: () =>
              `+=${Math.max(1, section.offsetHeight - sticky.offsetHeight)}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        if (!reduce) {
          tl.to(
            track,
            { xPercent: (-100 * STEPS) / COUNT, duration: TRAVEL },
            HOLD
          );
        }

        const swap = Math.min(SWAP, (TRAVEL / STEPS) * 0.4);

        for (let step = 0; step < STEPS; step += 1) {
          const at = seamAt(step, STEPS);

          if (reduce) {
            tl.to(
              groupEls[step + 1],
              { autoAlpha: 1, duration: swap * 2 },
              at - swap
            );
          }

          tl.to(
            fades[step],
            { autoAlpha: 0, y: -14, duration: swap, stagger: 0.02 },
            at - swap
          ).fromTo(
            fades[step + 1],
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: swap, stagger: 0.03 },
            at - swap * 0.4
          );
        }

        tl.to({}, { duration: HOLD }, HOLD + TRAVEL);
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='showcase'
      aria-label='Le Cool Move — showcase'
      className='w-full scroll-mt-[72px] lg:h-[var(--section-h)]'
      style={{ ...LAYOUT_VARS, backgroundColor: PAPER }}
    >
      <div
        ref={stickyRef}
        className='relative py-[clamp(48px,5vw,64px)] lg:sticky lg:top-[72px] lg:h-[calc(100svh-72px)] lg:overflow-hidden lg:py-0'
      >
        <div
          ref={trackRef}
          className='flex flex-col gap-16 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[var(--track-w)] lg:flex-row lg:gap-0'
        >
          {SHOWCASE_CARDS.map((card, index) => (
            <div
              key={card.id}
              ref={node => {
                groupRefs.current[index] = node;
              }}
              className='w-full lg:h-full lg:w-[var(--group-w)]'
            >
              <CardFace card={card} />
            </div>
          ))}
        </div>

        <div
          className='absolute inset-y-0 z-10 hidden lg:block'
          style={{
            left: COL_IMAGE,
            width: COL_CENTER,
            backgroundColor: PAPER,
          }}
        >
          {SHOWCASE_CARDS.map((card, index) => (
            <div
              key={card.id}
              ref={node => {
                faceRefs.current[index] = node;
              }}
              className='absolute inset-0'
            >
              <CardCenter
                card={card}
                className='h-full'
                startHidden={index > 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
