'use client';

import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerIgnitexStepContent,
  FramerIgnitexStepCard,
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
  content: FramerIgnitexStepContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const DEFAULT_CARDS: FramerIgnitexStepCard[] = [
  {
    title: 'Discover & Define',
    body: 'We dive deep into your goals, audience, and brand to uncover insights and define a clear direction.',
  },
  {
    title: 'Design & Build',
    body: 'With strategy in place, we craft stunning visuals and high-performing digital solutions tailored to your needs.',
  },
  {
    title: 'Launch & Grow',
    body: 'We bring your vision to life, optimize for performance, and support your ongoing success post-launch.',
  },
];

const FONT_STACK =
  '"Geist", "Geist Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const SERIF_STACK = '"Great Vibes", "Great Vibes Placeholder", cursive';

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  backgroundColor: '#FFFFFF',
  containerType: 'inline-size',
};

const OUTER_TRACK_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '240dvh',
  backgroundColor: '#FFFFFF',
};

const STICKY_INNER_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  containerType: 'inline-size',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'start',
  padding: 'clamp(40px, 8cqi, 120px) clamp(20px, 3.5cqi, 50px)',
  gap: 'clamp(24px, 4cqi, 60px)',
};

const CONTENT_ABS_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '20%',
  inset: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'clamp(20px, 1.7cqi, 50px)',
  width: '100%',
  maxWidth: 'min(1280px, 100%)',
  marginInline: 'auto',
  paddingInline: 'clamp(20px, 3.5cqi, 50px)',
};

const PRE_TITLE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: FONT_STACK,
  fontSize: 'clamp(14px, 1.2cqi, 16px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: '#05080c',
};

const TITLE_COLUMN_STYLE: React.CSSProperties = {
  // display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: 'clamp(180px, 24cqi, 300px)',
  flexShrink: 0,
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 'clamp(36px, 4.3cqi, 60px)',
  fontWeight: 500,
  lineHeight: 1.1,
  letterSpacing: '-0.04em',
  color: '#05080c',
  margin: 0,
  marginLeft: '16px',
  textAlign: 'center',
};

const SERIF_WORD_STYLE: React.CSSProperties = {
  fontFamily: SERIF_STACK,
  fontSize: 'clamp(40px, 4.3cqi, 62px)',
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: '#05080c',
  margin: 0,
  fontStyle: 'normal',
};

const CARDS_STACK_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(10px, 1.2cqi, 16px)',
  flex: '1 1 auto',
  minWidth: 0,
  maxWidth: 'min(400px, 100%)',
  // maxHeight: '100%',
  paddingBottom: '150px',
  overflowY: 'auto',
  scrollbarWidth: 'none',
};

const CARD_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(8px, 0.8cqi, 12px)',
  padding: 'clamp(10px, 0.9cqi, 14px)',
  border: '1px solid #ebebeb',
  borderRadius: 'clamp(10px, 1.1cqi, 16px)',
  backgroundColor: '#FFFFFF',
  width: '100%',
  flexShrink: 0,
};

const CARD_HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'clamp(10px, 1.4cqi, 20px)',
  width: '100%',
};

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 'clamp(18px, 1.9cqi, 28px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.04em',
  color: '#05080c',
  margin: 0,
};

const SPARKLE_ROW_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'clamp(4px, 0.4cqi, 6px)',
  flexShrink: 0,
};

const CARD_BODY_STYLE: React.CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 'clamp(14px, 1.25cqi, 18px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: '#5b5b5b',
  margin: 0,
  maxWidth: 'min(372px, 100%)',
};

const ILLUSTRATION_WRAPPER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 'clamp(60px, 9cqi, 120px)',
  padding: 'clamp(4px, 0.5cqi, 8px) 0',
};

const ILLUSTRATION_IMAGE_STYLE: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const MAIN_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  // maxWidth: 'clamp(80px, 9cqi, 120px)',
  width: '220px',
  height: '220px',
  objectFit: 'contain',
  margin: '0 auto',
};

// const SUB_IMAGE_STYLE: React.CSSProperties = {
//     position: 'absolute',
//     top: '60%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '60px',
//     height: '60px',
//     objectFit: 'contain',
//     pointerEvents: 'none',
// };

const SPARKLE_GLYPH = (size = 16) => (
  <svg
    aria-hidden='true'
    width={size}
    height={size}
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4L8 0Z'
      fill='currentColor'
    />
  </svg>
);

