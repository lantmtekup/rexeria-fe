'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  MOTION_CONDITIONS,
  ScrollTrigger,
  type MotionConditions,
} from '@/app/lib/motion';

const BADGE_LABEL = 'Overview';

const HEADING_LINES = ['Elevated', 'Living'];

const LEFT_BODY =
  'Oversized windows frame an array of captivating views stretching from the treetops of Verdi Square over the romantic prewar façades of surrounding buildings to the great crowns of the Manhattan skyline.';

const QUOTE =
  'Glimpses of Central Park, Riverside Park, and the Hudson River are reminders that the city’s finest green spaces are just moments away.';

const VERTICAL_LABEL = 'Modern • Minimalist • Elegant';

const BADGE_TYPE =
  'font-display text-xs leading-none font-medium uppercase tracking-[0.02em] text-white md:text-[13px] xl:text-sm';

const HEADING_TYPE =
  'font-display text-[34px] leading-[31px] font-medium uppercase text-[#763718] md:text-[46px] md:leading-[42px] xl:text-6xl xl:leading-[55px]';

const LEFT_BODY_TYPE =
  'font-display text-base leading-6 font-medium uppercase text-black md:text-lg md:leading-[25px] xl:text-lg xl:leading-7';

const QUOTE_TYPE =
  'font-display text-lg leading-[26px] font-medium uppercase text-black md:text-2xl md:leading-7 xl:text-[min(1.667vw,24px)] xl:leading-[min(2.222vw,32px)]';

const LABEL_TYPE =
  'font-display text-[9px] leading-[13px] font-medium uppercase tracking-[0.08em] text-[#763718] md:text-[10px] md:leading-[14px] xl:text-xs xl:leading-4';

const SLAT_BASE =
  'pointer-events-none absolute -inset-y-px z-10 bg-white will-change-transform';

const SLAT_BOX = [
  'left-[-1px] w-[calc(33.333%+2px)]',
  'left-[calc(33.333%-1px)] w-[calc(33.333%+2px)]',
  'left-[calc(66.667%-1px)] w-[calc(33.333%+2px)]',
] as const;

const BAND_BASE =
  'pointer-events-none absolute -inset-x-px h-[calc(35.2%+2px)] bg-white will-change-transform';

const BAND_BOX = [
  'top-[-1px]',
  'top-[calc(32.4%-1px)]',
  'top-[calc(64.8%-1px)]',
] as const;

const BEAT_DURATION = 1.4;

const INTRO_SHIFT = 64;

const INTRO_DESIGN_WIDTH = 732;

const RULE_BASE = 'pointer-events-none absolute bg-[#763718]';

const RULE_LINE = 'pointer-events-none w-px bg-[#763718]';

const ARTWORK_CROP =
  'absolute top-[-4.65%] left-[-20.77%] h-[109.6%] w-[139.03%]';

const CONTENT_LEFT = 'xl:mx-0 xl:left-[round(calc(50%-min(32.91%,233px)),1px)]';

const RULE_RIGHT = 'xl:right-[round(calc(50%-min(32.91%,233px)-64px),1px)]';

const RULE_LEFT = 'xl:left-[round(calc(50%-min(32.91%,233px)-64px),1px)]';

const RULE_RIGHT_MD = 'md:right-[calc(50%-min(32.91%,233px)-48px)]';

const RULE_LEFT_MD = 'md:left-[calc(50%-min(32.91%,233px)-48px)]';

const GROUP_BOTTOM = 'xl:bottom-[round(7.28%,1px)]';

