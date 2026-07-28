'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TheGrandDiscoverContent,
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
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useContainerMobile } from './useContainerMobile';
import { resolveTheGrandDiscoverItems } from './theGrandDiscoverContent';

const RESPONSIVE = {
  headingFont: 'clamp(28px, 3.4cqi, 52px)',
  descFont: 'clamp(13px, 1.2cqi, 16px)',
  descMt: 'clamp(16px, 2cqi, 28px)',
  headerPadY: 'clamp(48px, 7cqi, 96px)',
  headerPadX: 'clamp(20px, 6cqi, 64px)',
  captionFont: 'clamp(11px, 0.95cqi, 14px)',
  navFont: 'clamp(12px, 1cqi, 15px)',
  navGap: 'clamp(8px, 1.4cqi, 16px)',
} as const;

const COLORS = {
  section:
    'radial-gradient(120% 90% at 50% 0%, #3a2e28 0%, #241b16 45%, #140f0c 100%)',
  text: '#e8d9b5',
  muted: '#c9bca6',
  line: '#8a7458',
  mediaBg: '#241812',
} as const;

const SERIF = "Cambria, 'Times New Roman', Georgia, serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

const RECT = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const SLANT = 'polygon(12% 0%, 100% 5%, 100% 100%, 0% 100%)';
const FRONT = {
  xPercent: 0,
  yPercent: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
  filter: 'brightness(1)',
  clipPath: RECT,
} as const;
const GHOST = {
  xPercent: -50,
  yPercent: -26,
  scaleX: 0.64,
  scaleY: 0.84,
  rotation: -4,
  opacity: 1,
  filter: 'brightness(0.6)',
  clipPath: SLANT,
} as const;
const WAITING = { opacity: 0, scaleX: 1.06, scaleY: 1.06 } as const;
const GONE = {
  opacity: 0,
  xPercent: -110,
  scaleX: 0.4,
  scaleY: 0.4,
} as const;

interface Props {
  content: TheGrandDiscoverContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function TheGrandDiscover({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const activeIndexRef = React.useRef(-1);

  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(sectionRef);
  const isMobile = useContainerMobile(sectionRef);
  const [motionOff, setMotionOff] = React.useState(false);

  const items = resolveTheGrandDiscoverItems(content);

  // Flat = stack dọc, không sticky/scrub (mobile theo container HOẶC reduced-motion).
  const flat = isMobile || motionOff;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useMotionAttributes(sectionRef, [isCanvas, flat, items.length]);

  const labels = items.map(it => it.label);
  const labelsKey = labels.join('|');

  const syncActiveDom = React.useCallback(
    (root: HTMLElement, idx: number) => {
      if (idx === activeIndexRef.current) return;
      activeIndexRef.current = idx;

      root
        .querySelectorAll<HTMLElement>('.the-grand-discover-nav-btn')
        .forEach((btn, i) => {
          const on = i === idx;
          btn.dataset.active = on ? 'true' : 'false';
          btn.setAttribute('aria-current', on ? 'true' : 'false');
        });

      root
        .querySelectorAll<HTMLElement>('.the-grand-discover-layer')
        .forEach((layer, i) => {
          layer.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
        });

      const caption = root.querySelector<HTMLElement>(
        '.the-grand-discover-caption'
      );
      if (caption) caption.textContent = labels[idx] ?? '';
    },
    // labelsKey giữ callback ổn định khi nội dung label không đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [labelsKey]
  );

  React.useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || items.length === 0) return;
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setMotionOff(true);
      return;
    }
    if (motionOff) setMotionOff(false);

    const layers = gsap.utils.toArray<HTMLElement>(
      '.the-grand-discover-layer',
      stage
    );
    if (layers.length === 0) return;

    if (flat) {
      gsap.set(layers, {
        clearProps: 'transform,opacity,filter,clipPath',
      });
      return;
    }

    activeIndexRef.current = -1;
    syncActiveDom(section, 0);

    const n = layers.length;

