'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ReadymagCaseItem,
  ReadymagCaseSectionContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  resolveReadymagCases,
  hasReadymagCasesArray,
} from './_registry/defs/readymagCaseSection';

interface Props {
  content: ReadymagCaseSectionContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const TRACK_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  background: '#ffffff',
  color: '#000000',
  fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
};

const STICKY_INNER_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  width: '100%',
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  zIndex: 2,
};

const IMAGE_SCALE = 1.22;

const BIO_GAP = 'clamp(20px, 3.5cqi, 48px)';

const BIO_TEXT_STYLE_BASE: React.CSSProperties = {
  fontSize: 'clamp(12px, 1.4cqi, 16px)',
  lineHeight: 1.45,
  letterSpacing: '-0.005em',
  fontWeight: 500,
  color: '#000000',
  margin: 0,
};

const BIO_NAME_STYLE_BASE: React.CSSProperties = {
  fontWeight: 800,
};

const BIO_LINK_STYLE_BASE: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 'clamp(8px, 1.2cqi, 14px)',
  color: '#0000ee',
  textDecoration: 'underline',
  fontWeight: 500,
  fontSize: 'clamp(11px, 1.2cqi, 14px)',
};

const WORDMARK_STYLE_BASE: React.CSSProperties = {
  fontSize: 'clamp(28px, 6.5cqi, 60px)',
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: '-0.025em',
  textAlign: 'right',
  color: '#000000',
  margin: 0,
};

const BIO_WIDTH = 'clamp(160px, 32cqi, 320px)';

const IMAGE_COL_WIDTH = 'clamp(140px, 18cqi, 240px)';

const IMAGE_COL_LEFT = 'clamp(80px, 24cqi, 360px)';

const CASE_STEP_VH = 44;

const TRAIL_BUFFER_VH = 10;

const MOBILE_STEP_VH = 90;
const MOBILE_TRAIL_VH = 30;

const caseFieldKeys = (i: number, useArray: boolean) => {
  if (useArray) {
    return {
      name: `cases[${i}].name`,
      body: `cases[${i}].body`,
      linkText: `cases[${i}].linkText`,
      linkHref: `cases[${i}].linkHref`,
      imageUrl: `cases[${i}].imageUrl`,
    };
  }
  const n = i + 1;
  return {
    name: `case${n}Name`,
    body: `case${n}Body`,
    linkText: `case${n}LinkText`,
    linkHref: `case${n}LinkHref`,
    imageUrl: `case${n}ImageUrl`,
  };
};

