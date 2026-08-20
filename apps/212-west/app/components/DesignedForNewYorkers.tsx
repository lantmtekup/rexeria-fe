'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  MOTION_CONDITIONS,
  ScrollTrigger,
  type MotionConditions,
} from '@/app/lib/motion';

export const DESIGNED_REVEAL_EVENT = 'designed:reveal';

const HEADING_LINES = ['Designed For', 'New Yorkers'];

const VERTICAL_LABEL = 'By New Yorkers';

const BODY_COPY =
  'CetraRuddy’s principals and lead designers understand the way New Yorkers live because this is their city too. They know space and light are among the most sought-after residential luxuries and thoughtfully conceived floor plans elevate';

const HEADING_TYPE =
  'font-display text-[34px] leading-[31px] font-medium uppercase text-[#763718] md:text-[46px] md:leading-[42px] lg:text-6xl lg:leading-[55px]';

const VERTICAL_TYPE =
  'font-display text-[40px] leading-[0.7] font-medium uppercase text-[#763718] md:text-[54px] lg:text-[70px]';

const BODY_TYPE =
  'font-display text-[21px] font-medium uppercase md:text-[28px] lg:text-[37px] xl:leading-[41px]';

const MEDIA_DESIGN_WIDTH = 553;
const HEADING_SHIFT = 160;
const VERTICAL_SHIFT = 90;
const IMAGE_ROTATION = -30;
const IMAGE_SCALE = 1.4;
const COPY_SCALE = 1.3;
const COPY_ORIGIN = '81.75% 34.01%';

const IMAGE_BEAT_DURATION = 1.2;
const BEAT_DURATION = 1.2;
const BEAT_EASE = 'power3.out';

const SLATS = [
  {
    key: 'left',
    box: 'left-[-1px] w-[calc(33.273%+2px)]',
    out: 100,
  },
  {
    key: 'mid',
    box: 'left-[calc(33.273%-1px)] w-[calc(33.454%+2px)]',
    out: -100,
  },
  {
    key: 'right',
    box: 'left-[calc(66.727%-1px)] w-[calc(33.273%+2px)]',
    out: 100,
  },
] as const;

export default function DesignedForNewYorkers() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = section.querySelector<HTMLElement>('[data-media]');
    const image = section.querySelector<HTMLElement>('[data-media-image]');
    const heading = section.querySelector<HTMLElement>('[data-heading]');
    const vertical = section.querySelector<HTMLElement>('[data-vertical]');
    const copy = section.querySelector<HTMLElement>('[data-copy]');
    const slats = gsap.utils.toArray<HTMLElement>('[data-slat]', section);

    if (!media || !image || !heading || !vertical || !copy) return;
    if (slats.length !== SLATS.length) return;

    const mm = gsap.matchMedia(section);

    mm.add({ ...MOTION_CONDITIONS, isXl: '(min-width: 1280px)' }, context => {
      const { reduce, isXl } = context.conditions as MotionConditions & {
        isXl: boolean;
      };
      if (reduce) {
        if (isXl) gsap.set(section, { x: 0 });
        return;
      }

      const factor = media.offsetWidth / MEDIA_DESIGN_WIDTH;

      gsap.set(image, {
        rotate: IMAGE_ROTATION,
        scale: IMAGE_SCALE,
        transformOrigin: 'center',
      });
      gsap.set(heading, { y: HEADING_SHIFT * factor });
      gsap.set(vertical, { x: -VERTICAL_SHIFT * factor });
      gsap.set(copy, {
        scale: COPY_SCALE,
        opacity: 0,
        transformOrigin: COPY_ORIGIN,
      });

      const beatImage = gsap
        .timeline({
          defaults: { duration: IMAGE_BEAT_DURATION, ease: BEAT_EASE },
        })
        .to(slats[0], { yPercent: SLATS[0].out }, 0)
        .to(slats[1], { yPercent: SLATS[1].out }, 0)
        .to(slats[2], { yPercent: SLATS[2].out }, 0)
        .to(image, { rotate: 0, scale: 1 }, 0);

      const beatText = gsap
        .timeline({ defaults: { duration: BEAT_DURATION, ease: BEAT_EASE } })
        .to(heading, { y: 0 }, 0)
        .to(vertical, { x: 0 }, 0);

      const beatCopy = gsap
        .timeline({ defaults: { duration: BEAT_DURATION, ease: BEAT_EASE } })
        .to(copy, { scale: 1, opacity: 1 }, 0);

      const master = gsap
        .timeline({ paused: true })
        .add(beatImage)
        .add(beatText, '>')
        .add(beatCopy, '>');

      if (isXl) {
        const onReveal = () => master.play();
        section.addEventListener(DESIGNED_REVEAL_EVENT, onReveal, {
          once: true,
        });

        return () =>
          section.removeEventListener(DESIGNED_REVEAL_EVENT, onReveal);
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => master.play(),
      });

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='designed-for-new-yorkers'
      data-panel
      className='relative z-40 flex w-full items-center overflow-hidden bg-white xl:absolute xl:inset-0 xl:translate-x-full'
    >
      <div
        data-panel-content
        className='flex h-full w-full flex-col justify-center'
      >
        <div className='mx-auto w-full max-w-360 px-5 py-12.5 md:px-12 lg:px-30'>
          <h2 data-heading className={`lg:w-138.25 ${HEADING_TYPE}`}>
            {HEADING_LINES.map(line => (
              <span key={line} className='block'>
                {line}
              </span>
            ))}
          </h2>

          <div
            data-frame
            className='mt-4 flex flex-col gap-10 md:gap-15 xl:flex-row xl:items-start xl:gap-30'
          >
            <div className='flex w-full gap-0.75'>
              <div
                data-media
                className='relative z-10 aspect-553/571 max-h-142.75 w-full max-w-138.25 min-w-0 flex-1 overflow-hidden will-change-transform xl:flex-none'
              >
                <Image
                  data-media-image=''
                  src='/assets/designed-for-new-yorkers.jpg'
                  alt='Light-filled living room at 212 West 72nd'
                  fill
                  className='object-cover object-[25%_center]'
                />

                {SLATS.map(slat => (
                  <div
                    key={slat.key}
                    data-slat
                    className={`absolute inset-y-0 bg-white ${slat.box}`}
                  />
                ))}
              </div>

              <div className='relative z-0 flex shrink-0 items-start'>
                <span
                  data-vertical
                  className={`block rotate-180 [writing-mode:vertical-rl] ${VERTICAL_TYPE}`}
                >
                  {VERTICAL_LABEL}
                </span>
              </div>
            </div>

            <p
              data-copy
              className={`text-black lg:flex-none xl:w-109 ${BODY_TYPE}`}
            >
              {BODY_COPY}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