    const ctx = gsap.context(() => {
      gsap.set(layers, { ...FRONT });
      layers.forEach((el, i) => {
        if (i > 0) gsap.set(el, { ...FRONT, ...WAITING });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self =>
            syncActiveDom(section, Math.round(self.progress * (n - 1))),
        },
      });

      for (let i = 0; i < n - 1; i++) {
        // Ảnh đang active lùi ra sau-trái (scale nhỏ + nghiêng).
        tl.to(layers[i], { ...GHOST, ease: 'none' }, i);
        // Ảnh kế trượt/hiện vào giữa.
        tl.to(layers[i + 1], { ...FRONT, ease: 'none' }, i);
        // Ghost cũ rời đi để luôn đúng 2 ảnh.
        if (i > 0) tl.to(layers[i - 1], { ...GONE, ease: 'none' }, i);
      }

      tlRef.current = tl;
    }, section);

    requestRefresh();

    return () => {
      tlRef.current = null;
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
    syncActiveDom,
  ]);

  const goTo = (i: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    syncActiveDom(section, i);

    // Flat: cuộn thẳng tới lớp ảnh tương ứng.
    if (flat) {
      const layer = stage.children[i] as HTMLElement | undefined;
      layer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Desktop: quy đổi index → vị trí cuộn của scroller (element hoặc window).
    const n = items.length;
    const ratio = n > 1 ? i / (n - 1) : 0;
    const trigger = tlRef.current?.scrollTrigger;
    if (!trigger) return;

    const top = trigger.start + (trigger.end - trigger.start) * ratio;
    const scrollerEl = scroller as HTMLElement | undefined;
    if (scrollerEl && 'scrollTo' in scrollerEl) {
      scrollerEl.scrollTo({ top, behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  const rootStyle = composeStyle(
    { background: COLORS.section, color: COLORS.text },
    blockBackgroundStyle(background)
  );

  const headingStyle = composeStyle(
    {
      margin: 0,
      fontFamily: SERIF,
      fontSize: RESPONSIVE.headingFont,
      fontWeight: 500,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      color: COLORS.text,
    },
    styleOf('heading')
  );

  const descStyle = composeStyle(
    {
      margin: 0,
      maxWidth: 620,
      fontFamily: SANS,
      fontSize: RESPONSIVE.descFont,
      fontWeight: 400,
      lineHeight: 1.7,
      color: COLORS.muted,
    },
    styleOf('description')
  );

  // ── Editor canvas: lưới phẳng heading + mô tả + backdrop + tất cả ảnh ────────
  if (isCanvas) {
    return (
      <section
        ref={sectionRef}
        data-canvas-edit='true'
        className={cn(
          'the-grand-discover @container relative w-full',
          className
        )}
        style={composeStyle(rootStyle, { minHeight: 480 })}
      >
        <CanvasStyle />
        <div
          style={{
            padding: `${RESPONSIVE.headerPadY} ${RESPONSIVE.headerPadX}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(20px, 3cqi, 40px)',
          }}
        >
          <h2
            data-element-key='heading'
            className={selectableClass(
              activeKey === 'heading',
              'pointer-events-auto'
            )}
            style={headingStyle}
          >
            {content.heading}
          </h2>

          <p
            data-element-key='description'
            className={selectableClass(
              activeKey === 'description',
              'pointer-events-auto'
            )}
            style={descStyle}
          >
            {content.description}
          </p>

          {/* Ảnh nền mờ decorative — chỉ selectable ở canvas (live là trang trí). */}
          <div className='the-grand-discover-canvas-backdrop-row'>
            <span
              style={{
                fontFamily: SANS,
                fontSize: RESPONSIVE.captionFont,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: COLORS.muted,
              }}
            >
              Ảnh nền
            </span>
            <div
              data-element-key='backdropImage'
              role='img'
              aria-label='Ảnh nền mờ decorative'
              className={selectableClass(
                activeKey === 'backdropImage',
                'the-grand-discover-canvas-backdrop pointer-events-auto'
              )}
              style={composeStyle(
                content.backdropImage
                  ? { backgroundImage: `url(${content.backdropImage})` }
                  : { border: `1px dashed ${COLORS.line}` },
                styleOf('backdropImage')
              )}
            />
          </div>

          <div className='the-grand-discover-canvas-grid'>
            {items.map((item, i) => {
              const imageKey = `items[${i}].imageUrl`;
              const labelKey = `items[${i}].label`;
              return (
                <article className='the-grand-discover-canvas-card' key={i}>
                  <div
                    data-element-key={imageKey}
                    role='img'
                    aria-label={item.imageAlt ?? item.label}
                    className={selectableClass(
                      activeKey === imageKey,
                      'the-grand-discover-canvas-media pointer-events-auto'
                    )}
                    style={composeStyle(
                      { backgroundImage: `url(${item.imageUrl})` },
                      styleOf(imageKey)
                    )}
                  />
                  <span
                    data-element-key={labelKey}
                    className={selectableClass(
                      activeKey === labelKey,
                      'pointer-events-auto'
                    )}
                    style={composeStyle(
                      {
                        display: 'block',
                        marginTop: 'clamp(8px, 1.2cqi, 14px)',
                        fontFamily: SANS,
                        fontSize: RESPONSIVE.captionFont,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: COLORS.text,
                      },
                      styleOf(labelKey)
                    )}
                  >
                    {item.label}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ── Live: sticky 1 màn, stack ảnh scrub + nav/caption bám theo ───────────────
  return (
    <section
      ref={sectionRef}
      className={cn(
        'the-grand-discover @container relative z-10 w-full',
        flat && 'the-grand-discover--flat',
        className
      )}
      style={composeStyle(rootStyle, {
        height: flat ? 'auto' : `calc(100svh * ${items.length})`,
      })}
    >
      <LiveStyle />

      <div className='the-grand-discover-sticky'>
        {content.backdropImage && (
          <div
            className='the-grand-discover-backdrop'
            aria-hidden='true'
            style={{ backgroundImage: `url(${content.backdropImage})` }}
          />
        )}

        {/* TITLE + DESCRIPTION — căn giữa ngang, phía trên */}
        <header className='the-grand-discover-header'>
          <h2
            data-element-key='heading'
            data-motion='word-reveal'
            data-motion-once='true'
            className={selectableClass(
              activeKey === 'heading',
              'pointer-events-auto'
            )}
            style={headingStyle}
          >
            {content.heading}
          </h2>
          <p
            data-element-key='description'
            data-motion='fade-up'
            data-motion-delay='0.15'
            data-motion-once='true'
            className={selectableClass(
              activeKey === 'description',
              'pointer-events-auto'
            )}
            style={composeStyle(descStyle, {
              margin: `${RESPONSIVE.descMt} auto 0`,
            })}
          >
            {content.description}
          </p>
        </header>

        {/* STAGE — stack ảnh xếp chồng tại khung FRONT. Mỗi ảnh kèm 1 caption
            riêng: desktop ẩn (dùng caption đơn + nav), flat hiện dưới ảnh. */}
        <div className='the-grand-discover-stage' ref={stageRef}>
          {items.map((item, i) => {
            const imageKey = `items[${i}].imageUrl`;
            const labelKey = `items[${i}].label`;
            return (
              <figure className='the-grand-discover-item' key={i}>
                <div
                  data-element-key={imageKey}
                  role='img'
                  aria-label={item.imageAlt ?? item.label}
                  aria-hidden={i === 0 ? 'false' : 'true'}
                  className={selectableClass(
                    activeKey === imageKey,
                    'the-grand-discover-layer pointer-events-auto'
                  )}
                  style={composeStyle(
                    { backgroundImage: `url(${item.imageUrl})` },
                    styleOf(imageKey)
                  )}
                />
                <figcaption
                  data-element-key={labelKey}
                  className={selectableClass(
                    activeKey === labelKey,
                    'the-grand-discover-item-caption pointer-events-auto'
                  )}
                  style={composeStyle(
                    {
                      fontFamily: SANS,
                      fontSize: RESPONSIVE.captionFont,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: COLORS.text,
                    },
                    styleOf(labelKey)
                  )}
                >
                  {item.label}
                </figcaption>
              </figure>
            );
          })}
        </div>

        {/* Caption — tên khu vực hiện tại, góc dưới trái (sync qua DOM) */}
        <span
          className='the-grand-discover-caption'
          style={{
            fontFamily: SANS,
            fontSize: RESPONSIVE.captionFont,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLORS.text,
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)',
          }}
        >
          {items[0].label}
        </span>

        {/* DANH SÁCH KHU VỰC — góc dưới phải, entrance stagger theo group */}
        <nav
          className='the-grand-discover-nav'
          aria-label={content.heading}
          data-motion-group=''
          data-motion-stagger-children='0.08'
          data-motion-once='true'
          style={{ gap: RESPONSIVE.navGap }}
        >
          {items.map((item, i) => (
            <span
              key={i}
              className='the-grand-discover-nav-item'
              data-motion='fade-up'
              data-motion-distance='16'
            >
              <button
                type='button'
                onClick={() => goTo(i)}
                data-active={i === 0 ? 'true' : 'false'}
                aria-current={i === 0 ? 'true' : 'false'}
                className='the-grand-discover-nav-btn'
                style={{
                  fontFamily: SANS,
                  fontSize: RESPONSIVE.navFont,
                }}
              >
                <span>{item.label}</span>
                <span
                  className='the-grand-discover-nav-line'
                  aria-hidden='true'
                />
              </button>
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}

/** Layout structural cho nhánh live (sticky + stack). Visual tokens ở inline. */
function LiveStyle() {
  return (
    <style>{`
      .the-grand-discover-sticky {
        position: sticky;
        top: 0;
        height: 100svh;
        overflow: hidden;
      }
      .the-grand-discover-backdrop {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        opacity: 0.15;
        pointer-events: none;
      }
      .the-grand-discover-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
        padding: ${RESPONSIVE.headerPadY} ${RESPONSIVE.headerPadX} 0;
        z-index: 5;
      }
      .the-grand-discover-stage {
        position: absolute;
        inset: 0;
        z-index: 1;
      }
      .the-grand-discover-item {
        margin: 0;
      }
      /* Desktop: tên khu vực đọc ở caption đơn góc dưới trái + nav phải. */
      .the-grand-discover-item-caption {
        display: none;
      }
      /* Mỗi ảnh chiếm "khung FRONT"; GSAP chuyển FRONT ↔ GHOST ↔ WAITING/GONE.
         Ảnh đầu hiện sẵn để mini-preview / trước khi JS chạy không bị trắng. */
      .the-grand-discover-layer {
        position: absolute;
        left: 24%;
        width: 60%;
        top: 38%;
        height: 60%;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
        opacity: 0;
        will-change: transform, opacity, filter;
        transform-origin: center center;
        box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.65);
      }
      .the-grand-discover-layer:first-child {
        opacity: 1;
      }
      .the-grand-discover-caption {
        position: absolute;
        left: 5%;
        bottom: 8%;
        z-index: 4;
      }
      .the-grand-discover-nav {
        position: absolute;
        right: clamp(20px, 4cqi, 64px);
        bottom: clamp(28px, 6cqi, 72px);
        z-index: 6;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .the-grand-discover-nav-item {
        display: block;
      }
      .the-grand-discover-nav-btn {
        appearance: none;
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: clamp(8px, 0.8cqi, 14px);
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-weight: 400;
        color: ${COLORS.muted};
        opacity: 0.5;
        transition: color 0.4s ease, opacity 0.4s ease, font-weight 0.4s ease;
      }
      .the-grand-discover-nav-btn[data-active='true'] {
        color: ${COLORS.text};
        opacity: 1;
        font-weight: 600;
      }
      /* Gạch ngang bên phải mỗi label: mặc định ngắn, item active dài + sáng. */
      .the-grand-discover-nav-line {
        display: inline-block;
        width: clamp(12px, 1.3cqi, 18px);
        height: 1px;
        background: ${COLORS.line};
        transition: width 0.4s ease, background-color 0.4s ease;
      }
      .the-grand-discover-nav-btn[data-active='true'] .the-grand-discover-nav-line {
        width: clamp(28px, 3cqi, 48px);
        background: ${COLORS.text};
      }

      /* Flat (container mobile / reduced-motion): tắt sticky + scrub, stack dọc. */
      .the-grand-discover--flat {
        padding-bottom: clamp(32px, 10cqi, 56px);
      }
      .the-grand-discover--flat .the-grand-discover-sticky {
        position: static;
        height: auto;
        overflow: visible;
      }
      .the-grand-discover--flat .the-grand-discover-header {
        position: static;
        padding: clamp(40px, 12cqi, 64px) clamp(20px, 6cqi, 32px) clamp(20px, 6cqi, 28px);
      }
      .the-grand-discover--flat .the-grand-discover-stage {
        position: static;
        display: flex;
        flex-direction: column;
        gap: clamp(16px, 5cqi, 24px);
        margin: 0 clamp(20px, 6cqi, 32px);
      }
      .the-grand-discover--flat .the-grand-discover-layer {
        position: relative;
        left: auto;
        top: auto;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 10;
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        clip-path: none !important;
        box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.6);
      }
      /* Flat: mỗi ảnh tự mang tên khu vực ngay dưới nó → caption đơn + nav
         (vốn để điều hướng stack ghim) thành thừa, ẩn cả hai. */
      .the-grand-discover--flat .the-grand-discover-item-caption {
        display: block;
        margin-top: clamp(8px, 2.5cqi, 14px);
      }
      .the-grand-discover--flat .the-grand-discover-caption,
      .the-grand-discover--flat .the-grand-discover-nav {
        display: none;
      }
    `}</style>
  );
}

/** Layout cho nhánh canvas — lưới phẳng, mọi field đều click chọn được. */
function CanvasStyle() {
  return (
    <style>{`
      .the-grand-discover-canvas-backdrop-row {
        display: flex;
        align-items: center;
        gap: clamp(10px, 1.6cqi, 18px);
      }
      .the-grand-discover-canvas-backdrop {
        width: clamp(96px, 12cqi, 160px);
        aspect-ratio: 16 / 10;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
        border-radius: 4px;
      }
      .the-grand-discover-canvas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: clamp(16px, 2.4cqi, 28px);
      }
      .the-grand-discover-canvas-media {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 10;
        background-color: ${COLORS.mediaBg};
        background-size: cover;
        background-position: center;
        border-radius: 4px;
      }
    `}</style>
  );
}
