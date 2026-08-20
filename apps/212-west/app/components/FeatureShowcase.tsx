'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  ShowcaseDots,
  ShowcaseLegend,
  ShowcaseMarkers,
  ShowcaseRail,
} from '@/app/components/FeatureShowcaseHotspots';
import {
  gsap,
  MOTION_CONDITIONS,
  MQ,
  ScrollTrigger,
  type MotionConditions,
} from '@/app/lib/motion';
import {
  SHOWCASE_CARD_WIDTH,
  type ShowcaseReveal,
  type ShowcaseSection,
} from '@/app/data/showcase';

const REVEAL_BEAT_DURATION = 1.6;

const REVEAL_DESIGN_WIDTH = 1440;

const IMAGE_ROTATION = 15;

const IMAGE_ROTATE_SCALE = 1.2;

const RAIL_SHIFT_Y = 32;

const HOTSPOTS_SHIFT_Y = 16;

const HOTSPOT_MQ = '(min-width: 1280px)';

const HOTSPOT_SCALE = 1.684;

const HOTSPOT_SLOT_X = 74.72;

const HOTSPOT_SLOT_Y = 26.05;

const HOTSPOT_CLOSE_SPEEDUP = 1.35;

const CURTAIN_MASK = 'pointer-events-none hidden bg-white xl:block xl:flex-1';

const CHIP_TYPE =
  'font-display font-medium uppercase text-white text-xs leading-none md:text-[13px] xl:text-sm';

const HEADING_TYPE =
  'font-display  font-medium uppercase text-[#763718] text-[34px] leading-[31px] md:text-[46px] md:leading-[42px] xl:text-6xl xl:leading-[55px]';

const BODY_TYPE =
  'font-display font-medium uppercase text-black text-[15px] leading-6 md:text-[17px] md:leading-[27px] xl:text-lg xl:leading-7';

const CARD_ANCHOR: Record<ShowcaseSection['cardAnchor'], string> = {
  'top-left': 'xl:top-0 xl:left-0',
  'top-right': 'xl:top-0 xl:right-0',
  'bottom-right': 'xl:right-0 xl:bottom-0',
};

function collect(items: HTMLElement[], selector: string) {
  return items.flatMap(item => [
    ...item.querySelectorAll<HTMLElement>(selector),
  ]);
}

