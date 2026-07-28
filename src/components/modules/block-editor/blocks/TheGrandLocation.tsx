'use client';

/**
 * The Grand · Location — section "Vị Trí Độc Tôn". Port từ apps/the-grand
 * Location.
 *
 * Motion (T3 — pin/sticky + scrub, R1–R6):
 * - useLandingMotion (scroller + requestRefresh + hasRoot) — KHÔNG data-motion,
 *   KHÔNG useBlockMotion (cần tlRef cho click-to-seek + onUpdate sync nav).
 * - Live desktop: CSS `position: sticky` viewport 100svh; cột phải `.track`
 *   scrub translateY theo tiến độ cuộn; item trái tương ứng active (sync DOM,
 *   không re-render). Click item trái → cuộn tới card đó.
 * - Editor canvas (`active-block-preview`): BlockPreview transform:scale gãy
 *   sticky → nhánh `isCanvas` render lưới phẳng tất cả card editable (pattern
 *   PnjVariant/ReadymagCaseSection).
 * - Flat (container mobile qua useContainerMobile, hoặc prefers-reduced-motion):
 *   stack dọc, tắt sticky/scrub — CSS `--flat` + guard trong effect.
 * - Mọi scrollTrigger dùng `scroller` + invalidateOnRefresh; requestRefresh sau
 *   build; KHÔNG new Lenis / registerPlugin trong block.
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TheGrandLocationContent,
  TheGrandLocationItem,
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
import { resolveTheGrandLocationItems } from './theGrandLocationContent';

const RESPONSIVE = {
  headingFont: 'clamp(30px, 3.4cqi, 52px)',
  headingMb: 'clamp(28px, 4cqi, 56px)',
  navGap: 'clamp(10px, 1.6cqi, 20px)',
  navFont: 'clamp(18px, 1.6cqi, 26px)',
  asidePad: 'clamp(32px, 5cqi, 88px)',
  cardTitleFont: 'clamp(18px, 1.5cqi, 24px)',
  cardTitleMb: 'clamp(12px, 1.4cqi, 20px)',
  descFont: 'clamp(12px, 0.95cqi, 15px)',
  statValueFont: 'clamp(38px, 4.4cqi, 72px)',
  statUnitFont: 'clamp(11px, 0.85cqi, 13px)',
} as const;

const COLORS = {
  bg: '#0f0b08',
  text: '#e8d9b5',
  muted: '#c9bca6',
  mediaBg: '#241812',
  infoBg: '#1a120c',
  line: '#8a7458',
} as const;

// Georgia thiếu glyph một số ký tự VN xếp chồng dấu (ồ U+1ED3, ắ U+1EAF…) → tự
// ghép base + dấu rời làm dấu bị tách. Cambria/Times New Roman phủ đủ Vietnamese.
const SERIF = "Cambria, 'Times New Roman', Georgia, serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

interface Props {
  content: TheGrandLocationContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function TheGrandLocation({
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
  const tweenRef = React.useRef<gsap.core.Tween | null>(null);
  const activeIndexRef = React.useRef(-1);
  // Reveal timeline mỗi card (desktop) — play khi active, reverse khi rời.
  const revealsRef = React.useRef<gsap.core.Timeline[]>([]);

  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(sectionRef);
  const isMobile = useContainerMobile(sectionRef);
  const [motionOff, setMotionOff] = React.useState(false);

  const items = resolveTheGrandLocationItems(content);

  // Flat = stack dọc, không sticky/scrub (mobile theo container HOẶC reduced-motion).
  const flat = isMobile || motionOff;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Sync active nav qua DOM (không setState mỗi frame cuộn) + play/reverse reveal
  // của card tương ứng (desktop). Reveal reverse khi card rời → đối xứng scrub.
  const syncActive = React.useCallback((root: HTMLElement, idx: number) => {
    if (idx === activeIndexRef.current) return;
    activeIndexRef.current = idx;
    root
      .querySelectorAll<HTMLElement>('.the-grand-location-nav-btn')
      .forEach((btn, i) => {
        const on = i === idx;
        btn.dataset.active = on ? 'true' : 'false';
        btn.setAttribute('aria-current', on ? 'true' : 'false');
      });
    revealsRef.current.forEach((tl, i) => {
      if (!tl) return;
      if (i === idx) tl.play();
      else tl.reverse();
    });
  }, []);

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

    const cards = gsap.utils.toArray<HTMLElement>(
      '.the-grand-location-card',
      track
    );

    // Reveal ảnh (Ken Burns 1.08→1) + text (fade-up stagger) của 1 card.
    const buildReveal = (card: HTMLElement, paused: boolean) => {
      const media = card.querySelector<HTMLElement>(
        '.the-grand-location-card-media'
      );
      const texts = card.querySelectorAll<HTMLElement>('.tgl-reveal');
      const tl = gsap.timeline({ paused });
      if (media) {
        tl.fromTo(
          media,
          { scale: 1.2 },
          { scale: 1, duration: 1, ease: 'power2.out' },
          0
        );
      }
      if (texts.length) {
        tl.fromTo(
          texts,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.08,
          },
          0.1
        );
      }
      return tl;
    };

    // Flat (container mobile): cuộn dọc tự nhiên → reveal in-view mỗi card.
    if (flat) {
      gsap.set(track, { clearProps: 'transform' });
      const ctx = gsap.context(() => {
        cards.forEach(card => {
          const tl = buildReveal(card, true);
          ScrollTrigger.create({
            trigger: card,
            scroller,
            start: 'top 80%',
            invalidateOnRefresh: true,
            onEnter: () => tl.play(),
            onLeaveBack: () => tl.reverse(),
          });
        });
      }, section);
      requestRefresh();
      return () => ctx.revert();
    }

    const move = () => track.scrollHeight - viewport.clientHeight;

    const idxFromProgress = (progress: number) => {
      const center = progress * move() + viewport.clientHeight / 2;
      let idx = 0;
      for (let i = 0; i < cards.length; i++) {
        if (center >= cards[i].offsetTop) idx = i;
      }
      return idx;
    };

    const ctx = gsap.context(() => {
      // fromTo (immediateRender) đặt sẵn trạng thái ẩn cho mọi card ngay khi build.
      revealsRef.current = cards.map(card => buildReveal(card, true));
      activeIndexRef.current = -1;
      syncActive(section, 0); // reveal card đầu

      tweenRef.current = gsap.to(track, {
        y: () => -move(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self => syncActive(section, idxFromProgress(self.progress)),
        },
      });
    }, section);

    requestRefresh();

    return () => {
      tweenRef.current = null;
      revealsRef.current = [];
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
    syncActive,
  ]);

  const goTo = (i: number) => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    syncActive(section, i);

    const card = track.children[i] as HTMLElement | undefined;
    if (!card) return;

    // Flat: cuộn thẳng tới card.
    if (flat) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Desktop: quy đổi offset card → vị trí cuộn của scroller (element hoặc window).
    const move = track.scrollHeight - viewport.clientHeight;
    const ratio = move > 0 ? Math.min(1, card.offsetTop / move) : 0;
    const trigger = tweenRef.current?.scrollTrigger;
    if (trigger) {
      const top = trigger.start + (trigger.end - trigger.start) * ratio;
      const scrollerEl = scroller as HTMLElement | undefined;
      if (scrollerEl && 'scrollTo' in scrollerEl) {
        scrollerEl.scrollTo({ top, behavior: 'smooth' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  if (items.length === 0) return null;

  const rootStyle = composeStyle(
    { background: COLORS.bg, color: COLORS.text },
    blockBackgroundStyle(background)
  );

  const heading = (
    <h2
      data-element-key='heading'
      className={selectableClass(
        activeKey === 'heading',
        'the-grand-location__heading pointer-events-auto'
      )}
      style={composeStyle(
        {
          margin: 0,
          fontFamily: SERIF,
          fontSize: RESPONSIVE.headingFont,
          fontWeight: 500,
          lineHeight: 1.15,
          letterSpacing: '0.005em',
          color: COLORS.text,
        },
        styleOf('heading')
      )}
    >
      {content.heading}
    </h2>
  );

  // Card phải (60% ảnh / 40% info) — dùng chung cho live track + canvas grid.
  // `stacked`: canvas cột hẹp → số + đơn vị xuống dưới mô tả (flex column).
  const renderCard = (
    item: TheGrandLocationItem,
    i: number,
    stacked = false
  ) => {
    const imageKey = `items[${i}].imageUrl`;
    const labelKey = `items[${i}].label`;
    const descKey = `items[${i}].description`;
    const statValueKey = `items[${i}].statValue`;
    const statUnitKey = `items[${i}].statUnit`;

    return (
      <article className='the-grand-location-card' key={i}>
        <div className='the-grand-location-card-inner'>
          <div
            data-element-key={imageKey}
            role='img'
            aria-label={item.imageAlt ?? item.label}
            className={selectableClass(
              activeKey === imageKey,
              'the-grand-location-card-media pointer-events-auto'
            )}
            style={composeStyle(
              { backgroundImage: `url(${item.imageUrl})` },
              styleOf(imageKey)
            )}
          />

          <div className='the-grand-location-card-info'>
            <div style={{ width: '100%', minWidth: 0 }}>
              <h3
                data-element-key={labelKey}
                className={selectableClass(
                  activeKey === labelKey,
                  'tgl-reveal pointer-events-auto'
                )}
                style={composeStyle(
                  {
                    margin: `0 0 ${RESPONSIVE.cardTitleMb}`,
                    fontFamily: SERIF,
                    fontSize: RESPONSIVE.cardTitleFont,
                    fontWeight: 500,
                    color: COLORS.text,
                  },
                  styleOf(labelKey)
                )}
              >
                {item.label}
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: stacked ? 'column' : 'row',
                  alignItems: stacked ? 'flex-start' : undefined,
                  width: '100%',
                  justifyContent: stacked ? 'flex-start' : 'space-between',
                  gap: stacked ? 'clamp(12px, 2cqi, 20px)' : 16,
                }}
              >
                <p
                  data-element-key={descKey}
                  className={selectableClass(
                    activeKey === descKey,
                    'tgl-reveal pointer-events-auto'
                  )}
                  style={composeStyle(
                    {
                      flex: stacked ? '0 0 auto' : '0 0 80%',
                      width: stacked ? '100%' : undefined,
                      minWidth: 0,
                      margin: 0,
                      fontFamily: SANS,
                      fontSize: RESPONSIVE.descFont,
                      fontWeight: 400,
                      lineHeight: 1.7,
                      color: COLORS.muted,
                    },
                    styleOf(descKey)
                  )}
                >
                  {item.description}
                </p>

                {(item.statValue || item.statUnit) && (
                  <div
                    className='tgl-reveal'
                    style={{
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      data-element-key={statValueKey}
                      className={selectableClass(
                        activeKey === statValueKey,
                        'pointer-events-auto'
                      )}
                      style={composeStyle(
                        {
                          fontFamily: SERIF,
                          fontSize: RESPONSIVE.statValueFont,
                          fontWeight: 400,
                          lineHeight: 1,
                          textAlign: 'left',
                          color: COLORS.text,
                          whiteSpace: 'nowrap',
                        },
                        styleOf(statValueKey)
                      )}
                    >
                      {item.statValue}
                    </span>
                    <div
                      style={{
                        position: 'relative',
                        alignSelf: stacked ? 'flex-start' : 'flex-end',
                        marginTop: 'clamp(14px, 1.8cqi, 22px)',
                      }}
                    >
                      <span
                        aria-hidden='true'
                        style={{
                          position: 'absolute',
                          left: 'clamp(-12px, -1cqi, -8px)',
                          top: 0,
                          width: 'clamp(20px, 2cqi, 36px)',
                          height: 1,
                          background: COLORS.line,
                          transform: 'rotate(-24deg)',
                          transformOrigin: 'left center',
                        }}
                      />
                      <span
                        data-element-key={statUnitKey}
                        className={selectableClass(
                          activeKey === statUnitKey,
                          'pointer-events-auto'
                        )}
                        style={composeStyle(
                          {
                            fontFamily: SANS,
                            fontSize: RESPONSIVE.statUnitFont,
                            color: COLORS.muted,
                            whiteSpace: 'nowrap',
                          },
                          styleOf(statUnitKey)
                        )}
                      >
                        {item.statUnit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          'the-grand-location @container relative w-full',
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
          <div className='the-grand-location-canvas-grid'>
            {items.map((item, i) => renderCard(item, i, true))}
          </div>
        </div>
      </section>
    );
  }

  // ── Live: aside trái ghim + cột phải sticky trượt qua từng card ──────────────
  return (
    <section
      ref={sectionRef}
      className={cn(
        'the-grand-location @container relative z-10 w-full',
        flat && 'the-grand-location--flat',
        className
      )}
      style={composeStyle(rootStyle, {
        height: flat ? 'auto' : `calc(100svh * ${items.length})`,
      })}
    >
      <LiveStyle />

      <div className='the-grand-location-sticky'>
        {/* TRÁI — heading + danh sách địa điểm (đứng yên trong sticky) */}
        <aside className='the-grand-location-aside'>
          {heading}
          <nav
            aria-label={content.heading}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: RESPONSIVE.navGap,
              marginTop: RESPONSIVE.headingMb,
            }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                type='button'
                onClick={() => goTo(i)}
                data-active={i === 0 ? 'true' : 'false'}
                aria-current={i === 0 ? 'true' : undefined}
                className='the-grand-location-nav-btn'
                style={{
                  fontFamily: SERIF,
                  fontSize: RESPONSIVE.navFont,
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* PHẢI — khung nhìn, track trượt qua từng card */}
        <div className='the-grand-location-viewport' ref={viewportRef}>
          <div className='the-grand-location-track' ref={trackRef}>
            {items.map((item, i) => renderCard(item, i, false))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Layout structural cho nhánh live (sticky + track). Visual tokens ở inline. */
function LiveStyle() {
  return (
    <style>{`
      .the-grand-location-sticky {
        position: sticky;
        top: 0;
        height: 100svh;
        display: flex;
        align-items: stretch;
      }
      .the-grand-location-aside {
        flex: 0 0 40%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: ${RESPONSIVE.asidePad};
      }
      .the-grand-location-viewport {
        flex: 0 0 60%;
        height: 100%;
        overflow: hidden;
      }
      .the-grand-location-track {
        display: flex;
        flex-direction: column;
        will-change: transform;
      }
      .the-grand-location-card {
        flex: 0 0 auto;
        height: 100svh;
        padding: clamp(16px, 3.2cqi, 52px) clamp(16px, 2.6cqi, 56px) clamp(16px, 3.2cqi, 52px) 0;
      }
      .the-grand-location-card-inner {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .the-grand-location-card-media {
        flex: 0 0 60%;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
      }
      .the-grand-location-card-info {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        background: ${COLORS.infoBg};
        padding: clamp(20px, 2.2cqi, 44px);
      }
      .the-grand-location-nav-btn {
        appearance: none;
        background: transparent;
        border: 0;
        padding: 4px 0;
        text-align: left;
        cursor: pointer;
        line-height: 1.3;
        font-weight: 400;
        color: ${COLORS.muted};
        opacity: 0.5;
        transition: color 0.4s ease, opacity 0.4s ease, font-weight 0.4s ease;
      }
      .the-grand-location-nav-btn[data-active='true'] {
        color: ${COLORS.text};
        opacity: 1;
        font-weight: 600;
      }

      /* Flat (container mobile / reduced-motion): tắt sticky + scrub, stack dọc. */
      .the-grand-location--flat .the-grand-location-sticky {
        position: static;
        height: auto;
        display: block;
      }
      .the-grand-location--flat .the-grand-location-aside {
        flex: none;
        padding: clamp(28px, 8cqi, 48px) clamp(20px, 6cqi, 32px) clamp(8px, 3cqi, 16px);
      }
      .the-grand-location--flat .the-grand-location-viewport {
        flex: none;
        height: auto;
        overflow: visible;
      }
      .the-grand-location--flat .the-grand-location-track {
        transform: none !important;
        gap: clamp(20px, 6cqi, 32px);
        padding: 0 clamp(20px, 6cqi, 32px) clamp(40px, 12cqi, 72px);
      }
      .the-grand-location--flat .the-grand-location-card {
        height: auto;
        padding: 0;
      }
      .the-grand-location--flat .the-grand-location-card-media {
        flex: none;
        aspect-ratio: 16 / 10;
      }
      .the-grand-location--flat .the-grand-location-card-info {
        flex: none;
      }
    `}</style>
  );
}

/** Layout cho nhánh canvas — lưới phẳng, mỗi card có tỉ lệ ảnh riêng. */
function CanvasStyle() {
  return (
    <style>{`
      .the-grand-location-canvas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: clamp(16px, 2.4cqi, 28px);
      }
      .the-grand-location-canvas-grid .the-grand-location-card {
        padding: 0;
      }
      .the-grand-location-canvas-grid .the-grand-location-card-inner {
        height: auto;
        border-radius: 4px;
      }
      .the-grand-location-canvas-grid .the-grand-location-card-media {
        aspect-ratio: 16 / 10;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
      }
      .the-grand-location-canvas-grid .the-grand-location-card-info {
        display: flex;
        align-items: center;
        background: ${COLORS.infoBg};
        padding: clamp(16px, 2cqi, 28px);
      }
    `}</style>
  );
}