export function ReadymagCaseSection({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const styleOf = React.useCallback(
    (key: string) =>
      composeStyle(
        elementStyleOf(styles, key),
        orderStyle(order, key),
        positionStyle(positions, key)
      ),
    [styles, order, positions]
  );

  const cases = React.useMemo(() => resolveReadymagCases(content), [content]);
  const useCasesArray = hasReadymagCasesArray(content);
  const caseCount = cases.length;
  const isValid = caseCount > 0;

  const bgColor = content.bgColor || '#ffffff';
  const textColor = content.textColor || '#000000';
  const accentColor = content.accentColor || '#0000ee';
  const wordmarkColor = content.wordmarkColor || textColor;

  const outerRef = React.useRef<HTMLElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const imageRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const bioRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const wordRefs = React.useRef<Array<HTMLHeadingElement | null>>([]);

  const [activeIndex, setActiveIndex] = React.useState(0);

  // Editor canvas → lưới editable tất cả cases (giống ScrollMattis).
  // Sticky+scroll hide inactive text nên không edit được trên canvas.
  const isCanvas = useIsCanvasEdit(outerRef);

  React.useEffect(() => {
    imageRefs.current.length = caseCount;
    bioRefs.current.length = caseCount;
    wordRefs.current.length = caseCount;
  }, [caseCount]);

  useBlockMotion(
    outerRef,
    ({ scroller, requestRefresh }) => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner || !isValid || isCanvas) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!reduce) {
        gsap.fromTo(
          inner,
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
        );
      } else {
        gsap.set(inner, { autoAlpha: 1, scale: 1 });
      }

      const refreshActiveFromPositions = () => {
        if (typeof window === 'undefined') return;
        const activeLine = window.innerHeight * 0.6;
        let bestIdx = 0;
        let bestDist = -Infinity;
        for (let i = 0; i < imageRefs.current.length; i++) {
          const el = imageRefs.current[i];
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top <= activeLine) {
            const dist = activeLine - top;
            if (dist > bestDist) {
              bestDist = dist;
              bestIdx = i;
            }
          }
        }
        setActiveIndex(bestIdx);
      };

      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start: 'top 60%',
          onEnter: () => setActiveIndex(i),
          onLeaveBack: () => setActiveIndex(Math.max(0, i - 1)),
        });
      });

      requestAnimationFrame(() => {
        refreshActiveFromPositions();
        requestRefresh();
      });
    },
    [caseCount, isValid, isCanvas]
  );

  const bioTextStyle = composeStyle(BIO_TEXT_STYLE_BASE, styleOf('bio'));
  const wordmarkStyle = composeStyle(
    WORDMARK_STYLE_BASE,
    { color: wordmarkColor },
    styleOf('wordmark')
  );

  // ── Editor canvas: lưới tất cả cases (không sticky / không hide inactive) ──
  if (isCanvas) {
    return (
      <section
        ref={outerRef}
        style={composeStyle(
          TRACK_STYLE,
          { height: 'auto', minHeight: 420 },
          { background: bgColor, color: textColor },
          blockBackgroundStyle(background)
        )}
        className={`readymag-cases readymag-cases--canvas @container ${className ?? ''}`}
        data-block='readymag-case-section'
        data-case-count={caseCount}
        data-canvas-edit='true'
      >
        <style>{`
          .readymag-cases--canvas :where(a) { text-decoration: none; color: inherit; }
          .readymag-cases-bio-link:hover { opacity: 0.7; }
        `}</style>

        {!isValid ? (
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              minHeight: 320,
              opacity: 0.5,
              fontSize: 14,
            }}
          >
            (Chưa có case — thêm case trong LayersPanel)
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              padding: 16,
              containerType: 'inline-size',
            }}
          >
            {cases.map((c, i) => {
              const keys = caseFieldKeys(i, useCasesArray);
              return (
                <div
                  key={`edit-${c.key}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    padding: 12,
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    background: '#fff',
                  }}
                >
                  <div
                    data-element-key={keys.imageUrl}
                    className={selectableClass(activeKey === keys.imageUrl)}
                    style={composeStyle(
                      {
                        width: '100%',
                        aspectRatio: '158 / 217',
                        overflow: 'hidden',
                        background: '#e8e8ea',
                      },
                      styleOf(keys.imageUrl)
                    )}
                  >
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : null}
                  </div>

                  <h2
                    data-element-key={keys.name}
                    style={composeStyle(
                      {
                        fontSize: 'clamp(18px, 4cqi, 28px)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        margin: 0,
                        color: wordmarkColor,
                      },
                      styleOf(keys.name)
                    )}
                    className={selectableClass(activeKey === keys.name)}
                  >
                    {c.name || `Case ${i + 1}`}
                  </h2>

                  <p
                    style={composeStyle(
                      {
                        fontSize: 13,
                        lineHeight: 1.45,
                        margin: 0,
                        fontWeight: 500,
                      },
                      bioTextStyle
                    )}
                  >
                    <span
                      data-element-key={keys.body}
                      style={styleOf(keys.body)}
                      className={selectableClass(activeKey === keys.body)}
                    >
                      {c.body || '— mô tả'}
                    </span>
                  </p>

                  <a
                    href={c.linkHref || '#'}
                    data-element-key={keys.linkHref}
                    className={selectableClass(
                      activeKey === keys.linkHref,
                      'readymag-cases-bio-link'
                    )}
                    style={composeStyle(
                      BIO_LINK_STYLE_BASE,
                      { color: accentColor, marginTop: 0 },
                      styleOf(keys.linkHref)
                    )}
                  >
                    <span
                      data-element-key={keys.linkText}
                      style={styleOf(keys.linkText)}
                      className={selectableClass(activeKey === keys.linkText)}
                    >
                      {c.linkText || 'View case →'}
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  const trackHeight = `${
    100 + Math.max(0, caseCount - 1) * CASE_STEP_VH + TRAIL_BUFFER_VH
  }dvh`;

  const mobileTrackHeight = `${
    caseCount * MOBILE_STEP_VH + MOBILE_TRAIL_VH
  }dvh`;

  const sectionHeight = caseCount === 0 ? '100dvh' : trackHeight;
  const trackStyle = composeStyle(
    TRACK_STYLE,
    {
      height: sectionHeight,
      ['--rmc-mobile-h' as string]: mobileTrackHeight,
    },
    { background: bgColor, color: textColor },
    blockBackgroundStyle(background)
  );

  return (
    <section
      ref={outerRef}
      style={trackStyle}
      className={`readymag-cases @container ${className ?? ''}`}
      data-block='readymag-case-section'
      data-case-count={caseCount}
    >
      <style>{`
        .readymag-cases :where(a) { text-decoration: none; color: inherit; }
        .readymag-cases-bio-link:hover { opacity: 0.7; }
        @media (prefers-reduced-motion: reduce) {
          .readymag-cases * { animation: none !important; transition: none !important; }
        }
        /* Mobile: stack dọc — image giữa, bio trên, wordmark dưới.
           vẫn giữ sticky inner cho bio+wordmark. Đồng thời override
           section height = mobileTrackHeight (qua var --rmc-mobile-h)
           vì desktop trackHeight chỉ dùng cho sticky desktop. */
        @container (max-width: 809px) {
          .readymag-cases {
            height: var(--rmc-mobile-h) !important;
          }
          .readymag-cases-image-column {
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: clamp(120px, 38cqi, 200px) !important;
          }
          .readymag-cases-bio {
            left: 50% !important;
            top: 38% !important;
            transform: translate(-50%, 0) !important;
            width: clamp(220px, 80cqi, 360px) !important;
            text-align: left !important;
          }
          .readymag-cases-wordmark {
            left: 50% !important;
            right: auto !important;
            bottom: 4% !important;
            top: auto !important;
            transform: translateX(-50%) !important;
            text-align: center !important;
            width: clamp(220px, 80cqi, 360px) !important;
          }
        }
      `}</style>

      <div className='hidden @4xl:block' style={{ height: trackHeight }}>
        <div
          ref={innerRef}
          className='readymag-cases-inner'
          style={STICKY_INNER_STYLE}
        >
          <div
            className='readymag-cases-canvas'
            style={{
              position: 'absolute',
              inset: 0,
              containerType: 'inline-size',
              ['--rmc-img-left' as string]: IMAGE_COL_LEFT,
              ['--rmc-img-width' as string]: IMAGE_COL_WIDTH,
              ['--rmc-bio-gap' as string]: BIO_GAP,
            }}
          >
            <div
              className='readymag-cases-bio'
              style={{
                position: 'absolute',
                left: `calc(var(--rmc-img-left) + var(--rmc-img-width) * ${IMAGE_SCALE} + var(--rmc-bio-gap))`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: BIO_WIDTH,
                maxWidth: `calc(100% - var(--rmc-img-left) - var(--rmc-img-width) * ${IMAGE_SCALE} - var(--rmc-bio-gap) - clamp(180px, 28cqi, 400px))`,
                maxHeight: 'clamp(160px, 30cqi, 240px)',
                zIndex: 2,
              }}
            >
              {cases.map((c, i) => {
                const keys = caseFieldKeys(i, useCasesArray);
                const isActive = i === activeIndex;
                return (
                  <div
                    key={`bio-${c.key}`}
                    ref={el => {
                      bioRefs.current[i] = el;
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: isActive ? 1 : 0,
                      visibility: isActive ? 'visible' : 'hidden',
                      pointerEvents: isActive ? 'auto' : 'none',
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    <p style={bioTextStyle}>
                      <span
                        data-element-key={keys.name}
                        style={composeStyle(
                          BIO_NAME_STYLE_BASE,
                          styleOf(keys.name)
                        )}
                        className={selectableClass(activeKey === keys.name)}
                      >
                        {c.name}
                      </span>
                      <span
                        data-element-key={keys.body}
                        style={styleOf(keys.body)}
                        className={selectableClass(activeKey === keys.body)}
                      >
                        {c.body}
                      </span>
                    </p>
                    <a
                      href={c.linkHref || '#'}
                      data-element-key={keys.linkHref}
                      className={selectableClass(
                        activeKey === keys.linkHref,
                        'readymag-cases-bio-link'
                      )}
                      style={composeStyle(
                        BIO_LINK_STYLE_BASE,
                        { color: accentColor },
                        styleOf(keys.linkHref)
                      )}
                    >
                      <span
                        data-element-key={keys.linkText}
                        style={styleOf(keys.linkText)}
                        className={selectableClass(activeKey === keys.linkText)}
                      >
                        {c.linkText || 'View case →'}
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>

            <div
              className='readymag-cases-wordmark'
              style={{
                position: 'absolute',
                right: 'clamp(20px, 3.5cqi, 56px)',
                bottom: 'clamp(14px, 4.5cqi, 56px)',
                width: 'clamp(180px, 26cqi, 360px)',
                zIndex: 2,
              }}
            >
              {cases.map((c, i) => {
                const keys = caseFieldKeys(i, useCasesArray);
                const isActive = i === activeIndex;
                return (
                  <h2
                    key={`word-${c.key}`}
                    ref={el => {
                      wordRefs.current[i] = el;
                    }}
                    data-element-key={keys.name}
                    style={{
                      ...wordmarkStyle,
                      ...styleOf(keys.name),
                      position: 'absolute',
                      inset: 0,
                      opacity: isActive ? 1 : 0,
                      visibility: isActive ? 'visible' : 'hidden',
                      pointerEvents: isActive ? 'auto' : 'none',
                      transition: 'opacity 0.4s ease',
                    }}
                    className={selectableClass(activeKey === keys.name)}
                  >
                    {c.name}
                  </h2>
                );
              })}
            </div>
          </div>

          {!isValid ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                color: textColor,
                fontFamily: 'inherit',
                fontSize: 14,
                opacity: 0.5,
              }}
            >
              (Chưa có case nào — thêm case trong LayersPanel)
            </div>
          ) : null}
        </div>
      </div>

      <div
        className='readymag-cases-image-column hidden @4xl:block'
        style={{
          position: 'absolute',
          top: 0,
          left: IMAGE_COL_LEFT,
          width: IMAGE_COL_WIDTH,
          height: '100%',
          zIndex: 1,
        }}
      >
        {cases.map((c, i) => {
          const keys = caseFieldKeys(i, useCasesArray);
          const isActive = i === activeIndex;
          return (
            <div
              key={`img-${c.key}`}
              ref={el => {
                imageRefs.current[i] = el;
              }}
              data-element-key={keys.imageUrl}
              className={selectableClass(activeKey === keys.imageUrl)}
              style={composeStyle(
                {
                  position: 'absolute',
                  top: `${50 + i * CASE_STEP_VH}dvh`,
                  left: 0,
                  width: '100%',
                  aspectRatio: '158 / 217',
                  overflow: 'visible',
                  pointerEvents: 'auto',
                },
                styleOf(keys.imageUrl)
              )}
            >
              <img
                src={c.imageUrl}
                alt={c.name}
                loading='eager'
                decoding='async'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  background: '#e8e8ea',
                  display: 'block',
                  transform: isActive ? `scale(${IMAGE_SCALE})` : 'scale(1)',
                  transformOrigin: 'left center',
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  willChange: 'transform',
                  pointerEvents: 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      <MobileReadymagCases
        cases={cases}
        useCasesArray={useCasesArray}
        activeKey={activeKey}
        styleOf={styleOf}
        bgColor={bgColor}
        textColor={textColor}
        accentColor={accentColor}
        wordmarkColor={wordmarkColor}
        bioTextStyle={bioTextStyle}
        wordmarkStyle={wordmarkStyle}
        bioLinkStyle={BIO_LINK_STYLE_BASE}
      />
    </section>
  );
}

interface MobileReadymagCasesProps {
  cases: ReadymagCaseItem[];
  useCasesArray: boolean;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
  bgColor: string;
  textColor: string;
  accentColor: string;
  wordmarkColor: string;
  bioTextStyle: React.CSSProperties | undefined;
  wordmarkStyle: React.CSSProperties | undefined;
  bioLinkStyle: React.CSSProperties;
}

function MobileReadymagCases({
  cases,
  useCasesArray,
  activeKey,
  styleOf,
  bgColor,
  textColor,
  accentColor,
  bioTextStyle,
  wordmarkStyle,
  bioLinkStyle,
}: MobileReadymagCasesProps) {
  const caseCount = cases.length;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    itemRefs.current.length = caseCount;
  }, [caseCount]);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root || caseCount === 0) return;

      const items = itemRefs.current.filter((el): el is HTMLDivElement => !!el);
      if (items.length !== caseCount) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const N = items.length;
      let lastReportedIdx = -1;

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power1.inOut' },
      });

      items.forEach((el, i) => {
        const winStart = i / N;
        const peak = (i + 0.25) / N;
        const winEnd = (i + 0.5) / N;
        tl.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: peak - winStart, ease: 'power1.out' },
          winStart
        );
        tl.fromTo(
          el,
          { opacity: 1 },
          { opacity: 0, duration: winEnd - peak, ease: 'power1.in' },
          peak
        );
      });

      if (reduce) {
        items.forEach((el, i) => {
          gsap.set(el, { opacity: i === 0 ? 1 : 0 });
        });
        return () => {
          tl.kill();
        };
      }

      const trigger = ScrollTrigger.create({
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        animation: tl,
        onUpdate: self => {
          const idx = Math.min(
            N - 1,
            Math.max(0, Math.floor(self.progress * N))
          );
          if (idx !== lastReportedIdx) {
            lastReportedIdx = idx;
            setActiveIndex(idx);
          }
        },
      });

      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    [caseCount]
  );

  if (caseCount === 0) return null;

  const trackHeight = `${caseCount * MOBILE_STEP_VH + MOBILE_TRAIL_VH}dvh`;

  return (
    <div
      ref={rootRef}
      className='readymag-cases-mobile @4xl:hidden'
      style={{
        position: 'relative',
        width: '100%',
        height: trackHeight,
        background: bgColor,
        color: textColor,
      }}
    >
      <div
        className='readymag-cases-mobile-sticky'
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(16px, 5cqi, 32px)',
          containerType: 'inline-size',
        }}
      >
        {cases.map((c, i) => {
          const keys = caseFieldKeys(i, useCasesArray);
          const isActive = i === activeIndex;
          return (
            <div
              key={`m-${c.key}`}
              ref={el => {
                itemRefs.current[i] = el;
              }}
              className='readymag-cases-mobile-item'
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(12px, 3cqi, 20px)',
                opacity: isActive ? 1 : 0,
                visibility: isActive ? 'visible' : 'hidden',
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'opacity 0.4s ease',
              }}
            >
              <div
                data-element-key={keys.imageUrl}
                className={selectableClass(activeKey === keys.imageUrl)}
                style={composeStyle(
                  {
                    width: '100%',
                    aspectRatio: '3 / 2',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(keys.imageUrl)
                )}
              >
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  loading='eager'
                  decoding='async'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  paddingInline: 'clamp(16px, 5cqi, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(12px, 3cqi, 20px)',
                }}
              >
                <h2
                  data-element-key={keys.name}
                  style={composeStyle(
                    {
                      ...(wordmarkStyle ?? {}),
                      textAlign: 'left',
                      margin: 0,
                    },
                    styleOf(keys.name)
                  )}
                  className={selectableClass(activeKey === keys.name)}
                >
                  {c.name}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={bioTextStyle ?? {}}>
                    <span
                      data-element-key={keys.name}
                      style={composeStyle(
                        BIO_NAME_STYLE_BASE,
                        styleOf(keys.name)
                      )}
                      className={selectableClass(activeKey === keys.name)}
                    >
                      {c.name}
                    </span>
                    <span
                      data-element-key={keys.body}
                      style={styleOf(keys.body)}
                      className={selectableClass(activeKey === keys.body)}
                    >
                      {c.body}
                    </span>
                  </p>
                  <a
                    href={c.linkHref || '#'}
                    data-element-key={keys.linkHref}
                    className={selectableClass(
                      activeKey === keys.linkHref,
                      'readymag-cases-bio-link'
                    )}
                    style={composeStyle(
                      bioLinkStyle,
                      { color: accentColor },
                      styleOf(keys.linkHref)
                    )}
                  >
                    <span
                      data-element-key={keys.linkText}
                      style={styleOf(keys.linkText)}
                      className={selectableClass(activeKey === keys.linkText)}
                    >
                      {c.linkText || 'View case →'}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
