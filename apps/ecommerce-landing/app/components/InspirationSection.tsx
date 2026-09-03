'use client';

import { gsap } from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from '../../lib/use-isomorphic-layout-effect';
import { GOLD, INK, PAPER } from './story-data';

type InspirationCard = {
  id: string;
  title: string;
  src: string;
  alt: string;
};

const INSPIRATION_CARDS: readonly InspirationCard[] = [
  {
    id: 'studio-light',
    title: '01 Studio Light',
    src: '/inspiration/image-1.jpg',
    alt: 'Inspiration — studio light',
  },
  {
    id: 'in-motion',
    title: '02 In Motion',
    src: '/inspiration/image-2.jpg',
    alt: 'Inspiration — in motion',
  },
  {
    id: 'the-atelier',
    title: '03 The Atelier',
    src: '/inspiration/image-3.jpg',
    alt: 'Inspiration — the atelier',
  },
  {
    id: 'colour-study',
    title: '04 Colour Study',
    src: '/inspiration/image-4.png',
    alt: 'Inspiration — colour study',
  },
  {
    id: 'off-duty',
    title: '05 Off Duty',
    src: '/inspiration/image-5.png',
    alt: 'Inspiration — off duty',
  },
];

const N = INSPIRATION_CARDS.length;

const CARD_W = 420;
const CARD_H = (CARD_W * 4) / 5;
const STAGE_PERSPECTIVE = 2400;
const FACE_PERSPECTIVE = 1800;

const STACK_STEP_Y = -38;
const STACK_STEP_S = 0.08;

const FAN_SCALE = 1;
const FAN_ROTY = -50;

const DECK_GAP = 200;
const FAN_EDGE_GUTTER = 48;

const FAN_SIN = Math.sin((FAN_ROTY * Math.PI) / 180);
const FAN_COS = Math.cos((FAN_ROTY * Math.PI) / 180);

const depthAt = (z: number) => STAGE_PERSPECTIVE / (STAGE_PERSPECTIVE - z);

const deckLayout = (gap: number, scale: number) => {
  const mid = (N - 1) / 2;
  return Array.from({ length: N }, (_, i) => {
    const zLocal = -(i - mid) * gap;
    const x = zLocal * FAN_SIN;
    const z = zLocal * FAN_COS;
    const d = depthAt(z);
    const halfW = ((CARD_W * scale * Math.abs(FAN_COS)) / 2) * d;
    return { x, z, left: x * d - halfW, right: x * d + halfW };
  });
};

const FAN_DUR = 0.7;
const FAN_EASE = 'power3.out';
const LIFT_DUR = 0.3;
const LIFT_Y = -64;
const TITLE_DUR = 0.35;
const TITLE_SLIDE = 8;

const pillOffset = (faceScale: number) =>
  Math.min(0, -((CARD_H * faceScale - CARD_H) / 2));

