'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { gsap, MOTION_CONDITIONS, type MotionConditions } from '../lib/motion';

const apfelGrotezk = localFont({
  src: '../../public/fonts/ApfelGrotezk-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-apfel-grotezk',
  display: 'swap',
});

const VALUE_CLASS =
  'font-abril tabular-nums text-[40px] leading-[48px] font-normal text-white xl:text-[50px] xl:leading-[60px]';
const LABEL_CLASS =
  'font-(family-name:--font-apfel-grotezk) text-[16px] leading-[22.4px] font-normal text-white text-center xl:text-left xl:text-[18px] xl:leading-[27px]';

const STATS = [
  {
    target: 4,
    decimals: 0,
    suffix: '',
    label: 'Residence collections',
  },
  {
    target: 5,
    decimals: 0,
    suffix: '',
    label: 'Signature amenities',
  },
  {
    target: 360,
    decimals: 0,
    suffix: '°',
    label: 'Virtual tour of the masterplan',
  },
  {
    target: 4,
    decimals: 0,
    suffix: '',
    label: 'Moments of the day, designed',
  },
] as const;

function formatStat(stat: (typeof STATS)[number], current: number) {
  const rounded =
    stat.decimals > 0
      ? current.toFixed(stat.decimals)
      : Math.round(current).toString();
  return `${rounded}${stat.suffix}`;
}

export default function ProjectStatistics() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add(
      { ...MOTION_CONDITIONS, isCompact: '(max-width: 1279px)' },
      context => {
        const { reduce, isCompact } = context.conditions as MotionConditions & {
          isCompact: boolean;
        };

        const items = Array.from(statsRowRef.current?.children ?? []).map(
          maskEl => maskEl.firstElementChild
        );

        if (reduce) {
          gsap.set(imageWrapRef.current, { scale: 1 });
          gsap.set(items, { yPercent: 0 });
          valueRefs.current.forEach((el, index) => {
            if (el)
              el.textContent = formatStat(STATS[index], STATS[index].target);
          });
          return;
        }

        gsap.set(imageWrapRef.current, { scale: 0.9 });

        gsap.to(imageWrapRef.current, {
          scale: 1,
          ease: 'sine.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });

        if (isCompact) {
          valueRefs.current.forEach((el, index) => {
            if (!el) return;

            const stat = STATS[index];
            const counter = { value: 0 };

            gsap.to(counter, {
              value: stat.target,
              duration: 2.4,
              delay: index * 0.1,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                once: true,
              },
              onUpdate: () => {
                el.textContent = formatStat(stat, counter.value);
              },
            });
          });

          gsap.set(items, { yPercent: 0 });
          return;
        }

        valueRefs.current.forEach((el, index) => {
          if (el)
            el.textContent = formatStat(STATS[index], STATS[index].target);
        });

        gsap.set(items, { yPercent: 100 });

        const itemsTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });

        items.forEach(item => {
          itemsTl.to(item, { yPercent: 0, ease: 'sine.out', duration: 1 });
        });
      },
      sectionRef
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative h-full w-full bg-[#f5f5f5] p-5 md:py-15 xl:h-[2810px] xl:px-0 xl:py-25 ${apfelGrotezk.variable}`}
    >
      <div className='sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden'>
        <div
          ref={imageWrapRef}
          className='absolute inset-5 overflow-hidden rounded-2xl'
        >
          <Image
            src='/assets/stats-md-bg.webp'
            alt='The Magnolia towers at noon'
            fill
            className='object-cover xl:hidden'
          />
          <Image
            src='/assets/stats-bg.webp'
            alt='Evening at The Magnolia'
            fill
            className='hidden object-cover xl:block'
          />
        </div>

        <div
          ref={statsRowRef}
          className='relative z-10 flex w-full max-w-275 flex-col items-center gap-5 xl:flex-row xl:items-start xl:justify-between xl:gap-0'
        >
          {STATS.map((stat, index) => (
            <div key={stat.label} className='overflow-hidden'>
              <div className='flex flex-col items-center gap-2.5 xl:items-start xl:gap-3'>
                <p
                  ref={el => {
                    valueRefs.current[index] = el;
                  }}
                  className={VALUE_CLASS}
                >
                  {formatStat(stat, 0)}
                </p>
                <p className={LABEL_CLASS}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
