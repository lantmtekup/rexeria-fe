'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import {
  gsap,
  CustomEase,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

const apfelGrotezk = localFont({
  src: '../../public/fonts/ApfelGrotezk-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-apfel-grotezk',
  display: 'swap',
});

const PANEL_Y_PX = 670;
const PANEL_X_PX = 1070;
const TITLE_TOP_Y_PX = { large: 422, small: 352 };
const TITLE_BOTTOM_Y_PX = { large: 439, small: 249 };
const SERVICE_HIDDEN_PX = { large: 150, small: 100 };
const ENTRANCE_OFFSET = 350;

CustomEase.create(
  'panelRevealY',
  '0,0 0.047,0.0085 0.094,0.0181 0.141,0.0278 0.188,0.0373 0.235,0.0467 0.282,0.056 0.329,0.0658 0.376,0.0753 0.423,0.0848 0.47,0.0943 0.517,0.1037 0.564,0.1205 0.611,0.2107 0.658,0.3063 0.705,0.4022 0.752,0.4984 0.799,0.5973 0.846,0.6933 0.893,0.7893 0.94,0.8832 1,1'
);
CustomEase.create(
  'panelRevealX',
  '0,0 0.047,0.0125 0.094,0.0264 0.141,0.0406 0.188,0.0545 0.235,0.0683 0.282,0.0818 0.329,0.0961 0.376,0.1101 0.423,0.1239 0.47,0.1377 0.517,0.1515 0.564,0.1718 0.611,0.2583 0.658,0.3496 0.705,0.4411 0.752,0.533 0.799,0.6274 0.846,0.7191 0.893,0.8107 0.94,0.9004 1,1'
);
CustomEase.create(
  'titleReveal',
  '0,0 0.047,0.032 0.094,0.0678 0.141,0.1043 0.188,0.1399 0.235,0.1753 0.282,0.21 0.329,0.2467 0.376,0.2827 0.423,0.3182 0.47,0.3537 0.517,0.389 0.564,0.4258 0.611,0.4872 0.658,0.5495 0.705,0.6117 0.752,0.6742 0.799,0.7385 0.846,0.8009 0.893,0.8632 0.94,0.9242 1,1'
);

const TITLE_CLASS =
  'font-(family-name:--font-apfel-grotezk) inline-block text-[3.75rem] md:text-[60px] leading-none font-normal lg:text-[5.625rem]';

