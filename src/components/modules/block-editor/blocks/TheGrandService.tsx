'use client';

/**
 * The Grand · Service — section "Dịch Vụ". Port từ apps/the-grand Service.
 *
 * Motion (T3 — pin/sticky + scrub, R1–R6):
 * - useLandingMotion (scroller + requestRefresh + hasRoot) — KHÔNG data-motion,
 *   KHÔNG useBlockMotion (scrub thủ công cho track ngang; đồng nhất sibling
 *   TheGrandLocation).
 * - Live desktop: CSS `position: sticky` viewport 100svh; dải cream tiêu đề dọc
 *   bên trái (z thấp) đứng yên, `.track` scrub translateX theo tiến độ cuộn —
 *   card (ảnh trái + info trắng phải đè một phần lên ảnh) trượt đè lên dải cream.
 * - Editor canvas (`active-block-preview`): BlockPreview transform:scale gãy
 *   sticky → nhánh `isCanvas` render lưới phẳng tất cả card editable
 *   (pattern TheGrandLocation / PnjVariant).
 * - Flat (container mobile qua useContainerMobile, hoặc prefers-reduced-motion):
 *   stack dọc, tắt sticky/scrub — CSS `--flat` + guard trong effect.
 * - Mọi scrollTrigger dùng `scroller` + invalidateOnRefresh; requestRefresh sau
 *   build; KHÔNG new Lenis / registerPlugin trong block.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TheGrandServiceContent,
  TheGrandServiceItem,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useContainerMobile } from './useContainerMobile';
import { resolveTheGrandServiceItems } from './theGrandServiceContent';

const RESPONSIVE = {
  headingFont: 'clamp(40px, 4.4cqi, 76px)',
  mediaWidth: 'clamp(360px, 42cqi, 640px)',
  infoWidth: 'clamp(320px, 38cqi, 560px)',
  trackGap: 'clamp(24px, 4cqi, 72px)',
  trackPadLeft: 'clamp(120px, 15cqi, 260px)',
  trackPadRight: 'clamp(32px, 5cqi, 96px)',
  cardTitleFont: 'clamp(20px, 1.8cqi, 30px)',
  cardTitleMb: 'clamp(14px, 1.4cqi, 22px)',
  descFont: 'clamp(13px, 0.95cqi, 15px)',
  asidePad: 'clamp(28px, 5cqi, 80px)',
  infoPad: 'clamp(28px, 2.6cqi, 52px)',
} as const;

const COLORS = {
  section: '#f6efe0',
  stage: '#ffffff',
  cream: '#f0e8d6',
  title: '#2a211a',
  cardTitle: '#2a211a',
  desc: '#5a4f45',
  mediaBg: '#e4d8c2',
  infoBg: '#ffffff',
} as const;

// Georgia thiếu glyph một số ký tự VN xếp chồng dấu (ồ U+1ED3, ắ U+1EAF…) → tự
// ghép base + dấu rời làm dấu bị tách. Cambria/Times New Roman phủ đủ Vietnamese.
const SERIF = "Cambria, 'Times New Roman', Georgia, serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

interface Props {
  content: TheGrandServiceContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function TheGrandService({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(sectionRef);
  const isMobile = useContainerMobile(sectionRef);
  const [motionOff, setMotionOff] = React.useState(false);

  const items = resolveTheGrandServiceItems(content);

  // Flat = stack dọc, không sticky/scrub (mobile theo container HOẶC reduced-motion).
  const flat = isMobile || motionOff;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track || items.length === 0) return;
    // Mini-preview / editor canvas: không scrub.
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setMotionOff(true);
      return;
    }
    if (motionOff) setMotionOff(false);

    // Flat (container mobile): cuộn dọc tự nhiên, không scrub.
    if (flat) {
      gsap.set(track, { clearProps: 'transform' });
      return;
    }

    // Khoảng cần dịch track = phần track vượt quá khung nhìn (px).
    const move = () => track.scrollWidth - viewport.clientWidth;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -move(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    requestRefresh();

    return () => {
      ctx.revert();
    };
  }, [
    items.length,
    isCanvas,
    hasRoot,
    flat,
    motionOff,
    scroller,
    requestRefresh,
  ]);

  if (items.length === 0) return null;

  const rootStyle = composeStyle(
    { background: COLORS.section, color: COLORS.title },
    blockBackgroundStyle(background)
  );

  const heading = (
    <h2
      data-element-key='heading'
      className={selectableClass(
        activeKey === 'heading',
        'the-grand-service__heading pointer-events-auto'
      )}
      style={composeStyle(
        {
          margin: 0,
          fontFamily: SERIF,
          fontSize: RESPONSIVE.headingFont,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '0.04em',
          color: COLORS.title,
        },
        styleOf('heading')
      )}
    >
      {content.heading}
    </h2>
  );

  // Card: ảnh trái (cao) + khối info trắng phải (thấp hơn, đè một phần lên ảnh).
  const renderCard = (item: TheGrandServiceItem, i: number) => {
    const imageKey = `items[${i}].imageUrl`;
    const labelKey = `items[${i}].label`;
    const descKey = `items[${i}].description`;

    return (
      <article className='the-grand-service-card' key={i}>
        <div
          data-element-key={imageKey}
          role='img'
          aria-label={item.imageAlt ?? item.label}
          className={selectableClass(
            activeKey === imageKey,
            'the-grand-service-card-media pointer-events-auto'
          )}
          style={composeStyle(
            { backgroundImage: `url(${item.imageUrl})` },
            styleOf(imageKey)
          )}
        />

        <div className='the-grand-service-card-info'>
          <h3
            data-element-key={labelKey}
            className={selectableClass(
              activeKey === labelKey,
              'pointer-events-auto'
            )}
            style={composeStyle(
              {
                margin: `0 0 ${RESPONSIVE.cardTitleMb}`,
                fontFamily: SERIF,
                fontSize: RESPONSIVE.cardTitleFont,
                fontWeight: 500,
                lineHeight: 1.2,
                color: COLORS.cardTitle,
              },
              styleOf(labelKey)
            )}
          >
            {item.label}
          </h3>
          <p
            data-element-key={descKey}
            className={selectableClass(
              activeKey === descKey,
              'pointer-events-auto'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SANS,
                fontSize: RESPONSIVE.descFont,
                fontWeight: 400,
                lineHeight: 1.75,
                color: COLORS.desc,
              },
              styleOf(descKey)
            )}
          >
            {item.description}
          </p>
        </div>
      </article>
    );
  };

  // ── Editor canvas: lưới tất cả card + heading (không sticky / không scrub) ──
  if (isCanvas) {
    return (
      <section
        ref={sectionRef}
        data-canvas-edit='true'
        className={cn(
          'the-grand-service @container relative w-full',
          className
        )}
        style={composeStyle(rootStyle, { minHeight: 480 })}
      >
        <CanvasStyle />
        <div
          style={{
            padding: RESPONSIVE.asidePad,
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(20px, 3cqi, 40px)',
          }}
        >
          {heading}
          <div className='the-grand-service-canvas-grid'>
            {items.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </section>
    );
  }

  // ── Live: dải cream tiêu đề dọc ghim + track card trượt ngang đè lên ─────────
  return (
    <section
      ref={sectionRef}
      className={cn(
        'the-grand-service @container relative z-10 w-full',
        flat && 'the-grand-service--flat',
        className
      )}
      style={composeStyle(rootStyle, {
        height: flat ? 'auto' : `calc(100svh * ${items.length})`,
      })}
    >
      <LiveStyle />

      <div className='the-grand-service-sticky'>
        {/* Dải cream "Dịch Vụ" — nền cố định trái (z thấp), đứng yên */}
        <aside className='the-grand-service-aside'>{heading}</aside>

        {/* Track card phủ toàn stage, trượt ngang đè lên dải cream khi cuộn */}
        <div className='the-grand-service-viewport' ref={viewportRef}>
          <div className='the-grand-service-track' ref={trackRef}>
            {items.map((item, i) => renderCard(item, i))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Layout structural cho nhánh live (sticky + track ngang). Visual tokens inline. */
function LiveStyle() {
  return (
    <style>{`
      .the-grand-service-sticky {
        position: sticky;
        top: 0;
        height: 100svh;
        overflow: hidden;
        background: ${COLORS.stage};
      }
      .the-grand-service-aside {
        position: absolute;
        left: 0;
        top: 0;
        width: 40%;
        height: 100%;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: ${RESPONSIVE.asidePad};
        background: ${COLORS.cream};
      }
      .the-grand-service-aside .the-grand-service__heading {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        transform: rotate(180deg);
      }
      .the-grand-service-viewport {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 2;
      }
      .the-grand-service-track {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: max-content;
        height: 100%;
        gap: ${RESPONSIVE.trackGap};
        padding-left: ${RESPONSIVE.trackPadLeft};
        padding-right: ${RESPONSIVE.trackPadRight};
        will-change: transform;
      }
      .the-grand-service-card {
        flex: 0 0 auto;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .the-grand-service-card-media {
        flex: 0 0 auto;
        width: ${RESPONSIVE.mediaWidth};
        height: 74%;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
      }
      .the-grand-service-card-info {
        flex: 0 0 auto;
        align-self: center;
        width: ${RESPONSIVE.infoWidth};
        min-height: 54%;
        margin-left: clamp(-96px, -5cqi, -40px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: ${COLORS.infoBg};
        padding: ${RESPONSIVE.infoPad};
        box-shadow: 0 30px 60px -30px rgba(42, 33, 26, 0.28);
      }

      /* Flat (container mobile / reduced-motion): tắt sticky + scrub, stack dọc. */
      .the-grand-service--flat .the-grand-service-sticky {
        position: static;
        height: auto;
        overflow: visible;
        background: ${COLORS.section};
      }
      .the-grand-service--flat .the-grand-service-aside {
        position: static;
        width: auto;
        height: auto;
        padding: clamp(28px, 8cqi, 48px) clamp(20px, 6cqi, 32px) clamp(8px, 3cqi, 16px);
      }
      .the-grand-service--flat .the-grand-service-aside .the-grand-service__heading {
        writing-mode: horizontal-tb;
        transform: none;
      }
      .the-grand-service--flat .the-grand-service-viewport {
        position: static;
        overflow: visible;
      }
      .the-grand-service--flat .the-grand-service-track {
        transform: none !important;
        flex-direction: column;
        align-items: stretch;
        width: auto;
        height: auto;
        gap: clamp(28px, 9cqi, 48px);
        padding: 0 clamp(20px, 6cqi, 32px) clamp(40px, 12cqi, 72px);
      }
      .the-grand-service--flat .the-grand-service-card {
        height: auto;
        flex-direction: column;
        align-items: stretch;
      }
      .the-grand-service--flat .the-grand-service-card-media {
        width: 100%;
        height: auto;
        aspect-ratio: 4 / 3;
      }
      .the-grand-service--flat .the-grand-service-card-info {
        width: auto;
        min-height: 0;
        align-self: auto;
        margin-left: 0;
        margin-top: clamp(-40px, -10cqi, -24px);
        margin-right: clamp(16px, 5cqi, 28px);
      }
    `}</style>
  );
}

/** Layout cho nhánh canvas — lưới phẳng, mỗi card ảnh trên / info dưới. */
function CanvasStyle() {
  return (
    <style>{`
      .the-grand-service-canvas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: clamp(16px, 2.4cqi, 28px);
      }
      .the-grand-service-canvas-grid .the-grand-service-card {
        flex-direction: column;
        align-items: stretch;
      }
      .the-grand-service-canvas-grid .the-grand-service-card-media {
        width: 100%;
        aspect-ratio: 4 / 3;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
      }
      .the-grand-service-canvas-grid .the-grand-service-card-info {
        background: ${COLORS.infoBg};
        padding: clamp(16px, 2cqi, 28px);
        border-radius: 4px;
      }
    `}</style>
  );
}
