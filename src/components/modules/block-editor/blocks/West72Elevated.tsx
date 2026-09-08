'use client';

/**
 * 212 West 72nd · Elevated Living — 2 cột: ảnh nội thất + intro bên trái,
 * tranh treo + trích dẫn + rule dọc bên phải.
 * Port từ apps/212-west ElevatedLiving.tsx.
 *
 * Motion (giữ nguyên timing app, 2 beat nối tiếp):
 * - beat1: 3 slat dọc trượt khỏi ảnh trái (∓100%), intro trượt vào (x), ảnh nền
 *   xoay −30°/scale 1.3 → 0/1
 * - beat2: 3 band ngang co (scaleX 0) lộ tranh, tranh xoay −10° → 0, rule dọc
 *   vẽ (scaleY 0→1), nhóm `reveal` hiện (autoAlpha)
 * - Replay: vào khung → play; cuộn lên qua start → reverse; ra hẳn phía trên →
 *   reset (khớp `createReplayTrigger` của app).
 *
 * - Geometry desktop (absolute % theo chiều cao cột phải) nằm trong style block
 *   scoped `@container` — chỉ structure, KHÔNG token của element sửa được.
 * - Editor canvas: cùng layout production nhưng bỏ slat/band (chúng che ảnh khi
 *   không có animation) và không set trạng thái ẩn → mọi field chọn được.
 * - `useLayoutEffect` để gsap.set chạy TRƯỚC paint (như app) — không nháy.
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
  West72ElevatedContent,
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
  WEST72_BLACK,
  WEST72_BROWN,
  WEST72_FONT_CSS,
  WEST72_FONT_DISPLAY,
  WEST72_WHITE,
} from './west72Theme';

/** Khớp Tailwind `@4xl:` container (896px) — nhánh 2 cột full height. */
const DESKTOP_BREAKPOINT = 896;

// ── Timing / hằng số giữ nguyên từ app ──
const BEAT_DURATION = 1.4;
const BEAT_EASE = 'power3.out';
const INTRO_SHIFT = 64;
const INTRO_DESIGN_WIDTH = 732;
const BG_ROTATION = -30;
const BG_SCALE = 1.3;
const ARTWORK_ROTATION = -10;

const SLATS = [
  { key: 'a', left: '-1px', width: 'calc(33.333% + 2px)', out: -100 },
  {
    key: 'b',
    left: 'calc(33.333% - 1px)',
    width: 'calc(33.333% + 2px)',
    out: 100,
  },
  {
    key: 'c',
    left: 'calc(66.667% - 1px)',
    width: 'calc(33.333% + 2px)',
    out: -100,
  },
] as const;

const BANDS = [
  { key: 'a', top: '-1px', origin: 'right' },
  { key: 'b', top: 'calc(32.4% - 1px)', origin: 'left' },
  { key: 'c', top: 'calc(64.8% - 1px)', origin: 'right' },
] as const;

const RESPONSIVE = {
  badgeFont: 'clamp(12px, 0.97cqi, 14px)',
  headingFont: 'clamp(34px, 4.17cqi, 60px)',
  bodyFont: 'clamp(16px, 1.25cqi, 18px)',
  quoteFont: 'clamp(18px, 1.67cqi, 24px)',
  // `cqw` chứ KHÔNG `cqi` — chữ dọc, xem ghi chú ở West72Hero.verticalFont.
  // App: 9px → md 10 → xl 12.
  labelFont: 'clamp(9px, 0.94cqw, 12px)',
} as const;

/**
 * Structure-only: hình học desktop dùng `%` theo cột phải (không đổi được từ
 * toolbar) + calc có dấu cách đúng chuẩn CSS. Class đều prefix `west72-elevated`.
 */