export function FramerIgnitexStep({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const rightColumnRef = React.useRef<HTMLDivElement>(null);
  const cardsStackRef = React.useRef<HTMLDivElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const preTitle = content.preTitle || 'From concept to launch';
  const leftTop = content.leftTop || 'Your';
  const leftMiddle = content.leftMiddle || 'ideas';
  const leftPreBrand = content.leftPreBrand || 'into';
  const leftBrand = content.leftBrand || 'Brand';
  const rightTop = content.rightTop || 'transform';
  const rightBottom = content.rightBottom || 'stories';
  const cards = React.useMemo<FramerIgnitexStepCard[]>(
    () =>
      Array.isArray(content.cards) && content.cards.length > 0
        ? content.cards
        : DEFAULT_CARDS,
    [content.cards]
  );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;

      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const left = leftColumnRef.current;
      const right = rightColumnRef.current;
      const stack = cardsStackRef.current;
      if (!left || !right || !stack) return;

      if (reduce) {
        gsap.set([left, right, stack], {
          clearProps: 'transform',
          opacity: 1,
        });
        return;
      }

      gsap.set(left, { x: 235, y: -250 });
      gsap.set(right, { x: -235, y: -250 });
      gsap.set(stack, { yPercent: 110, opacity: 1 });

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
      tl.to(left, { y: 0, duration: 0.5 }, 0)
        .to(right, { y: 0, duration: 0.5 }, 0)
        .to(left, { x: 0, duration: 0.5 }, 0.5)
        .to(right, { x: 0, duration: 0.5 }, 0.5)
        .to(stack, { yPercent: -10, opacity: 1, duration: 1 }, 0.5);
    },
    [cards.length]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-ignitex-step'
      style={composeStyle(
        ROOT_STYLE,
        OUTER_TRACK_STYLE,
        blockBackgroundStyle(background)
      )}
      className='fist-root fist-outer-track @container'
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Geist:wght@500;600&display=swap');
        .fist-root :where(h1, h2, h3, h4, p, span) { margin: 0; padding: 0; }
        .fist-root :focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }
        /* Tablet (≤1023px) + mobile (≤671px): bỏ sticky + scrub, dùng stack
           dọc tĩnh. Outer về height tự nhiên (auto), sticky inner mất
           position:sticky, content dùng flex-col. */
        @container (max-width: 1023px) {
          .fist-outer-track { height: auto !important; }
          .fist-sticky-inner {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            min-height: 0 !important;
            padding: clamp(40px, 8cqi, 80px) clamp(16px, 4cqi, 24px) !important;
            gap: clamp(24px, 5cqi, 48px) !important;
          }
          .fist-content {
            position: relative !important;
            inset: auto !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: clamp(32px, 5cqi, 48px) !important;
            padding: 0 !important;
          }
          .fist-title-column {
            width: 100% !important;
            max-width: min(728px, 100%) !important;
            align-items: center !important;
            text-align: center !important;
            transform: none !important;
          }
          .fist-title-column h2,
          .fist-title-column .fist-serif {
            text-align: center !important;
          }
          .fist-cards-stack {
            max-width: min(420px, 100%) !important;
            width: 100% !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .fist-card { padding: 18px !important; }
          .fist-card-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 10px !important;
          }
          .fist-card-title { text-align: center !important; }
          .fist-card-body {
            text-align: center !important;
            max-width: 100% !important;
          }
        }
        /* Reduced-motion: outer về auto, sticky inner mất sticky, mọi
           transform reset về 0, opacity 1. */
        @media (prefers-reduced-motion: reduce) {
          .fist-outer-track { height: auto !important; }
          .fist-sticky-inner {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .fist-title-column,
          .fist-cards-stack,
          .fist-content {
            transform: none !important;
            opacity: 1 !important;
          }
          .fist-root [data-fist-sparkle] { transform: none !important; }
        }
      `}</style>

      <div
        ref={stickyRef}
        className='fist-sticky-inner @container'
        style={STICKY_INNER_STYLE}
      >
        <span
          data-element-key='preTitle'
          className={selectableClass(
            activeKey === 'preTitle',
            'fist-pre-title'
          )}
          style={composeStyle(PRE_TITLE_STYLE, styleOf('preTitle'))}
        >
          {SPARKLE_GLYPH(12)}
          <span>{preTitle}</span>
        </span>

        <div style={CONTENT_ABS_STYLE} className='fist-content'>
          {/* LEFT title column: "Your ideas / into [Brand]" */}
          <div className='flex @4xl:hidden'>
            <h2
              data-element-key='leftTop'
              style={composeStyle(HEADING_STYLE, styleOf('leftTop'))}
              className={selectableClass(
                activeKey === 'leftTop',
                'fist-h2 max-w-[400px] text-center'
              )}
            >
              {`${leftTop} ${leftMiddle} ${rightTop} ${leftPreBrand} ${leftBrand} ${rightBottom}`}
            </h2>
          </div>

          <div
            ref={leftColumnRef}
            data-element-key='leftColumn'
            data-fist-anim='left'
            className={selectableClass(
              activeKey === 'leftColumn',
              'fist-title-column fist-left hidden @4xl:flex'
            )}
            style={composeStyle(TITLE_COLUMN_STYLE, styleOf('leftColumn'))}
          >
            <h2
              data-element-key='leftTop'
              style={composeStyle(HEADING_STYLE, styleOf('leftTop'))}
              className={selectableClass(activeKey === 'leftTop', 'fist-h2')}
            >
              {`${leftTop} ${leftMiddle}`}
            </h2>
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 'clamp(8px, 0.7cqi, 14px)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <h2
                data-element-key='leftPreBrand'
                style={composeStyle(HEADING_STYLE, styleOf('leftPreBrand'))}
                className={selectableClass(
                  activeKey === 'leftPreBrand',
                  'fist-h2'
                )}
              >
                {leftPreBrand}
              </h2>
              <span
                data-element-key='leftBrand'
                className={selectableClass(
                  activeKey === 'leftBrand',
                  'fist-serif'
                )}
                style={composeStyle(SERIF_WORD_STYLE, styleOf('leftBrand'))}
              >
                {leftBrand}
              </span>
            </div>
          </div>

          {/* CENTER: stack of 3 step cards — translateY từ bottom lên */}
          <div
            ref={cardsStackRef}
            data-element-key='cardsStack'
            data-fist-anim='cards'
            style={CARDS_STACK_STYLE}
            className='fist-cards-stack'
          >
            {cards.map((card, idx) => {
              const cardKey = `card-${idx}`;
              return (
                <div
                  key={`${card.title}-${idx}`}
                  data-element-key={cardKey}
                  data-fist-card-index={idx}
                  className={selectableClass(
                    activeKey === cardKey,
                    `fist-card fist-card-${idx}`
                  )}
                  style={composeStyle(CARD_STYLE, styleOf(cardKey))}
                >
                  <div style={CARD_HEADER_STYLE} className='fist-card-header'>
                    <h3
                      data-element-key={`${cardKey}-title`}
                      style={composeStyle(
                        CARD_TITLE_STYLE,
                        styleOf(`${cardKey}-title`)
                      )}
                      className={selectableClass(
                        activeKey === `${cardKey}-title`,
                        'fist-card-title'
                      )}
                    >
                      {card.title}
                    </h3>
                    <span
                      data-fist-sparkle
                      style={composeStyle(SPARKLE_ROW_STYLE)}
                      className='fist-sparkle-row'
                      aria-hidden='true'
                    >
                      {SPARKLE_GLYPH(14)}
                      {SPARKLE_GLYPH(14)}
                      {SPARKLE_GLYPH(14)}
                    </span>
                  </div>

                  {card.mainImageUrl && (
                    <div
                      style={composeStyle(
                        ILLUSTRATION_WRAPPER_STYLE,
                        ILLUSTRATION_IMAGE_STYLE
                      )}
                      className='fist-illustration'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.mainImageUrl}
                        alt=''
                        aria-hidden='true'
                        className='fist-illustration-main'
                        style={MAIN_IMAGE_STYLE}
                      />
                      {/* {card.subImageUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={card.subImageUrl}
                                                    alt=''
                                                    aria-hidden='true'
                                                    className='fist-illustration-sub'
                                                    style={SUB_IMAGE_STYLE}
                                                />
                                            )} */}
                    </div>
                  )}

                  <p
                    data-element-key={`${cardKey}-body`}
                    style={composeStyle(
                      CARD_BODY_STYLE,
                      styleOf(`${cardKey}-body`)
                    )}
                    className={selectableClass(
                      activeKey === `${cardKey}-body`,
                      'fist-card-body'
                    )}
                  >
                    {card.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT title column: "transform / stories" */}
          <div
            ref={rightColumnRef}
            data-element-key='rightColumn'
            data-fist-anim='right'
            className={selectableClass(
              activeKey === 'rightColumn',
              'fist-title-column fist-right hidden @4xl:flex'
            )}
            style={composeStyle(
              TITLE_COLUMN_STYLE,
              { alignItems: 'flex-start' },
              styleOf('rightColumn')
            )}
          >
            <h2
              data-element-key='rightTop'
              style={composeStyle(HEADING_STYLE, styleOf('rightTop'))}
              className={selectableClass(activeKey === 'rightTop', 'fist-h2')}
            >
              {rightTop}
            </h2>
            <h2
              data-element-key='rightBottom'
              style={composeStyle(HEADING_STYLE, styleOf('rightBottom'))}
              className={selectableClass(
                activeKey === 'rightBottom',
                'fist-h2'
              )}
            >
              {rightBottom}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
