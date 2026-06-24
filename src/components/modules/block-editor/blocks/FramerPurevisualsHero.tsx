'use client';

/**
 * Hero - PureVisuals: 2 panel ảnh 50/50 phủ kín, cuộn → tách ra (trái/phải) để
 * lộ heading lớn dưới nền. Port từ `recon-purevisuals-hero/spec.md` §9.
 *
 * "Pin" bằng CSS: outer cao (track) + inner `position: sticky` (iOS-safe, KHÔNG
 * GSAP `pin` — pin trên iOS hay giật). GSAP chỉ scrub xPercent panel + reveal
 * text theo tiến trình cuộn qua outer. Plugin ScrollTrigger do `LandingMotionRoot`
 * đăng ký (không register trong block). Reduced-motion: CSS @media bỏ track +
 * hiện text. @container/cqi thay md:/lg:.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPurevisualsHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: FramerPurevisualsHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const MONO_STACK =
  '"JetBrains Mono", "JetBrains Mono Placeholder", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Outer = track cuộn (sticky inner giữ 1 viewport, dư ra ~120dvh để scrub).
const OUTER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '220dvh',
  backgroundColor: '#ffffff',
};

// Inner sticky = "pin" bằng CSS (1 viewport, đứng yên khi cuộn qua track).
// containerType ở ĐÂY (không phải outer) — container-type trên outer có thể
// can thiệp position:sticky của con. cqi/@container vẫn = full width.
const STICKY_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  containerType: 'inline-size',
};

const PANEL_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '50%',
  overflow: 'hidden',
  contain: 'paint',
  willChange: 'transform',
  zIndex: 2,
};

const PANEL_LEFT_STYLE: React.CSSProperties = {
  ...PANEL_BASE_STYLE,
  left: 0,
};

const PANEL_RIGHT_STYLE: React.CSSProperties = {
  ...PANEL_BASE_STYLE,
  right: 0,
};

const PANEL_IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: 'clamp(40px, 13cqi, 180px)',
  fontWeight: 700,
  lineHeight: 1.1,
  letterSpacing: '-0.04em',
  textTransform: 'uppercase',
  margin: 0,
};

const SUBHEADING_STYLE: React.CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: 'clamp(14px, 1.5cqi, 18px)',
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  margin: 0,
  marginTop: 'clamp(12px, 1.6cqi, 20px)',
  maxWidth: 'min(36ch, 100%)',
};

const TEXT_LAYER_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeContent: 'center',
  textAlign: 'center',
  padding: 'clamp(24px, 4cqi, 64px)',
  zIndex: 1,
  pointerEvents: 'none',
  willChange: 'transform, opacity, filter',
};

export function FramerPurevisualsHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);
  const leftRef = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const bgColor = content.bgColor || '#ffffff';
  const textColor = content.textColor || '#0a0a0a';
  const eyebrow = content.eyebrow || 'PureVisuals';
  const heading = content.heading || 'PureVisuals';
  const subheading = content.subheading || 'Blending creativity & strategy';

  const leftImages = React.useMemo<string[]>(
    () =>
      Array.isArray(content.leftImageUrl)
        ? content.leftImageUrl.filter(Boolean)
        : content.leftImageUrl
          ? [content.leftImageUrl]
          : [],
    [content.leftImageUrl]
  );
  const rightImages = React.useMemo<string[]>(
    () =>
      Array.isArray(content.rightImageUrl)
        ? content.rightImageUrl.filter(Boolean)
        : content.rightImageUrl
          ? [content.rightImageUrl]
          : [],
    [content.rightImageUrl]
  );

  const [leftIndex, setLeftIndex] = React.useState(0);
  const [rightIndex, setRightIndex] = React.useState(0);
  // Carousel chỉ chạy khi block trong viewport (IntersectionObserver) — tránh
  // setState/re-render mỗi 2s khi block đã cuộn khỏi màn hình.
  const [inView, setInView] = React.useState(true);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!inView || leftImages.length <= 1) {
      setLeftIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setLeftIndex(i => (i + 1) % leftImages.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [inView, leftImages.length]);
  React.useEffect(() => {
    if (!inView || rightImages.length <= 1) {
      setRightIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setRightIndex(i => (i + 1) % rightImages.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [inView, rightImages.length]);

  const leftSrc = leftImages[leftIndex] ?? leftImages[0] ?? '';
  const rightSrc = rightImages[rightIndex] ?? rightImages[0] ?? '';

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    const text = textRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!root || !text || !left || !right) return;

    // Reduced-motion: layout do CSS @media lo (track gập, panel ẩn, text hiện).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set([left, right], { xPercent: 0 });
    gsap.set(text, { opacity: 0, yPercent: 100, filter: 'blur(8px)' });

    // Scrub theo tiến trình cuộn qua OUTER (sticky inner giữ viewport). KHÔNG
    // `pin` — dùng CSS sticky, an toàn iOS.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
      },
    });

    tl.to(left, { xPercent: -100, duration: 1 }, 0)
      .to(right, { xPercent: 100, duration: 1 }, 0)
      .to(
        text,
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1 },
        0
      );
  });

  return (
    <section
      ref={rootRef}
      data-block='framer-purevisuals-hero'
      style={composeStyle(
        OUTER_STYLE,
        { backgroundColor: bgColor },
        blockBackgroundStyle(background)
      )}
      className='pvh-hero'
    >
      <style>{`
        .pvh-hero :where(h1, h2, h3, h4, p) { margin: 0; }
        .pvh-hero :focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }
        /* Reduced-motion: bỏ track cuộn (outer về 1 viewport), panel ẩn, text
           hiện đầy đủ + tương tác được. */
        @media (prefers-reduced-motion: reduce) {
          .pvh-hero { height: 100dvh !important; }
          .pvh-hero [data-pvh-panel] { opacity: 0 !important; }
          .pvh-hero [data-pvh-text] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            pointer-events: auto !important;
          }
        }
        @container (max-width: 479px) {
          .pvh-hero [data-pvh-panel='left'] {
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 50% !important;
          }
          .pvh-hero [data-pvh-panel='right'] {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 50% !important;
          }
        }
      `}</style>

      {/* Sticky inner = "pin" bằng CSS — giữ 1 viewport khi cuộn qua track.
          `@container` ở đây để cqi + @3xl: của text/panel resolve theo width này. */}
      <div className='@container' style={STICKY_STYLE}>
        {/* LEFT PANEL — 50% width */}
        <div
          ref={leftRef}
          data-pvh-panel='left'
          data-element-key='leftImageUrl'
          aria-hidden='true'
          className={selectableClass(activeKey === 'leftImageUrl')}
          style={composeStyle(
            PANEL_LEFT_STYLE,
            leftSrc ? {} : { backgroundColor: '#1a1a1a' },
            styleOf('leftImageUrl')
          )}
        >
          {leftSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={leftSrc}
              alt=''
              loading='eager'
              decoding='async'
              style={PANEL_IMAGE_STYLE}
            />
          ) : null}
        </div>

        {/* RIGHT PANEL — 50% width */}
        <div
          ref={rightRef}
          data-pvh-panel='right'
          data-element-key='rightImageUrl'
          aria-hidden='true'
          className={selectableClass(activeKey === 'rightImageUrl')}
          style={composeStyle(
            PANEL_RIGHT_STYLE,
            rightSrc ? {} : { backgroundColor: '#262626' },
            styleOf('rightImageUrl')
          )}
        >
          {rightSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rightSrc}
              alt=''
              loading='eager'
              decoding='async'
              style={PANEL_IMAGE_STYLE}
            />
          ) : null}
        </div>

        {/* TEXT LAYER — nằm dưới panel, trồi lên khi cuộn */}
        <div
          ref={textRef}
          data-pvh-text
          style={composeStyle(TEXT_LAYER_STYLE, { color: textColor })}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translateY(-5cqi)',
            }}
          >
            <h1
              data-element-key='heading'
              className={selectableClass(activeKey === 'heading')}
              style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            >
              {heading}
            </h1>
            <div className='flex flex-col items-center gap-2 @3xl:flex-row @3xl:items-start @3xl:justify-between'>
              <p
                data-element-key='eyebrow'
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'text-center @3xl:text-left'
                )}
                style={composeStyle(SUBHEADING_STYLE, styleOf('eyebrow'))}
              >
                {eyebrow}
              </p>
              <p
                data-element-key='subheading'
                className={selectableClass(
                  activeKey === 'subheading',
                  'text-center @3xl:text-right'
                )}
                style={composeStyle(SUBHEADING_STYLE, styleOf('subheading'))}
              >
                {subheading}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
