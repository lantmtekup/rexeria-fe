import { useLayoutEffect, useRef } from 'react';

import {
  narrowMarkerPositions,
  type ShowcaseHotspot,
} from '@/app/data/showcase';
import {
  gsap,
  MOTION_CONDITIONS,
  ScrollTrigger,
  type MotionConditions,
} from '@/app/lib/motion';

const LEGEND_FADE_DISTANCE = 20;

const LEGEND_FADE_DURATION = 0.8;

const CAPSULE_TYPE =
  'font-sans font-medium uppercase whitespace-nowrap text-xs';

const NUMBER_TYPE = 'font-sans text-[11px] leading-none font-semibold';

const LEGEND_NAME_TYPE =
  'font-display font-medium uppercase text-[#763718] text-[13px] leading-4 md:text-sm md:leading-[18px]';

const LEGEND_DESC_TYPE =
  'font-sans text-xs leading-[18px] text-black/65 md:text-[13px] md:leading-5';

function PlusMark() {
  return (
    <span className='relative block size-1.5'>
      <span className='absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-black' />
      <span className='absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-black' />
    </span>
  );
}

export function ShowcaseMarkers({
  hotspots,
  imageWidth,
  imageHeight,
}: {
  hotspots: ShowcaseHotspot[];
  imageWidth: number;
  imageHeight: number;
}) {
  const positions = narrowMarkerPositions(hotspots, imageWidth, imageHeight);

  return (
    <ul
      data-markers
      aria-hidden
      className='pointer-events-none absolute inset-0 z-10 xl:hidden'
    >
      {hotspots.map((hotspot, index) => (
        <li
          key={hotspot.key}
          data-marker
          className='absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/75 shadow-[0_1px_6px_rgba(0,0,0,0.18)] backdrop-blur-sm'
          style={{
            left: `${positions[index].x}%`,
            top: `${positions[index].y}%`,
          }}
        >
          <span className={`text-black ${NUMBER_TYPE}`}>{index + 1}</span>
        </li>
      ))}
    </ul>
  );
}

export function ShowcaseDots({ hotspots }: { hotspots: ShowcaseHotspot[] }) {
  return (
    <ul
      data-hotspots
      aria-hidden
      className='pointer-events-none absolute inset-0 z-10 hidden xl:block'
    >
      {hotspots.map(hotspot => (
        <li
          key={hotspot.key}
          data-hotspot
          className='absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.45)_45%,rgba(255,255,255,0)_72%)]'
          style={{ left: `${hotspot.dotX}%`, top: `${hotspot.dotY}%` }}
        >
          <PlusMark />
          <span
            className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-white/60 px-4 py-3 text-black backdrop-blur-sm ${CAPSULE_TYPE} ${
              hotspot.labelSide === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {hotspot.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ShowcaseRail({ hotspots }: { hotspots: ShowcaseHotspot[] }) {
  return (
    <nav
      data-rail
      aria-label='Featured details'
      className='absolute inset-x-0 bottom-[4.76%] z-10 hidden xl:block'
    >
      <ul className='mx-auto flex w-max items-center gap-[max(0.83vw,10px)]'>
        {hotspots.map((hotspot, index) => (
          <li
            key={hotspot.key}
            data-pill
            data-active={index === 0 ? 'true' : 'false'}
            className={`rounded-full border px-4 py-3 ${CAPSULE_TYPE} ${
              index === 0
                ? 'border-transparent bg-white/60 text-black backdrop-blur-sm'
                : 'border-white/80 text-white'
            }`}
          >
            {hotspot.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ShowcaseLegend({
  hotspots,
  animated = true,
}: {
  hotspots: ShowcaseHotspot[];
  animated?: boolean;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const detailed = hotspots.some(hotspot => hotspot.desc);

  useLayoutEffect(() => {
    if (!animated) return;

    const list = listRef.current;
    if (!list) return;

    const items = gsap.utils.toArray<HTMLElement>('[data-legend-item]', list);
    if (!items.length) return;

    const mm = gsap.matchMedia(list);

    mm.add({ ...MOTION_CONDITIONS, isXl: '(min-width: 1280px)' }, context => {
      const { reduce, isXl } = context.conditions as MotionConditions & {
        isXl: boolean;
      };
      if (reduce || isXl) return;

      gsap.set(items, { opacity: 0, y: LEGEND_FADE_DISTANCE });

      const timeline = gsap
        .timeline({
          paused: true,
          defaults: { duration: LEGEND_FADE_DURATION, ease: 'power2.out' },
        })
        .to(items, { opacity: 1, y: 0, stagger: 0.08 }, 0);

      const trigger = ScrollTrigger.create({
        trigger: list,
        start: 'top 85%',
        once: true,
        onEnter: () => timeline.play(),
      });

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [animated]);

  return (
    <ol
      ref={listRef}
      data-legend
      className={`grid gap-x-6 gap-y-6 border-t border-black/10 px-5 py-10 xl:hidden ${
        detailed ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
      }`}
    >
      {hotspots.map((hotspot, index) => (
        <li key={hotspot.key} data-legend-item className='flex gap-3'>
          <span
            className={`grid size-6 shrink-0 place-items-center bg-[#763718] text-white ${NUMBER_TYPE}`}
          >
            {index + 1}
          </span>
          <span className='flex min-w-0 flex-col gap-1.5'>
            <span className={LEGEND_NAME_TYPE}>{hotspot.label}</span>
            {hotspot.desc && (
              <span className={LEGEND_DESC_TYPE}>{hotspot.desc}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