const BLOCK_CSS = `
.west72-elevated-panel {
  display: flex;
  width: 100%;
  flex-direction: column;
}
.west72-elevated-frame {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.west72-elevated-intro {
  position: relative;
  padding: 56px 24px 64px;
}
.west72-elevated-right {
  position: relative;
  width: 100%;
  padding-bottom: 64px;
}
.west72-elevated-art {
  position: relative;
  margin: 48px 44px 0;
  aspect-ratio: 466 / 449;
  overflow: hidden;
}
.west72-elevated-quote {
  position: relative;
  margin: 40px 44px 0 24px;
  padding: 0 0 40px 24px;
}
.west72-elevated-qrule {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
  transform-origin: bottom;
}
.west72-elevated-vrule {
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 24px;
  bottom: 64px;
  display: flex;
  width: 1px;
  flex-direction: column;
  align-items: center;
}
.west72-elevated-hrule {
  pointer-events: none;
  position: absolute;
  right: 24px;
  bottom: 64px;
  left: 24px;
  height: 1px;
  transform-origin: right;
}

@container (min-width: 672px) {
  .west72-elevated-art,
  .west72-elevated-quote {
    margin-left: auto;
    margin-right: auto;
    width: min(65.82%, 466px);
  }
  .west72-elevated-quote { padding-left: 0; }
  .west72-elevated-qrule { left: -48px; }
  .west72-elevated-vrule { right: calc(50% - min(32.91%, 233px) - 48px); }
  .west72-elevated-hrule {
    right: calc(50% - min(32.91%, 233px) - 48px);
    left: calc(50% - min(32.91%, 233px) - 48px);
  }
}

@container (min-width: 896px) {
  .west72-elevated-panel {
    flex-direction: row;
    height: 100svh;
  }
  .west72-elevated-panel[data-canvas-edit='true'] {
    height: clamp(560px, 62cqi, 900px);
  }
  .west72-elevated-frame {
    height: 100%;
    width: 50.833%;
    flex-shrink: 0;
  }
  .west72-elevated-intro {
    padding-top: 86px;
    padding-bottom: 0;
  }
  .west72-elevated-copy {
    width: 211px;
    max-width: none;
  }
  .west72-elevated-right {
    height: 100%;
    flex: 1 1 0%;
    padding-bottom: 0;
  }
  .west72-elevated-art {
    position: absolute;
    top: 7.28%;
    left: calc(50% - min(32.91%, 233px));
    margin: 0;
    height: 53.45%;
    width: min(65.82%, 466px);
    aspect-ratio: auto;
  }
  .west72-elevated-quote {
    position: absolute;
    top: 60.73%;
    bottom: 7.28%;
    left: calc(50% - min(32.91%, 233px));
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0;
    width: min(63.28%, 444px);
    padding: 0;
  }
  .west72-elevated-qrule { left: -64px; }
  .west72-elevated-vrule {
    right: calc(50% - min(32.91%, 233px) - 64px);
    bottom: 7.28%;
  }
  .west72-elevated-hrule {
    right: calc(50% - min(32.91%, 233px) - 64px);
    left: calc(50% - min(32.91%, 233px) - 64px);
    bottom: 7.28%;
  }
}
`;