export default function ElevatedLiving() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const frame = section.querySelector<HTMLElement>('[data-frame]');
    const slats = gsap.utils.toArray<HTMLElement>('[data-slat]', section);
    const intro = gsap.utils.toArray<HTMLElement>('[data-intro]', section);
    const bands = gsap.utils.toArray<HTMLElement>('[data-band]', section);
    const ruleDraw = section.querySelector<HTMLElement>('[data-rule-draw]');
    const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', section);
    const bgImage = section.querySelector<HTMLElement>('[data-bg-image]');
    const artworkImage = section.querySelector<HTMLElement>(
      '[data-artwork-image]'
    );
    if (!frame || !ruleDraw || !bgImage || !artworkImage) return;
    if (slats.length !== 3 || intro.length !== 3 || bands.length !== 3) {
      return;
    }

    const mm = gsap.matchMedia(section);

    mm.add({ ...MOTION_CONDITIONS, isXl: '(min-width: 1280px)' }, context => {
      const { reduce, isXl } = context.conditions as MotionConditions & {
        isXl: boolean;
      };
      const duration = reduce ? 0 : BEAT_DURATION;
      const factor = frame.offsetWidth / INTRO_DESIGN_WIDTH;

      gsap.set(intro, { x: -INTRO_SHIFT * factor });
      gsap.set(bgImage, { rotate: -30, scale: 1.3, transformOrigin: 'center' });
      gsap.set(artworkImage, { rotate: -10, transformOrigin: 'center' });
      gsap.set(ruleDraw, { scaleY: 0 });
      gsap.set(reveal, { autoAlpha: 0 });

      const beat1 = gsap
        .timeline({ defaults: { duration, ease: 'power3.out' } })
        .to(slats[0], { yPercent: -100 }, 0)
        .to(slats[1], { yPercent: 100 }, 0)
        .to(slats[2], { yPercent: -100 }, 0)
        .to(intro, { x: 0 }, 0)
        .to(bgImage, { rotate: 0, scale: 1 }, 0);

      const beat2 = gsap
        .timeline({ defaults: { duration, ease: 'power3.out' } })
        .to(bands, { scaleX: 0 }, 0)
        .to(artworkImage, { rotate: 0 }, 0)
        .to(ruleDraw, { scaleY: 1 }, 0)
        .to(reveal, { autoAlpha: 1 }, 0);

      const master = gsap.timeline({ paused: true }).add(beat1).add(beat2, '>');

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: isXl ? 'top 20%' : 'top 70%',
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
      id='elevated-living'
      data-panel
      className='relative z-30 w-full overflow-hidden bg-white'
    >
      <div
        data-panel-content
        className='flex w-full flex-col xl:h-svh xl:flex-row'
      >
        <div
          data-frame
          className='relative w-full overflow-hidden xl:h-full xl:w-[round(50.833%,1px)] xl:shrink-0'
        >
          <div data-media className='absolute inset-0'>
            <Image
              data-bg-image
              src='/assets/background-elevated-living.png'
              alt='Sunlit dining room with skyline views at 212 West 72nd'
              fill
              className='object-cover object-left'
            />
          </div>

          <div data-slat className={`${SLAT_BOX[0]} ${SLAT_BASE}`} />
          <div data-slat className={`${SLAT_BOX[1]} ${SLAT_BASE}`} />
          <div data-slat className={`${SLAT_BOX[2]} ${SLAT_BASE}`} />

          <div className='relative px-6 pt-14 pb-16 xl:pt-21.5 xl:pb-0'>
            <span
              data-badge
              data-intro
              className={`inline-flex w-fit items-center bg-[#763718] p-3 ${BADGE_TYPE}`}
            >
              {BADGE_LABEL}
            </span>

            <h2 data-heading data-intro className={`mt-3 ${HEADING_TYPE}`}>
              {HEADING_LINES.map(line => (
                <span key={line} className='block'>
                  {line}
                </span>
              ))}
            </h2>

            <p
              data-copy
              data-intro
              className={`mt-4.75 max-w-1/2 md:max-w-1/4 xl:w-52.75 xl:max-w-none ${LEFT_BODY_TYPE}`}
            >
              {LEFT_BODY}
            </p>
          </div>
        </div>

        <div className='relative w-full bg-white pb-16 xl:h-full xl:flex-1 xl:pb-0'>
          <div>
            <div
              data-media
              className={`relative mx-11 mt-12 aspect-466/449 overflow-hidden bg-[#0F0F0E]/5 md:mx-auto md:w-[min(65.82%,466px)] xl:absolute xl:top-[round(7.28%,1px)] xl:mt-0 xl:aspect-auto xl:h-[53.45%] xl:w-[min(65.82%,466px)] ${CONTENT_LEFT}`}
            >
              <div className={ARTWORK_CROP}>
                <Image
                  data-artwork-image
                  src='/assets/picture.png'
                  alt='Framed abstract painting inside a 212 West 72nd residence'
                  fill
                  className='object-cover will-change-transform'
                />
              </div>

              <div
                data-band
                className={`${BAND_BOX[0]} origin-right ${BAND_BASE}`}
              />
              <div
                data-band
                className={`${BAND_BOX[1]} origin-left ${BAND_BASE}`}
              />
              <div
                data-band
                className={`${BAND_BOX[2]} origin-right ${BAND_BASE}`}
              />
            </div>

            <div
              className={`relative mt-10 mr-11 ml-6 pb-10 pl-6 md:mx-auto md:w-[min(65.82%,466px)] md:pl-0 xl:absolute xl:top-[round(60.73%,1px)] ${GROUP_BOTTOM} xl:mt-0 xl:flex xl:w-[min(63.28%,444px)] xl:flex-col xl:justify-center xl:pb-0 xl:pl-0 ${CONTENT_LEFT}`}
            >
              <span
                data-reveal
                className={`inset-y-0 left-0 w-px origin-bottom md:-left-12 xl:-left-16 ${RULE_BASE}`}
              />

              <p data-copy data-reveal className={QUOTE_TYPE}>
                {QUOTE}
              </p>
            </div>
          </div>

          <div
            className={`pointer-events-none absolute top-0 right-6 bottom-16 flex w-px flex-col items-center ${RULE_RIGHT_MD} ${RULE_RIGHT} ${GROUP_BOTTOM}`}
          >
            <span
              data-rule-draw
              className={`flex-370 origin-top ${RULE_LINE}`}
            />

            <span
              data-vertical
              data-reveal
              className={`mt-4 mb-4 whitespace-nowrap [writing-mode:vertical-rl] ${LABEL_TYPE}`}
            >
              {VERTICAL_LABEL}
            </span>

            <span
              data-reveal
              className={`flex-251 origin-bottom ${RULE_LINE}`}
            />
          </div>

          <span
            data-reveal
            className={`right-6 bottom-16 left-6 h-px origin-right ${RULE_RIGHT_MD} ${RULE_LEFT_MD} ${RULE_RIGHT} ${RULE_LEFT} ${GROUP_BOTTOM} ${RULE_BASE}`}
          />
        </div>
      </div>
    </section>
  );
}
