'use client';

/**
 * 212 West 72nd · Feature Showcase — ảnh full-bleed + thẻ nội dung neo góc,
 * rèm reveal 4 cột, hotspot zoom (khung rộng) / marker + legend (khung hẹp).
 * Port từ apps/212-west FeatureShowcase.tsx (1 `ShowcasePanel` = 1 block, để
 * mỗi section sửa được riêng trên canvas).
 *
 * Motion (giữ timing app, 1.6s power2.out):
 * - reveal: 4 rèm trượt ∓100%, ảnh xoay 15°/scale 1.2 → 0/1, chữ dịch x +
 *   scale, rail/dots dịch y
 * - hotspot: click chấm → ảnh zoom 1.684× pan tới chấm, thẻ trượt ra, thẻ chi
 *   tiết hiện; click lại → đóng (nhanh hơn 1.35×)
 *
 * - `cardAnchor` suy ra bố cục rèm (cột thẻ cùng phía thẻ) — xem
 *   `resolveShowcasePanels`.
 * - Editor canvas: bỏ rèm (che ảnh khi không animate), tắt zoom hotspot, và
 *   LUÔN hiện legend để sửa nhãn/mô tả từng hotspot.
 * - KHÔNG gsap.registerPlugin — LandingMotionRoot đã đăng ký.
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  West72ShowcaseContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import {
  ShowcaseDots,
  ShowcaseLegend,
  ShowcaseMarkers,
  ShowcaseRail,
} from './West72ShowcaseHotspots';
import {
  resolveShowcasePanels,
  SHOWCASE_CARD_WIDTH,
  SHOWCASE_TEXT_SHIFT,
} from './west72ShowcaseGeometry';
import {
  WEST72_BLACK,
  WEST72_BROWN,
  WEST72_FONT_CSS,
  WEST72_FONT_DISPLAY,
  WEST72_WHITE,
} from './west72Theme';

/** Khớp Tailwind `@4xl:` container (896px) — nhánh ảnh full-bleed + hotspot. */
const DESKTOP_BREAKPOINT = 896;

// ── Hằng số giữ nguyên từ app ──
const REVEAL_BEAT_DURATION = 1.6;
const REVEAL_DESIGN_WIDTH = 1440;
const IMAGE_ROTATION = 15;
const IMAGE_ROTATE_SCALE = 1.2;
const RAIL_SHIFT_Y = 32;
const HOTSPOTS_SHIFT_Y = 16;
const HOTSPOT_SCALE = 1.684;
const HOTSPOT_SLOT_X = 74.72;
const HOTSPOT_SLOT_Y = 26.05;
const HOTSPOT_CLOSE_SPEEDUP = 1.35;

const DEFAULT_IMAGE_SIZE = { width: 1642, height: 958 };

const RESPONSIVE = {
  chipFont: 'clamp(12px, 0.97cqi, 14px)',
  headingFont: 'clamp(34px, 4.17cqi, 60px)',
  bodyFont: 'clamp(15px, 1.25cqi, 18px)',
} as const;

const BLOCK_CSS = `
.west72-showcase-card { padding: 40px 20px; }
.west72-showcase-copy { margin-top: 32px; }
/* Khung hẹp: ảnh giữ tỉ lệ gốc (contain); khung rộng: full-bleed (cover) —
   object-fit đổi theo tier nên không đặt inline. */
.west72-showcase-img { object-fit: contain; }
@container (min-width: ${DESKTOP_BREAKPOINT}px) {
  .west72-showcase-img { object-fit: cover; }
  /* Đặt trên wrapper con, KHÔNG trên root: @container resolve theo container
     TỔ TIÊN — root là container nên rule trên chính nó chỉ khớp khi có frame
     bọc ngoài (editor), trên /p (window scroll) sẽ không khớp → cao 0. */
  .west72-showcase-frame[data-full='true'] { height: 100svh; }
  .west72-showcase-frame[data-full='true'][data-canvas-edit='true'] {
    height: clamp(560px, 62cqi, 900px);
  }
  .west72-showcase-frame[data-full='false'] { aspect-ratio: 12 / 7; }
  .west72-showcase-card { padding: max(2.78cqi, 28px); }
  .west72-showcase-copy { max-width: 22.15cqi; }
}
`;

const CARD_ANCHOR: Record<West72ShowcaseContent['cardAnchor'], string> = {
  'top-left': '@4xl:top-0 @4xl:left-0',
  'top-right': '@4xl:top-0 @4xl:right-0',
  'bottom-right': '@4xl:right-0 @4xl:bottom-0',
};

function collect(items: HTMLElement[], selector: string) {
  return items.flatMap(item => [
    ...item.querySelectorAll<HTMLElement>(selector),
  ]);
}