interface Props {
  content: West72ElevatedContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function West72Elevated({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isStacked = useContainerMobile(rootRef, DESKTOP_BREAKPOINT);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const badgeLabel = content.badgeLabel?.trim() || '';
  const title = content.title?.trim() || '';
  const bodyText = content.bodyText?.trim() || '';
  const quote = content.quote?.trim() || '';
  const verticalLabel = content.verticalLabel?.trim() || '';
  const bgImageUrl =
    content.bgImageUrl?.trim() || '/212-west/background-elevated-living.png';
  const bgImageAlt = content.bgImageAlt?.trim() || '';
  const artworkImageUrl =
    content.artworkImageUrl?.trim() || '/212-west/picture.png';
  const artworkImageAlt = content.artworkImageAlt?.trim() || '';

  // ── Motion ───────────────────────────────────────────────────────────────
  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const root = rootRef.current;
    if (!root) return;

    // Gate: đợi đo container khớp nhánh đang render (tránh build với `factor`
    // của tier sai rồi ResizeObserver flip).
    const width = root.clientWidth;
    if (width === 0) return;
    if (width < DESKTOP_BREAKPOINT !== isStacked) return;

    const frame = root.querySelector<HTMLElement>('[data-frame]');
    const ruleDraw = root.querySelector<HTMLElement>('[data-rule-draw]');
    const bgImage = root.querySelector<HTMLElement>('[data-bg-image]');
    const artworkImage = root.querySelector<HTMLElement>(
      '[data-artwork-image]'
    );
    const slats = gsap.utils.toArray<HTMLElement>('[data-slat]', root);
    const intro = gsap.utils.toArray<HTMLElement>('[data-intro]', root);
    const bands = gsap.utils.toArray<HTMLElement>('[data-band]', root);
    const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
    if (!frame || !ruleDraw || !bgImage || !artworkImage) return;
    if (slats.length !== 3 || intro.length !== 3 || bands.length !== 3) return;

    const st = scroller ?? undefined;
    const duration = reduceMotion ? 0 : BEAT_DURATION;
    const factor = frame.offsetWidth / INTRO_DESIGN_WIDTH;

    const ctx = gsap.context(() => {
      gsap.set(intro, { x: -INTRO_SHIFT * factor });
      gsap.set(bgImage, {
        rotate: BG_ROTATION,
        scale: BG_SCALE,
        transformOrigin: 'center',
      });
      gsap.set(artworkImage, {
        rotate: ARTWORK_ROTATION,
        transformOrigin: 'center',
      });
      gsap.set(ruleDraw, { scaleY: 0 });
      gsap.set(reveal, { autoAlpha: 0 });

      const beat1 = gsap
        .timeline({ defaults: { duration, ease: BEAT_EASE } })
        .to(slats[0], { yPercent: SLATS[0].out }, 0)
        .to(slats[1], { yPercent: SLATS[1].out }, 0)
        .to(slats[2], { yPercent: SLATS[2].out }, 0)
        .to(intro, { x: 0 }, 0)
        .to(bgImage, { rotate: 0, scale: 1 }, 0);

      const beat2 = gsap
        .timeline({ defaults: { duration, ease: BEAT_EASE } })
        .to(bands, { scaleX: 0 }, 0)
        .to(artworkImage, { rotate: 0 }, 0)
        .to(ruleDraw, { scaleY: 1 }, 0)
        .to(reveal, { autoAlpha: 1 }, 0);

      const master = gsap.timeline({ paused: true }).add(beat1).add(beat2, '>');

      ScrollTrigger.create({
        trigger: root,
        scroller: st,
        start: isStacked ? 'top 70%' : 'top 20%',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onEnter: () => master.play(),
        onEnterBack: () => master.play(),
        onLeave: () => master.pause(0),
        onLeaveBack: () => master.reverse(),
      });
    }, root);

    requestRefresh();
    return () => ctx.revert();
  }, [isCanvas, isStacked, scroller, requestRefresh, reduceMotion]);