function ShowcasePanel({ section }: { section: ShowcaseSection }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hotspotTimeline = useRef<gsap.core.Timeline | null>(null);
  const openedHotspot = useRef<number | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [stackedHotspot, setStackedHotspot] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({
    width: section.imageWidth,
    height: section.imageHeight,
  });
  const right = section.align === 'right';
  const cardOnRight =
    section.cardAnchor === 'top-right' || section.cardAnchor === 'bottom-right';
  const hasHotspots = section.hotspots.length > 0;
  const reveal = section.reveal;

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root || !reveal) return;

    const frame = root.querySelector<HTMLElement>('[data-media]');
    const image = root.querySelector<HTMLElement>('[data-media-image]');
    const panels = gsap.utils.toArray<HTMLElement>(
      '[data-curtain-panel]',
      root
    );
    const copy = root.querySelector<HTMLElement>('[data-intro-copy]');
    const hasCardColumn = reveal.panels.some(panel => panel.isCardColumn);
    const expectedPanelCount = reveal.panels.length + (hasCardColumn ? 1 : 0);
    if (!frame || !image || !copy || panels.length !== expectedPanelCount) {
      return;
    }

    const mm = gsap.matchMedia(root);

    mm.add(MOTION_CONDITIONS, context => {
      const { reduce } = context.conditions as MotionConditions;

      const duration = reduce ? 0 : REVEAL_BEAT_DURATION;
      const factor = frame.offsetWidth / REVEAL_DESIGN_WIDTH;

      gsap.set(image, {
        rotate: IMAGE_ROTATION,
        scale: IMAGE_ROTATE_SCALE,
        transformOrigin: 'center',
      });
      gsap.set(copy, {
        scale: reveal.text.copyScaleFrom,
        transformOrigin: cardOnRight ? 'top left' : 'top right',
      });

      const timeline = gsap
        .timeline({ paused: true, defaults: { duration, ease: 'power2.out' } })
        .to(image, { rotate: 0, scale: 1 }, 0)
        .to(copy, { scale: 1 }, 0);

      const rail = root.querySelector<HTMLElement>('[data-rail]');
      const dots = root.querySelector<HTMLElement>('[data-hotspots]');

      if (rail) {
        gsap.set(rail, { y: RAIL_SHIFT_Y * factor });
        timeline.to(rail, { y: 0 }, 0);
      }

      if (dots) {
        gsap.set(dots, { y: HOTSPOTS_SHIFT_Y * factor });
        timeline.to(dots, { y: 0, clearProps: 'transform' }, 0);
      }

      panels.forEach(panel => {
        const panelIndex = Number(panel.dataset.panelIndex);
        timeline.to(
          panel,
          {
            yPercent: reveal.panels[panelIndex].exit === 'down' ? 100 : -100,
          },
          0
        );
      });

      if (reveal.text.mode === 'split') {
        const heading = root.querySelector<HTMLElement>('[data-intro-heading]');
        if (heading) {
          gsap.set(heading, {
            x: reveal.text.headingShiftX * factor,
            autoAlpha: 0,
          });
          gsap.set(copy, { x: reveal.text.copyShiftX * factor, autoAlpha: 0 });
          timeline
            .to(heading, { x: 0, autoAlpha: 1 }, 0)
            .to(copy, { x: 0, autoAlpha: 1 }, 0);
        }
      } else {
        const group = root.querySelector<HTMLElement>('[data-intro-group]');
        if (group) {
          gsap.set(group, {
            x: reveal.text.groupShiftX * factor,
            autoAlpha: 0,
          });
          timeline.to(group, { x: 0, autoAlpha: 1 }, 0);
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 20%',
        once: true,
        onEnter: () => timeline.play(),
      });

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [reveal, cardOnRight]);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root || !hasHotspots) return;

    if (
      window.matchMedia(MQ.reduce).matches ||
      !window.matchMedia(HOTSPOT_MQ).matches
    ) {
      return;
    }

    const frame = root.querySelector<HTMLElement>('[data-media]');
    const image = root.querySelector<HTMLElement>('[data-media-image]');
    const card = root.querySelector<HTMLElement>('[data-card]');
    if (!frame || !image || !card) return;

    hotspotTimeline.current?.kill();

    if (activeHotspot === null) {
      const closingIndex = openedHotspot.current;
      if (closingIndex === null) return;
      openedHotspot.current = null;

      const closing = root.querySelector<HTMLElement>(
        `[data-hotspot-index="${closingIndex}"]`
      );
      const closingMove = closing?.querySelector<HTMLElement>(
        '[data-hotspot-move]'
      );
      const closingDetail =
        closing?.querySelector<HTMLElement>('[data-detail-card]');

      hotspotTimeline.current = gsap
        .timeline({
          defaults: {
            duration: REVEAL_BEAT_DURATION / HOTSPOT_CLOSE_SPEEDUP,
            ease: 'power2.out',
            force3D: true,
          },
          onComplete: () => setStackedHotspot(null),
        })
        .to(card, { xPercent: 0 }, 0)
        .to(image, { scale: 1, x: 0, y: 0 }, 0)
        .to(root.querySelectorAll('[data-hotspot-move]'), { x: 0, y: 0 }, 0)
        .to(root.querySelectorAll('[data-hotspot-fade]'), { opacity: 1 }, 0)
        .to(root.querySelectorAll('[data-capsule]'), { autoAlpha: 1 }, 0)
        .to(root.querySelectorAll('[data-plus-stem]'), { autoAlpha: 1 }, 0)
        .to(root.querySelectorAll('[data-detail-card]'), { autoAlpha: 0 }, 0);

      if (closingMove && closingDetail) {
        const holdX = gsap.getProperty(closingMove, 'x') as number;
        const holdY = gsap.getProperty(closingMove, 'y') as number;
        hotspotTimeline.current
          .to(closingDetail, { x: `+=${holdX}`, y: `+=${holdY}` }, 0)
          .set(closingDetail, { clearProps: 'transform' });
      }
      return;
    }

    const spot = section.hotspots[activeHotspot];
    const target = root.querySelector<HTMLElement>(
      `[data-hotspot-index="${activeHotspot}"]`
    );
    if (!spot || !target) return;

    const move = target.querySelector<HTMLElement>('[data-hotspot-move]');
    const fade = target.querySelector<HTMLElement>('[data-hotspot-fade]');
    const stem = target.querySelector<HTMLElement>('[data-plus-stem]');
    const detail = target.querySelector<HTMLElement>('[data-detail-card]');
    if (!move || !fade || !stem || !detail) return;

    const width = frame.offsetWidth;
    const height = frame.offsetHeight;
    const slotX = cardOnRight ? 100 - HOTSPOT_SLOT_X : HOTSPOT_SLOT_X;
    const dotLeft = (spot.dotX / 100) * width;
    const dotTop = (spot.dotY / 100) * height;
    const panX = gsap.utils.clamp(
      0,
      width - width / HOTSPOT_SCALE,
      dotLeft - ((slotX / 100) * width) / HOTSPOT_SCALE
    );
    const panY = gsap.utils.clamp(
      0,
      height - height / HOTSPOT_SCALE,
      dotTop - ((HOTSPOT_SLOT_Y / 100) * height) / HOTSPOT_SCALE
    );

    const others = gsap.utils
      .toArray<HTMLElement>('[data-hotspot]', root)
      .filter(item => item !== target);

    openedHotspot.current = activeHotspot;

    const timeline = gsap
      .timeline({
        defaults: {
          duration: REVEAL_BEAT_DURATION,
          ease: 'power2.out',
          force3D: true,
        },
      })
      .to(card, { xPercent: cardOnRight ? 100 : -100 }, 0)
      .to(
        image,
        {
          scale: HOTSPOT_SCALE,
          x: -panX * HOTSPOT_SCALE,
          y: -panY * HOTSPOT_SCALE,
          transformOrigin: '0 0',
        },
        0
      )
      .to(
        move,
        {
          x: (dotLeft - panX) * HOTSPOT_SCALE - dotLeft,
          y: (dotTop - panY) * HOTSPOT_SCALE - dotTop,
        },
        0
      )
      .to(root.querySelectorAll('[data-capsule]'), { autoAlpha: 0 }, 0)
      .to(stem, { autoAlpha: 0 }, 0)
      .to(detail, { autoAlpha: 1 }, 0)
      .to(fade, { opacity: 1 }, 0);

    if (others.length) {
      timeline
        .to(collect(others, '[data-hotspot-fade]'), { opacity: 0 }, 0)
        .to(collect(others, '[data-detail-card]'), { autoAlpha: 0 }, 0);
    }

    hotspotTimeline.current = timeline;
  }, [activeHotspot, cardOnRight, hasHotspots, section.hotspots]);

  useEffect(
    () => () => {
      hotspotTimeline.current?.kill();
      hotspotTimeline.current = null;
    },
    []
  );

  useEffect(() => {
    setActiveHotspot(null);
    setStackedHotspot(null);
    openedHotspot.current = null;
  }, [section.hotspots]);

  const selectHotspot = (index: number) => {
    const next = activeHotspot === index ? null : index;
    setActiveHotspot(next);
    if (next !== null) setStackedHotspot(next);
  };

  const chipAndHeading = (
    <>
      <span className={`w-fit bg-[#763718] px-3 py-3 ${CHIP_TYPE}`}>
        {section.chip}
      </span>

      <h2 className={`mt-6 w-fit ${HEADING_TYPE}`}>
        {section.titleLines.map(line => (
          <div key={line} className='w-fit'>
            {line}
          </div>
        ))}
      </h2>
    </>
  );

  const copy = (
    <p data-intro-copy className={`mt-8 xl:max-w-[22.15vw] ${BODY_TYPE}`}>
      {section.desc}
    </p>
  );

  const bandCount = reveal
    ? reveal.panels.filter(panel => !panel.isCardColumn).length
    : 0;
  const bandWidth = bandCount ? (100 - SHOWCASE_CARD_WIDTH) / bandCount : 0;
  const mobileWidth = reveal ? 100 / reveal.panels.length : 0;
  let cursor = 0;
  const allPanels: Array<
    ShowcaseReveal['panels'][number] & {
      index: number;
      mobileLeft: number;
      mobileWidth: number;
      xlLeft: number;
      xlWidth: number;
    }
  > = [];
  reveal?.panels.forEach((panel, index) => {
    const xlWidth = panel.isCardColumn ? SHOWCASE_CARD_WIDTH : bandWidth;
    const xlLeft = cursor;
    cursor += xlWidth;
    allPanels.push({
      ...panel,
      index,
      mobileLeft: index * mobileWidth,
      mobileWidth,
      xlLeft,
      xlWidth,
    });
  });
  const cardColumnIndex =
    reveal?.panels.findIndex(panel => panel.isCardColumn) ?? -1;
  const cardColumnPanel =
    cardColumnIndex >= 0 ? reveal!.panels[cardColumnIndex] : undefined;
  const cardAtBottom = section.cardAnchor === 'bottom-right';

  const cardBody = !reveal ? (
    <>
      {chipAndHeading}
      {copy}
    </>
  ) : reveal.text.mode === 'combined' ? (
    <div data-intro-group className='flex w-fit flex-col'>
      {chipAndHeading}
      {copy}
    </div>
  ) : (
    <>
      <div data-intro-heading className='flex w-fit flex-col'>
        {chipAndHeading}
      </div>
      {copy}
    </>
  );

  return (
    <section
      ref={sectionRef}
      id={section.key}
      data-panel
      data-showcase
      className={`relative flex w-full flex-col overflow-hidden bg-white xl:block ${
        section.fullHeight ? 'xl:h-svh' : 'xl:aspect-12/7'
      }`}
    >
      <div
        data-media
        className='relative w-full overflow-hidden bg-[#0F0F0E]/5 xl:absolute xl:inset-0 xl:h-full'
      >
        <Image
          data-media-image=''
          src={section.image}
          alt={section.imageAlt}
          width={section.imageWidth}
          height={section.imageHeight}
          sizes='100vw'
          onLoad={event =>
            setImageSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
          className='h-auto w-full object-contain will-change-transform xl:absolute xl:inset-0 xl:h-full xl:object-cover'
        />
        {hasHotspots && (
          <>
            <ShowcaseMarkers
              hotspots={section.hotspots}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
            />
            <ShowcaseDots
              hotspots={section.hotspots}
              activeIndex={activeHotspot}
              stackedIndex={stackedHotspot}
              onSelect={selectHotspot}
            />
            <ShowcaseRail hotspots={section.hotspots} />
          </>
        )}

        {allPanels.map(panel => (
          <div
            key={panel.index}
            data-curtain-panel
            data-panel-index={panel.index}
            className={`pointer-events-none absolute left-(--pl-m) z-10 w-(--pw-m) bg-white will-change-transform ${
              panel.isCardColumn
                ? 'xl:hidden'
                : 'xl:left-(--pl-x) xl:w-(--pw-x)'
            }`}
            style={{
              top: `calc(${panel.top}% - 1px)`,
              height: `calc(${panel.height}% + 2px)`,
              ['--pl-m' as string]: `calc(${panel.mobileLeft}% - 1px)`,
              ['--pw-m' as string]: `calc(${panel.mobileWidth}% + 2px)`,
              ...(panel.isCardColumn
                ? {}
                : {
                    ['--pl-x' as string]: `calc(${panel.xlLeft}% - 1px)`,
                    ['--pw-x' as string]: `calc(${panel.xlWidth}% + 2px)`,
                  }),
            }}
          />
        ))}
      </div>

      {cardColumnPanel ? (
        <div
          style={{ ['--card-w' as string]: `${SHOWCASE_CARD_WIDTH}%` }}
          className={`relative z-20 flex w-full flex-col xl:absolute xl:top-0 xl:h-full xl:w-(--card-w) ${
            cardOnRight ? 'xl:right-0' : 'xl:left-0'
          } ${cardAtBottom ? 'xl:flex-col-reverse' : ''}`}
        >
          <div
            data-card
            className={`relative flex w-full flex-col bg-white px-5 py-10 xl:p-[max(2.78vw,28px)] ${
              right ? 'xl:items-end xl:text-right' : ''
            }`}
          >
            {cardBody}
          </div>
          <div
            data-curtain-panel
            data-panel-index={cardColumnIndex}
            className={CURTAIN_MASK}
          />
        </div>
      ) : (
        <div
          data-card
          style={{ ['--card-w' as string]: `${SHOWCASE_CARD_WIDTH}%` }}
          className={`relative z-20 flex w-full flex-col bg-white px-5 py-10 xl:absolute xl:w-(--card-w) xl:p-[max(2.78vw,28px)] ${
            CARD_ANCHOR[section.cardAnchor]
          } ${right ? 'xl:items-end xl:text-right' : ''}`}
        >
          {cardBody}
        </div>
      )}

      {hasHotspots && (
        <ShowcaseLegend
          hotspots={section.hotspots}
          animated={Boolean(reveal)}
        />
      )}
    </section>
  );
}

export default function FeatureShowcase({
  sections,
}: {
  sections: ShowcaseSection[];
}) {
  return (
    <>
      {sections.map(section => (
        <ShowcasePanel key={section.key} section={section} />
      ))}
    </>
  );
}