export default function InspirationSection() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const liftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const lifts = liftRefs.current.filter(Boolean) as HTMLDivElement[];
    const faces = faceRefs.current.filter(Boolean) as HTMLDivElement[];
    const titles = titleRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!stage || cards.length !== N) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px) and (hover: hover)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          reduce: boolean;
        };
        if (!isDesktop) return;

        const fanDur = reduce ? 0 : FAN_DUR;
        const liftDur = reduce ? 0 : LIFT_DUR;
        const titleDur = reduce ? 0 : TITLE_DUR;

        gsap.set(cards, { xPercent: -50, yPercent: -50 });
        gsap.set(titles, { xPercent: -50, autoAlpha: 0, y: TITLE_SLIDE });

        const pillY = new Array<number>(N).fill(0);
        let hovered = -1;

        const showTitle = (i: number, duration: number) => {
          gsap.to(titles[i], {
            autoAlpha: 1,
            y: pillY[i],
            duration,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const hideTitle = (i: number, duration: number) => {
          gsap.to(titles[i], {
            autoAlpha: 0,
            y: pillY[i] + TITLE_SLIDE,
            duration,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };

        const applyStack = (duration: number) => {
          gsap.to(cards, {
            x: 0,
            y: (i: number) => i * STACK_STEP_Y,
            z: 0,
            duration,
            ease: FAN_EASE,
            overwrite: 'auto',
          });
          gsap.to(faces, {
            rotateY: 0,
            scale: (i: number) => 1 - i * STACK_STEP_S,
            duration,
            ease: FAN_EASE,
            overwrite: 'auto',
          });
          gsap.to(titles, {
            rotateY: 0,
            duration,
            ease: FAN_EASE,
            overwrite: 'auto',
          });
          pillY.fill(0);
        };

        const applyFan = (duration: number) => {
          const room = stage.clientWidth - FAN_EDGE_GUTTER;
          let fit = 1;
          for (let pass = 0; pass < 2; pass += 1) {
            const probe = deckLayout(DECK_GAP * fit, FAN_SCALE * fit);
            const span = probe[N - 1].right - probe[0].left;
            if (span <= room) break;
            fit *= room / span;
          }

          const scale = FAN_SCALE * fit;
          const layout = deckLayout(DECK_GAP * fit, scale);

          gsap.to(cards, {
            x: (i: number) => layout[i].x,
            y: 0,
            z: (i: number) => layout[i].z,
            duration,
            ease: FAN_EASE,
            overwrite: 'auto',
          });
          gsap.to(faces, {
            rotateY: FAN_ROTY,
            scale,
            duration,
            ease: FAN_EASE,
            overwrite: 'auto',
          });
          gsap.to(titles, {
            rotateY: FAN_ROTY,
            duration,
            ease: FAN_EASE,
            overwrite: 'auto',
          });

          pillY.fill(pillOffset(scale));
          if (hovered >= 0) showTitle(hovered, duration);
        };

        const resetLifts = () => {
          hovered = -1;
          gsap.to(lifts, {
            y: 0,
            duration: liftDur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          cards.forEach((_, i) => hideTitle(i, titleDur));
        };

        applyStack(0);

        const onStageEnter = () => applyFan(fanDur);
        const onStageLeave = () => {
          applyStack(fanDur);
          resetLifts();
        };

        stage.addEventListener('mouseenter', onStageEnter);
        stage.addEventListener('mouseleave', onStageLeave);

        const cardHandlers = cards.map((card, i) => {
          const onEnter = () => {
            hovered = i;
            gsap.to(lifts[i], {
              y: LIFT_Y,
              duration: liftDur,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            showTitle(i, titleDur);
          };
          const onLeave = () => {
            if (hovered === i) hovered = -1;
            gsap.to(lifts[i], {
              y: 0,
              duration: liftDur,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            hideTitle(i, titleDur);
          };
          card.addEventListener('mouseenter', onEnter);
          card.addEventListener('mouseleave', onLeave);
          return { card, onEnter, onLeave };
        });

        return () => {
          stage.removeEventListener('mouseenter', onStageEnter);
          stage.removeEventListener('mouseleave', onStageLeave);
          cardHandlers.forEach(({ card, onEnter, onLeave }) => {
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('mouseleave', onLeave);
          });
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id='inspirations'
      aria-label='Inspirations'
      className='w-full scroll-mt-[72px] overflow-hidden py-[clamp(48px,5vw,64px)]'
      style={{ backgroundColor: PAPER }}
    >
      <div className='mx-auto w-full px-6'>
        <div className='flex flex-col items-center text-center'>
          <Image
            src='/product/crown.png'
            alt=''
            aria-hidden
            width={73}
            height={56}
            className='h-auto w-[clamp(52px,4.4vw,73px)]'
          />

          <span
            className='font-montserrat mt-4 text-[11px] leading-[10px] font-semibold tracking-[0.14em] uppercase'
            style={{ color: GOLD }}
          >
            Inspirations
          </span>

          <h2 className='font-display mt-3 text-[clamp(28px,2.8vw,40px)] leading-[1.2] font-normal text-black'>
            The moods behind the move
          </h2>

          <p className='font-montserrat mt-3 max-w-[560px] text-[clamp(14px,1.15vw,16px)] leading-[26px] font-medium text-black/70'>
            Hover the stack to open it — every frame is a note we kept while
            shaping Le Cool Move.
          </p>
        </div>

        <div
          ref={stageRef}
          className='no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:relative lg:mx-0 lg:mt-14 lg:block lg:h-[680px] lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0'
          style={{ perspective: `${STAGE_PERSPECTIVE}px` }}
        >
          {INSPIRATION_CARDS.map((card, index) => (
            <div
              key={card.id}
              ref={node => {
                cardRefs.current[index] = node;
              }}
              className='relative w-[70vw] max-w-[420px] shrink-0 snap-center lg:absolute lg:top-1/2 lg:left-1/2 lg:w-[420px] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2'
              style={{ zIndex: N - index }}
            >
              <div
                ref={node => {
                  liftRefs.current[index] = node;
                }}
                style={{ perspective: `${FACE_PERSPECTIVE}px` }}
              >
                <div
                  ref={node => {
                    faceRefs.current[index] = node;
                  }}
                >
                  <div className='relative aspect-[5/4] w-full overflow-hidden rounded-[10px] shadow-[0_18px_40px_rgba(0,0,0,0.18)]'>
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes='(min-width: 1024px) 560px, 70vw'
                      className='object-cover'
                    />
                  </div>
                </div>

                <span
                  ref={node => {
                    titleRefs.current[index] = node;
                  }}
                  className='font-montserrat mx-auto mt-3 block w-fit rounded-full px-3 py-2 text-center text-[11px] leading-[10px] font-semibold tracking-[0.14em] text-white uppercase lg:absolute lg:bottom-full lg:left-1/2 lg:mx-0 lg:mt-0 lg:mb-4 lg:whitespace-nowrap lg:opacity-0'
                  style={{ backgroundColor: INK }}
                >
                  {card.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