  const ruleColor = { backgroundColor: WEST72_BROWN };

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn(
        'west72-elevated @container relative w-full overflow-hidden',
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
        className='west72-elevated-panel'
        data-canvas-edit={isCanvas ? 'true' : undefined}
      >
        {/* ── Cột trái: ảnh nội thất + intro ───────────────────────────── */}
        <div data-frame className='west72-elevated-frame'>
          <div className='absolute inset-0'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-bg-image
              data-element-key='bgImageUrl'
              src={bgImageUrl}
              alt={bgImageAlt}
              onLoad={() => requestRefresh()}
              className={selectableClass(
                activeKey === 'bgImageUrl',
                'h-full w-full will-change-transform'
              )}
              style={composeStyle(
                { objectFit: 'cover', objectPosition: 'left center' },
                styleOf('bgImageUrl')
              )}
            />
          </div>
          <span
            data-element-key='bgImageAlt'
            className={selectableClass(activeKey === 'bgImageAlt', 'sr-only')}
            style={styleOf('bgImageAlt')}
          >
            {bgImageAlt}
          </span>

          {!isCanvas &&
            SLATS.map(slat => (
              <div
                key={slat.key}
                data-slat
                className='pointer-events-none absolute -inset-y-px z-10 will-change-transform'
                style={{
                  left: slat.left,
                  width: slat.width,
                  backgroundColor: WEST72_WHITE,
                }}
              />
            ))}

          <div className='west72-elevated-intro'>
            <span
              data-intro
              data-element-key='badgeLabel'
              className={selectableClass(
                activeKey === 'badgeLabel',
                'inline-flex w-fit items-center'
              )}
              style={composeStyle(
                {
                  backgroundColor: WEST72_BROWN,
                  padding: 12,
                  fontFamily: WEST72_FONT_DISPLAY,
                  fontSize: RESPONSIVE.badgeFont,
                  lineHeight: 1,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  color: WEST72_WHITE,
                },
                styleOf('badgeLabel')
              )}
            >
              {badgeLabel}
            </span>

            <h2
              data-intro
              data-element-key='title'
              className={selectableClass(activeKey === 'title', 'm-0')}
              style={composeStyle(
                {
                  marginTop: 12,
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

            <p
              data-intro
              data-element-key='bodyText'
              className={selectableClass(
                activeKey === 'bodyText',
                'west72-elevated-copy m-0 max-w-1/2 @2xl:max-w-1/4'
              )}
              style={composeStyle(
                {
                  marginTop: 19,
                  fontFamily: WEST72_FONT_DISPLAY,
                  fontSize: RESPONSIVE.bodyFont,
                  lineHeight: 1.56,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: WEST72_BLACK,
                },
                styleOf('bodyText')
              )}
            >
              {bodyText}
            </p>
          </div>
        </div>

        {/* ── Cột phải: tranh + trích dẫn + rule ───────────────────────── */}
        <div className='west72-elevated-right'>
          <div>
            <div
              className='west72-elevated-art'
              style={{ backgroundColor: 'rgba(15, 15, 14, 0.05)' }}
            >
              <div
                className='absolute'
                style={{
                  top: '-4.65%',
                  left: '-20.77%',
                  height: '109.6%',
                  width: '139.03%',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-artwork-image
                  data-element-key='artworkImageUrl'
                  src={artworkImageUrl}
                  alt={artworkImageAlt}
                  onLoad={() => requestRefresh()}
                  className={selectableClass(
                    activeKey === 'artworkImageUrl',
                    'h-full w-full will-change-transform'
                  )}
                  style={composeStyle(
                    { objectFit: 'cover' },
                    styleOf('artworkImageUrl')
                  )}
                />
              </div>

              {!isCanvas &&
                BANDS.map(band => (
                  <div
                    key={band.key}
                    data-band
                    className='pointer-events-none absolute -inset-x-px will-change-transform'
                    style={{
                      top: band.top,
                      height: 'calc(35.2% + 2px)',
                      transformOrigin: band.origin,
                      backgroundColor: WEST72_WHITE,
                    }}
                  />
                ))}
            </div>
            <span
              data-element-key='artworkImageAlt'
              className={selectableClass(
                activeKey === 'artworkImageAlt',
                'sr-only'
              )}
              style={styleOf('artworkImageAlt')}
            >
              {artworkImageAlt}
            </span>

            <div className='west72-elevated-quote'>
              <span
                data-reveal
                aria-hidden='true'
                className='west72-elevated-qrule pointer-events-none'
                style={ruleColor}
              />

              <p
                data-reveal
                data-element-key='quote'
                className={selectableClass(activeKey === 'quote', 'm-0')}
                style={composeStyle(
                  {
                    fontFamily: WEST72_FONT_DISPLAY,
                    fontSize: RESPONSIVE.quoteFont,
                    lineHeight: 1.33,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    color: WEST72_BLACK,
                  },
                  styleOf('quote')
                )}
              >
                {quote}
              </p>
            </div>
          </div>

          <div className='west72-elevated-vrule'>
            <span
              data-rule-draw
              aria-hidden='true'
              style={{
                flex: '370 1 0%',
                width: 1,
                transformOrigin: 'top',
                ...ruleColor,
              }}
            />

            <span
              data-reveal
              data-element-key='verticalLabel'
              className={selectableClass(
                activeKey === 'verticalLabel',
                'pointer-events-auto whitespace-nowrap'
              )}
              style={composeStyle(
                {
                  marginTop: 16,
                  marginBottom: 16,
                  writingMode: 'vertical-rl',
                  fontFamily: WEST72_FONT_DISPLAY,
                  fontSize: RESPONSIVE.labelFont,
                  lineHeight: 1.33,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: WEST72_BROWN,
                },
                styleOf('verticalLabel')
              )}
            >
              {verticalLabel}
            </span>

            <span
              data-reveal
              aria-hidden='true'
              style={{
                flex: '251 1 0%',
                width: 1,
                transformOrigin: 'bottom',
                ...ruleColor,
              }}
            />
          </div>

          <span
            data-reveal
            aria-hidden='true'
            className='west72-elevated-hrule'
            style={ruleColor}
          />
        </div>
      </div>
    </section>
  );
}