interface Props {
  content: West72ShowcaseContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function West72Showcase({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const hotspotTimeline = React.useRef<gsap.core.Timeline | null>(null);
  const openedHotspot = React.useRef<number | null>(null);

  const { scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isNarrow = useContainerMobile(rootRef, DESKTOP_BREAKPOINT);

  const [activeHotspot, setActiveHotspot] = React.useState<number | null>(null);
  const [stackedHotspot, setStackedHotspot] = React.useState<number | null>(
    null
  );
  const [imageSize, setImageSize] = React.useState(DEFAULT_IMAGE_SIZE);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const styleOf = React.useCallback(
    (key: string) =>
      composeStyle(
        elementStyleOf(styles, key),
        orderStyle(order, key),
        positionStyle(positions, key)
      ),
    [styles, order, positions]
  );

  const chip = content.chip?.trim() || '';
  const title = content.title?.trim() || '';
  const desc = content.desc?.trim() || '';
  const imageUrl = content.imageUrl?.trim() || '';
  const imageAlt = content.imageAlt?.trim() || '';
  const cardAnchor = content.cardAnchor ?? 'top-left';
  const revealMode = content.revealMode ?? 'combined';
  const textAlign = content.textAlign ?? 'left';
  const fullHeight = content.fullHeight !== false;

  const hotspots = React.useMemo(
    () =>
      Array.isArray(content.hotspots)
        ? content.hotspots.filter(h => h && typeof h.label === 'string')
        : [],
    [content.hotspots]
  );

  const hasHotspots = hotspots.length > 0;
  const hasReveal = revealMode !== 'none';
  const cardOnRight = cardAnchor !== 'top-left';
  const cardAtBottom = cardAnchor === 'bottom-right';
  const rightAligned = textAlign === 'right';

  const panels = React.useMemo(
    () => (hasReveal ? resolveShowcasePanels(cardAnchor) : []),
    [hasReveal, cardAnchor]
  );
  const cardColumnPanel = panels.find(p => p.isCardColumn);

  // ── Reveal ───────────────────────────────────────────────────────────────
  React.useLayoutEffect(() => {
    if (isCanvas || !hasReveal) return;
    const root = rootRef.current;
    if (!root) return;

    const width = root.clientWidth;
    if (width === 0) return;
    if (width < DESKTOP_BREAKPOINT !== isNarrow) return;

    const frame = root.querySelector<HTMLElement>('[data-media]');
    const image = root.querySelector<HTMLElement>('[data-media-image]');
    const copy = root.querySelector<HTMLElement>('[data-intro-copy]');
    const curtains = gsap.utils.toArray<HTMLElement>(
      '[data-curtain-panel]',
      root
    );
    // Cột thẻ có 2 node cùng `data-panel-index` (1 trong ảnh cho khung hẹp,
    // 1 mask trong cột thẻ cho khung rộng) — cả hai chạy cùng tween.
    const expectedCurtains =
      panels.length + (panels.some(p => p.isCardColumn) ? 1 : 0);
    if (!frame || !image || !copy || curtains.length !== expectedCurtains) {
      return;
    }

    const st = scroller ?? undefined;
    const duration = reduceMotion ? 0 : REVEAL_BEAT_DURATION;
    const factor = frame.offsetWidth / REVEAL_DESIGN_WIDTH;

    const ctx = gsap.context(() => {
      gsap.set(image, {
        rotate: IMAGE_ROTATION,
        scale: IMAGE_ROTATE_SCALE,
        transformOrigin: 'center',
      });
      gsap.set(copy, {
        scale:
          revealMode === 'split'
            ? SHOWCASE_TEXT_SHIFT.split.copyScaleFrom
            : SHOWCASE_TEXT_SHIFT.combined.copyScaleFrom,
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

      curtains.forEach(panel => {
        const index = Number(panel.dataset.panelIndex);
        const spec = panels[index];
        if (!spec) return;
        timeline.to(panel, { yPercent: spec.exit === 'down' ? 100 : -100 }, 0);
      });

      if (revealMode === 'split') {
        const heading = root.querySelector<HTMLElement>('[data-intro-heading]');
        if (heading) {
          gsap.set(heading, {
            x: SHOWCASE_TEXT_SHIFT.split.heading * factor,
            autoAlpha: 0,
          });
          gsap.set(copy, {
            x: SHOWCASE_TEXT_SHIFT.split.copy * factor,
            autoAlpha: 0,
          });
          timeline
            .to(heading, { x: 0, autoAlpha: 1 }, 0)
            .to(copy, { x: 0, autoAlpha: 1 }, 0);
        }
      } else {
        const group = root.querySelector<HTMLElement>('[data-intro-group]');
        if (group) {
          gsap.set(group, {
            x: SHOWCASE_TEXT_SHIFT.combined.group * factor,
            autoAlpha: 0,
          });
          timeline.to(group, { x: 0, autoAlpha: 1 }, 0);
        }
      }

      ScrollTrigger.create({
        trigger: root,
        scroller: st,
        start: isNarrow ? 'top 70%' : 'top 20%',
        end: 'bottom top',
        invalidateOnRefresh: true,
        // Hotspot đang mở cũng lái scale/x/y của ảnh — replay lúc này sẽ giành
        // quyền điều khiển.
        onEnter: () => {
          if (openedHotspot.current === null) timeline.play();
        },
        onEnterBack: () => {
          if (openedHotspot.current === null) timeline.play();
        },
        onLeave: () => {
          if (openedHotspot.current === null) timeline.pause(0);
        },
        onLeaveBack: () => {
          if (openedHotspot.current === null) timeline.reverse();
        },
      });
    }, root);

    requestRefresh();
    return () => ctx.revert();
  }, [
    isCanvas,
    isNarrow,
    hasReveal,
    revealMode,
    cardOnRight,
    panels,
    scroller,
    requestRefresh,
    reduceMotion,
  ]);

  // ── Hotspot zoom ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !hasHotspots || isCanvas || isNarrow || reduceMotion) return;

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

    const spot = hotspots[activeHotspot];
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
  }, [
    activeHotspot,
    cardOnRight,
    hasHotspots,
    hotspots,
    isCanvas,
    isNarrow,
    reduceMotion,
  ]);

  React.useEffect(
    () => () => {
      hotspotTimeline.current?.kill();
      hotspotTimeline.current = null;
    },
    []
  );

  React.useEffect(() => {
    setActiveHotspot(null);
    setStackedHotspot(null);
    openedHotspot.current = null;
  }, [hotspots, isCanvas, isNarrow]);

  const selectHotspot = (index: number) => {
    if (isCanvas) return;
    const next = activeHotspot === index ? null : index;
    setActiveHotspot(next);
    if (next !== null) setStackedHotspot(next);
  };

  // ── Thẻ nội dung ─────────────────────────────────────────────────────────
  const chipAndHeading = (
    <>
      <span
        data-element-key='chip'
        className={selectableClass(activeKey === 'chip', 'w-fit')}
        style={composeStyle(
          {
            backgroundColor: WEST72_BROWN,
            padding: 12,
            fontFamily: WEST72_FONT_DISPLAY,
            fontSize: RESPONSIVE.chipFont,
            lineHeight: 1,
            fontWeight: 500,
            textTransform: 'uppercase',
            color: WEST72_WHITE,
          },
          styleOf('chip')
        )}
      >
        {chip}
      </span>

      <h2
        data-element-key='title'
        className={selectableClass(activeKey === 'title', 'm-0 w-fit')}
        style={composeStyle(
          {
            marginTop: 24,
            fontFamily: WEST72_FONT_DISPLAY,
            fontSize: RESPONSIVE.headingFont,
            lineHeight: 0.92,
            fontWeight: 500,
            textTransform: 'uppercase',
            color: WEST72_BROWN,
            whiteSpace: 'pre-line',
          },
          styleOf('title')
        )}
      >
        {title}
      </h2>
    </>
  );

  const copyNode = (
    <p
      data-intro-copy
      data-element-key='desc'
      className={selectableClass(
        activeKey === 'desc',
        'west72-showcase-copy m-0'
      )}
      style={composeStyle(
        {
          fontFamily: WEST72_FONT_DISPLAY,
          fontSize: RESPONSIVE.bodyFont,
          lineHeight: 1.56,
          fontWeight: 500,
          textTransform: 'uppercase',
          color: WEST72_BLACK,
        },
        styleOf('desc')
      )}
    >
      {desc}
    </p>
  );

  const cardBody = !hasReveal ? (
    <>
      {chipAndHeading}
      {copyNode}
    </>
  ) : revealMode === 'combined' ? (
    <div data-intro-group className='flex w-fit flex-col'>
      {chipAndHeading}
      {copyNode}
    </div>
  ) : (
    <>
      <div data-intro-heading className='flex w-fit flex-col'>
        {chipAndHeading}
      </div>
      {copyNode}
    </>
  );

  const cardInner = (
    <div
      data-card
      className={cn(
        'west72-showcase-card relative flex w-full flex-col @4xl:pointer-events-auto',
        rightAligned && '@4xl:items-end @4xl:text-right'
      )}
      style={{ backgroundColor: WEST72_WHITE }}
    >
      {cardBody}
    </div>
  );

  const curtain = (spec: (typeof panels)[number]) => (
    <div
      key={spec.index}
      data-curtain-panel
      data-panel-index={spec.index}
      className={cn(
        'pointer-events-none absolute left-(--pl-m) z-10 w-(--pw-m) will-change-transform',
        spec.isCardColumn ? '@4xl:hidden' : '@4xl:left-(--pl-x) @4xl:w-(--pw-x)'
      )}
      style={{
        top: -1,
        height: 'calc(100% + 2px)',
        backgroundColor: WEST72_WHITE,
        ['--pl-m' as string]: `calc(${spec.narrowLeft}% - 1px)`,
        ['--pw-m' as string]: `calc(${spec.narrowWidth}% + 2px)`,
        ...(spec.isCardColumn
          ? {}
          : {
              ['--pl-x' as string]: `calc(${spec.wideLeft}% - 1px)`,
              ['--pw-x' as string]: `calc(${spec.wideWidth}% + 2px)`,
            }),
      }}
    />
  );

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn(
        'west72-showcase @container relative w-full overflow-hidden',
        className
      )}
      style={composeStyle(
        { backgroundColor: WEST72_WHITE },
        blockBackgroundStyle(background)
      )}
    >
      <style>{WEST72_FONT_CSS}</style>
      <style>{BLOCK_CSS}</style>

      <div
        data-full={fullHeight ? 'true' : 'false'}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        className='west72-showcase-frame relative flex w-full flex-col @4xl:block'
      >
        <div
          data-media
          className='relative w-full overflow-hidden @4xl:absolute @4xl:inset-0 @4xl:h-full'
          style={{ backgroundColor: 'rgba(15, 15, 14, 0.05)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-media-image
            data-element-key='imageUrl'
            src={imageUrl}
            alt={imageAlt}
            onLoad={event => {
              setImageSize({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              });
              requestRefresh();
            }}
            className={selectableClass(
              activeKey === 'imageUrl',
              'west72-showcase-img h-auto w-full will-change-transform @4xl:absolute @4xl:inset-0 @4xl:h-full'
            )}
            style={styleOf('imageUrl')}
          />
          <span
            data-element-key='imageAlt'
            className={selectableClass(activeKey === 'imageAlt', 'sr-only')}
            style={styleOf('imageAlt')}
          >
            {imageAlt}
          </span>

          {hasHotspots && (
            <>
              <ShowcaseMarkers
                hotspots={hotspots}
                imageWidth={imageSize.width}
                imageHeight={imageSize.height}
                hidden
              />
              <ShowcaseDots
                hotspots={hotspots}
                activeIndex={activeHotspot}
                stackedIndex={stackedHotspot}
                onSelect={selectHotspot}
              />
              <ShowcaseRail
                hotspots={hotspots}
                activeIndex={activeHotspot}
                onSelect={selectHotspot}
              />
            </>
          )}

          {/* Khung hẹp: cả 4 cột nằm trong ảnh; khung rộng cột thẻ ẩn ở đây và
            được thay bằng mask trong cột thẻ bên dưới (đúng như app). */}
          {!isCanvas && panels.map(curtain)}
        </div>

        {cardColumnPanel ? (
          <div
            style={{ ['--card-w' as string]: `${SHOWCASE_CARD_WIDTH}%` }}
            className={cn(
              'relative z-20 flex w-full flex-col @4xl:pointer-events-none @4xl:absolute @4xl:top-0 @4xl:h-full @4xl:w-(--card-w)',
              cardOnRight ? '@4xl:right-0' : '@4xl:left-0',
              cardAtBottom && '@4xl:flex-col-reverse'
            )}
          >
            {cardInner}
            {!isCanvas && (
              <div
                data-curtain-panel
                data-panel-index={cardColumnPanel.index}
                className='pointer-events-none hidden @4xl:block @4xl:flex-1'
                style={{ backgroundColor: WEST72_WHITE }}
              />
            )}
          </div>
        ) : (
          <div
            style={{ ['--card-w' as string]: `${SHOWCASE_CARD_WIDTH}%` }}
            className={cn(
              'relative z-20 flex w-full flex-col @4xl:absolute @4xl:w-(--card-w)',
              CARD_ANCHOR[cardAnchor]
            )}
          >
            {cardInner}
          </div>
        )}
      </div>

      {hasHotspots && (
        <ShowcaseLegend
          hotspots={hotspots}
          alwaysVisible={isCanvas}
          activeKey={activeKey}
          styleOf={styleOf}
        />
      )}
    </section>
  );
}