export default function SignatureExperiences() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const topWhiteRef = useRef<HTMLDivElement>(null);
  const bottomWhiteRef = useRef<HTMLDivElement>(null);
  const leftWhiteRef = useRef<HTMLDivElement>(null);
  const rightWhiteRef = useRef<HTMLDivElement>(null);
  const titleTopRef = useRef<HTMLHeadingElement>(null);
  const titleBottomRef = useRef<HTMLHeadingElement>(null);
  const serviceTitleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(
      { ...MOTION_CONDITIONS, isLarge: '(min-width: 1200px)' },
      context => {
        const { isMobile, reduce, isLarge } =
          context.conditions as MotionConditions & {
            isLarge: boolean;
          };
        const panels = [
          topWhiteRef.current,
          bottomWhiteRef.current,
          leftWhiteRef.current,
          rightWhiteRef.current,
        ];
        const imageRect = imageWrapRef.current?.getBoundingClientRect();
        const panelYPx = imageRect ? imageRect.height / 2 + 4 : PANEL_Y_PX;
        const panelXPx = imageRect ? imageRect.width / 2 + 4 : PANEL_X_PX;
        const tier = isLarge ? 'large' : 'small';
        const titleTopFinal = TITLE_TOP_Y_PX[tier];
        const titleBottomFinal = TITLE_BOTTOM_Y_PX[tier];
        const serviceHiddenFinal = isLarge
          ? SERVICE_HIDDEN_PX.large
          : (serviceTitleRef.current?.offsetHeight ?? SERVICE_HIDDEN_PX.small);

        if (reduce) {
          gsap.set(topWhiteRef.current, {
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          });
          gsap.set(bottomWhiteRef.current, {
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          });
          gsap.set(leftWhiteRef.current, {
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
          });
          gsap.set(rightWhiteRef.current, {
            borderTopRightRadius: '16px',
            borderBottomRightRadius: '16px',
          });
          gsap.set(panels, { x: 0, y: 0, autoAlpha: 0 });
          gsap.set(titleTopRef.current, { x: 0, y: -titleTopFinal });
          gsap.set(titleBottomRef.current, { x: 0, y: titleBottomFinal });
          gsap.set(serviceTitleRef.current, { y: 0 });
          if (isMobile) gsap.set(sectionRef.current, { padding: '1.25rem' });
          return;
        }

        const entranceOffset = isMobile
          ? ENTRANCE_OFFSET * 0.45
          : ENTRANCE_OFFSET;

        gsap.set(topWhiteRef.current, {
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
        });
        gsap.set(bottomWhiteRef.current, {
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
        });
        gsap.set(leftWhiteRef.current, {
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
        });
        gsap.set(rightWhiteRef.current, {
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        });
        gsap.set(panels, { x: 0, y: 0, autoAlpha: 1 });
        gsap.set(titleTopRef.current, { x: -entranceOffset, y: 0 });
        gsap.set(titleBottomRef.current, { x: entranceOffset, y: 0 });
        gsap.set(serviceTitleRef.current, { y: -serviceHiddenFinal });
        if (isMobile) gsap.set(sectionRef.current, { padding: 0 });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none none',
            },
          })
          .to(
            titleTopRef.current,
            { x: 0, duration: 1.1, ease: 'power2.out' },
            0
          )
          .to(
            titleBottomRef.current,
            { x: 0, duration: 1.1, ease: 'power2.out' },
            0
          );

        const revealTl = gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '+=134%',
              scrub: true,
              pin: true,
            },
          })
          .to(
            topWhiteRef.current,
            {
              y: -PANEL_Y_PX * 0.7928,
              ease: 'panelRevealY',
              duration: 0.532,
            },
            0
          )
          .to(
            topWhiteRef.current,
            { y: -PANEL_Y_PX, ease: 'power2.out', duration: 0.1 },
            0.532
          )
          .to(
            bottomWhiteRef.current,
            {
              y: PANEL_Y_PX * 0.7928,
              ease: 'panelRevealY',
              duration: 0.532,
            },
            0
          )
          .to(
            bottomWhiteRef.current,
            { y: PANEL_Y_PX, ease: 'power2.out', duration: 0.1 },
            0.532
          )
          .to(
            leftWhiteRef.current,
            {
              x: -PANEL_X_PX * 0.7928,
              ease: 'panelRevealX',
              duration: 0.532,
            },
            0
          )
          .to(
            leftWhiteRef.current,
            { x: -PANEL_X_PX, ease: 'power2.out', duration: 0.1 },
            0.532
          )
          .to(
            rightWhiteRef.current,
            {
              x: PANEL_X_PX * 0.7928,
              ease: 'panelRevealX',
              duration: 0.532,
            },
            0
          )
          .to(
            rightWhiteRef.current,
            { x: PANEL_X_PX, ease: 'power2.out', duration: 0.1 },
            0.532
          )
          .to(
            titleTopRef.current,
            {
              y: -titleTopFinal * 0.8533,
              ease: 'titleReveal',
              duration: 0.532,
            },
            0
          )
          .to(
            titleTopRef.current,
            { y: -titleTopFinal, ease: 'power2.out', duration: 0.1 },
            0.532
          )
          .to(
            titleBottomRef.current,
            {
              y: titleBottomFinal * 0.8533,
              ease: 'titleReveal',
              duration: 0.532,
            },
            0
          )
          .to(
            titleBottomRef.current,
            {
              y: titleBottomFinal,
              ease: 'power2.out',
              duration: 0.1,
            },
            0.532
          )
          .to(
            panels,
            { autoAlpha: 0, ease: 'sine.inOut', duration: 0.235 },
            0.585
          )
          .to(
            serviceTitleRef.current,
            { y: 0, ease: 'sine.inOut', duration: 0.235 },
            0.585
          )
          .set(panels, {}, 1);

        if (isMobile) {
          revealTl.to(
            sectionRef.current,
            { padding: '1.25rem', ease: 'sine.inOut', duration: 0.235 },
            0.585
          );
        }
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative h-screen w-full overflow-hidden bg-neutral-100 md:p-5 ${apfelGrotezk.variable}`}
    >
      <div
        ref={imageWrapRef}
        className='absolute inset-5 overflow-hidden rounded-2xl'
      >
        <div className='absolute inset-0 overflow-hidden rounded-2xl'>
          <Image
            src='/assets/onsen-pools.webp'
            alt='Ecopark Onsen wellness pavilion'
            fill
            className='object-cover'
          />
        </div>

        <div
          ref={topWhiteRef}
          className='absolute -top-1 -right-1 -left-1 h-[calc(50%+4px)] bg-neutral-100'
        />
        <div
          ref={bottomWhiteRef}
          className='absolute -right-1 -bottom-1 -left-1 h-[calc(50%+4px)] bg-neutral-100'
        />
        <div
          ref={leftWhiteRef}
          className='absolute -top-1 -bottom-1 -left-1 w-[calc(50%+4px)] bg-neutral-100'
        />
        <div
          ref={rightWhiteRef}
          className='absolute -top-1 -right-1 -bottom-1 w-[calc(50%+4px)] bg-neutral-100'
        />
      </div>

      <div className='relative flex h-full w-full flex-col items-center justify-center gap-3.75'>
        <div className='w-full overflow-hidden text-center'>
          <h1 ref={titleTopRef} className={`${TITLE_CLASS} text-[#1a1919]`}>
            Explore a new paradigm
          </h1>
        </div>
        <div className='w-full overflow-hidden text-center'>
          <h1 ref={titleBottomRef} className={`${TITLE_CLASS} text-[#1a1919]`}>
            In Residential Wellness
          </h1>
        </div>
      </div>

      <div className='absolute top-1/2 left-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 overflow-hidden text-center md:w-full xl:w-max'>
        <h1 ref={serviceTitleRef} className={`${TITLE_CLASS} text-neutral-100`}>
          Signature Experiences
        </h1>
      </div>
    </section>
  );
}
